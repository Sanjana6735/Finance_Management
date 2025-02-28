
import { cn } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AccountCard from "./AccountCard";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AccountsListProps {
  className?: string;
}

// Define a type for the account
type AccountType = "bank" | "credit" | "investment";

interface BaseAccount {
  id: string;
  name: string;
  balance: string;
}

interface BankAccount extends BaseAccount {
  type: "bank";
  cardNumber: string;
}

interface CreditAccount extends BaseAccount {
  type: "credit";
  cardNumber: string;
}

interface InvestmentAccount extends BaseAccount {
  type: "investment";
  cardNumber?: string;
}

type Account = BankAccount | CreditAccount | InvestmentAccount;

const AccountsList = ({ className }: AccountsListProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    accountType: "",
    name: "",
    balance: "",
    cardNumber: "",
  });
  
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: "1",
      type: "bank",
      name: "Chase Checking",
      balance: "$12,456.78",
      cardNumber: "4532123498761234"
    },
    {
      id: "2",
      type: "credit",
      name: "Amex Platinum",
      balance: "$3,254.22",
      cardNumber: "3766123412341234"
    },
    {
      id: "3",
      type: "investment",
      name: "Vanguard 401k",
      balance: "$145,678.32"
    }
  ]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddAccount = () => {
    // Validate form
    if (!formData.accountType || !formData.name || !formData.balance) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // Add new account based on type
    const accountType = formData.accountType as AccountType;
    const formattedBalance = formData.balance.startsWith('$') 
      ? formData.balance 
      : `$${formData.balance}`;
    
    let newAccount: Account;
    
    if (accountType === "investment") {
      newAccount = {
        id: (accounts.length + 1).toString(),
        type: "investment",
        name: formData.name,
        balance: formattedBalance,
      };
    } else if (accountType === "bank") {
      newAccount = {
        id: (accounts.length + 1).toString(),
        type: "bank",
        name: formData.name,
        balance: formattedBalance,
        cardNumber: formData.cardNumber || "0000"
      };
    } else {
      // Credit card
      newAccount = {
        id: (accounts.length + 1).toString(),
        type: "credit",
        name: formData.name,
        balance: formattedBalance,
        cardNumber: formData.cardNumber || "0000"
      };
    }
    
    setAccounts([...accounts, newAccount]);
    
    // Reset form and close dialog
    setFormData({
      accountType: "",
      name: "",
      balance: "",
      cardNumber: "",
    });
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
              <div className="grid gap-2">
                <Label htmlFor="accountType">Account Type</Label>
                <Select 
                  value={formData.accountType}
                  onValueChange={(value) => handleChange("accountType", value)}
                >
                  <SelectTrigger id="accountType">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Account</SelectItem>
                    <SelectItem value="credit">Credit Card</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="name">Account Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Chase Checking"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="balance">Current Balance</Label>
                <Input
                  id="balance"
                  value={formData.balance}
                  onChange={(e) => handleChange("balance", e.target.value)}
                  placeholder="e.g. 5000.00"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="cardNumber">Account Number (Last 4 digits)</Label>
                <Input
                  id="cardNumber"
                  value={formData.cardNumber}
                  onChange={(e) => handleChange("cardNumber", e.target.value)}
                  placeholder="e.g. 1234"
                  maxLength={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddAccount}>Add Account</Button>
            </DialogFooter>
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
