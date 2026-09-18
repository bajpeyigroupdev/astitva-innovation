import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";

export const WebsiteApp = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/services" element={<HomePage />} />
      <Route path="/fintech" element={<HomePage />} />
      <Route path="/case-studies" element={<HomePage />} />
      <Route path="/contact" element={<HomePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default WebsiteApp;
