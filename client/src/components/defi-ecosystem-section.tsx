import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { WalletConnectionDebug } from "@/components/wallet-connection-debug";
import { 
  Coins, 
  Palette, 
  DollarSign, 
  TrendingUp,
  Shield,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export default function DeFiEcosystemSection() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for different forms
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [repayAmount, setRepayAmount] = useState("");
  const [collateralAmount, setCollateralAmount] = useState("");

  // State for IP registration
  const [ipRegistration, setIpRegistration] = useState({
    culturalOrigin: "",
    artisanName: "",
    patternName: "",
    technique: "",
    materials: "",
    region: "",
    tribe: "",
    royaltyPercentage: "5"
  });

  // Fetch liquid staking data
  const { data: stakingData, isLoading: stakingLoading } = useQuery({
    queryKey: ['/api/defi/staking', address],
    enabled: isConnected && !!address,
  });

  // Fetch loan position
  const { data: loanData, isLoading: loanLoading } = useQuery({
    queryKey: ['/api/defi/loan', address],
    enabled: isConnected && !!address,
  });

  // Fetch IP registry data
  const { data: ipRegistryData, isLoading: ipLoading } = useQuery({
    queryKey: ['/api/defi/ip-registry', address],
    enabled: isConnected && !!address,
  });

  // Staking mutations
  const stakeMutation = useMutation({
    mutationFn: async (amount: string) => {
      const response = await apiRequest("POST", "/api/defi/stake", { amount, userAddress: address });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Staking Successful", description: "Tokens staked and LST minted" });
      queryClient.invalidateQueries({ queryKey: ['/api/defi/staking', address] });
      setStakeAmount("");
    },
  });

  const unstakeMutation = useMutation({
    mutationFn: async (amount: string) => {
      const response = await apiRequest("POST", "/api/defi/unstake", { amount, userAddress: address });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Unstaking Requested", description: "Unstaking delay started" });
      queryClient.invalidateQueries({ queryKey: ['/api/defi/staking', address] });
      setUnstakeAmount("");
    },
  });

  // Borrowing mutations
  const borrowMutation = useMutation({
    mutationFn: async (data: { collateralAmount: string; borrowAmount: string }) => {
      const response = await apiRequest("POST", "/api/defi/borrow", { ...data, userAddress: address });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Loan Created", description: "Stablecoin borrowed successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/defi/loan', address] });
      setBorrowAmount("");
      setCollateralAmount("");
    },
  });

  const repayMutation = useMutation({
    mutationFn: async (amount: string) => {
      const response = await apiRequest("POST", "/api/defi/repay", { amount, userAddress: address });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Loan Repaid", description: "Debt repaid successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/defi/loan', address] });
      setRepayAmount("");
    },
  });

  // IP registration mutation
  const registerIPMutation = useMutation({
    mutationFn: async (data: typeof ipRegistration) => {
      const response = await apiRequest("POST", "/api/defi/register-ip", { ...data, ownerAddress: address });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "IP Registered", description: "Traditional pattern registered as NFT" });
      queryClient.invalidateQueries({ queryKey: ['/api/defi/ip-registry', address] });
      setIpRegistration({
        culturalOrigin: "",
        artisanName: "",
        patternName: "",
        technique: "",
        materials: "",
        region: "",
        tribe: "",
        royaltyPercentage: "5"
      });
    },
  });

  if (!isConnected) {
    return (
      <section id="defi-ecosystem" className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">DeFi Ecosystem</h2>
            <p className="text-gray-600 mb-8">
              Connect your wallet to access liquid staking, IP registry, and borrowing features
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="defi-ecosystem" className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">DeFi Ecosystem</h2>
          <p className="text-gray-600 mb-8">
            Complete DeFi platform for indigenous IP assets: Staking, Registry, and Borrowing
          </p>
        </div>

        <Tabs defaultValue="staking" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="staking">Liquid Staking</TabsTrigger>
            <TabsTrigger value="registry">IP Registry</TabsTrigger>
            <TabsTrigger value="borrowing">Stablecoin Borrowing</TabsTrigger>
            <TabsTrigger value="debug">Wallet Debug</TabsTrigger>
          </TabsList>

          {/* Liquid Staking Tab */}
          <TabsContent value="staking" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    Stake IP Tokens
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="stake-amount">Amount to Stake</Label>
                    <Input
                      id="stake-amount"
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="Enter amount to stake"
                    />
                  </div>
                  <Button 
                    onClick={() => stakeMutation.mutate(stakeAmount)}
                    disabled={stakeMutation.isPending || !stakeAmount}
                    className="w-full"
                  >
                    {stakeMutation.isPending ? "Staking..." : "Stake Tokens"}
                  </Button>
                  {stakingData && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm">Current Staked: {stakingData.stakedAmount || "0"} tokens</p>
                      <p className="text-sm">LST Balance: {stakingData.lstBalance || "0"} LST</p>
                      <p className="text-sm">Rewards: {stakingData.rewards || "0"} tokens</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Unlock className="h-5 w-5" />
                    Unstake Tokens
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="unstake-amount">LST Amount to Unstake</Label>
                    <Input
                      id="unstake-amount"
                      type="number"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      placeholder="Enter LST amount"
                    />
                  </div>
                  <Button 
                    onClick={() => unstakeMutation.mutate(unstakeAmount)}
                    disabled={unstakeMutation.isPending || !unstakeAmount}
                    className="w-full"
                    variant="outline"
                  >
                    {unstakeMutation.isPending ? "Processing..." : "Request Unstake"}
                  </Button>
                  <p className="text-xs text-gray-600">
                    Note: 7-day unstaking delay applies
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* IP Registry Tab */}
          <TabsContent value="registry" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Register Traditional Pattern
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cultural-origin">Cultural Origin</Label>
                    <Input
                      id="cultural-origin"
                      value={ipRegistration.culturalOrigin}
                      onChange={(e) => setIpRegistration({...ipRegistration, culturalOrigin: e.target.value})}
                      placeholder="e.g., Batak, Javanese"
                    />
                  </div>
                  <div>
                    <Label htmlFor="artisan-name">Artisan Name</Label>
                    <Input
                      id="artisan-name"
                      value={ipRegistration.artisanName}
                      onChange={(e) => setIpRegistration({...ipRegistration, artisanName: e.target.value})}
                      placeholder="Creator's name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pattern-name">Pattern Name</Label>
                    <Input
                      id="pattern-name"
                      value={ipRegistration.patternName}
                      onChange={(e) => setIpRegistration({...ipRegistration, patternName: e.target.value})}
                      placeholder="Traditional pattern name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="technique">Weaving Technique</Label>
                    <Input
                      id="technique"
                      value={ipRegistration.technique}
                      onChange={(e) => setIpRegistration({...ipRegistration, technique: e.target.value})}
                      placeholder="e.g., Backstrap loom"
                    />
                  </div>
                  <div>
                    <Label htmlFor="materials">Materials</Label>
                    <Input
                      id="materials"
                      value={ipRegistration.materials}
                      onChange={(e) => setIpRegistration({...ipRegistration, materials: e.target.value})}
                      placeholder="e.g., Cotton, silk"
                    />
                  </div>
                  <div>
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      value={ipRegistration.region}
                      onChange={(e) => setIpRegistration({...ipRegistration, region: e.target.value})}
                      placeholder="Geographic region"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tribe">Tribe</Label>
                    <Input
                      id="tribe"
                      value={ipRegistration.tribe}
                      onChange={(e) => setIpRegistration({...ipRegistration, tribe: e.target.value})}
                      placeholder="Specific tribal origin"
                    />
                  </div>
                  <div>
                    <Label htmlFor="royalty">Royalty % (0-50)</Label>
                    <Input
                      id="royalty"
                      type="number"
                      min="0"
                      max="50"
                      value={ipRegistration.royaltyPercentage}
                      onChange={(e) => setIpRegistration({...ipRegistration, royaltyPercentage: e.target.value})}
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => registerIPMutation.mutate(ipRegistration)}
                  disabled={registerIPMutation.isPending}
                  className="w-full"
                >
                  {registerIPMutation.isPending ? "Registering..." : "Register IP Pattern"}
                </Button>
                
                {ipRegistryData?.ownedTokens && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Your Registered Patterns</h4>
                    <div className="grid gap-3">
                      {ipRegistryData.ownedTokens.map((token: any) => (
                        <div key={token.tokenId} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{token.patternName}</p>
                              <p className="text-sm text-gray-600">{token.culturalOrigin}</p>
                            </div>
                            <Badge variant={token.isVerified ? "default" : "secondary"}>
                              {token.isVerified ? "Verified" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Borrowing Tab */}
          <TabsContent value="borrowing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Borrow Stablecoin
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="collateral-amount">LST Collateral Amount</Label>
                    <Input
                      id="collateral-amount"
                      type="number"
                      value={collateralAmount}
                      onChange={(e) => setCollateralAmount(e.target.value)}
                      placeholder="LST tokens as collateral"
                    />
                  </div>
                  <div>
                    <Label htmlFor="borrow-amount">Stablecoin to Borrow</Label>
                    <Input
                      id="borrow-amount"
                      type="number"
                      value={borrowAmount}
                      onChange={(e) => setBorrowAmount(e.target.value)}
                      placeholder="IPUSD amount (max 90% of collateral)"
                    />
                  </div>
                  <Button 
                    onClick={() => borrowMutation.mutate({ collateralAmount, borrowAmount })}
                    disabled={borrowMutation.isPending || !borrowAmount || !collateralAmount}
                    className="w-full"
                  >
                    {borrowMutation.isPending ? "Creating Loan..." : "Borrow IPUSD"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Loan Position
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loanData?.hasPosition ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Collateral:</span>
                          <span>{loanData.collateralAmount} LST</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Borrowed:</span>
                          <span>{loanData.borrowedAmount} IPUSD</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Interest:</span>
                          <span>{loanData.accruedInterest} IPUSD</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Health Factor:</span>
                          <Badge variant={loanData.healthFactor > 120 ? "default" : "destructive"}>
                            {loanData.healthFactor}%
                          </Badge>
                        </div>
                      </div>
                      
                      <Progress value={loanData.utilizationRatio} className="w-full" />
                      <p className="text-xs text-gray-600">
                        Utilization: {loanData.utilizationRatio}%
                      </p>

                      <div className="pt-4 border-t">
                        <Label htmlFor="repay-amount">Repay Amount</Label>
                        <Input
                          id="repay-amount"
                          type="number"
                          value={repayAmount}
                          onChange={(e) => setRepayAmount(e.target.value)}
                          placeholder="IPUSD to repay"
                        />
                        <Button 
                          onClick={() => repayMutation.mutate(repayAmount)}
                          disabled={repayMutation.isPending || !repayAmount}
                          className="w-full mt-2"
                          variant="outline"
                        >
                          {repayMutation.isPending ? "Repaying..." : "Repay Loan"}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No active loan position</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Wallet Debug Tab */}
          <TabsContent value="debug" className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Wallet Connection Debug</h3>
              <p className="text-gray-600">
                Debug tools to identify and resolve MetaMask connection issues
              </p>
            </div>
            <WalletConnectionDebug />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}