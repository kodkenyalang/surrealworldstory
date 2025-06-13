import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { FileText, Coins, GitBranch, Clock, ChevronRight, Music, Palette } from "lucide-react";

export default function DashboardSection() {
  const { address, isConnected } = useAccount();

  const { data: ipAssets, isLoading } = useQuery({
    queryKey: ['/api/ip-assets/user/1'], // For demo purposes, using user ID 1
    enabled: isConnected,
  });

  const { data: royalties } = useQuery({
    queryKey: ['/api/royalties/user/1'], // For demo purposes, using user ID 1
    enabled: isConnected,
  });

  if (!isConnected) {
    return (
      <section id="dashboard" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-slate-800 mb-4">Your IP Portfolio</h3>
            <p className="text-lg text-slate-600 mb-8">Connect your wallet to view your registered intellectual property</p>
          </div>
        </div>
      </section>
    );
  }

  const totalIPs = ipAssets?.length || 0;
  const totalRoyalties = royalties?.totalEarned || 0;
  const derivatives = 8; // Mock data
  const pendingClaims = royalties?.payments?.filter((p: any) => p.status === 'pending').length || 0;

  return (
    <section id="dashboard" className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-slate-800 mb-4">Your IP Portfolio</h3>
          <p className="text-lg text-slate-600">Manage and track your registered intellectual property</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Total IPs</p>
                  <p className="text-2xl font-bold text-slate-800">{totalIPs}</p>
                </div>
                <FileText className="text-story-500 w-8 h-8" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Earned Royalties</p>
                  <p className="text-2xl font-bold text-slate-800">{totalRoyalties.toFixed(1)} $WIP</p>
                </div>
                <Coins className="text-emerald-500 w-8 h-8" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Derivative Works</p>
                  <p className="text-2xl font-bold text-slate-800">{derivatives}</p>
                </div>
                <GitBranch className="text-amber-500 w-8 h-8" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Pending Claims</p>
                  <p className="text-2xl font-bold text-slate-800">{pendingClaims}</p>
                </div>
                <Clock className="text-amber-500 w-8 h-8" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* IP Assets Grid */}
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-slate-200">
            <CardTitle className="text-lg">Registered IP Assets</CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 text-center">
                <p className="text-slate-600">Loading your IP assets...</p>
              </div>
            ) : !ipAssets || ipAssets.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-slate-600">No IP assets registered yet. Upload your first creation!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {ipAssets.map((asset: any) => (
                  <div key={asset.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-story-400 to-story-600 flex items-center justify-center">
                          {asset.assetType === 'design' ? (
                            <Palette className="text-white w-6 h-6" />
                          ) : (
                            <Music className="text-white w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <h5 className="font-semibold text-slate-800">{asset.title}</h5>
                          <p className="text-slate-600 text-sm capitalize">{asset.assetType}</p>
                          <p className="text-slate-500 text-xs">
                            Registered: {new Date(asset.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-emerald-600">+{(Math.random() * 5).toFixed(1)} $WIP</p>
                          <p className="text-xs text-slate-500">This month</p>
                        </div>
                        <Badge 
                          variant={asset.status === 'registered' ? 'default' : 'secondary'}
                          className={asset.status === 'registered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}
                        >
                          {asset.status === 'registered' ? 'Active' : 'Pending'}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
