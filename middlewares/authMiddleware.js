const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // The token should be in the format 'Bearer <token>'
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).json({ msg: 'Token is not valid' });
    }

    const token = tokenParts[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id }; // Attach user info as an object
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
