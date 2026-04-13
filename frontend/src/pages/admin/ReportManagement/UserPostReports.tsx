import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DataTable, { TableColumn } from "react-data-table-component";
import { apiService } from "@/services/api";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Swal from "sweetalert2";
import { downloadExcel } from "@/utils/exportUtils";
import { formatDate, formatDateTime } from "@/utils/dateFormatter";
import { Filter, X, Calendar, Trash2, Eye, RefreshCw, Download, ArrowLeft, RotateCcw } from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  status: string;
  is_ai_generated: boolean;
  created_at: string;
  published_at: string | null;
  scheduled_at: string | null;
  platforms: string[];
}

interface UserData {
  id: string;
  user_name: string;
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const UserPostsReport = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<UserData | null>(null);

  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [exportLoading, setExportLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  const [date, setDate] = useState("");

  const primaryGradientClass = "bg-gradient-to-r from-indigo-600 to-cyan-500";

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    fetchUserPosts();
  }, [page, perPage, debouncedSearch, year, month, date]);

  const handleRefresh = () => {
    fetchUserPosts();
  };

  const fetchUserPosts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: perPage,
      };

      if (debouncedSearch) params.search = debouncedSearch;
      if (year !== "all") params.year = year;
      if (month !== "all") params.month = month;
      if (date) params.date = date;

      const response = await apiService.getUserPostHistory(userId, params);

      if (response.status) {
        setPosts(response.data.posts || []);
        setTotalRows(response.data.pagination?.total || 0);
        setUser(response.data.user || null);
      } else {
        setPosts([]);
        setTotalRows(0);
        Swal.fire("Error", "Failed to load posts", "error");
      }
    } catch (err) {
      setPosts([]);
      setTotalRows(0);
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setYear("all");
    setMonth("all");
    setDate("");
    setPage(1);
  };

  const exportExcel = async () => {
    try {
      setExportLoading(true);

      const response = await apiService.getUserPostHistory(userId, {
        page: 1,
        limit: 1000000,
        search: debouncedSearch,
        year: year !== "all" ? year : undefined,
        month: month !== "all" ? month : undefined,
        date: date || undefined,
      });

      if (!response.status || !response.data.posts || response.data.posts.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "No Data Found",
          text: "There is no data to export.",
          confirmButtonColor: "#6366f1",
        });
        return;
      }

      const data = response.data.posts.map((p: Post, i: number) => ({
        "S.No": i + 1,
        Title: p.title || "Untitled",
        Status: p.status,
        Type: p.is_ai_generated ? "AI Generated" : "Manual",
        "Created Date": formatDate(p.created_at),
        "Published Date": p.published_at ? formatDate(p.published_at) : "-",
        "Scheduled Date": p.scheduled_at ? formatDate(p.scheduled_at) : "-",
      }));

      downloadExcel(
        data,
        `${user?.user_name || "user"}-posts-report`,
        "Posts"
      );
    } catch {
      Swal.fire("Error", "Export failed", "error");
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
          fetchUserPosts();
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

  const getPlatformsArray = (platforms: any): string[] => {
    if (!platforms) return [];
    if (Array.isArray(platforms)) return platforms;
    if (typeof platforms === "string") {
      try {
        const parsed = JSON.parse(platforms);
        if (Array.isArray(parsed)) return parsed;
        return [parsed.toString()];
      } catch {
        return platforms
          .split(",")
          .map((p: string) => p.trim())
          .filter(Boolean);
      }
    }
    return [];
  };

  const columns: TableColumn<Post>[] = useMemo(
    () => [
      {
        name: "S.No",
        width: "70px",
        cell: (_, i) => (page - 1) * perPage + i + 1,
      },
      {
        name: "Title",
        selector: (row) => row.title || "Untitled",
        sortable: true,
        width: "180px",
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
              {formatDateTime(row.scheduled_at)}
            </div>
          ) : (
            <span className="text-gray-400 text-xs">Not scheduled</span>
          ),
      },
      {
        name: "Created",
        width: "130px",
        selector: (row) => formatDate(row.created_at),
      },
      {
        name: "Action",
        width: "280px",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate(`/admin/users/${userId}`, {
                  state: { postId: row.id },
                })
              }
              className="font-bold border-indigo-100 hover:bg-indigo-50"
            >
              <Eye className="h-4 w-4 mr-2 text-indigo-600" /> View
            </Button>
            {row.status !== "published" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(row.id)}
                className="font-bold shadow-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            )}
          </div>
        ),
      },
    ],
    [page, perPage]
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
                User Posts
              </span>{" "}
              Report
            </h1>
            <p className="text-gray-600 text-lg mt-1">
              View user post history & activity
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="rounded-xl font-bold bg-white/50 border-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </div>
        </div>

        <Card className="shadow-xl border border-indigo-100 rounded-2xl">
          <CardContent className="pt-6">
            {/* Search + Filters + Actions */}
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search title..."
                  className="border px-3 py-2 rounded-lg w-full shadow-sm focus:ring-indigo-300 focus:border-indigo-400 pr-9"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
                {search && (
                  <X
                    className="absolute right-3 top-2.5 h-4 w-4 text-gray-500 cursor-pointer"
                    onClick={() => setSearch("")}
                  />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <Button
                  className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto font-bold"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> {loading ? "Refreshing..." : "Refresh"}
                </Button>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto">
                  <Select
                    value={year}
                    onValueChange={(v) => {
                      setYear(v);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-28">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={month}
                    onValueChange={(v) => {
                      setMonth(v);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-28">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Months</SelectItem>
                      {monthNames.map((m, i) => (
                        <SelectItem
                          key={i}
                          value={(i + 1).toString().padStart(2, "0")}
                        >
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="date"
                    className="w-full sm:w-36"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setPage(1);
                    }}
                  />

                  <Button variant="outline" onClick={resetFilters} className="w-full sm:w-auto font-bold">
                    <RotateCcw className="h-4 w-4 mr-2" /> Reset
                  </Button>
                </div>
                {totalRows > 0 && (
                  <Button
                    variant="outline"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white border-none flex items-center gap-2 font-bold"
                    onClick={exportExcel}
                    disabled={exportLoading}
                  >
                    <Download className="h-4 w-4 mr-2" /> {exportLoading ? "Exporting..." : "Export Excel"}
                  </Button>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 shadow overflow-hidden">
              <DataTable
                columns={columns}
                data={posts}
                progressPending={loading}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                onChangePage={setPage}
                onChangeRowsPerPage={(n) => {
                  setPerPage(n);
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

export default UserPostsReport;
