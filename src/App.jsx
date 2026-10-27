import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AuthLayout from './components/auth/AuthLayout.jsx'
import { GuestOnly, RequireAuth } from './components/auth/AuthProvider.jsx'
import AdminLayout from './components/layout/AdminLayout.jsx'
import { PageLoader } from './components/ui/PageLoader.jsx'
import { DashboardSkeleton, ModuleSkeleton } from './components/ui/Skeleton.jsx'
import DashboardPage from './pages/DashboardPage.jsx'

const OrderManagementPage = lazy(() => import('./pages/OrderManagementPage.jsx'))
const RestaurantManagementPage = lazy(() => import('./pages/RestaurantManagementPage.jsx'))
const DeliveryPartnersPage = lazy(() => import('./pages/DeliveryPartnersPage.jsx'))
const CustomerManagementPage = lazy(() => import('./pages/CustomerManagementPage.jsx'))
const PaymentsFinancePage = lazy(() => import('./pages/PaymentsFinancePage.jsx'))
const OffersPromotionsPage = lazy(() => import('./pages/OffersPromotionsPage.jsx'))
const SupportReportsPage = lazy(() => import('./pages/SupportReportsPage.jsx'))
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'))
const LoginPage = lazy(() => import('./pages/auth/LoginPage.jsx'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage.jsx'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage.jsx'))
const VerifyCodePage = lazy(() => import('./pages/auth/VerifyCodePage.jsx'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage.jsx'))

const skeletons = {
  dashboard: <DashboardSkeleton />,
  orders: <ModuleSkeleton variant="table" tabs={6} />,
  restaurants: <ModuleSkeleton variant="cards" />,
  partners: <ModuleSkeleton variant="table" />,
  customers: <ModuleSkeleton variant="table" />,
  payments: <ModuleSkeleton variant="table" />,
  offers: <ModuleSkeleton variant="cards" />,
  support: <ModuleSkeleton variant="table" />,
  settings: <ModuleSkeleton variant="form" kpis={0} tabs={6} />,
}

const authPage = (Component) => (
  <Suspense fallback={<div className="auth-card-skeleton page-skeleton" aria-busy="true" aria-label="Loading" />}>
    <Component />
  </Suspense>
)

const page = (Component, kind) => (
  <Suspense fallback={skeletons[kind]}>
    <PageLoader skeleton={skeletons[kind]}>
      <Component />
    </PageLoader>
  </Suspense>
)

export default function App() {
  return (
    <Routes>
      <Route
        element={
          <GuestOnly>
            <AuthLayout />
          </GuestOnly>
        }
      >
        <Route path="login" element={authPage(LoginPage)} />
        <Route path="register" element={authPage(RegisterPage)} />
        <Route path="forgot-password" element={authPage(ForgotPasswordPage)} />
        <Route path="verify-code" element={authPage(VerifyCodePage)} />
        <Route path="reset-password" element={authPage(ResetPasswordPage)} />
      </Route>
      <Route
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={page(DashboardPage, 'dashboard')} />
        <Route path="orders" element={page(OrderManagementPage, 'orders')} />
        <Route path="restaurants" element={page(RestaurantManagementPage, 'restaurants')} />
        <Route path="delivery-partners" element={page(DeliveryPartnersPage, 'partners')} />
        <Route path="customers" element={page(CustomerManagementPage, 'customers')} />
        <Route path="payments" element={page(PaymentsFinancePage, 'payments')} />
        <Route path="offers" element={page(OffersPromotionsPage, 'offers')} />
        <Route path="support" element={page(SupportReportsPage, 'support')} />
        <Route path="settings" element={page(SettingsPage, 'settings')} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
