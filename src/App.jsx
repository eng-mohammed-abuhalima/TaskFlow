import { Navigate, Route, Routes } from "react-router-dom";
import { DirectionProvider } from "@radix-ui/react-direction";
import { usePreferences } from "./hooks/usePreferences.js";
import Placeholder from "./pages/Placeholder.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  const prefs = usePreferences();
  const { t, dir } = prefs;
  return (
    <DirectionProvider dir={dir}>
      <Routes>
        {/* TODO: redirect to /dashboard when signed in (after Firebase Auth) */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={<Placeholder title={t("Log in", "تسجيل الدخول")} />}
        />
        <Route
          path="/register"
          element={<Placeholder title={t("Create account", "إنشاء حساب")} />}
        />
        <Route
          path="/dashboard"
          element={<Placeholder title={t("Dashboard", "لوحة التحكم")} />}
        />
        <Route
          path="/projects/new"
          element={<Placeholder title={t("New project", "مشروع جديد")} />}
        />
        <Route
          path="/projects/:id"
          element={<Placeholder title={t("Project", "المشروع")} />}
        />
        <Route
          path="/projects/:id/settings"
          element={
            <Placeholder title={t("Project settings", "إعدادات المشروع")} />
          }
        />
        <Route path="*" element={<NotFound t={t} />} />
      </Routes>
    </DirectionProvider>
  );
}
