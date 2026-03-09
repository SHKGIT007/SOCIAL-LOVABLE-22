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

interface SubscriptionData {
  id: string;
  user_id: string;
  status: string;
  start_date: string;
  end_date: string | null;
  posts_used: number;
  ai_posts_used: number;
  payment_status: string;
  User?: {
    email: string;
    user_name: string | null;
  };
  Plan: {
    name: string;
    price: number;
    monthly_posts: number;
    ai_posts: number;
    linked_accounts: number;
  } | null;
}

const Subscriptions = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const primaryGradient = "from-indigo-600 to-cyan-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;



  useEffect(() => {
    const times = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(times);
  }, [search]);

  const handleRefresh = () => {
    fetchSubscriptions(page, perPage, debouncedSearch);
  };

  const fetchSubscriptions = async (
    pageNumber = 1,
    pageSize = 10,
    searchTerm = ""
  ) => {
    setLoading(true);
    try {
      const data = await apiService.getAllSubscriptions({
        page: pageNumber,
        limit: pageSize,
        search: searchTerm,
      });

      if (data.status) {
        setSubscriptions(data.data.subscriptions || []);
        setTotalRows(data.data.pagination.total || 0);
      } else {
        setSubscriptions([]);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to fetch subscriptions.",
          confirmButtonColor: "#6366f1",
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to fetch subscriptions.",
        confirmButtonColor: "#6366f1",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) return navigate("/auth");
    if (!isAdmin()) return navigate("/dashboard");
    fetchSubscriptions(page, perPage, debouncedSearch);
  }, [page, perPage, debouncedSearch]);

  // Export to Excel
  const exportExcel = async () => {
    try {
      setExportLoading(true);
      const data = await apiService.getAllSubscriptions({
        page: 1,
        limit: 1000000,
        search: debouncedSearch,
      });

      if (!data.status || !data.data.subscriptions || data.data.subscriptions.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "No Data Found",
          text: "There is no data to export.",
          confirmButtonColor: "#6366f1",
        });
        return;
      }

      const excelData = data.data.subscriptions.map((s: SubscriptionData, index: number) => ({
        "S.No": index + 1,
        User: s.User?.user_name || "N/A",
        Email: s.User?.email || "N/A",
        Plan: s.Plan?.name || "N/A",
        Price: s.Plan?.price || 0,
        "AI Posts Used": `${s.ai_posts_used}/${s.Plan?.ai_posts}`,
        "Linked Accounts": s.Plan?.linked_accounts || 0,
        Status: s.payment_status,
        "Start Date": new Date(s.start_date).toLocaleDateString(),
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Subscriptions");
      const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([buf]), "subscriptions.xlsx");
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

  // Columns for DataTable
  const columns: TableColumn<SubscriptionData>[] = useMemo(
    () => [
      {
        name: "S.No",
        width: "70px",
        cell: (row, index) =>
          page === 1 ? index + 1 : (page - 1) * perPage + (index + 1),
      },
      {
        name: "User",
        selector: (row) => row?.User?.user_name || "N/A",
        width: "120px",
      },
      {
        name: "Email",
        selector: (row) => row?.User?.email || "N/A",
        sortable: true,
        width: "140px",
      },
      {
        name: "Plan",
        selector: (row) => row.Plan?.name || "N/A",
        sortable: true,
        width: "100px",
      },
      {
        name: "Plan Price",
        selector: (row) => row.Plan?.price || "N/A",
        sortable: true,
        width: "140px",
      },
      {
        name: "AI Posts Used",
        width: "150px",
        selector: (row) => `${row.ai_posts_used} / ${row.Plan?.ai_posts || 0}`,
      },
      {
        name: "Linked Accounts",
        selector: (row) => row.Plan?.linked_accounts || 0,
        width: "150px",
      },
      {
        name: "Status",
        width: "120px",
        cell: (row) => {
          const status =
            row.payment_status.charAt(0).toUpperCase() +
            row.payment_status.slice(1);

          let badgeClasses = "bg-gray-100 text-gray-700 border-gray-300";

          if (row.payment_status === "success") {
            badgeClasses = "bg-green-100 text-green-700 border-green-300";
          } else if (row.payment_status === "refunded") {
            badgeClasses = "bg-blue-100 text-blue-700 border-blue-300";
          } else if (row.payment_status === "failed") {
            badgeClasses = "bg-red-100 text-red-700 border-red-300";
          } else if (row.payment_status === "pending") {
            badgeClasses = "bg-yellow-100 text-yellow-700 border-yellow-300";
          }

          return (
            <Badge variant="outline" className={badgeClasses}>
              {status}
            </Badge>
          );
        },
      },

      {
        name: "Start Date",
        width: "120px",
        selector: (row) => new Date(row.start_date).toLocaleDateString(),
        sortable: true,
      },
    ],
    [subscriptions, page, perPage]
  );

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-2">
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
                Subscriptions
              </span>{" "}
              Management
            </h1>
            <p className="text-gray-600 text-lg mt-1">
              View and manage user subscription details.
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

        <Card className="shadow-xl border border-indigo-100/50 rounded-2xl">
          <CardContent className="pt-6">
            {/* Search + Actions */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search user, plan..."
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
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
                <Button
                  variant="outline"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white border-none flex items-center gap-2"
                  onClick={exportExcel}
                  disabled={exportLoading}
                >
                  {exportLoading ? "Exporting..." : "Export Excel"}
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <DataTable
                columns={columns}
                data={subscriptions}
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
                  rows: { style: { minHeight: "60px", fontSize: "15px" } },
                  headCells: {
                    style: {
                      background: "#f8f9ff",
                      fontWeight: "700",
                      fontSize: "14px",
                      padding: "14px",
                    },
                  },
                  cells: {
                    style: { paddingTop: "14px", paddingBottom: "14px" },
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

export default Subscriptions;
