
import { CalendarClock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmiBannerProps {
  nextPayment: {
    amount: string;
    date: string;
    description: string;
  };
}

const EmiBanner = ({ nextPayment }: EmiBannerProps) => {
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-6">
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <CalendarClock size={24} />
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Upcoming EMI Payment</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {nextPayment.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="text-lg font-medium">{nextPayment.date}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-lg font-bold">{nextPayment.amount}</p>
            </div>
            
            <Button className="whitespace-nowrap">Pay Now</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmiBanner;
