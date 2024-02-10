import rateLimit from 'express-rate-limit'

export function CORS_POLICY(req, res, next) {
    res.header("Access-Control-Allow-Origin", req.headers.origin)
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
    res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,PUT,OPTIONS')
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header('Access-Control-Expose-Headers', 'Set-Cookie')
    next()
}

export const LIMITER = rateLimit({
    windowMs: 1000,
    max: 20
})
