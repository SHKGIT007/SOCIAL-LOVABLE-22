import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/AuthManagement/Auth";
import CompleteSocialSignup from "./pages/CompleteSocialSignup";
import ForgotPassword from "./pages/AuthManagement/ForgotPassword";
import VerifyOTP from "./pages/AuthManagement/VerifyOTP";
import ResetPassword from "./pages/AuthManagement/ResetPassword";
import Dashboard from "./pages/ClientManagement/DashBoardManagement/Dashboard";
import Posts from "./pages/ClientManagement/PostManagement/Posts";
import NewPost from "./pages/ClientManagement/PostManagement/NewPost";
import ViewPost from "./pages/ClientManagement/PostManagement/ViewPost";
import EditPost from "./pages/ClientManagement/PostManagement/EditPost";
import ClientPlans from "./pages/ClientManagement/PlanManagement/ClientPlans";
import AdminDashboard from "./pages/admin/Dashboard/AdminDashboard";
import AdminPlans from "./pages/admin/PlanManagement/Plans";
import AdminUsers from "./pages/admin/UserManagement/Users";
import UserDetails from "@/pages/admin/UserManagement/UserDetails";
import UserAnalytics from "@/pages/admin/ReportManagement/UserAnalytics";
import AdminSubscriptions from "./pages/admin/SubscriptionManagement/Subscriptions";
import AdminPosts from "./pages/admin/PostManagement/Posts";
import AdminViewPost from "./pages/admin/PostManagement/ViewPost";
import NotFound from "./pages/NotFound";
import SystemSettings from "./pages/admin/SystemSetting/SystemSettings";
import SocialAccounts from "./pages/ClientManagement/SocialAccountsManagement/SocialAccounts";
import Profile from "./pages/ClientManagement/ProfileManagement/Profile";
import UserSchedules from "./pages/ClientManagement/AutoPostSchedual/UserSchedules";
import { getAuthData, isAuthenticated } from "@/utils/auth";
import CreateUser from "./pages/admin/UserManagement/CreateUser";
import DeletedUsers from "./pages/admin/UserManagement/DeletedUsers";
import UpdateProfile from "./pages/ClientManagement/ProfileManagement/UpdateProfile";
import Report from "./pages/admin/ReportManagement/Report";
import UserPostsReport from "./pages/admin/ReportManagement/UserPostReports";
import EditUser from "./pages/admin/UserManagement/EditUser";
import CreatePlanPage from "./pages/admin/PlanManagement/CreatePlan";
import EditPlanPage from "./pages/admin/PlanManagement/EditPlan";
import NotificationsPage from "./pages/NotificationsPage";
import { useEffect } from "react";
import socket from "@/utils/socket";
import SocketToast from "@/components/SocketToast";

const queryClient = new QueryClient();

// Protected Route Component for Client
function ClientRoute({ children }: { children: React.ReactNode }) {
  const authData = getAuthData();
  const userRole = authData?.user?.user_type;

  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }

  if (userRole === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

// Protected Route Component for Admin
function AdminRoute({ children }: { children: React.ReactNode }) {
  const authData = getAuthData();
  const userRole = authData?.user?.user_type;

  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }

  if (userRole !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {

useEffect(() => {

  const authData = getAuthData();
  const userId = authData?.user?.id;
  const userType = authData?.user?.user_type;

  socket.connect();

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);

    if (userId) {
      socket.emit("register", userId, userType);
    }
  });

}, []);





  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
         
        <BrowserRouter>
         <SocketToast />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/complete-social-signup" element={<CompleteSocialSignup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Client Routes */}
            <Route path="/dashboard" element={<ClientRoute><Dashboard /></ClientRoute>} />
            <Route path="/notifications" element={<ClientRoute><NotificationsPage /></ClientRoute>} />
            <Route path="/social-accounts" element={<ClientRoute><SocialAccounts /></ClientRoute>} />
            <Route path="/posts" element={<ClientRoute><Posts /></ClientRoute>} />
            <Route path="/posts/new" element={<ClientRoute><NewPost /></ClientRoute>} />
            <Route path="/posts/:id" element={<ClientRoute><ViewPost /></ClientRoute>} />
            <Route path="/posts/edit/:id" element={<ClientRoute><EditPost /></ClientRoute>} />
            <Route path="/plans" element={<ClientRoute><ClientPlans /></ClientRoute>} />
            <Route path="/profile" element={<ClientRoute><Profile /></ClientRoute>} />
            <Route path="/schedules" element={<ClientRoute><UserSchedules /></ClientRoute>} />
            <Route path="/update-profile" element={<ClientRoute><UpdateProfile /></ClientRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/notifications" element={<AdminRoute><NotificationsPage /></AdminRoute>} />
            <Route path="/admin/plans" element={<AdminRoute><AdminPlans /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/users/:userId" element={<AdminRoute><UserAnalytics /></AdminRoute>} />
            <Route path="/admin/users/details/:id" element={<AdminRoute><UserDetails /></AdminRoute>} />
            <Route path="/admin/subscriptions" element={<AdminRoute><AdminSubscriptions /></AdminRoute>} />
            <Route path="/admin/posts" element={<AdminRoute><AdminPosts /></AdminRoute>} />
            <Route path="/admin/posts/:id" element={<AdminRoute><AdminViewPost /></AdminRoute>} />
            <Route path="/admin/system-settings" element={<AdminRoute><SystemSettings /></AdminRoute>} />
            <Route path="/admin/create-user" element={<AdminRoute><CreateUser/></AdminRoute>} />
            <Route path="/admin/deleted-users" element={<AdminRoute><DeletedUsers /></AdminRoute>} />
            <Route path="/admin/report" element={<AdminRoute><Report /></AdminRoute>} />
            <Route path="/admin/userpostreports/user/:userId/posts" element={<AdminRoute><UserPostsReport /></AdminRoute>} />
            <Route path="/admin/edituser/:userId" element={<AdminRoute><EditUser /></AdminRoute>} />
            <Route path="/admin/create-plan" element={<AdminRoute><CreatePlanPage /></AdminRoute>} />
            <Route path="/admin/edit-plan/:planId" element={<AdminRoute><EditPlanPage /></AdminRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;