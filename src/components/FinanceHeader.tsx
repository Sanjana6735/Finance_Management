
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "./AuthProvider";

interface FinanceHeaderProps {
  totalBalance: string;
}

const FinanceHeader = ({ totalBalance }: FinanceHeaderProps) => {
  const { user } = useAuth();
  
  // Convert dollar value to rupees
  const formattedBalance = totalBalance.startsWith('$') 
    ? `₹${(parseFloat(totalBalance.replace('$', '').replace(/,/g, '')) * 83.5).toLocaleString('en-IN')}`
    : totalBalance;
  
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || "User";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {username}! Here's your financial overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1">
            <CalendarDays size={15} />
            <span>May 1 - May 31, 2023</span>
          </Button>
          <Select defaultValue="all">
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="business">Business</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6">
        <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
        <h2 className="text-4xl font-bold mt-1">{formattedBalance}</h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-green-500 text-sm font-medium">+₹288,648</span>
          <span className="text-sm text-muted-foreground">this month</span>
        </div>
      </div>
    </div>
  );
};

export default FinanceHeader;
