import { Container, Row, Col } from "react-bootstrap";
import "./styles/home.css";
import hydroponic from "./assets/hydroponic.png";
import Navbar from "./Navbar";
import { getUser } from "./api";

function Home() {
  const user = getUser();
  return (
    <div className="min-h-screen bg-[#eef3f1] overflow-hidden relative">

      {/* NAVBAR */}
      <Navbar active="Home" />

      {/* CONTENT */}
      <div className="flex items-center justify-between px-10 pt-4 relative z-20">

        {/* LEFT */}
        <div className="max-w-[520px]">

          {user && (
            <p className="text-[#5f8f87] text-lg font-medium mb-2">
              Halo, {user.name}
            </p>
          )}

          <h1 className="text-[58px] leading-[70px] font-bold text-[#202020] mb-8">
            Ayo Tanam dan Panen
            <br />
            Hidroponikmu sendiri
          </h1>

          <p className="text-[#4a4a4a] text-lg leading-8 mb-8">
            Hidroponik adalah teknik pertanian modern yang
            memungkinkan tanaman tumbuh lebih cepat,
            lebih bersih, dan lebih sehat tanpa membutuhkan
            lahan luas.
          </p>

          <p className="text-[#4a4a4a] text-lg leading-8">
            Pelajari lebih lanjut tentang sistem hidroponik
            dan mulai menanam hari ini!
          </p>
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative flex-1 flex justify-end">

          <img
            src={hydroponic}
            alt="hydroponic"
            className="w-[700px] max-w-none object-contain"
          />
      </div>
      </div>

      {/* BACKGROUND WAVE */}
<div className="absolute inset-0 z-0 overflow-hidden">

  {/* WAVE BELAKANG */}
  <svg
    viewBox="0 0 1440 900"
    preserveAspectRatio="none"
    className="absolute bottom-0 right-0 w-full h-full"
  >
    <path
      fill="#88a97d"
      fillOpacity="0.7"
      d="
        M0,700
        C300,500 500,850 800,650
        C1050,500 1200,250 1440,0
        L1440,900
        L0,900
        Z
      "
    />
  </svg>

  {/* WAVE DEPAN */}
  <svg
    viewBox="0 0 1440 900"
    preserveAspectRatio="none"
    className="absolute bottom-0 right-0 w-full h-full"
  >
    <path
      fill="#a7cf9c"
      d="
        M0,820q
        C280,560 520,820 820,620
        C1080,450 1250,180 1440,0
        L1440,900
        L0,900
        Z
      "
    />
  </svg>

</div>
</div>
  );
}

export default Home;