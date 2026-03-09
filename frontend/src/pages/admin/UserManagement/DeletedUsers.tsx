import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DataTable, { TableColumn } from "react-data-table-component";
import { apiService } from "@/services/api";
import { isAdmin, isAuthenticated } from "@/utils/auth";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Swal from "sweetalert2";
import { X } from "lucide-react";

interface User {
  id: string;
  user_name: string | null;
  user_fname: string | null;
  user_lname: string | null;
  email: string | null;
  user_phone: string | null;
  deleted_at: string | null;
}

const DeletedUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");

  const primaryGradient = "from-red-600 to-rose-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;

  const fetchDeletedUsers = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: perPage,
      };
      if (search.trim()) params.search = search.trim();

      const data = await apiService.getDeletedUsers(params);

      if (data.status) {
        setUsers(data.data.users || []);
        setTotalRows(data.data.pagination.total || 0);
      } else {
        Swal.fire(
          "Error",
          data.message || "Failed to fetch deleted users",
          "error"
        );
        setUsers([]);
      }
    } catch (err: any) {
      Swal.fire(
        "Error",
        err.message || "Failed to fetch deleted users",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) return navigate("/auth");
    if (!isAdmin()) return navigate("/dashboard");

    fetchDeletedUsers();
  }, [page, perPage, search]);

  const handleRefresh = () => {
    fetchDeletedUsers();
  };

  const columns: TableColumn<User>[] = useMemo(
    () => [
      {
        name: "S.No",
        width: "70px",
        cell: (row, index) =>
          page === 1 ? index + 1 : (page - 1) * perPage + (index + 1),
      },
      {
        name: "Username",
        selector: (row) => row.user_name || "N/A",
        sortable: true,
        width: "150px",
      },
      {
        name: "First Name",
        selector: (row) => row.user_fname || "N/A",
        width: "130px",
      },
      {
        name: "Last Name",
        selector: (row) => row.user_lname || "N/A",
        width: "130px",
      },
      {
        name: "Email",
        selector: (row) => row.email || "N/A",
        width: "200px",
      },
      {
        name: "Phone",
        selector: (row) => row.user_phone || "N/A",
        width: "150px",
      },
      {
        name: "Deleted At",
        selector: (row) =>
          row.deleted_at ? new Date(row.deleted_at).toLocaleString() : "-",
        width: "180px",
      },
    ],
    [page, perPage]
  );

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-2">
        {/* Header */}
        <div
          className="
            sticky top-0 z-10
            -mx-2 px-4 py-4
            bg-gradient-to-b from-white/90 to-white/70
            backdrop-blur
            border-b border-indigo-100
            flex flex-col sm:flex-row sm:items-center sm:justify-between
            gap-4
          "
        >
          <div>
            <h1 className="text-3xl font-extrabold">
              <span
                className={`text-transparent bg-clip-text ${primaryGradientClass}`}
              >
                Deleted
              </span>{" "}
              Users
            </h1>
            <p className="text-gray-600 text-lg mt-1">
              View and manage all deleted users.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm rounded-md border bg-white hover:bg-red-50 transition"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Filters + Table */}
        <Card className="shadow-xl border border-red-200 rounded-2xl">
          <CardContent className="pt-6">
            {/* Search + Actions */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search deleted users..."
                  className="border px-3 py-2 rounded-lg w-full shadow-sm focus:ring-red-300 focus:border-red-400 pr-9"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
                {search && (
                  <X
                    className="absolute right-3 top-2.5 h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => setSearch("")}
                  />
                )}
              </div>

              <Button
                className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
                onClick={handleRefresh}
                disabled={loading}
              >
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-200 shadow overflow-hidden">
              <DataTable
                columns={columns}
                data={users}
                progressPending={loading}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                onChangeRowsPerPage={(size) => {
                  setPerPage(size);
                  setPage(1);
                }}
                onChangePage={(p) => setPage(p)}
                highlightOnHover
                pointerOnHover
                responsive
                persistTableHead
                noHeader
                customStyles={{
                  rows: { style: { minHeight: "60px", fontSize: "15px" } },
                  headCells: {
                    style: {
                      background: "#f8f9ff",
                      fontWeight: "700",
                      fontSize: "14px",
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

export default DeletedUsers;
