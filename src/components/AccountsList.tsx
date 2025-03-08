
import { cn } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AccountCard from "./AccountCard";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/integrations/supabase/client";

interface AccountsListProps {
  className?: string;
}

// Define a type for the account
type AccountType = "bank" | "credit" | "investment";

interface BaseAccount {
  id: string;
  name: string;
  balance: string;
  user_id: string;
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
  const { userId } = useAuth();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    accountType: "",
    name: "",
    balance: "",
    cardNumber: "",
  });
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user-specific accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', userId);
          
        if (error) throw error;
        
        if (data) {
          // Format data to match our Account type
          const formattedAccounts = data.map(account => {
            // Format balance to INR
            const formattedBalance = `₹${parseFloat(account.balance).toLocaleString('en-IN')}`;
            
            if (account.type === 'investment') {
              return {
                id: account.id,
                name: account.name,
                balance: formattedBalance,
                type: account.type as AccountType,
                user_id: account.user_id
              } as InvestmentAccount;
            } else {
              return {
                id: account.id,
                name: account.name,
                balance: formattedBalance,
                type: account.type as AccountType,
                cardNumber: account.card_number || "0000",
                user_id: account.user_id
              } as BankAccount | CreditAccount;
            }
          });
          
          setAccounts(formattedAccounts);
        }
      } catch (err) {
        console.error("Error fetching accounts:", err);
        toast({
          title: "Error fetching accounts",
          description: "Failed to load your accounts. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAccounts();
    
    // Set up a listener to refresh accounts when transactions are added
    const handleTransactionUpdate = () => {
      fetchAccounts();
    };
    
    window.addEventListener('transaction-update', handleTransactionUpdate);
    
    return () => {
      window.removeEventListener('transaction-update', handleTransactionUpdate);
    };
  }, [userId, toast]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddAccount = async () => {
    // Validate form
    if (!formData.accountType || !formData.name || !formData.balance) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (!userId) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to add an account.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Prepare account data for insertion
      const accountType = formData.accountType as AccountType;
      const numericBalance = formData.balance.replace(/[₹,\s]/g, '');
      
      const newAccount = {
        name: formData.name,
        balance: parseFloat(numericBalance),
        type: accountType,
        card_number: formData.cardNumber || null,
        user_id: userId
      };
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('accounts')
        .insert([newAccount])
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Format for display
        const formattedBalance = `₹${parseFloat(data[0].balance).toLocaleString('en-IN')}`;
        
        let newAccountFormatted: Account;
        
        if (accountType === "investment") {
          newAccountFormatted = {
            id: data[0].id,
            type: accountType,
            name: data[0].name,
            balance: formattedBalance,
            user_id: data[0].user_id
          };
        } else {
          newAccountFormatted = {
            id: data[0].id,
            type: accountType,
            name: data[0].name,
            balance: formattedBalance,
            cardNumber: data[0].card_number || "0000",
            user_id: data[0].user_id
          };
        }
        
        setAccounts([...accounts, newAccountFormatted]);
        
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
      }
    } catch (err) {
      console.error("Error adding account:", err);
      toast({
        title: "Error",
        description: "Failed to add account. Please try again later.",
        variant: "destructive"
      });
    }
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
        {isLoading ? (
          <div className="col-span-full flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : accounts.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground">You don't have any accounts yet.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setOpen(true)}
            >
              Add Your First Account
            </Button>
          </div>
        ) : (
          accounts.map((account) => (
            <AccountCard
              key={account.id}
              type={account.type}
              name={account.name}
              balance={account.balance}
              cardNumber={account.cardNumber}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AccountsList;
