/**
 * UploadQueue — admin view of pending uploads awaiting deployment.
 * Shows uploaded files with org info, file size, and action buttons.
 * @see TZ section 2.6 — Admin panel upload queue
 */

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { UPLOAD_STATUS_CONFIG } from "@/constants/design";
import { formatFileSize, formatDateTime } from "@/utils/formatters";
import type { AdminUploadRecord } from "@/types/api";

interface UploadQueueProps {
  /** List of upload records */
  uploads: AdminUploadRecord[];
  /** Callback when admin clicks on an upload to manage it */
  onSelect: (upload: AdminUploadRecord) => void;
}

/** Admin upload queue list */
export const UploadQueue: React.FC<UploadQueueProps> = ({ uploads, onSelect }) => {
  if (uploads.length === 0) {
    return (
      <Card padding="md">
        <p className="text-center text-sm text-text-muted">Нет загрузок в очереди</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-dark">
        Очередь загрузок ({uploads.length})
      </h3>

      {uploads.map((upload) => {
        const statusConfig = UPLOAD_STATUS_CONFIG[upload.status];

        return (
          <Card key={upload.id} padding="md" className="cursor-pointer transition-shadow hover:shadow-md">
            <button
              type="button"
              onClick={() => {
                onSelect(upload);
              }}
              className="w-full text-left"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-dark">{upload.organization.name_short}</p>
                  <p className="text-sm text-text-muted">
                    {upload.filename} ({formatFileSize(upload.size_bytes)})
                  </p>
                  <p className="text-xs text-text-light">
                    db_name: {upload.db_name} | Путь: {upload.storage_path}
                  </p>
                  <p className="text-xs text-text-light">
                    Загружен: {formatDateTime(upload.created_at)}
                  </p>
                </div>
                <Badge variant={statusConfig.color as "green" | "yellow" | "gray" | "blue" | "red"}>
                  {statusConfig.label}
                </Badge>
              </div>
            </button>
          </Card>
        );
      })}
    </div>
  );
};
