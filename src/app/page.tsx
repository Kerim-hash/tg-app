"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const tg = window?.Telegram?.WebApp;
    tg?.ready();

    if (tg?.initDataUnsafe?.user) {
      setUsername(tg.initDataUnsafe.user.username);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900">
      {/* HEADER */}
      <header className="w-full bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-lg font-semibold">🚀 Mini App</h1>
      </header>

      {/* CONTENT */}
      <main className="flex flex-col flex-1 items-center justify-center p-6">
        <h2 className="text-xl font-bold mb-4">Добро пожаловать!</h2>
        {username ? (
          <p className="text-lg">Привет, @{username} 👋</p>
        ) : (
          <p className="text-lg">Ожидание данных от Telegram...</p>
        )}

        <div className="flex gap-4 mt-6">
          <button
            className="px-5 py-3 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition"
            onClick={() => alert("✅ Кнопка работает")}
          >
            Действие
          </button>

          <button
            className="px-5 py-3 bg-red-600 text-white rounded-xl shadow hover:bg-red-700 transition"
            onClick={() => {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              window.Telegram.WebApp.close();
            }}
          >
            Закрыть
          </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-gray-200 text-gray-700 text-center py-3 text-sm">
        © {new Date().getFullYear()} Mini App
      </footer>
    </div>
  );
}
