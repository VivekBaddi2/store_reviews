import { v4 } from "uuid";
import pool from "../config/db.js";

export const getAllStores = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT s.store_id, s.name, s.address, u.email AS owner_email,
                    COALESCE(ROUND(AVG(r.ratings)::numeric, 2), 0) AS average_rating,
                    COUNT(r.review_id)::int AS ratings_count,
                    MAX(r.ratings) FILTER (WHERE r.user_id = $1) AS user_rating
             FROM stores s
             JOIN users u ON u.id = s.user_id
             LEFT JOIN reviews r ON r.store_id = s.store_id
             GROUP BY s.store_id, u.id
             ORDER BY s.name`,
            [req.user.userId]
        );

        return res.status(200).json({
            message: "Stores fetched.",
            data: result.rows,
            rowCount: result.rowCount
        });
    } catch (error) {
        console.error("Store list fetch failed:", error);
        return res.status(500).json({ message: "Unable to fetch stores." });
    }
};

export const submitRating = async (req, res) => {
    const { store_id: storeId, title, description, ratings } = req.body;
    const parsedRating = Number(ratings);
    const reviewTitle = typeof title === "string" && title.trim() ? title.trim() : "Store rating";
    const reviewDescription = typeof description === "string" ? description.trim() : "";

    if (typeof storeId !== "string" || !storeId) {
        return res.status(400).json({ message: "A store is required." });
    }
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({ message: "Rating must be a whole number between 1 and 5." });
    }
    if (reviewTitle.length > 60 || reviewDescription.length > 400) {
        return res.status(400).json({ message: "Review title or description exceeds the allowed length." });
    }

    let client;
    let transactionStarted = false;
    try {
        client = await pool.connect();
        const storeResult = await client.query(
            "SELECT store_id FROM stores WHERE store_id = $1",
            [storeId]
        );
        if (storeResult.rowCount === 0) {
            return res.status(404).json({ message: "Store does not exist." });
        }

        await client.query("BEGIN");
        transactionStarted = true;
        await client.query("SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))", [
            req.user.userId,
            storeId
        ]);
        const existingReview = await client.query(
            "SELECT review_id FROM reviews WHERE user_id = $1 AND store_id = $2",
            [req.user.userId, storeId]
        );

        let result;
        let action;
        if (existingReview.rowCount > 0) {
            result = await client.query(
                `UPDATE reviews
                 SET title = $1, description = $2, ratings = $3
                 WHERE user_id = $4 AND store_id = $5
                 RETURNING review_id, user_id, store_id, title, description, ratings`,
                [reviewTitle, reviewDescription, parsedRating, req.user.userId, storeId]
            );
            action = "updated";
        } else {
            result = await client.query(
                `INSERT INTO reviews (review_id, user_id, store_id, title, description, ratings)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING review_id, user_id, store_id, title, description, ratings`,
                [v4().slice(0, 20), req.user.userId, storeId, reviewTitle, reviewDescription, parsedRating]
            );
            action = "submitted";
        }

        await client.query("COMMIT");
        transactionStarted = false;
        return res.status(200).json({
            message: `Rating ${action} successfully.`,
            data: result.rows[0]
        });
    } catch (error) {
        if (transactionStarted) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error("Rating transaction rollback failed:", rollbackError);
            }
        }
        console.error("Rating submission failed:", error);
        return res.status(500).json({ message: "Unable to submit rating." });
    } finally {
        client?.release();
    }
};
