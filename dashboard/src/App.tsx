import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminAuthGuard from "./auth/AdminAuthGuard";
import PanelLayout from "./layouts/PanelLayout";
import WhatsAppErrorBoundary from "./components/WhatsAppErrorBoundary";

import LoginPage from "./pages/LoginPage";
import OverviewPage from "./pages/OverviewPage";
import InquiriesPage from "./pages/InquiriesPage";
import FinTechPage from "./pages/FinTechPage";
import ProposalsPage from "./pages/ProposalsPage";
import ServicesPage from "./pages/ServicesPage";
import ServerPage from "./pages/ServerPage";
import SettingsPage from "./pages/SettingsPage";
import ProductsPage from "./pages/ProductsPage";
import FoundersPage from "./pages/FoundersPage";
import CareersPage from "./pages/CareersPage";
import WhatsAppPage from "./pages/WhatsAppPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Protected Administrative Dashboard */}
          <Route
            element={
              <AdminAuthGuard>
                <PanelLayout />
              </AdminAuthGuard>
            }
          >
            <Route path="/" element={<OverviewPage />} />
            <Route path="/inquiries" element={<InquiriesPage />} />
            <Route
              path="/whatsapp"
              element={
                <WhatsAppErrorBoundary>
                  <WhatsAppPage />
                </WhatsAppErrorBoundary>
              }
            />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/founders" element={<FoundersPage />} />
            <Route path="/fintech" element={<FinTechPage />} />
            <Route path="/proposals" element={<ProposalsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/server" element={<ServerPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Compatibility Aliases for /admin and /dashboard */}
            <Route path="/admin" element={<Navigate to="/" replace />} />
            <Route path="/admin/overview" element={<Navigate to="/" replace />} />
            <Route path="/admin/inquiries" element={<Navigate to="/inquiries" replace />} />
            <Route path="/admin/whatsapp" element={<Navigate to="/whatsapp" replace />} />
            <Route path="/admin/careers" element={<Navigate to="/careers" replace />} />
            <Route path="/admin/products" element={<Navigate to="/products" replace />} />
            <Route path="/admin/founders" element={<Navigate to="/founders" replace />} />
            <Route path="/admin/fintech" element={<Navigate to="/fintech" replace />} />
            <Route path="/admin/proposals" element={<Navigate to="/proposals" replace />} />
            <Route path="/admin/services" element={<Navigate to="/services" replace />} />
            <Route path="/admin/server" element={<Navigate to="/server" replace />} />
            <Route path="/admin/settings" element={<Navigate to="/settings" replace />} />
            <Route path="/dashboard/*" element={<Navigate to="/" replace />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
