import { useState, useEffect, useCallback } from "react";
import {
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Users,
  ClipboardList,
  BarChart3,
  ChevronLeft,
  X,
} from "lucide-react";
import { getKV, setKV } from "./lib/store.js";

const TEACHER_CODE = "teach2026";

const STYLE = `
  .app-root {
    --ink: #16233A;
    --ink-soft: #47566B;
    --paper: #F1F3EF;
    --paper-raised: #FFFFFF;
    --line: #D8DCD4;
    --teal: #2F6F62;
    --teal-soft: #E4EEEA;
    --brick: #B5502E;
    --brick-soft: #F4E4DE;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    color: var(--ink);
    background: var(--paper);
    min-height: 100%;
    width: 100%;
  }
  .app-serif { font-family: Georgia, "Iowan Old Style", "Times New Roman", serif; }
  .line-top { border-top: 1px solid var(--line); }
  .line-bottom { border-bottom: 1px solid var(--line); }
  .line-right { border-right: 1px solid var(--line); }
  .divider { height: 1px; background: var(--line); border: none; margin: 0; }

  .btn {
    font-size: 14px;
    padding: 9px 16px;
    border-radius: 3px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: background 120ms ease, border-color 120ms ease, opacity 120ms ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .btn-primary { background: var(--ink); color: var(--paper); }
  .btn-primary:hover { opacity: 0.85; }
  .btn-secondary { background: transparent; color: var(--ink); border-color: var(--line); }
  .btn-secondary:hover { border-color: var(--ink-soft); }
  .btn-teal { background: var(--teal); color: white; }
  .btn-teal:hover { opacity: 0.88; }
  .btn-ghost { background: transparent; color: var(--ink-soft); padding: 6px 8px; }
  .btn-ghost:hover { color: var(--brick); }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .field {
    width: 100%;
    font-size: 14px;
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: 3px;
    background: var(--paper-raised);
    color: var(--ink);
  }
  .field:focus { outline: none; border-color: var(--teal); }
  .field-label {
    font-size: 12.5px;
    color: var(--ink-soft);
    margin-bottom: 6px;
    display: block;
  }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px;
    font-size: 14px;
    color: var(--ink-soft);
    cursor: pointer;
    border-left: 2px solid transparent;
  }
  .nav-item:hover { color: var(--ink); }
  .nav-item.active {
    color: var(--ink);
    border-left: 2px solid var(--teal);
    background: var(--teal-soft);
  }

  .row-item {
    padding: 16px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .badge {
    font-size: 12px;
    padding: 3px 9px;
    border-radius: 3px;
    white-space: nowrap;
  }
  .badge-teal { background: var(--teal-soft); color: var(--teal); }
  .badge-brick { background: var(--brick-soft); color: var(--brick); }
  .badge-neutral { background: #EAEBE6; color: var(--ink-soft); }

  .progress-track {
    height: 5px;
    background: #E4E6E0;
    border-radius: 3px;
    overflow: hidden;
    width: 100%;
  }
  .progress-fill { height: 100%; background: var(--teal); }

  .option-row {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: 3px;
    margin-bottom: 8px;
    cursor: pointer;
    background: var(--paper-raised);
  }
  .option-row:hover { border-color: var(--ink-soft); }
  .option-row.selected { border-color: var(--teal); background: var(--teal-soft); }
  .option-row.correct { border-color: var(--teal); background: var(--teal-soft); }
  .option-row.incorrect { border-color: var(--brick); background: var(--brick-soft); }

  .table-simple { width: 100%; border-collapse: collapse; font-size: 14px; }
  .table-simple th {
    text-align: left; font-weight: 500; color: var(--ink-soft);
    font-size: 12.5px; padding: 8px 12px; border-bottom: 1px solid var(--line);
  }
  .table-simple td { padding: 10px 12px; border-bottom: 1px solid var(--line); }

  @media (max-width: 720px) {
    .sidebar-desktop { display: none; }
    .topbar-mobile { display: flex !important; }
  }
`;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// Разбирает HTML-тест в формате .q-block / .opt / label.correct
// (как в файлах пользователя) и возвращает { title, questions }.
function parseHtmlTest(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const titleEl = doc.querySelector("h1") || doc.querySelector("title");
  const title = titleEl ? titleEl.textContent.trim() : "";

  const blocks = doc.querySelectorAll(".q-block");
  const questions = [];
  blocks.forEach((block) => {
    const titleNode = block.querySelector(".q-title");
    if (!titleNode) return;
    const optionEls = block.querySelectorAll(".opt label");
    if (optionEls.length === 0) return; // не тестовый блок (сопоставление / открытый вопрос) — пропускаем

    const badge = titleNode.querySelector(".badge");
    let text = titleNode.textContent.trim();
    if (badge) text = text.replace(badge.textContent, "").trim();

    const options = [];
    let correctIdx = 0;
    optionEls.forEach((label, idx) => {
      options.push(label.textContent.trim());
      if (label.classList.contains("correct")) correctIdx = idx;
    });

    questions.push({ id: uid(), type: "single", text, options, correct: correctIdx });
  });

  return { title, questions };
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [users, setUsers] = useState([]);
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState("tests");
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [takingTest, setTakingTest] = useState(null);
  const [buildingTest, setBuildingTest] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [u, t, r] = await Promise.all([
          getKV("app:users"),
          getKV("app:tests"),
          getKV("app:results"),
        ]);
        setUsers(Array.isArray(u) ? u : []);
        setTests(Array.isArray(t) ? t : []);
        setResults(Array.isArray(r) ? r : []);
      } catch (e) {
        console.error("Storage load error", e);
      }
      setReady(true);
    })();
  }, []);

  const persistUsers = useCallback(async (next) => {
    setUsers(next);
    try {
      await setKV("app:users", next);
    } catch (e) {
      console.error("Save users failed", e);
    }
  }, []);

  const persistTests = useCallback(async (next) => {
    setTests(next);
    try {
      await setKV("app:tests", next);
    } catch (e) {
      console.error("Save tests failed", e);
    }
  }, []);

  const persistResults = useCallback(async (next) => {
    setResults(next);
    try {
      await setKV("app:results", next);
    } catch (e) {
      console.error("Save results failed", e);
    }
  }, []);

  function handleLogin(username, password) {
    setAuthError("");
    const u = users.find(
      (x) => x.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (!u || u.password !== password) {
      setAuthError("Неверное имя пользователя или пароль.");
      return;
    }
    setCurrentUser(u);
    setTab(u.role === "teacher" ? "tests" : "available");
  }

  function handleRegister({ name, username, password, teacherCode }) {
    setAuthError("");
    if (!name.trim() || !username.trim() || !password) {
      setAuthError("Заполните все поля.");
      return;
    }
    if (users.some((x) => x.username.toLowerCase() === username.trim().toLowerCase())) {
      setAuthError("Это имя пользователя уже занято.");
      return;
    }
    const role = teacherCode.trim() === TEACHER_CODE ? "teacher" : "student";
    if (teacherCode.trim() && role === "student") {
      setAuthError("Код преподавателя неверный.");
      return;
    }
    const newUser = { id: uid(), name: name.trim(), username: username.trim(), password, role };
    persistUsers([...users, newUser]);
    setCurrentUser(newUser);
    setTab(role === "teacher" ? "tests" : "available");
  }

  function logout() {
    setCurrentUser(null);
    setTakingTest(null);
    setBuildingTest(false);
    setAuthMode("login");
  }

  function saveTest(test) {
    const exists = tests.some((t) => t.id === test.id);
    const next = exists ? tests.map((t) => (t.id === test.id ? test : t)) : [...tests, test];
    persistTests(next);
    setBuildingTest(false);
  }

  function deleteTest(id) {
    if (!confirm("Удалить тест? Результаты студентов по нему сохранятся.")) return;
    persistTests(tests.filter((t) => t.id !== id));
  }

  function submitResult(test, answers) {
    let score = 0;
    test.questions.forEach((q) => {
      const given = answers[q.id];
      if (q.type === "single") {
        if (given === q.correct) score += 1;
      } else if (q.type === "multiple") {
        const g = new Set(given || []);
        const c = new Set(q.correct || []);
        if (g.size === c.size && [...g].every((x) => c.has(x))) score += 1;
      } else if (q.type === "text") {
        const accepted = (q.correct || []).map((s) => s.trim().toLowerCase());
        if (accepted.includes((given || "").trim().toLowerCase())) score += 1;
      }
    });
    const record = {
      id: uid(),
      username: currentUser.username,
      testId: test.id,
      score,
      total: test.questions.length,
      answers,
      completedAt: Date.now(),
    };
    persistResults([...results, record]);
    setTakingTest(null);
    return record;
  }

  if (!ready) {
    return (
      <div className="app-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <style>{STYLE}</style>
        <div style={{ color: "var(--ink-soft)", fontSize: 14 }}>Загрузка…</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="app-root">
        <style>{STYLE}</style>
        <AuthScreen
          mode={authMode}
          setMode={setAuthMode}
          error={authError}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      </div>
    );
  }

  const isTeacher = currentUser.role === "teacher";

  return (
    <div className="app-root" style={{ display: "flex", minHeight: 560 }}>
      <style>{STYLE}</style>

      <div
        className="topbar-mobile line-bottom"
        style={{
          display: "none",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          position: "sticky",
          top: 0,
          background: "var(--paper)",
          zIndex: 5,
        }}
      >
        <span className="app-serif" style={{ fontSize: 18 }}>Тесты</span>
        <button className="btn btn-secondary" onClick={() => setMobileNavOpen((v) => !v)}>
          Меню
        </button>
      </div>

      <div
        className="sidebar-desktop line-right"
        style={{
          width: 220,
          flexShrink: 0,
          display: mobileNavOpen ? "block" : undefined,
          padding: "22px 0",
        }}
      >
        <div className="app-serif" style={{ fontSize: 20, padding: "0 18px 20px" }}>
          Тесты
        </div>
        <div style={{ padding: "0 18px 14px", fontSize: 13, color: "var(--ink-soft)" }}>
          {currentUser.name}
          <div className="badge badge-neutral" style={{ marginTop: 6, display: "inline-block" }}>
            {isTeacher ? "Преподаватель" : "Студент"}
          </div>
        </div>
        <hr className="divider" style={{ margin: "8px 0" }} />
        {isTeacher ? (
          <>
            <div className={`nav-item ${tab === "tests" ? "active" : ""}`} onClick={() => { setTab("tests"); setMobileNavOpen(false); }}>
              <ClipboardList size={16} /> Тесты
            </div>
            <div className={`nav-item ${tab === "students" ? "active" : ""}`} onClick={() => { setTab("students"); setMobileNavOpen(false); }}>
              <BarChart3 size={16} /> Прогресс студентов
            </div>
          </>
        ) : (
          <>
            <div className={`nav-item ${tab === "available" ? "active" : ""}`} onClick={() => { setTab("available"); setMobileNavOpen(false); }}>
              <ClipboardList size={16} /> Доступные тесты
            </div>
            <div className={`nav-item ${tab === "progress" ? "active" : ""}`} onClick={() => { setTab("progress"); setMobileNavOpen(false); }}>
              <BarChart3 size={16} /> Мой прогресс
            </div>
          </>
        )}
        <hr className="divider" style={{ margin: "8px 0" }} />
        <div className="nav-item" onClick={logout}>
          <LogOut size={16} /> Выйти
        </div>
      </div>

      <div style={{ flex: 1, padding: "28px 32px", minWidth: 0 }}>
        {takingTest ? (
          <TestRunner
            test={takingTest}
            onCancel={() => setTakingTest(null)}
            onSubmit={(answers) => submitResult(takingTest, answers)}
          />
        ) : buildingTest !== false ? (
          <TestBuilder
            initial={buildingTest === true ? null : buildingTest}
            onCancel={() => setBuildingTest(false)}
            onSave={saveTest}
          />
        ) : isTeacher ? (
          tab === "tests" ? (
            <TeacherTests
              tests={tests}
              results={results}
              onCreate={() => setBuildingTest(true)}
              onEdit={(t) => setBuildingTest(t)}
              onDelete={deleteTest}
            />
          ) : (
            <TeacherProgress users={users} tests={tests} results={results} />
          )
        ) : tab === "available" ? (
          <StudentTests
            tests={tests}
            results={results.filter((r) => r.username === currentUser.username)}
            onStart={(t) => setTakingTest(t)}
          />
        ) : (
          <StudentProgress
            tests={tests}
            results={results.filter((r) => r.username === currentUser.username)}
          />
        )}
      </div>
    </div>
  );
}

