
import Navbar from "@/components/Navbar";
import AccountsList from "@/components/AccountsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useEffect } from "react";

const Accounts = () => {
  // On component mount, add animation classes
  useEffect(() => {
    const elements = document.querySelectorAll('.animate-on-mount');
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('animate-fade-up');
        el.classList.remove('opacity-0');
      }, index * 100);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container px-4 py-8">
        <div className="opacity-0 animate-on-mount">
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your financial accounts in one place
          </p>
        </div>
        
        <Card className="mt-8 opacity-0 animate-on-mount animation-delay-100">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Accounts</CardTitle>
            <Button className="gap-1">
              <PlusCircle size={16} />
              <span>Add New Account</span>
            </Button>
          </CardHeader>
          <CardContent>
            <AccountsList />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Accounts;
