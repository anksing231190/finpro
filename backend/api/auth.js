import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import twilio from 'twilio';

const router = express.Router();

export default function setupAuthRoutes(pool) {
  const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  // Signup
  router.post('/signup', async (req, res) => {
    try {
      const { email, password, fullName, customerType, phone } = req.body;

      // Validate input
      if (!email || !password || !fullName || !customerType) {
        return res.status(400).json({
          error: 'Missing required fields: email, password, fullName, customerType'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Check if user exists
      const userExists = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (userExists.rows.length > 0) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const result = await pool.query(
        `INSERT INTO users (email, password, full_name, customer_type, phone_number, verified)
         VALUES ($1, $2, $3, $4, $5, false)
         RETURNING id, email, full_name`,
        [email.toLowerCase(), hashedPassword, fullName, customerType, phone]
      );

      const userId = result.rows[0].id;

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Store OTP
      await pool.query(
        'UPDATE users SET otp_secret = $1, otp_expires_at = $2 WHERE id = $3',
        [otp, otpExpiry, userId]
      );

      // Send OTP via Twilio SMS
      if (phone) {
        try {
          await twilioClient.messages.create({
            body: `Your FinPro OTP is: ${otp}. Valid for 5 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone
          });
        } catch (smsError) {
          console.warn('SMS send failed, but OTP stored:', smsError.message);
        }
      }

      res.status(201).json({
        userId,
        message: 'Signup successful. OTP sent to your phone.',
        email: result.rows[0].email,
        fullName: result.rows[0].full_name
      });
    } catch (error) {
      console.error('❌ Signup error:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Send OTP (for login)
  router.post('/sendOtp', async (req, res) => {
    try {
      const { email, phone } = req.body;

      if (!email && !phone) {
        return res.status(400).json({ error: 'Email or phone required' });
      }

      // Find user
      const userQuery = await pool.query(
        'SELECT id, email, phone_number FROM users WHERE email = $1 OR phone_number = $2',
        [email ? email.toLowerCase() : null, phone]
      );

      if (userQuery.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userQuery.rows[0];

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Store OTP
      await pool.query(
        'UPDATE users SET otp_secret = $1, otp_expires_at = $2 WHERE id = $3',
        [otp, otpExpiry, user.id]
      );

      // Send OTP via Twilio
      if (user.phone_number) {
        try {
          await twilioClient.messages.create({
            body: `Your FinPro login OTP is: ${otp}. Valid for 5 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: user.phone_number
          });
        } catch (smsError) {
          console.warn('SMS send failed:', smsError.message);
        }
      }

      res.json({
        userId: user.id,
        email: user.email,
        message: 'OTP sent to your phone'
      });
    } catch (error) {
      console.error('❌ SendOTP error:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Verify OTP
  router.post('/verifyOtp', async (req, res) => {
    try {
      const { userId, otp } = req.body;

      if (!userId || !otp) {
        return res.status(400).json({ error: 'userId and otp required' });
      }

      // Get user and verify OTP
      const userQuery = await pool.query(
        `SELECT id, email, full_name, customer_type, otp_secret, otp_expires_at
         FROM users WHERE id = $1`,
        [userId]
      );

      if (userQuery.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userQuery.rows[0];

      // Check OTP
      if (user.otp_secret !== otp) {
        return res.status(401).json({ error: 'Invalid OTP' });
      }

      // Check expiry
      if (new Date() > new Date(user.otp_expires_at)) {
        return res.status(401).json({ error: 'OTP expired' });
      }

      // Mark user as verified
      await pool.query(
        'UPDATE users SET verified = true, otp_secret = NULL, otp_expires_at = NULL WHERE id = $1',
        [userId]
      );

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Store session
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await pool.query(
        'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [userId, token, expiresAt]
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          customerType: user.customer_type
        },
        message: 'Login successful'
      });
    } catch (error) {
      console.error('❌ VerifyOTP error:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Get profile
  router.get('/profile', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const userQuery = await pool.query(
        `SELECT id, email, full_name, customer_type, created_at
         FROM users WHERE id = $1`,
        [decoded.userId]
      );

      if (userQuery.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userQuery.rows[0];
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          customerType: user.customer_type,
          createdAt: user.created_at
        }
      });
    } catch (error) {
      console.error('❌ Profile error:', error.message);
      res.status(401).json({ error: 'Unauthorized' });
    }
  });

  // Logout
  router.post('/logout', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
      }
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
