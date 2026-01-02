import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Swal from "sweetalert2";
import { apiService } from "@/services/api";
import { API_CONFIG } from "@/utils/config";
import { redirect } from "react-router-dom";
import { platform } from "os";

const platforms = ["Facebook", "Instagram"];

const SocialAccounts = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [fbAppId, setFbAppId] = useState("");
  const [fbAppSecret, setFbAppSecret] = useState("");
  const [igAppId, setIgAppId] = useState("");
  const [igAppSecret, setIgAppSecret] = useState("");
  const OAUTH_URLS = {
    Facebook: `${API_CONFIG.BASE_URL}/social-accounts/oauth/facebook`,
    Instagram: `${API_CONFIG.BASE_URL}/social-accounts/oauth/instagram`,
  };
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    const fbAcc = accounts.find((acc) => acc.platform === "Facebook");
    if (fbAcc) {
      setFbAppId(fbAcc.app_id || "");
      setFbAppSecret(fbAcc.app_secret || "");
    }
    const igAcc = accounts.find((acc) => acc.platform === "Instagram");
    if (igAcc) {
      setIgAppId(igAcc.app_id || "");
      setIgAppSecret(igAcc.app_secret || "");
    }
  }, [accounts]);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getMySocialAccounts();
      setAccounts(res.data.socialAccounts || []);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to fetch accounts",
        confirmButtonColor: "#6366f1",
      });
    } finally {
      setIsLoading(false);
    }
  };

const getLocalUserId = () => {
  const raw = localStorage.getItem("social_lovable_auth");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return parsed?.user?.id ?? null;
  } catch (err) {
    console.error("Error parsing auth:", err);
    return null;
  }
};


 const handleSave = async (platform: "Facebook" | "Instagram") => {
  let appId = "", appSecret = "";
  let existing;

  if (platform === "Facebook") {
    appId = fbAppId;
    appSecret = fbAppSecret;
    existing = accounts.find((acc) => acc.platform === "Facebook");
  } else {
    appId = igAppId;
    appSecret = igAppSecret;
    existing = accounts.find((acc) => acc.platform === "Instagram");
  }

  // ❗ If blank → error
  if (!appId || !appSecret) {
    return Swal.fire({
      icon: "error",
      title: "Error",
      text: "App ID and Secret are required.",
      confirmButtonColor: "#6366f1",
    });
  }

  // ❗ If nothing changed → show "No changes made"
  if (existing && existing.app_id === appId && existing.app_secret === appSecret) {
    return Swal.fire({
      icon: "info",
      title: "No changes made",
      text: `${platform} App ID/Secret are already the same.`,
      confirmButtonColor: "#6366f1",
    });
  }

  // ❗ Save Confirm Popup
  const confirm = await Swal.fire({
    icon: "question",
    title: "Confirm Save",
    text: `Do you want to save changes for ${platform}?`,
    showCancelButton: true,
    confirmButtonColor: "#6366f1",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, save",
  });

  if (!confirm.isConfirmed) return;

  // Proceed to save
  try {
    setIsLoading(true);

    if (existing) {
      await apiService.updateSocialAccountCredentials({
        platform,
        app_id: appId,
        app_secret: appSecret,
      });
      Swal.fire({
        icon: "success",
        title: "Updated",
        text: `${platform} credentials updated.`,
        confirmButtonColor: "#6366f1",
      });
    } else {
      await apiService.createSocialAccount({
        platform,
        app_id: appId,
        app_secret: appSecret,
      });
      Swal.fire({
        icon: "success",
        title: "Saved",
        text: `${platform} App ID/Secret saved.`,
        confirmButtonColor: "#6366f1",
      });
    }

    fetchAccounts();
  } catch (error: any) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message || "Failed to save App ID/Secret",
      confirmButtonColor: "#6366f1",
    });
  } finally {
    setIsLoading(false);
  }
};


