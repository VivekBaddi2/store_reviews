import { v4 } from "uuid";
import pool from "../config/db.js";

export const getAllStores = async (req, res) => {
    try {
        const query = 'select * from Stores';
        const result = await pool.query(query);

        res.status(200).json({ 'message': 'Stores Fetched', 'data': result.rows, 'rowCount': result.rowCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 'message': 'Internal Server Error', 'error': error });
    }
}

export const submitRating = async (req, res) => {
    try {
        const { user_id, store_id, title, description, ratings } = req.body;
        const reviewId = v4().slice(0, 20);

        // Check if user exists or not
        const checkUserExists = 'select user_id from users where user_id=($1)';
        const checkUserValues = [user_id];

        const checkUserExistsResult = await pool.query(checkUserExists, checkUserValues);

        if (checkUserExistsResult.rowCount === 0) {
            res.status(400).json({ 'message': 'User does not exist' });
            return
        }

        // Check if the user has already reviewed this store 
        const userQuery = 'select user_id from reviews where user_id=($1) and store_id=($2)';
        const userValues = [user_id, store_id];

        const checkUser = await pool.query(userQuery, userValues);

        if (checkUser.rowCount === 0) {
            res.status(400).json({ 'message': 'You have already reviewed this store' });
            return
        }

        if (ratings > 5 || ratings < 1) {
            res.status(400).json({ 'message': 'Ratings must be between 1 and 5' });
            return
        }

        const query = 'insert into reviews (review_id, user_id, store_id, title, description, ratings) values ($1, $2, $3, $4, $5, $6)';
        const values = [reviewId, user_id, store_id, title, description, ratings];

        const result = await pool.query(query, values);
        res.status(200).json({ 'message': 'Review Submitted Successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 'message': 'Internal Server Error', 'error': error });
    }
}