
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CreditScoreChartProps {
  score: number;
  maxScore: number;
  className?: string;
}

const CreditScoreChart = ({
  score,
  maxScore = 850,
  className
}: CreditScoreChartProps) => {
  const percentage = (score / maxScore) * 100;
  
  const getCreditLabel = () => {
    if (score >= 750) return "Excellent";
    if (score >= 700) return "Good";
    if (score >= 650) return "Fair";
    if (score >= 600) return "Poor";
    return "Very Poor";
  };
  
  const getCreditColor = () => {
    if (score >= 750) return "text-green-500";
    if (score >= 700) return "text-green-400";
    if (score >= 650) return "text-yellow-500";
    if (score >= 600) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Credit Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-2">
          <span className="text-3xl font-bold">{score}</span>
          <span className={`text-sm font-medium ${getCreditColor()}`}>
            {getCreditLabel()}
          </span>
        </div>
        
        <div className="space-y-3">
          <Progress 
            value={percentage} 
            className="h-2 credit-score-gradient" 
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>300</span>
            <span>580</span>
            <span>670</span>
            <span>740</span>
            <span>850</span>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Payment History</span>
              <span className="text-sm font-medium">Excellent</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Credit Utilization</span>
              <span className="text-sm font-medium">Very Good</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Account Age</span>
              <span className="text-sm font-medium">Good</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditScoreChart;
