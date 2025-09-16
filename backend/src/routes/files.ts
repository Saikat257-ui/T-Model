import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { upload, handleFileUpload, handleMultipleFileUpload } from '../middleware/upload';
import { createError } from '../middleware/errorHandler';
import { getSignedUrl } from '../utils/supabase';
import { z } from 'zod';
import prisma from '../utils/database';

const router = express.Router();

// Upload single file
router.post('/upload', 
  authenticateToken,
  upload.single('file'),
  handleFileUpload('documents'),
  async (req: any, res, next) => {
    try {
      if (!req.uploadedFile) {
        throw createError(400, 'No file uploaded');
      }

      // You can save file metadata to database if needed
      const fileRecord = {
        userId: req.user.id,
        originalName: req.uploadedFile.originalName,
        fileName: req.uploadedFile.fileName,
        publicUrl: req.uploadedFile.publicUrl,
        size: req.uploadedFile.size,
        mimetype: req.uploadedFile.mimetype,
        uploadedAt: new Date()
      };

      res.json({
        message: 'File uploaded successfully',
        file: fileRecord
      });
    } catch (error) {
      next(error);
    }
  }
);

// Upload multiple files
router.post('/upload-multiple',
  authenticateToken,
  upload.array('files', 5), // Max 5 files
  handleMultipleFileUpload('documents'),
  async (req: any, res, next) => {
    try {
      if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
        throw createError(400, 'No files uploaded');
      }

      const fileRecords = req.uploadedFiles.map((file: any) => ({
        userId: req.user.id,
        originalName: file.originalName,
        fileName: file.fileName,
        publicUrl: file.publicUrl,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date()
      }));

      res.json({
        message: `${req.uploadedFiles.length} files uploaded successfully`,
        files: fileRecords
      });
    } catch (error) {
      next(error);
    }
  }
);

// Upload profile avatar
router.post('/upload-avatar',
  authenticateToken,
  upload.single('avatar'),
  handleFileUpload('avatars'),
  async (req: any, res, next) => {
    try {
      if (!req.uploadedFile) {
        throw createError(400, 'No avatar file uploaded');
      }

      // Update user profile with avatar URL
      await prisma.userProfile.upsert({
        where: { userId: req.user.id },
        update: { avatar: req.uploadedFile.publicUrl },
        create: {
          userId: req.user.id,
          avatar: req.uploadedFile.publicUrl
        }
      });

      res.json({
        message: 'Avatar uploaded successfully',
        avatarUrl: req.uploadedFile.publicUrl
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get signed URL for private file access
router.get('/signed-url/:fileName', authenticateToken, async (req: any, res, next) => {
  try {
    const { fileName } = req.params;
    const expiresIn = parseInt(req.query.expiresIn as string) || 3600; // 1 hour default

    const { data, error } = await getSignedUrl(fileName, expiresIn);

    if (error) {
      throw createError(500, 'Failed to generate signed URL');
    }

    res.json({
      signedUrl: data.signedUrl,
      expiresIn
    });
  } catch (error) {
    next(error);
  }
});

export default router;