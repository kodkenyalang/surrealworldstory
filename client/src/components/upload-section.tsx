import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAccount } from "wagmi";
import { Palette, Music, CloudUpload, Lock, Shield, Crown, Users } from "lucide-react";

interface UploadFormData {
  title: string;
  description: string;
  assetType: 'design' | 'song';
  culturalOrigin: string;
  creationDate: string;
  language?: string;
  region?: string;
  file?: File;
}

export default function UploadSection() {
  const [designData, setDesignData] = useState<UploadFormData>({
    title: '',
    description: '',
    assetType: 'design',
    culturalOrigin: '',
    creationDate: '',
    region: ''
  });
  
  const [songData, setSongData] = useState<UploadFormData>({
    title: '',
    description: '',
    assetType: 'song',
    culturalOrigin: '',
    creationDate: '',
    language: '',
    region: ''
  });

  const [designFile, setDesignFile] = useState<File | null>(null);
  const [songFile, setSongFile] = useState<File | null>(null);
  const [selectedLicense, setSelectedLicense] = useState<'basic' | 'commercial' | 'derivative'>('commercial');

  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (data: { formData: FormData; assetType: string }) => {
      const response = await apiRequest('POST', '/api/ip-assets', data.formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your IP asset has been uploaded and is being processed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ip-assets'] });
      // Reset forms
      setDesignData({ title: '', description: '', assetType: 'design', culturalOrigin: '', creationDate: '', region: '' });
      setSongData({ title: '', description: '', assetType: 'song', culturalOrigin: '', creationDate: '', language: '', region: '' });
      setDesignFile(null);
      setSongFile(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload IP asset. Please try again.",
        variant: "destructive",
      });
      console.error('Upload error:', error);
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (ipAssetId: number) => {
      const response = await apiRequest('POST', '/api/story/register-ip', {
        ipAssetId,
        parentIpIds: [],
        licenseTermsIds: [selectedLicense === 'commercial' ? '96' : '1']
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "IP Registered!",
        description: "Your intellectual property has been successfully registered on the Story Protocol.",
      });
    },
    onError: () => {
      toast({
        title: "Registration Failed",
        description: "Failed to register IP on Story Protocol. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleFileUpload = (file: File, type: 'design' | 'song') => {
    if (type === 'design') {
      setDesignFile(file);
      setDesignData(prev => ({ ...prev, file }));
    } else {
      setSongFile(file);
      setSongData(prev => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (type: 'design' | 'song') => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to upload IP assets.",
        variant: "destructive",
      });
      return;
    }

    const data = type === 'design' ? designData : songData;
    const file = type === 'design' ? designFile : songFile;

    if (!file) {
      toast({
        title: "File Required",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    // Create user if needed
    try {
      await apiRequest('POST', '/api/users', {
        walletAddress: address,
        username: `User_${address?.slice(0, 6)}`
      });
    } catch (error) {
      // User might already exist, continue
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('assetType', data.assetType);
    formData.append('culturalOrigin', data.culturalOrigin);
    formData.append('creationDate', data.creationDate);
    if (data.language) formData.append('language', data.language);
    if (data.region) formData.append('region', data.region);
    formData.append('userId', '1'); // For demo purposes

    uploadMutation.mutate({ formData, assetType: type });
  };

  return (
    <section id="upload" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-slate-800 mb-4">Upload & Protect Your IP</h3>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload your traditional designs or songs to create an immutable record on the blockchain with automatic watermarking.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Design Upload */}
          <Card className="bg-slate-50">
            <CardHeader className="text-center">
              <Palette className="text-story-500 w-12 h-12 mx-auto mb-4" />
              <CardTitle className="text-2xl">Traditional Designs</CardTitle>
              <p className="text-slate-600">Upload visual artwork, patterns, and traditional designs</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-story-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'design')}
                  className="hidden"
                  id="design-upload"
                />
                <label htmlFor="design-upload" className="cursor-pointer">
                  <CloudUpload className="text-slate-400 w-12 h-12 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium mb-2">
                    {designFile ? designFile.name : 'Drag & drop your design files here'}
                  </p>
                  <p className="text-slate-500 text-sm mb-4">or click to browse (PNG, JPG, SVG up to 10MB)</p>
                  <Button variant="outline" className="bg-story-500 hover:bg-story-600 text-white">
                    Choose Files
                  </Button>
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    placeholder="Traditional Pattern Name"
                    value={designData.title}
                    onChange={(e) => setDesignData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe the cultural significance and origin..."
                    value={designData.description}
                    onChange={(e) => setDesignData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cultural Origin</Label>
                    <Input
                      placeholder="Tribe/Community"
                      value={designData.culturalOrigin}
                      onChange={(e) => setDesignData(prev => ({ ...prev, culturalOrigin: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Creation Date</Label>
                    <Input
                      type="date"
                      value={designData.creationDate}
                      onChange={(e) => setDesignData(prev => ({ ...prev, creationDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Song Upload */}
          <Card className="bg-slate-50">
            <CardHeader className="text-center">
              <Music className="text-story-500 w-12 h-12 mx-auto mb-4" />
              <CardTitle className="text-2xl">Traditional Songs</CardTitle>
              <p className="text-slate-600">Upload audio recordings of traditional songs and chants</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-story-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'song')}
                  className="hidden"
                  id="song-upload"
                />
                <label htmlFor="song-upload" className="cursor-pointer">
                  <Music className="text-slate-400 w-12 h-12 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium mb-2">
                    {songFile ? songFile.name : 'Drag & drop your audio files here'}
                  </p>
                  <p className="text-slate-500 text-sm mb-4">or click to browse (MP3, WAV up to 50MB)</p>
                  <Button variant="outline" className="bg-story-500 hover:bg-story-600 text-white">
                    Choose Files
                  </Button>
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Song Title</Label>
                  <Input
                    placeholder="Traditional Song Name"
                    value={songData.title}
                    onChange={(e) => setSongData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Cultural Context</Label>
                  <Textarea
                    placeholder="Ceremonial use, historical significance..."
                    value={songData.description}
                    onChange={(e) => setSongData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Language</Label>
                    <Input
                      placeholder="Native Language"
                      value={songData.language}
                      onChange={(e) => setSongData(prev => ({ ...prev, language: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Region</Label>
                    <Input
                      placeholder="Geographic Region"
                      value={songData.region}
                      onChange={(e) => setSongData(prev => ({ ...prev, region: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registration Options */}
        <Card className="mt-12 border border-slate-200">
          <CardHeader>
            <CardTitle className="text-xl">IP Registration Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div 
                className={`text-center p-6 border rounded-xl cursor-pointer transition-colors ${
                  selectedLicense === 'basic' 
                    ? 'border-story-500 bg-story-50' 
                    : 'border-slate-200 hover:border-story-300'
                }`}
                onClick={() => setSelectedLicense('basic')}
              >
                <Shield className="text-story-500 w-8 h-8 mx-auto mb-4" />
                <h5 className="font-semibold text-slate-800 mb-2">Basic Protection</h5>
                <p className="text-sm text-slate-600 mb-4">Timestamp and watermark your creation</p>
                <span className="text-story-500 font-semibold">Free</span>
              </div>
              <div 
                className={`text-center p-6 border rounded-xl cursor-pointer transition-colors ${
                  selectedLicense === 'commercial' 
                    ? 'border-story-500 bg-story-50' 
                    : 'border-slate-200 hover:border-story-300'
                }`}
                onClick={() => setSelectedLicense('commercial')}
              >
                <Crown className="text-story-500 w-8 h-8 mx-auto mb-4" />
                <h5 className="font-semibold text-slate-800 mb-2">Commercial License</h5>
                <p className="text-sm text-slate-600 mb-4">Full IP registration with royalty tracking</p>
                <span className="text-story-500 font-semibold">1 $WIP</span>
              </div>
              <div 
                className={`text-center p-6 border rounded-xl cursor-pointer transition-colors ${
                  selectedLicense === 'derivative' 
                    ? 'border-story-500 bg-story-50' 
                    : 'border-slate-200 hover:border-story-300'
                }`}
                onClick={() => setSelectedLicense('derivative')}
              >
                <Users className="text-story-500 w-8 h-8 mx-auto mb-4" />
                <h5 className="font-semibold text-slate-800 mb-2">Derivative Rights</h5>
                <p className="text-sm text-slate-600 mb-4">Allow controlled derivative works</p>
                <span className="text-story-500 font-semibold">Custom</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center space-x-4">
          <Button 
            onClick={() => handleSubmit('design')}
            disabled={uploadMutation.isPending || !designFile}
            className="bg-story-500 hover:bg-story-600 text-white px-8 py-3"
          >
            <Lock className="w-5 h-5 mr-2" />
            {uploadMutation.isPending ? 'Uploading Design...' : 'Register Design IP'}
          </Button>
          <Button 
            onClick={() => handleSubmit('song')}
            disabled={uploadMutation.isPending || !songFile}
            className="bg-story-500 hover:bg-story-600 text-white px-8 py-3"
          >
            <Lock className="w-5 h-5 mr-2" />
            {uploadMutation.isPending ? 'Uploading Song...' : 'Register Song IP'}
          </Button>
        </div>
      </div>
    </section>
  );
}
