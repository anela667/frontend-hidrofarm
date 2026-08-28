import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, plantApi, planApi } from "./api";

const METODE_OPTIONS = ["NFT", "Wick System"];
const ALAT_UMUM = ["Tray semai", "Sprayer", "Pupuk NPK", "Pupuk Daun", "POC"];

function buatChecklist(namaTanaman, jumlah) {
  return [`${jumlah} Biji Benih ${namaTanaman}`, ...ALAT_UMUM];
}
export default function RencanaPerkebunan() {
  const navigate = useNavigate();
  const user = getUser();

  const [step, setStep] = useState("form"); 

  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [idPlant, setIdPlant] = useState(null);
  const [metode, setMetode] = useState("");
  const [count, setCount] = useState("");

  const [checkedItems, setCheckedItems] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    plantApi
      .getAll()
      .then((res) => setPlants(res.data || []))
      .catch((err) => setError(err.message || "Gagal memuat daftar tanaman."))
      .finally(() => setLoading(false));
  }, []);

  const toggleTanaman = (id) => {
    setIdPlant((current) => (current === id ? null : id));
  };

  const lanjutKeChecklist = () => {
    setError("");

    if (!idPlant || !count) {
      setError("Pilih jenis tanaman dan isi jumlah tanaman dulu ya.");
      return;
    }

    setCheckedItems({});
    setStep("checklist");
  };

  const toggleItem = (index) => {
    setCheckedItems((current) => ({ ...current, [index]: !current[index] }));
  };

  const mulaiBerkebun = async () => {
    setError("");
    setSaving(true);
    try {
      const res = await planApi.create(user.id, idPlant, Number(count));
      // Kirim data plan yang baru dibuat lewat state navigasi, supaya
      // halaman Farm bisa langsung menampilkannya tanpa nunggu fetch ulang.
      navigate("/Farm", { state: { newPlan: res.data } });
      return;
    } catch (err) {
      setError(err.message || "Gagal menyimpan rencana tanam.");
    } finally {
      setSaving(false);
    }
  };

  const selectedPlant = plants.find((p) => p.id === idPlant);
  const checklist = selectedPlant ? buatChecklist(selectedPlant.name, count) : [];

  const handleBack = () => {
    if (step === "checklist") {
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
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-[420px] p-8 mt-6">

        <h1 className="text-2xl font-semibold text-[#2f2f2f] mb-6">
          Rencana Perkebunan
        </h1>

        {error && (
          <p className="bg-red-100 text-red-600 rounded-xl px-4 py-2 text-sm mb-4">
            {error}
          </p>
        )}

        {step === "form" ? (
          <>
            {/* JENIS TANAMAN */}
            <div className="mb-6">
              <p className="text-[#333] font-medium mb-1">
                Jenis Tanaman<span className="text-orange-400">*</span>
              </p>
              <p className="text-[#999] text-xs mb-3">
                Pilih salah satu jenis tanaman yang akan ditanam.
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
                        type="checkbox"
                        checked={idPlant === p.id}
                        onChange={() => toggleTanaman(p.id)}
                        className="w-4 h-4 accent-[#5f8f87]"
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* METODE HIDROPONIK */}
            <div className="mb-6">
              <p className="text-[#333] font-medium mb-2">
                Metode Hidroponik<span className="text-orange-400">*</span>
              </p>
              <select
                value={metode}
                onChange={(e) => setMetode(e.target.value)}
                className="w-full border border-[#cfe3dc] bg-[#f4faf8] p-3 rounded-xl outline-none text-[#444]"
              >
                <option value="">Pilih metode tanam</option>
                {METODE_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* JUMLAH TANAMAN */}
            <div className="mb-8">
              <p className="text-[#333] font-medium mb-2">
                Jumlah Tanaman<span className="text-orange-400">*</span>
              </p>
              <input
                type="number"
                min="1"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="w-full border border-[#cfe3dc] bg-[#f4faf8] p-3 rounded-xl outline-none text-[#444]"
              />
            </div>

            {/* SUBMIT */}
            <div className="flex justify-center">
              <button
                onClick={lanjutKeChecklist}
                className="bg-[#5f8f87] hover:bg-[#537d76] text-white px-10 py-3 rounded-2xl font-medium shadow transition"
              >
                Simpan Data
              </button>
            </div>
          </>
        ) : (
          <>
            {/* CHECKLIST PERSIAPAN */}
            <div className="mb-6">
              <p className="text-[#333] font-medium mb-1">
                Apa saja yang harus dipersiapkan?
              </p>
              <p className="text-[#999] text-xs mb-4">
                Siapkan terlebih dahulu peralatan dan barang berikut ini.
              </p>

              <div className="flex flex-col gap-3">
                {checklist.map((item, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-2 text-[#444] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedItems[index]}
                      onChange={() => toggleItem(index)}
                      className="w-4 h-4 accent-[#5f8f87]"
                    />
                    {item}
                  </label>
                ))}
              </div>

              <p className="text-[#999] text-xs mt-4">
                * Berikan checklist apabila sudah terpenuhi
              </p>
            </div>

            {/* SUBMIT */}
            <div className="flex justify-center">
              <button
                onClick={mulaiBerkebun}
                disabled={saving}
                className="bg-[#5f8f87] hover:bg-[#537d76] text-white px-10 py-3 rounded-2xl font-medium shadow transition disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Mulai Berkebun"}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
