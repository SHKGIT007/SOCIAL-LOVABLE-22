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
import { Calendar, Filter, User, FileText } from "lucide-react";
import { Tab } from "@headlessui/react";

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
  Posts: Post[];
}

const UserPostsReport = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states - Initialize with undefined instead of empty string
  const [selectedYear, setSelectedYear] = useState<string | undefined>(
    undefined
  );
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(
    undefined
  );
  const [selectedDate, setSelectedDate] = useState<string>("");

  const primaryGradient = "from-indigo-600 to-cyan-500";
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, selectedYear, selectedMonth, selectedDate]);

  const checkAdminAndFetchData = () => {
    if (!isAuthenticated()) {
      navigate("/auth");
      return;
    }

    if (!isAdmin()) {
      navigate("/dashboard");
      return;
    }

    fetchUserData();
  };

  const fetchUserData = async () => {
    try {
      const response = await apiService.getUserById(userId);

      if (response.status === true) {
        const userData = response.data.user;
        setUser(userData);
        setPosts(userData.Posts || []);

        // Set default to current month
        // const now = new Date();
        // setSelectedYear(now.getFullYear().toString());
        // setSelectedMonth((now.getMonth() + 1).toString().padStart(2, "0"));
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to fetch user data.",
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
        text: error.message || "Failed to fetch user data.",
        confirmButtonColor: "#6366f1",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = [...posts];

    if (selectedYear && selectedYear !== "all") {
      filtered = filtered.filter((post) => {
        const postDate = new Date(post.created_at);
        return postDate.getFullYear().toString() === selectedYear;
      });
    }

    if (selectedMonth && selectedMonth !== "all") {
      filtered = filtered.filter((post) => {
        const postDate = new Date(post.created_at);
        return (
          (postDate.getMonth() + 1).toString().padStart(2, "0") ===
          selectedMonth
        );
      });
    }

    if (selectedDate) {
      filtered = filtered.filter((post) => {
        const postDate = new Date(post.created_at);
        return postDate.toISOString().split("T")[0] === selectedDate;
      });
    }

    setFilteredPosts(filtered);
  };

  const resetFilters = () => {
    setSelectedYear(undefined);
    setSelectedMonth(undefined);
    setSelectedDate("");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: "secondary" as const, label: "Draft" },
      scheduled: { variant: "default" as const, label: "Scheduled" },
      published: { variant: "default" as const, label: "Published" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "secondary" as const,
      label: status,
    };

    return (
      <Badge variant={config.variant} className="capitalize">
        {config.label}
      </Badge>
    );
  };

  const getYearOptions = () => {
    const years = new Set<number>();
    posts.forEach((post) => {
      years.add(new Date(post.created_at).getFullYear());
    });
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
        <div className="flex items-center justify-center h-full min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
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

        {/* Filters Card */}
        <Card className="shadow-lg border-2 border-indigo-100/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Year Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Year
                </label>
                <Select
                  value={selectedYear || "all"}
                  onValueChange={(value) =>
                    setSelectedYear(value === "all" ? undefined : value)
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

              {/* Month Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Month
                </label>
                <Select
                  value={selectedMonth || "all"}
                  onValueChange={(value) =>
                    setSelectedMonth(value === "all" ? undefined : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {monthNames.map((month, index) => (
                      <SelectItem
                        key={index}
                        value={(index + 1).toString().padStart(2, "0")}
                      >
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Specific Date
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Reset Button */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 invisible">
                  Actions
                </label>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="w-full"
                >
                  Reset
                </Button>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredPosts.length} of {posts.length} posts
            </div>
          </CardContent>
        </Card>

        {/* Posts Table */}
        <Card className="shadow-lg border-2 border-indigo-100/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Posts ({filteredPosts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No posts found</p>
                <p className="text-sm">Try adjusting your filters</p>
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
                      <TableHead>Scheduled/Published</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium max-w-xs truncate">
                          {post.title || "Untitled"}
                        </TableCell>
                        <TableCell>{getStatusBadge(post.status)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              post.is_ai_generated ? "default" : "outline"
                            }
                            className={
                              post.is_ai_generated
                                ? "bg-purple-100 text-purple-800 border-purple-300"
                                : ""
                            }
                          >
                            {post.is_ai_generated ? "AI Generated" : "Manual"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(post.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </TableCell>
                       <TableCell>
                        {post.status }
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                navigate(`/admin/users/${userId}`);
                            }}
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
