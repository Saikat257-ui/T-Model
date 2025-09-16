import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { uploadFile, deleteFile } from '../utils/supabase';
import { createError } from './errorHandler';
import { logger } from '../utils/logger';

// Multer configuration for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || '').split(',');
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB default
  },
  fileFilter
});

// Middleware to handle file upload to Supabase
export const handleFileUpload = (folderName: string = 'documents') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return next();
      }

      logger.info(`Uploading file: ${req.file.originalname}`);

      const result = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        folderName,
        req.file.mimetype
      );

      if (result.error) {
        logger.error('File upload error:', result.error);
        throw createError(500, 'Failed to upload file');
      }

      // Add file info to request object
      (req as any).uploadedFile = {
        originalName: req.file.originalname,
        fileName: result.data?.path,
        publicUrl: result.publicUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      };

      logger.info(`File uploaded successfully: ${result.publicUrl}`);
      next();
    } catch (error) {
      logger.error('File upload middleware error:', error);
      next(error);
    }
  };
};

// Middleware to handle multiple file uploads
export const handleMultipleFileUpload = (folderName: string = 'documents') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return next();
      }

      logger.info(`Uploading ${req.files.length} files`);

      const uploadPromises = req.files.map(async (file: Express.Multer.File) => {
        const result = await uploadFile(
          file.buffer,
          file.originalname,
          folderName,
          file.mimetype
        );

        if (result.error) {
          throw new Error(`Failed to upload ${file.originalname}: ${result.error.message}`);
        }

        return {
          originalName: file.originalname,
          fileName: result.data?.path,
          publicUrl: result.publicUrl,
          size: file.size,
          mimetype: file.mimetype
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      // Add files info to request object
      (req as any).uploadedFiles = uploadedFiles;

      logger.info(`All files uploaded successfully`);
      next();
    } catch (error) {
      logger.error('Multiple file upload middleware error:', error);
      next(createError(500, 'Failed to upload one or more files'));
    }
  };
};

// Utility function to delete file (can be used in controllers)
export const removeFile = async (filePath: string) => {
  try {
    const result = await deleteFile(filePath);
    if (result.error) {
      logger.error('File deletion error:', result.error);
      return false;
    }
    logger.info(`File deleted successfully: ${filePath}`);
    return true;
  } catch (error) {
    logger.error('File deletion error:', error);
    return false;
  }
};