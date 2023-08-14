import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import App from "./App.tsx";
import "./index.css";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import { Footer } from "./components/Footer.tsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<App />}></Route>
      <Route path="/login" element={<Login />} />
    </>
  )
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Navbar />
    <RouterProvider router={router} />
    <Footer />
  </React.StrictMode>
);