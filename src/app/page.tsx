"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const tg = window?.Telegram?.WebApp;
    tg?.ready();

    console.log("Telegram initDataUnsafe:", tg?.initDataUnsafe); // <-- проверим что там есть

    if (tg?.initDataUnsafe?.user) {
      setUsername(tg.initDataUnsafe.user.username || tg.initDataUnsafe.user.first_name);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900">
      <h1 className="text-xl font-bold mb-4">🚀 Telegram Mini App</h1>
      {username ? (
        <p className="text-lg">Привет, {username} 👋</p>
      ) : (
        <p className="text-lg">Ожидание данных от Telegram...</p>
      )}
    </div>
  );
}
