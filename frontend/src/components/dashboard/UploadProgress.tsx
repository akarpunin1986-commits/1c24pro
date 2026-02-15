/**
 * UploadProgress — progress bar for chunked file upload.
 * Shows percentage, bytes transferred, and estimated time remaining.
 * @see TZ section 2.5 — Upload progress display
 */

import { formatFileSize } from "@/utils/formatters";

interface UploadProgressProps {
  /** Filename being uploaded */
  filename: string;
  /** Number of chunks received so far */
  chunksReceived: number;
  /** Total number of chunks expected */
  chunksExpected: number;
  /** Total file size in bytes */
  totalBytes: number;
  /** Chunk size in bytes */
  chunkSize: number;
}

/** Upload progress bar with stats */
export const UploadProgress: React.FC<UploadProgressProps> = ({
  filename,
  chunksReceived,
  chunksExpected,
  totalBytes,
  chunkSize,
}) => {
  const progress = chunksExpected > 0 ? (chunksReceived / chunksExpected) * 100 : 0;
  const bytesUploaded = Math.min(chunksReceived * chunkSize, totalBytes);

  return (
    <div className="rounded-card border border-border bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-dark">{filename}</span>
        <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-bg-gray">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${Math.min(progress, 100).toString()}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-text-muted">
        <span>
          {formatFileSize(bytesUploaded)} / {formatFileSize(totalBytes)}
        </span>
        <span>
          {chunksReceived} / {chunksExpected} chunks
        </span>
      </div>
    </div>
  );
};
