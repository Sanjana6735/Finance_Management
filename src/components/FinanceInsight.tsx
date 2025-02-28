
import { useState } from "react";
import { Lightbulb, ArrowRight, Sparkles, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const FinanceInsight = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [insight, setInsight] = useState({
    title: "Budget Optimization Suggestion",
    content: "Based on your spending patterns, you could save approximately $250 per month by adjusting your subscription services and dining expenses. Consider reviewing your streaming services and meal planning to optimize your budget."
  });

  const insights = [
    {
      title: "Budget Optimization Suggestion",
      content: "Based on your spending patterns, you could save approximately $250 per month by adjusting your subscription services and dining expenses. Consider reviewing your streaming services and meal planning to optimize your budget."
    },
    {
      title: "Investment Opportunity",
      content: "With your current savings rate, you have an opportunity to allocate $500 monthly towards a diversified investment portfolio. This could potentially yield an additional $15,000 over the next 5 years based on moderate market growth projections."
    },
    {
      title: "Debt Reduction Strategy",
      content: "By reallocating $300 from your entertainment budget to your credit card debt, you could be debt-free 8 months sooner and save approximately $450 in interest payments. This would improve your credit score by an estimated 25-30 points."
    },
    {
      title: "Emergency Fund Recommendation",
      content: "Your current emergency fund covers 2 months of expenses. Consider increasing your monthly contribution by $150 to reach the recommended 6-month coverage within the next year, providing better financial security."
    },
    {
      title: "Tax Optimization",
      content: "Based on your income and expenses, you may qualify for additional tax deductions worth approximately $1,200. Consider scheduling a consultation with a tax professional to review potential savings on your next return."
    }
  ];

  const generateNewInsight = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Get random insight that's different from current one
      let newInsight;
      do {
        newInsight = insights[Math.floor(Math.random() * insights.length)];
      } while (newInsight.title === insight.title);
      
      setInsight(newInsight);
      setIsLoading(false);
      
      toast({
        title: "New financial insight generated",
        description: "AI has analyzed your financial data and generated a new insight.",
      });
    }, 1500);
  };

  const viewDetailedAnalysis = () => {
    toast({
      title: "Analysis feature coming soon",
      description: "Detailed financial analysis with Gemini 1.5 will be available in the next update.",
      variant: "default",
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5 pb-3 pt-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <CardTitle className="text-sm font-medium">AI Finance Insight</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={generateNewInsight}
            disabled={isLoading}
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="hidden sm:flex flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 items-center justify-center text-primary">
            <Lightbulb size={20} />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-base font-medium">{insight.title}</h3>
            <p className="text-sm text-muted-foreground">
              {insight.content}
            </p>
            
            <Button 
              variant="link" 
              className="p-0 h-auto text-primary" 
              size="sm"
              onClick={viewDetailedAnalysis}
            >
              <span>View detailed analysis</span>
              <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinanceInsight;
