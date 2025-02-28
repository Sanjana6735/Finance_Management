
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Sparkles, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const FinancialAdvisor = () => {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your Wealth AI Financial Advisor powered by Gemini 1.5. I can help you manage your finances, create budgets, suggest investment strategies, and more. How can I assist you today?"
    }
  ]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    // Simulate AI response (in a real app, this would call an API)
    setTimeout(() => {
      let response = "";
      
      if (input.toLowerCase().includes('budget')) {
        response = "Based on your financial profile, I recommend allocating 50% of your income to necessities (housing, food, utilities), 30% to discretionary spending (entertainment, dining out), and 20% to savings and debt repayment. This 50/30/20 rule can help you maintain financial discipline while still enjoying life.";
      } else if (input.toLowerCase().includes('invest') || input.toLowerCase().includes('investment')) {
        response = "For your investment strategy, I recommend a diversified portfolio with 60% in low-cost index funds, 20% in bonds for stability, 15% in international stocks for diversification, and 5% in alternative investments. This balanced approach aligns with your long-term financial goals while managing risk.";
      } else if (input.toLowerCase().includes('debt') || input.toLowerCase().includes('loan')) {
        response = "To effectively manage your debt, prioritize high-interest loans first (like credit cards) while making minimum payments on others. Consider the debt avalanche method - targeting debts with the highest interest rates first to minimize what you pay in interest over time.";
      } else if (input.toLowerCase().includes('save') || input.toLowerCase().includes('saving')) {
        response = "I recommend building an emergency fund of 3-6 months of expenses before focusing on other financial goals. Automate your savings by setting up automatic transfers to a high-yield savings account each payday, aiming to save at least 10-15% of your income.";
      } else {
        response = "I'd be happy to help with that. Based on your current financial situation, including your income sources, expenses, and savings habits, I can suggest personalized strategies to help you reach your financial goals. Would you like recommendations on budgeting, investing, debt management, or retirement planning?";
      }
      
      const assistantMessage = { role: 'assistant' as const, content: response };
      setMessages(prev => [...prev, assistantMessage]);
      setLoading(false);
      
      toast({
        title: "AI Response Generated",
        description: "Your financial advice has been generated."
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container px-4 py-8">
        <h1 className="text-3xl font-bold">Financial Advisor</h1>
        <p className="text-muted-foreground mt-1 mb-6">
          Get personalized financial advice powered by Gemini 1.5 AI
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-270px)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot size={20} />
                  <span>AI Financial Assistant</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-[calc(100%-5rem)]">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {messages.map((message, index) => (
                    <div 
                      key={index} 
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {message.role === 'user' 
                            ? <User size={16} /> 
                            : <Sparkles size={16} className="text-primary" />
                          }
                          <span className="text-xs font-medium">
                            {message.role === 'user' ? 'You' : 'Wealth AI'}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] p-3 rounded-lg bg-muted">
                        <div className="flex items-center gap-2">
                          <Sparkles size={16} className="text-primary" />
                          <span className="text-xs font-medium">Wealth AI</span>
                        </div>
                        <div className="mt-2">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-150"></div>
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-300"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Textarea 
                    placeholder="Ask for financial advice..." 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!input.trim() || loading}
                  >
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Suggested Topics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => setInput("How should I budget my monthly income?")}
                >
                  Budget planning
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => setInput("What investment strategies would you recommend for me?")}
                >
                  Investment advice
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => setInput("How can I pay off my debts faster?")}
                >
                  Debt management
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => setInput("How much should I be saving each month?")}
                >
                  Savings goals
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => setInput("What tax strategies should I consider?")}
                >
                  Tax optimization
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FinancialAdvisor;
