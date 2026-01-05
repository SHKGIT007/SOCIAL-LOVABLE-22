import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DataTable, { TableColumn } from "react-data-table-component";
import { apiService } from "@/services/api";
import { isAdmin, isAuthenticated } from "@/utils/auth";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, X, Calendar } from "lucide-react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Post {
  id: string;
  title: string;
  content: string;
  platforms: string[];
  status: string;
  is_ai_generated: boolean;
  created_at: string;
  User?: {
    email: string;
    user_name: string | null;
  };
  review_status: string;
  scheduled_at: string | null;
}

const AdminPosts = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const primaryGradient = "from-indigo-600 to-cyan-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;

  useEffect (()=> {
     const times = setTimeout(()=> {
        setDebouncedSearch(search)
     },1000)
      return () => clearTimeout(times)
  },[search])

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: perPage,
      };

      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "all") params.status = statusFilter;

      const data = await apiService.getAllPosts(params);

      if (data.status) {
        setPosts(data.data.posts || []);
        setTotalRows(data.data.pagination.total || 0);
      } else {
        Swal.fire("Error", data.message || "Failed to fetch posts", "error");
        setPosts([]);
      }
    } catch (error: any) {
      Swal.fire("Error", error.message || "Failed to fetch posts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) return navigate("/auth");
    if (!isAdmin()) return navigate("/dashboard");

    fetchPosts();
  }, [page, perPage, debouncedSearch, statusFilter]);

  const getPlatformsArray = (platforms: any): string[] => {
    try {
      if (!platforms) return [];
      if (Array.isArray(platforms)) return platforms;
      return JSON.parse(platforms);
    } catch {
      return [];
    }
  };

  const exportExcel = () => {
    const excelData = posts.map((post, index) => ({
      "S.No": page === 1 ? index + 1 : (page - 1) * perPage + (index + 1),
      Title: post.title,
      Content: post.content,
      User: post.User?.user_name || "N/A",
      Email: post.User?.email || "N/A",
      Platforms: getPlatformsArray(post.platforms).join(", "),
      Status: post.status,
      "Review Status": post.review_status,
      Type: post.is_ai_generated ? "AI Generated" : "Manual",
      "Scheduled At": post.scheduled_at
        ? new Date(post.scheduled_at).toLocaleString()
        : "N/A",
      "Created At": new Date(post.created_at).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Posts");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), "posts.xlsx");
  };

  const columns: TableColumn<Post>[] = useMemo(
    () => [
      {
        name: "S.No",
        width: "70px",
        cell: (row, index) =>
          page === 1 ? index + 1 : (page - 1) * perPage + (index + 1),
      },
      {
        name: "Title",
        width: "180px",
        selector: (row) => row.title,
        sortable: true,
      },
      {
        name: "Content",
        width: "300px",
        cell: (row) => (
          <div className="text-xs text-gray-600 line-clamp-2">
            {row.content}
          </div>
        ),
      },
      {
        name: "User",
        width: "150px",
        selector: (row) => row.User?.user_name || "N/A",
      },
      {
        name: "Email",
        width: "200px",
        selector: (row) => row.User?.email || "N/A",
      },
      {
        name: "Platforms",
        width: "150px",
        cell: (row) => (
          <div className="flex flex-wrap gap-1">
            {getPlatformsArray(row.platforms).map((p) => (
              <Badge key={p} className="text-xs capitalize" variant="secondary">
                {p}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        name: "Status",
        width: "120px",
        cell: (row) => {
          const status =
            row.status.charAt(0).toUpperCase() + row.status.slice(1);

          return (
            <Badge
              variant="outline"
              className={
                row.status === "published"
                  ? "bg-green-100 text-green-700 border-green-300"
                  : row.status === "scheduled"
                  ? "bg-blue-100 text-blue-700 border-blue-300"
                  : "bg-gray-100 text-gray-700 border-gray-300"
              }
            >
              {status}
            </Badge>
          );
        },
      },

      {
        name: "Type",
        width: "140px",
        cell: (row) => (
          <Badge
            variant="outline"
            className={
              row.is_ai_generated
                ? "bg-purple-100 text-purple-700 border-purple-300"
                : "bg-indigo-100 text-indigo-700 border-indigo-300"
            }
          >
            {row.is_ai_generated ? "AI Generated" : "Manual"}
          </Badge>
        ),
      },
      {
        name: "Scheduled",
        width: "180px",
        cell: (row) =>
          row.scheduled_at ? (
            <div className="flex items-center text-xs text-gray-600">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(row.scheduled_at).toLocaleString()}
            </div>
          ) : (
            <span className="text-gray-400 text-xs">Not scheduled</span>
          ),
      },
      {
        name: "Created",
        width: "130px",
        selector: (row) => new Date(row.created_at).toLocaleDateString(),
      },
      {
        name: "Actions",
        width: "130px",
        cell: (row) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/posts/${row.id}`)}
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
                Posts
              </span>{" "}
              Management
            </h1>
            <p className="text-gray-600 text-lg mt-1">
              View and manage all posts.
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

        {/* Filters + Table */}
        <Card className="shadow-xl border border-indigo-100 rounded-2xl">
          <CardContent className="pt-6">
            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              {/* Search */}
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search title..."
                  className="border px-3 py-2 rounded-lg w-full shadow-sm focus:ring-indigo-300 focus:border-indigo-400 pr-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <X
                    className="absolute right-3 top-2.5 h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => setSearch("")}
                  />
                )}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 rounded-lg border bg-white shadow-sm focus:ring-indigo-300 focus:border-indigo-400"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                </select>

                <Button
                  className="bg-green-600 hover:bg-green-700 px-6"
                  onClick={exportExcel}
                >
                  Export Excel
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-200 shadow overflow-hidden">
              <DataTable
                columns={columns}
                data={posts}
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

export default AdminPosts;
