
import { useState } from "react";
import { Lightbulb, ArrowRight, Sparkles, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FinanceInsight = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [insight, setInsight] = useState({
    title: "Budget Optimization Suggestion",
    content: "Based on your spending patterns, you could save approximately $250 per month by adjusting your subscription services and dining expenses. Consider reviewing your streaming services and meal planning to optimize your budget."
  });

  const generateNewInsight = () => {
    setIsLoading(true);
    setTimeout(() => {
      setInsight({
        title: "Investment Opportunity",
        content: "With your current savings rate, you have an opportunity to allocate $500 monthly towards a diversified investment portfolio. This could potentially yield an additional $15,000 over the next 5 years based on moderate market growth projections."
      });
      setIsLoading(false);
    }, 1500);
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
            
            <Button variant="link" className="p-0 h-auto text-primary" size="sm">
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
