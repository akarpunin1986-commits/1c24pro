/**
 * Card — reusable card container with optional padding and border.
 */

interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Whether to show a border */
  bordered?: boolean;
  /** Padding size */
  padding?: "none" | "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
}

const PADDING_CLASSES: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

/** Reusable card container component */
export const Card: React.FC<CardProps> = ({
  children,
  bordered = true,
  padding = "md",
  className = "",
}) => {
  return (
    <div
      className={`
        rounded-card bg-white
        ${bordered ? "border border-border" : ""}
        ${PADDING_CLASSES[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
