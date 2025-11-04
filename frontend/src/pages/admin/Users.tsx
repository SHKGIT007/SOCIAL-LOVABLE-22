import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import { isAdmin, isAuthenticated } from "@/utils/auth";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Swal from "sweetalert2";
import { User, CreditCard } from "lucide-react"; // Added Icons

interface UserData {
  id: string;
  email: string;
  user_name: string | null;
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
      const data = await apiService.getAllUsers();

      if(data.status === true){
       setUsers(data?.data?.users || []);
      }else{
        setUsers([]);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to fetch users.",
          confirmButtonColor: "#6366f1"
        });
        return;
      }
      
    } catch (error: any) {
      // Improved error handling to redirect on failed auth check
      if (error.message === 'Authentication failed' || error.status === 401) {
         navigate("/auth");
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to fetch users.",
        confirmButtonColor: "#6366f1"
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

  // console.log("Users data: ", users);

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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users && users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user?.user_name || "N/A"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.subscription?.plan?.name || "No plan"}</TableCell>
                    <TableCell>
                      <Badge variant={user.subscription?.status === "active" ? "default" : "outline"}>
                        {user.subscription?.status || "inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Users;