const handleConnect = async (platform: "Facebook" | "Instagram") => {

  // ❗ Confirmation before connecting
  const confirm = await Swal.fire({
    icon: "question",
    title: `Connect ${platform}?`,
    text: `Do you want to continue connecting your ${platform} account?`,
    showCancelButton: true,
    confirmButtonColor: "#6366f1",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, continue",
  });

  if (!confirm.isConfirmed) return;

  setIsLoading(true);

  try {
    const user_id = getLocalUserId();
    const connectedAccounts = await apiService.getconnnectedAccounts({ user_id });

    if (!connectedAccounts.status) {
      Swal.fire({
        icon: "error",
        title: "No active subscription",
        text: connectedAccounts.message,
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    if (connectedAccounts.connected_accounts_count >= connectedAccounts.limitcount) {
      Swal.fire({
        icon: "error",
        title: "Limit Reached",
        text: `You have reached your limit of ${connectedAccounts.limitcount} connected accounts.`,
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    // Rest of your existing logic continues untouched....
    if (platform === "Facebook") {
      const fbAcc = accounts.find((acc) => acc.platform === "Facebook");
      let user_id = fbAcc ? fbAcc.user_id : null;
      let app_id = fbAppId;
      let app_secret = fbAppSecret;
      let redirect_uri = `https://socialvibe.tradestreet.in/backend/facebook/callback`;

      if (!app_id || !app_secret || !redirect_uri || !user_id) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please save Facebook App ID/Secret first.",
          confirmButtonColor: "#6366f1",
        });
        return;
      }

      const state = encodeURIComponent(
        JSON.stringify({
          user_id,
          app_id,
          app_secret,
          redirect_uri,
          redirect_dashboard: "http://localhost:8080/dashboard",
        })
      );

      const scopes = [
        "public_profile",
        "email",
        "pages_show_list",
        "pages_read_engagement",
        "pages_manage_posts",
        "instagram_basic",
        "instagram_manage_insights",
        "instagram_manage_comments",
        "instagram_content_publish",
        "instagram_manage_messages",
      ].join(",");

      const url = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${app_id}&redirect_uri=${encodeURIComponent(
        redirect_uri
      )}&state=${state}&response_type=code&scope=${encodeURIComponent(scopes)}`;
      window.location.href = url;
    } else {
      const igAcc = accounts.find((acc) => acc.platform === "Instagram");
      let app_id = igAppId;
      let app_secret = igAppSecret;
      let redirect_uri = `https://socialvibe.tradestreet.in/backend/instagram/callback`;

      if (!app_id || !app_secret || !redirect_uri || !igAcc) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please save Instagram App ID/Secret first.",
          confirmButtonColor: "#6366f1",
        });
        return;
      }

      const state = encodeURIComponent(
        JSON.stringify({
          user_id: igAcc ? igAcc.user_id : null,
          app_id,
          app_secret,
          redirect_uri,
          redirect_dashboard: "http://localhost:8080/dashboard",
        })
      );

      const oauthUrl = `https://www.instagram.com/oauth/authorize?client_id=${app_id}&redirect_uri=${encodeURIComponent(
        redirect_uri
      )}&state=${state}&response_type=code&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish`;
      window.location.href = oauthUrl;
    }
  } finally {
    setIsLoading(false);
  }
};


  const handleDisconnect = async (id: any) => {
    setIsLoading(true);
    try {
      await apiService.updateSocialAccountCredentials({ is_active: 0, id });
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Account disconnected.",
        confirmButtonColor: "#6366f1",
      });
      fetchAccounts();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to disconnect account",
        confirmButtonColor: "#6366f1",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fbConnected = !!accounts.find((acc) => acc.platform === "Facebook" && Number(acc.is_active) === 1);
  const igConnected = !!accounts.find((acc) => acc.platform === "Instagram" && Number(acc.is_active) === 1);

  return (
    <DashboardLayout>
      <div className=" space-y-8">
        {/* Header */}
        <div>
          <h1 className="flex items-baseline gap-2 text-3xl font-extrabold">
            <span className="bg-gradient-to-r from-indigo-600 to-sky-400 bg-clip-text text-transparent">Social</span>
            <span className="text-gray-900">Accounts</span>
          </h1>
          <p className="text-muted-foreground">
            Connect Facebook / Instagram to publish and fetch insights.
          </p>
        </div>

        {/* Parent elevated card */}
        <Card className="border-indigo-100/70 shadow-xl hover:shadow-2xl transition-shadow rounded-2xl">
          <CardHeader className="pb-0">
            <CardTitle className="text-gray-800">Connect Social Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* FACEBOOK */}
         {/* FACEBOOK CARD */}
{!fbConnected && (
  <div className="relative rounded-2xl border border-indigo-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_25px_rgba(99,102,241,0.12)] transition-all duration-300">
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-lg font-semibold text-gray-900">Facebook</h3>
      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
        Not Connected
      </span>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="space-y-2">
        <Label>Facebook App ID</Label>
        <Input
          value={fbAppId}
          onChange={(e) => setFbAppId(e.target.value)}
          placeholder="Facebook App ID"
          className="bg-white border-gray-200 shadow-sm focus-visible:ring-indigo-500"
        />
      </div>
      <div className="space-y-2">
        <Label>Facebook App Secret</Label>
        <Input
          value={fbAppSecret}
          onChange={(e) => setFbAppSecret(e.target.value)}
          placeholder="Facebook App Secret"
          type="password"
          className="bg-white border-gray-200 shadow-sm focus-visible:ring-indigo-500"
        />
      </div>
    </div>

    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <Button
        className="w-full h-10 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-medium shadow-md hover:shadow-lg active:scale-[0.99] transition-all"
        onClick={() => handleSave('Facebook')}
        disabled={isLoading}
      >
        Save
      </Button>
      <Button
        className="w-full h-10 bg-indigo-700 hover:bg-indigo-800 text-white font-medium shadow-md hover:shadow-lg active:scale-[0.99] transition-all"
        onClick={() => handleConnect('Facebook')}
        disabled={isLoading}
      >
        Connect
      </Button>
    </div>

    <div className="absolute inset-0 rounded-2xl pointer-events-none ring-1 ring-transparent hover:ring-[3px] hover:ring-indigo-400/40 transition-all duration-300" />
  </div>
)}

