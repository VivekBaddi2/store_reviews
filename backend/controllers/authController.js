import pool from "../config/db.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validate } from "../utils/validateData.js";


export const updatePassword = async (req, res) => {
    try {
        const { newPassword, userId } = req.body;

        // Password validation
        if (newPassword.length < 8 || newPassword.length > 16) {
            res.status(400).json({ 'message': 'Password should be between 8 and 16 characters.' });
            return;
        }

        // Check if the given user exists or not
        const userQuery = 'select id from users where id = ($1)';
        const userValues = [userId];

        const checkUser = await pool.query(userQuery, userValues);

        if (checkUser.rowCount === 0) {
            res.status(400).json({ 'message': 'User does not exist' });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10); //hash the new password before updating

        const query = 'update users set password=($1) where id = ($2)';
        const values = [hashedPassword, userId];

        const result = await pool.query(query, values);

        return res.status(200).json({ 'message': 'Password Updated Successfully!', 'data': result });
    } catch (error) {
        console.error('Internal Server Error', error);
        return res.status(500).json({ 'message': 'Internal Server Error', 'error': error });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by his email
        const query = 'select * from users where email = $1';
        const result = await pool.query(query, [email]);

        // If user doesn't exist or if incorrect email
        if (result.rowCount === 0) {
            res.status(400).json({ message: 'Invalid email.' });
            return;
        }

        const user = result.rows[0];

        // hash the entered password and check if it matches with the hashed password in db
        const matchPassword = await bcrypt.compare(password, user.password);

        if (!matchPassword) {
            res.status(400).json({ message: 'Invalid password.' });
            return;
        }

        const tokenPayload = { userId: user.id, role: user.role };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '3d' });

        return res.status(200).json({
            'message': 'Login Successful!',
            'token': token,
            'user': {
                'userId': user.id,
                'name': user.name,
                'email': user.email,
                'address': user.address,
                'role': user.role
            }
        });

    } catch (error) {
        console.error('Internal server error', error);
        return res.status(200).json({ 'message': 'Internal Server Error', 'error': error });
    }
}

// Signup for normal user
export const signup = async (req, res) => {
    const { name, email, address, password } = req.body;

    const role = 'Normal User';
    const validationResult = validate(email, password, name, role, address);

    if (validationResult.status !== 'OK') {
        res.status(400).json({ 'message': validationResult.message });
        return
    } else {
        // If all validations pass successfully then proceed with inserting data
        const id = v4().slice(0, 20); //generate random 20 character unique id
        const hashedPassword = await bcrypt.hash(password, 10);

        const insertQuery = `insert into Users (id,name,email,password,address,role) values
                             ($1, $2, $3, $4, $5, $6) returning *`;
        const values = [id, name, email, hashedPassword, address, role];

        const result = await pool.query(insertQuery, values);

        return res.status(200).json({
            message: 'User Created Successfully!',
            data: result.rows[0] // records of the latest inserted user
        });
    }
}