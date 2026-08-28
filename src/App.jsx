import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Splash from "./Splash";
import Register from "./Register";
import Login from "./Login";
import Home from "./Home";
import Farm from "./Farm";
import RencanaPerkebunan from "./RencanaPerkebunan";
import RiwayatPenanaman from "./RiwayatPenanaman";
import { isAuthenticated } from "./api";

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Farm"
          element={
            <ProtectedRoute>
              <Farm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rencana-perkebunan"
          element={
            <ProtectedRoute>
              <RencanaPerkebunan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/riwayat-penanaman"
          element={
            <ProtectedRoute>
              <RiwayatPenanaman />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
