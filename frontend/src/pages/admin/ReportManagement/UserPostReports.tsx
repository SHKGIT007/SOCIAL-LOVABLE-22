import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiService } from "@/services/api";
import { isAdmin, isAuthenticated } from "@/utils/auth";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Filter, User, FileText } from "lucide-react";

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
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedYear, setSelectedYear] = useState<string | undefined>(
    undefined
  );
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(
    undefined
  );
  const [selectedDate, setSelectedDate] = useState<string>("");

  const primaryGradient = "from-indigo-600 to-cyan-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;

  // INIT
  useEffect(() => {
    if (!isAuthenticated()) return navigate("/auth");
    if (!isAdmin()) return navigate("/dashboard");

    fetchUserDetails();
    fetchUserPosts();
  }, []);

  // FILTERS UPDATE
  useEffect(() => {
    filterPosts();
  }, [posts, selectedYear, selectedMonth, selectedDate]);

  // FETCH USER BASIC DETAILS
  const fetchUserDetails = async () => {
    try {
      const response = await apiService.getUserById(userId);
      if (response.status) {
        setUser(response.data.user);
      }
    } catch (err) {}
  };

  // FETCH POSTS USING NEW HISTORY API
  const fetchUserPosts = async () => {
    try {
      const response = await apiService.getUserPostHistory(userId);

      if (response.status) {
        setPosts(response.data.posts || []);
      } else {
        setPosts([]);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to load post history",
        });
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to fetch post history",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // APPLY FILTERS
  const filterPosts = () => {
    let filtered = [...posts];

    if (selectedYear && selectedYear !== "all") {
      filtered = filtered.filter(
        (p) => new Date(p.created_at).getFullYear().toString() === selectedYear
      );
    }

    if (selectedMonth && selectedMonth !== "all") {
      filtered = filtered.filter(
        (p) =>
          (new Date(p.created_at).getMonth() + 1)
            .toString()
            .padStart(2, "0") === selectedMonth
      );
    }

    if (selectedDate) {
      filtered = filtered.filter(
        (p) => p.created_at.split("T")[0] === selectedDate
      );
    }

    setFilteredPosts(filtered);
  };

  const resetFilters = () => {
    setSelectedYear(undefined);
    setSelectedMonth(undefined);
    setSelectedDate("");
  };

  const getYearOptions = () => {
    const years = new Set<number>();
    posts.forEach((p) => years.add(new Date(p.created_at).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
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

  if (isLoading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin h-12 w-12 rounded-full border-b-4 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">
                <span
                  className={`text-transparent bg-clip-text ${primaryGradientClass}`}
                >
                  User Posts Report
                </span>
              </h1>

              {user && (
                <p className="mt-2 text-gray-600 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {user.user_name} ({user.email})
                </p>
              )}
            </div>

            <Button variant="outline" onClick={() => navigate("/admin/report")}>
              Back to Reports
            </Button>
          </div>
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
                  value={selectedYear || "all"}
                  onValueChange={(v) =>
                    setSelectedYear(v === "all" ? undefined : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {getYearOptions().map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* MONTH */}
              <div className="space-y-2">
                <label>Month</label>
                <Select
                  value={selectedMonth || "all"}
                  onValueChange={(v) =>
                    setSelectedMonth(v === "all" ? undefined : v)
                  }
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
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
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

            <p className="mt-3 text-sm text-gray-600">
              Showing {filteredPosts.length} of {posts.length} posts
            </p>
          </CardContent>
        </Card>

        {/* POSTS TABLE */}
        <Card className="shadow-lg border-2 border-indigo-100/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Posts ({filteredPosts.length})
            </CardTitle>
          </CardHeader>

          <CardContent>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No posts found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>{post.title || "Untitled"}</TableCell>

                        <TableCell>
                          <Badge>{post.status}</Badge>
                        </TableCell>

                        <TableCell>
                          <Badge>
                            {post.is_ai_generated ? "AI Generated" : "Manual"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {new Date(post.created_at).toLocaleDateString()}
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/admin/users/${userId}`, {
                                state: { postId: post.id },
                              })
                            }
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserPostsReport;