function AuthScreen({ mode, setMode, error, onLogin, onRegister }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [teacherCode, setTeacherCode] = useState("");

  return (
    <div style={{ display: "flex", minHeight: 520, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: 340 }}>
        <div className="app-serif" style={{ fontSize: 26, marginBottom: 6 }}>Тесты</div>
        <div style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 28 }}>
          {mode === "login" ? "Вход в личный кабинет" : "Создать аккаунт"}
        </div>

        {mode === "register" && (
          <div style={{ marginBottom: 14 }}>
            <label className="field-label">Имя</label>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Как к вам обращаться" />
          </div>
        )}
        <div style={{ marginBottom: 14 }}>
          <label className="field-label">Имя пользователя</label>
          <input className="field" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="field-label">Пароль</label>
          <input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {mode === "register" && (
          <div style={{ marginBottom: 14 }}>
            <label className="field-label">Код преподавателя (необязательно)</label>
            <input className="field" value={teacherCode} onChange={(e) => setTeacherCode(e.target.value)} placeholder="оставьте пустым, если вы студент" />
          </div>
        )}

        {error && (
          <div style={{ fontSize: 13, color: "var(--brick)", marginBottom: 14 }}>{error}</div>
        )}

        <button
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center", marginBottom: 12 }}
          onClick={() =>
            mode === "login" ? onLogin(username, password) : onRegister({ name, username, password, teacherCode })
          }
        >
          {mode === "login" ? "Войти" : "Зарегистрироваться"}
        </button>

        <div style={{ fontSize: 13, color: "var(--ink-soft)", textAlign: "center" }}>
          {mode === "login" ? (
            <>Нет аккаунта? <a onClick={() => setMode("register")} style={{ cursor: "pointer", color: "var(--teal)" }}>Зарегистрироваться</a></>
          ) : (
            <>Уже есть аккаунт? <a onClick={() => setMode("login")} style={{ cursor: "pointer", color: "var(--teal)" }}>Войти</a></>
          )}
        </div>
      </div>
    </div>
  );
}

