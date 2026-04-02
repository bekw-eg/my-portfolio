import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';

// Pages
import HomePage from './pages/HomePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import ProjectDetailPage from './pages/ProjectDetailPage.jsx';
import SkillsPage from './pages/SkillsPage.jsx';
import ExperiencePage from './pages/ExperiencePage.jsx';
import EducationPage from './pages/EducationPage.jsx';
import CertificatesPage from './pages/CertificatesPage.jsx';
import BlogPage from './pages/BlogPage.jsx';
import BlogPostPage from './pages/BlogPostPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardBuilderPage from './pages/DashboardBuilderPage.jsx';
import OnboardingPage from './pages/dashboard/OnboardingPage.jsx';
import DashboardPage from './pages/admin/DashboardPage.jsx';
import AdminProjectsPage from './pages/admin/AdminProjectsPage.jsx';
import AdminBlogPage from './pages/admin/AdminBlogPage.jsx';
import AdminCertificatesPage from './pages/admin/AdminCertificatesPage.jsx';
import AdminContactsPage from './pages/admin/AdminContactsPage.jsx';
import AdminSkillsPage from './pages/admin/AdminSkillsPage.jsx';
import AdminProfilePage from './pages/admin/AdminProfilePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';
import PublicPortfolioPage from './pages/PublicPortfolioPage.jsx';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, authLoading, isSuperAdmin, isPortfolioAdmin } = useApp();
  if (authLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isSuperAdmin) return <Navigate to="/" replace />;
  if (!adminOnly && !isPortfolioAdmin && !isSuperAdmin) return <Navigate to="/" replace />;
  return children;
}

function PageLoader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );
}

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 'var(--nav-height)' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
      <Route path="/projects" element={<PublicLayout><ProjectsPage /></PublicLayout>} />
      <Route path="/projects/:slug" element={<PublicLayout><ProjectDetailPage /></PublicLayout>} />
      <Route path="/skills" element={<PublicLayout><SkillsPage /></PublicLayout>} />
      <Route path="/experience" element={<PublicLayout><ExperiencePage /></PublicLayout>} />
      <Route path="/education" element={<PublicLayout><EducationPage /></PublicLayout>} />
      <Route path="/certificates" element={<PublicLayout><CertificatesPage /></PublicLayout>} />
      <Route path="/blog" element={<PublicLayout><BlogPage /></PublicLayout>} />
      <Route path="/blog/:slug" element={<PublicLayout><BlogPostPage /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/u/:username" element={<PublicPortfolioPage />} />
      <Route path="/portfolio/:username" element={<PublicPortfolioPage />} />

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute adminOnly>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="projects" element={<AdminProjectsPage />} />
        <Route path="blog" element={<AdminBlogPage />} />
        <Route path="certificates" element={<AdminCertificatesPage />} />
        <Route path="contacts" element={<AdminContactsPage />} />
        <Route path="skills" element={<AdminSkillsPage />} />
        <Route path="profile" element={<AdminProfilePage />} />
      </Route>

      {/* Builder dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <PublicLayout><DashboardBuilderPage /></PublicLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/onboarding"
        element={
          <ProtectedRoute>
            <PublicLayout><OnboardingPage /></PublicLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '12px 16px',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: '0.9rem',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            },
          }}
        />
      </BrowserRouter>
    </AppProvider>
  );
}
