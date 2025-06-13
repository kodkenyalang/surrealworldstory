import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Coins, 
  TrendingUp, 
  Send, 
  MessageSquare, 
  BarChart3, 
  Award,
  DollarSign,
  Users
} from "lucide-react";

export default function IDGTTokenSection() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [agentPrompt, setAgentPrompt] = useState("");
  const [royaltyAmount, setRoyaltyAmount] = useState("");
  const [usageFeeAmount, setUsageFeeAmount] = useState("");
  const [targetIpId, setTargetIpId] = useState("");

  // Fetch user's IDGT token information
  const { data: tokenInfo, isLoading: tokenLoading } = useQuery({
    queryKey: ['/api/idgt/user', address],
    enabled: isConnected && !!address,
  });

  // Fetch IDGT platform statistics
  const { data: idgtStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/idgt/stats'],
  });

  // Agent query mutation
  const agentMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest("/api/idgt/agent", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Agent Response",
        description: "IDGT agent has processed your request successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Agent Error",
        description: "Failed to process agent request. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Royalty payment mutation
  const royaltyMutation = useMutation({
    mutationFn: async ({ ipId, amount }: { ipId: string; amount: string }) => {
      const response = await apiRequest("/api/idgt/pay-royalty", {
        method: "POST",
        body: JSON.stringify({
          ipId,
          amount: (parseFloat(amount) * 1e18).toString(), // Convert to wei
          payerAddress: address,
        }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Royalty Payment Successful",
        description: `Payment processed: ${data.amountPaid}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/idgt/user', address] });
      setRoyaltyAmount("");
      setTargetIpId("");
    },
    onError: (error) => {
      toast({
        title: "Royalty Payment Failed",
        description: "Failed to process royalty payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Usage fee payment mutation
  const usageFeeMutation = useMutation({
    mutationFn: async ({ ipId, ethAmount }: { ipId: string; ethAmount: string }) => {
      const response = await apiRequest("/api/idgt/pay-usage-fee", {
        method: "POST",
        body: JSON.stringify({
          ipId,
          ethAmount: (parseFloat(ethAmount) * 1e18).toString(), // Convert to wei
          userAddress: address,
        }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Usage Fee Paid",
        description: `Fee processed: ${data.feeAmount}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/idgt/user', address] });
      setUsageFeeAmount("");
    },
    onError: (error) => {
      toast({
        title: "Usage Fee Failed",
        description: "Failed to process usage fee. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAgentQuery = () => {
    if (!agentPrompt.trim()) return;
    agentMutation.mutate(agentPrompt);
  };

  const handleRoyaltyPayment = () => {
    if (!targetIpId || !royaltyAmount) {
      toast({
        title: "Missing Information",
        description: "Please provide both IP ID and royalty amount.",
        variant: "destructive",
      });
      return;
    }
    royaltyMutation.mutate({ ipId: targetIpId, amount: royaltyAmount });
  };

  const handleUsageFeePayment = () => {
    if (!targetIpId || !usageFeeAmount) {
      toast({
        title: "Missing Information",
        description: "Please provide both IP ID and ETH amount.",
        variant: "destructive",
      });
      return;
    }
    usageFeeMutation.mutate({ ipId: targetIpId, ethAmount: usageFeeAmount });
  };

  if (!isConnected) {
    return (
      <section id="idgt-tokens" className="py-20 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">IDGT Token System</h2>
            <p className="text-gray-600 mb-8">
              Connect your wallet to access the Indigenous Digital Governance Token features
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="idgt-tokens" className="py-20 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">IDGT Token System</h2>
          <p className="text-gray-600 mb-8">
            Indigenous Digital Governance Token - Empowering creators through blockchain
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Token Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Your IDGT Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tokenLoading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {tokenInfo?.balanceFormatted || "0.00 IDGT"}
                    </div>
                    <p className="text-gray-600">Available Balance</p>
                  </div>
                  <Separator />
                  <div className="text-center">
                    <div className="text-xl font-semibold text-blue-600">
                      {tokenInfo?.royaltiesFormatted || "0.00 IDGT"}
                    </div>
                    <p className="text-gray-600">Total Royalties Earned</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Platform Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Platform Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Supply:</span>
                    <Badge variant="secondary">{idgtStats?.totalSupply || "N/A"}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Holders:</span>
                    <Badge variant="outline">{idgtStats?.totalHolders || "0"}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Royalties Paid:</span>
                    <Badge variant="default">{idgtStats?.totalRoyaltiesPaid || "0 IDGT"}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">IPs Registered:</span>
                    <Badge variant="secondary">{idgtStats?.totalIPsRegistered || "0"}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Royalty Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Pay Royalty
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="royalty-ip-id">IP Asset ID</Label>
                <Input
                  id="royalty-ip-id"
                  value={targetIpId}
                  onChange={(e) => setTargetIpId(e.target.value)}
                  placeholder="Enter IP Asset ID"
                />
              </div>
              <div>
                <Label htmlFor="royalty-amount">Amount (IDGT)</Label>
                <Input
                  id="royalty-amount"
                  type="number"
                  value={royaltyAmount}
                  onChange={(e) => setRoyaltyAmount(e.target.value)}
                  placeholder="Enter IDGT amount"
                />
              </div>
              <Button 
                onClick={handleRoyaltyPayment}
                disabled={royaltyMutation.isPending}
                className="w-full"
              >
                {royaltyMutation.isPending ? "Processing..." : "Pay Royalty"}
              </Button>
            </CardContent>
          </Card>

          {/* Usage Fee Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pay Usage Fee
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="usage-ip-id">IP Asset ID</Label>
                <Input
                  id="usage-ip-id"
                  value={targetIpId}
                  onChange={(e) => setTargetIpId(e.target.value)}
                  placeholder="Enter IP Asset ID"
                />
              </div>
              <div>
                <Label htmlFor="usage-amount">Amount (ETH)</Label>
                <Input
                  id="usage-amount"
                  type="number"
                  step="0.001"
                  value={usageFeeAmount}
                  onChange={(e) => setUsageFeeAmount(e.target.value)}
                  placeholder="Enter ETH amount"
                />
              </div>
              <Button 
                onClick={handleUsageFeePayment}
                disabled={usageFeeMutation.isPending}
                className="w-full"
              >
                {usageFeeMutation.isPending ? "Processing..." : "Pay Usage Fee"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* DeFi Agent Chat */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              IDGT DeFi Agent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="agent-prompt">Ask the IDGT Agent</Label>
              <Textarea
                id="agent-prompt"
                value={agentPrompt}
                onChange={(e) => setAgentPrompt(e.target.value)}
                placeholder="Ask about token operations, royalty payments, or IP management..."
                rows={3}
              />
            </div>
            <Button 
              onClick={handleAgentQuery}
              disabled={agentMutation.isPending}
              className="w-full"
            >
              {agentMutation.isPending ? "Processing..." : "Ask Agent"}
            </Button>
            
            {agentMutation.data && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">Agent Response:</h4>
                <p className="text-gray-700">{agentMutation.data.response}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}