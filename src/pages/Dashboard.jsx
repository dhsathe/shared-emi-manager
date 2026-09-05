import { useEffect, useMemo, useState } from "react";
import { categories, members, moods } from "../data/group.js";
import { dateFormat, iconFor, money } from "../utils/formatters.js";

function App() {
  const [emis, setEmis] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [dark, setDark] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    amount: "",
    date: "2026-09-25",
    category: categories[0],
  });

  async function loadEmis() {
    const response = await fetch("/api/emis");
    if (!response.ok) throw new Error("Could not load EMIs.");
    setEmis(await response.json());
  }

  useEffect(() => {
    loadEmis().catch((loadError) => setError(loadError.message));
  }, []);

  const filteredEmis = useMemo(
    () =>
      emis.filter((emi) => {
        const query = search.trim().toLowerCase();
        return (
          (!query ||
            emi.name.toLowerCase().includes(query) ||
            emi.category.toLowerCase().includes(query)) &&
          (filter === "all" || emi.status === filter)
        );
      }),
    [emis, search, filter],
  );
  const totalDue = emis.reduce((sum, emi) => sum + emi.amount, 0);
  const totalPaid = emis
    .filter((emi) => emi.status === "paid")
    .reduce((sum, emi) => sum + emi.amount, 0);
  const paidPercent = totalDue ? Math.round((totalPaid / totalDue) * 100) : 0;
  const nextPayment = emis
    .filter((emi) => emi.status !== "paid")
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  async function changeEmi(url, options) {
    setError("");
    const response = await fetch(url, options);
    if (!response.ok)
      throw new Error((await response.json()).error || "Request failed.");
    await loadEmis();
  }

  async function submit(event) {
    event.preventDefault();
    try {
      await changeEmi("/api/emis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      setDialogOpen(false);
      setForm({
        name: "",
        amount: "",
        date: "2026-09-25",
        category: categories[0],
      });
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  async function toggle(id) {
    try {
      await changeEmi(`/api/emis/${id}/toggle`, { method: "PATCH" });
    } catch (actionError) {
      setError(actionError.message);
    }
  }
  async function remove(id) {
    try {
      await changeEmi(`/api/emis/${id}`, { method: "DELETE" });
    } catch (actionError) {
      setError(actionError.message);
    }
  }

  return (
    <div className={dark ? "app-shell dark" : "app-shell"}>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">✓</span>
          <span>EMI Group</span>
        </div>
        <div className="sidebar-section-label">Workspace</div>
        <nav className="main-nav">
          <a className="nav-item active" href="#overview">
            <span className="nav-icon">▦</span> Group overview
          </a>
          <a className="nav-item" href="#payments">
            <span className="nav-icon">↗</span> EMIs
          </a>
          <a className="nav-item" href="#settings">
            <span className="nav-icon">⚙</span> Group settings
          </a>
        </nav>
        <div className="sidebar-bottom">
          <div className="tip-card">
            <span className="tip-icon">✦</span>
            <div>
              <strong>Same team, clear dues</strong>
              <p>Keep the group accountable, one payment at a time.</p>
            </div>
          </div>
          <div className="user-chip">
            <span className="avatar">D</span>
            <span>EMI Group</span>
            <span className="more">•••</span>
          </div>
        </div>
      </aside>
      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumb">
            <span>EMI Group</span>
            <span>/</span>
            <strong>Group overview</strong>
          </div>
          <button
            className="icon-button"
            onClick={() => setDark(!dark)}
            aria-label="Toggle theme"
          >
            ◐
          </button>
        </header>
        <section className="group-hero">
          <div className="hero-copy">
            <p className="eyebrow">Friends helping friends</p>
            <h1>
              EMI Group<span className="heading-dot">.</span>
            </h1>
            <p>Where “bro, I’ll pay tomorrow” meets an actual calendar.</p>
            <div className="member-line">
              <div className="member-stack">
                <span>DS</span>
                <span>AK</span>
                <span>AW</span>
                <span>+9</span>
              </div>
              <strong>12 friends keeping it clear</strong>
            </div>
          </div>
          <div className="photo-collage">
            <img
              className="photo-main"
              src="/images/20200124_131046.jpg"
              alt="Friends together at a celebration"
            />
            <img
              className="photo-small"
              src="/images/IMG-20211206-WA0027.jpg"
              alt="Friends together outdoors"
            />
          </div>
        </section>
        <section className="members-section">
          <div className="section-header">
            <div>
              <h2>The group</h2>
              <p>Our EMI Group members and their familiar names.</p>
            </div>
            <span className="member-count">12 members</span>
          </div>
          <div className="member-grid">
            {members.map(([name, nickname, color], index) => (
              <article className="member-card" key={name}>
                <span className={`member-avatar ${color}`}>
                  {name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <div>
                  <strong>
                    {name}
                    {index === 0 && <em> (you)</em>}
                  </strong>
                  <span>{nickname}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="page-heading">
          <div>
            <p className="eyebrow">
              Saturday, September 5, 2026 · Group check-in
            </p>
            <h2>
              Good morning, EMI Group<span className="heading-dot">.</span>
            </h2>
            <p className="subheading">
              {moods[new Date().getDate() % moods.length]}
            </p>
          </div>
          <button
            className="primary-button"
            onClick={() => setDialogOpen(true)}
          >
            <span>+</span> Add EMI
          </button>
        </section>
        <section className="summary-grid">
          <article className="summary-card accent-card">
            <div className="card-label">
              Due this month <span className="label-icon">◷</span>
            </div>
            <div className="summary-value">{money.format(totalDue)}</div>
            <div className="summary-meta">
              <span className="status-dot orange" />
              {emis.length} active payment{emis.length === 1 ? "" : "s"}
            </div>
          </article>
          <article className="summary-card">
            <div className="card-label">
              Paid this month <span className="label-icon">✓</span>
            </div>
            <div className="summary-value">{money.format(totalPaid)}</div>
            <div className="progress-track">
              <span style={{ width: `${paidPercent}%` }} />
            </div>
            <div className="summary-meta">
              {paidPercent}% of your monthly EMIs
            </div>
          </article>
          <article className="summary-card">
            <div className="card-label">
              Remaining <span className="label-icon">↘</span>
            </div>
            <div className="summary-value">
              {money.format(totalDue - totalPaid)}
            </div>
            <div className="summary-meta">
              <span className="status-dot blue" />
              {emis.filter((emi) => emi.status !== "paid").length} payments left
            </div>
          </article>
          <article className="summary-card freedom-card">
            <div className="card-label">
              Payment health <span className="label-icon">✦</span>
            </div>
            <div className="health-row">
              <div
                className="health-ring"
                style={{
                  background: `conic-gradient(var(--green) ${paidPercent * 3.6}deg, #e4ece4 0deg)`,
                }}
              >
                <span>{paidPercent}%</span>
              </div>
              <div>
                <strong>
                  {paidPercent === 100
                    ? "Month complete"
                    : paidPercent
                      ? "Good progress"
                      : "Ready to begin"}
                </strong>
                <p>Mark payments as you go.</p>
              </div>
            </div>
          </article>
        </section>
        <section className="content-section" id="payments">
          <div className="section-header">
            <div>
              <h2>Group EMIs</h2>
              <p>Track every recurring payment in one place.</p>
            </div>
            <div className="controls">
              <label className="search-box">
                <span>⌕</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  type="search"
                  placeholder="Search EMIs"
                />
              </label>
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                <option value="all">All payments</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
          <div className="emi-table-wrap">
            <table className="emi-table">
              <thead>
                <tr>
                  <th>Payment</th>
                  <th>Category</th>
                  <th>Due date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredEmis.map((emi) => (
                  <tr key={emi.id}>
                    <td>
                      <div className="payment-name">
                        <span className="payment-icon">
                          {iconFor(emi.category)}
                        </span>
                        {emi.name}
                      </div>
                    </td>
                    <td>
                      <span className="category">{emi.category}</span>
                    </td>
                    <td>
                      {dateFormat.format(new Date(`${emi.date}T12:00:00`))}
                    </td>
                    <td>
                      <span className="amount">{money.format(emi.amount)}</span>
                    </td>
                    <td>
                      <button
                        className={`status-pill ${emi.status === "paid" ? "paid" : ""}`}
                        onClick={() => toggle(emi.id)}
                      >
                        {emi.status === "paid" ? "Paid" : "Pending"}
                      </button>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="row-action"
                          onClick={() => toggle(emi.id)}
                          aria-label="Toggle payment"
                        >
                          ✓
                        </button>
                        <button
                          className="row-action delete"
                          onClick={() => remove(emi.id)}
                          aria-label="Delete EMI"
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredEmis.length && (
              <div className="empty-state">
                <span>⌁</span>
                <h3>No EMIs found</h3>
                <p>Add the first payment to get started.</p>
              </div>
            )}
          </div>
        </section>
        <section className="bottom-grid">
          <article className="insight-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Group rhythm</p>
                <h2>One step at a time</h2>
              </div>
              <span className="sparkle">✦</span>
            </div>
            <div className="bar-chart">
              {[35, 50, 42, 63, 56, 76, 88, 69, 82, 58, 44, 61].map(
                (height, index) => (
                  <span
                    key={index}
                    className={index === 6 ? "current" : ""}
                    style={{ height: `${height}%` }}
                  />
                ),
              )}
            </div>
            <div className="chart-labels">
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
            </div>
          </article>
          <article className="next-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Up next</p>
                <h2>{nextPayment?.name || "No pending payments"}</h2>
              </div>
              <span className="next-arrow">→</span>
            </div>
            <div className="next-payment">
              <div className="next-icon">
                {nextPayment ? iconFor(nextPayment.category) : "✓"}
              </div>
              <div>
                <strong>
                  {nextPayment
                    ? `Due ${dateFormat.format(new Date(`${nextPayment.date}T12:00:00`))}`
                    : "You’re all caught up"}
                </strong>
                <p>
                  {nextPayment ? "Your next payment" : "Great work this month."}
                </p>
              </div>
              <strong className="next-amount">
                {money.format(nextPayment?.amount || 0)}
              </strong>
            </div>
          </article>
        </section>
        <footer>
          EMI Group <span>•</span> Friends first, dues clear.{" "}
          <strong>Created by Dhananjay Sathe</strong>
        </footer>
      </main>
      {dialogOpen && (
        <dialog open>
          <form id="emiForm" onSubmit={submit}>
            <div className="dialog-header">
              <div>
                <p className="eyebrow">New payment</p>
                <h2>Add an EMI</h2>
              </div>
              <button
                className="close-button"
                type="button"
                onClick={() => setDialogOpen(false)}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>
            <label>
              Payment name
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="e.g. Home Loan"
              />
            </label>
            <div className="form-row">
              <label>
                Amount
                <input
                  required
                  min="1"
                  type="number"
                  value={form.amount}
                  onChange={(event) =>
                    setForm({ ...form, amount: event.target.value })
                  }
                />
              </label>
              <label>
                Due date
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm({ ...form, date: event.target.value })
                  }
                />
              </label>
            </div>
            <label>
              Category
              <select
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <div className="dialog-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </button>
              <button className="primary-button">Save EMI</button>
            </div>
          </form>
        </dialog>
      )}
    </div>
  );
}

export default App;
