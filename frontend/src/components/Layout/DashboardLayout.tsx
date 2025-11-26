import { ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import {
  getCurrentUser,
  getUserRole,
  isAuthenticated,
  logout,
  onAuthStateChange,
} from "@/utils/auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
} from "lucide-react"; // Added Zap
import Swal from "sweetalert2";
// --- No data or logic removed ---

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: "admin" | "client";
}

const DashboardLayout = ({ children, userRole }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation(); // Used to determine active link
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(getCurrentUser());

  // Define the primary gradient class for theme consistency
  const primaryGradient = "from-indigo-600 to-cyan-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;

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
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out from your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6366F1",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Logout",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/auth");

        Swal.fire({
          title: "Logged Out",
          text: "You have been successfully logged out.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const menuItems =
    userRole === "admin"
      ? [
          { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
          { icon: Users, label: "Users", path: "/admin/users" },
          // { icon: Users, label: "Deleted Users", path: "/admin/deleted-users" },
          { icon: FileText, label: "Posts", path: "/admin/posts" },
          { icon: Settings, label: "Plans", path: "/admin/plans" },
          {
            icon: Settings,
            label: "Subscriptions",
            path: "/admin/subscriptions",
          },
          {
            icon: Zap,
            label: "System Settings",
            path: "/admin/system-settings",
          },
        ]
      : [
          { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
          { icon: FileText, label: "Posts", path: "/posts" },
          { icon: Zap, label: "Auto Post Schedules", path: "/schedules" },
          { icon: Settings, label: "Plans", path: "/plans" },
          {
            icon: Settings,
            label: "Social Accounts",
            path: "/social-accounts",
          },
          { icon: Settings, label: "Post Setting", path: "/profile" },
          { icon: Settings, label: "My Profile", path: "/update-profile" },
        ];

  return (
    // Base background is light gray for contrast with the white cards/layout
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button (Themed) */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          // Use a strong color for visibility
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/50"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar (Themed) */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 transform bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out shadow-xl ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header (Branding) */}
          <div className="flex h-16 items-center border-b border-gray-100 px-6">
            <Zap className="h-6 w-6 mr-2 text-indigo-600" />
            <h1 className="text-xl font-extrabold">
              {/* Apply gradient to the brand text */}
              <span
                className={`text-transparent bg-clip-text ${primaryGradientClass}`}
              >
                SocialPost AI
              </span>
            </h1>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  // Active state uses solid color, hover uses light background
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md" // Active style
                      : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600" // Inactive style
                  }`}
                  onClick={() => {
                    navigate(item.path);
                    setIsSidebarOpen(false);
                  }}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* User Info and Sign Out */}
          <div className="border-t border-gray-100 p-4">
            <div className="mb-4 rounded-lg bg-indigo-50 p-3 shadow-sm">
              <p className="text-sm font-semibold text-gray-800">
                {user?.email}
              </p>
              <p className="text-xs text-indigo-600 capitalize">
                {getUserRole()} Account
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full border-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition-colors"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64">
        {/* The content area will naturally pick up the dashboard's light/white theme */}
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">{children}</div>
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
