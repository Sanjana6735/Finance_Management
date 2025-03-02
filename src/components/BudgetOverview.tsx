
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

interface BudgetCategoryProps {
  name: string;
  spent: number;
  limit: number;
  color: string;
  onThresholdExceeded: (category: string, spent: number, limit: number, percentage: number) => void;
}

const BudgetCategory = ({ name, spent, limit, color, onThresholdExceeded }: BudgetCategoryProps) => {
  const percentage = (spent / limit) * 100;
  
  useEffect(() => {
    // Check if budget is over 80% used
    if (percentage > 80 && percentage < 100) {
      onThresholdExceeded(name, spent, limit, percentage);
    }
  }, [percentage, name, spent, limit, onThresholdExceeded]);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-sm font-medium">{name}</span>
        <span className="text-sm">
          ₹{spent.toLocaleString('en-IN')} / ₹{limit.toLocaleString('en-IN')}
        </span>
      </div>
      <Progress 
        value={percentage} 
        className={`h-2 ${color} ${percentage > 95 ? 'animate-pulse' : ''}`} 
      />
      {percentage > 95 && (
        <div className="flex items-center text-red-500 text-xs mt-1">
          <AlertCircle size={12} className="mr-1" />
          <span>Critical: Budget almost depleted</span>
        </div>
      )}
    </div>
  );
};

const BudgetOverview = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alertsSent, setAlertsSent] = useState<Record<string, boolean>>({});
  
  const categories = [
    { name: "Housing", spent: 1200, limit: 1500, color: "bg-blue-500" },
    { name: "Food", spent: 450, limit: 500, color: "bg-green-500" },
    { name: "Transportation", spent: 220, limit: 300, color: "bg-yellow-500" },
    { name: "Entertainment", spent: 180, limit: 200, color: "bg-purple-500" },
    { name: "Shopping", spent: 320, limit: 300, color: "bg-red-500" },
  ];

  const totalSpent = categories.reduce((acc, cat) => acc + cat.spent, 0);
  const totalBudget = categories.reduce((acc, cat) => acc + cat.limit, 0);
  const totalPercentage = (totalSpent / totalBudget) * 100;

  const handleThresholdExceeded = async (category: string, spent: number, limit: number, percentage: number) => {
    // Only send an alert once per category per session
    if (alertsSent[category]) return;
    
    try {
      // Call Supabase Edge Function to send email alert
      const { error } = await supabase.functions.invoke('send-budget-alert', {
        body: {
          userId: user?.id,
          userEmail: user?.email,
          categoryName: category,
          currentAmount: spent,
          totalBudget: limit,
          percentageUsed: percentage
        },
      });
      
      if (error) throw error;
      
      // Mark this category as having had an alert sent
      setAlertsSent(prev => ({ ...prev, [category]: true }));
      
      toast({
        title: "Budget Alert Sent",
        description: `You've used ${percentage.toFixed(1)}% of your ${category} budget. Check your email for details.`,
        variant: "warning",
      });
    } catch (error) {
      console.error("Failed to send budget alert:", error);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Budget Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-sm text-muted-foreground">Total Spent</span>
            <p className="text-2xl font-bold">₹{totalSpent.toLocaleString('en-IN')}</p>
          </div>
          <div className="text-right">
            <span className="text-sm text-muted-foreground">Budget</span>
            <p className="text-lg font-medium">₹{totalBudget.toLocaleString('en-IN')}</p>
          </div>
        </div>
        
        <Progress 
          value={totalPercentage} 
          className="h-2 bg-muted mb-6" 
        />
        
        <div className="space-y-4">
          {categories.map((category) => (
            <BudgetCategory 
              key={category.name} 
              {...category} 
              onThresholdExceeded={handleThresholdExceeded}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetOverview;
