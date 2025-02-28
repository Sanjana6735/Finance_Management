
import Navbar from "@/components/Navbar";
import AccountsList from "@/components/AccountsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Accounts = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    accountType: "",
    name: "",
    balance: "",
    cardNumber: "",
  });
  
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
    
    // Close dialog and show success message
    setOpen(false);
    
    toast({
      title: "Account successfully added",
      description: "Your new account has been added to your profile.",
    });
    
    // Reset form
    setFormData({
      accountType: "",
      name: "",
      balance: "",
      cardNumber: "",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container px-4 py-8">
        <div className="opacity-0 animate-on-mount">
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your financial accounts in one place
          </p>
        </div>
        
        <Card className="mt-8 opacity-0 animate-on-mount animation-delay-100">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Accounts</CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1">
                  <PlusCircle size={16} />
                  <span>Add New Account</span>
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
          </CardHeader>
          <CardContent>
            <AccountsList />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Accounts;
