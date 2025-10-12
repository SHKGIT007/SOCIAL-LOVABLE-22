import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Calendar, TrendingUp, Users, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Content",
      description: "Generate engaging social media posts with advanced AI technology",
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Plan and schedule your posts across multiple platforms",
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "Track performance and engagement across all your posts",
    },
    {
      icon: Users,
      title: "Multi-Platform Support",
      description: "Post to Facebook, Instagram, Twitter, and LinkedIn",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">SocialPost AI</span>
          </div>
          <div className="space-x-2">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth")}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          AI-Powered Social Media Management
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Create, schedule, and manage your social media posts with the power of AI.
          Save time and boost engagement across all your platforms.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate("/auth")}>
            <Sparkles className="mr-2 h-5 w-5" />
            Start Free Trial
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
            Learn More
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
          <p className="text-muted-foreground">
            Powerful features to streamline your social media workflow
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <feature.icon className="h-10 w-10 text-primary mb-2" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground">Choose the plan that fits your needs</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="text-3xl font-bold mt-4">$0</div>
              <p className="text-sm text-muted-foreground">per month</p>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">✓ 10 posts per month</p>
              <p className="text-sm">✓ 5 AI-generated posts</p>
              <p className="text-sm">✓ 1 linked account</p>
              <Button className="w-full mt-4" variant="outline" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary shadow-lg">
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>For professionals</CardDescription>
              <div className="text-3xl font-bold mt-4">$29.99</div>
              <p className="text-sm text-muted-foreground">per month</p>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">✓ 100 posts per month</p>
              <p className="text-sm">✓ 50 AI-generated posts</p>
              <p className="text-sm">✓ 5 linked accounts</p>
              <p className="text-sm">✓ Priority support</p>
              <Button className="w-full mt-4" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <CardDescription>For businesses</CardDescription>
              <div className="text-3xl font-bold mt-4">$99.99</div>
              <p className="text-sm text-muted-foreground">per month</p>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">✓ Unlimited posts</p>
              <p className="text-sm">✓ Unlimited AI posts</p>
              <p className="text-sm">✓ Unlimited accounts</p>
              <p className="text-sm">✓ Premium support</p>
              <Button className="w-full mt-4" variant="outline" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardHeader>
            <CardTitle className="text-3xl">Ready to Get Started?</CardTitle>
            <CardDescription className="text-lg">
              Join thousands of creators managing their social media with AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" onClick={() => navigate("/auth")}>
              <Sparkles className="mr-2 h-5 w-5" />
              Start Your Free Trial
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 SocialPost AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
