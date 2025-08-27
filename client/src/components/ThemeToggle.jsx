import { useEffect, useState } from "react";
const THEMES = ["corporate", "business"]; // light / dark
export default function ThemeToggle() {
  const [t, setT] = useState(() => localStorage.getItem("theme") || THEMES[0]);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("theme", t);
  }, [t]);
  return (
    <label className="swap swap-rotate">
      <input
        type="checkbox"
        checked={t === THEMES[1]}
        onChange={() => setT((p) => (p === THEMES[0] ? THEMES[1] : THEMES[0]))}
      />
      <svg
        className="swap-on w-5 h-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M21.64 13A9 9 0 1111 2.36 7 7 0 0021.64 13z" />
      </svg>
      <svg
        className="swap-off w-5 h-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M5 12a7 7 0 1014 0A7 7 0 005 12z" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    </label>
  );
}
