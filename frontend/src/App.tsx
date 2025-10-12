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
import AdminSubscriptions from "./pages/admin/Subscriptions";
import AdminPosts from "./pages/admin/Posts";
import AdminViewPost from "./pages/admin/ViewPost";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/posts/new" element={<NewPost />} />
          <Route path="/posts/:id" element={<ViewPost />} />
          <Route path="/posts/edit/:id" element={<EditPost />} />
          <Route path="/plans" element={<ClientPlans />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/plans" element={<AdminPlans />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
          <Route path="/admin/posts" element={<AdminPosts />} />
          <Route path="/admin/posts/:id" element={<AdminViewPost />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
