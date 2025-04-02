
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTransaction: (transaction: {
    id?: string;  // Added id as an optional property to fix the type error
    name: string;
    amount: string;
    type: "expense" | "income";
    category: string;
    date: string;
    account_id?: string;
    account_name?: string;
  }) => void;
}

interface Account {
  id: string;
  name: string;
  balance: string;
  type: string;
}

// Add the following helper function to handle transaction creation and account balance updates
const createTransaction = async (
  userId: string, 
  transactionData: any, 
  supabase: any, 
  toast: any,
  setIsSubmitting: (value: boolean) => void
) => {
  try {
    // Parse the amount from the formatted string
    let numericAmount = transactionData.amount;
    if (numericAmount.startsWith("₹")) {
      numericAmount = numericAmount.substring(1);
    }
    numericAmount = numericAmount.replace(/,/g, "");
    
    const parsedAmount = parseFloat(numericAmount);
    if (isNaN(parsedAmount)) {
      throw new Error(`Invalid amount: ${transactionData.amount}`);
    }
    
    // Create the transaction record
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          name: transactionData.name,
          amount: parsedAmount,
          type: transactionData.type,
          category: transactionData.category,
          date: new Date().toISOString(),
          user_id: userId,
          account_id: transactionData.account_id
        }
      ])
      .select();

    if (error) throw error;
    
    if (data && data.length > 0) {
      console.log("Transaction created successfully:", data[0]);
      
      // Update the account balance
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', transactionData.account_id)
        .single();
        
      if (accountError) throw accountError;
      
      let newBalance = parseFloat(accountData.balance);
      if (transactionData.type === 'expense') {
        newBalance -= parsedAmount;
      } else {
        newBalance += parsedAmount;
      }
      
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', transactionData.account_id);
        
      if (updateError) throw updateError;
      
      console.log(`Account balance updated to: ${newBalance}`);
      
      return {
        success: true,
        data: data[0],
        message: "Transaction created and account updated successfully"
      };
    }
    
    return { success: false, message: "No data returned from transaction creation" };
  } catch (err) {
    console.error("Error creating transaction:", err);
    return { success: false, message: err.message || "An unknown error occurred" };
  }
};

