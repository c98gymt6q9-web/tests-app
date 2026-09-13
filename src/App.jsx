import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');

  .app-root {
    --ink: #4B2E3D;
    --ink-soft: #8B5F73;
    --paper: #FBF1F2;
    --paper-raised: #FFFFFF;
    --line: #F0D9DF;
    --teal: #C85C82;
    --teal-deep: #9C3F66;
    --teal-soft: #F7E0E8;
    --brick: #7B4F99;
    --brick-soft: #EDE1F2;
    --gold: #7B4F99;
    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    color: var(--ink);
    background: var(--paper);
    min-height: 100%;
    width: 100%;
  }
  .app-serif { font-family: "Fraunces", Georgia, serif; font-optical-sizing: auto; }
  .line-top { border-top: 1px solid var(--line); }
  .line-bottom { border-bottom: 1px solid var(--line); }
  .line-right { border-right: 1px solid var(--line); }
  .divider { height: 1px; background: var(--line); border: none; margin: 0; }

  .logo-mark {
    width: 30px; height: 30px; border-radius: 50%;
    background: linear-gradient(155deg, var(--teal), var(--teal-deep));
    color: #fff;
    display: inline-flex; align-items: center; justify-content: center;
    font-family: "Fraunces", serif;
    font-size: 14px;
    flex-shrink: 0;
  }

  .btn {
    font-size: 14px;
    padding: 9px 16px;
    border-radius: 6px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: background 150ms ease, border-color 150ms ease, opacity 150ms ease, transform 100ms ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .btn-primary { background: var(--ink); color: var(--paper); }
  .btn-primary:hover { opacity: 0.87; transform: translateY(-1px); }
  .btn-secondary { background: transparent; color: var(--ink); border-color: var(--line); }
  .btn-secondary:hover { border-color: var(--ink-soft); background: #FBFAF7; }
  .btn-teal { background: linear-gradient(155deg, var(--teal), var(--teal-deep)); color: white; box-shadow: 0 2px 8px rgba(47,111,98,0.25); }
  .btn-teal:hover { opacity: 0.92; transform: translateY(-1px); }
  .btn-ghost { background: transparent; color: var(--ink-soft); padding: 6px 8px; }
  .btn-ghost:hover { color: var(--brick); }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  .field {
    width: 100%;
    font-size: 14px;
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: 6px;
    background: var(--paper-raised);
    color: var(--ink);
    transition: border-color 120ms ease, box-shadow 120ms ease;
  }
  .field:focus { outline: none; border-color: var(--teal); box-shadow: 0 0 0 3px var(--teal-soft); }
  .field-label {
    font-size: 12.5px;
    color: var(--ink-soft);
    margin-bottom: 6px;
    display: block;
  }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px;
    margin-bottom: 2px;
    font-size: 14px;
    color: var(--ink-soft);
    cursor: pointer;
    border-radius: 8px;
    transition: background 120ms ease, color 120ms ease;
  }
  .nav-item:hover { color: var(--ink); background: #FBFAF7; }
  .nav-item.active {
    color: var(--teal-deep);
    background: var(--teal-soft);
    font-weight: 500;
  }

  .row-item {
    padding: 18px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    border-radius: 8px;
    transition: background 120ms ease;
    margin: 0 -14px;
  }
  .row-item:hover { background: #FBFAF7; }

  .badge {
    font-size: 12px;
    padding: 3px 9px;
    border-radius: 20px;
    white-space: nowrap;
  }
  .badge-teal { background: var(--teal-soft); color: var(--teal-deep); }
  .badge-brick { background: var(--brick-soft); color: var(--brick); }
  .badge-neutral { background: #EAEBE6; color: var(--ink-soft); }

  .progress-track {
    height: 6px;
    background: #E4E6E0;
    border-radius: 20px;
    overflow: hidden;
    width: 100%;
  }
  .progress-fill { height: 100%; background: linear-gradient(90deg, var(--teal), var(--gold)); border-radius: 20px; transition: width 400ms ease; }

  .qcard {
    padding: 18px 20px;
    margin-bottom: 16px;
    background: var(--paper-raised);
    border: 1px solid var(--line);
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(75,46,61,0.05);
    transition: box-shadow 150ms ease;
  }
  .qcard:hover { box-shadow: 0 4px 14px rgba(75,46,61,0.1); }
  .q-badge-circle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px; height: 24px;
    background: var(--teal);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    border-radius: 50%;
    margin-right: 10px;
    flex-shrink: 0;
  }

  .option-row {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 12px 14px;
    border: 1px solid var(--line);
    border-radius: 8px;
    margin-bottom: 8px;
    cursor: pointer;
    background: var(--paper-raised);
    transition: border-color 120ms ease, background 120ms ease, transform 100ms ease;
  }
  .option-row:hover { border-color: var(--ink-soft); transform: translateX(2px); }
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
    .hero-panel { display: none; }
  }
`;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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
    if (optionEls.length === 0) return; // не тестовый блок — пропускаем

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

  // Сопоставление: первая .match-table — термины с data-answer="Буква" в пустой
  // ячейке, вторая .match-table — буквы с определениями. Если data-answer нет,
  // пары пропускаются (значит, разметка не рассчитана на автоимпорт).
  const matchTables = doc.querySelectorAll(".match-table");
  if (matchTables.length >= 2) {
    const termRows = matchTables[0].querySelectorAll("tr");
    const defRows = matchTables[1].querySelectorAll("tr");
    const defByLetter = {};
    defRows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 2) {
        defByLetter[cells[0].textContent.trim()] = cells[1].textContent.trim();
      }
    });
    const pairs = [];
    termRows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length < 3) return;
      const answerCell = cells[2];
      const letter = answerCell.getAttribute("data-answer");
      if (!letter || !defByLetter[letter]) return;
      const left = cells[0].textContent.replace(/^\d+\.\s*/, "").trim();
      pairs.push({ id: uid(), left, right: defByLetter[letter] });
    });
    if (pairs.length >= 2) {
      questions.push({
        id: uid(),
        type: "matching",
        text: "Сопоставь термин и его определение",
        pairs,
      });
    }
  }

  // Открытые вопросы: .open-q — не проверяются автоматически, только текст сохраняется
  doc.querySelectorAll(".open-q").forEach((block) => {
    const titleNode = block.querySelector(".q-title");
    if (!titleNode) return;
    questions.push({ id: uid(), type: "open", text: titleNode.textContent.trim() });
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
        const loadedUsers = Array.isArray(u) ? u : [];
        setUsers(loadedUsers);
        setTests(Array.isArray(t) ? t : []);
        setResults(Array.isArray(r) ? r : []);

        const savedUsername = localStorage.getItem("session:username");
        if (savedUsername) {
          const found = loadedUsers.find((x) => x.username === savedUsername);
          if (found) {
            setCurrentUser(found);
            setTab(found.role === "teacher" ? "tests" : "available");
          } else {
            localStorage.removeItem("session:username");
          }
        }
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
    if (!u || u.password !== password.trim()) {
      setAuthError("Неверное имя пользователя или пароль.");
      return;
    }
    setCurrentUser(u);
    localStorage.setItem("session:username", u.username);
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
    const newUser = { id: uid(), name: name.trim(), username: username.trim(), password: password.trim(), role };
    persistUsers([...users, newUser]);
    setCurrentUser(newUser);
    localStorage.setItem("session:username", newUser.username);
    setTab(role === "teacher" ? "tests" : "available");
  }

  function logout() {
    setCurrentUser(null);
    setTakingTest(null);
    setBuildingTest(false);
    setAuthMode("login");
    localStorage.removeItem("session:username");
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

  function bulkImportTests(newTests) {
    persistTests([...tests, ...newTests]);
  }

  function submitResult(test, answers) {
    let score = 0;
    let total = 0;
    test.questions.forEach((q) => {
      const given = answers[q.id];
      if (q.type === "single") {
        total += 1;
        if (given === q.correct) score += 1;
      } else if (q.type === "multiple") {
        total += 1;
        const g = new Set(given || []);
        const c = new Set(q.correct || []);
        if (g.size === c.size && [...g].every((x) => c.has(x))) score += 1;
      } else if (q.type === "text") {
        total += 1;
        const accepted = (q.correct || []).map((s) => s.trim().toLowerCase());
        if (accepted.includes((given || "").trim().toLowerCase())) score += 1;
      } else if (q.type === "matching") {
        total += q.pairs.length;
        const g = given || {};
        q.pairs.forEach((p) => {
          if (g[p.id] === p.right) score += 1;
        });
      }
      // "open" — не проверяется автоматически, не входит в total
    });
    const record = {
      id: uid(),
      username: currentUser.username,
      testId: test.id,
      score,
      total,
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
          width: 232,
          flexShrink: 0,
          display: mobileNavOpen ? "block" : undefined,
          padding: 0,
        }}
      >
        <div style={{ position: "relative", height: 108, overflow: "hidden", borderBottom: "1px solid var(--line)" }}>
          <svg viewBox="0 0 232 108" width="232" height="108" style={{ display: "block" }}>
            <rect width="232" height="108" fill="#F7E0E8" />
            <circle cx="34" cy="30" r="17" fill="#EDC7D5" />
            <circle cx="34" cy="30" r="7" fill="#9C3F66" />
            <circle cx="86" cy="16" r="12" fill="#E9D3EF" />
            <circle cx="86" cy="16" r="5" fill="#7B4F99" />
            <circle cx="128" cy="42" r="20" fill="#F2D6DF" />
            <circle cx="128" cy="42" r="8" fill="#C85C82" />
            <circle cx="176" cy="20" r="14" fill="#E3D2EC" />
            <circle cx="176" cy="20" r="6" fill="#7B4F99" />
            <circle cx="206" cy="58" r="16" fill="#EDC7D5" />
            <circle cx="206" cy="58" r="6.5" fill="#9C3F66" />
            <circle cx="20" cy="80" r="13" fill="#E9D3EF" />
            <circle cx="20" cy="80" r="5.5" fill="#7B4F99" />
            <circle cx="66" cy="88" r="19" fill="#F2D6DF" />
            <circle cx="66" cy="88" r="7.5" fill="#C85C82" />
            <circle cx="112" cy="80" r="11" fill="#EDC7D5" />
            <circle cx="112" cy="80" r="4.5" fill="#9C3F66" />
            <circle cx="156" cy="90" r="15" fill="#E3D2EC" />
            <circle cx="156" cy="90" r="6" fill="#7B4F99" />
            <circle cx="200" cy="98" r="12" fill="#F2D6DF" />
            <circle cx="200" cy="98" r="5" fill="#C85C82" />
          </svg>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, var(--paper) 100%)" }} />
          <div style={{ position: "absolute", left: 18, bottom: 10, display: "flex", alignItems: "center", gap: 9 }}>
            <div className="logo-mark" style={{ boxShadow: "0 2px 8px rgba(75,46,61,0.25)" }}>Т</div>
            <div className="app-serif" style={{ fontSize: 19, color: "var(--ink)" }}>Тесты</div>
          </div>
        </div>

        <div style={{ padding: "16px 18px 6px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "var(--brick-soft)", color: "var(--brick)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "Fraunces, serif", fontSize: 15, flexShrink: 0,
          }}>
            {currentUser.name.trim()[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentUser.name}</div>
            <div className="badge badge-neutral" style={{ marginTop: 2, display: "inline-block" }}>
              {isTeacher ? "Преподаватель" : "Студент"}
            </div>
          </div>
        </div>

        <div style={{ padding: "14px 12px 0" }}>
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
          <hr className="divider" style={{ margin: "10px 0" }} />
          <div className="nav-item" onClick={logout}>
            <LogOut size={16} /> Выйти
          </div>
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
              onBulkImport={bulkImportTests}
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
    <div style={{ display: "flex", minHeight: 560 }}>
      <div
        className="hero-panel"
        style={{
          flex: 1,
          minWidth: 260,
          background: "linear-gradient(155deg, var(--teal-deep), var(--teal) 60%, var(--gold))",
          color: "#fff",
          padding: 40,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", inset: 0, opacity: 0.15,
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }} />
        <div style={{ position: "relative" }}>
          <div className="logo-mark" style={{ width: 40, height: 40, fontSize: 18, background: "rgba(255,255,255,0.18)", marginBottom: 18 }}>Т</div>
          <div className="app-serif" style={{ fontSize: 30, lineHeight: 1.2 }}>Тесты</div>
        </div>
        <div className="app-serif" style={{ position: "relative", fontSize: 19, lineHeight: 1.5, maxWidth: 320, opacity: 0.95 }}>
          Проходите тесты, отслеживайте прогресс — всё в одном месте.
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ width: 320 }}>
          <div className="app-serif" style={{ fontSize: 22, marginBottom: 4 }}>
            {mode === "login" ? "Вход в личный кабинет" : "Создать аккаунт"}
          </div>
          <div style={{ fontSize: 13.5, color: "var(--ink-soft)", marginBottom: 24 }}>
            {mode === "login" ? "Введите данные, чтобы продолжить" : "Это займёт меньше минуты"}
          </div>

          {mode === "register" && (
            <div style={{ marginBottom: 14 }}>
              <label className="field-label">Имя</label>
              <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Как к вам обращаться" />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label className="field-label">Имя пользователя</label>
            <input
              className="field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="field-label">Пароль</label>
            <input
              className="field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
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
            className="btn btn-teal"
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
    </div>
  );
}

function TeacherTests({ tests, results, onCreate, onEdit, onDelete, onBulkImport }) {
  const fileInputRef = useRef(null);
  const [bulkMsg, setBulkMsg] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);

  async function handleBulkFiles(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setBulkBusy(true);
    setBulkMsg("");
    const newTests = [];
    const skipped = [];
    for (const file of files) {
      try {
        const html = await file.text();
        const parsed = parseHtmlTest(html);
        if (parsed.questions.length === 0) {
          skipped.push(file.name);
          continue;
        }
        newTests.push({
          id: uid(),
          title: parsed.title || file.name.replace(/\.html?$/i, ""),
          questions: parsed.questions,
        });
      } catch {
        skipped.push(file.name);
      }
    }
    if (newTests.length > 0) onBulkImport(newTests);
    let msg = newTests.length > 0 ? `Импортировано тестов: ${newTests.length}.` : "Ни один файл не удалось разобрать.";
    if (skipped.length > 0) msg += ` Пропущено (без вопросов): ${skipped.join(", ")}.`;
    setBulkMsg(msg);
    setBulkBusy(false);
    e.target.value = "";
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
        <div className="app-serif" style={{ fontSize: 22 }}>Тесты</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" disabled={bulkBusy} onClick={() => fileInputRef.current?.click()}>
            {bulkBusy ? "Загружаю…" : "Массовый импорт HTML"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.htm"
            multiple
            style={{ display: "none" }}
            onChange={handleBulkFiles}
          />
          <button className="btn btn-teal" onClick={onCreate}><Plus size={15} /> Новый тест</button>
        </div>
      </div>
      {bulkMsg && (
        <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 16 }}>{bulkMsg}</div>
      )}
      {tests.length === 0 && (
        <div style={{ fontSize: 14, color: "var(--ink-soft)", padding: "20px 0" }}>
          Тестов пока нет — создайте первый или загрузите сразу несколько HTML-файлов.
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
  const [viewing, setViewing] = useState(null); // { student, test, attempt }

  if (viewing) {
    const { student, test, attempt } = viewing;
    return (
      <div style={{ maxWidth: 640 }}>
        <button className="btn btn-secondary" style={{ marginBottom: 18 }} onClick={() => setViewing(null)}>
          <ChevronLeft size={15} /> К таблице прогресса
        </button>
        <div className="app-serif" style={{ fontSize: 20, marginBottom: 2 }}>{test.title}</div>
        <div style={{ fontSize: 13.5, color: "var(--ink-soft)", marginBottom: 20 }}>
          {student.name} · {new Date(attempt.completedAt).toLocaleString("ru-RU")}
          {attempt.total > 0 && <> · {attempt.score}/{attempt.total} правильно</>}
        </div>
        {test.questions.map((q, qi) => {
          const given = attempt.answers[q.id];
          return (
            <div key={q.id} className="line-top" style={{ paddingTop: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 14.5, marginBottom: 8 }}>{qi + 1}. {q.text}</div>
              {q.type === "single" && (
                <div style={{ fontSize: 13.5 }}>
                  <span className={given === q.correct ? "badge badge-teal" : "badge badge-brick"}>
                    {given === undefined || given === null ? "Не отвечено" : q.options[given]}
                  </span>
                  {given !== q.correct && (
                    <div style={{ marginTop: 6, color: "var(--ink-soft)" }}>Верно: {q.options[q.correct]}</div>
                  )}
                </div>
              )}
              {q.type === "multiple" && (
                <div style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>
                  Ответ: {(given || []).length ? given.map((i) => q.options[i]).join(", ") : "не отвечено"}
                  <div>Верно: {q.correct.map((i) => q.options[i]).join(", ")}</div>
                </div>
              )}
              {q.type === "text" && (
                <div style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>
                  Ответ: «{given || "не отвечено"}»
                </div>
              )}
              {q.type === "matching" && (
                <div style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>
                  {q.pairs.map((p) => (
                    <div key={p.id} style={{ marginBottom: 4 }}>
                      {p.left} → {(given || {})[p.id] || "не отвечено"}
                      {(given || {})[p.id] !== p.right && <span style={{ color: "var(--brick)" }}> (верно: {p.right})</span>}
                    </div>
                  ))}
                </div>
              )}
              {q.type === "open" && (
                <div style={{ fontSize: 14, background: "var(--paper-raised)", border: "1px solid var(--line)", borderRadius: 8, padding: "10px 12px", whiteSpace: "pre-wrap" }}>
                  {given && given.trim() ? given : <span style={{ color: "var(--ink-soft)" }}>Студент не ответил</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

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
                        <span
                          className={`badge ${best.score === best.total ? "badge-teal" : "badge-neutral"}`}
                          style={{ cursor: "pointer" }}
                          onClick={() => setViewing({ student: s, test: t, attempt: best })}
                        >
                          {best.score}/{best.total} · смотреть
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

  const shuffledRights = useMemo(() => {
    const map = {};
    test.questions.forEach((q) => {
      if (q.type === "matching") map[q.id] = shuffle(q.pairs.map((p) => p.right));
    });
    return map;
  }, [test]);

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
  function setMatch(qId, pairId, val) {
    setAnswers((a) => ({ ...a, [qId]: { ...(a[qId] || {}), [pairId]: val } }));
  }

  if (submitted) {
    const hasGraded = submitted.total > 0;
    return (
      <div style={{ maxWidth: 640 }}>
        <div className="app-serif" style={{ fontSize: 22, marginBottom: 8 }}>{test.title} — результат</div>
        <div style={{ fontSize: 16, color: "var(--teal)", marginBottom: 20 }}>
          {hasGraded ? `${submitted.score} из ${submitted.total} правильно` : "Ответы отправлены — вопросы без автопроверки, преподаватель посмотрит их вручную"}
        </div>
        {hasGraded && (
          <div className="progress-track" style={{ marginBottom: 24 }}>
            <div className="progress-fill" style={{ width: `${(submitted.score / submitted.total) * 100}%` }} />
          </div>
        )}
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
        <div key={q.id} className="qcard">
          <div style={{ fontSize: 15, marginBottom: 12, display: "flex", alignItems: "flex-start" }}>
            <span className="q-badge-circle">{qi + 1}</span>
            <span>{q.text}</span>
          </div>
          {q.type === "single" &&
            q.options.map((opt, oi) => (
              <div
                key={oi}
                className={`option-row ${answers[q.id] === oi ? "selected" : ""}`}
                onClick={() => setSingle(q.id, oi)}
              >
                {answers[q.id] === oi ? <CheckCircle2 size={16} color="#C85C82" /> : <Circle size={16} color="#D9BFC8" />}
                <span style={{ fontSize: 14 }}>{opt}</span>
              </div>
            ))}
          {q.type === "multiple" &&
            q.options.map((opt, oi) => {
              const checked = (answers[q.id] || []).includes(oi);
              return (
                <div key={oi} className={`option-row ${checked ? "selected" : ""}`} onClick={() => toggleMultiple(q.id, oi)}>
                  {checked ? <CheckCircle2 size={16} color="#C85C82" /> : <Circle size={16} color="#D9BFC8" />}
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
          {q.type === "matching" && (
            <div>
              {q.pairs.map((p) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ flex: 1, fontSize: 14 }}>{p.left}</div>
                  <select
                    className="field"
                    style={{ flex: 1 }}
                    value={(answers[q.id] || {})[p.id] || ""}
                    onChange={(e) => setMatch(q.id, p.id, e.target.value)}
                  >
                    <option value="">Выбери определение…</option>
                    {shuffledRights[q.id].map((opt, oi) => (
                      <option key={oi} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
          {q.type === "open" && (
            <textarea
              className="field"
              style={{ minHeight: 90 }}
              value={answers[q.id] || ""}
              onChange={(e) => setText(q.id, e.target.value)}
              placeholder="Разверни ответ своими словами — преподаватель проверит его вручную"
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
  function addPair(qIdx) {
    setQuestions((qs) =>
      qs.map((q, i) => (i === qIdx ? { ...q, pairs: [...q.pairs, { id: uid(), left: "", right: "" }] } : q))
    );
  }
  function removePair(qIdx, pairId) {
    setQuestions((qs) =>
      qs.map((q, i) => (i === qIdx ? { ...q, pairs: q.pairs.filter((p) => p.id !== pairId) } : q))
    );
  }
  function updatePair(qIdx, pairId, field, val) {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qIdx ? { ...q, pairs: q.pairs.map((p) => (p.id === pairId ? { ...p, [field]: val } : p)) } : q
      )
    );
  }
  function changeType(qIdx, type) {
    setQuestions((qs) =>
      qs.map((q, i) => {
        if (i !== qIdx) return q;
        if (type === "text") return { id: q.id, type, text: q.text, correct: [""] };
        if (type === "open") return { id: q.id, type, text: q.text };
        if (type === "matching") {
          return {
            id: q.id,
            type,
            text: q.text,
            pairs: q.pairs?.length
              ? q.pairs
              : [
                  { id: uid(), left: "", right: "" },
                  { id: uid(), left: "", right: "" },
                ],
          };
        }
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
      if (q.type === "open") return true;
      if (q.type === "matching") return q.pairs.length >= 2 && q.pairs.every((p) => p.left.trim() && p.right.trim());
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
              <option value="matching">Сопоставление</option>
              <option value="open">Открытый ответ</option>
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
          {q.type === "matching" && (
            <div>
              <label className="field-label">Пары «термин — определение» (каждая строка уже верная пара)</label>
              {q.pairs.map((p) => (
                <div key={p.id} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <input
                    className="field"
                    value={p.left}
                    onChange={(e) => updatePair(qi, p.id, "left", e.target.value)}
                    placeholder="Термин"
                  />
                  <input
                    className="field"
                    value={p.right}
                    onChange={(e) => updatePair(qi, p.id, "right", e.target.value)}
                    placeholder="Определение"
                  />
                  {q.pairs.length > 2 && (
                    <button className="btn-ghost btn" onClick={() => removePair(qi, p.id)}><X size={14} /></button>
                  )}
                </div>
              ))}
              <button className="btn btn-secondary" style={{ marginTop: 4 }} onClick={() => addPair(qi)}>
                <Plus size={14} /> Пара
              </button>
            </div>
          )}
          {q.type === "open" && (
            <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
              Ответ не проверяется автоматически — студент впишет текст, ты увидишь его вручную.
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
