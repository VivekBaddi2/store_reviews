import pool from "../config/db.js";
import validator from 'validator';
import bcrypt from 'bcrypt';
import { v4 } from 'uuid';
import { validate } from "../utils/validateData.js";

const verifyRole = (role) => {
    // Check if the role is system administrator or not
    if (!role === 'System Administrator') {
        return res.status(400).json({ 'message': 'You are not authorised to perform this action' })
    }

    return;
}

export const createUser = async (req, res) => {
    try {
        const { name, email, address, password } = req.body;
        const role = req.user.role;

        verifyRole(role);
        const validationResult = validate(email, password, name, role, address);

        if (validationResult.status !== 'OK') {
            res.status(400).json({ 'message': validationResult.message });
        }
        else {
            // If all validations pass successfully then proceed with inserting data
            const id = v4().slice(0, 20); //generate random 20 character unique id
            const hashedPassword = await bcrypt.hash(password, 10);

            const insertQuery = `insert into Users (id,name,email,password,address,role) values
                             ($1, $2, $3, $4, $5, $6) returning *`;
            const values = [id, name, email, hashedPassword, address, role];

            const result = await pool.query(insertQuery, values);

            res.status(200).json({
                message: 'User Created Successfully!',
                data: result.rows[0] // records of the latest inserted user
            });
        }
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ message: 'Email already exists.' });
        }
        res.status(500).json({ 'message': `An internal server error occurred`, 'Error': error });
        console.error(error);
    }

}

export const createStore = async (req, res) => {
    try {
        const { name, user_id, address } = req.body;
        const role = req.user.role;

        verifyRole(role);

        // Check if user exists or not
        const checkUserExists = 'select user_id from users where user_id=($1)';
        const checkUserValues = [user_id];

        const checkUserExistsResult = await pool.query(checkUserExists, checkUserValues);

        if (checkUserExistsResult.rowCount === 0) {
            res.status(400).json({ 'message': 'User does not exist' });
            return
        }

        const store_id = v4().slice(0, 20); //generate random 20 character unique id

        const insertQuery = `insert into Stores (store_id, user_id, name, address) values
                             ($1, $2, $3, $4) returning *`;
        const values = [store_id, user_id, name, address];

        const result = await pool.query(insertQuery, values);

        res.status(200).json({
            message: 'Store Created Successfully!',
            data: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({ 'message': `An internal server error occurred`, 'Error': error });
        console.error(error);
    }

}

export const getAllStores = async (req, res) => {
    try {
        const role = req.user.role;
        verifyRole(role);

        const query = 'select * from Stores';
        const result = await pool.query(query);

        res.status(200).json({ 'message': 'Stores Fetched', 'data': result.rows, 'rowCount': result.rowCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 'message': 'Internal Server Error', 'error': error });
    }
}

export const getAllUsers = async (req, res) => {
    try {
        const role = req.user.role;
        verifyRole(role);

        const query = 'select * from Users';
        const result = await pool.query(query);

        res.status(200).json({ 'message': 'Users Fetched', 'data': result.rows, 'rowCount': result.rowCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 'message': 'Internal Server Error', 'error': error });
    }
}

export const getAllRatings = async (req, res) => {
    try {
        const role = req.user.role;
        verifyRole(role);

        const query = 'select * from reviews';
        const result = await pool.query(query);

        res.status(200).json({ 'message': 'Reviews Fetched', 'data': result.rows, 'rowCount': result.rowCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 'message': 'Internal Server Error', 'error': error });
    }
}
