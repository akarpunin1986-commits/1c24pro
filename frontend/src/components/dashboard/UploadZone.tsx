/**
 * UploadZone — drag-and-drop file upload area for .dt and .bak files.
 * Handles file selection, validation, and initiates chunked upload.
 * @see TZ section 2.5 — Chunked upload technical scheme
 */

import { useState, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { ALLOWED_EXTENSIONS, MAX_UPLOAD_SIZE_BYTES } from "@/constants/plans";
import { validateFileExtension, validateFileSize } from "@/utils/validators";
import { formatFileSize } from "@/utils/formatters";

interface UploadZoneProps {
  /** Callback when a valid file is selected */
  onFileSelect: (file: File) => void;
  /** Whether upload is currently in progress */
  uploading?: boolean;
}

/** Drag-and-drop file upload zone */
export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, uploading = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError("");

    if (!validateFileExtension(file.name)) {
      setError(`Допустимые форматы: ${ALLOWED_EXTENSIONS.join(", ")}`);
      return false;
    }

    if (!validateFileSize(file.size, MAX_UPLOAD_SIZE_BYTES)) {
      setError(`Максимальный размер: ${formatFileSize(MAX_UPLOAD_SIZE_BYTES)}`);
      return false;
    }

    return true;
  };

  const handleFile = (file: File): void => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClick = (): void => {
    fileInputRef.current?.click();
  };

  return (
    <Card padding="none">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => {
          setIsDragOver(false);
        }}
        onDrop={handleDrop}
        onClick={uploading ? undefined : handleClick}
        className={`
          flex cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed p-10
          transition-colors
          ${isDragOver ? "border-primary bg-orange-50" : "border-border hover:border-text-light"}
          ${uploading ? "cursor-not-allowed opacity-50" : ""}
        `}
      >
        <span className="text-3xl">📁</span>
        <p className="mt-3 text-sm font-medium text-dark">
          Перетащите файл .dt или .bak сюда
        </p>
        <p className="mt-1 text-xs text-text-muted">
          или <span className="text-primary">выберите файл</span>
        </p>
        <p className="mt-2 text-xs text-text-light">
          Максимум: {formatFileSize(MAX_UPLOAD_SIZE_BYTES)}
        </p>
      </div>

      {error ? <p className="px-4 pb-4 text-xs text-red-500">{error}</p> : null}

      <input
        ref={fileInputRef}
        type="file"
        accept=".dt,.bak"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="hidden"
      />
    </Card>
  );
};
