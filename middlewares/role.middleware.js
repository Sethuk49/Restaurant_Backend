const jwt = require('jsonwebtoken');

const RoleMiddleware = (requiredRole) => {
    return function (req, res, next) {
        const user = req.user; // Assuming user is already set in request (from JWT or session)

        if (!!!user) {
            return res.status(401).json({
                status: 401,
                message: 'Unauthorized'
            });
        }

        if (!!!requiredRole?.includes(req?.user?.role)) {
            return res.status(403).json({
                status: 403,
                message: 'Forbidden: Access denied'
            });
        }

        next();
    };
}

module.exports = RoleMiddleware;