/**
 * AuthPage — authentication page with multi-step flow.
 * Step 1: Phone → Step 2: OTP → Step 3: Registration (if new user).
 * @see TZ section 2.1 — Passwordless auth flow
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PhoneForm } from "@/components/forms/PhoneForm";
import { OTPInput } from "@/components/forms/OTPInput";
import { RegistrationForm } from "@/components/forms/RegistrationForm";
import { verifyCode, completeRegistration, sendCode } from "@/api/auth";

type AuthStep = "phone" | "otp" | "registration";

/** Authentication page with phone/OTP/registration flow */
export const AuthPage: React.FC = () => {
  const [step, setStep] = useState<AuthStep>("phone");
  const [phone, setPhone] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleCodeSent = (phoneNumber: string, _isNewUser: boolean): void => {
    setPhone(phoneNumber);
    setStep("otp");
    setError("");
  };

  const handleVerify = async (code: string): Promise<void> => {
    setError("");
    try {
      const result = await verifyCode(phone, code);
      if (!result.verified) {
        setError("Неверный код. Попробуйте ещё раз.");
        return;
      }
      if (result.needs_registration) {
        setTempToken(result.temp_token ?? "");
        setStep("registration");
      } else {
        localStorage.setItem("access_token", result.access_token ?? "");
        localStorage.setItem("refresh_token", result.refresh_token ?? "");
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      const msg = axiosErr?.response?.data?.detail ?? "Ошибка проверки кода";
      setError(typeof msg === "string" ? msg : "Ошибка проверки кода");
    }
  };

  const handleResend = async (): Promise<void> => {
    try {
      await sendCode(phone);
    } catch {
      // Silently fail, user can retry
    }
  };

  const handleRegister = async (inn: string, referralCode?: string): Promise<void> => {
    setError("");
    try {
      const result = await completeRegistration(inn, tempToken, referralCode);
      localStorage.setItem("access_token", result.access_token);
      localStorage.setItem("refresh_token", result.refresh_token);
      navigate("/dashboard");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      const msg = axiosErr?.response?.data?.detail ?? "Ошибка регистрации";
      setError(typeof msg === "string" ? msg : "Ошибка регистрации");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-extrabold text-white">
            1С
          </div>
          <span className="text-xl font-bold text-dark">24.pro</span>
        </Link>

        {/* Auth card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}
          {step === "phone" && <PhoneForm onCodeSent={handleCodeSent} />}
          {step === "otp" && (
            <OTPInput phone={phone} onVerify={handleVerify} onResend={handleResend} />
          )}
          {step === "registration" && <RegistrationForm onSubmit={handleRegister} />}
        </div>

        {/* Back to landing */}
        <p className="mt-6 text-center text-sm text-gray-500">
          <Link to="/" className="text-primary hover:text-primary-hover">
            &larr; На главную
          </Link>
        </p>
      </div>
    </div>
  );
};
