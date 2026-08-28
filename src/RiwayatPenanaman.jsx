import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import "./styles/riwayat.css";
import { getUser, logApi, planApi, formatTanggal } from "./api";

export default function RiwayatPenanaman() {
  const user = getUser();

  const [riwayat, setRiwayat] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [planId, setPlanId] = useState("");
  const [succes, setSucces] = useState("");
  const [fail, setFail] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const [logsRes, plansRes] = await Promise.all([
        logApi.getByUserId(user.id),
        planApi.getByUserId(user.id),
      ]);
      setRiwayat(logsRes.data || []);
      setPlans(plansRes.data || []);
    } catch (err) {
      setError(err.message || "Gagal memuat riwayat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const tambahRiwayat = async () => {
    setModalError("");

    if (!planId || succes === "" || fail === "") {
      setModalError("Lengkapi rencana, jumlah berhasil, dan gagal dulu ya.");
      return;
    }

    const selectedPlan = plans.find((p) => p.id === Number(planId));
    const total = Number(succes) + Number(fail);

    if (selectedPlan && total > selectedPlan.count) {
      setModalError(
        `Total berhasil + gagal (${total}) tidak boleh melebihi jumlah tanaman di rencana ini (${selectedPlan.count}).`
      );
      return;
    }

    setSaving(true);
    try {
      await logApi.create(user.id, Number(planId), Number(succes), Number(fail));
      setShowModal(false);
      setPlanId("");
      setSucces("");
      setFail("");
      await loadData();
    } catch (err) {
      setModalError(err.message || "Gagal menyimpan riwayat.");
    } finally {
      setSaving(false);
    }
  };

  const hapusRiwayat = async (id) => {
    try {
      await logApi.remove(user.id, id);
      await loadData();
    } catch (err) {
      setError(err.message || "Gagal menghapus riwayat.");
    }
  };

  return (
    <div className="min-h-screen bg-[#eef3f1]">

      {/* NAVBAR */}
      <Navbar active="Notes" />

      <div className="px-12 py-8 pt-0">

      {/* TITLE */}
      <h1 className="text-[40px] font-bold text-[#222] mt-14 mb-10">
        Selamat Datang{user ? `, ${user.name}` : ""}
      </h1>

      {error && (
        <p className="bg-red-100 text-red-600 rounded-xl px-4 py-3 mb-6">
          {error}
        </p>
      )}

      {/* CARD */}
      <div className="bg-[#f6f6f6] rounded-3xl p-6 shadow-sm">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-semibold text-[#333]">
            Riwayat
          </h2>

          {/* BUTTON TAMBAH */}
          <button
            onClick={() => {
              setModalError("");
              setShowModal(true);
            }}
            className="
              w-10
              h-10
              rounded-xl
              bg-[#8fc4b3]
              text-white
              text-3xl
              flex
              items-center
              justify-center
              hover:bg-[#7ab29f]
              transition
            "
          >
            +
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-xl">

          <table className="w-full text-center">

            <thead className="bg-[#ececec] h-14 text-[#333]">
              <tr>
                <th>NO</th>
                <th>MULAI</th>
                <th>TUMBUHAN</th>
                <th>BERHASIL</th>
                <th>GAGAL</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody className="bg-white">

              {loading ? (
                <tr className="h-[260px]">
                  <td colSpan="6" className="text-[#999]">Memuat...</td>
                </tr>
              ) : riwayat.length === 0 ? (
                <tr className="h-[260px]">
                  <td
                    colSpan="6"
                    className="text-[#999]"
                  >
                    Belum ada data
                  </td>
                </tr>
              ) : (
                riwayat.map((item, index) => (
                  <tr
                    key={item.id}
                    className="h-16 border-b"
                  >
                    <td>{index + 1}</td>
                    <td>{formatTanggal(item.started_at)}</td>
                    <td>{item.name}</td>
                    <td>{item.succes}</td>
                    <td>{item.fail}</td>
                    <td>
                      <button
                        onClick={() => hapusRiwayat(item.id)}
                        className="text-red-500"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}

            </tbody>
          </table>

        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">

          <div className="bg-white p-8 rounded-3xl w-[400px]">

            <h2 className="text-2xl font-bold mb-6">
              Tambah Data
            </h2>

            {modalError && (
              <p className="bg-red-100 text-red-600 rounded-xl px-4 py-2 text-sm mb-4">
                {modalError}
              </p>
            )}

            <div className="flex flex-col gap-4">

              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="border p-3 rounded-xl outline-none"
              >
                <option value="">Pilih Rencana Tanam</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.plant?.name} - mulai {formatTanggal(p.started_at)}
                  </option>
                ))}
              </select>

              {planId && (
                <p className="text-[#888] text-xs -mt-2">
                  Total berhasil dan gagal maksimal{" "}
                  {plans.find((p) => p.id === Number(planId))?.count}.
                </p>
              )}

              <input
                type="number"
                min="0"
                placeholder="Berhasil"
                value={succes}
                onChange={(e) => setSucces(e.target.value)}
                className="border p-3 rounded-xl outline-none"
              />

              <input
                type="number"
                min="0"
                placeholder="Gagal"
                value={fail}
                onChange={(e) => setFail(e.target.value)}
                className="border p-3 rounded-xl outline-none"
              />

            </div>

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 rounded-xl bg-gray-200"
              >
                Batal
              </button>

              <button
                onClick={tambahRiwayat}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-[#8fc4b3] text-white disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>

            </div>

          </div>
        </div>
      )}

      </div>
    </div>
  );
}
