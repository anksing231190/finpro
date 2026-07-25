import express from 'express';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

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

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default function setupUploadRoutes() {
  // Upload KYC document
  router.post('/kyc', verifyToken, async (req, res) => {
    try {
      const { fileName, fileData, documentType } = req.body;

      if (!fileName || !fileData) {
        return res.status(400).json({
          error: 'Missing required fields: fileName, fileData'
        });
      }

      // Convert base64 to buffer
      const buffer = Buffer.from(fileData, 'base64');
      const filePath = `user-${req.userId}/${documentType}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('kyc-documents')
        .upload(filePath, buffer, {
          contentType: 'application/octet-stream',
          upsert: false
        });

      if (error) {
        console.error('❌ Upload error:', error.message);
        return res.status(400).json({ error: error.message });
      }

      console.log('✅ File uploaded:', filePath);

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(filePath);

      res.json({
        success: true,
        fileName: fileName,
        filePath: filePath,
        fileUrl: publicData.publicUrl,
        message: 'Document uploaded successfully'
      });
    } catch (error) {
      console.error('❌ Upload error:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // List user's uploaded documents
  router.get('/kyc', verifyToken, async (req, res) => {
    try {
      const { data, error } = await supabase.storage
        .from('kyc-documents')
        .list(`user-${req.userId}/`, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({
        success: true,
        documents: data || [],
        count: data?.length || 0
      });
    } catch (error) {
      console.error('❌ List error:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete document
  router.delete('/kyc/:fileName', verifyToken, async (req, res) => {
    try {
      const filePath = `user-${req.userId}/${req.params.fileName}`;

      const { error } = await supabase.storage
        .from('kyc-documents')
        .remove([filePath]);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error) {
      console.error('❌ Delete error:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
