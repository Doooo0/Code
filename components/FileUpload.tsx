
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) setIsDragging(true);
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

  const handleFiles = useCallback((files: FileList | null) => {
      if (files && files.length > 0 && !isProcessing) {
          const fileArray = Array.from(files);
          setFileNames(fileArray.map(f => f.name));
          onFileSelect(fileArray);
      }
  }, [onFileSelect, isProcessing]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };
  
  const handleClick = () => {
    if (!isProcessing) {
        fileInputRef.current?.click();
    }
  }

  const dragDropClasses = isDragging
    ? 'border-primary-500 bg-primary-50'
    : 'border-gray-300 bg-white';

  return (
    <div
      className={`p-6 border-2 border-dashed rounded-lg text-center transition-colors duration-200 ${dragDropClasses} ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-400 cursor-pointer'}`}
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
        multiple
      />
      <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
        <UploadIcon className="w-10 h-10"/>
        {fileNames.length > 0 ? (
            <div className="flex flex-col items-center">
              <p className="font-semibold text-primary-700">
                {fileNames.length} file{fileNames.length > 1 ? 's' : ''} selected
              </p>
              <ul className="mt-1 text-xs text-gray-500 list-none max-h-24 overflow-y-auto text-left">
                {fileNames.map((name, index) => <li key={index} className="truncate max-w-xs">{name}</li>)}
              </ul>
              <p className="text-sm mt-2">Click or drag to replace</p>
            </div>
        ) : (
            <>
                <p className="font-semibold">Drag & drop your files here</p>
                <p className="text-sm">or click to browse</p>
            </>
        )}
        <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, WEBP</p>
      </div>
    </div>
  );
};

export default FileUpload;
