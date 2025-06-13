import { Button } from "@/components/ui/button";
import { useAccount, useDisconnect } from "wagmi";
import { useConnectModal } from '@tomo-inc/tomo-evm-kit';
import { Shield, Wallet } from "lucide-react";

export default function Header() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const handleWalletAction = () => {
    if (isConnected) {
      disconnect();
    } else {
      openConnectModal();
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="text-story-500 w-8 h-8" />
              <h1 className="text-xl font-bold text-slate-800">VerifydIP</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <button 
                onClick={() => scrollToSection('upload')}
                className="text-slate-600 hover:text-story-500 font-medium transition-colors"
              >
                Upload
              </button>
              <button 
                onClick={() => scrollToSection('dashboard')}
                className="text-slate-600 hover:text-story-500 font-medium transition-colors"
              >
                Dashboard
              </button>
              <button 
                onClick={() => scrollToSection('royalties')}
                className="text-slate-600 hover:text-story-500 font-medium transition-colors"
              >
                Royalties
              </button>
              <button 
                onClick={() => scrollToSection('verify')}
                className="text-slate-600 hover:text-story-500 font-medium transition-colors"
              >
                Verify
              </button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={handleWalletAction}
              className="bg-story-500 hover:bg-story-600 text-white"
            >
              <Wallet className="w-4 h-4 mr-2" />
              {isConnected 
                ? `Connected (${address?.slice(0, 6)}...${address?.slice(-4)})` 
                : 'Connect Wallet'
              }
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
