import { useState, useRef } from "react";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Progress } from "./progress";
import { Badge } from "./badge";
import { 
  CloudUpload, 
  FileText, 
  File, 
  X,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface FileUploadProps {
  onUpload: (files: FileList) => void;
  onRemove?: (index: number) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

interface UploadFile {
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
}

export default function FileUpload({
  onUpload,
  onRemove,
  accept = ".pdf,.doc,.docx,.txt,.rtf",
  multiple = true,
  maxSize = 50 * 1024 * 1024, // 50MB
  maxFiles = 10,
  disabled = false,
  className = "",
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File) => {
    const validTypes = accept.split(",").map(type => type.trim());
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      return `Invalid file type. Accepted types: ${accept}`;
    }
    
    if (file.size > maxSize) {
      return `File too large. Maximum size: ${formatFileSize(maxSize)}`;
    }
    
    return null;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileSelection = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    
    // Check file limits
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      return;
    }
    
    // Validate files
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        invalidFiles.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });
    
    if (invalidFiles.length > 0) {
      // Handle validation errors
      console.error("File validation errors:", invalidFiles);
      return;
    }
    
    // Add files to upload list
    const newUploadFiles: UploadFile[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: "uploading" as const,
    }));
    
    setUploadedFiles(prev => [...prev, ...newUploadFiles]);
    
    // Create FileList for upload
    const dataTransfer = new DataTransfer();
    validFiles.forEach(file => dataTransfer.items.add(file));
    
    onUpload(dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!disabled) {
      handleFileSelection(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    if (onRemove) {
      onRemove(index);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    
    switch (extension) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-600" />;
      case "doc":
      case "docx":
        return <FileText className="h-8 w-8 text-blue-600" />;
      case "txt":
        return <FileText className="h-8 w-8 text-gray-600" />;
      default:
        return <File className="h-8 w-8 text-gray-600" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragging
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-blue-400"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className="p-8 text-center">
          <CloudUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Upload Documents
          </p>
          <p className="text-sm text-gray-500 mb-2">
            Drag & drop files here or click to browse
          </p>
          <p className="text-xs text-gray-400">
            {accept.toUpperCase()} up to {formatFileSize(maxSize)}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={accept}
            onChange={(e) => handleFileSelection(e.target.files)}
            className="hidden"
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Uploaded Files ({uploadedFiles.length})
          </h4>
          {uploadedFiles.map((uploadFile, index) => (
            <Card key={index} className="border">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getFileIcon(uploadFile.file.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(uploadFile.file.size)}
                    </p>
                    {uploadFile.status === "uploading" && (
                      <div className="mt-2">
                        <Progress value={uploadFile.progress} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          {uploadFile.progress}% uploaded
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {uploadFile.status === "success" && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {uploadFile.status === "error" && (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {uploadFile.error && (
                  <div className="mt-2 text-xs text-red-600">
                    {uploadFile.error}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
