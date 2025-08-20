"use client";

import { useEffect, useState } from "react";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import Image from "next/image";

export default function Home() {
  const [isReady, setIsReady] = useState(false);
  const launchParams = useLaunchParams();

  useEffect(() => {
    if (launchParams) {
      setIsReady(true);
    }
  }, [launchParams]);

  if (!isReady) return <p>Инициализация Telegram SDK...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">🚀 Telegram Mini App</h1>
      <p className="text-lg">
        Привет,{" "}
        {launchParams.tgWebAppData?.user?.first_name ||
          launchParams.tgWebAppData?.user?.id ||
          "Гость"}{" "}
        👋
      </p>
      <Image src={launchParams.tgWebAppData?.user?.photo_url as string} alt="user" width={50} height={50} />
      <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
        Закрыть приложение
      </button>
    </div>
  );
}
