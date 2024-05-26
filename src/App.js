import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Salon from "./view/Salon/Salon";

function App() {
  return (
    <div className="container">
      <Router>
        <Routes>
          <Route path="/" element={<Salon />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
