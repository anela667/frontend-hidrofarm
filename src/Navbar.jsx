import { Link, useNavigate } from "react-router-dom";
import logo from "./assets/Logo-h.png";
import { logout } from "./api";

const MENU = [
  { key: "Farm", label: "Farm", to: "/Farm" },
  { key: "Home", label: "Home", to: "/home" },
  { key: "Notes", label: "Logs", to: "/riwayat-penanaman" },
];
export default function Navbar({ active }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="relative z-20 flex justify-between items-center px-14 py-6">
      {/* LOGO */}
      <img src={logo} alt="logo" className="w-20 h-20 object-contain" />

      {/* MENU */}
      <div className="flex items-center gap-12 text-[#5f8f87]">
        {MENU.map((item) => (
          <Link
            key={item.key}
            to={item.to}
            className={
              "px-5 py-2 rounded-2xl transition-colors duration-200 " +
              (active === item.key
                ? "bg-[#8fc4b3] text-white shadow"
                : "hover:text-[#537d76]")
            }
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* PROFILE */}
      <button
        onClick={handleLogout}
        title="Keluar"
        className="w-12 h-12 rounded-full border-4 border-[#5f8f87] flex items-center justify-center text-[#5f8f87] text-2xl shrink-0"
      >
        👤
      </button>
    </div>
  );
}
