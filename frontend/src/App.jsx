import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Layout from "./pages/Layout";
import Home from "./components/Home";
import Projects from "./components/Projects";
import Templates from "./components/Templates";
import CreateDesign from "./components/CreateDesign";
import Main from "./pages/Main";
import { token_decode } from "./utils/index";
import { PageLoader } from "./components/Loader";

function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on app load
    const token = localStorage.getItem("canva_token");
    const decoded = token_decode(token);
    setUserInfo(decoded);
    setIsLoading(false);
  }, []);

  // Listen for storage changes (when user logs in/out from another tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "canva_token") {
        const token = e.newValue;
        const decoded = token_decode(token);
        setUserInfo(decoded);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Function to update auth state (can be called from child components)
  const updateAuthState = () => {
    const token = localStorage.getItem("canva_token");
    const decoded = token_decode(token);
    setUserInfo(decoded);
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            userInfo ? (
              <Layout onAuthChange={updateAuthState} />
            ) : (
              <Index onAuthChange={updateAuthState} />
            )
          }
        >
          <Route index element={<Home />} />
          <Route path="templates" element={<Templates />} />
          <Route path="projects" element={<Projects />} />
        </Route>
        <Route
          path="/design/create"
          element={userInfo ? <CreateDesign /> : <Navigate to="/" replace />}
        />
        <Route
          path="/design/:design_id/edit"
          element={userInfo ? <Main /> : <Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
