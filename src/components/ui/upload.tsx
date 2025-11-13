import React, { useCallback, useState } from 'react';
import { CloudUpload, File, X, Check, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';

interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  onFilesChange?: (files: File[]) => void;
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
}

interface FileWithPreview extends File {
  id: string;
  preview?: string;
  error?: string;
}

export function FileUpload({
  accept = '*/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 1,
  onFilesChange,
  className,
  disabled = false,
  multiple = true,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxSize) {
      return `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`;
    }
    return null;
  }, [maxSize]);

  const handleFiles = useCallback((newFiles: FileList) => {
    const validFiles: FileWithPreview[] = [];
    const remainingSlots = maxFiles - files.length;

    if (remainingSlots <= 0) return;

    Array.from(newFiles).slice(0, remainingSlots).forEach(file => {
      const error = validateFile(file);
      const fileWithPreview: FileWithPreview = {
        ...file,
        id: Math.random().toString(36).substr(2, 9),
      };

      if (error) {
        fileWithPreview.error = error;
      }

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          fileWithPreview.preview = reader.result as string;
          setFiles(prev => [...prev]);
        };
        reader.readAsDataURL(file);
      }

      validFiles.push(fileWithPreview);
    });

    const updatedFiles = [...files, ...validFiles];
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles.filter(f => !f.error));
  }, [files, maxFiles, validateFile, onFilesChange]);

  const removeFile = useCallback((id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles.filter(f => !f.error));
  }, [files, onFilesChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, handleFiles]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: FileWithPreview) => {
    if (file.type.startsWith('image/')) {
      return <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
        {file.preview && (
          <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
        )}
      </div>;
    }
    return <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
      <File className="w-5 h-5 text-blue-600" />
    </div>;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200",
          isDragging
            ? "border-indigo-500 bg-indigo-50/50 scale-[1.02]"
            : "border-gray-300 bg-white/80 backdrop-blur-sm hover:border-gray-400 hover:bg-gray-50/80",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
            <CloudUpload className="w-8 h-8 text-indigo-600" />
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-800 mb-1">
              {isDragging ? 'Drop files here' : 'Drop files here or click to browse'}
            </p>
            <p className="text-sm text-gray-600">
              Maximum {Math.round(maxSize / 1024 / 1024)}MB per file
              {maxFiles > 1 && ` • Up to ${maxFiles} files`}
            </p>
          </div>

          <Button variant="outline" size="sm" disabled={disabled}>
            Choose Files
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-800">Uploaded Files</h3>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border bg-white/90 backdrop-blur-sm transition-all duration-200",
                  file.error ? "border-red-200 bg-red-50/50" : "border-gray-200 hover:shadow-lg"
                )}
              >
                {getFileIcon(file)}

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{file.name}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">{formatFileSize(file.size)}</span>
                    {file.error && (
                      <span className="text-red-600 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {file.error}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {uploadProgress[file.id] !== undefined && uploadProgress[file.id] < 100 && (
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                        style={{ width: `${uploadProgress[file.id]}%` }}
                      />
                    </div>
                  )}
                  {!file.error && uploadProgress[file.id] === 100 && (
                    <Check className="w-5 h-5 text-green-600" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                    className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}