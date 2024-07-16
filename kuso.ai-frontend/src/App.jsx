import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import MockAI from "./Pages/MockAI/mockAI";
import LandingPage from "./Pages/Landing/landing";
import QuestionBank from "./Pages/QuestionBank/QuestionBank";
import Navbar from "./components/Navbar/Navbar";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/mock-ai" element={<MockAI />} />
        <Route path="/question-bank" element={<QuestionBank />} />
      </Routes>
    </Router>
  );
}

export default App;