const AddTransactionDialog = ({ open, onOpenChange, onAddTransaction }: AddTransactionDialogProps) => {
  const { toast } = useToast();
  const { userId } = useAuth();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [category, setCategory] = useState<string>("shopping");
  const [date, setDate] = useState<Date>(new Date());
  const [isScanning, setIsScanning] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedAccountName, setSelectedAccountName] = useState<string>("");

  // Fetch user accounts on component mount
  useEffect(() => {
    if (userId && open) {
      fetchUserAccounts();
    }
  }, [userId, open]);

  const fetchUserAccounts = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setAccounts(data);
        // Set the first account as default if none selected
        if (!selectedAccountId) {
          setSelectedAccountId(data[0].id);
          setSelectedAccountName(data[0].name);
        }
      }
    } catch (err) {
      console.error("Error fetching user accounts:", err);
      toast({
        title: "Error",
        description: "Failed to load your accounts",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !amount || !selectedAccountId) {
      toast({
        title: "Invalid input",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to add transactions",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Creating transaction with data:", {
        name,
        amount,
        type,
        category,
        accountId: selectedAccountId
      });
      
      const result = await createTransaction(
        userId,
        {
          name,
          amount,
          type,
          category,
          account_id: selectedAccountId
        },
        supabase,
        toast,
        setIsSubmitting
      );
      
      if (result.success) {
        // Get the account name for the transaction record
        const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
        const accountName = selectedAccount ? selectedAccount.name : "Unknown Account";

        onAddTransaction({
          id: result.data.id,
          name,
          amount,
          type,
          category,
          date: format(date, "MMMM d, yyyy, h:mm a"),
          account_id: selectedAccountId,
          account_name: accountName
        });
        
        toast({
          title: "Transaction added",
          description: `${type === "expense" ? "Expense" : "Income"} of ${amount} from ${accountName} account`,
        });
        
        // Reset form fields
        setName("");
        setAmount("");
        setType("expense");
        setCategory("shopping");
        setDate(new Date());
        setReceipt(null);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to add transaction",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error in transaction submission:", error);
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceipt(file);
      
      // Start receipt scanning with AI
      setIsScanning(true);
      toast({
        title: "Scanning receipt",
        description: "Please wait while we analyze your receipt...",
      });
      
      try {
        // Convert file to base64
        const base64 = await fileToBase64(file);
        
        console.log("Calling receipt-scanner function");
        
        // Call the receipt scanner function
        const response = await fetch(`${SUPABASE_URL}/functions/v1/receipt-scanner`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
          },
          body: JSON.stringify({
            imageBase64: base64.split(',')[1]  // Remove data URL prefix
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error: ${response.status} ${errorText}`);
        }
        
        const result = await response.json();
        console.log("Receipt scanner result:", result);
        
        if (result.success && result.data) {
          // Extract data from the response
          const { storeName, date: receiptDate, totalAmount, items } = result.data;
          
          // Update form with extracted data
          if (storeName && storeName !== "Unknown Store") {
            setName(storeName);
          } else {
            setName("Receipt Purchase");
          }
          
          if (totalAmount && !isNaN(parseFloat(String(totalAmount)))) {
            setAmount(String(totalAmount));
          }
          
          if (storeName) {
            setCategory(getCategoryFromStoreName(storeName) || "shopping");
          }
          
          // Parse date if available
          if (receiptDate) {
            try {
              // Try multiple date formats
              let parsedDate;
              if (receiptDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                // YYYY-MM-DD format
                parsedDate = new Date(receiptDate);
              } else if (receiptDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                // MM/DD/YYYY format
                const [month, day, year] = receiptDate.split('/');
                parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              } else if (receiptDate.match(/^\d{2}\/\d{2}\/\d{2}$/)) {
                // MM/DD/YY format
                const [month, day, year] = receiptDate.split('/');
                parsedDate = new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day));
              }
              
              if (parsedDate && !isNaN(parsedDate.getTime())) {
                setDate(parsedDate);
              }
            } catch (e) {
              console.warn("Couldn't parse receipt date:", e);
            }
          }
          
          toast({
            title: "Receipt scanned",
            description: "We've extracted the data from your receipt. Please review and edit if needed.",
          });
        } else {
          toast({
            title: "Receipt scanning issue",
            description: "We couldn't fully analyze your receipt. Please enter the details manually.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Receipt scanning error:", error);
        toast({
          title: "Scanning failed",
          description: "Failed to scan receipt. Please enter the details manually.",
          variant: "destructive"
        });
      } finally {
        setIsScanning(false);
      }
    }
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Helper function to guess category from store name
  const getCategoryFromStoreName = (storeName: string): string => {
    if (!storeName) return "shopping";
    
    const name = storeName.toLowerCase();
    
    if (name.includes("restaurant") || name.includes("cafe") || name.includes("food") || 
        name.includes("grocery") || name.includes("supermarket") || name.includes("market") ||
        name.includes("bakery") || name.includes("deli") || name.includes("coffee")) {
      return "food";
    }
    
    if (name.includes("pharmacy") || name.includes("medical") || name.includes("doctor") || 
        name.includes("hospital") || name.includes("health") || name.includes("clinic")) {
      return "healthcare";
    }
    
    if (name.includes("uber") || name.includes("lyft") || name.includes("taxi") || 
        name.includes("train") || name.includes("metro") || name.includes("transit") ||
        name.includes("gas") || name.includes("petrol") || name.includes("fuel")) {
      return "transport";
    }
    
    if (name.includes("movie") || name.includes("cinema") || name.includes("theater") || 
        name.includes("entertainment") || name.includes("game") || name.includes("ticket")) {
      return "entertainment";
    }
    
    if (name.includes("school") || name.includes("college") || name.includes("university") ||
        name.includes("book") || name.includes("course") || name.includes("education")) {
      return "education";
    }
    
    if (name.includes("rent") || name.includes("mortgage") || name.includes("apartment") ||
        name.includes("home") || name.includes("house") || name.includes("housing")) {
      return "housing";
    }
    
    return "shopping";
  };

  // Update selected account name when account ID changes
  useEffect(() => {
    if (selectedAccountId && accounts.length > 0) {
      const account = accounts.find(acc => acc.id === selectedAccountId);
      if (account) {
        setSelectedAccountName(account.name);
      }
    }
  }, [selectedAccountId, accounts]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Enter transaction details or scan a receipt
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Transaction Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Coffee, Groceries, etc."
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input 
                id="amount" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="0.00"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as "expense" | "income")}>
                <SelectTrigger id="type" className="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={category} 
                onValueChange={(value) => setCategory(value)}
              >
                <SelectTrigger id="category" className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="housing">Housing</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="emi">EMI/Loan</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className={cn(
                      "mt-1 w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="account">Account</Label>
              <Select 
                value={selectedAccountId} 
                onValueChange={(value) => {
                  setSelectedAccountId(value);
                  const account = accounts.find(acc => acc.id === value);
                  if (account) {
                    setSelectedAccountName(account.name);
                  }
                }}
              >
                <SelectTrigger id="account" className="mt-1">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.length > 0 ? (
                    accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} (₹{parseFloat(account.balance).toLocaleString('en-IN')})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>No accounts found</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="block">Scan Receipt</Label>
            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => document.getElementById('receipt-upload')?.click()}
                className="w-full"
                disabled={isScanning}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    {receipt ? 'Change Receipt' : 'Upload Receipt'}
                  </>
                )}
              </Button>
              <input
                id="receipt-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {receipt && !isScanning && (
              <div className="text-sm text-muted-foreground">
                File: {receipt.name}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || isScanning || accounts.length === 0}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Transaction"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionDialog;
