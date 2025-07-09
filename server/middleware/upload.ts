import multer from "multer";
import path from "path";
import { Request } from "express";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // In production, this should be a proper file storage service
    // For now, store in uploads directory
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter to only allow specific file types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/rtf",
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, DOC, DOCX, TXT, and RTF files are allowed."));
  }
};

// Configure multer with limits and file filter
export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10, // Maximum 10 files per request
  },
  fileFilter,
});

// Middleware to handle file upload errors
export const handleUploadError = (err: any, req: Request, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File too large. Maximum size is 50MB.",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        error: "Too many files. Maximum 10 files per upload.",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        error: "Unexpected file field.",
      });
    }
  }
  
  if (err.message.includes("Invalid file type")) {
    return res.status(400).json({
      error: err.message,
    });
  }
  
  console.error("Upload error:", err);
  return res.status(500).json({
    error: "File upload failed.",
  });
};

// Helper function to extract text from different file types
export async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  const fs = await import("fs");
  
  try {
    if (mimeType === "text/plain") {
      return fs.readFileSync(filePath, "utf-8");
    }
    
    if (mimeType === "application/pdf") {
      // For PDF extraction, you would typically use a library like pdf-parse
      // For now, return a placeholder
      return "PDF content extraction not implemented yet";
    }
    
    if (mimeType.includes("word")) {
      // For Word document extraction, you would typically use a library like mammoth
      // For now, return a placeholder
      return "Word document content extraction not implemented yet";
    }
    
    // Fallback for other text-based formats
    return fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    console.error("Error extracting text from file:", error);
    throw new Error("Failed to extract text from file");
  }
}

// Helper function to validate file before processing
export function validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > 50 * 1024 * 1024) {
    return { valid: false, error: "File size exceeds 50MB limit" };
  }
  
  // Check file type
  const allowedTypes = [
    "application/pdf",
    "application/msword", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/rtf",
  ];
  
  if (!allowedTypes.includes(file.mimetype)) {
    return { valid: false, error: "Invalid file type" };
  }
  
  return { valid: true };
}

// Helper function to get file URL (for serving files)
export function getFileUrl(filename: string): string {
  // In production, this should return a proper URL from your file storage service
  return `/uploads/${filename}`;
}
