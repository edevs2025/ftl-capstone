import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import MockAI from "./Pages/MockAI/mockAI";

function App() {
  return (
    <Router>
      <div>
        <nav>
          <Link to="/mock-ai">
            <button>Go to Mock AI</button>
          </Link>
        </nav>
        <Routes>
          <Route path="/mock-ai" element={<MockAI />} />
          <Route
            path="/"
            element={
              <>
                <h1>Home Page</h1>
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
