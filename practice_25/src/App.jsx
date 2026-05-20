import React, { Suspense, lazy } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";

const About = lazy(() => import("./pages/About.jsx"));

export default function App() {
  return (
    <div style={{ fontFamily: "sans-serif", padding: 20 }}>
      <nav style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <Link to="/">Главная</Link>
        <Link to="/about">О нас</Link>
      </nav>

      <Suspense
        fallback={<div style={{ color: "red" }}>Загрузка страницы...</div>}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Suspense>
    </div>
  );
}
