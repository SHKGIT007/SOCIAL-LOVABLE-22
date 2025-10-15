import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import { isAdmin, isAuthenticated } from "@/utils/auth";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        toast({
          title: "Error",
          description: data.message || "Failed to fetch users.",
          variant: "destructive",
        });
        return;
      }
      
    } catch (error: any) {
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
      navigate("/login");
      return;
    }

    if (!isAdmin()) {
      navigate("/unauthorized");
      return;
    }

    fetchUsers();
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  // console.log("Users data: ", users);

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
          <p className="text-muted-foreground">View and manage all registered users</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>Complete list of registered users</CardDescription>
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
