const API_URL = import.meta.env.VITE_API_URL;

export function saveSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated() {
  return !!getToken();
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function formatTanggal(rawDate) {
  if (!rawDate) return "-";
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return String(rawDate);

  const bulan = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];

  return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers["Authorization"] = token;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 detik

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(
        "Server tidak merespons (timeout). Cek apakah backend masih jalan."
      );
    }
    throw new Error(
      "Tidak bisa terhubung ke server. Cek apakah backend jalan di " + API_URL
    );
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || "Terjadi kesalahan, coba lagi.";
    throw new Error(message);
  }

  return data;
}

export const authApi = {
  login: (email, password) =>
    request("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (name, email, password) =>
    request("/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
};

export const plantApi = {
  getAll: () => request("/plant"),
};

export const planApi = {
  create: (id_pemilik, id_plant, count) =>
    request("/plan", {
      method: "POST",
      body: JSON.stringify({ id_pemilik, id_plant, count }),
    }),
  getByUserId: (id_pemilik) => request(`/plan/${id_pemilik}`),
  deletePlan: (id) => request(`/plan/${id}`, { method: "DELETE" }),
};

export const plantingApi = {
  deleteActivity: (plantingId) =>
    request(`/planting/${plantingId}`, { method: "DELETE" }),
};

export const logApi = {
  getByUserId: (id_pemilik) => request(`/log/${id_pemilik}`),
  create: (user_id, plan_id, succes, fail) =>
    request("/log/create", {
      method: "POST",
      body: JSON.stringify({ user_id, plan_id, succes, fail }),
    }),
  remove: (user_id, id) =>
    request(`/log/user/${user_id}/delete/${id}`, { method: "DELETE" }),
  calculate: (id_pemilik) => request(`/log/calculate/${id_pemilik}`),
};
