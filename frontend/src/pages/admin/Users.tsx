import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import { isAdmin, isAuthenticated } from "@/utils/auth";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Swal from "sweetalert2";
import { User, CreditCard } from "lucide-react"; // Added Icons
import { Switch } from "@/components/ui/switch";
import EditUserModal from "./EditUser";

interface UserData {
  id: string;
  email: string;
  user_phone: string | null;
  user_name: string | null;
  created_at: string;
  role: string;
  subscription: {
    plan: {
      name: string;
    } | null;
    status: string;
  } | null;
  active_status: boolean;
}

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

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

      if (data.status === true) {
        setUsers(data?.data?.users || []);
      } else {
        setUsers([]);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to fetch users.",
          confirmButtonColor: "#6366f1",
        });
        return;
      }
    } catch (error: any) {
      // Improved error handling to redirect on failed auth check
      if (error.message === "Authentication failed" || error.status === 401) {
        navigate("/auth");
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to fetch users.",
        confirmButtonColor: "#6366f1",
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

  const handleUpdateUserStatus = async (
    userId: string,
    newStatus: boolean,
    oldStatus: boolean
  ) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to mark this user as ${
        newStatus ? "Active" : "Inactive"
      }.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update",
    });

    if (!result.isConfirmed) {
      // ❗ Toggle ko previous value par wapas set karna
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, active_status: oldStatus } : u
        )
      );
      return;
    }

    try {
      const data = await apiService.updateUserStatus(userId, {
        active_status: newStatus,
      });

      if (data.status === true) {
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "User status updated successfully.",
          confirmButtonColor: "#6366f1",
        });
        fetchUsers();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to update user status.",
          confirmButtonColor: "#6366f1",
        });

        // ❗ API fail → toggle revert back
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, active_status: oldStatus } : u
          )
        );
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to update user status.",
        confirmButtonColor: "#6366f1",
      });

      // ❗ Error → toggle revert back
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, active_status: oldStatus } : u
        )
      );
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const data = await apiService.deleteUser(userId);

      if (data.status === true) {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "User has been deleted successfully.",
          confirmButtonColor: "#6366f1",
        });

        fetchUsers(); // Refresh list
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to delete user.",
          confirmButtonColor: "#6366f1",
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Something went wrong.",
        confirmButtonColor: "#6366f1",
      });
    }
  };

  const filteredUsers = users.filter((u) => {
    const s = search.toLowerCase();

    return (
      u.user_name?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      u.user_phone?.toLowerCase().includes(s)
    );
  });

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
            <span
              className={`text-transparent bg-clip-text ${primaryGradientClass}`}
            >
              Users
            </span>{" "}
            Management
          </h1>
          <p className="text-lg text-gray-600">
            View and manage all registered users on the platform.
          </p>
        </div>

        {/* Users Table Card (Themed) */}
        <Card className="shadow-lg border-2 border-indigo-100/50">
          <CardHeader className="flex flex-row items-center justify-between">
            {/* 🔍 Search Input (LEFT) */}
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              className="border px-3 py-2 rounded-md w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* Buttons (RIGHT) */}
            <div className="flex gap-3">
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 shadow-md"
                onClick={() => navigate("/admin/deleted-users")}
              >
                <User className="mr-2 h-4 w-4" /> Deleted User
              </Button>

              <Button
                className="bg-indigo-600 hover:bg-indigo-700 shadow-md"
                onClick={() => navigate("/admin/create-user")}
              >
                <User className="mr-2 h-4 w-4" /> Create User
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  {/* <TableHead>Role</TableHead> */}
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers &&
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user?.user_name || "N/A"}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user?.user_phone || "N/A"}</TableCell>
                      {/* <TableCell>
                        <Badge
                          variant={
                            user.role === "admin" ? "default" : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell> */}
                      <TableCell>
                        {user.subscription?.plan ? (
                          <>
                            {user.subscription.plan.name}{" "}
                            <Badge
                              variant={
                                user.subscription.status === "active"
                                  ? "default"
                                  : "destructive"
                              }
                              className="ml-1"
                            >
                              {user.subscription.status === "active"
                                ? "Active"
                                : user.subscription.status}
                            </Badge>
                          </>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={user.active_status}
                            onCheckedChange={(value) =>
                              handleUpdateUserStatus(
                                user.id,
                                value,
                                user.active_status
                              )
                            }
                          />

                          <span
                            className={
                              user.active_status
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {/* {user.active_status ? "Active" : "Inactive"} */}
                          </span>
                        </div>
                      </TableCell>

                      {/* <TableCell>
                        <Badge
                          variant={
                            user.subscription?.status === "active"
                              ? "default"
                              : "outline"
                          }
                        >
                          {user.subscription?.status || "inactive"}
                        </Badge>
                      </TableCell> */}

                      <TableCell className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                        >
                          View
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setEditModalOpen(true);
                          }}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <EditUserModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          userId={selectedUserId}
          apiService={apiService}
          onUpdated={fetchUsers}
        />
      </div>
    </DashboardLayout>
  );
};

export default Users;
