import { Navigate, Route, Routes } from 'react-router-dom';

import AppShell from './components/AppShell.jsx';
import { useAuth } from './auth.jsx';
import CoursesPage from './pages/CoursesPage.jsx';
import ContentPage from './pages/ContentPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import MessagesPage from './pages/MessagesPage.jsx';
import Setup from './pages/Setup.jsx';
import UsersPage from './pages/UsersPage.jsx';

export default function App() {
  const { loading, user, setupRequired } = useAuth();

  if (loading) {
    return (
      <div className="auth-screen">
        <p className="auth-loading">Opening the console…</p>
      </div>
    );
  }

  const entry = setupRequired ? '/setup' : '/login';

  return (
    <Routes>
      <Route
        path="/setup"
        element={user ? <Navigate to="/" replace /> : <Setup />}
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route element={user ? <AppShell /> : <Navigate to={entry} replace />}>
        <Route index element={<Dashboard />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="content" element={<ContentPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
