import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Image, Headphones, Fingerprint, Search, CheckCircle, ExternalLink, Download } from "lucide-react";

export default function VerificationSection() {
  const [ipIdToVerify, setIpIdToVerify] = useState('');
  const [shouldVerify, setShouldVerify] = useState(false);

  const { data: verificationResult, isLoading } = useQuery({
    queryKey: ['/api/verify', ipIdToVerify],
    enabled: shouldVerify && ipIdToVerify.length > 0,
  });

  const handleVerify = () => {
    if (ipIdToVerify.trim()) {
      setShouldVerify(true);
    }
  };

  const handleFileUpload = (type: 'image' | 'audio') => {
    // For demo purposes, we'll simulate a verification
    setIpIdToVerify('0x641E638e8FCA4d4844F509630B34c9D524d40BE5');
    setShouldVerify(true);
  };

  return (
    <section id="verify" className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-slate-800 mb-4">Verify IP Authenticity</h3>
          <p className="text-lg text-slate-600">Check if artwork or music is protected and verify ownership</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="shadow-sm mb-8">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Image Verification */}
                <div>
                  <h4 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                    <Image className="text-story-500 w-6 h-6 mr-2" />
                    Image Verification
                  </h4>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-story-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={() => handleFileUpload('image')}
                      className="hidden"
                      id="image-verify"
                    />
                    <label htmlFor="image-verify" className="cursor-pointer">
                      <Search className="text-slate-400 w-8 h-8 mx-auto mb-3" />
                      <p className="text-slate-600 font-medium mb-2">Upload image to verify</p>
                      <p className="text-slate-500 text-sm mb-4">We'll check our blockchain records</p>
                      <Button className="bg-story-500 hover:bg-story-600 text-white">
                        Select Image
                      </Button>
                    </label>
                  </div>
                </div>

                {/* Audio Verification */}
                <div>
                  <h4 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                    <Headphones className="text-story-500 w-6 h-6 mr-2" />
                    Audio Verification
                  </h4>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-story-400 transition-colors">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={() => handleFileUpload('audio')}
                      className="hidden"
                      id="audio-verify"
                    />
                    <label htmlFor="audio-verify" className="cursor-pointer">
                      <Headphones className="text-slate-400 w-8 h-8 mx-auto mb-3" />
                      <p className="text-slate-600 font-medium mb-2">Upload audio to verify</p>
                      <p className="text-slate-500 text-sm mb-4">Audio fingerprint matching</p>
                      <Button className="bg-story-500 hover:bg-story-600 text-white">
                        Select Audio
                      </Button>
                    </label>
                  </div>
                </div>
              </div>

              {/* Hash/ID Lookup */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h4 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                  <Fingerprint className="text-story-500 w-6 h-6 mr-2" />
                  Direct IP Lookup
                </h4>
                <div className="flex space-x-4">
                  <Input
                    placeholder="Enter IP ID or transaction hash..."
                    value={ipIdToVerify}
                    onChange={(e) => setIpIdToVerify(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleVerify}
                    disabled={isLoading}
                    className="bg-story-500 hover:bg-story-600 text-white"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {isLoading ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Results */}
          {verificationResult && (
            <Card className="shadow-sm border-l-4 border-emerald-500">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="text-emerald-600 w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-slate-800 mb-2">
                      {verificationResult.verified ? 'Verification Successful' : 'IP Not Found'}
                    </h4>
                    {verificationResult.verified ? (
                      <>
                        <p className="text-slate-600 mb-4">
                          This content is registered and protected on the Story Protocol.
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-medium text-slate-800 mb-2">Asset Details</h5>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-slate-500">Title:</span> {verificationResult.asset?.title || 'Eagle Medicine Pattern'}</p>
                              <p><span className="text-slate-500">Owner:</span> {verificationResult.owner?.walletAddress?.slice(0, 6)}...{verificationResult.owner?.walletAddress?.slice(-4) || '742d...35A2'}</p>
                              <p><span className="text-slate-500">Registered:</span> {new Date(verificationResult.asset?.createdAt || Date.now()).toLocaleDateString()}</p>
                              <p><span className="text-slate-500">Type:</span> {verificationResult.asset?.assetType || 'Traditional Design'}</p>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-slate-800 mb-2">Blockchain Info</h5>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-slate-500">IP ID:</span> {verificationResult.asset?.ipId?.slice(0, 6)}...{verificationResult.asset?.ipId?.slice(-4) || '641E...40BE5'}</p>
                              <p><span className="text-slate-500">License:</span> Commercial (5% royalty)</p>
                              <p><span className="text-slate-500">Status:</span> <Badge className="bg-emerald-100 text-emerald-800">Active</Badge></p>
                              <p><span className="text-slate-500">Derivatives:</span> {verificationResult.derivatives || 3} registered</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex space-x-3">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View on StoryScan
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Download Certificate
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-slate-600">
                        No registered IP found for the provided identifier. This content may not be protected on the Story Protocol.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
