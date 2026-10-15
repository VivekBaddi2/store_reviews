import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decodedUserInfo = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedUserInfo; // controllers will be able to access user data from req.user

        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};