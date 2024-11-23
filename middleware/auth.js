const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token, authorization denied' });
        }

        // Verify token
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token, authorization denied' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (err) {
            res.status(401).json({ error: 'Token is not valid' });
        }
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = auth;