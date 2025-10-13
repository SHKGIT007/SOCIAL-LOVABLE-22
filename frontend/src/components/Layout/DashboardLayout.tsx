import { ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getUserRole, isAuthenticated, logout, onAuthStateChange } from "@/utils/auth";
import ApiService from "@/services/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LayoutDashboard, FileText, Users, Settings, LogOut, Menu, X } from "lucide-react";
// ...existing code...

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: "admin" | "client";
}

const DashboardLayout = ({ children, userRole }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/auth");
    } else {
      setUser(getCurrentUser());
    }
    // Listen for auth changes (multi-tab)
    const cleanup = onAuthStateChange((authData) => {
      if (!authData || !authData.token) {
        navigate("/auth");
      } else {
        setUser(authData.user);
      }
    });
    return cleanup;
  }, [navigate]);

  const handleSignOut = () => {
    logout();
    navigate("/auth");
  };

  const menuItems = userRole === "admin" 
    ? [
        { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
        { icon: Users, label: "Users", path: "/admin/users" },
        { icon: FileText, label: "Posts", path: "/admin/posts" },
        { icon: Settings, label: "Plans", path: "/admin/plans" },
        { icon: Settings, label: "Subscriptions", path: "/admin/subscriptions" },
      ]
    : [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: FileText, label: "Posts", path: "/posts" },
        { icon: Settings, label: "Plans", path: "/plans" },
        { icon: Settings, label: "Social Accounts", path: "/social-accounts" },
      ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 transform bg-card border-r transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <h1 className="text-xl font-bold">SocialPost AI</h1>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>
          <div className="border-t p-4">
            <div className="mb-4 rounded-lg bg-muted p-3">
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{getUserRole()} Account</p>
            </div>
            <Button variant="outline" className="w-full" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">{children}</div>
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;