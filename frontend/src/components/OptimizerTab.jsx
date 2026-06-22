import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { apiOptimizer } from "../api";
import { formatRub } from "../useCountUp";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid var(--border)", borderRadius: 8,
      padding: "8px 12px", fontSize: 13,
    }}>
      <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>Месяц {label}</div>
      <div style={{ color: "var(--savings)", fontWeight: 600 }}>
        {formatRub(payload[0].value)}
      </div>
    </div>
  );
}

export default function OptimizerTab({ loanInput }) {
  const [prepayment, setPrepayment] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!loanInput) {
    return (
      <div className="empty">
        <span style={{ fontSize: 32 }}>📈</span>
        <p>Сначала рассчитайте кредит на вкладке «Кредит»</p>
      </div>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const points = await apiOptimizer({
        ...loanInput,
        prepayment: parseFloat(prepayment),
      });
      setData(points);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const maxSavings = data ? Math.max(...data.map((d) => d.savings)) : 0;
  const maxPoint = data ? data.find((d) => d.savings === maxSavings) : null;

  return (
    <>
      <form onSubmit={submit}>
        <div className="card">
          <div className="card-title">Когда выгоднее всего платить досрочно?</div>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.6 }}>
            График показывает, сколько вы сэкономите на процентах в зависимости от того,
            в каком месяце внесёте дополнительную сумму.
          </p>

          <div className="field">
            <label>Сумма досрочного платежа, ₽</label>
            <input
              type="number" inputMode="numeric" min="1" required
              value={prepayment} onChange={(e) => setPrepayment(e.target.value)}
              placeholder="например, 300 000"
            />
          </div>
        </div>

        <button className="btn" type="submit" disabled={loading || !prepayment}>
          {loading ? "Строю график…" : "Показать график"}
        </button>
      </form>

      {data && (
        <>
          {maxPoint && (
            <div className="card" style={{ marginTop: 20 }}>
              <div className="card-title">Вывод</div>
              <p style={{ fontSize: 15, lineHeight: 1.6 }}>
                Чем раньше — тем лучше. Если внести{" "}
                <strong>{formatRub(parseFloat(prepayment))}</strong> в первый месяц,
                вы сэкономите <strong style={{ color: "var(--savings)" }}>{formatRub(maxSavings)}</strong> на процентах.
              </p>
            </div>
          )}

          <div className="card chart-wrap" style={{ marginTop: 12 }}>
            <div className="card-title">Экономия vs месяц внесения</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  tickLine={false} axisLine={{ stroke: "var(--border)" }}
                  label={{ value: "месяц", position: "insideBottomRight", offset: -4, fontSize: 11, fill: "var(--text-muted)" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  tickLine={false} axisLine={false}
                  tickFormatter={(v) => (v / 1000).toFixed(0) + "к"}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone" dataKey="savings" stroke="var(--savings)"
                  strokeWidth={1.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </>
  );
}
