
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface BudgetCategoryProps {
  name: string;
  spent: number;
  limit: number;
  color: string;
}

const BudgetCategory = ({ name, spent, limit, color }: BudgetCategoryProps) => {
  const percentage = (spent / limit) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-sm font-medium">{name}</span>
        <span className="text-sm">
          ${spent.toLocaleString()} / ${limit.toLocaleString()}
        </span>
      </div>
      <Progress value={percentage} className={`h-2 ${color}`} />
    </div>
  );
};

const BudgetOverview = () => {
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Budget Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-sm text-muted-foreground">Total Spent</span>
            <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <span className="text-sm text-muted-foreground">Budget</span>
            <p className="text-lg font-medium">${totalBudget.toLocaleString()}</p>
          </div>
        </div>
        
        <Progress 
          value={totalPercentage} 
          className="h-2 bg-muted mb-6" 
        />
        
        <div className="space-y-4">
          {categories.map((category) => (
            <BudgetCategory key={category.name} {...category} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetOverview;
