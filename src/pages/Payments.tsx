
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import EmiBanner from "@/components/EmiBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CalendarClock, Clock, Check, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

interface PaymentItem {
  id: number | string;
  name: string;
  amount: string;
  date: string;
  status: 'upcoming' | 'paid' | 'missed';
  description: string;
}

const Payments = () => {
  const { toast } = useToast();
  const { userId } = useAuth();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [newPaymentOpen, setNewPaymentOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    date: "",
    description: "",
  });
  const [emiPayments, setEmiPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMonthlyPayments, setTotalMonthlyPayments] = useState("₹0");
  const [upcomingPayments, setUpcomingPayments] = useState("₹0");
  const [paidPayments, setPaidPayments] = useState("₹0");
  
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

  // Fetch user's EMI payments 
  useEffect(() => {
    const fetchEmiPayments = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Check if the user has any loan accounts (negative balance)
        const { data: accounts, error: accountsError } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', userId);

        if (accountsError) throw accountsError;

        // Generate synthetic payment data based on accounts
        if (accounts && accounts.length > 0) {
          // Find any accounts with negative balance (loans)
          const loanAccounts = accounts.filter(acc => parseFloat(acc.balance) < 0);
          
          const payments: PaymentItem[] = [];
          let totalMonthly = 0;
          let upcomingTotal = 0;
          let paidTotal = 0;
          
          // If there are loan accounts, create payment records for them
          if (loanAccounts.length > 0) {
            loanAccounts.forEach((loan, index) => {
              const loanAmount = Math.abs(parseFloat(loan.balance));
              const emiAmount = loanAmount * 0.05; // 5% of loan as EMI
              
              // Add an upcoming payment
              const futureDate = new Date();
              futureDate.setDate(futureDate.getDate() + (index * 3) + 5);
              payments.push({
                id: `upcoming-${index}`,
                name: `${loan.name} EMI`,
                amount: `₹${emiAmount.toLocaleString('en-IN')}`,
                date: futureDate.toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }),
                status: 'upcoming',
                description: `${loan.name} EMI payment due in ${Math.floor((futureDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`
              });
              upcomingTotal += emiAmount;
              totalMonthly += emiAmount;
              
              // Add a paid payment
              const pastDate = new Date();
              pastDate.setDate(pastDate.getDate() - (index * 5) - 10);
              payments.push({
                id: `paid-${index}`,
                name: `${loan.name} EMI`,
                amount: `₹${emiAmount.toLocaleString('en-IN')}`,
                date: pastDate.toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }),
                status: 'paid',
                description: `${loan.name} EMI paid successfully`
              });
              paidTotal += emiAmount;
              totalMonthly += emiAmount;
            });
            
            // Maybe add a missed payment for realism
            if (loanAccounts.length > 1) {
              const missedDate = new Date();
              missedDate.setDate(missedDate.getDate() - 15);
              const missedAmount = Math.abs(parseFloat(loanAccounts[0].balance)) * 0.05;
              
              payments.push({
                id: 'missed-1',
                name: 'Education Loan EMI',
                amount: `₹${missedAmount.toLocaleString('en-IN')}`,
                date: missedDate.toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }),
                status: 'missed',
                description: 'Education Loan EMI payment missed'
              });
              totalMonthly += missedAmount;
            }
          }
          
          // If no loans were found, add some sample data
          if (payments.length === 0) {
            const dummyPayments: PaymentItem[] = [
              {
                id: 1,
                name: "Home Loan EMI",
                amount: "₹12,500",
                date: "May 28, 2023",
                status: "upcoming",
                description: "Home Loan EMI payment due in 5 days"
              },
              {
                id: 2,
                name: "Car Loan EMI",
                amount: "₹4,500",
                date: "June 5, 2023",
                status: "upcoming",
                description: "Car Loan EMI payment due in 13 days"
              },
              {
                id: 3,
                name: "Personal Loan EMI",
                amount: "₹3,200",
                date: "May 15, 2023",
                status: "paid",
                description: "Personal Loan EMI paid successfully"
              }
            ];
            
            setEmiPayments(dummyPayments);
            setTotalMonthlyPayments("₹20,200");
            setUpcomingPayments("₹17,000");
            setPaidPayments("₹3,200");
          } else {
            setEmiPayments(payments);
            setTotalMonthlyPayments(`₹${totalMonthly.toLocaleString('en-IN')}`);
            setUpcomingPayments(`₹${upcomingTotal.toLocaleString('en-IN')}`);
            setPaidPayments(`₹${paidTotal.toLocaleString('en-IN')}`);
          }
        } else {
          // No accounts found, set empty state
          setEmiPayments([]);
          setTotalMonthlyPayments("₹0");
          setUpcomingPayments("₹0");
          setPaidPayments("₹0");
        }
      } catch (err) {
        console.error("Error fetching payment data:", err);
        toast({
          title: "Error",
          description: "Failed to load payment data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEmiPayments();
  }, [userId, toast]);

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
    const newPayment: PaymentItem = {
      id: `new-${emiPayments.length + 1}`,
      name: formData.name,
      amount: formData.amount.startsWith('₹') ? formData.amount : `₹${formData.amount}`,
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

  const getStatusIcon = (status: string) => {
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
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    value={formData.amount}
                    onChange={(e) => handleChange("amount", e.target.value)}
                    placeholder="e.g. 5000"
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
          {loading ? (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-16">
                  <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          ) : emiPayments.length > 0 ? (
            <EmiBanner 
              nextPayment={{
                amount: emiPayments.find(p => p.status === 'upcoming')?.amount || "₹0",
                date: emiPayments.find(p => p.status === 'upcoming')?.date || "",
                description: emiPayments.find(p => p.status === 'upcoming')?.description || "No upcoming payments"
              }}
            />
          ) : null}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="md:col-span-2 opacity-0 animate-on-mount animation-delay-200">
            <Card>
              <CardHeader>
                <CardTitle>Payment Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : emiPayments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">No payments scheduled</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setNewPaymentOpen(true)}
                    >
                      <PlusCircle size={16} className="mr-2" />
                      Add Your First Payment
                    </Button>
                  </div>
                ) : (
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
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="opacity-0 animate-on-mount animation-delay-300">
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Monthly Payments</p>
                      <p className="text-2xl font-bold mt-1">{totalMonthlyPayments}</p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Upcoming Payments</p>
                      <p className="text-2xl font-bold mt-1">{upcomingPayments}</p>
                      <p className="text-sm text-muted-foreground mt-1">Due within 30 days</p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">This Month's Paid</p>
                      <p className="text-2xl font-bold mt-1">{paidPayments}</p>
                      <p className="text-sm text-green-500 mt-1">
                        {emiPayments.some(p => p.status === 'missed') 
                          ? "Some payments missed" 
                          : "All payments on time"}
                      </p>
                    </div>
                  </div>
                )}
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
                    <Input id="payment-amount" value="₹12,500" readOnly className="bg-muted" />
                  </div>
                  
                  <div>
                    <Label htmlFor="payment-method">Payment Method</Label>
                    <Select defaultValue="credit-card">
                      <SelectTrigger id="payment-method">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit-card">Credit Card (**** 1234)</SelectItem>
                        <SelectItem value="bank">Savings Account (**** 5678)</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
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
