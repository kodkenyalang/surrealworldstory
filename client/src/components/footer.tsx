import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="text-story-400 w-6 h-6" />
              <h4 className="text-lg font-bold">VerifydIP</h4>
            </div>
            <p className="text-slate-400 text-sm">
              Protecting indigenous heritage through blockchain technology and the Story Protocol.
            </p>
          </div>
          
          <div>
            <h5 className="font-semibold mb-4">Platform</h5>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#upload" className="hover:text-white transition-colors">Upload IP</a></li>
              <li><a href="#dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="#royalties" className="hover:text-white transition-colors">Royalties</a></li>
              <li><a href="#verify" className="hover:text-white transition-colors">Verify Assets</a></li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold mb-4">Resources</h5>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Story Protocol</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold mb-4">Support</h5>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm text-slate-400">
          <p>&copy; 2024 VerifydIP. Built with Story Protocol. Empowering indigenous creators worldwide.</p>
        </div>
      </div>
    </footer>
  );
}
