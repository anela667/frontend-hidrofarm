import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Calendar from "./Calendar";
import Navbar from "./Navbar";
import { getUser, planApi, formatTanggal } from "./api";

export default function Farm() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  const incomingPlan = location.state?.newPlan;

  const [plans, setPlans] = useState(incomingPlan ? [incomingPlan] : []);
  const [loading, setLoading] = useState(!incomingPlan);
  const [error, setError] = useState("");

  const loadData = async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);
    setError("");
    try {
      const plansRes = await planApi.getByUserId(user.id);
      setPlans(plansRes.data || []);
    } catch (err) {
      if (!silent) setError(err.message || "Gagal memuat data rencana tanam.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(!!incomingPlan);
    if (incomingPlan) {
      window.history.replaceState({}, document.title);
    }
  }, []);

  const [deletingPlanId, setDeletingPlanId] = useState(null);

  const hapusRencana = async (planId) => {
    if (!confirm("Hapus rencana tanam ini? Semua jadwal & riwayatnya juga akan hilang.")) {
      return;
    }
    setDeletingPlanId(planId);
    setError("");
    try {
      await planApi.deletePlan(planId);
      setPlans((current) => current.filter((p) => p.id !== planId));
    } catch (err) {
      setError(err.message || "Gagal menghapus rencana tanam.");
    } finally {
      setDeletingPlanId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef3f1]">

      {/* NAVBAR */}
      <Navbar active="Farm" />

      <div className="p-8 pt-0">

      {/* TITLE */}
      <h1 className="text-[40px] font-bold text-[#222] mt-14 mb-10">
        Selamat Datang{user ? `, ${user.name}` : ""}
      </h1>

      {error && (
        <p className="bg-red-100 text-red-600 rounded-xl px-4 py-3 mb-6">
          {error}
        </p>
      )}

      {/* CONTENT */}
      <div className="flex gap-10">

        {/* KALENDER */}
        <div className="bg-white rounded-3xl shadow-lg p-5 w-[65%]">
          {loading ? (
            <p className="text-center text-[#888] p-10">Memuat kalender...</p>
          ) : (
            <Calendar plan={plans} onActivityDeleted={() => loadData(true)} />
          )}
        </div>

        {/* CARD */}
        <div className="bg-white rounded-3xl shadow-lg w-[35%] h-[420px] p-8">

          <div className="bg-[#eef3f1] rounded-3xl w-full h-full p-6 flex flex-col">

            {/* TITLE */}
            <h2 className="text-2xl text-center text-[#4a4a4a] mb-8">
              Rencana Aktif
            </h2>

            {/* BUTTON */}
            <button
              onClick={() => navigate("/rencana-perkebunan")}
              className="
                bg-[#5f8f87]
                hover:bg-[#537d76]
                text-white
                px-14
                py-4
                rounded-2xl
                text-xl
                shadow-lg
                transition
                mb-8
              "
            >
              Mulai
            </button>

            {/* DAFTAR RENCANA */}
            <div className="flex flex-col gap-4 overflow-auto">

              {loading ? (
                <p className="text-center text-[#888]">Memuat...</p>
              ) : plans.length === 0 ? (
                <p className="text-center text-[#888]">
                  Belum ada rencana tanam
                </p>
              ) : (
                plans.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-4 shadow flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-[#444] font-medium">
                        🌿 {item.plant?.name} ({item.count} tanaman)
                      </p>
                      <p className="text-[#888] text-sm">
                        Mulai: {formatTanggal(item.started_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => hapusRencana(item.id)}
                      disabled={deletingPlanId === item.id}
                      className="text-red-500 text-sm shrink-0 disabled:opacity-50"
                    >
                      {deletingPlanId === item.id ? "..." : "Hapus"}
                    </button>
                  </div>
                ))
              )}

            </div>

          </div>
        </div>
      </div>

      </div>
    </div>
  );
}
