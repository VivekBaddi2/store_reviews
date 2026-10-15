import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 } from "uuid";
import { validate, validatePassword } from "../utils/validateData.js";

export const updatePassword = async (req, res) => {
    const { newPassword } = req.body;

    if (!validatePassword(newPassword)) {
        return res.status(400).json({
            message: "Password must be 8-16 characters and include an uppercase letter and a special character."
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result = await pool.query(
            "UPDATE users SET password = $1 WHERE id = $2",
            [hashedPassword, req.user.userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "User does not exist." });
        }

        return res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        console.error("Password update failed:", error);
        return res.status(500).json({ message: "Unable to update password." });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email.trim().toLowerCase()]
        );

        if (result.rowCount === 0 || !(await bcrypt.compare(password, result.rows[0].password))) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const user = result.rows[0];
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        );

        return res.status(200).json({
            message: "Login successful.",
            token,
            user: {
                userId: user.id,
                name: user.name,
                email: user.email,
                address: user.address,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login failed:", error);
        return res.status(500).json({ message: "Unable to log in." });
    }
};

export const signup = async (req, res) => {
    const { name, email, address, password } = req.body;
    const validationResult = validate(email, password, name, "Normal User", address);

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
            [id, name.trim(), email.trim().toLowerCase(), hashedPassword, address.trim(), "Normal User"]
        );

        return res.status(201).json({
            message: "User created successfully.",
            data: result.rows[0]
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({ message: "An account with this email already exists." });
        }
        console.error("Signup failed:", error);
        return res.status(500).json({ message: "Unable to create account." });
    }
};
