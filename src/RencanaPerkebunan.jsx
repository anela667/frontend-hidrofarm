import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, plantApi, planApi } from "./api";
import { METHOD_OPTIONS, getMaterialsInfo } from "./hydroponicPlanning";

export default function RencanaPerkebunan() {
  const navigate = useNavigate();
  const user = getUser();

  const [step, setStep] = useState("form");

  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [idPlant, setIdPlant] = useState(null);
  const [method, setMethod] = useState("");
  const [area, setArea] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    plantApi
      .getAll()
      .then((res) => setPlants(res.data || []))
      .catch((err) => setError(err.message || "Gagal memuat daftar tanaman."))
      .finally(() => setLoading(false));
  }, []);

  const selectPlant = (id) => {
    setIdPlant(id);
  };

  const goToInfo = () => {
    setError("");

    if (!idPlant || !method || !area) {
      setError("Silakan pilih tanaman, metode hidroponik, dan luas lahan terlebih dahulu.");
      return;
    }

    if (Number(area) <= 0) {
      setError("Luas lahan harus lebih besar dari 0.");
      return;
    }

    setStep("info");
  };

  const startPlanting = async () => {
    setError("");
    setSaving(true);
    try {
      const res = await planApi.create(user.id, idPlant, method, Number(area));
      // Pass the newly-created plan through navigation state, so the Farm
      // page can show it right away without waiting for a re-fetch.
      navigate("/Farm", { state: { newPlan: res.data } });
      return;
    } catch (err) {
      setError(err.message || "Gagal menyimpan rencana penanaman.");
    } finally {
      setSaving(false);
    }
  };

  const selectedPlant = plants.find((p) => p.id === idPlant);
  const materials = selectedPlant
    ? getMaterialsInfo(method, area, selectedPlant.name)
    : null;

  const handleBack = () => {
    if (step === "info") {
      setStep("form");
    } else {
      navigate("/Farm");
    }
  };

  return (
    <div className="min-h-screen bg-[#eef3f1] flex items-start justify-center p-10">

      {/* BACK BUTTON */}
      <button
        onClick={handleBack}
        className="fixed top-8 left-8 w-12 h-12 rounded-2xl bg-[#6d9b91] hover:bg-[#5f8f87] text-white flex items-center justify-center text-xl shadow transition"
      >
        ←
      </button>

      {/* CARD */}
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-[440px] p-8 mt-6">

        <h1 className="text-2xl font-semibold text-[#2f2f2f] mb-6">
          Rencana Penanaman
        </h1>

        {error && (
          <p className="bg-red-100 text-red-600 rounded-xl px-4 py-2 text-sm mb-4">
            {error}
          </p>
        )}

        {step === "form" ? (
          <>
            {/* PLANT TYPE */}
            <div className="mb-6">
              <p className="text-[#333] font-medium mb-1">
                Jenis Tanaman<span className="text-orange-400">*</span>
              </p>
              <p className="text-[#999] text-xs mb-3">
                Pilih satu jenis tanaman yang ingin kamu tanam.
              </p>

              {loading ? (
                <p className="text-[#999] text-sm">Memuat daftar tanaman...</p>
              ) : plants.length === 0 ? (
                <p className="text-[#999] text-sm">
                  Belum ada data tanaman di database.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {plants.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 text-[#444] cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="plant-type"
                        checked={idPlant === p.id}
                        onChange={() => selectPlant(p.id)}
                        className="w-4 h-4 accent-[#5f8f87]"
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* HYDROPONIC METHOD */}
            <div className="mb-6">
              <p className="text-[#333] font-medium mb-2">
                Metode Hidroponik<span className="text-orange-400">*</span>
              </p>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full border border-[#cfe3dc] bg-[#f4faf8] p-3 rounded-xl outline-none text-[#444]"
              >
                <option value="">Pilih metode penanaman</option>
                {METHOD_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* LAND AREA */}
            <div className="mb-8">
              <p className="text-[#333] font-medium mb-2">
                Luas Lahan yang Digunakan (m²)<span className="text-orange-400">*</span>
              </p>
              <input
                type="number"
                min="0.1"
                step="0.1"
                placeholder="contoh: 2.5"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full border border-[#cfe3dc] bg-[#f4faf8] p-3 rounded-xl outline-none text-[#444]"
              />
              <p className="text-[#999] text-xs mt-2">
                Jumlah tanaman dan bahan yang dibutuhkan akan diperkirakan berdasarkan luas ini.
              </p>
            </div>

            {/* SUBMIT */}
            <div className="flex justify-center">
              <button
                onClick={goToInfo}
                className="bg-[#5f8f87] hover:bg-[#537d76] text-white px-10 py-3 rounded-2xl font-medium shadow transition"
              >
                Lanjutkan
              </button>
            </div>
          </>
        ) : (
          <>
            {/* MATERIALS INFO */}
            <div className="mb-6">
              <p className="text-[#333] font-medium mb-1">
                {materials?.title || "Apa yang perlu kamu siapkan?"}
              </p>
              <p className="text-[#999] text-xs mb-4">
                {materials?.summary}
              </p>

              <ul className="flex flex-col gap-2 mb-4">
                {materials?.items.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-[#444] text-sm bg-[#f4faf8] border border-[#cfe3dc] rounded-xl px-3 py-2"
                  >
                    <span className="text-[#5f8f87] mt-0.5">🌱</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-[#eef3f1] rounded-xl px-3 py-3">
                <p className="text-[#333] text-sm font-medium">
                  Tata letak yang disarankan: {materials?.layout}
                </p>
                <p className="text-[#777] text-xs mt-1">
                  {materials?.layoutNote}
                </p>
              </div>
            </div>

            {/* SUBMIT */}
            <div className="flex justify-center">
              <button
                onClick={startPlanting}
                disabled={saving}
                className="bg-[#5f8f87] hover:bg-[#537d76] text-white px-10 py-3 rounded-2xl font-medium shadow transition disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Mulai Menanam"}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