function TeacherTests({ tests, results, onCreate, onEdit, onDelete }) {
  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div className="app-serif" style={{ fontSize: 22 }}>Тесты</div>
        <button className="btn btn-teal" onClick={onCreate}><Plus size={15} /> Новый тест</button>
      </div>
      {tests.length === 0 && (
        <div style={{ fontSize: 14, color: "var(--ink-soft)", padding: "20px 0" }}>
          Тестов пока нет — создайте первый.
        </div>
      )}
      <div>
        {tests.map((t, i) => {
          const attempts = results.filter((r) => r.testId === t.id).length;
          return (
            <div key={t.id} className={i > 0 ? "row-item line-top" : "row-item"}>
              <div>
                <div style={{ fontSize: 15 }}>{t.title}</div>
                <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 3 }}>
                  {t.questions.length} вопрос(ов) · {attempts} попыт(ок)
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button className="btn btn-secondary" onClick={() => onEdit(t)}>Изменить</button>
                <button className="btn-ghost btn" onClick={() => onDelete(t.id)}><Trash2 size={15} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TeacherProgress({ users, tests, results }) {
  const students = users.filter((u) => u.role === "student");
  return (
    <div style={{ maxWidth: 860, overflowX: "auto" }}>
      <div className="app-serif" style={{ fontSize: 22, marginBottom: 20 }}>Прогресс студентов</div>
      {students.length === 0 ? (
        <div style={{ fontSize: 14, color: "var(--ink-soft)" }}>Пока нет зарегистрированных студентов.</div>
      ) : tests.length === 0 ? (
        <div style={{ fontSize: 14, color: "var(--ink-soft)" }}>Добавьте тесты, чтобы видеть прогресс.</div>
      ) : (
        <table className="table-simple">
          <thead>
            <tr>
              <th>Студент</th>
              {tests.map((t) => (
                <th key={t.id}>{t.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                {tests.map((t) => {
                  const attempts = results
                    .filter((r) => r.username === s.username && r.testId === t.id)
                    .sort((a, b) => b.completedAt - a.completedAt);
                  const best = attempts[0];
                  return (
                    <td key={t.id}>
                      {best ? (
                        <span className={`badge ${best.score === best.total ? "badge-teal" : "badge-neutral"}`}>
                          {best.score}/{best.total}
                        </span>
                      ) : (
                        <span style={{ color: "var(--ink-soft)", fontSize: 13 }}>—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StudentTests({ tests, results, onStart }) {
  return (
    <div style={{ maxWidth: 640 }}>
      <div className="app-serif" style={{ fontSize: 22, marginBottom: 20 }}>Доступные тесты</div>
      {tests.length === 0 && (
        <div style={{ fontSize: 14, color: "var(--ink-soft)" }}>Преподаватель ещё не добавил тесты.</div>
      )}
      {tests.map((t, i) => {
        const attempts = results.filter((r) => r.testId === t.id).sort((a, b) => b.completedAt - a.completedAt);
        const best = attempts[0];
        return (
          <div key={t.id} className={i > 0 ? "row-item line-top" : "row-item"}>
            <div>
              <div style={{ fontSize: 15 }}>{t.title}</div>
              <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 3 }}>
                {t.questions.length} вопрос(ов)
                {best && <> · лучший результат: {best.score}/{best.total}</>}
              </div>
            </div>
            <button className="btn btn-teal" onClick={() => onStart(t)}>
              {best ? "Пройти снова" : "Начать"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function StudentProgress({ tests, results }) {
  const sorted = [...results].sort((a, b) => b.completedAt - a.completedAt);
  const totalScore = results.reduce((s, r) => s + r.score, 0);
  const totalMax = results.reduce((s, r) => s + r.total, 0);
  return (
    <div style={{ maxWidth: 640 }}>
      <div className="app-serif" style={{ fontSize: 22, marginBottom: 8 }}>Мой прогресс</div>
      <div style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 20 }}>
        {totalMax > 0 ? `Всего верно: ${totalScore} из ${totalMax}` : "Вы ещё не прошли ни одного теста."}
      </div>
      {sorted.map((r, i) => {
        const test = tests.find((t) => t.id === r.testId);
        return (
          <div key={r.id} className={i > 0 ? "row-item line-top" : "row-item"}>
            <div>
              <div style={{ fontSize: 15 }}>{test ? test.title : "Тест удалён"}</div>
              <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 3 }}>
                {new Date(r.completedAt).toLocaleString("ru-RU")}
              </div>
            </div>
            <span className={`badge ${r.score === r.total ? "badge-teal" : "badge-neutral"}`}>
              {r.score}/{r.total}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function TestRunner({ test, onCancel, onSubmit }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(null);

  function setSingle(qId, idx) {
    setAnswers((a) => ({ ...a, [qId]: idx }));
  }
  function toggleMultiple(qId, idx) {
    setAnswers((a) => {
      const cur = new Set(a[qId] || []);
      cur.has(idx) ? cur.delete(idx) : cur.add(idx);
      return { ...a, [qId]: [...cur] };
    });
  }
  function setText(qId, val) {
    setAnswers((a) => ({ ...a, [qId]: val }));
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: 640 }}>
        <div className="app-serif" style={{ fontSize: 22, marginBottom: 8 }}>{test.title} — результат</div>
        <div style={{ fontSize: 16, color: "var(--teal)", marginBottom: 20 }}>
          {submitted.score} из {submitted.total} правильно
        </div>
        <div className="progress-track" style={{ marginBottom: 24 }}>
          <div className="progress-fill" style={{ width: `${(submitted.score / submitted.total) * 100}%` }} />
        </div>
        <button className="btn btn-secondary" onClick={onCancel}><ChevronLeft size={15} /> Вернуться к тестам</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div className="app-serif" style={{ fontSize: 22 }}>{test.title}</div>
        <button className="btn-ghost btn" onClick={onCancel}><X size={16} /></button>
      </div>
      {test.questions.map((q, qi) => (
        <div key={q.id} style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 15, marginBottom: 12 }}>{qi + 1}. {q.text}</div>
          {q.type === "single" &&
            q.options.map((opt, oi) => (
              <div
                key={oi}
                className={`option-row ${answers[q.id] === oi ? "selected" : ""}`}
                onClick={() => setSingle(q.id, oi)}
              >
                {answers[q.id] === oi ? <CheckCircle2 size={16} color="#2F6F62" /> : <Circle size={16} color="#B7BCB2" />}
                <span style={{ fontSize: 14 }}>{opt}</span>
              </div>
            ))}
          {q.type === "multiple" &&
            q.options.map((opt, oi) => {
              const checked = (answers[q.id] || []).includes(oi);
              return (
                <div key={oi} className={`option-row ${checked ? "selected" : ""}`} onClick={() => toggleMultiple(q.id, oi)}>
                  {checked ? <CheckCircle2 size={16} color="#2F6F62" /> : <Circle size={16} color="#B7BCB2" />}
                  <span style={{ fontSize: 14 }}>{opt}</span>
                </div>
              );
            })}
          {q.type === "text" && (
            <input
              className="field"
              value={answers[q.id] || ""}
              onChange={(e) => setText(q.id, e.target.value)}
              placeholder="Введите ответ"
            />
          )}
        </div>
      ))}
      <button
        className="btn btn-primary"
        onClick={() => setSubmitted(onSubmit(answers))}
      >
        Завершить тест
      </button>
    </div>
  );
}

function emptyQuestion() {
  return { id: uid(), type: "single", text: "", options: ["", ""], correct: 0 };
}

function TestBuilder({ initial, onCancel, onSave }) {
  const [title, setTitle] = useState(initial ? initial.title : "");
  const [questions, setQuestions] = useState(initial ? initial.questions : [emptyQuestion()]);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importMsg, setImportMsg] = useState("");

  function runImport() {
    if (!importText.trim()) return;
    try {
      const parsed = parseHtmlTest(importText);
      if (parsed.questions.length === 0) {
        setImportMsg("Не нашёл ни одного вопроса с вариантами ответа в этом файле.");
        return;
      }
      setQuestions((qs) => {
        const isBlank = qs.length === 1 && !qs[0].text.trim() && qs[0].options.every((o) => !o.trim());
        return isBlank ? parsed.questions : [...qs, ...parsed.questions];
      });
      if (!title.trim() && parsed.title) setTitle(parsed.title);
      setImportMsg(`Добавлено вопросов: ${parsed.questions.length}.`);
      setImportText("");
      setImportOpen(false);
    } catch (e) {
      setImportMsg("Не получилось разобрать файл — проверь, что это HTML целиком.");
    }
  }

  function updateQ(idx, patch) {
    setQuestions((qs) => qs.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  }
  function updateOption(qIdx, oIdx, val) {
    setQuestions((qs) =>
      qs.map((q, i) => (i === qIdx ? { ...q, options: q.options.map((o, j) => (j === oIdx ? val : o)) } : q))
    );
  }
  function addOption(qIdx) {
    setQuestions((qs) => qs.map((q, i) => (i === qIdx ? { ...q, options: [...q.options, ""] } : q)));
  }
  function removeOption(qIdx, oIdx) {
    setQuestions((qs) =>
      qs.map((q, i) => (i === qIdx ? { ...q, options: q.options.filter((_, j) => j !== oIdx) } : q))
    );
  }
  function changeType(qIdx, type) {
    setQuestions((qs) =>
      qs.map((q, i) => {
        if (i !== qIdx) return q;
        if (type === "text") return { id: q.id, type, text: q.text, correct: [""] };
        if (type === "single") return { id: q.id, type, text: q.text, options: q.options?.length ? q.options : ["", ""], correct: 0 };
        return { id: q.id, type, text: q.text, options: q.options?.length ? q.options : ["", ""], correct: [] };
      })
    );
  }
  function toggleCorrectMultiple(qIdx, oIdx) {
    setQuestions((qs) =>
      qs.map((q, i) => {
        if (i !== qIdx) return q;
        const cur = new Set(q.correct || []);
        cur.has(oIdx) ? cur.delete(oIdx) : cur.add(oIdx);
        return { ...q, correct: [...cur] };
      })
    );
  }
  function addQuestion() {
    setQuestions((qs) => [...qs, emptyQuestion()]);
  }
  function removeQuestion(idx) {
    setQuestions((qs) => qs.filter((_, i) => i !== idx));
  }

  function canSave() {
    if (!title.trim() || questions.length === 0) return false;
    return questions.every((q) => {
      if (!q.text.trim()) return false;
      if (q.type === "text") return (q.correct || []).some((c) => c.trim());
      return (q.options || []).every((o) => o.trim()) && q.options.length >= 2;
    });
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div className="app-serif" style={{ fontSize: 22 }}>{initial ? "Изменить тест" : "Новый тест"}</div>
        <button className="btn-ghost btn" onClick={onCancel}><X size={16} /></button>
      </div>

      <div style={{ marginBottom: 22 }}>
        <label className="field-label">Название теста</label>
        <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например: Анатомия — костная система" />
      </div>

      <div className="line-top line-bottom" style={{ padding: "14px 0", marginBottom: 22 }}>
        {!importOpen ? (
          <button className="btn btn-secondary" onClick={() => setImportOpen(true)}>
            Импортировать вопросы из HTML-файла
          </button>
        ) : (
          <div>
            <label className="field-label">
              Открой свой HTML-файл теста в браузере или редакторе, скопируй весь код и вставь сюда
            </label>
            <textarea
              className="field"
              style={{ minHeight: 120, fontFamily: "monospace", fontSize: 12.5 }}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="<!DOCTYPE html> ..."
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button className="btn btn-teal" onClick={runImport}>Разобрать и добавить</button>
              <button className="btn btn-secondary" onClick={() => { setImportOpen(false); setImportText(""); }}>Отмена</button>
            </div>
          </div>
        )}
        {importMsg && <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 10 }}>{importMsg}</div>}
      </div>

      {questions.map((q, qi) => (
        <div key={q.id} className="line-top" style={{ paddingTop: 18, marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input
              className="field"
              value={q.text}
              onChange={(e) => updateQ(qi, { text: e.target.value })}
              placeholder={`Вопрос ${qi + 1}`}
            />
            <select className="field" style={{ width: 160 }} value={q.type} onChange={(e) => changeType(qi, e.target.value)}>
              <option value="single">Один ответ</option>
              <option value="multiple">Несколько ответов</option>
              <option value="text">Текстовый ответ</option>
            </select>
            <button className="btn-ghost btn" onClick={() => removeQuestion(qi)}><Trash2 size={15} /></button>
          </div>

          {q.type === "single" &&
            q.options.map((opt, oi) => (
              <div key={oi} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <input type="radio" checked={q.correct === oi} onChange={() => updateQ(qi, { correct: oi })} />
                <input className="field" value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)} placeholder={`Вариант ${oi + 1}`} />
                {q.options.length > 2 && (
                  <button className="btn-ghost btn" onClick={() => removeOption(qi, oi)}><X size={14} /></button>
                )}
              </div>
            ))}
          {q.type === "multiple" &&
            q.options.map((opt, oi) => (
              <div key={oi} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <input type="checkbox" checked={(q.correct || []).includes(oi)} onChange={() => toggleCorrectMultiple(qi, oi)} />
                <input className="field" value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)} placeholder={`Вариант ${oi + 1}`} />
                {q.options.length > 2 && (
                  <button className="btn-ghost btn" onClick={() => removeOption(qi, oi)}><X size={14} /></button>
                )}
              </div>
            ))}
          {(q.type === "single" || q.type === "multiple") && (
            <button className="btn btn-secondary" style={{ marginTop: 4 }} onClick={() => addOption(qi)}>
              <Plus size={14} /> Вариант
            </button>
          )}
          {q.type === "text" && (
            <div>
              <label className="field-label">Правильные варианты ответа (через запятую)</label>
              <input
                className="field"
                value={(q.correct || []).join(", ")}
                onChange={(e) => updateQ(qi, { correct: e.target.value.split(",").map((s) => s.trim()) })}
                placeholder="например: митоз, деление клетки"
              />
            </div>
          )}
        </div>
      ))}

      <button className="btn btn-secondary" style={{ marginBottom: 24 }} onClick={addQuestion}>
        <Plus size={14} /> Добавить вопрос
      </button>

      <div>
        <button
          className="btn btn-primary"
          disabled={!canSave()}
          onClick={() => onSave({ id: initial ? initial.id : uid(), title: title.trim(), questions })}
        >
          Сохранить тест
        </button>
      </div>
    </div>
  );
}
