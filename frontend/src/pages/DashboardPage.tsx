/**
 * DashboardPage — full client dashboard with real API, tabs, beautiful UI.
 * Loads data from GET /api/v1/me and GET /api/v1/me/databases.
 * @see TZ section 2.3 — Dashboard layout
 */

import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "@/api/client";

/* ── Types matching backend responses ─────────────────────────────────── */

interface OrgInfo {
  inn: string;
  kpp?: string;
  name_short: string;
  name_full?: string;
  type: string;
  director_name?: string;
  address?: string;
  status: string;
}

interface MeData {
  id: string;
  phone: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  patronymic: string | null;
  display_name: string;
  role: string;
  status: string;
  referral_code: string;
  organization: OrgInfo;
  trial_started_at: string | null;
  trial_ends_at: string;
  created_at: string;
}

interface DbRecord {
  id: string;
  name: string;
  db_name: string;
  config_code: string;
  config_name: string;
  status: string;
  web_url: string | null;
  rdp_url: string | null;
  size_gb: number | null;
  last_backup_at: string | null;
  created_at: string;
}

type Tab = "databases" | "upload" | "employees" | "profile";

const CONFIG_OPTIONS = [
  { value: "bp30", label: "Бухгалтерия предприятия 3.0" },
  { value: "zup31", label: "Зарплата и управление персоналом 3.1" },
  { value: "ut11", label: "Управление торговлей 11" },
  { value: "erp25", label: "ERP Управление предприятием 2.5" },
  { value: "unf18", label: "Управление нашей фирмой 1.8" },
  { value: "ka2", label: "Комплексная автоматизация 2" },
  { value: "dt", label: "Документооборот 3" },
  { value: "med", label: "Медицина" },
  { value: "other", label: "Другая конфигурация" },
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Работает", color: "text-green-700", bg: "bg-green-100" },
  preparing: { label: "Подготовка", color: "text-yellow-700", bg: "bg-yellow-100" },
  readonly: { label: "Только чтение", color: "text-orange-700", bg: "bg-orange-100" },
  blocked: { label: "Заблокирована", color: "text-red-700", bg: "bg-red-100" },
  deleted: { label: "Удалена", color: "text-gray-500", bg: "bg-gray-100" },
};

