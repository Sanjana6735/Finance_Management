
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
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FinanceHeaderProps {
  totalBalance?: string;
}

const FinanceHeader = ({ totalBalance: propsTotalBalance }: FinanceHeaderProps) => {
  const { user, userId } = useAuth();
  const [calculatedBalance, setCalculatedBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthlyChange, setMonthlyChange] = useState<number | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchTotalBalance = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('accounts')
          .select('balance')
          .eq('user_id', userId);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Calculate total balance from all accounts
          const total = data.reduce((sum, account) => sum + parseFloat(account.balance), 0);
          // Format as INR
          setCalculatedBalance(`₹${total.toLocaleString('en-IN')}`);
          
          // Calculate change for this month
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);
          
          // Get transactions for this month
          const { data: transactions, error: txError } = await supabase
            .from('transactions')
            .select('amount, type')
            .eq('user_id', userId)
            .gte('date', startOfMonth.toISOString());
            
          if (txError) throw txError;
          
          if (transactions && transactions.length > 0) {
            // Calculate net change
            const change = transactions.reduce((sum, tx) => {
              const amount = parseFloat(tx.amount);
              return tx.type === 'income' ? sum + amount : sum - amount;
            }, 0);
            
            setMonthlyChange(change);
          } else {
            setMonthlyChange(0);
          }
        } else {
          setCalculatedBalance("₹0");
          setMonthlyChange(0);
        }
      } catch (err) {
        console.error("Error fetching total balance:", err);
        setCalculatedBalance("₹0");
        setMonthlyChange(0);
        toast({
          title: "Error",
          description: "Failed to fetch account balance",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTotalBalance();
  }, [userId, toast]);
  
  // Either use the calculated balance from the database or the prop
  const displayBalance = loading ? 
    "Loading..." : 
    (calculatedBalance || "₹0");
  
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || "User";

  const currentDate = new Date();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const dateRange = `${monthName} 1 - ${monthName} ${new Date(year, currentDate.getMonth() + 1, 0).getDate()}, ${year}`;

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
            <span>{dateRange}</span>
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
        <h2 className="text-4xl font-bold mt-1">{displayBalance}</h2>
        <div className="flex items-center gap-2 mt-2">
          {monthlyChange !== null && (
            <>
              <span className={monthlyChange >= 0 ? "text-green-500 text-sm font-medium" : "text-red-500 text-sm font-medium"}>
                {monthlyChange >= 0 ? "+" : ""}{`₹${Math.abs(monthlyChange).toLocaleString('en-IN')}`}
              </span>
              <span className="text-sm text-muted-foreground">this month</span>
            </>
          )}
          {monthlyChange === null && !loading && (
            <span className="text-sm text-muted-foreground">No transactions this month</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceHeader;
