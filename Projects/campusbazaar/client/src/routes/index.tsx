import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { NotFoundPage } from "@/components/layout/NotFoundPage";
import { Spinner } from "@/components/layout/Page";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { HomePage } from "@/features/home";

const AuthPage = lazy(() => import("@/features/auth/AuthPage").then((m) => ({ default: m.AuthPage })));
const BrowsePage = lazy(() => import("@/features/listings/BrowsePage").then((m) => ({ default: m.BrowsePage })));
const ListingDetailPage = lazy(() =>
  import("@/features/listings/ListingDetailPage").then((m) => ({ default: m.ListingDetailPage })),
);
const CreateListingPage = lazy(() =>
  import("@/features/listings/CreateListingPage").then((m) => ({ default: m.CreateListingPage })),
);
const CategoryPage = lazy(() => import("@/features/category/CategoryPage").then((m) => ({ default: m.CategoryPage })));
const ProfilePage = lazy(() => import("@/features/profile/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const MessagesPage = lazy(() => import("@/features/messages/MessagesPage").then((m) => ({ default: m.MessagesPage })));
const SavedPage = lazy(() => import("@/features/saved/SavedPage").then((m) => ({ default: m.SavedPage })));
const NotificationsPage = lazy(() =>
  import("@/features/notifications/NotificationsPage").then((m) => ({ default: m.NotificationsPage })),
);
const SettingsPage = lazy(() => import("@/features/settings/SettingsPage").then((m) => ({ default: m.SettingsPage })));
const AdminDashboardPage = lazy(() =>
  import("@/features/admin/AdminPages").then((m) => ({ default: m.AdminDashboardPage })),
);
const AdminActivityPage = lazy(() =>
  import("@/features/admin/AdminPages").then((m) => ({ default: m.AdminActivityPage })),
);
const AdminListings = lazy(() => import("@/features/admin/AdminPages").then((m) => ({ default: m.AdminDashboardPage })));
const AdminUsers = lazy(() => import("@/features/admin/AdminPages").then((m) => ({ default: m.AdminDashboardPage })));
const AdminReports = lazy(() => import("@/features/admin/AdminPages").then((m) => ({ default: m.AdminDashboardPage })));
const AdminCategories = lazy(() =>
  import("@/features/admin/AdminPages").then((m) => ({ default: m.AdminDashboardPage })),
);
const AdminSettings = lazy(() =>
  import("@/features/admin/AdminPages").then((m) => ({ default: m.AdminDashboardPage })),
);

function PageSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[60dvh] place-items-center">
          <div className="flex flex-col items-center gap-2">
            <Spinner size={18} />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
              LOADING…
            </span>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="browse" element={<PageSuspense><BrowsePage /></PageSuspense>} />
          <Route path="listing/:id" element={<PageSuspense><ListingDetailPage /></PageSuspense>} />
          <Route path="c/:slug" element={<PageSuspense><CategoryPage /></PageSuspense>} />
          <Route path="discover/:slug" element={<PageSuspense><CategoryPage /></PageSuspense>} />

          <Route element={<ProtectedRoute />}>
            <Route path="sell" element={<PageSuspense><CreateListingPage /></PageSuspense>} />
            <Route path="edit/:id" element={<PageSuspense><CreateListingPage /></PageSuspense>} />
            <Route path="messages" element={<PageSuspense><MessagesPage /></PageSuspense>} />
            <Route path="saved" element={<PageSuspense><SavedPage /></PageSuspense>} />
            <Route path="notifications" element={<PageSuspense><NotificationsPage /></PageSuspense>} />
            <Route path="settings" element={<PageSuspense><SettingsPage /></PageSuspense>} />
            <Route path="u/:username" element={<PageSuspense><ProfilePage /></PageSuspense>} />
          </Route>

          <Route path="profile" element={<Navigate to="/u/aarav_x" replace />} />
          <Route path="auth" element={<PageSuspense><AuthPage /></PageSuspense>} />

          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<PageSuspense><AdminDashboardPage /></PageSuspense>} />
            <Route path="activity" element={<PageSuspense><AdminActivityPage /></PageSuspense>} />
            <Route path="reports" element={<PageSuspense><AdminReports /></PageSuspense>} />
            <Route path="listings" element={<PageSuspense><AdminListings /></PageSuspense>} />
            <Route path="users" element={<PageSuspense><AdminUsers /></PageSuspense>} />
            <Route path="categories" element={<PageSuspense><AdminCategories /></PageSuspense>} />
            <Route path="settings" element={<PageSuspense><AdminSettings /></PageSuspense>} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
