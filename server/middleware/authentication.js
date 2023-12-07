import jwt from 'jsonwebtoken';

const { JWT_SECRET } = process.env;

export const validateJwtMiddleware = async (req, res, next) => {
  try {
    const token = req.headers['authorization'];
    if (typeof token == 'undefined') {
      return res
        .status(403)
        .json({ error: 'MISSING_JWT_TOKEN', message: 'no token has been provided' });
    }
    req.jwtPayload = await verifyToken(token);
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ name: error.name, message: error.message });
    }
    next(error);
  }
};

async function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
}
