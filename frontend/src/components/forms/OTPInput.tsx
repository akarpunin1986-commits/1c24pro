/**
 * OTPInput — Step 2 of auth: 6-digit SMS code input with auto-verify.
 * @see TZ section 2.1 — Step 2: SMS code input
 */

import { useState, useEffect, useRef } from "react";

interface OTPInputProps {
  /** Phone number the code was sent to */
  phone: string;
  /** Callback when code is verified */
  onVerify: (code: string) => void;
  /** Callback when user requests code resend */
  onResend: () => void;
}

/** Mask phone: +79991234567 → +7 (999) ***-**-67 */
const maskPhone = (phone: string): string => {
  if (phone.length < 11) return phone;
  const digits = phone.replace(/\D/g, "");
  const area = digits.slice(1, 4);
  const last2 = digits.slice(9, 11);
  return `+7 (${area}) ***-**-${last2}`;
};

/** OTP 6-digit code input component with countdown timer */
export const OTPInput: React.FC<OTPInputProps> = ({ phone, onVerify, onResend }) => {
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
    if (value.length === 6) {
      setLoading(true);
      onVerify(value);
    }
  };

  const handleResend = (): void => {
    onResend();
    setTimer(60);
    setCode("");
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-dark">Введите код</h2>
      <p className="text-sm text-text-muted">
        Код отправлен на <span className="font-medium text-dark">{maskPhone(phone)}</span>
      </p>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={code}
        onChange={handleChange}
        maxLength={6}
        placeholder="______"
        className="w-full rounded-lg border border-gray-300 px-4 py-4 text-center font-mono text-3xl tracking-[0.5em] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        disabled={loading}
      />
      <div className="text-center text-sm text-text-muted">
        {timer > 0 ? (
          <span>Отправить повторно через {timer} сек</span>
        ) : (
          <button
            onClick={handleResend}
            className="font-medium text-primary hover:text-primary-hover"
          >
            Отправить повторно
          </button>
        )}
      </div>
    </div>
  );
};
