import Homepage from "./pages/HomePage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import "tailwindcss";
import Mission from "./pages/Mission";
import HowItWorksPage from "./pages/HowItWorks";
import BlockchainTrackerPage from "./pages/BlockChainTracker";
import DonatePage from "./pages/DonationPage";
import UserLoginPage from "./pages/UserLogin";
import AdminLoginPage from "./pages/AdminLogin";
import FAQPage from "./pages/FAQPage";
import PrivacyPolicyPage from "./pages/Privacy";
import TermsOfServicePage from "./pages/TermsOfService";
import ContactUsPage from "./pages/ContactUs";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsersPage from "./pages/UserManagement";
import AdminReportsPage from "./pages/AdminReportPage";
import AdminMilestoneVerificationPage from "./pages/MilestoneVerification";
import AdminLedgerAuditPage from "./pages/AdminLedgerAuditPage";
import AdminNetworkConfigPage from "./pages/ConfigureSmartContract";
import RegisterForCharities from "./pages/meric/RegisterForCharities";
import { WalletProvider } from "./contexts/WalletContext";
import CampaignCreation from "./pages/meric/CampaignCreation";
import CharityDashboard from "./pages/CharityDashboard";

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
              <Route path="/login" element={<UserLoginPage />}></Route>
              <Route path="/admin/login" element={<AdminLoginPage />}></Route>
              <Route path="/admin/dashboard" element={<AdminDashboard />}></Route>
              <Route path="/admin/users" element={<AdminUsersPage />}></Route>
              <Route path="/admin/reports" element={<AdminReportsPage />}></Route>
              <Route path="/admin/milestone-verify" element={<AdminMilestoneVerificationPage />}></Route>
              <Route path="/admin/ledger-audit" element={<AdminLedgerAuditPage />}></Route>
              <Route path="/admin/network-config" element={<AdminNetworkConfigPage />}></Route>
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
