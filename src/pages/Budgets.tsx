
import Navbar from "@/components/Navbar";
import BudgetOverview from "@/components/BudgetOverview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, PlusCircle } from "lucide-react";
import { useEffect } from "react";

const Budgets = () => {
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
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 opacity-0 animate-on-mount">
          <div>
            <h1 className="text-3xl font-bold">Budgets</h1>
            <p className="text-muted-foreground mt-1">
              Manage your monthly budget allocations and track spending
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-1">
              <CalendarDays size={15} />
              <span>May 2023</span>
            </Button>
            <Button className="gap-1">
              <PlusCircle size={16} />
              <span>New Budget</span>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="opacity-0 animate-on-mount animation-delay-100">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Budget Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <BudgetOverview />
              </CardContent>
            </Card>
          </div>
          
          <div className="opacity-0 animate-on-mount animation-delay-200">
            <Card>
              <CardHeader>
                <CardTitle>Budget History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{`Budget Period ${index + 1}`}</p>
                        <p className="text-sm text-muted-foreground">{`April ${2023 - index}`}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(2800 - index * 100).toLocaleString()}</p>
                        <p className={`text-sm ${index % 2 === 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {index % 2 === 0 ? '+' : '-'}${(index + 1) * 50} vs previous
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Budgets;
