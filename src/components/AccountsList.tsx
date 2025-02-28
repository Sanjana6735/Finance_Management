
import { cn } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AccountCard from "./AccountCard";

interface AccountsListProps {
  className?: string;
}

const AccountsList = ({ className }: AccountsListProps) => {
  const accounts = [
    {
      id: "1",
      type: "bank" as const,
      name: "Chase Checking",
      balance: "$12,456.78",
      cardNumber: "4532123498761234"
    },
    {
      id: "2",
      type: "credit" as const,
      name: "Amex Platinum",
      balance: "$3,254.22",
      cardNumber: "3766123412341234"
    },
    {
      id: "3",
      type: "investment" as const,
      name: "Vanguard 401k",
      balance: "$145,678.32"
    }
  ];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Accounts</h2>
        <Button variant="ghost" size="sm" className="gap-1 h-8">
          <PlusCircle size={16} />
          <span>Add Account</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            type={account.type}
            name={account.name}
            balance={account.balance}
            cardNumber={account.cardNumber}
          />
        ))}
      </div>
    </div>
  );
};

export default AccountsList;
