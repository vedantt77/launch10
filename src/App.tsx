import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PageTransition } from '@/components/PageTransition';
import { FeaturePopup } from '@/components/FeaturePopup';
import { Skeleton } from '@/components/ui/skeleton';
import { PrivateRoute } from '@/components/PrivateRoute';

// Lazy load pages with prefetch
const LaunchPage = lazy(() => import('@/pages/LaunchPage').then(module => ({ default: module.LaunchPage })));
const BoostPage = lazy(() => import('@/pages/BoostPage').then(module => ({ default: module.BoostPage })));
const SharedLaunchPage = lazy(() => import('@/pages/SharedLaunchPage').then(module => ({ default: module.SharedLaunchPage })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then(module => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import('@/pages/SignupPage').then(module => ({ default: module.SignupPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage').then(module => ({ default: module.ForgotPasswordPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const SubmitStartupPage = lazy(() => import('@/pages/SubmitStartupPage').then(module => ({ default: module.SubmitStartupPage })));

// Prefetch routes
const prefetchRoutes = () => {
  const routes = [
    () => import('@/pages/LaunchPage'),
    () => import('@/pages/BoostPage'),
    () => import('@/pages/SharedLaunchPage'),
    () => import('@/pages/LoginPage'),
    () => import('@/pages/SignupPage'),
    () => import('@/pages/ForgotPasswordPage'),
    () => import('@/pages/ProfilePage'),
    () => import('@/pages/AdminDashboard'),
    () => import('@/pages/SubmitStartupPage')
  ];

  routes.forEach(route => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'script';
    link.href = route.toString();
    document.head.appendChild(link);
  });
};

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center">
      <div className="space-y-4 w-full max-w-3xl px-4">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  }, [pathname]);

  return null;
}

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    prefetchRoutes();
  }, []);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <PageTransition>
                <Suspense fallback={<LoadingFallback />}>
                  <LaunchPage />
                </Suspense>
              </PageTransition>
            } />
            <Route path="/boost" element={
              <PrivateRoute>
                <PageTransition>
                  <Suspense fallback={<LoadingFallback />}>
                    <BoostPage />
                  </Suspense>
                </PageTransition>
              </PrivateRoute>
            } />
            <Route path="/launch/:id" element={
              <PageTransition>
                <Suspense fallback={<LoadingFallback />}>
                  <SharedLaunchPage />
                </Suspense>
              </PageTransition>
            } />
            <Route path="/login" element={
              <PageTransition>
                <Suspense fallback={<LoadingFallback />}>
                  <LoginPage />
                </Suspense>
              </PageTransition>
            } />
            <Route path="/signup" element={
              <PageTransition>
                <Suspense fallback={<LoadingFallback />}>
                  <SignupPage />
                </Suspense>
              </PageTransition>
            } />
            <Route path="/forgot-password" element={
              <PageTransition>
                <Suspense fallback={<LoadingFallback />}>
                  <ForgotPasswordPage />
                </Suspense>
              </PageTransition>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <PageTransition>
                  <Suspense fallback={<LoadingFallback />}>
                    <ProfilePage />
                  </Suspense>
                </PageTransition>
              </PrivateRoute>
            } />
            <Route path="/admin" element={
              <PrivateRoute>
                <PageTransition>
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminDashboard />
                  </Suspense>
                </PageTransition>
              </PrivateRoute>
            } />
            <Route path="/submit" element={
              <PrivateRoute>
                <PageTransition>
                  <Suspense fallback={<LoadingFallback />}>
                    <SubmitStartupPage />
                  </Suspense>
                </PageTransition>
              </PrivateRoute>
            } />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <FeaturePopup />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ScrollToTop />
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
