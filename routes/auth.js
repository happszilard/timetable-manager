import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import * as db from '../db/connection.js';
import secret from '../util/config.js';
import * as vd from '../middleware/validation.js';

const router = express.Router();

const hashSize = 32,
  saltSize = 16,
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

router.post('/register', vd.newUsernameValidation, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      password,
      userType,
      allowed,
    } = req.body;

    const randomDigits = Math.floor(10 + Math.random() * 90); // Random 2 digits
    const timestampPart = Date.now().toString().slice(-2);    // Last 2 digits of the timestamp
    const initials = firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();
    const userID = `${initials}${randomDigits}${timestampPart}`;

    const salt = crypto.randomBytes(saltSize);
    const binaryHash = await pbkdf2(password, salt, iterations, hashSize, hashAlgorithm);
    const hashWithSalt = binaryHash.toString('hex') + salt.toString('hex');
    const result = await db.insertUser({
      userID,
      firstName,
      lastName,
      username,
      password: hashWithSalt,
      userType,
      allowed,
    });

    if (!result || !result.insertId) {
      return res.status(400).json({ success: false, message: 'Error creating user' });
    }

    return res.status(201).json({ success: true, data: null });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error registering user' });
  }
});

export default router;
