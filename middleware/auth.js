import jwt from 'jsonwebtoken';
import secret from '../util/config.js';

export function checkJWT(req, res, next) {
  if (res.locals.payload.username) {
    next();
  } else {
    res.render('login', { error: '' });
  }
}

export function decodeJWT(req, res, next) {
  res.locals.payload = {};
  if (req.cookies.token) {
    try {
      res.locals.payload = jwt.verify(req.cookies.token, secret);
    } catch (err) {
      res.clearCookie('token');
    }
  }
  next();
}

export function checkAdmin(req, res, next) {
  if (res.locals.payload.username && res.locals.payload.userType === 0) {
    next();
  } else if (res.locals.payload.username) {
    res.redirect('/');
  } else {
    res.render('login', { error: '' });
  }
}
