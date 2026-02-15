/**
 * DatabaseCard — displays a single 1C database with status, links, and info.
 * Shows active/preparing/readonly states with appropriate indicators.
 * @see TZ section 2.3 — Dashboard database card
 */

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DATABASE_STATUS_CONFIG } from "@/constants/design";
import { formatFileSize, formatDate } from "@/utils/formatters";
import type { DatabaseRecord } from "@/types/api";

interface DatabaseCardProps {
  /** Database record to display */
  database: DatabaseRecord;
}

/** Database info card for the dashboard */
export const DatabaseCard: React.FC<DatabaseCardProps> = ({ database }) => {
  const statusConfig = DATABASE_STATUS_CONFIG[database.status];

  return (
    <Card padding="md">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-dark">{database.config_name}</h3>
          <p className="text-sm text-text-muted">Имя базы: {database.db_name}</p>
        </div>
        <Badge variant={statusConfig.color as "green" | "yellow" | "orange" | "red" | "gray"}>
          {statusConfig.label}
        </Badge>
      </div>

      {database.status === "active" && database.web_url ? (
        <div className="mt-4 space-y-2">
          <div>
            <span className="text-xs text-text-light">Веб-доступ:</span>
            <a
              href={database.web_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-primary hover:underline"
            >
              {database.web_url}
            </a>
          </div>
          {database.rdp_url ? (
            <div>
              <span className="text-xs text-text-light">RDP:</span>
              <a
                href={database.rdp_url}
                className="block text-sm text-primary hover:underline"
              >
                Скачать .rdp файл
              </a>
            </div>
          ) : null}
        </div>
      ) : null}

      {database.status === "preparing" ? (
        <p className="mt-4 text-sm text-text-muted">
          Ваша база загружена, мы её разворачиваем. Обычно это занимает 1-2 часа.
        </p>
      ) : null}

      <div className="mt-4 flex gap-4 text-xs text-text-light">
        {database.size_gb ? <span>Размер: {formatFileSize(database.size_gb * 1024 * 1024 * 1024)}</span> : null}
        {database.last_backup_at ? <span>Бэкап: {formatDate(database.last_backup_at)}</span> : null}
      </div>
    </Card>
  );
};
