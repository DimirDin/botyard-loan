import { useState, useEffect } from "react";
import { apiCalculate, apiSaveLoan, apiLoadLoan } from "../api";

const DEFAULT = { amount: 3000000, rate: 16, term_months: 120, payment_type: "annuity" };

export default function LoanForm({ onResult }) {
  const [form, setForm] = useState(DEFAULT);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiLoadLoan().then((saved) => {
      if (saved) setForm(saved);
    }).catch(() => {});
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        amount: parseFloat(form.amount),
        rate: parseFloat(form.rate),
        term_months: parseInt(form.term_months),
        payment_type: form.payment_type,
      };
      const result = await apiCalculate(payload);
      onResult({ ...result, input: payload });
      await apiSaveLoan(payload);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="card">
        <div className="card-title">Параметры кредита</div>

        <div className="field">
          <label>Сумма кредита, ₽</label>
          <input
            type="number" inputMode="numeric" min="1" required
            value={form.amount} onChange={set("amount")}
          />
        </div>

        <div className="field">
          <label>Процентная ставка, % годовых</label>
          <input
            type="number" inputMode="decimal" min="0.1" max="99" step="0.1" required
            value={form.rate} onChange={set("rate")}
          />
        </div>

        <div className="field">
          <label>Срок, месяцев</label>
          <input
            type="number" inputMode="numeric" min="1" max="600" required
            value={form.term_months} onChange={set("term_months")}
          />
        </div>

        <div className="field">
          <label>Тип платежа</label>
          <div className="toggle-group">
            <button
              type="button"
              className={form.payment_type === "annuity" ? "active" : ""}
              onClick={() => setForm((f) => ({ ...f, payment_type: "annuity" }))}
            >
              Аннуитетный
            </button>
            <button
              type="button"
              className={form.payment_type === "differential" ? "active" : ""}
              onClick={() => setForm((f) => ({ ...f, payment_type: "differential" }))}
            >
              Дифференцированный
            </button>
          </div>
        </div>
      </div>

      <button className="btn" type="submit" disabled={loading}>
        {loading ? "Считаю…" : "Рассчитать"}
      </button>
    </form>
  );
}
