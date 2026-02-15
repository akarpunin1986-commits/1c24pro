/**
 * Badge — small label component for status indicators and tags.
 */

interface BadgeProps {
  /** Badge text content */
  children: React.ReactNode;
  /** Color variant */
  variant?: "gray" | "green" | "yellow" | "red" | "blue" | "orange" | "purple";
  /** Additional CSS classes */
  className?: string;
}

const VARIANT_CLASSES: Record<NonNullable<BadgeProps["variant"]>, string> = {
  gray: "bg-gray-100 text-gray-700",
  green: "bg-green-50 text-green-700",
  yellow: "bg-yellow-50 text-yellow-700",
  red: "bg-red-50 text-red-700",
  blue: "bg-blue-50 text-blue-700",
  orange: "bg-orange-50 text-orange-700",
  purple: "bg-purple-50 text-purple-700",
};

/** Small badge/label component */
export const Badge: React.FC<BadgeProps> = ({ children, variant = "gray", className = "" }) => {
  return (
    <span
      className={`
        inline-flex items-center rounded-badge px-2.5 py-1 text-xs font-medium
        ${VARIANT_CLASSES[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};
