/**
 * PhoneForm — Step 1 of auth: phone number input with mask and send code.
 * @see TZ section 2.1 — Step 1: Phone input
 */

import { useState } from "react";
import { sendCode } from "@/api/auth";

interface PhoneFormProps {
  /** Callback when code is sent successfully */
  onCodeSent: (phone: string, isNewUser: boolean) => void;
}

/** Format phone digits as +7 (XXX) XXX-XX-XX */
const formatDisplay = (d: string): string => {
  if (d.length === 0) return "+7";
  if (d.length <= 3) return `+7 (${d}`;
  if (d.length <= 6) return `+7 (${d.slice(0, 3)}) ${d.slice(3)}`;
  if (d.length <= 8) return `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8, 10)}`;
};

/** Phone number input form with mask for OTP authentication */
export const PhoneForm: React.FC<PhoneFormProps> = ({ onCodeSent }) => {
  const [phoneDigits, setPhoneDigits] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizedPhone = `+7${phoneDigits}`;
  const isValid = phoneDigits.length === 10;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const raw = e.target.value.replace(/\D/g, "");
    let digits = raw;
    if (digits.startsWith("7") || digits.startsWith("8")) {
      digits = digits.slice(1);
    }
    setPhoneDigits(digits.slice(0, 10));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!isValid) {
      setError("Введите 10 цифр номера");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await sendCode(normalizedPhone);
      onCodeSent(normalizedPhone, result.is_new_user);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      const msg = axiosErr?.response?.data?.detail ?? "Не удалось отправить код";
      setError(typeof msg === "string" ? msg : "Ошибка отправки SMS");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-dark">Войти или зарегистрироваться</h2>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Телефон</label>
        <input
          type="tel"
          value={formatDisplay(phoneDigits)}
          onChange={handleChange}
          placeholder="+7 (___) ___-__-__"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          autoFocus
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={!isValid || loading}
        className="w-full rounded-button bg-dark px-6 py-3 font-medium text-white transition-colors hover:bg-dark-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Отправляем..." : "Получить код →"}
      </button>
    </form>
  );
};
