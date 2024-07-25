import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import MockAI from "./Pages/MockAI/mockAI";
import LandingPage from "./Pages/Landing/landing";
import QuestionBank from "./Pages/QuestionBank/QuestionBank";
import Signup from "./Pages/Signup/Signup";
import Signin from "./Pages/Signin/Signin"
import Profile from "./Pages/Profile/Profile";
import ConversationalAI from "./Pages/ConversationalAI/conversational";
import { AuthProvider } from './AuthContext';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/mock-ai" element={<MockAI />} />
          <Route path="/mockai/:id" element={<MockAI />} />
          <Route path="/question-bank" element={<QuestionBank />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/conversational-ai" element={<ConversationalAI />} />
        </Routes>
      </Router>
      </AuthProvider>
  );
}

export default App;
