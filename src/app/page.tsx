"use client";

import { useEffect, useState } from "react";

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const tg = window?.Telegram?.WebApp;
    tg?.ready();

    setData(tg?.initDataUnsafe);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900 p-4">
      <h1 className="text-xl font-bold mb-4">🚀 Telegram Mini App</h1>

      {data?.user ? (
        <p className="text-lg">Привет, @{data.user.username || data.user.first_name} 👋</p>
      ) : (
        <p className="text-lg">❌ Пользователь не найден</p>
      )}

      <pre className="mt-6 text-xs bg-gray-200 p-3 rounded w-full break-all">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
