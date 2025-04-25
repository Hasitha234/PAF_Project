import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./services/axios-config"; // Import axios config

import NavBar from "./components/NavBar";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Wall from "./components/Wall";
import AuthService from "./services/auth.service";
import UserService from "./services/user.service";

// Home component that redirects based on authentication status
const Home = () => {
  const currentUser = AuthService.getCurrentUser();
  
  if (currentUser) {
    return <Navigate to="/wall" />;
  } else {
    return <Navigate to="/login" />;
  }
};

const App = () => {
  useEffect(() => {
    // Test API connectivity
    UserService.getPublicContent()
      .then(response => {
        console.log("API Test Success:", response.data);
      })
      .catch(error => {
        console.error("API Test Error:", error);
      });
  }, []);

  return (
    <Router>
      <div>
        <NavBar />
        <div className="container-fluid p-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wall" element={<Wall />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App; 