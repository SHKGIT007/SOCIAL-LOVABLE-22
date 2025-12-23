import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DataTable, { TableColumn } from "react-data-table-component";
import { apiService } from "@/services/api";
import { isAdmin, isAuthenticated } from "@/utils/auth";
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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Filter, User, FileText, X } from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  status: string;
  is_ai_generated: boolean;
  ai_prompt: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  media_urls: string[] | null;
  image_url: string | null;
  video_url: string | null;
}

interface UserData {
  id: string;
  user_name: string;
  email: string;
  user_phone: string | null;
}

const UserPostsReport = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const [user, setUser] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");

  const primaryGradient = "from-indigo-600 to-cyan-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;

  // INIT
  useEffect(() => {
    if (!isAuthenticated()) return navigate("/auth");
    if (!isAdmin()) return navigate("/dashboard");

    fetchUserDetails();
  }, []);

  // Fetch posts whenever page, perPage, search, or filters change
  useEffect(() => {
    fetchUserPosts(page, perPage, search);
  }, [page, perPage, search]);

  // FETCH USER BASIC DETAILS
  const fetchUserDetails = async () => {
    try {
      const response = await apiService.getUserById(userId);
      if (response.status) {
        setUser(response.data.user);
      }
    } catch (err) {}
  };

  const fetchUserPosts = async (
    pageNumber = 1,
    pageSize = 10,
    searchTerm = ""
  ) => {
    setLoading(true);
    try {
      // Build filter params
      const params: any = {
        page: pageNumber,
        limit: pageSize,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await apiService.getUserPostHistory(userId, params);

      if (response.status) {
        setPosts(response.data.posts || []);
        setTotalRows(response.data.pagination?.total || 0);
      } else {
        setPosts([]);
        setTotalRows(0);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to load post history",
          confirmButtonColor: "#6366f1",
        });
      }
    } catch (err: any) {
      setPosts([]);
      setTotalRows(0);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to fetch post history",
        confirmButtonColor: "#6366f1",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setPage(1);
  };

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

  const exportExcel = async () => {
    try {
      // Fetch all data for export
      const params: any = {
        page: 1,
        limit: 10000, // Get all records
      };

      const response = await apiService.getUserPostHistory(userId, params);

      if (!response.status || !response.data.posts) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch data for export",
          confirmButtonColor: "#6366f1",
        });
        return;
      }

      const excelData = response.data.posts.map(
        (post: Post, index: number) => ({
          "S.No": index + 1,
          Title: post.title || "Untitled",
          Status: post.status,
          Type: post.is_ai_generated ? "AI Generated" : "Manual",
          "Created Date": new Date(post.created_at).toLocaleDateString(),
          "Published Date": post.published_at
            ? new Date(post.published_at).toLocaleDateString()
            : "N/A",
          "Scheduled Date": post.scheduled_at
            ? new Date(post.scheduled_at).toLocaleDateString()
            : "N/A",
        })
      );

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Posts");
      const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([buf]), `${user?.user_name || "user"}-posts-report.xlsx`);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to export data",
        confirmButtonColor: "#6366f1",
      });
    }
  };

  /* -------------------- DataTable Columns -------------------- */
  const columns: TableColumn<Post>[] = useMemo(
    () => [
      {
        name: "S.No",
        width: "70px",
        cell: (_, index) =>
          page === 1 ? index + 1 : (page - 1) * perPage + (index + 1),
      },
      {
        name: "Title",
        selector: (row) => row.title || "Untitled",
        sortable: true,
        width: "250px",
      },
      {
        name: "Status",
        width: "120px",
        cell: (row) => <Badge>{row.status}</Badge>,
        sortable: true,
      },
      {
        name: "Type",
        width: "140px",
        cell: (row) => (
          <Badge variant={row.is_ai_generated ? "default" : "secondary"}>
            {row.is_ai_generated ? "AI Generated" : "Manual"}
          </Badge>
        ),
      },
      {
        name: "Created Date",
        selector: (row) => new Date(row.created_at).toLocaleDateString(),
        sortable: true,
        width: "140px",
      },
      {
        name: "Actions",
        width: "120px",
        cell: (row) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(`/admin/users/${userId}`, {
                state: { postId: row.id },
              })
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
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-extrabold">
              <span
                className={`bg-clip-text text-transparent ${primaryGradientClass}`}
              >
                User Posts
              </span>{" "}
              Report
            </h1>

            {user && (
              <p className="text-gray-600 text-lg mt-1 flex items-center gap-2">
                <User className="w-4 h-4" />
                {user.user_name} ({user.email})
              </p>
            )}
          </div>

          <Button variant="outline" onClick={() => navigate("/admin/report")}>
            Back to Reports
          </Button>
        </div>

        {/* FILTERS CARD */}
        <Card className="shadow-lg border-2 border-indigo-100/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* YEAR */}
              <div className="space-y-2">
                <label>Year</label>
                <Select
                  onValueChange={(v) => {
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* MONTH */}
              <div className="space-y-2">
                <label>Month</label>
                <Select
                  onValueChange={(v) => {
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Month" />
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
              </div>

              {/* DATE */}
              <div className="space-y-2">
                <label>Date</label>
                <Input
                  type="date"
                  onChange={(e) => {
                    setPage(1);
                  }}
                />
              </div>

              {/* RESET */}
              <div className="space-y-2">
                <label className="invisible">Reset</label>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="w-full"
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card + Table */}
        <Card className="shadow-xl border border-indigo-100/50 rounded-2xl">
          <CardContent className="pt-6">
            {/* Search + Export */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search title, content, status..."
                  className="border px-3 py-2 rounded-lg w-full shadow-sm focus:ring-indigo-300 focus:border-indigo-400 pr-9"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />

                {search && (
                  <X
                    className="absolute right-3 top-2.5 h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-600"
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                    }}
                  />
                )}
              </div>

              <Button
                className="bg-green-600 hover:bg-green-700 px-6"
                onClick={exportExcel}
              >
                Export Excel
              </Button>
            </div>

            {/* Data Table */}
            <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <DataTable
                columns={columns}
                data={posts}
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

export default UserPostsReport;
