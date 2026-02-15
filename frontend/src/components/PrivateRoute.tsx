import { Navigate } from "react-router-dom";

/**
 * PrivateRoute — protects routes that require authentication.
 * Redirects to /auth if no access_token found in localStorage.
 */
export const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem("access_token");
  if (!token) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};
