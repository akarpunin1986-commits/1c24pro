/**
 * AdminPage — admin panel for managing uploads, databases, and users.
 * Shows upload queue, database editor, and user list.
 * @see TZ section 2.6 — Admin panel layout
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { UploadQueue } from "@/components/admin/UploadQueue";
import { DatabaseEditor } from "@/components/admin/DatabaseEditor";
import { UserList } from "@/components/admin/UserList";
import { Button } from "@/components/ui/Button";
import type { AdminUploadRecord, AdminUserRecord, AdminDatabaseUpdateRequest } from "@/types/api";

interface AdminPageProps extends Record<string, never> {}

type AdminTab = "uploads" | "users";

/** Admin panel page */
export const AdminPage: React.FC<AdminPageProps> = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("uploads");
  const [uploads] = useState<AdminUploadRecord[]>([]);
  const [users] = useState<AdminUserRecord[]>([]);
  const [selectedUpload, setSelectedUpload] = useState<AdminUploadRecord | null>(null);

  const handleSelectUpload = (upload: AdminUploadRecord): void => {
    setSelectedUpload(upload);
  };

  const handleSaveDatabase = (_data: AdminDatabaseUpdateRequest): void => {
    // TODO: Call admin API to update database
    setSelectedUpload(null);
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-extrabold text-white">
                1С
              </div>
              <span className="text-base font-bold text-dark">24.pro</span>
            </Link>
            <span className="text-sm font-medium text-primary">АДМИНКА</span>
          </div>

          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              &larr; В ЛК
            </Button>
          </Link>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-7xl gap-6 px-6">
          {(["uploads", "users"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
              }}
              className={`border-b-2 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-primary text-dark"
                  : "border-transparent text-text-muted hover:text-dark"
              }`}
            >
              {tab === "uploads" ? "Очередь загрузок" : "Пользователи"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {activeTab === "uploads" ? (
          <div className="space-y-6">
            <UploadQueue uploads={uploads} onSelect={handleSelectUpload} />

            {selectedUpload ? (
              <DatabaseEditor
                databaseId={selectedUpload.id}
                dbName={selectedUpload.db_name}
                currentStatus="preparing"
                onSave={handleSaveDatabase}
              />
            ) : null}
          </div>
        ) : (
          <UserList users={users} />
        )}
      </main>
    </div>
  );
};
