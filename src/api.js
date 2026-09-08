// Sesuaikan kalau port/URL backend kamu berbeda (lihat PORT di be-hidrofarm/.env)
export const API_URL = "https://api.start-hidrofarm.site";

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

// The backend sends dates (DATE columns like started_at) as a full ISO
// UTC datetime string (e.g. "2026-08-18T17:00:00.000Z"), because of
// JavaScript's automatic timezone conversion during JSON serialization --
// the actual value in the database is just "2026-08-19" with no time.
// formatDate() converts it back to the correct local date (using local
// Date methods, NOT getUTCDate/etc, so the date doesn't shift back a day).
export function formatDate(rawDate) {
  if (!rawDate) return "-";
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return String(rawDate);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Kept as an alias so any file that still imports the old Indonesian name
// keeps working.
export const formatTanggal = formatDate;

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
        "The server is not responding (timeout). Check whether the backend is still running."
      );
    }
    throw new Error(
      "Could not connect to the server. Check whether the backend is running at " + API_URL
    );
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || "Something went wrong, please try again.";
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
  create: (id_pemilik, id_plant, method, area) =>
    request("/plan", {
      method: "POST",
      body: JSON.stringify({ id_pemilik, id_plant, method, area }),
    }),
  getByUserId: (id_pemilik) => request(`/plan/${id_pemilik}`),
  deletePlan: (id) => request(`/plan/${id}`, { method: "DELETE" }),
};

export const plantingApi = {
  deleteActivity: (plantingId) =>
    request(`/planting/${plantingId}`, { method: "DELETE" }),
  updateActivity: (plantingId, { actifity, timeofday }) =>
    request(`/planting/${plantingId}`, {
      method: "PUT",
      body: JSON.stringify({ actifity, timeofday }),
    }),
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
