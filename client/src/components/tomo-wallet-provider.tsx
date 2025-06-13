import { TomoEVMKitProvider } from '@tomo-inc/tomo-evm-kit';
import { WagmiProvider } from 'wagmi';
import { queryClient } from '@/lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { tomoConfig } from '@/lib/tomo-evm-kit';

interface TomoWalletProviderProps {
  children: React.ReactNode;
}

export function TomoWalletProvider({ children }: TomoWalletProviderProps) {
  return (
    <WagmiProvider config={tomoConfig}>
      <QueryClientProvider client={queryClient}>
        <TomoEVMKitProvider>
          {children}
        </TomoEVMKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}