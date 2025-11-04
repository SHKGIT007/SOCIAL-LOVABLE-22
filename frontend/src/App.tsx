import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
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
import { Navigate } from "react-router-dom";
import { getAuthData } from "@/utils/auth";
function getUserRole() {
  const auth = getAuthData && getAuthData();
  return auth?.user?.role || null;
}

const queryClient = new QueryClient();


function App() {
  const userRole = getUserRole();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={userRole === "client" ? <Dashboard /> : <Navigate to="/admin" />} />
            <Route path="/social-accounts" element={userRole === "client" ? <SocialAccounts /> : <Navigate to="/admin" />} />
            <Route path="/posts" element={userRole === "client" ? <Posts /> : <Navigate to="/admin" />} />
            <Route path="/posts/new" element={userRole === "client" ? <NewPost /> : <Navigate to="/admin" />} />
            <Route path="/posts/:id" element={userRole === "client" ? <ViewPost /> : <Navigate to="/admin" />} />
            <Route path="/posts/edit/:id" element={userRole === "client" ? <EditPost /> : <Navigate to="/admin" />} />
            <Route path="/plans" element={userRole === "client" ? <ClientPlans /> : <Navigate to="/admin" />} />
            <Route path="/profile" element={userRole === "client" ? <Profile /> : <Navigate to="/admin" />} />
            <Route path="/schedules" element={userRole === "client" ? <UserSchedules /> : <Navigate to="/admin" />} />
            <Route path="/admin" element={userRole === "admin" ? <AdminDashboard /> : <Navigate to="/dashboard" />} />
            <Route path="/admin/plans" element={userRole === "admin" ? <AdminPlans /> : <Navigate to="/dashboard" />} />
            <Route path="/admin/users" element={userRole === "admin" ? <AdminUsers /> : <Navigate to="/dashboard" />} />
            <Route path="/admin/users/:id" element={userRole === "admin" ? <UserDetails /> : <Navigate to="/dashboard" />} />
            <Route path="/admin/subscriptions" element={userRole === "admin" ? <AdminSubscriptions /> : <Navigate to="/dashboard" />} />
            <Route path="/admin/posts" element={userRole === "admin" ? <AdminPosts /> : <Navigate to="/dashboard" />} />
            <Route path="/admin/posts/:id" element={userRole === "admin" ? <AdminViewPost /> : <Navigate to="/dashboard" />} />
            <Route path="/admin/system-settings" element={userRole === "admin" ? <SystemSettings /> : <Navigate to="/dashboard" />} />
            
           
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
