"use client";

import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import Script from "next/script";
import { Telegram } from "@twa-dev/types";



declare global {
    interface Window {
      Telegram: Telegram;
    }
  }
  
interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      WebApp.ready();

      if (WebApp.initDataUnsafe.user) {
        setUserData(WebApp.initDataUnsafe.user as UserData);
      }
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Загрузка данных...</p>
      </div>
    );
  }

  return (
    <main style={styles.container}>
        
      {/* <Script
        id="TelegramWebApp"
        src="https://telegram.org/js/telegram-web-app.js"
        onReady={() => {
          window.Telegram.WebApp.MainButton.setParams({
            text: `Hello`,
            is_visible: true,
          });
        }}
      /> */}
      <div style={styles.header}>
        <h1 style={styles.title}>👋 Добро пожаловать!</h1>
        <p style={styles.subtitle}>Ваш Telegram Mini App</p>
      </div>

      {userData ? (
        <div style={styles.userCard}>
          {/* Аватар пользователя */}
          {userData.photo_url && (
            <div style={styles.avatarContainer}>
              <img
                src={userData.photo_url}
                alt="Аватар"
                style={styles.avatar}
              />
            </div>
          )}

          {/* Основная информация */}
          <div style={styles.userInfo}>
            <h2 style={styles.userName}>
              {userData.first_name} {userData.last_name || ""}
            </h2>

            {userData.username && (
              <p style={styles.username}>@{userData.username}</p>
            )}

            <div style={styles.detailsGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>ID:</span>
                <span style={styles.detailValue}>{userData.id}</span>
              </div>

              {userData.language_code && (
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Язык:</span>
                  <span style={styles.detailValue}>
                    {userData.language_code.toUpperCase()}
                  </span>
                </div>
              )}

              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Premium:</span>
                <span
                  style={{
                    ...styles.detailValue,
                    color: userData.is_premium ? "#10b981" : "#6b7280",
                  }}
                >
                  {userData.is_premium ? "✅ Да" : "❌ Нет"}
                </span>
              </div>

              {userData.allows_write_to_pm !== undefined && (
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Доступ к ЛС:</span>
                  <span
                    style={{
                      ...styles.detailValue,
                      color: userData.allows_write_to_pm
                        ? "#10b981"
                        : "#6b7280",
                    }}
                  >
                    {userData.allows_write_to_pm
                      ? "✅ Разрешён"
                      : "❌ Запрещён"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>⚠️</div>
          <h3 style={styles.errorTitle}>Данные не доступны</h3>
          <p style={styles.errorText}>
            Запустите это приложение через Telegram для получения информации о
            пользователе
          </p>
          <button
            style={styles.telegramButton}
            // onClick={() => {
            //   WebApp.openTelegramLink("https://t.me/your_bot_username");
            // }}
          >
            Открыть в Telegram
          </button>
        </div>
      )}

      {/* Кнопка закрытия */}
      <button style={styles.closeButton} onClick={() => WebApp.close()}>
        Закрыть
      </button>
    </main>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "20px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: "500px",
    margin: "0 auto",
  },

  loadingContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "20px",
  },

  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #007aff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loadingText: {
    marginTop: "16px",
    color: "#6b7280",
    fontSize: "16px",
  },

  header: {
    textAlign: "center" as const,
    marginBottom: "30px",
  },

  title: {
    fontSize: "28px",
    fontWeight: "bold",
    margin: "0 0 ",
    color: "inherit",
  },

  subtitle: {
    fontSize: "16px",
    color: "#6b7280",
    margin: "0",
  },

  userCard: {
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
    padding: "24px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    marginBottom: "20px",
  },

  avatarContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },

  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    border: "3px solid #007aff",
    objectFit: "cover" as const,
  },

  userInfo: {
    textAlign: "center" as const,
  },

  userName: {
    fontSize: "22px",
    fontWeight: "bold",
    margin: "0 0 ",
    color: "inherit",
  },

  username: {
    fontSize: "16px",
    color: "#007aff",
    margin: "4px 0 20px",
    fontWeight: "500",
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "16px",
  },

  detailItem: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    padding: "12px",
    background: "rgba(0, 122, 255, 0.1)",
    borderRadius: "12px",
    border: "1px solid rgba(0, 122, 255, 0.2)",
  },

  detailLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: "4px",
    textTransform: "uppercase" as const,
  },

  detailValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "inherit",
  },

  errorCard: {
    background: "rgba(255, 59, 48, 0.1)",
    borderRadius: "20px",
    padding: "24px",
    textAlign: "center" as const,
    border: "1px solid rgba(255, 59, 48, 0.2)",
    marginBottom: "20px",
  },

  errorIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },

  errorTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    margin: "0 0 8px",
    color: "inherit",
  },

  errorText: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0 0 20px",
    lineHeight: "1.5",
  },

  telegramButton: {
    background: "#007aff",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },

  closeButton: {
    background: "rgba(255, 59, 48, 0.1)",
    color: "#ff3b30",
    border: "1px solid rgba(255, 59, 48, 0.2)",
    padding: "12px 24px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
    transition: "background-color 0.2s",
  },
};
