import jwt from 'jsonwebtoken';
import secret from '../util/config.js';

export function decodeJWT(req, res, next) {
  if (req.cookies.token) {
    try {
      const decoded = jwt.verify(req.cookies.token, secret);
      req.user = decoded;
    } catch (err) {
      res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  return next();
}

export function onlyAdmins(req, res, next) {
  if (req.user && req.user.userType === 0) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied' });
}
