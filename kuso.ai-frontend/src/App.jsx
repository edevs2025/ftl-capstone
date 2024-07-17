import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import MockAI from "./Pages/MockAI/mockAI";
import LandingPage from "./Pages/Landing/landing";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/mock-ai" element={<MockAI />} />
      </Routes>
    </Router>
  );
}

export default App;
