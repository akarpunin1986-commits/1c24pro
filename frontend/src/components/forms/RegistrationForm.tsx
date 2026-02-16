/**
 * RegistrationForm — Step 3: INN input with DaData auto-fill.
 * @see TZ section 2.1 — Step 3: INN and agreement
 */

import { useState, useEffect } from "react";
import { apiClient } from "@/api/client";

interface RegistrationFormProps {
  /** Callback when registration is submitted */
  onSubmit: (inn: string, referralCode?: string, orgData?: Record<string, string | null | undefined>) => void;
}

interface OrgData {
  inn: string;
  kpp?: string | null;
  ogrn?: string | null;
  name_short: string;
  name_full?: string | null;
  type?: string;
  director_name?: string | null;
  address?: string | null;
  okved?: string | null;
  status: string;
}

/** Registration form with INN lookup and DaData auto-fill */
export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSubmit }) => {
  const [inn, setInn] = useState("");
  const [orgData, setOrgData] = useState<OrgData | null>(null);
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgError, setOrgError] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isComplete = (inn.length === 10 || inn.length === 12) && /^\d+$/.test(inn);
    if (!isComplete) {
      setOrgData(null);
      setOrgError("");
      return;
    }

    let cancelled = false;
    const lookup = async (): Promise<void> => {
      setOrgLoading(true);
      setOrgError("");
      try {
        const { data } = await apiClient.post<OrgData>("/inn/lookup", { inn });
        if (!cancelled) setOrgData(data);
      } catch (err: unknown) {
        if (!cancelled) {
          const axiosErr = err as { response?: { data?: { detail?: string } } };
          setOrgError(axiosErr?.response?.data?.detail ?? "ИНН не найден");
          setOrgData(null);
        }
      } finally {
        if (!cancelled) setOrgLoading(false);
      }
    };

    void lookup();
    return () => { cancelled = true; };
  }, [inn]);

  const handleInnChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 12);
    setInn(val);
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!orgData || !accepted) return;
    setLoading(true);
    onSubmit(inn, referralCode || undefined, orgData);
  };

  const canSubmit = orgData !== null && accepted && !loading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-dark">Укажите вашу организацию</h2>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">ИНН</label>
        <input
          type="text"
          inputMode="numeric"
          value={inn}
          onChange={handleInnChange}
          placeholder="Введите ИНН (10 или 12 цифр)"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          autoFocus
        />
      </div>

      {orgLoading && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
          Ищем организацию...
        </div>
      )}

      {orgError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {orgError}
        </div>
      )}

      {orgData && (
        <div className="space-y-1 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2">
            <span className="text-green-600">&#x2705;</span>
            <span className="font-semibold text-dark">{orgData.name_short}</span>
          </div>
          {orgData.director_name && (
            <p className="text-sm text-gray-600">Директор: {orgData.director_name}</p>
          )}
          {orgData.address && (
            <p className="text-sm text-gray-600">Адрес: {orgData.address}</p>
          )}
          <p className="text-sm text-gray-600">
            Статус:{" "}
            <span className="text-green-600">
              {orgData.status === "ACTIVE" ? "Действующая" : orgData.status}
            </span>
          </p>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Реферальный код <span className="text-gray-400">(необязательно)</span>
        </label>
        <input
          type="text"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          placeholder="XXXXXXXX"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <span className="text-sm text-gray-600">
          Принимаю условия{" "}
          <a href="/offer" target="_blank" className="text-primary hover:underline" rel="noreferrer">
            оферты
          </a>
        </span>
      </label>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-button bg-dark px-6 py-3 font-medium text-white transition-colors hover:bg-dark-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Создаём аккаунт..." : "Создать аккаунт →"}
      </button>
    </form>
  );
};
