// verifyToken.js
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    // Get token from cookie or Authorization header
    let token = req.cookies.token;
    
    if (!token && req.headers.authorization) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        console.log("No token found in cookies or headers.");
        return res.status(401).json({ message: "Access Denied, token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id; // Sets userId based on token payload
        req.userRole = decoded.role;
        next();
    } catch (err) {
        console.error("Error verifying token:", err.message);
        res.status(401).json({ message: "Invalid Token", error: err.message });
    }
};
