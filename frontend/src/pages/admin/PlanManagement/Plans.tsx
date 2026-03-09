import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DataTable, { TableColumn } from "react-data-table-component";
import { apiService } from "@/services/api";
import { isAdmin, isAuthenticated } from "@/utils/auth";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Swal from "sweetalert2";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Card, CardContent } from "@/components/ui/card";

interface Plan {
  id: string;
  name: string;
  price: number;
  monthly_posts: number;
  ai_posts: number;
  linked_accounts: number;
  is_active: boolean;
  description: string;
  duration_months: number;
  created_at: string;
}

const Plans = () => {
  const navigate = useNavigate();

  const [plans, setPlans] = useState<Plan[]>([]);
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

  useEffect(() => {
    const times = setTimeout(() => {
      setDebouncedSearch(search);
    }, 1000);
    return () => clearTimeout(times);
  }, [search]);

  // refresh the current plan list
  const handleRefresh = () => {
    fetchPlans(page, perPage, debouncedSearch);
  };

  const fetchPlans = async (pageNumber = 1, pageSize = 10, searchTerm = "") => {
    setTableLoading(true);
    try {
      const data = await apiService.getAllPlans({
        page: pageNumber,
        limit: pageSize,
        search: searchTerm,
      });

      if (data.status) {
        setPlans(data.data.plans || []);
        setTotalRows(data.data.pagination?.total || 0);
      } else {
        setPlans([]);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to fetch plans.",
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to fetch plans.",
      });
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) return navigate("/auth");
    if (!isAdmin()) return navigate("/dashboard");

    fetchPlans(page, perPage, debouncedSearch);
  }, [page, perPage, debouncedSearch]);

  const handleStatusToggle = async (plan: Plan) => {
    const newStatus = !plan.is_active;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Plan will be marked as ${newStatus ? "Active" : "Inactive"}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      await apiService.updatePlan(plan.id, {
        ...plan,
        is_active: newStatus ? 1 : 0,
      });

      Swal.fire({
        icon: "success",
        title: "Success",
        text: `Status updated!`,
      });

      fetchPlans(page, perPage, search);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to update status.",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This plan will be deleted permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await apiService.deletePlan(id);

      if (!response.status) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to delete plan.",
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Plan deleted successfully.",
      });

      fetchPlans(page, perPage, search);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to delete plan.",
      });
    }
  };

  const exportExcel = async () => {
    try {
      setExportLoading(true);

      const res = await apiService.getAllPlans({
        page: 1,
        limit: 1000000,
        search: debouncedSearch,
      });

      if (!res.status || !res.data.plans.length) {
        Swal.fire("No Data", "Export ke liye data nahi hai", "warning");
        return;
      }

      const excelData = res.data.plans.map((p, index) => ({
        "S.No": index + 1,
        Name: p.name || "N/A",
        Price: p.price || "N/A",
        "AI Posts": p.ai_posts || "N/A",
        Accounts: p.linked_accounts || "N/A",
        Status: p.is_active ? "Active" : "Inactive",
        Description: p.description || "N/A",
        Created: new Date(p.created_at).toLocaleDateString(),
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Plans");

      const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([buf]), "plans.xlsx");
    } catch (error: any) {
      Swal.fire("Export Failed", error.message, "error");
    } finally {
      setExportLoading(false);
    }
  };

  const columns: TableColumn<Plan>[] = useMemo(
    () => [
      {
        name: "S.No",
        width: "80px",
        cell: (_, index) =>
          page === 1 ? index + 1 : (page - 1) * perPage + (index + 1),
      },
      {
        name: "Name",
        selector: (row) => row.name || "N/A",
        sortable: true,
        width: "180px",
      },
      {
        name: "Description",
        selector: (row) => row.description || "N/A",
        sortable: false,
        width: "280px",
      },
      {
        name: "Price",
        selector: (row) => row.price || "N/A",
        sortable: true,
        width: "80px",
      },
      {
        name: "AI Posts",
        selector: (row) => row.ai_posts || "N/A",
        sortable: true,
        width: "100px",
      },
      {
        name: "Accounts",
        selector: (row) => row.linked_accounts || "N/A",
        sortable: true,
        width: "110px",
      },
      {
        name: "Status",
        width: "80px",
        cell: (row) => (
          <Switch
            checked={row.is_active}
            onCheckedChange={() => handleStatusToggle(row)}
            className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
          />
        ),
      },
      {
        name: "Actions",
        width: "160px",
        cell: (row) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/admin/edit-plan/${row.id}`)}
            >
              Edit
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(row.id)}
            >
              Delete
            </Button>
          </div>
        ),
      },
      {
        name: "Created",
        selector: (row) => new Date(row.created_at).toLocaleDateString() || "N/A",
        sortable: true,
        width: "120px",
      },
    ],
    [plans, page, perPage],
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
          {/* Left: Title */}
          <div>
            <h1 className="text-3xl font-extrabold">
              <span
                className={`text-transparent bg-clip-text ${primaryGradientClass}`}
              >
                Plans
              </span>{" "}
              Management
            </h1>
            <p className="text-gray-600 text-lg mt-1">
              View and manage all subscription plans.
            </p>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={exportExcel}
            >
              Export Excel
            </Button> */}

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
                  placeholder="Search name, description..."
                  className="border px-3 py-2 rounded-lg w-full shadow-sm focus:ring-indigo-300 focus:border-indigo-400 pr-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <X
                    className="absolute right-3 top-2.5 cursor-pointer text-gray-400 hover:text-gray-600"
                    onClick={() => setSearch("")}
                  />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <Button
                  className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
                  onClick={handleRefresh}
                  disabled={tableLoading || exportLoading}
                >
                  {tableLoading || exportLoading ? "Refreshing..." : "Refresh"}
                </Button>

                <Button
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto px-6"
                  onClick={exportExcel}
                >
                  Export Excel
                </Button>

                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
                  onClick={() => navigate("/admin/create-plan")}
                >
                  <Plus size={16} className="mr-2" /> Create Plan
                </Button>
              </div>
            </div>

            {/* Updated Data Table */}
            <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <DataTable
                columns={columns}
                data={plans}
                progressPending={exportLoading || tableLoading}
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

export default Plans;
