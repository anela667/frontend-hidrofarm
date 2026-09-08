import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/splash.css";

function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 1000); 

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-container">
      <div className="ball"></div>
    </div>
  );
}

export default Splash;