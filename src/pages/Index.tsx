
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Financial Dashboard</h1>
          {!user && (
            <Button onClick={() => navigate("/auth")}>Login / Sign Up</Button>
          )}
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Take Control of Your <span className="text-primary">Finances</span>
            </h2>
            <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
              Track expenses, manage budgets, and get personalized insights to make smarter financial decisions.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Learn More
            </Button>
          </div>
          
          <div className="pt-12">
            <img 
              src="/placeholder.svg" 
              alt="Dashboard Preview" 
              className="rounded-xl shadow-xl mx-auto max-w-full"
              width={1000}
              height={600}
            />
          </div>
        </div>
      </main>
      
      <footer className="border-t bg-muted/40">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © 2023 Financial Dashboard. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
