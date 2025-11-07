import Homepage from "./pages/HomePage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import "tailwindcss";
import Mission from "./pages/Mission";
import HowItWorksPage from "./pages/HowItWorks";
import BlockchainTrackerPage from "./pages/BlockChainTracker";
import DonatePage from "./pages/DonationPage";

const App = () => {
  return (
    <>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Homepage />}></Route>
            <Route path="/mission" element={<Mission />}></Route>
            <Route path="/how-it-works" element={<HowItWorksPage />}></Route>
            <Route
              path="/blockchain-tracker"
              element={<BlockchainTrackerPage />}
            ></Route>
            <Route path="/donation" element={<DonatePage />}></Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
};

export default App;
