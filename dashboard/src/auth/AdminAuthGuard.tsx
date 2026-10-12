import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authService } from "./authService";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export const AdminAuthGuard = ({ children }: AdminAuthGuardProps) => {
  const location = useLocation();
  const isAuth = authService.isAuthenticated();

  useEffect(() => {
    // Dynamically inject strict noindex meta tag to prevent search indexing
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex, nofollow, noarchive, nosnippet";
  }, []);

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminAuthGuard;
