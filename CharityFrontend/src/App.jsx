import Homepage from "./pages/HomePage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import "tailwindcss";
import Mission from "./pages/Mission";
import HowItWorksPage from "./pages/HowItWorks";
import BlockchainTrackerPage from "./pages/BlockChainTracker";
import DonatePage from "./pages/DonationPage";
import FAQPage from "./pages/FAQPage";
import PrivacyPolicyPage from "./pages/Privacy";
import TermsOfServicePage from "./pages/TermsOfService";
import ContactUsPage from "./pages/ContactUs";
import AdminDashboard from "./pages/AdminDashboard";
import RegisterForCharities from "./pages/meric/RegisterForCharities";
import { WalletProvider } from "./contexts/WalletContext";
import CampaignCreation from "./pages/meric/CampaignCreation";
import CharityDashboard from "./pages/CharityDashboard";
import AdminHistory from "./pages/meric/AdminHistory";
import DonationHistory from "./pages/meric/DonationHistory";

const App = () => {
  return (
    <>
      <ThemeProvider>
        <WalletProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Homepage />}></Route>
              <Route path="/mission" element={<Mission />}></Route>
              <Route path="/how-it-works" element={<HowItWorksPage />}></Route>
              <Route path="/blockchain-tracker" element={<BlockchainTrackerPage />}></Route>
              <Route path="/admin/dashboard" element={<AdminDashboard />}></Route>
              <Route path="/admin/history" element={<AdminHistory />}></Route>
              <Route path="/donation-history" element={<DonationHistory />}></Route>
              <Route path="/donation" element={<DonatePage />}></Route>
              <Route path="/faq" element={<FAQPage />}></Route>
              <Route path="/privacy" element={<PrivacyPolicyPage />}></Route>
              <Route path="/terms" element={<TermsOfServicePage />}></Route>
              <Route path="/contact" element={<ContactUsPage />}></Route>
              <Route path="/register-charity" element={<RegisterForCharities />}></Route>
              <Route path="/create-campaign" element={<CampaignCreation />}></Route>
              <Route path="/charity/dashboard" element={<CharityDashboard />}></Route>
            </Routes>
          </BrowserRouter>
        </WalletProvider>
      </ThemeProvider>
    </>
  );
};

export default App;
