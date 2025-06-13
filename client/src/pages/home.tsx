import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import UploadSection from "@/components/upload-section";
import DashboardSection from "@/components/dashboard-section";
import RoyaltiesSection from "@/components/royalties-section";
import IDGTTokenSection from "@/components/idgt-token-section";
import DeFiEcosystemSection from "@/components/defi-ecosystem-section";
import VerificationSection from "@/components/verification-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <HeroSection />
      <UploadSection />
      <DashboardSection />
      <RoyaltiesSection />
      <IDGTTokenSection />
      <DeFiEcosystemSection />
      <VerificationSection />
      <Footer />
    </div>
  );
}
