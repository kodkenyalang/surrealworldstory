import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TomoWalletProvider } from "@/components/tomo-wallet-provider";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TomoWalletProvider>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </TomoWalletProvider>
  );
}

export default App;
