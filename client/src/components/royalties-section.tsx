import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAccount } from "wagmi";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TrendingUp, Plus, Download, History, Settings, HandCoins } from "lucide-react";

export default function RoyaltiesSection() {
  const { isConnected } = useAccount();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: royaltiesData } = useQuery({
    queryKey: ['/api/royalties/user/1'], // For demo purposes, using user ID 1
    enabled: isConnected,
  });

  const claimRoyaltiesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/story/claim-revenue', {
        ancestorIpId: '0x641E638e8FCA4d4844F509630B34c9D524d40BE5',
        claimer: '0x641E638e8FCA4d4844F509630B34c9D524d40BE5',
        childIpIds: [],
        royaltyPolicies: [],
        currencyTokens: ['0x1514000000000000000000000000000000000000']
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Royalties Claimed!",
        description: `Successfully claimed ${data.claimedAmount} $WIP`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/royalties'] });
    },
    onError: () => {
      toast({
        title: "Claim Failed",
        description: "Failed to claim royalties. Please try again.",
        variant: "destructive",
      });
    }
  });

  if (!isConnected) {
    return (
      <section id="royalties" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-slate-800 mb-4">Royalty Management</h3>
            <p className="text-lg text-slate-600">Connect your wallet to track and claim earnings from your protected IP assets</p>
          </div>
        </div>
      </section>
    );
  }

  const availableToClaim = royaltiesData?.availableToClaim || 12.7;
  const totalEarned = royaltiesData?.totalEarned || 45.2;
  const payments = royaltiesData?.payments || [];

  return (
    <section id="royalties" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-slate-800 mb-4">Royalty Management</h3>
          <p className="text-lg text-slate-600">Track and claim earnings from your protected IP assets</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Earnings Overview */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-r from-story-500 to-story-600 text-white mb-8">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-2xl font-bold mb-2">Total Earnings</h4>
                    <p className="text-story-100">From all your IP assets</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-story-200" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-story-100 text-sm mb-1">Available to Claim</p>
                    <p className="text-3xl font-bold">{availableToClaim.toFixed(1)} $WIP</p>
                  </div>
                  <div>
                    <p className="text-story-100 text-sm mb-1">Total Earned</p>
                    <p className="text-3xl font-bold">{totalEarned.toFixed(1)} $WIP</p>
                  </div>
                </div>
                <Button 
                  onClick={() => claimRoyaltiesMutation.mutate()}
                  disabled={claimRoyaltiesMutation.isPending || availableToClaim === 0}
                  className="mt-6 bg-white text-story-600 hover:bg-story-50"
                >
                  <HandCoins className="w-5 h-5 mr-2" />
                  {claimRoyaltiesMutation.isPending ? 'Claiming...' : 'Claim All Available'}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="bg-slate-50 overflow-hidden">
              <CardHeader className="px-6 py-4 border-b border-slate-200 bg-white">
                <CardTitle className="text-lg">Recent Royalty Payments</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {payments.length === 0 ? (
                  <div className="p-6 text-center bg-white">
                    <p className="text-slate-600">No royalty payments yet. Your earnings will appear here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {payments.slice(0, 5).map((payment: any) => (
                      <div key={payment.id} className="p-6 bg-white hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                              <Plus className="text-emerald-600 w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">Royalty Payment</p>
                              <p className="text-sm text-slate-600">From IP licensing</p>
                              <p className="text-xs text-slate-500">
                                {new Date(payment.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-emerald-600">+{payment.amount} $WIP</p>
                            <Badge 
                              variant={payment.status === 'claimed' ? 'default' : 'secondary'}
                              className={payment.status === 'claimed' ? 'text-slate-600' : 'text-slate-500'}
                            >
                              {payment.status === 'claimed' ? 'Claimed' : 'Available'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Royalty Settings */}
          <div className="space-y-8">
            <Card className="bg-slate-50">
              <CardHeader>
                <CardTitle className="text-lg">Royalty Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Default Royalty Rate
                  </label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      defaultValue={[5]}
                      max={20}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-slate-800">5%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Auto-Claim Threshold
                  </label>
                  <Select defaultValue="10">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 $WIP</SelectItem>
                      <SelectItem value="25">25 $WIP</SelectItem>
                      <SelectItem value="50">50 $WIP</SelectItem>
                      <SelectItem value="manual">Manual Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="notifications" />
                  <label htmlFor="notifications" className="text-sm text-slate-700">
                    Email notifications for new royalties
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-50">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Earnings Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <History className="w-4 h-4 mr-2" />
                  View Transaction History
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Advanced Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
