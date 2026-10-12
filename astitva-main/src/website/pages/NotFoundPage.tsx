import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const NotFoundPage = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md space-y-6">
        <h1 className="text-7xl font-extrabold bg-gradient-primary bg-clip-text text-transparent">404</h1>
        <h2 className="text-2xl font-bold text-foreground">Page Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The page or technical resource you are looking for does not exist or has been moved.
        </p>
        <Button asChild variant="hero">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Homepage
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
