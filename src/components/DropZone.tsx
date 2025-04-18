import React, { useState, useRef, useCallback } from 'react';
import { Upload, FilePlus, FileVideo, FileAudio, FileImage, FileText, File } from 'lucide-react';

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  category?: 'video' | 'audio' | 'image' | 'subtitle' | 'special';
}

const DropZone: React.FC<DropZoneProps> = ({ onFileSelected, category = 'video' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const getAcceptedTypes = () => {
    switch (category) {
      case 'video':
        return 'video/*';
      case 'audio':
        return 'audio/*';
      case 'image':
        return 'image/*';
      case 'subtitle':
        return '.srt,.vtt,.ass,.sub';
      case 'special':
        return '*/*';
      default:
        return '*/*';
    }
  };

  const getIcon = () => {
    switch (category) {
      case 'video':
        return <FileVideo className="h-8 w-8 text-primary" />;
      case 'audio':
        return <FileAudio className="h-8 w-8 text-primary" />;
      case 'image':
        return <FileImage className="h-8 w-8 text-primary" />;
      case 'subtitle':
        return <FileText className="h-8 w-8 text-primary" />;
      default:
        return <File className="h-8 w-8 text-primary" />;
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        setFileName(file.name);
        onFileSelected(file);
      } else {
        console.error('Please select a video file.');
        // Could add toast notification here
      }
    }
  }, [onFileSelected]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        setFileName(file.name);
        onFileSelected(file);
      } else {
        console.error('Please select a video file.');
        // Could add toast notification here
      }
    }
  }, [onFileSelected]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`file-drop-area ${isDragging ? 'dragging' : 'border-muted-foreground/30'}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileInputChange}
        accept={getAcceptedTypes()}
      />
      
      {fileName ? (
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            {getIcon()}
          </div>
          <p className="text-lg font-medium mt-2">{fileName}</p>
          <p className="text-sm text-muted-foreground">File selected. Click to change.</p>
          <button 
            onClick={handleButtonClick}
            className="mt-2 inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <FilePlus className="mr-2 h-5 w-5" />
            Change File
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            {getIcon()}
          </div>
          <h3 className="text-lg font-medium mt-2">Upload your {category} file</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Drag and drop your {category} file here or click to browse
          </p>
          <button 
            onClick={handleButtonClick}
            className="mt-4 inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Upload className="mr-2 h-5 w-5" />
            Browse Files
          </button>
        </div>
      )}
    </div>
  );
};

export default DropZone;