{/* INSTAGRAM CARD */}
{!igConnected && (
  <div className="relative rounded-2xl border border-pink-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_25px_rgba(244,114,182,0.15)] transition-all duration-300">
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-lg font-semibold text-gray-900">Instagram</h3>
      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
        Not Connected
      </span>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="space-y-2">
        <Label>Instagram App ID</Label>
        <Input
          value={igAppId}
          onChange={(e) => setIgAppId(e.target.value)}
          placeholder="Instagram App ID"
          className="bg-white border-gray-200 shadow-sm focus-visible:ring-pink-500"
        />
      </div>
      <div className="space-y-2">
        <Label>Instagram App Secret</Label>
        <Input
          value={igAppSecret}
          onChange={(e) => setIgAppSecret(e.target.value)}
          placeholder="Instagram App Secret"
          type="password"
          className="bg-white border-gray-200 shadow-sm focus-visible:ring-pink-500"
        />
      </div>
    </div>

    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <Button
        className="w-full h-10 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-500/90 hover:to-rose-400/90 text-white font-medium shadow-md hover:shadow-lg active:scale-[0.99] transition-all"
        onClick={() => handleSave('Instagram')}
        disabled={isLoading}
      >
        Save
      </Button>
      <Button
        className="w-full h-10 bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-md hover:shadow-lg active:scale-[0.99] transition-all"
        onClick={() => handleConnect('Instagram')}
        disabled={isLoading}
      >
        Connect
      </Button>
    </div>

    <div className="absolute inset-0 rounded-2xl pointer-events-none ring-1 ring-transparent hover:ring-[3px] hover:ring-pink-400/40 transition-all duration-300" />
  </div>

            )}
          </CardContent>
        </Card>

        {/* Connected Accounts */}
        <Card className="border-indigo-100/70 shadow-xl hover:shadow-2xl transition-shadow rounded-2xl">
          <CardHeader>
            <CardTitle className="text-gray-800">Connected Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <p className="text-muted-foreground">No accounts connected.</p>
            ) : (
              <div className="space-y-3">
                {accounts?.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm"
                  >
                    {Number(acc.is_active) === 1 ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="capitalize shadow-sm bg-gray-100 text-gray-800"
                          >
                            {acc.platform}
                          </Badge>
                          <span className="text-sm text-gray-700">
                            {acc.account_name || acc.account_id}
                          </span>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDisconnect(acc.id)}
                          disabled={isLoading}
                          className="shadow-sm"
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">{acc.platform} (inactive)</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SocialAccounts;
