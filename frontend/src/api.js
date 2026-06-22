const BASE = import.meta.env.VITE_API_URL || "";

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const apiCalculate = (data) => post("/api/calculate", data);
export const apiPrepayment = (data) => post("/api/prepayment", data);
export const apiOptimizer  = (data) => post("/api/optimizer", data);

export async function apiSaveLoan(data) {
  const tg = window.Telegram?.WebApp;
  const telegram_id = tg?.initDataUnsafe?.user?.id;
  if (!telegram_id) return;
  return post("/api/loan/save", { ...data, telegram_id });
}

export async function apiLoadLoan() {
  const tg = window.Telegram?.WebApp;
  const telegram_id = tg?.initDataUnsafe?.user?.id;
  if (!telegram_id) return null;
  const res = await fetch(`${BASE}/api/loan/${telegram_id}`);
  if (!res.ok) return null;
  return res.json();
}
