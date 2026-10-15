import pool from "../config/db.js";
import bcrypt from "bcrypt";
import { v4 } from "uuid";
import { validate } from "../utils/validateData.js";

export const createUser = async (req, res) => {
    const { name, email, address, password, role } = req.body;
    const validationResult = validate(email, password, name, role, address);

    if (validationResult.status !== "OK") {
        return res.status(400).json({ message: validationResult.message });
    }

    try {
        const id = v4().slice(0, 20);
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO users (id, name, email, password, address, role)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, name, email, address, role`,
            [id, name.trim(), email.trim().toLowerCase(), hashedPassword, address.trim(), role]
        );

        return res.status(201).json({
            message: "User created successfully.",
            data: result.rows[0]
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({ message: "An account with this email already exists." });
        }
        console.error("User creation failed:", error);
        return res.status(500).json({ message: "Unable to create user." });
    }
};

export const createStore = async (req, res) => {
    const { name, user_id: userId, address } = req.body;

    if (typeof name !== "string" || !name.trim() || name.trim().length > 120) {
        return res.status(400).json({ message: "Store name is required and must be 120 characters or fewer." });
    }
    if (typeof address !== "string" || !address.trim() || address.trim().length > 400) {
        return res.status(400).json({ message: "Address is required and must be 400 characters or fewer." });
    }
    if (typeof userId !== "string" || !userId) {
        return res.status(400).json({ message: "A store owner is required." });
    }

    try {
        const ownerResult = await pool.query(
            "SELECT id FROM users WHERE id = $1 AND role = $2",
            [userId, "Store Owner"]
        );
        if (ownerResult.rowCount === 0) {
            return res.status(400).json({ message: "Select an existing store owner." });
        }

        const storeId = v4().slice(0, 20);
        const result = await pool.query(
            `INSERT INTO stores (store_id, user_id, name, address)
             VALUES ($1, $2, $3, $4)
             RETURNING store_id, user_id, name, address`,
            [storeId, userId, name.trim(), address.trim()]
        );

        return res.status(201).json({
            message: "Store created successfully.",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Store creation failed:", error);
        return res.status(500).json({ message: "Unable to create store." });
    }
};

export const getAllStores = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT s.store_id, s.user_id, s.name, s.address,
                    u.name AS owner_name, u.email,
                    COALESCE(ROUND(AVG(r.ratings)::numeric, 2), 0) AS average_rating,
                    COUNT(r.review_id)::int AS ratings_count
             FROM stores s
             JOIN users u ON u.id = s.user_id
             LEFT JOIN reviews r ON r.store_id = s.store_id
             GROUP BY s.store_id, u.id
             ORDER BY s.name`
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

export const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.id AS user_id, u.name, u.email, u.address, u.role,
                    CASE WHEN u.role = 'Store Owner' THEN
                        COALESCE((
                            SELECT ROUND(AVG(r.ratings)::numeric, 2)
                            FROM stores s
                            LEFT JOIN reviews r ON r.store_id = s.store_id
                            WHERE s.user_id = u.id
                        ), 0)
                    ELSE NULL END AS average_rating
             FROM users u
             ORDER BY u.name`
        );

        return res.status(200).json({
            message: "Users fetched.",
            data: result.rows,
            rowCount: result.rowCount
        });
    } catch (error) {
        console.error("User list fetch failed:", error);
        return res.status(500).json({ message: "Unable to fetch users." });
    }
};

export const getAllRatings = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT r.review_id, r.user_id, r.store_id, r.title, r.description, r.ratings,
                    u.name AS reviewer_name, u.email AS reviewer_email, s.name AS store_name
             FROM reviews r
             JOIN users u ON u.id = r.user_id
             JOIN stores s ON s.store_id = r.store_id
             ORDER BY s.name, u.name`
        );

        return res.status(200).json({
            message: "Reviews fetched.",
            data: result.rows,
            rowCount: result.rowCount
        });
    } catch (error) {
        console.error("Review list fetch failed:", error);
        return res.status(500).json({ message: "Unable to fetch reviews." });
    }
};
