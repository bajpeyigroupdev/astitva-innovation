import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WebsiteApp from "./website/WebsiteApp";

const queryClient = new QueryClient();

// Redirect legacy /admin or /dashboard to authoritative B2B subdomain
const B2BRedirect = () => {
  useEffect(() => {
    window.location.replace("https://b2b.astitvainnovation.in/login");
  }, []);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* External redirects for legacy links to the official B2B domain */}
          <Route path="/admin/*" element={<B2BRedirect />} />
          <Route path="/dashboard/*" element={<B2BRedirect />} />

          {/* Corporate Public Website Routes */}
          <Route path="/*" element={<WebsiteApp />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
