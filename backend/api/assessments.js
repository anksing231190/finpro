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

export default function setupAssessmentRoutes(pool) {
  // Create new assessment
  router.post('/', verifyToken, async (req, res) => {
    try {
      const {
        customerType,
        financialMetrics,
        loanRequirement,
        assessmentResults,
        yearsData
      } = req.body;

      if (!customerType || !financialMetrics) {
        return res.status(400).json({
          error: 'Missing required fields: customerType, financialMetrics'
        });
      }

      const result = await pool.query(
        `INSERT INTO assessments
         (user_id, customer_type, financial_metrics, loan_requirement, assessment_results, years_data, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'complete')
         RETURNING id, created_at`,
        [
          req.userId,
          customerType,
          JSON.stringify(financialMetrics),
          JSON.stringify(loanRequirement),
          JSON.stringify(assessmentResults),
          JSON.stringify(yearsData || {})
        ]
      );

      res.status(201).json({
        success: true,
        assessmentId: result.rows[0].id,
        createdAt: result.rows[0].created_at,
        message: 'Assessment saved successfully'
      });
    } catch (error) {
      console.error('❌ Create assessment error:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all assessments for user
  router.get('/', verifyToken, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, customer_type, status, created_at, updated_at
         FROM assessments
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [req.userId]
      );

      res.json({
        success: true,
        count: result.rows.length,
        assessments: result.rows
      });
    } catch (error) {
      console.error('❌ Get assessments error:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Get single assessment
  router.get('/:id', verifyToken, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT *
         FROM assessments
         WHERE id = $1 AND user_id = $2`,
        [req.params.id, req.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      const assessment = result.rows[0];

      // Parse JSON fields
      res.json({
        success: true,
        assessment: {
          id: assessment.id,
          customerType: assessment.customer_type,
          status: assessment.status,
          financialMetrics: JSON.parse(assessment.financial_metrics),
          loanRequirement: JSON.parse(assessment.loan_requirement),
          assessmentResults: JSON.parse(assessment.assessment_results),
          yearsData: JSON.parse(assessment.years_data || '{}'),
          createdAt: assessment.created_at,
          updatedAt: assessment.updated_at
        }
      });
    } catch (error) {
      console.error('❌ Get assessment error:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Update assessment
  router.put('/:id', verifyToken, async (req, res) => {
    try {
      const {
        financialMetrics,
        loanRequirement,
        assessmentResults,
        yearsData
      } = req.body;

      // Verify ownership
      const existingAssessment = await pool.query(
        'SELECT id FROM assessments WHERE id = $1 AND user_id = $2',
        [req.params.id, req.userId]
      );

      if (existingAssessment.rows.length === 0) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      const result = await pool.query(
        `UPDATE assessments
         SET financial_metrics = $1,
             loan_requirement = $2,
             assessment_results = $3,
             years_data = $4,
             updated_at = NOW()
         WHERE id = $5 AND user_id = $6
         RETURNING id, updated_at`,
        [
          JSON.stringify(financialMetrics),
          JSON.stringify(loanRequirement),
          JSON.stringify(assessmentResults),
          JSON.stringify(yearsData || {}),
          req.params.id,
          req.userId
        ]
      );

      res.json({
        success: true,
        assessmentId: result.rows[0].id,
        updatedAt: result.rows[0].updated_at,
        message: 'Assessment updated successfully'
      });
    } catch (error) {
      console.error('❌ Update assessment error:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete assessment
  router.delete('/:id', verifyToken, async (req, res) => {
    try {
      const result = await pool.query(
        'DELETE FROM assessments WHERE id = $1 AND user_id = $2 RETURNING id',
        [req.params.id, req.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      res.json({
        success: true,
        message: 'Assessment deleted successfully'
      });
    } catch (error) {
      console.error('❌ Delete assessment error:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
