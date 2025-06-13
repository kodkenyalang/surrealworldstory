import { getDefaultConfig } from '@tomo-inc/tomo-evm-kit';
import { mainnet, polygon, optimism, arbitrum, base, sepolia, story, storyAeneid } from 'wagmi/chains';

// Story Protocol testnet chain configuration
const storyTestnet = {
  id: 1513,
  name: 'Story Protocol Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'IP',
    symbol: 'IP',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.storyrpc.io'],
    },
    public: {
      http: ['https://testnet.storyrpc.io'],
    },
  },
  blockExplorers: {
    default: { name: 'StoryScan', url: 'https://testnet.storyscan.xyz' },
  },
} as const;

export const tomoConfig = getDefaultConfig({
  clientId: 'dnxmkafxmw8HZajQhTQOU6mk27EN2F7wUXUSw4MEgVILDCzWmXz9PHWhDuUoaaiQ3ePwhc74rtyFNQD5FAqISNnS',
  appName: 'VerifydIP - Indigenous IP Protection Platform',
  projectId: 'b0eb203bf1ac5b2cf327849623d9bfbd',
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia, story, storyTestnet],
  ssr: false,
});

export const tomoTheme = {
  colors: {
    primary: '#4F46E5', // Indigo-600
    secondary: '#059669', // Emerald-600
    accent: '#DC2626', // Red-600
    background: '#FFFFFF',
    surface: '#F8FAFC', // Slate-50
    text: '#1E293B', // Slate-800
    textSecondary: '#64748B', // Slate-500
    border: '#E2E8F0', // Slate-200
    success: '#10B981', // Emerald-500
    warning: '#F59E0B', // Amber-500
    error: '#EF4444', // Red-500
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
};