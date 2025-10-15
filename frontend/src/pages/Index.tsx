import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Calendar, TrendingUp, Users, Shield, Twitter, Linkedin, Instagram } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react"; // <-- Import ज़रूरी है

// ---
// Floating blob component 
const Blob = ({ className, style, gradient }) => (
  <div
    // Note: 'animate-blob' class needs to be defined in your global CSS/Tailwind config
    className={`absolute rounded-full opacity-30 blur-3xl animate-blob ${className}`} 
    style={{
      ...style,
      background: gradient || "linear-gradient(45deg, rgb(129, 140, 248), rgb(56, 189, 248))", 
    }}
  />
);

const BackgroundTexture = () => (
    <div className="absolute inset-0 bg-white z-0">
        {/* Using simple opacity for a cleaner look if grid.svg is missing */}
        <div className="absolute inset-0 bg-gray-100 opacity-20" /> 
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50/50 to-white" />
    </div>
);

// ---
// NEW: Mouse Spotlight Component (Made stronger for visibility)
const MouseSpotlight = ({ mousePos }) => {
  
    return (
        <div
            className="pointer-events-none fixed inset-0 z-[100] transition duration-300" // Higher z-index to ensure visibility
            style={{
                background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, rgba(101, 199, 241, 0.38), transparent 80%)`,
            }}
        />
    );
};
// ---

const Index = () => {
  const navigate = useNavigate();
  // State to track mouse position
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Effect to update mouse position on movement
  useEffect(() => {
    const handleMouseMove = (event) => {
      // clientX and clientY give coordinates relative to the viewport
      setMousePos({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []); 

  const features = [
    { icon: Sparkles, title: "AI-Powered Content", description: "Generate engaging social media posts using advanced AI algorithms." },
    { icon: Calendar, title: "Smart Scheduling", description: "Plan and schedule posts across all your platforms efficiently." },
    { icon: TrendingUp, title: "Analytics Dashboard", description: "Track performance and engagement in real-time." },
    { icon: Users, title: "Multi-Platform Support", description: "Post seamlessly to Facebook, Instagram, Twitter, and LinkedIn." },
  ];

  const primaryGradient = "from-indigo-600 to-cyan-500"; 
  const primaryGradientClass = `bg-gradient-to-r ${primaryGradient}`;

  return (
    // Base background is light
    <div className="relative min-h-screen overflow-hidden bg-gray-50">
      <BackgroundTexture />

      {/* The Mouse Spotlight component - Must be placed early to cover the background */}
      <MouseSpotlight mousePos={mousePos} /> 

      {/* Floating Blobs (z-index adjusted to be below the spotlight but above background) */}
      <Blob className="w-72 h-72 top-10 left-[-2rem] z-10" style={{ animationDuration: "25s" }} gradient="linear-gradient(45deg, #818CF8, #38BDF8)" />
      <Blob className="w-96 h-96 bottom-0 right-[-5rem] z-10" style={{ animationDuration: "30s" }} gradient="linear-gradient(135deg, #10B981, #06B6D4)" />
      <Blob className="w-80 h-80 top-1/4 left-1/4 opacity-25 z-10" style={{ animationDuration: "28s" }} gradient="linear-gradient(225deg, #A78BFA, #FBBF24)" />

      {/* Navigation - Glassmorphism effect. High z-index is crucial. */}
      <nav className="border-b border-gray-200 bg-white/70 backdrop-blur-lg sticky top-0 z-40 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">SocialPost <span className="text-cyan-500">AI</span></span>
          </div>
          <div className="space-x-2">
            <Button variant="ghost" className="text-gray-700 hover:bg-indigo-50" onClick={() => navigate("/auth")}>Sign In</Button>
            <Button className={`${primaryGradientClass} text-white font-semibold shadow-lg shadow-indigo-400/50 hover:shadow-indigo-400/70 transition-shadow`} onClick={() => navigate("/auth")}>
                Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Content Sections (z-index adjusted to stack correctly) */}
      <section className="container mx-auto px-4 py-32 text-center relative z-20">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-6xl md:text-8xl font-extrabold tracking-tight mb-6 text-gray-900"
        >
          <span className="block mb-4">Future-Proof Your</span>
          <span className={`text-transparent bg-clip-text ${primaryGradientClass}`}>Social Media Strategy</span>
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-2xl text-gray-700 mb-12 max-w-4xl mx-auto font-light"
        >
          Create, schedule, and manage your social media posts with the power of **Generative AI**. Save time and boost engagement across all platforms.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex gap-4 justify-center"
        >
          <Button
            size="lg"
            className={`${primaryGradientClass} text-white font-extrabold px-10 py-5 text-xl rounded-2xl shadow-2xl shadow-indigo-500/50 hover:scale-[1.03] transition-transform duration-300`}
            onClick={() => navigate("/auth")}
          >
            <Sparkles className="mr-2 h-6 w-6 animate-pulse" />
            Start Free Trial Now
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-indigo-600 text-indigo-600 px-10 py-5 text-xl rounded-2xl hover:bg-indigo-50 transition-colors"
            onClick={() => navigate("/auth")}
          >
            View Demo
          </Button>
        </motion.div>
      </section>
      
      {/* Features Section */}
      <section className="container mx-auto px-4 py-24 relative z-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Everything You Need <span className="text-cyan-500">to Achieve Max Impact</span></h2>
          <p className="text-gray-600 text-lg">Powerful, innovative features built on cutting-edge AI research</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, boxShadow: "0 15px 30px rgba(79, 70, 229, 0.2)" }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Card className="h-full bg-white/70 backdrop-blur-md border border-white/50 shadow-xl rounded-2xl transition-all duration-300">
                <CardHeader className="text-center p-6">
                  <feature.icon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                  <CardTitle className="text-xl font-bold text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-24 relative z-20 bg-gray-50">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Simple, <span className="text-indigo-600">Scalable</span> Pricing</h2>
          <p className="text-gray-600 text-lg">Choose the plan that fits your ambition and scale</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { title: "Starter", description: "Perfect for getting started", price: "$0", features: ["10 posts per month", "5 AI-generated posts", "1 linked account", "Basic analytics"], variant: "outline" },
            { title: "Pro", description: "For power creators & small teams", price: "$29.99", features: ["100 posts per month", "50 AI-generated posts", "5 linked accounts", "Priority support", "Advanced Analytics"], variant: "solid" },
            { title: "Enterprise", description: "For large agencies and businesses", price: "$99.99", features: ["Unlimited posts", "Unlimited AI posts", "Unlimited accounts", "Premium support", "Dedicated Account Manager"], variant: "outline" },
          ].map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, duration: 0.6 }}
            >
              <Card className={`relative p-2 rounded-2xl transition-transform h-full ${plan.variant === "solid" ? "border-2 border-indigo-600 shadow-2xl shadow-indigo-500/30 bg-white" : "bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-teal-500/50"}`}>
                <div className="p-4 rounded-xl h-full flex flex-col">
                    {plan.title === "Pro" && (
                        <div className="absolute top-0 right-0 transform translate-y-[-50%] translate-x-1 bg-indigo-600 text-white text-sm px-4 py-1 rounded-full font-bold shadow-xl">MOST POPULAR</div>
                    )}
                    <CardHeader className="text-center">
                        <CardTitle className={`text-3xl font-extrabold ${plan.variant === "solid" ? "text-indigo-600" : "text-gray-900"}`}>{plan.title}</CardTitle>
                        <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                        <div className="text-5xl font-extrabold mt-6 text-gray-900">{plan.price}</div>
                        <p className="text-base text-gray-500">per month</p>
                    </CardHeader>
                    <CardContent className="space-y-3 mt-4 flex-grow">
                        {plan.features.map((feat, i) => (
                            <p key={i} className="text-base flex items-center text-gray-700">
                                <Sparkles className="h-4 w-4 mr-2 text-teal-500 flex-shrink-0" /> {feat}
                            </p>
                        ))}
                    </CardContent>
                    <div className="p-4">
                        <Button
                            className={`w-full mt-4 transition-transform hover:scale-[1.02] ${plan.variant === "solid" ? primaryGradientClass : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
                            onClick={() => navigate("/auth")}
                        >
                            Choose Plan
                        </Button>
                    </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24 text-center relative z-20">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Card className="max-w-3xl mx-auto p-12 bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-indigo-200/50">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-4xl font-bold text-gray-900">Ready to <span className="text-indigo-600">Elevate</span> Your Strategy?</CardTitle>
              <CardDescription className="text-xl text-gray-700 mt-2">
                Join thousands of creators managing their social media with the most advanced AI platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Button
                size="lg"
                className={`${primaryGradientClass} text-white font-extrabold px-10 py-5 text-xl rounded-2xl shadow-2xl shadow-indigo-500/40 hover:scale-[1.05] transition-transform duration-300`}
                onClick={() => navigate("/auth")}
              >
                <Sparkles className="mr-2 h-6 w-6 animate-spin" />
                Get Started Today
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm relative z-20">
        <div className="h-1 w-full bg-gradient-to-r from-indigo-600 to-cyan-500" />
        <div className="container mx-auto px-4 py-8 text-center text-sm text-gray-600">
          <div className="flex justify-center gap-6 mb-4">
            <Twitter className="w-6 h-6 text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer" />
            <Linkedin className="w-6 h-6 text-gray-500 hover:text-teal-500 transition-colors cursor-pointer" />
            <Instagram className="w-6 h-6 text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer" />
          </div>
          <p>© 2025 SocialPost AI. All rights reserved. | <a href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</a></p>
        </div>
      </footer>
    </div>
  );
};

export default Index;