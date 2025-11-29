import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CompleteSocialSignup from "./pages/CompleteSocialSignup";
import Dashboard from "./pages/Dashboard";
import Posts from "./pages/Posts";
import NewPost from "./pages/NewPost";
import ViewPost from "./pages/ViewPost";
import EditPost from "./pages/EditPost";
import ClientPlans from "./pages/ClientPlans";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPlans from "./pages/admin/Plans";
import AdminUsers from "./pages/admin/Users";
import UserDetails from "@/pages/admin/UserDetails";
import AdminSubscriptions from "./pages/admin/Subscriptions";
import AdminPosts from "./pages/admin/Posts";
import AdminViewPost from "./pages/admin/ViewPost";
import NotFound from "./pages/NotFound";
import SystemSettings from "./pages/admin/SystemSettings";
import SocialAccounts from "./pages/SocialAccounts";
import Profile from "./pages/Profile";
import UserSchedules from "./pages/UserSchedules";
import { getAuthData, isAuthenticated } from "@/utils/auth";
import CreateUser from "./pages/admin/CreateUser";
import DeletedUsers from "./pages/admin/DeletedUsers";
import UpdateProfile from "./pages/UpdateProfile";

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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/complete-social-signup" element={<CompleteSocialSignup />} />
            
            {/* Client Routes */}
            <Route path="/dashboard" element={<ClientRoute><Dashboard /></ClientRoute>} />
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
            <Route path="/admin/plans" element={<AdminRoute><AdminPlans /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/users/:id" element={<AdminRoute><UserDetails /></AdminRoute>} />
            <Route path="/admin/subscriptions" element={<AdminRoute><AdminSubscriptions /></AdminRoute>} />
            <Route path="/admin/posts" element={<AdminRoute><AdminPosts /></AdminRoute>} />
            <Route path="/admin/posts/:id" element={<AdminRoute><AdminViewPost /></AdminRoute>} />
            <Route path="/admin/system-settings" element={<AdminRoute><SystemSettings /></AdminRoute>} />
            <Route path="/admin/create-user" element={<AdminRoute><CreateUser/></AdminRoute>} />
            <Route path="/admin/deleted-users" element={<AdminRoute><DeletedUsers /></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;