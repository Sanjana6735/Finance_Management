
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, X, Home, PieChart, CreditCard, Wallet, Clock, Settings, Bell, Moon, Sun } from "lucide-react";
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const isMobile = useIsMobile();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  const NavLinks = () => (
    <div className="flex items-center gap-6">
      <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
        <Home size={18} />
        <span>Dashboard</span>
      </Link>
      <Link to="/accounts" className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
        <Wallet size={18} />
        <span>Accounts</span>
      </Link>
      <Link to="/transactions" className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
        <CreditCard size={18} />
        <span>Transactions</span>
      </Link>
      <Link to="/budgets" className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
        <PieChart size={18} />
        <span>Budgets</span>
      </Link>
      <Link to="/payments" className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
        <Clock size={18} />
        <span>EMI & Payments</span>
      </Link>
    </div>
  );

  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
              <div className="absolute w-5 h-5 bg-primary-foreground rounded-full" style={{ top: -2, right: -2 }}></div>
            </div>
            <span className="text-xl font-semibold tracking-tight">Wealth</span>
          </Link>
          
          {!isMobile && <NavLinks />}
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            className="rounded-full"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full relative"
          >
            <Bell size={18} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
          </Button>
          
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <div className="flex flex-col gap-6 pt-6">
                  <Link to="/" className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
                      <div className="absolute w-5 h-5 bg-primary-foreground rounded-full" style={{ top: -2, right: -2 }}></div>
                    </div>
                    <span className="text-xl font-semibold tracking-tight">Wealth</span>
                  </Link>
                  
                  <div className="flex flex-col gap-4">
                    <Link to="/dashboard" className="flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md text-foreground/80 hover:bg-accent hover:text-primary transition-colors">
                      <Home size={18} />
                      <span>Dashboard</span>
                    </Link>
                    <Link to="/accounts" className="flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md text-foreground/80 hover:bg-accent hover:text-primary transition-colors">
                      <Wallet size={18} />
                      <span>Accounts</span>
                    </Link>
                    <Link to="/transactions" className="flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md text-foreground/80 hover:bg-accent hover:text-primary transition-colors">
                      <CreditCard size={18} />
                      <span>Transactions</span>
                    </Link>
                    <Link to="/budgets" className="flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md text-foreground/80 hover:bg-accent hover:text-primary transition-colors">
                      <PieChart size={18} />
                      <span>Budgets</span>
                    </Link>
                    <Link to="/payments" className="flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md text-foreground/80 hover:bg-accent hover:text-primary transition-colors">
                      <Clock size={18} />
                      <span>EMI & Payments</span>
                    </Link>
                    <Link to="/settings" className="flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md text-foreground/80 hover:bg-accent hover:text-primary transition-colors">
                      <Settings size={18} />
                      <span>Settings</span>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="relative group">
              <Button variant="ghost" className="gap-2 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">John Doe</span>
                <ChevronDown size={16} />
              </Button>
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-card border border-border hidden group-hover:block animate-fade-up z-50">
                <Link to="/profile" className="block px-4 py-2 text-sm text-foreground hover:bg-accent">Your Profile</Link>
                <Link to="/settings" className="block px-4 py-2 text-sm text-foreground hover:bg-accent">Settings</Link>
                <button className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-accent">Sign Out</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
