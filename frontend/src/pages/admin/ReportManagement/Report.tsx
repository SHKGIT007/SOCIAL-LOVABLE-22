import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DataTable, { TableColumn } from "react-data-table-component";
import { apiService } from "@/services/api";
import { isAdmin, isAuthenticated } from "@/utils/auth";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

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
    plan_ai_posts: number | null;
    ai_posts_used: number | null;
  } | null;
  active_status: boolean;
}

const Report = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserData[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
const [debouncedSearch, setDebouncedSearch ] = useState(search)
  const primaryGradient = "from-indigo-600 to-cyan-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;


  useEffect(()=> {
    const times = setTimeout(()=> {
      setDebouncedSearch(search)
    },1000)
    return () => clearTimeout(times)
  },[search])
    

  const fetchUsers = async (pageNumber = 1, pageSize = 10, searchTerm = "") => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) return navigate("/auth");
    if (!isAdmin()) return navigate("/dashboard");
    fetchUsers(page, perPage, debouncedSearch);
  }, [page, perPage, debouncedSearch]);

  /* -------------------- Excel Export -------------------- */
  const exportExcel = () => {
    const excelData = users.map((u, index) => ({
      "S.No": index + 1,
      Name: u.user_name || "N/A",
      Email: u.email,
      Phone: u.user_phone || "N/A",
      "Plan Name": u.subscription?.plan?.name || "N/A",
      "Plan Status": u.subscription?.status || "N/A",
      "AI Used": u.subscription?.ai_posts_used ?? "N/A",
      "AI Total": u.subscription?.plan_ai_posts ?? "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), "user-report.xlsx");
  };

  /* -------------------- DataTable Columns -------------------- */
  const columns: TableColumn<UserData>[] = useMemo(
    () => [
      {
        name: "S.No",
        width: "70px",
        cell: (_, index) =>
          page === 1 ? index + 1 : (page - 1) * perPage + (index + 1),
      },
      {
        name: "Name",
        selector: (row) => row.user_name || "N/A",
        sortable: true,
        width: "150px",
      },
      {
        name: "Email",
        selector: (row) => row.email,
        sortable: true,
        width: "220px",
      },
      {
        name: "Phone",
        selector: (row) => row.user_phone || "N/A",
        width: "140px",
      },
      {
        name: "Plan",
        selector: (row) => row.subscription?.plan || "N/A",
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
        name: "AI Usage",
        width: "140px",
        cell: (row) =>
          `${row.subscription?.ai_posts_used ?? "N/A"} / ${
            row.subscription?.plan_ai_posts ?? "N/A"
          }`,
      },
      {
        name: "Actions",
        width: "140px",
        cell: (row) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(`/admin/userpostreports/user/${row.id}/posts`)
            }
          >
            View
          </Button>
        ),
      },
    ],
    [page, perPage]
  );

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
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
                Users
              </span>{" "}
              Report
            </h1>
            <p className="text-gray-600 text-lg mt-1">
              Subscription & AI usage report of all users.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm rounded-md border bg-white hover:bg-indigo-50 transition"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Card + Table */}
        <Card className="shadow-xl border border-indigo-100/50 rounded-2xl">
          <CardContent className="pt-6">
            {/* Search + Export */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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

            <div className="flex gap-2">
                <Button
                className="bg-green-600 hover:bg-green-700 px-6"
                onClick={exportExcel}
              >
                Export Excel
              </Button>
              <Button
              onClick={() => fetchUsers(page, perPage, debouncedSearch)}
              >
                Refresh
              </Button>
            </div>
            </div>

            {/* Data Table */}
            <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <DataTable
                columns={columns}
                data={users}
                progressPending={loading}
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

export default Report;
