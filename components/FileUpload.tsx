
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && !isProcessing) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      onFileSelect(file);
    }
  }, [onFileSelect, isProcessing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && !isProcessing) {
      const file = e.target.files[0];
      setFileName(file.name);
      onFileSelect(file);
    }
  };
  
  const handleClick = () => {
    fileInputRef.current?.click();
  }

  const dragDropClasses = isDragging
    ? 'border-primary-500 bg-primary-50'
    : 'border-gray-300 bg-white';

  return (
    <div
      className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-200 ${dragDropClasses} ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-400'}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        disabled={isProcessing}
      />
      <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
        <UploadIcon className="w-10 h-10"/>
        {fileName ? (
            <>
              <p className="font-semibold text-primary-700">{fileName}</p>
              <p className="text-sm">Click or drag to replace</p>
            </>
        ) : (
            <>
                <p className="font-semibold">Drag & drop your file here</p>
                <p className="text-sm">or click to browse</p>
            </>
        )}
        <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, WEBP</p>
      </div>
    </div>
  );
};

export default FileUpload;
