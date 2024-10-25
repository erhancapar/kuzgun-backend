const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ msg: 'no_token_provided' });
    }

    const token = authHeader.split(' ')[1]; // Assumes 'Bearer <token>'

    if (!token) {
        return res.status(401).json({ msg: 'token_malformed' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id };
        next();
    } catch (error) {
        return res.status(401).json({ msg: 'token_invalid' });
    }
};

module.exports = authMiddleware;
