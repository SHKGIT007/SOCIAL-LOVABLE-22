import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import { isAdmin, isAuthenticated } from "@/utils/auth";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const DeletedUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const primaryGradient = "from-red-600 to-rose-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const fetchDeletedUsers = async () => {
    try {
      const data = await apiService.getDeletedUsers();
      if (data.status) {
        setUsers(data.data.users || []);
      }
    } catch (err) {
      navigate("/auth");
    } finally {
      setIsLoading(false);
    }
  };

  const checkAdminAndFetch = () => {
    if (!isAuthenticated()) return navigate("/auth");
    if (!isAdmin()) return navigate("/dashboard");
    fetchDeletedUsers();
  };

  //   const handleRestoreUser = async (id) => {
  //     const confirm = await Swal.fire({
  //       title: "Restore User?",
  //       text: "This will restore the user and make them active again.",
  //       icon: "warning",
  //       showCancelButton: true,
  //       confirmButtonColor: "#6366f1",
  //       cancelButtonColor: "#d33",
  //       confirmButtonText: "Yes, restore",
  //     });

  //     if (!confirm.isConfirmed) return;

  //     try {
  //       const data = await apiService.updateUser(id, {
  //         is_deleted: false,
  //         deleted_at: null,
  //       });

  //       if (data.status) {
  //         Swal.fire("Restored", "User restored successfully", "success");
  //         fetchDeletedUsers();
  //       }
  //     } catch (err) {
  //       Swal.fire("Error", "Failed to restore user", "error");
  //     }
  //   };

  const filtered = users.filter((u) => {
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
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin h-12 w-12 border-b-4 border-red-600 rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
        <div className="pb-4 border-b">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">
            Deleted Users
          </h1>
          <p className="text-gray-600 text-lg">
            {/* Users moved to trash (Soft Deleted) */}
          </p>
        </div>

        <Card className="shadow-lg border-2 border-red-200/50">
          <CardHeader className="flex justify-between ">
            <input
              type="text"
              placeholder="Search deleted users..."
              className="border px-3 py-2 rounded-md w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  {/* <TableHead>Status</TableHead> */}
                  <TableHead>Deleted At</TableHead>
                  {/* <TableHead>Actions</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.user_name || "N/A"}</TableCell>
                    <TableCell>{u.user_fname || "N/A"}</TableCell>
                    <TableCell>{u.user_lname || "N/A"}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.user_phone || "N/A"}</TableCell>
                    {/* <TableCell>
                      <Badge variant="destructive">Deleted</Badge>
                    </TableCell> */}
                    <TableCell>
                      {u.deleted_at
                        ? new Date(u.deleted_at).toLocaleString()
                        : "-"}
                    </TableCell>
                    {/* <TableCell className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-600 text-green-600"
                        onClick={() => handleRestoreUser(u.id)}
                      >
                        Restore
                      </Button>
                    </TableCell> */}
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

export default DeletedUsers;
