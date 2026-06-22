import { useState } from "react";
import { useCountUp, formatRub } from "../useCountUp";

function AnimatedValue({ value, format = formatRub, className = "result-value" }) {
  const animated = useCountUp(value);
  return <span className={className}>{format(animated)}</span>;
}

function Schedule({ schedule }) {
  const [expanded, setExpanded] = useState(false);
  const rows = expanded ? schedule : schedule.slice(0, 6);

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <div className="card-title">График платежей</div>
      <div className="schedule-wrap">
        <table>
          <thead>
            <tr>
              <th>Мес.</th>
              <th>Платёж</th>
              <th>Осн. долг</th>
              <th>Проценты</th>
              <th>Остаток</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.month}>
                <td>{r.month}</td>
                <td>{formatRub(r.payment)}</td>
                <td>{formatRub(r.principal)}</td>
                <td>{formatRub(r.interest)}</td>
                <td>{formatRub(r.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {schedule.length > 6 && (
        <button
          onClick={() => setExpanded((x) => !x)}
          style={{ marginTop: 12, background: "none", border: "none", color: "var(--accent)",
                   font: "inherit", fontSize: 13, cursor: "pointer", padding: 0 }}
        >
          {expanded ? "Свернуть" : `Показать все ${schedule.length} месяцев`}
        </button>
      )}
    </div>
  );
}

export default function LoanResult({ result }) {
  const { monthly_payment, total_payment, total_interest, schedule } = result;

  return (
    <>
      <div className="card">
        <div className="card-title">Итого</div>
        <div className="result-row">
          <span className="result-label">Ежемесячный платёж</span>
          <AnimatedValue value={monthly_payment} className="result-value accent" />
        </div>
        <div className="result-row">
          <span className="result-label">Сумма выплат</span>
          <AnimatedValue value={total_payment} />
        </div>
        <div className="result-row">
          <span className="result-label">Переплата</span>
          <AnimatedValue value={total_interest} />
        </div>
      </div>

      <Schedule schedule={schedule} />
    </>
  );
}
