import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware: Verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export default function setupKycRoutes(pool) {
  // Save/Update KYC Details
  router.post('/', verifyToken, async (req, res) => {
    try {
      const {
        pan,
        aadhaar,
        promoterName,
        address,
        documentType
      } = req.body;

      if (!pan || !aadhaar) {
        return res.status(400).json({
          error: 'Missing required fields: pan, aadhaar'
        });
      }

      // Check if KYC already exists for this user
      const existingKyc = await pool.query(
        'SELECT id FROM kyc_details WHERE user_id = $1',
        [req.userId]
      );

      let result;
      if (existingKyc.rows.length > 0) {
        // Update existing KYC
        result = await pool.query(
          `UPDATE kyc_details
           SET pan = $1, aadhaar = $2, promoter_name = $3, address = $4,
               document_type = $5, updated_at = NOW()
           WHERE user_id = $6
           RETURNING id, pan, aadhaar, promoter_name, address, status`,
          [pan, aadhaar, promoterName, address, documentType, req.userId]
        );
      } else {
        // Create new KYC
        result = await pool.query(
          `INSERT INTO kyc_details (user_id, pan, aadhaar, promoter_name, address, document_type, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'pending')
           RETURNING id, pan, aadhaar, promoter_name, address, status`,
          [req.userId, pan, aadhaar, promoterName, address, documentType]
        );
      }

      res.status(201).json({
        success: true,
        kycId: result.rows[0].id,
        message: 'KYC details saved successfully',
        kyc: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Save KYC error:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Get KYC Details
  router.get('/', verifyToken, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, pan, aadhaar, promoter_name, address, document_type, status, verified, uploaded_at
         FROM kyc_details
         WHERE user_id = $1`,
        [req.userId]
      );

      if (result.rows.length === 0) {
        return res.json({
          success: true,
          kyc: null,
          message: 'No KYC details found'
        });
      }

      res.json({
        success: true,
        kyc: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Get KYC error:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Verify KYC (Admin only - for now)
  router.put('/:id/verify', verifyToken, async (req, res) => {
    try {
      const result = await pool.query(
        `UPDATE kyc_details
         SET verified = true, status = 'verified', updated_at = NOW()
         WHERE id = $1 AND user_id = $2
         RETURNING id, status, verified`,
        [req.params.id, req.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'KYC not found' });
      }

      res.json({
        success: true,
        message: 'KYC verified successfully',
        kyc: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Verify KYC error:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
