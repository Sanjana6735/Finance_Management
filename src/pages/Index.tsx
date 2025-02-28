
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, CreditCard, PiggyBank, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Add animation classes on mount
    const elements = document.querySelectorAll('.animate-on-mount');
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('animate-fade-up');
        el.classList.remove('opacity-0');
      }, index * 150);
    });

    // Show welcome toast
    setTimeout(() => {
      toast({
        title: 'Welcome to Wealth',
        description: 'Your AI-powered financial companion',
      });
    }, 1000);
  }, [toast]);

  const features = [
    {
      icon: <CreditCard className="h-5 w-5" />,
      title: 'Multiple Account Management',
      description: 'Manage all your financial accounts in one place, from checking and savings to investments and credit cards.'
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'EMI Tracking & Planning',
      description: 'Stay on top of your loan payments with automated EMI tracking, reminders, and optimization suggestions.'
    },
    {
      icon: <Target className="h-5 w-5" />,
      title: 'Credit Score Monitoring',
      description: 'Track your credit score, understand the factors affecting it, and get personalized tips to improve it.'
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: 'AI-Powered Insights',
      description: 'Receive personalized financial insights, budget optimization suggestions, and investment recommendations.'
    },
    {
      icon: <PiggyBank className="h-5 w-5" />,
      title: 'Smart Budget Planning',
      description: 'Create intelligent budgets that adapt to your spending patterns and help you save more.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 -z-10" />
        <div className="container px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center px-3 py-1 mb-6 text-sm font-medium rounded-full bg-primary/10 text-primary opacity-0 animate-on-mount">
              <Sparkles className="h-3.5 w-3.5 mr-2" />
              <span>AI-Powered Finance Management</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 opacity-0 animate-on-mount">
              Master Your Finances with <span className="text-primary">Wealth</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 opacity-0 animate-on-mount">
              A comprehensive AI-powered platform that helps you manage accounts, track EMIs, monitor credit scores, and optimize your financial health.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-on-mount">
              <Button asChild size="lg" className="px-8">
                <Link to="/dashboard">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/demo">Watch Demo</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating preview cards */}
        <div className="hidden md:block absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-full max-w-5xl opacity-0 animate-on-mount">
          <div className="relative h-32">
            <div className="absolute left-0 top-0 w-64 h-24 bg-white rounded-xl shadow-lg p-4 transform -rotate-6 glassmorphism">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <PiggyBank size={16} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Savings</p>
                  <p className="text-base font-semibold">$12,453.78</p>
                </div>
              </div>
            </div>
            
            <div className="absolute right-0 top-0 w-72 h-24 bg-white rounded-xl shadow-lg p-4 transform rotate-6 glassmorphism">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <CreditCard size={16} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Credit Score</p>
                  <p className="text-base font-semibold">725 <span className="text-xs text-green-600">Excellent</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center mb-16 opacity-0 animate-on-mount">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Manage Your Finances</h2>
            <p className="text-lg text-muted-foreground">
              Wealth combines powerful tools and AI insights to give you complete control over your financial life.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title} 
                className="bg-accent/50 rounded-xl p-6 border border-border/50 opacity-0 animate-on-mount"
                style={{ animationDelay: `${(index + 5) * 100}ms` }}
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center opacity-0 animate-on-mount">
            <h2 className="text-3xl font-bold mb-4">Ready to Take Control of Your Finances?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of users who are already using Wealth to optimize their financial health.
            </p>
            <Button asChild size="lg" className="px-8">
              <Link to="/dashboard">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-wealth-950 text-white">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <div className="relative w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
                <div className="absolute w-5 h-5 bg-primary-foreground rounded-full" style={{ top: -2, right: -2 }}></div>
              </div>
              <span className="text-xl font-semibold tracking-tight">Wealth</span>
            </div>
            
            <div className="flex gap-8">
              <Link to="/about" className="text-sm text-white/70 hover:text-white transition-colors">About</Link>
              <Link to="/features" className="text-sm text-white/70 hover:text-white transition-colors">Features</Link>
              <Link to="/pricing" className="text-sm text-white/70 hover:text-white transition-colors">Pricing</Link>
              <Link to="/contact" className="text-sm text-white/70 hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 text-center md:text-left">
            <p className="text-sm text-white/50">
              © {new Date().getFullYear()} Wealth. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
