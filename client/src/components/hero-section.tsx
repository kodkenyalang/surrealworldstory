import { Button } from "@/components/ui/button";
import { Upload, Info } from "lucide-react";

export default function HeroSection() {
  const scrollToUpload = () => {
    const element = document.getElementById('upload');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-gradient-to-br from-story-50 to-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Protect Your Indigenous Heritage{" "}
            <span className="text-story-500">with Blockchain</span>
          </h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Secure your traditional designs and songs with immutable IP protection on the Story Protocol. 
            Watermark, register, and earn royalties from your cultural creations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={scrollToUpload}
              size="lg"
              className="bg-story-500 hover:bg-story-600 text-white px-8 py-3"
            >
              <Upload className="w-5 h-5 mr-2" />
              Start Protecting Your Work
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-2 border-story-500 text-story-500 hover:bg-story-500 hover:text-white px-8 py-3"
            >
              <Info className="w-5 h-5 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
