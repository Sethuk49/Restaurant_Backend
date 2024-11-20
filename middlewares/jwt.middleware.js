const jwt = require('jsonwebtoken');

const JwtMiddleware = (req, res, next) => {
    //checking token present in headers
    if (!!!req?.headers?.authorization) res.status(422).json({
        status: 422,
        message: 'A token is required for authentication',
    });

    const key = req?.headers?.authorization?.split(' ');
    const token = key?.[1];

    if (!!!key) res.status(422).json({
        status: 422,
        message: 'A token is required for authentication',
    });

    //checking token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!!!decoded) res.status(401).json({
        status: 401,
        message: 'Invalid Token !',
    });

    req.user = decoded;

    next();
}

module.exports = JwtMiddleware;