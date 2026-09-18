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
    // Dynamically insert or update noindex meta tag to strictly prevent search engine indexing
    let metaTag = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!metaTag) {
      metaTag = document.createElement("meta");
      metaTag.name = "robots";
      document.head.appendChild(metaTag);
    }
    const previousRobots = metaTag.content;
    metaTag.content = "noindex, nofollow, noarchive";

    return () => {
      // Revert when leaving admin scope
      if (metaTag) {
        metaTag.content = previousRobots || "index, follow";
      }
    };
  }, []);

  if (!isAuth) {
    // Redirect unauthenticated access to /admin/login with return URL
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminAuthGuard;
