import express from 'express';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { extractDocumentData } from '../utils/documentExtractor.js';

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
  const BUCKET_NAME = 'finpro-docs';

  // Upload document (generic for all doc types)
  router.post('/', verifyToken, async (req, res) => {
    try {
      const { fileName, fileData, documentType, category } = req.body;

      if (!fileName || !fileData || !documentType) {
        return res.status(400).json({
          error: 'Missing required fields: fileName, fileData, documentType'
        });
      }

      // Convert base64 to buffer
      const buffer = Buffer.from(fileData, 'base64');
      // Path: user-{userId}/{category}/{documentType}/{fileName}
      const filePath = `user-${req.userId}/${category || 'documents'}/${documentType}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, buffer, {
          contentType: 'application/octet-stream',
          upsert: false
        });

      if (error) {
        console.error('❌ Upload error:', error.message);
        return res.status(400).json({ error: error.message });
      }

      console.log('✅ File uploaded:', filePath);

      // Extract data from document (if it's KYC document)
      let extractedData = null;
      if (category === 'kyc' && (documentType === 'PAN' || documentType === 'Aadhaar')) {
        try {
          extractedData = await extractDocumentData(buffer, documentType);
          console.log('✅ Extracted data:', extractedData);
        } catch (extractError) {
          console.warn('⚠️ Extraction failed (but file uploaded):', extractError.message);
          // Don't fail if extraction fails - file is already uploaded
        }
      }

      // Get public URL
      const { data: publicData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      res.json({
        success: true,
        fileName: fileName,
        filePath: filePath,
        fileUrl: publicData.publicUrl,
        extractedData: extractedData,
        message: 'Document uploaded and processed successfully'
      });
    } catch (error) {
      console.error('❌ Upload error:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // List user's uploaded documents
  router.get('/', verifyToken, async (req, res) => {
    try {
      const category = req.query.category || 'documents';
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(`user-${req.userId}/${category}`, {
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
  router.delete('/:filePath', verifyToken, async (req, res) => {
    try {
      const filePath = `user-${req.userId}/${req.params.filePath}`;

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
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
