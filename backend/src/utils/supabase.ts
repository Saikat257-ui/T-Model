import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  logger.warn('Supabase configuration missing. File upload and storage features will be disabled.');
  logger.info('To enable Supabase features, please configure SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file');
}

// Create Supabase client with service key for server-side operations (only if configured)
export const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  : null;

// Create Supabase client with anon key for client-side operations (if needed)
export const supabaseAnon = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  })
  : null;

// Storage configuration
export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 't-model-platform-files';

// Initialize storage bucket if it doesn't exist
export const initializeStorage = async () => {
  try {
    if (!supabase) {
      logger.warn('Supabase client not configured. Skipping storage initialization.');
      return false;
    }

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      logger.error('Error listing buckets:', listError);
      return false;
    }

    const bucketExists = buckets.some(bucket => bucket.name === STORAGE_BUCKET);

    if (!bucketExists) {
      // Create the bucket
      const { data, error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
        public: true,
        allowedMimeTypes: (process.env.ALLOWED_FILE_TYPES || '').split(','),
        fileSizeLimit: parseInt(process.env.MAX_FILE_SIZE || '5242880')
      });

      if (error) {
        logger.error('Error creating storage bucket:', error);
        return false;
      }

      logger.info(`Storage bucket '${STORAGE_BUCKET}' created successfully`);
    } else {
      logger.info(`Storage bucket '${STORAGE_BUCKET}' already exists`);
    }

    return true;
  } catch (error) {
    logger.error('Error initializing storage:', error);
    return false;
  }
};

// Upload file to Supabase Storage
export const uploadFile = async (
  file: Buffer | Uint8Array | File,
  fileName: string,
  folder: string = 'documents',
  contentType?: string
): Promise<{ data: any; error: any; publicUrl?: string }> => {
  try {
    if (!supabase) {
      return { data: null, error: 'Supabase not configured' };
    }

    const filePath = `${folder}/${Date.now()}-${fileName}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        contentType,
        duplex: 'half'
      });

    if (error) {
      return { data: null, error };
    }

    // Get public URL (supabase is already checked above)
    const { data: publicUrlData } = supabase!.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return {
      data,
      error: null,
      publicUrl: publicUrlData.publicUrl
    };
  } catch (err) {
    logger.error('Error uploading file:', err);
    return { data: null, error: err };
  }
};

// Delete file from Supabase Storage
export const deleteFile = async (filePath: string): Promise<{ error: any }> => {
  try {
    if (!supabase) {
      return { error: 'Supabase not configured' };
    }

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    return { error };
  } catch (err) {
    logger.error('Error deleting file:', err);
    return { error: err };
  }
};

// Get signed URL for private files
export const getSignedUrl = async (
  filePath: string,
  expiresIn: number = 3600
): Promise<{ data: any; error: any }> => {
  try {
    if (!supabase) {
      return { data: null, error: 'Supabase not configured' };
    }

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, expiresIn);

    return { data, error };
  } catch (err) {
    logger.error('Error creating signed URL:', err);
    return { data: null, error: err };
  }
};

export default supabase;