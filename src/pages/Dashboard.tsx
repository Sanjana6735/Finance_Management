
import { useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import IncomeExpenseChart from "@/components/IncomeExpenseChart";
import ExpenseCategoryChart from "@/components/ExpenseCategoryChart";

const Dashboard = () => {
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
          <FinanceHeader totalBalance="$161,389.32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <StatCard
            title="Monthly Income"
            value="$8,560.00"
            icon={<Wallet size={18} />}
            trend={{ value: 12, isPositive: true }}
            trendText="vs last month"
            className="opacity-0 animate-on-mount"
          />
          <StatCard
            title="Monthly Expenses"
            value="$3,456.78"
            icon={<ArrowUpRight size={18} />}
            trend={{ value: 8, isPositive: false }}
            trendText="vs last month"
            className="opacity-0 animate-on-mount animation-delay-100"
          />
          <StatCard
            title="Savings Rate"
            value="59.6%"
            icon={<PiggyBank size={18} />}
            trend={{ value: 5, isPositive: true }}
            trendText="vs last month"
            className="opacity-0 animate-on-mount animation-delay-200"
          />
        </div>
        
        <div className="mt-8 opacity-0 animate-on-mount animation-delay-300">
          <EmiBanner 
            nextPayment={{
              amount: "$256.78",
              date: "May 28, 2023",
              description: "Home Loan EMI payment due in 5 days"
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 opacity-0 animate-on-mount animation-delay-300">
          <IncomeExpenseChart />
          <ExpenseCategoryChart />
        </div>
        
        <div className="mt-8 opacity-0 animate-on-mount animation-delay-400">
          <AccountsList />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-1 opacity-0 animate-on-mount animation-delay-200">
            <CreditScoreChart score={725} maxScore={850} />
          </div>
          
          <div className="opacity-0 animate-on-mount animation-delay-300">
            <BudgetOverview />
          </div>
          
          <div className="opacity-0 animate-on-mount animation-delay-400">
            <div className="space-y-6">
              <FinanceInsight />
              
              <div className="bg-primary/5 rounded-xl p-6">
                <h3 className="text-base font-medium">Need Financial Advice?</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Get personalized financial advice from our AI assistant powered by Gemini 1.5.
                </p>
                <Button className="mt-4 w-full" onClick={() => window.location.href = "/financial-advisor"}>Ask the AI Assistant</Button>
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
