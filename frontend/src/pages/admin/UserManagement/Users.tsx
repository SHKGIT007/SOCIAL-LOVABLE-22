import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DataTable, { TableColumn } from "react-data-table-component";
import { apiService } from "@/services/api";
import { isAdmin, isAuthenticated } from "@/utils/auth";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import Swal from "sweetalert2";
import { User, X } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Card, CardContent } from "@/components/ui/card";

interface UserData {
  id: string;
  email: string;
  user_phone: string | null;
  user_name: string | null;
  created_at: string;
  role: string;
  subscription: {
    plan: { name: string } | null;
    status: string;
  } | null;
  active_status: boolean;
}

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const primaryGradient = "from-indigo-600 to-cyan-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;

  const fetchUsers = async (pageNumber = 1, pageSize = 10, searchTerm = "") => {
    setTableLoading(true);
    try {
      const data = await apiService.getAllUsers({
        page: pageNumber,
        limit: pageSize,
        search: searchTerm,
      });

      if (data.status) {
        setUsers(data.data.users || []);
        setTotalRows(data.data.pagination.total || 0);
      } else {
        setUsers([]);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to fetch users.",
          confirmButtonColor: "#6366f1",
        });
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
      setTableLoading(false);
    }
  };

  useEffect(() => {
    const times = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(times);
  }, [search]);

  // refresh the current list using the existing parameters
  const handleRefresh = () => {
    fetchUsers(page, perPage, debouncedSearch);
  };

  useEffect(() => {
    if (!isAuthenticated()) return navigate("/auth");
    if (!isAdmin()) return navigate("/dashboard");
    fetchUsers(page, perPage, debouncedSearch);
  }, [page, perPage, debouncedSearch]);

  const handleUpdateUserStatus = async (userId: string, newStatus: boolean) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to mark this user as ${newStatus ? "Active" : "Inactive"
        }.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update",
    });

    if (!result.isConfirmed) return;

    try {
      const data = await apiService.updateUserStatus(userId, {
        active_status: newStatus,
      });

      if (data.status) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "User status updated successfully.",
          confirmButtonColor: "#6366f1",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchUsers(page, perPage, search);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to update user status.",
          confirmButtonColor: "#6366f1",
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to update user status.",
        confirmButtonColor: "#6366f1",
      });
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

      if (data.status) {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "User has been deleted successfully.",
          confirmButtonColor: "#6366f1",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchUsers(page, perPage, search);
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
        text: error.message || "Failed to delete user.",
        confirmButtonColor: "#6366f1",
      });
    }
  };

  const exportExcel = async () => {
    try {
      setExportLoading(true);

      const data = await apiService.getAllUsers({
        page: 1,
        limit: 100000, // large number to get all
        search: debouncedSearch, // agar search hai to wahi lagega
      });

      if (!data.status || !data.data.users || data.data.users.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "No Data Found",
          text: "There is no data to export.",
          confirmButtonColor: "#6366f1",
        });
        return;
      }

      const excelData = data.data.users.map((u: UserData, index: number) => ({
        "S.No": index + 1,
        Name: u.user_name || "N/A",
        Email: u.email,
        Phone: u.user_phone || "N/A",
        Plan: u.subscription?.plan?.name || "N/A",
        Status: u.active_status ? "Active" : "Inactive",
        Joined: new Date(u.created_at).toLocaleDateString(),
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Users");

      const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(
        new Blob([buf]),
        debouncedSearch ? "filtered-users.xlsx" : "all-users.xlsx",
      );
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Export Failed",
        text: error.message || "Something went wrong while exporting.",
        confirmButtonColor: "#6366f1",
      });
    } finally {
      setExportLoading(false);
    }
  };

  const columns: TableColumn<UserData>[] = useMemo(
    () => [
      {
        name: "S.No",
        width: "70px",
        cell: (row, index) =>
          page === 1 ? index + 1 : (page - 1) * perPage + (index + 1),
      },
      {
        name: "Name",
        selector: (row) => row.user_name || "N/A",
        sortable: true,
        width: "120px",
      },
      {
        name: "Email",
        selector: (row) => row.email,
        sortable: true,
        width: "200px",
      },
      {
        name: "Phone",
        selector: (row) => row.user_phone || "N/A",
        width: "130px",
      },
      {
        name: "Plan",
        selector: (row) => row.subscription?.plan?.name || "N/A",
        width: "100px",
      },
      {
        name: "Plan Status",
        width: "120px",
        cell: (row) => {
          const status = row.subscription?.status;

          if (status === "active") {
            return (
              <span className="px-3 py-1 rounded-full bg-green-700 text-white text-xs font-semibold">
                Active
              </span>
            );
          }

          return <span className="text-gray-500">N/A</span>;
        },
      },
      {
        name: "Status",
        width: "100px",
        cell: (row) => (
          <div className="flex justify-center">
            <Switch
              checked={row.active_status}
              onCheckedChange={(value) => handleUpdateUserStatus(row.id, value)}
              className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
            />
          </div>
        ),
      },
      {
        name: "Actions",
        width: "250px",
        cell: (row) => (
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/users/details/${row.id}`)}
            >
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/edituser/${row.id}`)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteUser(row.id)}
            >
              Delete
            </Button>
          </div>
        ),
      },
      {
        name: "Joined",
        selector: (row) => new Date(row.created_at).toLocaleDateString(),
        sortable: true,
        width: "120px",
      },
    ],
    [users, page, perPage],
  );

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-2">
        {/* Page Header */}
        {/* Page Header */}
        <div
          className="
    sticky top-0 z-10
    px-4 py-4
    bg-gradient-to-b from-white/90 to-white/70
    backdrop-blur
    border-b border-indigo-100
    flex flex-col sm:flex-row sm:items-center sm:justify-between
    gap-4
  "
        >
          {/* Left */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              <span
                className={`bg-clip-text text-transparent ${primaryGradientClass}`}
              >
                Users
              </span>{" "}
              Management
            </h1>
            <p className="text-gray-600 text-sm sm:text-lg mt-1">
              Manage and monitor all platform users.
            </p>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm rounded-md border bg-white hover:bg-indigo-50 transition"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Search + Table */}
        <Card className="shadow-xl border border-indigo-100/50 rounded-2xl">
          <CardContent className="pt-6">
            {/* Search + Actions */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search name, email..."
                  className="border px-3 py-2 rounded-lg w-full shadow-sm focus:ring-indigo-300 focus:border-indigo-400 pr-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                {search && (
                  <X
                    className="absolute right-3 top-2.5 h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-600"
                    onClick={() => setSearch("")}
                  />
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
                  onClick={handleRefresh}
                  disabled={tableLoading}
                >
                  {tableLoading ? "Refreshing..." : "Refresh"}
                </Button>

                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto px-6 flex items-center gap-2"
                  onClick={exportExcel}
                  disabled={exportLoading}
                >
                  {exportLoading ? "Exporting..." : "Export Excel"}
                </Button>

                <Button
                  className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                  onClick={() => navigate("/admin/deleted-users")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Deleted Users
                </Button>

                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
                  onClick={() => navigate("/admin/create-user")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Create User
                </Button>
              </div>
            </div>

            {/* Data Table */}
            <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <DataTable
                columns={columns}
                data={users}
                progressPending={tableLoading}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                onChangePage={(p) => setPage(p)}
                onChangeRowsPerPage={(size) => {
                  setPerPage(size);
                  setPage(1);
                }}
                highlightOnHover
                pointerOnHover
                responsive
                persistTableHead
                customStyles={{
                  rows: {
                    style: {
                      minHeight: "60px",
                      fontSize: "15px",
                    },
                  },
                  headCells: {
                    style: {
                      background: "#f8f9ff",
                      fontWeight: "700",
                      fontSize: "14px",
                      padding: "14px",
                    },
                  },
                  cells: {
                    style: {
                      paddingTop: "14px",
                      paddingBottom: "14px",
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Users;
