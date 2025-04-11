import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import * as db from '../db/connection.js';
import secret from '../util/config.js';

const router = express.Router();

const hashSize = 32,
  // saltSize = 16,
  hashAlgorithm = 'sha512',
  iterations = 1000;

const pbkdf2 = promisify(crypto.pbkdf2);

// Login - authentication
router.post('/login', async (req, res) => {
  const { password } = req.body;
  const { username } = req.body;

  const user = await db.getUserByUserName(username);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  const hashWithSalt = user.password;
  const expectedHash = hashWithSalt.substring(0, hashSize * 2),
    salt = Buffer.from(hashWithSalt.substring(hashSize * 2), 'hex');
  const binaryHash = await pbkdf2(password, salt, iterations, hashSize, hashAlgorithm);
  const actualHash = binaryHash.toString('hex');

  if (expectedHash === actualHash && user.allowed === 1) {
    const token = jwt.sign({
      username,
      userNumID: user.userNumID,
      userID: user.userID,
      userType: user.userType,
      userAllowed: user.allowed,
    }, secret, {
      expiresIn: '1h',
    });

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    return res.status(200).json({ success: true, data: null });
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
  return res.status(200).json({ success: true, data: null });
});

export default router;
