/**
 * UserList — admin view of registered users with organization info.
 * Shows phone, email status, organization, trial status.
 * @see TZ section 2.6 — Admin user list
 */

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPhone, formatDate } from "@/utils/formatters";
import type { AdminUserRecord } from "@/types/api";

interface UserListProps {
  /** List of user records */
  users: AdminUserRecord[];
}

/** Admin user list table */
export const UserList: React.FC<UserListProps> = ({ users }) => {
  if (users.length === 0) {
    return (
      <Card padding="md">
        <p className="text-center text-sm text-text-muted">Нет зарегистрированных пользователей</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-dark">
        Пользователи ({users.length})
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-text-muted">
              <th className="pb-3 pr-4 font-medium">Телефон</th>
              <th className="pb-3 pr-4 font-medium">Email</th>
              <th className="pb-3 pr-4 font-medium">Организация</th>
              <th className="pb-3 pr-4 font-medium">Роль</th>
              <th className="pb-3 pr-4 font-medium">Тест до</th>
              <th className="pb-3 font-medium">Регистрация</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border-light">
                <td className="py-3 pr-4 text-dark">{formatPhone(user.phone)}</td>
                <td className="py-3 pr-4">
                  {user.email ? (
                    <span className="text-dark">{user.email}</span>
                  ) : (
                    <Badge variant="red">нет</Badge>
                  )}
                </td>
                <td className="py-3 pr-4 text-dark">{user.organization.name_short}</td>
                <td className="py-3 pr-4">
                  <Badge variant={user.role === "owner" ? "purple" : "gray"}>
                    {user.role}
                  </Badge>
                </td>
                <td className="py-3 pr-4 text-text-muted">{formatDate(user.trial_ends_at)}</td>
                <td className="py-3 text-text-muted">{formatDate(user.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
