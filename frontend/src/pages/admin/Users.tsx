import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "@/services/api";
import { isAdmin, isAuthenticated } from "@/utils/auth";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, CreditCard } from "lucide-react"; // Added Icons

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  role: string;
  subscription: {
    plan: {
      name: string;
    } | null;
    status: string;
  } | null;
}

const Users = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Define the primary gradient class for theme consistency
  const primaryGradient = "from-indigo-600 to-cyan-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;

  // --- Logic is preserved ---
  useEffect(() => {
    checkAdminAndFetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // NOTE: Assuming ApiService is correctly configured to use token for auth
      const api = new ApiService();
      // Ensure the API call is type-checked if needed, but the original logic is kept
      // For this example, I'll keep the original call method, ensuring logic is preserved.
      const data = await api.getAllUsers();
      setUsers(data || []);
    } catch (error: any) {
      // Improved error handling to redirect on failed auth check
      if (error.message === 'Authentication failed' || error.status === 401) {
         navigate("/auth");
      }
      toast({
        title: "Error",
        description: error.message || "Failed to fetch users.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkAdminAndFetchUsers = () => {
    if (!isAuthenticated()) {
      navigate("/auth"); // Changed from /login to /auth for consistency
      return;
    }

    if (!isAdmin()) {
      // Assuming /unauthorized exists or redirect to dashboard
      navigate("/dashboard");
      return;
    }

    fetchUsers();
  };
  // -------------------------

  if (isLoading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-full min-h-screen">
          {/* Thematic Loading Spinner */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Helper function to determine badge variant based on status
  const getSubscriptionBadge = (status: string | undefined) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'active':
        return <Badge className="bg-cyan-500 hover:bg-cyan-600">Active</Badge>;
      case 'trialing':
        return <Badge className="bg-amber-500 hover:bg-amber-600">Trial</Badge>;
      case 'canceled':
        return <Badge variant="destructive">Canceled</Badge>;
      default:
        return <Badge variant="outline">Inactive</Badge>;
    }
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
        
        {/* Header Section (Themed) */}
        <div className="pb-4 border-b border-gray-100">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            {/* Apply gradient to the title */}
            <span className={`text-transparent bg-clip-text ${primaryGradientClass}`}>Users</span> Management
          </h1>
          <p className="text-lg text-gray-600">View and manage all registered users on the platform.</p>
        </div>
        
        {/* Users Table Card (Themed) */}
        <Card className="shadow-lg border-2 border-indigo-100/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-xl font-bold text-gray-800">All Users ({users.length})</CardTitle>
                <CardDescription>Complete list of registered users and their details.</CardDescription>
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
                <User className="mr-2 h-4 w-4" /> Add New User
            </Button>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No users found.</div>
            ) : (
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[180px]">Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="hover:bg-indigo-50/20 transition-colors">
                                <TableCell className="font-semibold text-gray-800">
                                    {user.full_name || user.email.split('@')[0] || "N/A"}
                                </TableCell>
                                <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
                                <TableCell>
                                    {/* Thematic Role Badge */}
                                    <Badge 
                                        className={user.role === "admin" 
                                            ? "bg-indigo-600 hover:bg-indigo-700" 
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"}
                                    >
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium text-teal-700">{user.subscription?.plan?.name || "Free"}</TableCell>
                                <TableCell>
                                    {/* Thematic Subscription Status Badge */}
                                    {getSubscriptionBadge(user.subscription?.status)}
                                </TableCell>
                                <TableCell className="text-sm text-gray-500">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    {/* Thematic Action Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-indigo-400 text-indigo-600 hover:bg-indigo-50"
                                        onClick={() => navigate(`/admin/users/${user.id}`)}
                                    >
                                        View Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Users;