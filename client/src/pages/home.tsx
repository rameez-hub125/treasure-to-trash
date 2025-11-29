import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, Leaf, Recycle, Users, Coins, MapPin, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { DashboardStats } from "@shared/schema";

function AnimatedGlobe() {
  return (
    <div className="relative w-32 h-32 mx-auto mb-8">
      <div className="absolute inset-0 rounded-full bg-primary opacity-20 animate-pulse"></div>
      <div className="absolute inset-2 rounded-full bg-primary opacity-40 animate-ping"></div>
      <div className="absolute inset-4 rounded-full bg-primary/60 opacity-60 animate-spin" style={{ animationDuration: '3s' }}></div>
      <div className="absolute inset-6 rounded-full bg-primary/80 opacity-80 animate-bounce" style={{ animationDuration: '2s' }}></div>
      <Leaf className="absolute inset-0 m-auto h-16 w-16 text-primary animate-pulse" />
    </div>
  );
}

function ImpactCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) {
  const formattedValue = typeof value === 'number' ? value.toLocaleString('en-US', { maximumFractionDigits: 1 }) : value;

  return (
    <div className="p-6 rounded-xl bg-muted border border-border transition-all duration-300 ease-in-out hover-elevate">
      <Icon className="h-10 w-10 text-primary mb-4" />
      <p className="text-3xl font-bold mb-2 text-foreground" data-testid={`text-impact-${title.toLowerCase().replace(/\s+/g, '-')}`}>{formattedValue}</p>
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="bg-card p-8 rounded-xl border border-card-border hover-elevate transition-all duration-300 ease-in-out flex flex-col items-center text-center">
      <div className="bg-primary/10 p-4 rounded-full mb-6">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-4 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const impactData = {
    wasteCollected: stats?.totalWasteCollected ?? 0,
    reportsSubmitted: stats?.totalReports ?? 0,
    tokensEarned: stats?.tokensDistributed ?? 0,
    co2Offset: stats?.co2Offset ?? 0,
  };

  const login = () => {
    setLoggedIn(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Leaf className="h-8 w-8 text-primary" />
          <span className="text-xl font-semibold text-foreground">Zero-to-Hero</span>
        </div>
        <Link href="/admin/login">
          <Button variant="outline" className="gap-2" data-testid="button-admin-login">
            <Shield className="h-4 w-4" />
            Admin
          </Button>
        </Link>
      </header>

      <div className="container mx-auto px-4 py-16">
        <section className="text-center mb-20">
          <AnimatedGlobe />
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground tracking-tight">
            Zero-to-Hero <span className="text-primary">Waste Management</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Join our community in making waste management more efficient and rewarding!
          </p>
          {!loggedIn ? (
            <Button 
              onClick={login} 
              size="lg"
              className="text-lg py-6 px-10 rounded-full font-medium transition-all duration-300 ease-in-out transform hover:scale-105"
              data-testid="button-get-started"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button 
              size="lg"
              className="text-lg py-6 px-10 rounded-full font-medium transition-all duration-300 ease-in-out transform hover:scale-105"
              data-testid="button-report-waste"
            >
              Report Waste
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </section>

        <section className="grid md:grid-cols-3 gap-10 mb-20">
          <FeatureCard
            icon={Leaf}
            title="Eco-Friendly"
            description="Contribute to a cleaner environment by reporting and collecting waste."
          />
          <FeatureCard
            icon={Coins}
            title="Earn Rewards"
            description="Get tokens for your contributions to waste management efforts."
          />
          <FeatureCard
            icon={Users}
            title="Community-Driven"
            description="Be part of a growing community committed to sustainable practices."
          />
        </section>

        <section className="bg-card p-10 rounded-3xl border border-card-border mb-20">
          <h2 className="text-4xl font-bold mb-12 text-center text-foreground">Our Impact</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <ImpactCard title="Waste Collected" value={`${impactData.wasteCollected} kg`} icon={Recycle} />
            <ImpactCard title="Reports Submitted" value={impactData.reportsSubmitted.toString()} icon={MapPin} />
            <ImpactCard title="Tokens Earned" value={impactData.tokensEarned.toString()} icon={Coins} />
            <ImpactCard title="CO2 Offset" value={`${impactData.co2Offset} kg`} icon={Leaf} />
          </div>
        </section>

        <footer className="text-center py-8 border-t border-border">
          <p className="text-muted-foreground">
            Made with care for a cleaner planet
          </p>
        </footer>
      </div>
    </div>
  );
}
