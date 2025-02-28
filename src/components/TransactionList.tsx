
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShoppingBag, 
  Coffee, 
  Home, 
  Car, 
  Utensils, 
  Plus,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import AddTransactionDialog from "./AddTransactionDialog";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  name: string;
  amount: string;
  type: "expense" | "income";
  category: "shopping" | "food" | "housing" | "transport" | "other";
  date: string;
}

const getCategoryIcon = (category: Transaction["category"]) => {
  switch (category) {
    case "shopping":
      return <ShoppingBag size={16} />;
    case "food":
      return <Coffee size={16} />;
    case "housing":
      return <Home size={16} />;
    case "transport":
      return <Car size={16} />;
    default:
      return <Utensils size={16} />;
  }
};

const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center",
          transaction.type === "expense" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
        )}>
          {getCategoryIcon(transaction.category)}
        </div>
        <div>
          <p className="font-medium text-sm">{transaction.name}</p>
          <p className="text-xs text-muted-foreground">{transaction.date}</p>
        </div>
      </div>
      <div className={cn(
        "font-medium",
        transaction.type === "expense" ? "text-red-600" : "text-green-600"
      )}>
        {transaction.type === "expense" ? "-" : "+"}
        {transaction.amount}
      </div>
    </div>
  );
};

const TransactionList = () => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      name: "Amazon Purchase",
      amount: "$68.35",
      type: "expense",
      category: "shopping",
      date: "Today, 3:45 PM"
    },
    {
      id: "2",
      name: "Starbucks Coffee",
      amount: "$4.95",
      type: "expense",
      category: "food",
      date: "Yesterday, 9:23 AM"
    },
    {
      id: "3",
      name: "Salary Deposit",
      amount: "$3,500.00",
      type: "income",
      category: "other",
      date: "May 15, 2023"
    },
    {
      id: "4",
      name: "Apartment Rent",
      amount: "$1,200.00",
      type: "expense",
      category: "housing",
      date: "May 10, 2023"
    },
    {
      id: "5",
      name: "Uber Ride",
      amount: "$12.50",
      type: "expense",
      category: "transport",
      date: "May 8, 2023"
    }
  ]);

  const handleAddTransaction = (newTransaction: Omit<Transaction, "id">) => {
    // Generate a unique ID (in a real app, this would come from the backend)
    const id = (transactions.length + 1).toString();
    
    // Add the new transaction to the beginning of the list
    setTransactions([{ id, ...newTransaction }, ...transactions]);
    
    // Show notification
    toast({
      title: "Transaction added",
      description: `${newTransaction.name} has been added to your transactions.`,
    });
  };

  const handleDownload = () => {
    // Create CSV content
    const headers = ["Id", "Name", "Amount", "Type", "Category", "Date"];
    const csvContent = [
      headers.join(","),
      ...transactions.map(transaction => 
        [
          transaction.id,
          transaction.name,
          transaction.amount,
          transaction.type,
          transaction.category,
          transaction.date
        ].join(",")
      )
    ].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download complete",
      description: "Your transactions have been downloaded as a CSV file.",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Recent Transactions</CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1"
            onClick={handleDownload}
          >
            <span>Download</span>
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="h-8 gap-1"
            onClick={() => setDialogOpen(true)}
          >
            <Plus size={16} />
            <span>Add Transaction</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {transactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
      </CardContent>
      
      <AddTransactionDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAddTransaction={handleAddTransaction}
      />
    </Card>
  );
};

export default TransactionList;
