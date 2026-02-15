/**
 * Input — reusable form input component with label and error states.
 */

interface InputProps {
  /** Input label text */
  label?: string;
  /** Input placeholder */
  placeholder?: string;
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Input type */
  type?: "text" | "email" | "tel" | "number" | "password";
  /** Error message to display */
  error?: string;
  /** Helper text below input */
  hint?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Maximum length */
  maxLength?: number;
  /** HTML name attribute */
  name?: string;
  /** HTML id attribute */
  id?: string;
  /** Additional CSS classes for the input element */
  className?: string;
}

/** Reusable form input component */
export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  error,
  hint,
  disabled = false,
  maxLength,
  name,
  id,
  className = "",
}) => {
  const inputId = id ?? name;

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-dark">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={`
          w-full rounded-button border px-4 py-3 text-sm text-dark outline-none
          transition-colors placeholder:text-text-light
          ${error ? "border-red-400 focus:border-red-500" : "border-border focus:border-dark"}
          ${disabled ? "cursor-not-allowed bg-bg-gray opacity-60" : "bg-white"}
          ${className}
        `}
      />
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
      {hint && !error ? <p className="mt-1 text-xs text-text-muted">{hint}</p> : null}
    </div>
  );
};
