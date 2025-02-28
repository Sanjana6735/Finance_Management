
import Navbar from "@/components/Navbar";
import EmiBanner from "@/components/EmiBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CalendarClock, Clock, Check, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Payments = () => {
  const { toast } = useToast();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [newPaymentOpen, setNewPaymentOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    date: "",
    description: "",
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

  // Sample EMI data
  const [emiPayments, setEmiPayments] = useState([
    {
      id: 1,
      name: "Home Loan EMI",
      amount: "$1,256.78",
      date: "May 28, 2023",
      status: "upcoming",
      description: "Home Loan EMI payment due in 5 days"
    },
    {
      id: 2,
      name: "Car Loan EMI",
      amount: "$450.00",
      date: "June 5, 2023",
      status: "upcoming",
      description: "Car Loan EMI payment due in 13 days"
    },
    {
      id: 3,
      name: "Personal Loan EMI",
      amount: "$320.45",
      date: "May 15, 2023",
      status: "paid",
      description: "Personal Loan EMI paid successfully"
    },
    {
      id: 4,
      name: "Credit Card Bill",
      amount: "$780.32",
      date: "May 10, 2023",
      status: "paid",
      description: "Credit Card bill paid successfully"
    },
    {
      id: 5,
      name: "Education Loan EMI",
      amount: "$550.00",
      date: "May 5, 2023",
      status: "missed",
      description: "Education Loan EMI payment missed"
    }
  ]);

  const handlePayNow = () => {
    setShowPaymentForm(true);
  };

  const handleProcessPayment = () => {
    toast({
      title: "Payment Successful",
      description: "Your payment has been processed successfully.",
    });
    setShowPaymentForm(false);
    
    // Update the payment status
    const updatedPayments = [...emiPayments];
    const paymentIndex = updatedPayments.findIndex(p => p.id === 1);
    if (paymentIndex !== -1) {
      updatedPayments[paymentIndex].status = "paid";
      updatedPayments[paymentIndex].description = "Home Loan EMI paid successfully";
      setEmiPayments(updatedPayments);
    }
  };
  
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleAddPayment = () => {
    // Validate form
    if (!formData.name || !formData.amount || !formData.date) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // Add new payment
    const newPayment = {
      id: emiPayments.length + 1,
      name: formData.name,
      amount: formData.amount.startsWith('$') ? formData.amount : `$${formData.amount}`,
      date: formData.date,
      status: "upcoming",
      description: formData.description || `${formData.name} payment due soon`
    };
    
    setEmiPayments([...emiPayments, newPayment]);
    
    // Reset form and close dialog
    setFormData({
      name: "",
      amount: "",
      date: "",
      description: "",
    });
    setNewPaymentOpen(false);
    
    toast({
      title: "Payment successfully added",
      description: "Your new payment has been added to your schedule.",
    });
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'upcoming':
        return <Clock size={16} className="text-blue-500" />;
      case 'paid':
        return <Check size={16} className="text-green-500" />;
      case 'missed':
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 opacity-0 animate-on-mount">
          <div>
            <h1 className="text-3xl font-bold">EMI & Payments</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage all your EMI payments and bills
            </p>
          </div>
          <Dialog open={newPaymentOpen} onOpenChange={setNewPaymentOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <PlusCircle size={16} />
                <span>Add New Payment</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Payment</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Payment Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. Car Loan EMI"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    value={formData.amount}
                    onChange={(e) => handleChange("amount", e.target.value)}
                    placeholder="e.g. 500.00"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="date">Due Date</Label>
                  <Input
                    id="date"
                    value={formData.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                    placeholder="e.g. June 15, 2023"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="e.g. Monthly car loan payment"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddPayment}>Add Payment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="mt-8 opacity-0 animate-on-mount animation-delay-100">
          <EmiBanner 
            nextPayment={{
              amount: "$256.78",
              date: "May 28, 2023",
              description: "Home Loan EMI payment due in 5 days"
            }}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="md:col-span-2 opacity-0 animate-on-mount animation-delay-200">
            <Card>
              <CardHeader>
                <CardTitle>Payment Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emiPayments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <CalendarClock size={20} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{payment.name}</p>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(payment.status)}
                            <p className="text-sm text-muted-foreground">{payment.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{payment.amount}</p>
                        <p className="text-sm text-muted-foreground">{payment.date}</p>
                        {payment.status === 'upcoming' && (
                          <Button size="sm" className="mt-2" onClick={handlePayNow}>Pay Now</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="opacity-0 animate-on-mount animation-delay-300">
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Monthly Payments</p>
                    <p className="text-2xl font-bold mt-1">$3,357.55</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Upcoming Payments</p>
                    <p className="text-2xl font-bold mt-1">$1,706.78</p>
                    <p className="text-sm text-muted-foreground mt-1">Due within 30 days</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">This Month's Paid</p>
                    <p className="text-2xl font-bold mt-1">$1,100.77</p>
                    <p className="text-sm text-green-500 mt-1">All payments on time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {showPaymentForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Make Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="payment-name">Payment</Label>
                    <Input id="payment-name" value="Home Loan EMI" readOnly className="bg-muted" />
                  </div>
                  
                  <div>
                    <Label htmlFor="payment-amount">Amount</Label>
                    <Input id="payment-amount" value="$1,256.78" readOnly className="bg-muted" />
                  </div>
                  
                  <div>
                    <Label htmlFor="payment-method">Payment Method</Label>
                    <Select defaultValue="credit-card">
                      <SelectTrigger id="payment-method">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit-card">Credit Card (**** 1234)</SelectItem>
                        <SelectItem value="bank">Chase Checking (**** 5678)</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setShowPaymentForm(false)}>
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={handleProcessPayment}>
                      Pay Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Payments;
