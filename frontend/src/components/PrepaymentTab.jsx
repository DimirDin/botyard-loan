import { useState } from "react";
import { apiPrepayment } from "../api";
import { formatRub } from "../useCountUp";

export default function PrepaymentTab({ loanInput }) {
  const [prepayment, setPrepayment] = useState("");
  const [monthsElapsed, setMonthsElapsed] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!loanInput) {
    return (
      <div className="empty">
        <span style={{ fontSize: 32 }}>📊</span>
        <p>Сначала рассчитайте кредит на вкладке «Кредит»</p>
      </div>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiPrepayment({
        ...loanInput,
        prepayment: parseFloat(prepayment),
        months_elapsed: parseInt(monthsElapsed) || 0,
      });
      setResult(res);
    } catch (err) {
      setError("Ошибка расчёта. Проверьте введённые данные.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={submit}>
        <div className="card">
          <div className="card-title">Досрочное погашение</div>

          <div className="field">
            <label>Сумма досрочного платежа, ₽</label>
            <input
              type="number" inputMode="numeric" min="1" required
              value={prepayment} onChange={(e) => setPrepayment(e.target.value)}
              placeholder="например, 200 000"
            />
          </div>

          <div className="field">
            <label>Кредит уже идёт (месяцев)</label>
            <input
              type="number" inputMode="numeric" min="0"
              value={monthsElapsed} onChange={(e) => setMonthsElapsed(e.target.value)}
              placeholder="0 — вносим в начале"
            />
          </div>
        </div>

        <button className="btn" type="submit" disabled={loading || !prepayment}>
          {loading ? "Считаю…" : "Рассчитать сценарии"}
        </button>
      </form>

      {error && <p style={{ color: "red", marginTop: 12, textAlign: "center", fontSize: 14 }}>{error}</p>}

      {result && (
        <>
          <h2 className="section-title" style={{ marginTop: 28 }}>Два пути</h2>

          <div className="scenario-grid">
            <div className="scenario-card">
              <h3>Уменьшить срок</h3>
              <div className="scenario-value">{formatRub(result.term_interest_saved)}</div>
              <div className="scenario-sub">экономия на процентах</div>
              <div style={{ marginTop: 8, fontSize: 13, color: "var(--accent)", fontWeight: 500 }}>
                −{result.term_savings_months} мес.
              </div>
            </div>

            <div className="scenario-card">
              <h3>Уменьшить платёж</h3>
              <div className="scenario-value">{formatRub(result.payment_interest_saved)}</div>
              <div className="scenario-sub">экономия на процентах</div>
              <div style={{ marginTop: 8, fontSize: 13, color: "var(--accent)", fontWeight: 500 }}>
                {formatRub(result.payment_new_monthly)}/мес.
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Подсказка</div>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
              {result.term_interest_saved > result.payment_interest_saved
                ? "Уменьшение срока даёт бо́льшую экономию — платёж остаётся прежним, но кредит закроется раньше."
                : "Оба варианта дают схожую экономию — выбирайте по комфорту ежемесячного платежа."}
            </p>
          </div>
        </>
      )}
    </>
  );
}
