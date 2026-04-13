import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DataTable, { TableColumn } from "react-data-table-component";
import { apiService } from "@/services/api";
import { isAdmin, isAuthenticated } from "@/utils/auth";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, X, Calendar, Trash2 } from "lucide-react";
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
    Profile?: {
      business_name: string;
    };
  };
  review_status: string;
  scheduled_at: string | null;
}

const AdminPosts = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
    fetchPosts();
  };

  const fetchPosts = async () => {
    setTableLoading(true);
    try {
      const params: any = {
        page,
        limit: perPage,
      };

      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
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
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) return navigate("/auth");
    if (!isAdmin()) return navigate("/dashboard");

    fetchPosts();
  }, [page, perPage, debouncedSearch, statusFilter]);

  // const getPlatformsArray = (platforms: any): string[] => {
  //   try {
  //     if (!platforms) return [];
  //     if (Array.isArray(platforms)) return platforms;
  //     return JSON.parse(platforms);
  //   } catch {
  //     return [];
  //   }
  // };

  const getPlatformsArray = (platforms: any): string[] => {
    if (!platforms) return [];

    // already array
    if (Array.isArray(platforms)) return platforms;

    // JSON string
    if (typeof platforms === "string") {
      try {
        const parsed = JSON.parse(platforms);
        if (Array.isArray(parsed)) return parsed;

        // comma separated string
        return platforms
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean);
      } catch {
        return platforms
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean);
      }
    }

    // object case { facebook: true }
    if (typeof platforms === "object") {
      return Object.keys(platforms);
    }

    return [];
  };

  const exportExcel = async () => {
    try {
      setExportLoading(true);

      let allPosts: Post[] = [];
      let pageNo = 1;
      const limit = 1000000;
      let totalPages = 1;

      do {
        const params: any = {
          page: pageNo,
          limit,
        };

        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
        if (statusFilter !== "all") params.status = statusFilter;

        const res = await apiService.getAllPosts(params);

        if (!res.status) break;

        const postsChunk = res.data.posts || [];
        allPosts = [...allPosts, ...postsChunk];

        totalPages = res.data.pagination.totalPages;
        pageNo++;
      } while (pageNo <= totalPages);

      if (allPosts.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "No Data Found",
          text: "There is no data to export.",
          confirmButtonColor: "#6366f1",
        });
        return;
      }

      const excelData = allPosts.map((post, index) => {
        const platforms = getPlatformsArray(post.platforms);

        return {
          "S.No": index + 1,
          "Business/Creator": post.User?.Profile?.business_name || post.User?.user_name || "N/A",
          Email: post.User?.email || "N/A",
          Title: post.title,
          Content: post.content,

          Platforms: Array.isArray(platforms)
            ? platforms.join(", ")
            : platforms || "N/A",

          Status: post.status,
          "Review Status": post.review_status,
          Type: post.is_ai_generated ? "AI Generated" : "Manual",
          "Scheduled At": post.scheduled_at
            ? new Date(post.scheduled_at).toLocaleString()
            : "N/A",
          "Created At": new Date(post.created_at).toLocaleDateString(),
        };
      });

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Posts");

      const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(
        new Blob([buf]),
        debouncedSearch || statusFilter !== "all"
          ? "filtered-posts.xlsx"
          : "all-posts.xlsx",
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

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6366f1",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const data = await apiService.deletePost(id);
        if (data.status) {
          Swal.fire("Deleted!", "Post has been deleted.", "success");
          fetchPosts();
        } else {
          Swal.fire("Error", data.message || "Failed to delete post", "error");
        }
      } catch (error: any) {
        Swal.fire("Error", error.message || "Something went wrong", "error");
      } finally {
        setLoading(false);
      }
    }
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
        name: "Business/Creator",
        width: "180px",
        selector: (row) => row.User?.Profile?.business_name || row.User?.user_name || "N/A",
        sortable: true,
      },
      {
        name: "Email",
        width: "200px",
        selector: (row) => row.User?.email || "N/A",
      },
      {
        name: "Content",
        width: "300px",
        cell: (row) => (
          <div className="text-xs text-gray-600 line-clamp-2">
         
            {row.content || "N/A"}
          </div>
        ),
      },

      // {
      //   name: "Platforms",
      //   width: "150px",
      //   cell: (row) => (
      //     <div className="flex flex-wrap gap-1">
      //       {getPlatformsArray(row?.platforms)?.map((p) => (
      //         <Badge key={p} className="text-xs capitalize" variant="secondary">
      //           {p || "N/A"}
      //         </Badge>
      //       ))}
      //     </div>
      //   ),
      // },

      {
        name: "Platforms",
        width: "150px",
        cell: (row) => {
          const platforms = getPlatformsArray(row.platforms);

          return (
            <div className="flex flex-wrap gap-1">
              {platforms.length > 0 ? (
                platforms.map((p) => (
                  <Badge
                    key={p}
                    className="text-xs capitalize"
                    variant="secondary"
                  >
                    {p}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-gray-400">N/A</span>
              )}
            </div>
          );
        },
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
        width: "150px",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/posts/${row.id}`)}
              title="View Post"
            >
              <Eye className="h-4 w-4" />
            </Button>
            {row.status !== "published" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(row.id)}
                title="Delete Post"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [page, perPage],
  );

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-2">
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
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              <span
                className={`text-transparent bg-clip-text ${primaryGradientClass}`}
              >
                Posts
              </span>{" "}
              Management
            </h1>
            <p className="text-gray-600 text-sm sm:text-lg mt-1">
              View and manage all posts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2text-sm rounded-md border bg-white hover:bg-indigo-50 transition"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Filters + Table */}
        <Card className="shadow-xl border border-indigo-100 rounded-2xl">
          <CardContent className="pt-6">
            {/* Search + Actions */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
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

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <Button
                  className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
                  onClick={handleRefresh}
                  disabled={tableLoading}
                >
                  {tableLoading ? "Refreshing..." : "Refresh"}
                </Button>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 rounded-lg border bg-white shadow-sm focus:ring-indigo-300 focus:border-indigo-400 w-full sm:w-auto"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                </select>

                <Button
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto px-6"
                  onClick={exportExcel}
                  disabled={exportLoading}
                >
                  {exportLoading ? "Exporting..." : "Export Excel"}
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-200 shadow overflow-hidden">
              <DataTable
                columns={columns}
                data={posts}
                progressPending={tableLoading}
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
