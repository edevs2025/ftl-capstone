import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import MockAI from "./components/MockAI/mockAI";

function App() {
  const [count, setCount] = useState(0);

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
                <button onClick={() => setCount((count) => count + 1)}>
                  Count is {count}
                </button>
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
