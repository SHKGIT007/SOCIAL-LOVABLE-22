import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import { isAdmin, isAuthenticated } from "@/utils/auth";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
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
import EditUserModal from "./EditUser";
import { Tab } from "@headlessui/react";

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
    plan_ai_posts: number | null;
    ai_posts_used: number | null;
  } | null;
  active_status: boolean;
}

const Report = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const primaryGradient = "from-indigo-600 to-cyan-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;

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
      navigate("/auth");
      return;
    }

    if (!isAdmin()) {
      navigate("/dashboard");
      return;
    }

    fetchUsers();
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
        <div className="pb-4 border-b border-gray-100">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            <span
              className={`text-transparent bg-clip-text ${primaryGradientClass}`}
            >
              Report
            </span>
          </h1>
        </div>

        <Card className="shadow-lg border-2 border-indigo-100/50">
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Plan Status</TableHead>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>AI Posts Used</TableHead>
                  <TableHead>Actions</TableHead>
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
                        {user?.subscription?.plan
                          ? (typeof user.subscription.plan === "string"
                              ? user.subscription.plan
                              : user.subscription.plan?.name)
                          : "N/A"}
                      </TableCell>
                        <TableCell>
                          {user?.subscription?.ai_posts_used ?? "N/A"}/
                          {user?.subscription?.plan_ai_posts ?? "N/A"}
                        </TableCell>
                      <TableCell className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/admin/reports/user/${user.id}/posts`)
                            }
                          >
                            View
                          </Button>
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

export default Report;
