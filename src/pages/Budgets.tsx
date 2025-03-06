
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface BudgetItem {
  id: string;
  category: string;
  total: number;
  spent: number;
  created_at: string;
  percentage: number;
}

const Budgets = () => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = new Date();
    return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
  });
  const [formData, setFormData] = useState({
    category: "",
    total: "",
  });

  // Fetch budget data
  const fetchBudgets = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId);
        
      if (error) throw error;
      
      if (data) {
        console.log("Fetched budget data:", data);
        const formattedBudgets = data.map(budget => ({
          id: budget.id,
          category: budget.category,
          total: budget.total,
          spent: budget.spent,
          created_at: new Date(budget.created_at).toLocaleDateString('en-IN'),
          percentage: (budget.spent / budget.total) * 100
        }));
        
        setBudgets(formattedBudgets);
      }
    } catch (err) {
      console.error("Error fetching budgets:", err);
      toast({
        title: "Error",
        description: "Failed to load budget data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBudgets();
    
    // Set up a refresh interval to check for new data periodically
    const refreshInterval = setInterval(() => {
      fetchBudgets();
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(refreshInterval);
  }, [userId, toast]);

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

  const handleAddBudget = async () => {
    if (!formData.category || !formData.total || parseFloat(formData.total) <= 0) {
      toast({
        title: "Error",
        description: "Please provide a valid category and budget amount",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert([
          {
            category: formData.category,
            total: parseFloat(formData.total),
            spent: 0,
            user_id: userId
          }
        ])
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Budget Added",
        description: `Your ${formData.category} budget has been created successfully.`
      });
      
      // Fetch the updated budgets instead of manually adding to state
      fetchBudgets();
      
      // Reset form data
      setFormData({
        category: "",
        total: "",
      });
      
      // Close dialog
      setOpenDialog(false);
    } catch (err) {
      console.error("Error adding budget:", err);
      toast({
        title: "Error",
        description: "Failed to add budget",
        variant: "destructive"
      });
    }
  };

  // Delete budget handler
  const handleDeleteBudget = async (id: string) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setBudgets(budgets.filter(budget => budget.id !== id));

      toast({
        title: "Budget Deleted",
        description: "The budget has been removed successfully"
      });
    } catch (err) {
      console.error("Error deleting budget:", err);
      toast({
        title: "Error",
        description: "Failed to delete budget",
        variant: "destructive"
      });
    }
  };

  // Category options for the dropdown
  const categories = [
    { value: "Housing", label: "Housing" },
    { value: "Food", label: "Food" },
    { value: "Transport", label: "Transport" },
    { value: "Shopping", label: "Shopping" },
    { value: "Entertainment", label: "Entertainment" },
    { value: "Healthcare", label: "Healthcare" },
    { value: "Education", label: "Education" },
    { value: "Personal", label: "Personal" },
    { value: "Savings", label: "Savings" },
    { value: "Other", label: "Other" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 opacity-0 animate-on-mount">
          <div>
            <h1 className="text-3xl font-bold">Budgets</h1>
            <p className="text-muted-foreground mt-1">
              Manage your monthly budget allocations and track spending
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-1">
              <CalendarDays size={15} />
              <span>{currentMonth}</span>
            </Button>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button className="gap-1">
                  <PlusCircle size={16} />
                  <span>New Budget</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Budget</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({...formData, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="total">Budget Amount (₹)</Label>
                    <Input
                      id="total"
                      type="number"
                      value={formData.total}
                      onChange={(e) => setFormData({...formData, total: e.target.value})}
                      placeholder="Enter amount"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddBudget}>
                    Create Budget
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="md:col-span-2 opacity-0 animate-on-mount animation-delay-100">
              <Card>
                <CardHeader>
                  <CardTitle>Your Budgets</CardTitle>
                </CardHeader>
                <CardContent>
                  {budgets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <p className="text-muted-foreground text-center">No budgets have been created yet.</p>
                      <Button
                        className="mt-4 gap-2"
                        onClick={() => setOpenDialog(true)}
                      >
                        <PlusCircle size={16} />
                        Create your first budget
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {budgets.map((budget) => (
                        <div key={budget.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-lg">{budget.category}</h3>
                              <p className="text-sm text-muted-foreground">Created: {budget.created_at}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Pencil size={14} className="mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-destructive"
                                onClick={() => handleDeleteBudget(budget.id)}
                              >
                                <Trash2 size={14} className="mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">
                                Progress: {budget.percentage.toFixed(0)}%
                              </span>
                              <span className={`text-sm ${budget.percentage > 90 ? "text-destructive" : ""}`}>
                                ₹{budget.spent.toLocaleString('en-IN')} / ₹{budget.total.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <Progress 
                              value={budget.percentage} 
                              className={budget.percentage > 90 ? "bg-destructive" : ""} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="opacity-0 animate-on-mount animation-delay-200">
              <Card>
                <CardHeader>
                  <CardTitle>Budget Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {budgets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <p className="text-muted-foreground text-center">Add budgets to see your summary</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Budget Allocation</h3>
                        <p className="text-2xl font-bold">
                          ₹{budgets.reduce((sum, budget) => sum + budget.total, 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Spent</h3>
                        <p className="text-2xl font-bold">
                          ₹{budgets.reduce((sum, budget) => sum + budget.spent, 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Remaining Budget</h3>
                        <p className="text-2xl font-bold text-green-600">
                          ₹{(budgets.reduce((sum, budget) => sum + budget.total, 0) - 
                            budgets.reduce((sum, budget) => sum + budget.spent, 0)).toLocaleString('en-IN')}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Budget Health</h3>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const avgPercentage = budgets.reduce((sum, budget) => sum + budget.percentage, 0) / budgets.length;
                            if (avgPercentage > 90) {
                              return (
                                <>
                                  <div className="h-3 w-3 rounded-full bg-destructive"></div>
                                  <span className="text-destructive font-medium">Over Budget</span>
                                </>
                              );
                            } else if (avgPercentage > 75) {
                              return (
                                <>
                                  <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                                  <span className="text-amber-500 font-medium">Approaching Limit</span>
                                </>
                              );
                            } else {
                              return (
                                <>
                                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                  <span className="text-green-500 font-medium">Healthy</span>
                                </>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
      <footer className="container mx-auto px-4 py-6 mt-8 border-t text-center text-muted-foreground">
        <p>© 2025 Wealth Finance App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Budgets;
