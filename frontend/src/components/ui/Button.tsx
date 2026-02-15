/**
 * Button — reusable button component with multiple variants.
 * Supports dark, primary, ghost, and outline styles.
 */

interface ButtonProps {
  /** Button content */
  children: React.ReactNode;
  /** Visual variant */
  variant?: "dark" | "primary" | "ghost" | "outline";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether the button is in a loading state */
  loading?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** HTML button type */
  type?: "button" | "submit" | "reset";
  /** Full width */
  fullWidth?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  dark: "bg-dark text-white hover:bg-dark-hover",
  primary: "bg-primary text-white hover:bg-primary-hover",
  ghost: "bg-transparent text-dark hover:bg-bg-gray",
  outline: "bg-transparent text-dark border border-border hover:border-dark",
};

const SIZE_CLASSES: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

/** Reusable button component */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "dark",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  fullWidth = false,
  onClick,
  className = "",
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        inline-flex cursor-pointer items-center justify-center rounded-button font-medium
        transition-all duration-200
        disabled:cursor-not-allowed disabled:opacity-50
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {loading ? (
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
};
