
import { cn } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AccountCard from "./AccountCard";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface AccountsListProps {
  className?: string;
}

const AccountsList = ({ className }: AccountsListProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState([
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
  ]);

  const handleAddAccount = () => {
    setOpen(false);
    toast({
      title: "Account successfully added",
      description: "Your new account has been added to your profile.",
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Accounts</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 h-8">
              <PlusCircle size={16} />
              <span>Add Account</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Account</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Button onClick={handleAddAccount} className="col-span-4">Add Account</Button>
                <p className="text-xs text-muted-foreground col-span-4 text-center">
                  Full account linking functionality will be available in the next update.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
