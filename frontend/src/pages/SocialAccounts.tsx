import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { API_CONFIG } from "@/utils/config";
import { redirect } from "react-router-dom";

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

    console.log("accounts:", accounts);

    useEffect(() => {
        fetchAccounts();
    }, []);

    useEffect(() => {
        const fbAcc = accounts.find(acc => acc.platform === "Facebook");
        if (fbAcc) {
            setFbAppId(fbAcc.app_id || "");
            setFbAppSecret(fbAcc.app_secret || "");
        }
        const igAcc = accounts.find(acc => acc.platform === "Instagram");
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
            console.log('Initiating OAuth for', platform);
            if (platform === "Facebook") {
                const fbAcc = accounts.find(acc => acc.platform === "Facebook");
                let user_id = fbAcc ? fbAcc.user_id : null;
                let app_id = fbAppId
                let app_secret = fbAppSecret
                let redirect_uri = `https://socialvibe.tradestreet.in/backend/facebook/callback`

                //    const url = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${appid}&redirect_uri=${encodeURIComponent(`https://hometalent4u.in/backend/facebook/callback`)}&state=123&response_type=code&scope=public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts`;
                if (!app_id || !app_secret || !redirect_uri || !user_id) {
                    toast({ title: "Error", description: "Please save Facebook App ID/Secret first.", variant: "destructive" });
                    setIsLoading(false);
                    return;
                }

                let stateData = {
                    user_id: user_id,
                    app_id: app_id,
                    app_secret: app_secret,
                    redirect_uri: redirect_uri,
                    redirect_dashboard: "http://localhost:8080/dashboard"
                };

                const state = encodeURIComponent(JSON.stringify(stateData));

                const url = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${app_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}&response_type=code&scope=public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts`;

                window.location.href = url;



            } else if (platform === "Instagram") {

                //     dgg {
                // 'hub.mode': 'subscribe',
                // 'hub.challenge': '793876193',
                // 'hub.verify_token': 'nilesh'
                // }
                // ✅ Webhook verified successfully


                // for instgram

                let appid = '1579224306600577'

                // secretkey = a61184184766a15c03154b899db189c7
                // callbackUrl = https://hometalent4u.in/backend/facebook/callback
                //  VERIFY_TOKEN = "nilesh"; 

                // https://api.instagram.com/oauth/authorize
                // ?client_id={app-id}
                // &redirect_uri={redirect-uri}
                // &scope=user_profile,user_media
                // &response_type=code


                const oauthUrl = `https://api.instagram.com/oauth/authorize?client_id=${appid}&redirect_uri=${encodeURIComponent(`https://hometalent4u.in/backend/facebook/callback`)}&scope=user_profile,user_media&response_type=code`;
                window.location.href = oauthUrl;






            }




            //   window.location.href = oauthUrl;
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
        <DashboardLayout>
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
                                {accounts && accounts?.map((acc) => (
                                    <div key={acc.id} className="flex items-center justify-between border-b pb-2">
                                        {
                                            Number(acc.is_active) == 1 ?
                                                <>
                                                    <div>
                                                        <Badge>{acc.platform}</Badge> {acc.account_name || acc.account_id}
                                                    </div>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDisconnect(acc.id)} disabled={isLoading}>Disconnect</Button>
                                                </>

                                                : ""
                                        }


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
