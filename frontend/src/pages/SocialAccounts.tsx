import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { API_CONFIG } from "@/utils/config";

const platforms = ["Facebook", "Instagram"];

const SocialAccounts = () => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState([]);
  // App ID/Secret state
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

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getMySocialAccounts();
      setAccounts(res.data.socialAccounts || []);
    } catch (error) {
      toast({ title: "Error", description: error.message || "Failed to fetch accounts", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Save App ID/Secret to backend only
  const handleSave = async (platform) => {
    setIsLoading(true);
    let appId = "", appSecret = "";
    if (platform === "Facebook") {
      appId = fbAppId;
      appSecret = fbAppSecret;
    } else if (platform === "Instagram") {
      appId = igAppId;
      appSecret = igAppSecret;
    }
    if (!appId || !appSecret) {
      toast({ title: "Error", description: "App ID and Secret are required.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    try {
      // Check if account exists for this platform
      const existing = accounts.find(acc => acc.platform === platform);
      if (existing) {
        // Update credentials
        await apiService.updateSocialAccountCredentials({
          platform,
          app_id: appId,
          app_secret: appSecret
        });
        toast({ title: "Success", description: `${platform} credentials updated.` });
      } else {
        // Create new account
        await apiService.createSocialAccount({
          platform,
          app_id: appId,
          app_secret: appSecret
        });
        toast({ title: "Success", description: `${platform} App ID/Secret saved.` });
      }
      fetchAccounts();
    } catch (error) {
      toast({ title: "Error", description: error.message || "Failed to save App ID/Secret", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Start OAuth only (credentials must be saved already)
  const handleConnect = async (platform) => {
    setIsLoading(true);
    try {
      window.location.href = OAUTH_URLS[platform];
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async (id) => {
    setIsLoading(true);
    try {
      await apiService.deleteSocialAccount(id);
      toast({ title: "Success", description: "Account disconnected." });
      fetchAccounts();
    } catch (error) {
      toast({ title: "Error", description: error.message || "Failed to disconnect account", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Connect Social Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Facebook App ID</Label>
              <Input value={fbAppId} onChange={e => setFbAppId(e.target.value)} placeholder="Facebook App ID" />
              <Label>Facebook App Secret</Label>
              <Input value={fbAppSecret} onChange={e => setFbAppSecret(e.target.value)} placeholder="Facebook App Secret" type="password" />
              <div className="flex gap-2 mt-2">
                <Button
                  className="w-1/2 bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => handleSave("Facebook")}
                  disabled={isLoading}
                >
                  Save
                </Button>
                <Button
                  className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleConnect("Facebook")}
                  disabled={isLoading}
                >
                  Connect
                </Button>
              </div>
            </div>
            <div className="space-y-2 mt-6">
              <Label>Instagram App ID</Label>
              <Input value={igAppId} onChange={e => setIgAppId(e.target.value)} placeholder="Instagram App ID" />
              <Label>Instagram App Secret</Label>
              <Input value={igAppSecret} onChange={e => setIgAppSecret(e.target.value)} placeholder="Instagram App Secret" type="password" />
              <div className="flex gap-2 mt-2">
                <Button
                  className="w-1/2 bg-pink-400 hover:bg-pink-500 text-white"
                  onClick={() => handleSave("Instagram")}
                  disabled={isLoading}
                >
                  Save
                </Button>
                <Button
                  className="w-1/2 bg-pink-500 hover:bg-pink-600 text-white"
                  onClick={() => handleConnect("Instagram")}
                  disabled={isLoading}
                >
                  Connect
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-muted-foreground">No accounts connected.</p>
          ) : (
            <div className="space-y-4">
              {accounts.map((acc) => (
                <div key={acc.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <Badge>{acc.platform}</Badge> {acc.account_name || acc.account_id}
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDisconnect(acc.id)} disabled={isLoading}>Disconnect</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialAccounts;
