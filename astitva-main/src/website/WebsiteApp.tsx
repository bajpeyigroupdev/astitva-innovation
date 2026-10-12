import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import FoundersPage from "./pages/FoundersPage";
import CareersPage from "./pages/CareersPage";
import PrivacyPolicyPage from "./pages/policies/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/policies/TermsOfServicePage";
import RefundPolicyPage from "./pages/policies/RefundPolicyPage";
import SecurityPolicyPage from "./pages/policies/SecurityPolicyPage";
import CookiePolicyPage from "./pages/policies/CookiePolicyPage";

export const WebsiteApp = () => {
  return (
    <Routes>
      {/* Primary Landing Page & In-Page Anchors */}
      <Route path="/" element={<HomePage />} />
      <Route path="/services" element={<HomePage />} />
      <Route path="/products" element={<HomePage />} />
      <Route path="/fintech" element={<HomePage />} />
      <Route path="/case-studies" element={<HomePage />} />
      <Route path="/contact" element={<HomePage />} />

      {/* Dedicated Executive Leadership & Careers Portals */}
      <Route path="/founders" element={<FoundersPage />} />
      <Route path="/careers" element={<CareersPage />} />

      {/* Dedicated Compliance, Security & Legal Policy Pages */}
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms-of-service" element={<TermsOfServicePage />} />
      <Route path="/refund-policy" element={<RefundPolicyPage />} />
      <Route path="/security-policy" element={<SecurityPolicyPage />} />
      <Route path="/cookie-policy" element={<CookiePolicyPage />} />

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default WebsiteApp;
