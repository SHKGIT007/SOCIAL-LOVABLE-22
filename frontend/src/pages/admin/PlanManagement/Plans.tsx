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
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");

  const primaryGradient = "from-indigo-600 to-cyan-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;

  const fetchPlans = async (pageNumber = 1, pageSize = 10, searchTerm = "") => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) return navigate("/auth");
    if (!isAdmin()) return navigate("/dashboard");

    fetchPlans(page, perPage, search);
  }, [page, perPage, search]);

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

  const exportExcel = () => {
    const excelData = plans.map((p, index) => ({
      "S.No": index + 1,
      Name: p.name,
      Price: p.price,
      "AI Posts": p.ai_posts,
      Accounts: p.linked_accounts,
      Status: p.is_active ? "Active" : "Inactive",
      Description: p.description,
      Created: new Date(p.created_at).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plans");

    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), "plans.xlsx");
  };

  const columns: TableColumn<Plan>[] = useMemo(
    () => [
      {
        name: "S.No",
        width: "80px",
        cell: (_, index) =>
          page === 1 ? index + 1 : (page - 1) * perPage + (index + 1),
      },
      { name: "Name", selector: (row) => row.name, sortable: true },
      {
        name: "Description",
        selector: (row) => row.description,
        sortable: false,
      },
      { name: "Price", selector: (row) => row.price, sortable: true },
      { name: "AI Posts", selector: (row) => row.ai_posts, sortable: true },
      {
        name: "Accounts",
        selector: (row) => row.linked_accounts,
        sortable: true,
      },
      {
        name: "Status",
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
              <Pencil size={14} />
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(row.id)}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ),
      },
      {
        name: "Created",
        selector: (row) => new Date(row.created_at).toLocaleDateString(),
        sortable: true,
      },
    ],
    [plans, page, perPage]
  );

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="pb-4 border-b">
          <h1 className="text-3xl font-extrabold">
            <span
              className={`text-transparent bg-clip-text ${primaryGradientClass}`}
            >
              Plans
            </span>{" "}
            Management
          </h1>
          <p className="text-gray-600">
            View and manage all subscription plans.
          </p>
        </div>

        <Card className="shadow-xl border border-indigo-100/50 rounded-2xl">
          <CardContent className="pt-6">
            {/* Search + Buttons */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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

              <div className="flex gap-3">
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={exportExcel}
                >
                  Export Excel
                </Button>

                <Button
                  className="bg-indigo-600 hover:bg-indigo-700"
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

export default Plans;
