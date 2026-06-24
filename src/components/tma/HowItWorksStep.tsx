"use client";

import React from "react";
import GradientBlock from "../GradientBlock";

interface ToggleProps {
  value: boolean;
  onChange: () => void;
}

function Toggle({ value, onChange }: ToggleProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      aria-checked={value}
      role="switch"
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${value ? "bg-[#00D1FF]" : "bg-white/10"
        }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${value ? "translate-x-5" : "translate-x-0"
          }`}
      />
    </button>
  );
}

import type { HapticType } from "./types";

interface HowItWorksStepProps {
  language: string;
  campaign: string;
  t: any;
  wifiSecurity: boolean;
  gamingMode: boolean;
  handleToggleWifiSecurity: () => void;
  handleToggleGamingMode: () => void;
  triggerHaptic: (type: HapticType) => void;
  trackEvent: (eventName: string, params?: any) => void;
}

export default function HowItWorksStep({
  language,
  campaign,
  t,
  wifiSecurity,
  gamingMode,
  handleToggleWifiSecurity,
  handleToggleGamingMode,
  triggerHaptic,
  trackEvent,
}: HowItWorksStepProps) {
  const adultsCapsules = [
    {
      label: language === "ru" ? "Ваш IP-адрес" : language === "es" ? "Tu dirección IP" : "Your IP address",
      value: language === "ru" ? "Заменен на IP-адрес VPN" : language === "es" ? "Reemplazada por IP del servidor" : "Replaced with VPN server IP",
      isLeft: true,
    },
    {
      label: language === "ru" ? "Логи трафика провайдера" : language === "es" ? "Registros de tráfico del ISP" : "ISP traffic logs",
      value: language === "ru" ? "Провайдер видит только шифрованный туннель" : language === "es" ? "El ISP solo ve un túnel cifrado" : "ISP sees only encrypted tunnel",
      isLeft: false,
    },
    {
      label: language === "ru" ? "Утечки истории браузера" : language === "es" ? "Fugas del historial" : "Browser history leaks",
      value: language === "ru" ? "Весь DNS идет через VPN" : language === "es" ? "Todo el DNS se enruta por la VPN" : "All DNS routed through VPN",
      isLeft: true,
    },
    {
      label: language === "ru" ? "Цифровой отпечаток устройства" : language === "es" ? "Huella digital" : "Device fingerprinting",
      value: language === "ru" ? "Местоположение скрыто сервером" : language === "es" ? "Ubicación oculta por el servidor" : "Location masked by server",
      isLeft: false,
    },
  ];

  return (
    <div className="w-full flex flex-col box-border">
      <h2 className={`text-[24px]  text-center text-white m-0 mb-[10px] leading-tight font-sans ${campaign === "adults" ? "px-5" : ""
        } ${campaign === "gaming" ? "max-w-[300px] mx-auto" : ""}`}>
        {campaign === "gaming"
          ? (language === "ru" ? "Никаких зависаний. Без логов. Без драмы" : language === "es" ? "Sin ralentizaciones. Sin registros. Sin dramas" : "No slowdowns. No logs. No drama")
          : (language === "ru" ? "Никто не знает, что вы делаете. В этом и суть" : language === "es" ? "Nadie sabe lo que haces. Ese es el punto" : "Nobody knows what you're doing. That's the point")}
      </h2>

      <p className={`text-[16px] text-center text-white/40 m-0 mb-6 leading-relaxed font-sans ${campaign === "adults" ? "px-5" : ""
        }`}>
        {campaign === "gaming"
          ? (language === "ru" ? "iGuard маршрутизирует ваш трафик умнее" : language === "es" ? "iGuard enruta tu tráfico de manera más inteligente" : "iGuard routes your traffic smarter")
          : (language === "ru" ? "Без логов. Без истории. Невозможно отследить вас:" : language === "es" ? "Sin registros. Sin historial. Sin forma de rastrearte:" : "No logs. No history. No way to trace it back to you:")}
      </p>

      {campaign === "adults" ? (
        <div className="flex flex-col  w-full">
          {adultsCapsules.map((item, idx) => {
            const borderRadius = item.isLeft ? "0px 38px 38px 0px" : "38px 0px 0px 38px";

            return (
              <div
                key={idx}
                className={`w-[82%] h-[76px] relative overflow-hidden ${item.isLeft ? "ml-0 mr-auto" : "mr-0 ml-auto"
                  }`}
              >
                <GradientBlock
                  label=""
                  primaryColor="#FFFFFF"
                  secondaryColor="#9A9790"
                  baseColor="#12141A"
                  borderRadius={borderRadius}
                  height="100%"
                  animate={true}
                  glowIntensity={0.2}
                  borderGlow={false}
                  enableMouseTracking={false}
                  enableHoverScale={false}
                  absoluteChildren={true}
                >
                  <div className={`absolute inset-0 flex flex-col justify-center box-border text-left ${item.isLeft ? "pl-9 pr-6" : "pl-6 pr-9"
                    }`}>
                    <span className="text-[14px] text-brand-gray font-mono mb-0.5">
                      {item.label}
                    </span>
                    <span className="text-[16px] text-white  font-sans">
                      {item.value}
                    </span>
                  </div>
                </GradientBlock>
              </div>
            );
          })}

          <div className="flex items-center gap-2.5 text-left mt-4 text-white/40 text-[13px] font-sans leading-tight px-5 box-border">
            <svg width="13" height="9" viewBox="0 0 13 9" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.707031 4.24256L4.24257 7.7781L11.3136 0.707031" stroke="white" strokeOpacity="0.4" strokeLinecap="square" />
            </svg>

            <span>
              {language === "ru"
                ? "iGuard не сохраняет никаких логов. Нечего передавать, никогда"
                : language === "es"
                  ? "iGuard no guarda registros de actividad. Nada que entregar, nunca"
                  : "iGuard keeps zero activity logs. Nothing to hand over, ever"}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex gap-2.5 w-full grow min-h-[350px]">
          {/* Left Column */}
          <div className="flex-1 flex flex-col gap-2.5 min-h-0">
            {/* WireGuard protocol */}
            <div className="flex-1 min-h-0 rounded-[40px] bg-brand-dark-gray p-5 py-7.5 flex flex-col box-border relative overflow-hidden">
              <span className="text-[18px] text-white block mb-1 font-sans">
                {language === "ru" ? "Протокол WireGuard" : language === "es" ? "Protocolo WireGuard" : "WireGuard protocol"}
              </span>
              <span className="text-[13px] text-white/40 block font-sans">
                {language === "ru" ? "Самый быстрый на сегодня" : language === "es" ? "El más rápido hoy" : "Fastest available today"}
              </span>

              {/* Dot signal/voip animation */}
              <div className="relative w-full h-5 mt-auto flex items-center">
                <div className="w-full h-[2px] bg-[repeating-linear-gradient(to_right,rgba(255,255,255,0.2)_0px,rgba(255,255,255,0.2)_2px,transparent_2px,transparent_8px)]" />
                <div className="absolute w-1 h-3 bg-brand-cyan shadow-[0_0_8px_#00D1FF] animate-[voip-pulse_3s_ease-in-out_infinite]" />
              </div>
            </div>

            {/* Wi-Fi security */}
            <div
              onClick={handleToggleWifiSecurity}
              className={`flex-1 min-h-0 rounded-[40px] bg-brand-dark-gray p-5 py-7.5 flex flex-col justify-between box-border ${wifiSecurity ? "cursor-default" : "cursor-pointer"
                }`}
            >
              <div>
                <span className="text-[16px] text-white block mb-1 font-sans">
                  {language === "ru" ? "Скрывает ваш IP" : language === "es" ? "Oculta tu IP real" : "Hides your real IP"}
                </span>
                <span className="text-[13px] text-white/40 block leading-tight font-sans">
                  {language === "ru" ? "Защита от DDoS и отслеживания" : language === "es" ? "Nadie puede hacer DDoS ni rastrearte" : "No one can DDoS or track you mid-match"}
                </span>
              </div>
              <div className="flex justify-end">
                <Toggle value={true} onChange={() => { }} />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 flex flex-col gap-2.5 min-h-0">
            {/* Gaming mode */}
            <div
              onClick={handleToggleGamingMode}
              className={`h-[70px] rounded-[30px] bg-brand-dark-gray p-5 flex items-center justify-between box-border ${gamingMode ? "cursor-default" : "cursor-pointer"
                }`}
            >
              <div className="flex flex-col max-w-[120px]">
                <span className="text-[14px] text-white font-sans">
                  {language === "ru" ? "Без логов активности" : language === "es" ? "Sin registros de actividad" : "No activity logs"}
                </span>
              </div>
              <Toggle value={gamingMode} onChange={handleToggleGamingMode} />
            </div>

            {/* Bypass blocks */}
            <div className="flex-1 min-h-0 rounded-[40px] bg-brand-dark-gray p-5 py-7.5 flex flex-col box-border relative overflow-hidden">
              <span className="text-[16px] text-white block mb-1 font-sans z-10">
                {language === "ru" ? "Узлы с низким пингом" : language === "es" ? "Nodos de baja latencia" : "Low-latency nodes"}
              </span>
              <span className="text-[13px] text-white/40 block font-sans z-10">
                {language === "ru" ? "Меньше задержек, больше стабильности" : language === "es" ? "Menos lag, conexión stable" : "Less lag, more stable connection"}
              </span>

              {/* Decorative arches and background SVG */}
              <div className="relative w-full h-5 mt-auto flex items-center">
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                  <svg width="156" height="30" viewBox="0 0 156 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M85 27.5C85 12.5883 97.0883 0.5 112 0.5C126.912 0.5 139 12.5883 139 27.5" stroke="white">
                      <animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" repeatCount="indefinite" />
                    </path>
                    <path d="M47 27.5C47 17.0066 55.5066 8.5 66 8.5C76.4934 8.5 85 17.0066 85 27.5" stroke="white" strokeOpacity="0.4">
                      <animate attributeName="strokeOpacity" values="0.15;0.6;0.15" dur="3s" repeatCount="indefinite" />
                    </path>
                    <path opacity="0.6" d="M0 27.5H175H350" stroke="url(#paint0_linear_1_3)" strokeDasharray="1 8" />

                    <rect x="0" y="25" width="5" height="5" fill="#40D1FD" filter="url(#svg-glow-hw)">
                      <animate attributeName="x" values="0;150;0" dur="3s" repeatCount="indefinite" />
                    </rect>

                    <rect x="44" y="24.5" width="5" height="5" fill="#40D1FD">
                      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.6s" repeatCount="indefinite" />
                    </rect>
                    <rect x="82" y="24.5" width="5" height="5" fill="#40D1FD">
                      <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite" />
                    </rect>
                    <rect x="136" y="24.5" width="5" height="5" fill="#40D1FD">
                      <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
                    </rect>

                    <rect x="127" y="25.5" width="3" height="3" fill="#535353" />
                    <rect x="91" y="25.5" width="3" height="3" fill="#535353" />
                    <rect x="35" y="25.5" width="3" height="3" fill="#535353" />

                    <defs>
                      <linearGradient id="paint0_linear_1_3" x1="0" y1="28" x2="350" y2="28" gradientUnits="userSpaceOnUse">
                        <stop stopColor="white" stopOpacity="0" />
                        <stop offset="0.197122" stopColor="white" />
                        <stop offset="0.807705" stopColor="white" />
                        <stop offset="1" stopColor="white" stopOpacity="0" />
                      </linearGradient>
                      <filter id="svg-glow-hw" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="1" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
            <div className="h-[90px] rounded-[30px] bg-brand-dark-gray p-3 px-5 flex flex-col justify-between box-border">
              <div className="flex flex-col">
                <span className="text-[14px] text-white  font-sans">
                  {language === "ru" ? "Обходит региональные блоки" : language === "es" ? "Bypasses regional blocks" : "Bypasses regional blocks"}
                </span>
              </div>
              <div className="flex items-center justify-end w-full h-5">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.0013 18.3334C14.6037 18.3334 18.3346 14.6025 18.3346 10.0001C18.3346 5.39771 14.6037 1.66675 10.0013 1.66675C5.39893 1.66675 1.66797 5.39771 1.66797 10.0001C1.66797 14.6025 5.39893 18.3334 10.0013 18.3334Z" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M1.66797 10H18.3346" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10.0013 1.66675C12.0857 3.94871 13.2703 6.91011 13.3346 10.0001C13.2703 13.0901 12.0857 16.0515 10.0013 18.3334C7.9169 16.0515 6.73234 13.0901 6.66797 10.0001C6.73234 6.91011 7.9169 3.94871 10.0013 1.66675V1.66675Z" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {campaign === "gaming" && (
        <div className="flex items-center justify-center gap-1.5 mt-6 text-white/30 text-[12px] font-sans">
          <div className="flex gap-2 items-center">
            <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M6.9426 1.91574C7.38004 1.40874 7.67491 0.702595 7.59422 0C6.96383 0.0240002 6.20118 0.402692 5.74917 0.90909C5.34327 1.35849 4.98895 2.07656 5.0842 2.76536C5.7874 2.81755 6.50515 2.42333 6.9426 1.91574ZM8.51947 6.37506C8.53706 8.19125 10.1819 8.79541 10.2001 8.80321C10.1867 8.84581 9.93738 9.66406 9.33369 10.5101C8.8113 11.2409 8.2695 11.9687 7.41584 11.9843C6.57735 11.9993 6.30736 11.5079 5.34813 11.5079C4.3895 11.5079 4.08978 11.9686 3.29619 11.9992C2.47226 12.0286 1.8443 11.2086 1.31827 10.4802C0.241943 8.99038 -0.580166 6.27011 0.52407 4.43412C1.07255 3.52273 2.0524 2.9447 3.1166 2.9303C3.92536 2.9153 4.68923 3.45179 5.18371 3.45179C5.67818 3.45179 6.60647 2.80679 7.58208 2.90159C7.99041 2.91779 9.13711 3.05934 9.87307 4.09193C9.81361 4.12733 8.50491 4.85707 8.51947 6.37506Z" fill="white" fillOpacity="0.4" />
            </svg>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M5.48752 6.26045C5.49053 7.45979 5.49414 9.49752 5.49714 11.0813C7.66556 11.3745 9.83399 11.6768 11.9988 12C11.9988 10.1092 12.0012 8.22674 11.9988 6.42773C9.82857 6.42773 7.65895 6.26045 5.48752 6.26045ZM0 6.26104V10.333C1.63549 10.5537 3.27098 10.7646 4.90346 11.0057C4.90647 9.43033 4.90226 7.85454 4.90226 6.2792C3.26797 6.2822 1.63429 6.25564 0 6.26104ZM0 1.70596V5.7665C1.63549 5.7707 3.27098 5.74595 4.90647 5.74775C4.90526 4.17602 4.90526 2.60621 4.90346 1.03447C3.26677 1.23896 1.63008 1.4553 0 1.70596ZM12 5.68301C9.83278 5.6914 7.66556 5.72445 5.49714 5.73105C5.49594 4.13353 5.49594 2.53792 5.49714 0.941602C7.66135 0.611182 9.83038 0.300432 11.9988 0 12 1.89496 11.9988 3.78805 12 5.68301Z" fill="white" fillOpacity="0.4" />
            </svg>
            <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.96378 3.94923H8.31038V9.12102C8.31038 9.42826 8.06128 9.67735 7.75442 9.67735H7.11872V11.2524C7.11872 11.6524 6.79969 11.9766 6.40587 11.9766C6.01104 11.9766 5.69248 11.6524 5.69248 11.2524V9.67735H4.58222V11.2524C4.58222 11.6524 4.26255 11.9766 3.86876 11.9766C3.47503 11.9766 3.15539 11.6524 3.15539 11.2524V9.67735H2.52026C2.21332 9.67735 1.96376 9.42826 1.96376 9.12102L1.96378 3.94923ZM0.72007 3.90702C0.322242 3.90702 0 4.23427 0 4.63827V7.49616C0 7.89969 0.322242 8.22751 0.72007 8.22751C1.11797 8.22751 1.44014 7.89969 1.44014 7.49616V4.63827C1.44014 4.23427 1.11797 3.90702 0.72007 3.90702ZM8.3104 3.42807H1.96378C2.04211 2.5239 2.62863 1.74582 3.47297 1.29531L2.86955 0.409274C2.78817 0.28979 2.81888 0.126759 2.93859 0.0454072C3.05817 -0.0359443 3.22088 -0.00500681 3.30265 0.114384L3.96033 1.08076C4.32497 0.954665 4.72078 0.882267 5.13708 0.882267C5.55387 0.882267 5.9497 0.954665 6.31432 1.08092L6.972 0.114735C7.05277 -0.00498338 7.21599 -0.0359209 7.33556 0.0454307C7.45528 0.126782 7.48598 0.289813 7.40461 0.409298L6.80168 1.29533C7.64599 1.74556 8.23212 2.52364 8.3104 3.42807ZM4.14954 2.1995C4.14954 2.0056 3.99253 1.84834 3.7987 1.84834C3.60438 1.84834 3.44738 2.0056 3.44738 2.1995C3.44738 2.39331 3.6049 2.5505 3.7987 2.5505C3.99251 2.5505 4.14954 2.39331 4.14954 2.1995ZM6.87127 2.1995C6.87127 2.0056 6.71372 1.84834 6.51994 1.84834C6.32562 1.84834 6.16908 2.0056 6.16908 2.1995C6.16908 2.39331 6.32562 2.5505 6.51994 2.5505C6.71374 2.5505 6.87127 2.39331 6.87127 2.1995ZM9.55458 3.90601C9.15717 3.90601 8.83402 4.23376 8.83402 4.63777V7.49668C8.83402 7.9007 9.15717 8.22854 9.55458 8.22854C9.9525 8.22854 10.2741 7.90072 10.2741 7.49668V4.63777C10.2742 4.23376 9.9525 3.90601 9.55458 3.90601Z" fill="white" fillOpacity="0.4" />
            </svg>
          </div>
          | {language === "ru" ? "Работает на iOS, Android, macOS, Windows" : language === "es" ? "Funciona en iOS, Android, macOS, Windows" : "Works on iOS, Android, macOS, Windows"}
        </div>
      )}
    </div>
  );
}
