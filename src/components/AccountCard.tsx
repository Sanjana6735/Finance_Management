
import { CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AccountCardProps {
  type: "bank" | "credit" | "investment";
  name: string;
  balance: string;
  cardNumber?: string;
  className?: string;
}

const AccountCard = ({
  type,
  name,
  balance,
  cardNumber,
  className
}: AccountCardProps) => {
  const gradientColors = {
    bank: "from-blue-600 to-blue-400",
    credit: "from-purple-600 to-pink-400",
    investment: "from-emerald-600 to-teal-400"
  };

  const typeLabel = {
    bank: "Banking Account",
    credit: "Credit Card",
    investment: "Investment"
  };

  return (
    <Card className={cn(
      "overflow-hidden border-none card-transition shadow-md",
      className
    )}>
      <CardContent className={cn(
        "p-6 bg-gradient-to-br text-white",
        gradientColors[type]
      )}>
        <div className="flex justify-between items-start mb-6">
          <span className="text-xs font-medium text-white/80">{typeLabel[type]}</span>
          <CreditCard className="h-5 w-5 text-white/80" />
        </div>
        
        <h3 className="text-xl font-medium mb-1">{name}</h3>
        <p className="text-sm font-normal text-white/80 mb-4">
          {cardNumber ? `•••• ${cardNumber.slice(-4)}` : ""}
        </p>
        
        <div className="mt-6">
          <span className="text-xs font-medium text-white/80">Available Balance</span>
          <h4 className="text-2xl font-bold">{balance}</h4>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountCard;
