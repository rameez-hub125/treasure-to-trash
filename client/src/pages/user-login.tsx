import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Loader2 } from "lucide-react";
import { useUserAuth } from "@/lib/user-auth";
import { useToast } from "@/hooks/use-toast";

export default function UserLogin() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { login } = useUserAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, name);
      if (success) {
        toast({
          title: "Success",
          description: "Welcome to Zero-to-Hero!",
        });
        setLocation("/user/dashboard");
      } else {
        toast({
          title: "Error",
          description: "Failed to login. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Leaf className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Join Zero-to-Hero</CardTitle>
          <CardDescription>
            Report waste and earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                data-testid="input-name"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Gmail Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">Please use your Gmail account</p>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Signing in..." : "Get Started"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-4">
            <a href="/" className="text-primary hover:underline" data-testid="link-home">
              Back to home
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
