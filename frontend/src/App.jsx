import { useState, useEffect } from "react";
import LoanForm from "./components/LoanForm";
import LoanResult from "./components/LoanResult";
import PrepaymentTab from "./components/PrepaymentTab";
import OptimizerTab from "./components/OptimizerTab";

const TABS = [
  { id: "loan",      label: "Кредит" },
  { id: "prepay",    label: "Досрочка" },
  { id: "optimizer", label: "Оптимизатор" },
];

export default function App() {
  const [tab, setTab] = useState("loan");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  return (
    <div className="container">
      <h1 style={{ fontSize: 26, marginBottom: 6 }}>Кредитный<br />калькулятор</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
        Считайте выгоду от досрочного погашения
      </p>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "loan" && (
        <>
          <LoanForm onResult={setResult} />
          {result && <LoanResult result={result} />}
        </>
      )}

      {tab === "prepay" && (
        <PrepaymentTab loanInput={result?.input} />
      )}

      {tab === "optimizer" && (
        <OptimizerTab loanInput={result?.input} />
      )}
    </div>
  );
}
