import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Login } from '@/pages/auth/Login';
import { Signup } from '@/pages/auth/Signup';
import { UrlInputScreen } from '@/pages/onboarding/UrlInputScreen';
import { BrandAnalyzingScreen } from '@/pages/onboarding/BrandAnalyzingScreen';
import { BrandReviewScreen } from '@/pages/onboarding/BrandReviewScreen';
import { StyleSelectionScreen } from '@/pages/onboarding/StyleSelectionScreen';
import { ContentPlanScreen } from '@/pages/onboarding/ContentPlanScreen';
import { TopicGenerationScreen } from '@/pages/onboarding/TopicGenerationScreen';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardOverview } from '@/pages/dashboard/DashboardOverview';
import { CalendarView } from '@/pages/dashboard/CalendarView';
import { BrandKit } from '@/pages/dashboard/BrandKit';
import { Insights } from '@/pages/dashboard/Insights';
import { SocialConnect } from '@/pages/dashboard/SocialConnect';
import { Approvals } from '@/pages/dashboard/Approvals';
import { PaidAds } from '@/pages/dashboard/PaidAds';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard/*"
            element={
              <AuthGuard>
                <Routes>
                  <Route element={<DashboardLayout />}>
                    <Route index element={<DashboardOverview />} />
                    <Route path="calendar" element={<CalendarView />} />
                    <Route path="integrations" element={<SocialConnect />} />
                    <Route path="approvals" element={<Approvals />} />
                    <Route path="paid-ads" element={<PaidAds />} />
                    <Route path="brand-kit" element={<BrandKit />} />
                    <Route path="content-plan" element={<div className="p-8 text-2xl font-bold">Content Strategy</div>} />
                    <Route path="insights" element={<Insights />} />
                  </Route>
                </Routes>
              </AuthGuard>
            }
          />
          <Route
            path="/onboarding/*"
            element={
              <AuthGuard>
                <Routes>
                  <Route path="start" element={<UrlInputScreen />} />
                  <Route path="analyzing" element={<BrandAnalyzingScreen />} />
                  <Route path="review" element={<BrandReviewScreen />} />
                  <Route path="style" element={<StyleSelectionScreen />} />
                  <Route path="plan" element={<ContentPlanScreen />} />
                  <Route path="generating" element={<TopicGenerationScreen />} />
                </Routes>
              </AuthGuard>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
