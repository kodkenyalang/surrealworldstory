import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { useConnectModal } from '@tomo-inc/tomo-evm-kit';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wallet, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

export function WalletConnectionDebug() {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const { connect, connectors, error: connectError, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const chainId = useChainId();
  const { switchChain, error: switchError } = useSwitchChain();
  
  const [connectionState, setConnectionState] = useState<string>('disconnected');
  const [debugInfo, setDebugInfo] = useState<any[]>([]);

  useEffect(() => {
    const info = [];
    info.push({ label: 'Is Connected', value: isConnected });
    info.push({ label: 'Is Connecting', value: isConnecting });
    info.push({ label: 'Is Disconnected', value: isDisconnected });
    info.push({ label: 'Address', value: address || 'None' });
    info.push({ label: 'Chain ID', value: chainId });
    info.push({ label: 'Available Connectors', value: connectors.length });
    
    if (connectError) {
      info.push({ label: 'Connect Error', value: connectError.message });
    }
    
    if (switchError) {
      info.push({ label: 'Switch Error', value: switchError.message });
    }

    setDebugInfo(info);
    
    if (isConnected) {
      setConnectionState('connected');
    } else if (isConnecting) {
      setConnectionState('connecting');
    } else {
      setConnectionState('disconnected');
    }
  }, [isConnected, isConnecting, isDisconnected, address, chainId, connectError, switchError, connectors]);

  const handleDirectConnect = async (connector: any) => {
    try {
      console.log('Attempting to connect with:', connector.name);
      await connect({ connector });
    } catch (error) {
      console.error('Direct connection failed:', error);
    }
  };

  const handleTomoConnect = () => {
    try {
      console.log('Opening Tomo connect modal');
      openConnectModal();
    } catch (error) {
      console.error('Tomo modal failed:', error);
    }
  };

  const handleDisconnect = () => {
    try {
      disconnect();
      setConnectionState('disconnected');
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  const handleSwitchToStory = async () => {
    try {
      await switchChain({ chainId: 1513 }); // Story Protocol testnet
    } catch (error) {
      console.error('Switch chain failed:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Connection Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <Badge variant={
            connectionState === 'connected' ? 'default' :
            connectionState === 'connecting' ? 'secondary' : 'outline'
          }>
            {connectionState === 'connected' && <CheckCircle className="h-3 w-3 mr-1" />}
            {connectionState === 'connecting' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
            {connectionState === 'disconnected' && <AlertTriangle className="h-3 w-3 mr-1" />}
            {connectionState}
          </Badge>
        </div>

        {/* Debug Information */}
        <div className="space-y-2">
          <h4 className="font-medium">Debug Information:</h4>
          <div className="bg-gray-50 p-3 rounded-md text-sm space-y-1">
            {debugInfo.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="font-medium">{item.label}:</span>
                <span className="text-gray-600">{String(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Error Messages */}
        {connectError && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Connection Error: {connectError.message}
            </AlertDescription>
          </Alert>
        )}

        {switchError && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Chain Switch Error: {switchError.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Connection Actions */}
        <div className="space-y-3">
          <h4 className="font-medium">Connection Methods:</h4>
          
          {/* Tomo Modal Connection */}
          <Button 
            onClick={handleTomoConnect}
            disabled={isPending || isConnecting}
            className="w-full"
          >
            Connect via Tomo Modal
          </Button>

          {/* Direct Connector Buttons */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Direct Connector Access:</p>
            {connectors.map((connector) => (
              <Button
                key={connector.id}
                onClick={() => handleDirectConnect(connector)}
                disabled={isPending || isConnecting}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {connector.name} 
                {connector.id === 'injected' && ' (MetaMask)'}
              </Button>
            ))}
          </div>

          {/* Chain Actions */}
          {isConnected && (
            <div className="space-y-2 pt-4 border-t">
              <p className="text-sm font-medium">Chain Actions:</p>
              <Button
                onClick={handleSwitchToStory}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Switch to Story Protocol (1513)
              </Button>
              <Button
                onClick={handleDisconnect}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                Disconnect Wallet
              </Button>
            </div>
          )}
        </div>

        {/* MetaMask Specific Debugging */}
        <div className="space-y-2 pt-4 border-t">
          <h4 className="font-medium">MetaMask Debug:</h4>
          <div className="bg-blue-50 p-3 rounded-md text-sm">
            <p><strong>Window.ethereum:</strong> {typeof window !== 'undefined' && (window as any).ethereum ? 'Available' : 'Not Available'}</p>
            <p><strong>MetaMask:</strong> {typeof window !== 'undefined' && (window as any).ethereum?.isMetaMask ? 'Detected' : 'Not Detected'}</p>
            <p><strong>Current Chain:</strong> {chainId}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}