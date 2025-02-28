
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, Camera, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTransaction: (transaction: {
    name: string;
    amount: string;
    type: "expense" | "income";
    category: "shopping" | "food" | "housing" | "transport" | "other";
    date: string;
  }) => void;
}

const AddTransactionDialog = ({ open, onOpenChange, onAddTransaction }: AddTransactionDialogProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [category, setCategory] = useState<"shopping" | "food" | "housing" | "transport" | "other">("other");
  const [date, setDate] = useState<Date>(new Date());
  const [isScanning, setIsScanning] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !amount) {
      toast({
        title: "Invalid input",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Format amount with $ sign if not already present
    const formattedAmount = amount.startsWith("$") ? amount : `$${amount}`;
    
    onAddTransaction({
      name,
      amount: formattedAmount,
      type,
      category,
      date: format(date, "MMMM d, yyyy, h:mm a"),
    });
    
    // Reset form fields
    setName("");
    setAmount("");
    setType("expense");
    setCategory("other");
    setDate(new Date());
    setReceipt(null);
    
    // Close dialog
    onOpenChange(false);
    
    toast({
      title: "Transaction added",
      description: "Your transaction has been successfully added",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceipt(file);
      
      // Simulate receipt scanning with AI
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
        
        // Simulate AI extracting data from receipt
        setName("AI Detected Purchase");
        setAmount("34.99");
        setCategory("shopping");
        
        toast({
          title: "Receipt scanned",
          description: "We've extracted the data from your receipt. Please review and edit if needed.",
        });
      }, 2000);
    }
  };

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
              <Label htmlFor="amount">Amount</Label>
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
              <Select value={category} onValueChange={(value) => setCategory(value as "shopping" | "food" | "housing" | "transport" | "other")}>
                <SelectTrigger id="category" className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="food">Food & Dining</SelectItem>
                  <SelectItem value="housing">Housing</SelectItem>
                  <SelectItem value="transport">Transportation</SelectItem>
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
          </div>
          
          <div className="space-y-2">
            <Label className="block">Scan Receipt</Label>
            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => document.getElementById('receipt-upload')?.click()}
                className="w-full"
              >
                <Camera className="mr-2 h-4 w-4" />
                {receipt ? 'Change Receipt' : 'Upload Receipt'}
              </Button>
              <input
                id="receipt-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {receipt && (
              <div className="text-sm text-muted-foreground">
                File: {receipt.name} {isScanning && "(Scanning...)"}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={isScanning}>
              Add Transaction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionDialog;
