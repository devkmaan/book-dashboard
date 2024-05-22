// src/App.js
import React, { useState } from "react";
import Dashboard from "./components/dashboard";
import Login from "./components/Login";
import "./styles.css";
import Footer from "./components/Footer.js";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <div>
      <div>
        {isAuthenticated ? <Dashboard /> : <Login onLogin={handleLogin} />}
      </div>
      <Footer />
    </div>
  );
}

export default App;
