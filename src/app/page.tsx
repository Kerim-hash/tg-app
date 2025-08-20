"use client";

import { useInitData, useMiniApp } from "@tma.js/sdk-react";

export default function Home() {
  const initData = useInitData();
  const miniApp = useMiniApp();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900 p-6">
      <h1 className="text-2xl font-bold mb-4">🚀 Telegram Mini App</h1>

      {initData?.user ? (
        <p className="text-lg">
          Привет, @{initData.user.username || initData.user.firstName} 👋
        </p>
      ) : (
        <p className="text-lg">❌ Пользователь не найден</p>
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
          onClick={() => miniApp.close()}
        >
          Закрыть
        </button>
      </div>

      <pre className="mt-6 text-xs bg-gray-200 p-3 rounded w-full break-all">
        {JSON.stringify(initData, null, 2)}
      </pre>
    </div>
  );
}
