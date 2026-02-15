/**
 * DatabaseEditor — admin form for entering web/RDP URLs and changing database status.
 * Used after manual deployment of a client's database on the server.
 * @see TZ section 2.6 — Admin database editor
 */

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { DatabaseStatus, AdminDatabaseUpdateRequest } from "@/types/api";

interface DatabaseEditorProps {
  /** Database ID being edited */
  databaseId: string;
  /** Current database name */
  dbName: string;
  /** Current status */
  currentStatus: DatabaseStatus;
  /** Callback when admin saves changes */
  onSave: (data: AdminDatabaseUpdateRequest) => void;
  /** Whether save is in progress */
  loading?: boolean;
}

const STATUS_OPTIONS: { value: DatabaseStatus; label: string }[] = [
  { value: "preparing", label: "Разворачиваем" },
  { value: "active", label: "Активна" },
  { value: "readonly", label: "Только чтение" },
  { value: "blocked", label: "Заблокирована" },
  { value: "deleted", label: "Удалена" },
];

/** Admin database editor form */
export const DatabaseEditor: React.FC<DatabaseEditorProps> = ({
  databaseId: _databaseId,
  dbName,
  currentStatus,
  onSave,
  loading = false,
}) => {
  const [status, setStatus] = useState<DatabaseStatus>(currentStatus);
  const [webUrl, setWebUrl] = useState("");
  const [rdpUrl, setRdpUrl] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = (notify: boolean): void => {
    onSave({
      status,
      web_url: webUrl || undefined,
      rdp_url: rdpUrl || undefined,
      admin_notes: notes || undefined,
      notify,
    });
  };

  return (
    <Card padding="lg">
      <h3 className="text-lg font-bold text-dark">Редактирование: {dbName}</h3>

      <div className="mt-4 space-y-4">
        {/* Status selector */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark">Статус</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as DatabaseStatus);
            }}
            className="w-full rounded-button border border-border bg-white px-4 py-3 text-sm text-dark outline-none focus:border-dark"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Web URL"
          placeholder="https://1c24.pro:15009/..."
          value={webUrl}
          onChange={setWebUrl}
          name="web_url"
        />

        <Input
          label="RDP URL"
          placeholder="https://1c24.pro/rdp/..."
          value={rdpUrl}
          onChange={setRdpUrl}
          name="rdp_url"
        />

        <Input
          label="Заметки"
          placeholder="Комментарий для админа"
          value={notes}
          onChange={setNotes}
          name="admin_notes"
        />

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              handleSave(false);
            }}
            loading={loading}
          >
            Сохранить
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              handleSave(true);
            }}
            loading={loading}
          >
            Сохранить и уведомить
          </Button>
        </div>
      </div>
    </Card>
  );
};
