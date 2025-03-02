
import { useEffect, useState } from "react";
import { Wallet, TrendingUp, PiggyBank, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import FinanceHeader from "@/components/FinanceHeader";
import AccountsList from "@/components/AccountsList";
import CreditScoreChart from "@/components/CreditScoreChart";
import BudgetOverview from "@/components/BudgetOverview";
import EmiBanner from "@/components/EmiBanner";
import FinanceInsight from "@/components/FinanceInsight";
import TransactionList from "@/components/TransactionList";
import IncomeExpenseChart from "@/components/IncomeExpenseChart";
import ExpenseCategoryChart from "@/components/ExpenseCategoryChart";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { userId, isAuthenticated, isLoading: authLoading } = useAuth();
  const [monthlyIncome, setMonthlyIncome] = useState<string | null>(null);
  const [monthlyExpenses, setMonthlyExpenses] = useState<string | null>(null);
  const [savingsRate, setSavingsRate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const { toast } = useToast();

  // Fetch user financial data
  useEffect(() => {
    const fetchUserFinancials = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        // Get income transactions for the month
        const { data: incomeData, error: incomeError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('type', 'income')
          .eq('user_id', userId)
          .gte('date', startOfMonth.toISOString());
          
        if (incomeError) throw incomeError;
        
        // Get expense transactions for the month
        const { data: expenseData, error: expenseError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('type', 'expense')
          .eq('user_id', userId)
          .gte('date', startOfMonth.toISOString());
          
        if (expenseError) throw expenseError;
        
        // Calculate totals
        const totalIncome = incomeData?.reduce((sum, item) => sum + parseFloat(item.amount), 0) || 0;
        const totalExpenses = expenseData?.reduce((sum, item) => sum + parseFloat(item.amount), 0) || 0;
        
        // Format as INR
        setMonthlyIncome(`₹${totalIncome.toLocaleString('en-IN')}`);
        setMonthlyExpenses(`₹${totalExpenses.toLocaleString('en-IN')}`);
        
        // Calculate savings rate if there is income
        if (totalIncome > 0) {
          const savings = ((totalIncome - totalExpenses) / totalIncome) * 100;
          setSavingsRate(`${savings.toFixed(1)}%`);
        } else {
          setSavingsRate("0%");
        }
        
        // Check if user has any data
        setHasData(totalIncome > 0 || totalExpenses > 0 || (incomeData?.length || 0) > 0 || (expenseData?.length || 0) > 0);
      } catch (err) {
        console.error("Error fetching financial data:", err);
        toast({
          title: "Error",
          description: "Failed to fetch financial data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserFinancials();
  }, [userId, toast]);

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
          <FinanceHeader />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <StatCard
            title="Monthly Income"
            value={loading ? "Loading..." : (monthlyIncome || "₹0")}
            icon={<Wallet size={18} />}
            trend={hasData ? { value: 0, isPositive: true } : undefined}
            trendText="vs last month"
            className="opacity-0 animate-on-mount"
          />
          <StatCard
            title="Monthly Expenses"
            value={loading ? "Loading..." : (monthlyExpenses || "₹0")}
            icon={<ArrowUpRight size={18} />}
            trend={hasData ? { value: 0, isPositive: false } : undefined}
            trendText="vs last month"
            className="opacity-0 animate-on-mount animation-delay-100"
          />
          <StatCard
            title="Savings Rate"
            value={loading ? "Loading..." : (savingsRate || "0%")}
            icon={<PiggyBank size={18} />}
            trend={hasData ? { value: 0, isPositive: true } : undefined}
            trendText="vs last month"
            className="opacity-0 animate-on-mount animation-delay-200"
          />
        </div>
        
        <div className="mt-8 opacity-0 animate-on-mount animation-delay-300">
          <EmiBanner />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 opacity-0 animate-on-mount animation-delay-300">
          <IncomeExpenseChart userId={userId} />
          <ExpenseCategoryChart userId={userId} />
        </div>
        
        <div className="mt-8 opacity-0 animate-on-mount animation-delay-400">
          <AccountsList />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-1 opacity-0 animate-on-mount animation-delay-200">
            <CreditScoreChart userId={userId} />
          </div>
          
          <div className="opacity-0 animate-on-mount animation-delay-300">
            <BudgetOverview />
          </div>
          
          <div className="opacity-0 animate-on-mount animation-delay-400">
            <div className="space-y-6">
              <FinanceInsight userId={userId} />
              
              <div className="bg-primary/5 rounded-xl p-6">
                <h3 className="text-base font-medium">Need Financial Advice?</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Get personalized financial advice from our AI assistant powered by Gemini 1.5.
                </p>
                <button 
                  className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-md"
                  onClick={() => window.location.href = "/financial-advisor"}
                >
                  Ask the AI Assistant
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 opacity-0 animate-on-mount animation-delay-500">
          <TransactionList />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
