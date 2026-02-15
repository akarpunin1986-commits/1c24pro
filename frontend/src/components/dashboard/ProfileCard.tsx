/**
 * ProfileCard — displays user profile information and referral code.
 * Shows phone, email status, organization, and referral code with copy button.
 * @see TZ section 2.3 — Profile section of dashboard
 */

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPhone } from "@/utils/formatters";
import type { UserProfile, OrganizationInfo } from "@/types/api";

interface ProfileCardProps {
  /** User profile data */
  user: UserProfile;
  /** Organization info */
  organization: OrganizationInfo;
}

/** User profile information card */
export const ProfileCard: React.FC<ProfileCardProps> = ({ user, organization }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyReferral = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(user.referral_code);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <Card padding="md">
      <h3 className="text-lg font-bold text-dark">Профиль</h3>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Телефон</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-dark">{formatPhone(user.phone)}</span>
            {user.status === "active" ? <Badge variant="green">✓</Badge> : null}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Email</span>
          <span className="text-sm text-dark">
            {user.email ?? (
              <span className="text-text-light">не указан</span>
            )}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Организация</span>
          <span className="text-sm font-medium text-dark">{organization.name_short}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Роль</span>
          <Badge variant={user.role === "owner" ? "purple" : "gray"}>
            {user.role}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Реферальный код</span>
          <div className="flex items-center gap-2">
            <code className="rounded bg-bg-gray px-2 py-1 text-xs font-mono text-dark">
              {user.referral_code}
            </code>
            <button
              type="button"
              onClick={() => void handleCopyReferral()}
              className="text-xs text-primary hover:text-primary-hover"
            >
              {copied ? "Скопировано!" : "Копировать"}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};