/** Client dashboard page */
export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("databases");
  const [me, setMe] = useState<MeData | null>(null);
  const [databases, setDatabases] = useState<DbRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Upload state
  const [selectedConfig, setSelectedConfig] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");

  // Profile edit
  const [editEmail, setEditEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Referral copy
  const [copied, setCopied] = useState(false);

  // Account deletion
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Employees / Invite
  interface MemberInfo {
    id: string;
    phone: string;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    patronymic: string | null;
    display_name: string;
    role: string;
    status: string;
    created_at: string;
  }
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [invFirstName, setInvFirstName] = useState("");
  const [invLastName, setInvLastName] = useState("");
  const [invPatronymic, setInvPatronymic] = useState("");
  const [invPhone, setInvPhone] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [meRes, dbRes] = await Promise.all([
        apiClient.get<MeData>("/me"),
        apiClient.get<DbRecord[]>("/me/databases"),
      ]);
      setMe(meRes.data);
      setDatabases(dbRes.data);
      if (meRes.data.email) setEditEmail(meRes.data.email);
    } catch {
      setError("Не удалось загрузить данные. Попробуйте обновить страницу.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const loadMembers = useCallback(async () => {
    setMembersLoading(true);
    try {
      const res = await apiClient.get<MemberInfo[]>("/org/members");
      setMembers(res.data);
    } catch {
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "employees") {
      void loadMembers();
    }
  }, [tab, loadMembers]);

  const handleInvite = async (): Promise<void> => {
    if (!invFirstName.trim() || !invPhone.trim()) return;
    setInviting(true);
    setInviteMsg("");
    try {
      const phone = invPhone.replace(/\D/g, "");
      const formatted = phone.startsWith("7") ? `+${phone}` : phone.startsWith("8") ? `+7${phone.slice(1)}` : `+7${phone}`;
      await apiClient.post("/org/invite", {
        first_name: invFirstName.trim(),
        last_name: invLastName.trim() || null,
        patronymic: invPatronymic.trim() || null,
        phone: formatted,
      });
      setInviteMsg("Приглашение отправлено!");
      setInvFirstName("");
      setInvLastName("");
      setInvPatronymic("");
      setInvPhone("");
      setShowInviteForm(false);
      void loadMembers();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Ошибка отправки приглашения";
      setInviteMsg(msg);
    } finally {
      setInviting(false);
    }
  };

  const handleLogout = (): void => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/auth", { replace: true });
  };

  /* ── Trial bar helpers ─────────────────────────── */
  const trialNotStarted = me ? !me.trial_ends_at : false;
  const trialDaysLeft = me && me.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(me.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 0;
  const totalTrialDays = me && me.trial_ends_at && me.trial_started_at
    ? Math.ceil((new Date(me.trial_ends_at).getTime() - new Date(me.trial_started_at).getTime()) / 86400000)
    : 30;
  const trialPercent = Math.max(0, Math.min(100, ((totalTrialDays - trialDaysLeft) / totalTrialDays) * 100));

  /* ── Upload handler ────────────────────────────── */
  const handleUpload = async (): Promise<void> => {
    if (!uploadFile || !selectedConfig) return;
    setUploading(true);
    setUploadMsg("");
    try {
      // Step 1: Init upload
      const { data: initData } = await apiClient.post<{
        upload_id: string;
        db_name: string;
        chunk_size: number;
        chunks_expected: number;
      }>("/uploads/init", {
        filename: uploadFile.name,
        size_bytes: uploadFile.size,
        config_code: selectedConfig,
      });

      // Step 2: Upload chunks
      const chunkSize = initData.chunk_size;
      for (let i = 0; i < initData.chunks_expected; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, uploadFile.size);
        const chunk = uploadFile.slice(start, end);
        const formData = new FormData();
        formData.append("chunk", chunk);
        await apiClient.put(`/uploads/${initData.upload_id}/chunk/${i}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // Step 3: Complete
      await apiClient.post(`/uploads/${initData.upload_id}/complete`);
      setUploadMsg(`База "${initData.db_name}" загружена и отправлена на обработку!`);
      setUploadFile(null);
      setSelectedConfig("");
      void loadData();
    } catch {
      setUploadMsg("Ошибка загрузки. Попробуйте ещё раз.");
    } finally {
      setUploading(false);
    }
  };

  /* ── Save profile ──────────────────────────────── */
  const handleSaveProfile = async (): Promise<void> => {
    setSavingProfile(true);
    setProfileMsg("");
    try {
      await apiClient.patch("/me", { email: editEmail || undefined });
      setProfileMsg("Профиль сохранён");
      void loadData();
    } catch {
      setProfileMsg("Ошибка сохранения");
    } finally {
      setSavingProfile(false);
    }
  };

  /* ── Delete account ───────────────────────────── */
  const handleDeleteAccount = async (): Promise<void> => {
    if (confirmText !== "УДАЛИТЬ") return;
    setIsDeleting(true);
    try {
      await apiClient.delete("/auth/me");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/";
    } catch {
      alert("Ошибка при удалении аккаунта. Попробуйте позже.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyReferral = async (): Promise<void> => {
    if (!me) return;
    try {
      await navigator.clipboard.writeText(me.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  /* ── Loading / Error states ────────────────────── */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          <p className="text-gray-500">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (error || !me) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <p className="mb-4 text-red-500">{error || "Данные не найдены"}</p>
          <button
            onClick={() => void loadData()}
            className="rounded-lg bg-orange-500 px-6 py-2 text-white hover:bg-orange-600"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "databases", label: "Базы", icon: "🗄️" },
    { id: "upload", label: "Загрузить", icon: "📤" },
    { id: "employees", label: "Сотрудники", icon: "👥" },
    { id: "profile", label: "Профиль", icon: "👤" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ── Sidebar ────────────────────────────────── */}
      <aside className="fixed left-0 top-0 flex h-full w-64 flex-col border-r border-gray-200 bg-white">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 border-b border-gray-100 px-6 py-5 no-underline">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-sm font-extrabold text-white">
            1С
          </div>
          <span className="text-lg font-bold text-gray-900">24.pro</span>
        </Link>

        {/* Org info */}
        <div className="border-b border-gray-100 px-6 py-4">
          <p className="truncate text-sm font-semibold text-gray-900">{me.organization.name_short}</p>
          <p className="text-xs text-gray-400">ИНН {me.organization.inn}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`mb-1 flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm transition-colors ${
                tab === t.id
                  ? "bg-orange-50 font-semibold text-orange-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="text-base">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        {/* Bottom: user + logout */}
        <div className="border-t border-gray-100 px-4 py-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
              {me.first_name ? me.first_name[0] : me.phone.slice(-2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {me.display_name || me.organization.name_short}
              </p>
              <p className="text-xs text-gray-400">{formatPhoneDisplay(me.phone)}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <span>🚪</span> Выйти
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────── */}
      <main className="ml-64 flex-1 p-8">
        {/* Trial banner — not started */}
        {trialNotStarted && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  30 дней бесплатно
                </span>
                <span className="text-sm text-gray-700">
                  Тестовый период начнётся после загрузки первой базы
                </span>
              </div>
              <button
                onClick={() => setTab("upload")}
                className="text-sm font-medium text-primary hover:underline"
              >
                Загрузить базу &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Trial banner — active */}
        {!trialNotStarted && trialDaysLeft > 0 && (
          <div className={`mb-6 rounded-xl border p-4 ${
            trialDaysLeft <= 3
              ? "border-red-200 bg-red-50"
              : trialDaysLeft <= 7
                ? "border-yellow-200 bg-yellow-50"
                : "border-blue-200 bg-blue-50"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  trialDaysLeft <= 3 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                }`}>
                  Тестовый период
                </span>
                <span className="text-sm text-gray-700">
                  Осталось <b>{trialDaysLeft}</b> {pluralDays(trialDaysLeft)}
                </span>
              </div>
              {trialDaysLeft <= 7 && (
                <button className="text-sm font-medium text-orange-600 hover:underline">
                  Выбрать тариф &rarr;
                </button>
              )}
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all ${
                  trialDaysLeft <= 3 ? "bg-red-500" : trialDaysLeft <= 7 ? "bg-yellow-500" : "bg-blue-500"
                }`}
                style={{ width: `${trialPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Tab: Databases ────────────────────────── */}
        {tab === "databases" && (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Мои базы</h1>
              <button
                onClick={() => setTab("upload")}
                className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-orange-600"
              >
                + Загрузить базу
              </button>
            </div>

            {databases.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
                <span className="mb-4 block text-5xl">🗄️</span>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">У вас пока нет баз</h3>
                <p className="mb-6 text-gray-500">Загрузите свою базу 1С или создайте новую</p>
                <button
                  onClick={() => setTab("upload")}
                  className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
                >
                  Загрузить базу
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {databases.map((db) => {
                  const st = (STATUS_MAP[db.status] ?? STATUS_MAP.active)!;
                  return (
                    <div key={db.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{db.config_name}</h3>
                          <p className="text-xs text-gray-400">{db.db_name}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${st.color} ${st.bg}`}>
                          {st.label}
                        </span>
                      </div>

                      {db.size_gb != null && (
                        <p className="mb-2 text-xs text-gray-500">Размер: {db.size_gb} ГБ</p>
                      )}
                      {db.last_backup_at && (
                        <p className="mb-2 text-xs text-gray-500">
                          Бэкап: {new Date(db.last_backup_at).toLocaleDateString("ru-RU")}
                        </p>
                      )}

                      <div className="mt-4 flex gap-2">
                        {db.web_url && db.status === "active" && (
                          <a
                            href={db.web_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 rounded-lg bg-orange-500 px-3 py-2 text-center text-xs font-medium text-white hover:bg-orange-600"
                          >
                            Открыть веб
                          </a>
                        )}
                        {db.rdp_url && db.status === "active" && (
                          <a
                            href={db.rdp_url}
                            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Открыть RDP
                          </a>
                        )}
                        {db.status === "preparing" && (
                          <p className="w-full text-center text-xs text-yellow-600">
                            Разворачиваем базу... обычно 1-2 часа
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ── Tab: Upload ───────────────────────────── */}
        {tab === "upload" && (
          <section>
            <h1 className="mb-6 text-2xl font-bold text-gray-900">Загрузка базы</h1>

            <div className="mx-auto max-w-2xl space-y-6">
              {/* Step 1: Config selection */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-1 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                    1
                  </span>
                  <h2 className="text-base font-semibold text-gray-900">Выберите конфигурацию</h2>
                </div>
                <p className="mb-4 ml-8 text-sm text-gray-500">Укажите конфигурацию вашей базы 1С</p>
                <select
                  value={selectedConfig}
                  onChange={(e) => setSelectedConfig(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                >
                  <option value="">-- Выберите конфигурацию --</option>
                  {CONFIG_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: File drop */}
              <div className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm ${!selectedConfig ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="mb-1 flex items-center gap-2">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${selectedConfig ? "bg-orange-500" : "bg-gray-300"}`}>
                    2
                  </span>
                  <h2 className="text-base font-semibold text-gray-900">Загрузите файл базы</h2>
                </div>
                <p className="mb-4 ml-8 text-sm text-gray-500">Перетащите файл .dt или .bak</p>

                <div
                  onDragOver={(e) => { e.preventDefault(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files[0];
                    if (f) setUploadFile(f);
                  }}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".dt,.bak";
                    input.onchange = () => {
                      const f = input.files?.[0];
                      if (f) setUploadFile(f);
                    };
                    input.click();
                  }}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-10 transition-colors hover:border-orange-400 hover:bg-orange-50"
                >
                  {uploadFile ? (
                    <>
                      <span className="mb-2 text-3xl">📄</span>
                      <p className="font-medium text-gray-900">{uploadFile.name}</p>
                      <p className="text-sm text-gray-500">{formatSize(uploadFile.size)}</p>
                    </>
                  ) : (
                    <>
                      <span className="mb-2 text-4xl">📁</span>
                      <p className="font-medium text-gray-700">Перетащите файл сюда</p>
                      <p className="text-sm text-gray-400">или нажмите для выбора</p>
                    </>
                  )}
                </div>
              </div>

              {/* Upload button */}
              <button
                onClick={() => void handleUpload()}
                disabled={!selectedConfig || !uploadFile || uploading}
                className="w-full rounded-xl bg-orange-500 px-6 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? "Загружаем..." : "Загрузить базу"}
              </button>

              {uploadMsg && (
                <div className={`rounded-lg p-4 text-sm ${
                  uploadMsg.includes("Ошибка") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                }`}>
                  {uploadMsg}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Tab: Employees ────────────────────────── */}
        {tab === "employees" && (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Сотрудники</h1>
              {me.role === "owner" && (
                <button
                  onClick={() => { setShowInviteForm((v) => !v); setInviteMsg(""); }}
                  className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-orange-600"
                >
                  {showInviteForm ? "Отмена" : "+ Пригласить"}
                </button>
              )}
            </div>

            {/* Invite form */}
            {showInviteForm && (
              <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 p-6">
                <h3 className="mb-4 text-sm font-semibold text-gray-900">Пригласить сотрудника</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Фамилия</label>
                    <input
                      type="text"
                      value={invLastName}
                      onChange={(e) => setInvLastName(e.target.value)}
                      placeholder="Иванова"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">
                      Имя <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={invFirstName}
                      onChange={(e) => setInvFirstName(e.target.value)}
                      placeholder="Мария"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Отчество</label>
                    <input
                      type="text"
                      value={invPatronymic}
                      onChange={(e) => setInvPatronymic(e.target.value)}
                      placeholder="Сергеевна"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">
                      Телефон <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={invPhone}
                      onChange={(e) => setInvPhone(e.target.value)}
                      placeholder="+7 (927) 123-45-67"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => void handleInvite()}
                    disabled={inviting || !invFirstName.trim() || !invPhone.trim()}
                    className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {inviting ? "Отправка..." : "Отправить приглашение"}
                  </button>
                  {inviteMsg && (
                    <p className={`text-sm ${inviteMsg.startsWith("Приглашение") ? "text-green-600" : "text-red-600"}`}>
                      {inviteMsg}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Invite success message outside form */}
            {!showInviteForm && inviteMsg && inviteMsg.startsWith("Приглашение") && (
              <div className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
                {inviteMsg}
              </div>
            )}

            {/* Members list */}
            {membersLoading ? (
              <div className="py-8 text-center text-gray-400">Загрузка...</div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                {members.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-400">Нет сотрудников</div>
                ) : (
                  members.map((m, idx) => (
                    <div
                      key={m.id}
                      className={`flex items-center gap-4 px-6 py-4 ${idx < members.length - 1 ? "border-b border-gray-100" : ""}`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                        {m.first_name ? m.first_name[0] : m.phone.slice(-2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900">
                          {m.display_name}
                        </p>
                        <p className="text-sm text-gray-400">
                          {formatPhoneDisplay(m.phone)}
                          {m.email ? ` • ${m.email}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {m.status === "invited" && (
                          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                            Приглашён
                          </span>
                        )}
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                          m.role === "owner"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {m.role === "owner" ? "Владелец" : "Сотрудник"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <p className="mt-4 text-sm text-gray-400">
              Приглашайте сотрудников по номеру телефона. Они получат SMS со ссылкой для входа.
            </p>
          </section>
        )}

        {/* ── Tab: Profile ──────────────────────────── */}
        {tab === "profile" && (
          <section>
            <h1 className="mb-6 text-2xl font-bold text-gray-900">Профиль</h1>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* User info */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Личные данные</h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Телефон</label>
                    <p className="text-sm font-medium text-gray-900">{formatPhoneDisplay(me.phone)}</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Email</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="Добавить email"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Роль</label>
                    <p className="text-sm capitalize text-gray-900">
                      {me.role === "owner" ? "Владелец" : me.role}
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Реферальный код</label>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-gray-100 px-3 py-1.5 font-mono text-sm text-gray-800">
                        {me.referral_code}
                      </code>
                      <button
                        onClick={() => void handleCopyReferral()}
                        className="text-xs text-orange-600 hover:underline"
                      >
                        {copied ? "Скопировано!" : "Копировать"}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => void handleSaveProfile()}
                    disabled={savingProfile}
                    className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                  >
                    {savingProfile ? "Сохранение..." : "Сохранить"}
                  </button>
                  {profileMsg && (
                    <p className={`text-sm ${profileMsg.includes("Ошибка") ? "text-red-500" : "text-green-600"}`}>
                      {profileMsg}
                    </p>
                  )}
                </div>
              </div>

              {/* Organization */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Организация</h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Название</label>
                    <p className="text-sm font-medium text-gray-900">{me.organization.name_short}</p>
                    {me.organization.name_full && (
                      <p className="text-xs text-gray-400">{me.organization.name_full}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">ИНН</label>
                    <p className="font-mono text-sm text-gray-900">{me.organization.inn}</p>
                  </div>
                  {me.organization.kpp && (
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">КПП</label>
                      <p className="font-mono text-sm text-gray-900">{me.organization.kpp}</p>
                    </div>
                  )}
                  {me.organization.director_name && (
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">Руководитель</label>
                      <p className="text-sm text-gray-900">{me.organization.director_name}</p>
                    </div>
                  )}
                  {me.organization.address && (
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">Адрес</label>
                      <p className="text-sm text-gray-900">{me.organization.address}</p>
                    </div>
                  )}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Тестовый период</label>
                    <p className="text-sm text-gray-900">
                      {trialNotStarted
                        ? "Начнётся после загрузки первой базы (30 дней)"
                        : trialDaysLeft > 0
                          ? `Активен, осталось ${trialDaysLeft} ${pluralDays(trialDaysLeft)}`
                          : "Завершён"}
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Зарегистрирован</label>
                    <p className="text-sm text-gray-900">
                      {new Date(me.created_at).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delete account */}
            <div className="mt-12 border-t border-gray-200 pt-8">
              <h3 className="text-lg font-medium text-red-600">Удаление аккаунта</h3>
              <p className="mt-1 text-sm text-gray-500">
                После удаления аккаунта все ваши данные будут безвозвратно удалены.
                Базы данных будут недоступны.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                Удалить аккаунт
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Delete account confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Удалить аккаунт?</h3>
            <p className="mt-2 text-sm text-gray-600">
              Это действие необратимо. Все ваши базы данных 1С будут удалены,
              доступ к сервису будет прекращён.
            </p>

            <p className="mt-4 text-sm text-gray-700">
              Введите <strong>УДАЛИТЬ</strong> для подтверждения:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="УДАЛИТЬ"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmText("");
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={() => void handleDeleteAccount()}
                disabled={confirmText !== "УДАЛИТЬ" || isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? "Удаление..." : "Удалить навсегда"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Helpers ─────────────────────────────────────── */

function formatPhoneDisplay(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length === 11) {
    return `+${d[0]} (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
  }
  return phone;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} КБ`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} МБ`;
  return `${(bytes / 1073741824).toFixed(2)} ГБ`;
}

function pluralDays(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "дня";
  return "дней";
}
