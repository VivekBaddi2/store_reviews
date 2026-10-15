import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components.jsx";
import { useAuth } from "./context/useAuth.js";
import { ROLE_PATHS } from "./lib/roles.js";
import { AdminPage } from "./pages/AdminPage.jsx";
import { AuthPage } from "./pages/AuthPage.jsx";
import { OwnerPage } from "./pages/OwnerPage.jsx";
import { PasswordPage } from "./pages/PasswordPage.jsx";
import { StoresPage } from "./pages/StoresPage.jsx";

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? ROLE_PATHS[user.role] || "/login" : "/login"} replace />;
}

function PublicOnlyRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to={ROLE_PATHS[user.role] || "/login"} replace />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<PublicOnlyRoute><AuthPage mode="login" /></PublicOnlyRoute>} />
      <Route path="/signup" element={<PublicOnlyRoute><AuthPage mode="signup" /></PublicOnlyRoute>} />
      <Route path="/stores" element={<ProtectedRoute roles={["Normal User"]}><StoresPage /></ProtectedRoute>} />
      <Route path="/owner" element={<ProtectedRoute roles={["Store Owner"]}><OwnerPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute roles={["System Administrator"]}><AdminPage /></ProtectedRoute>} />
      <Route path="/password" element={<ProtectedRoute><PasswordPage /></ProtectedRoute>} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

export default App;
