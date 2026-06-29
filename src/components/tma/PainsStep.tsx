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
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
        value ? "bg-[#00D1FF]" : "bg-white/10"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
          value ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

import type { HapticType } from "./types";

interface PainsStepProps {
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

export default function PainsStep({
  language,
  campaign,
  t,
  wifiSecurity,
  gamingMode,
  handleToggleWifiSecurity,
  handleToggleGamingMode,
  triggerHaptic,
  trackEvent,
}: PainsStepProps) {
  const gamingPains = [
    {
      title: language === "ru" ? "Маршрутизация провайдера" : language === "es" ? "Enrutamiento ISP" : "ISP routing",
      desc: language === "ru" ? "Высокий пинг за границей" : language === "es" ? "Ping alto en el extranjero" : "High ping abroad"
    },
    {
      title: language === "ru" ? "Блокировка игры" : language === "es" ? "Bloqueo de región" : "Region ban",
      desc: language === "ru" ? "Ранний доступ или полная блокировка" : language === "es" ? "Acceso anticipado o bloqueo total" : "Early access or complete game block"
    },
    {
      title: language === "ru" ? "Региональные ограничения" : language === "es" ? "Bloqueo regional" : "Region lock",
      desc: language === "ru" ? "Друзья в других регионах" : language === "es" ? "Amigos en otras regiones" : "Friends in other regions"
    },
    {
      title: language === "ru" ? "Открытый IP-адрес" : language === "es" ? "IP expuesta" : "Exposed IP",
      desc: language === "ru" ? "DDoS в соревновательных лобби" : language === "es" ? "DDoS en salas competitivas" : "DDoS in comp lobbies"
    }
  ];
  const gamingPainsFooter = language === "ru" ? "iGuard решает всё это" : language === "es" ? "iGuard los soluciona todos" : "iGuard handle them all";

  const adultsPains = [
    {
      reason: "# Adult-content",
      reasonRu: "# Взрослый контент",
      reasonEs: "# Contenido adulto",
      reasonDesc: "ISP / geo-filter",
      reasonDescRu: "Провайдер / гео-фильтр",
      reasonDescEs: "ISP / filtro geográfico",
      solution: "Routes around the block",
      solutionRu: "Обходит блокировку",
      solutionEs: "Rutas alrededor del bloqueo",
    },
    {
      reason: "# Subscription platforms",
      reasonRu: "# Платные платформы",
      reasonEs: "# Plataformas de suscripción",
      reasonDesc: "Payment block",
      reasonDescRu: "Блокировка оплаты",
      reasonDescEs: "Bloqueo de pago",
      solution: "Bypasses geo-restrictions",
      solutionRu: "Обходит гео-ограничения",
      solutionEs: "Supera restricciones",
    },
    {
      reason: "# Dating apps & services",
      reasonRu: "# Знакомства и сервисы",
      reasonEs: "# Apps de citas",
      reasonDesc: "Regional ban",
      reasonDescRu: "Блокировка в регионе",
      reasonDescEs: "Prohibición regional",
      solution: "Connects via unrestricted node",
      solutionRu: "Подключает через свободный узел",
      solutionEs: "Conecta mediante nodo libre",
    },
    {
      reason: "# Privacy-first messengers",
      reasonRu: "# Защищенные мессенджеры",
      reasonEs: "# Mensajería privada",
      reasonDesc: "Gov / ISP block",
      reasonDescRu: "Блокировка провайдером",
      reasonDescEs: "Bloqueo gubernamental / ISP",
      solution: "Tunnels through freely",
      solutionRu: "Свободное туннелирование",
      solutionEs: "Túneles libres",
    }
  ];

  return (
    <div className="w-full flex flex-col box-border">
      <h2 className="text-[24px] text-center text-white m-0 mb-[10px] leading-tight px-5 font-sans">
        {campaign === "gaming"
          ? (language === "ru" ? "Звучит знакомо?" : language === "es" ? "¿Te suena familiar?" : "Sound familiar?")
          : campaign === "adults"
            ? (language === "ru" ? "iGuard разблокирует абсолютно всё" : language === "es" ? "iGuard desbloquea absolutamente todo" : "iGuard unlocks all of everything")
            : t.onboarding.useCasesTitle}
      </h2>

      <p className={`text-[16px] text-center text-white/40 m-0 leading-relaxed font-sans px-5 ${
        campaign === "default" ? "mb-10" : "mb-[28px]"
      }`}>
        {campaign === "gaming"
          ? (language === "ru" ? "Это самые частые причины, почему геймеры используют iGuard:" : language === "es" ? "Estas son las razones más comunes por las que los gamers usan iGuard:" : "These are the most common reasons gamers use iGuard:")
          : campaign === "adults"
            ? (language === "ru" ? "Это самые частые причины использования iGuard. Что блокируется — ваше личное дело, а не их:" : language === "es" ? "Estas son las razones más comunes para usar iGuard. Lo que se bloquea es asunto tuyo, no de ellos:" : "These are the most common reasons people use iGuard. What gets blocked — and why it's your business, not theirs:")
            : t.onboarding.useCasesDesc}
      </p>

      {campaign === "gaming" ? (
        <div className="flex flex-col w-full">
          {gamingPains.map((pain, idx) => {
            const isLeft = idx % 2 === 0;
            const borderRadius = isLeft ? "0px 38px 38px 0px" : "38px 0px 0px 38px";

            return (
              <div
                key={idx}
                className={`w-[85%] h-[80px] relative overflow-hidden ${
                  isLeft ? "mr-auto ml-0" : "ml-auto mr-0"
                }`}
              >
                <GradientBlock
                  label=""
                  primaryColor="#FFFFFF"
                  secondaryColor="#9A9790"
                  baseColor="#12141A"
                  borderRadius={borderRadius}
                  height="100%"
                  animate={false}
                  glowIntensity={0.4}
                  borderGlow={false}
                  enableMouseTracking={false}
                  enableHoverScale={false}
                  absoluteChildren={true}
                >
                  <div className={`absolute inset-0 flex flex-col justify-center box-border text-left ${
                    isLeft ? "pl-10 pr-6" : "pl-6 pr-4"
                  }`}>
                    <span className="text-[14px] text-white/40  tracking-[1px] block mb-0.5">
                      {pain.title}
                    </span>
                    <span className="text-[16px] text-white block leading-tight font-sans">
                      {pain.desc}
                    </span>
                  </div>
                </GradientBlock>
              </div>
            );
          })}
          <div className="flex items-center gap-2.5 text-center ml-10 mt-13 text-[#666] text-[14px]">
            <svg width="13" height="9" viewBox="0 0 13 9" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.707031 4.24256L4.24257 7.7781L11.3136 0.707031" stroke="white" strokeOpacity={0.4} strokeLinecap="square" />
            </svg>
            {gamingPainsFooter}
          </div>
        </div>
      ) : campaign === "adults" ? (
        <div className="w-[390px] max-w-full mx-auto flex flex-col box-border relative p-0">
          {/* Vertical line separator */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "175px",
              width: "1.5px",
              backgroundImage: "repeating-linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 0px, rgba(255, 255, 255, 0.15) 2px, transparent 2px, transparent 8px)",
              zIndex: 10,
              pointerEvents: "none",
            }}
          />

          {/* Headers */}
          <div className="flex w-full mb-4 relative z-20">
            <div className="w-[175px] shrink-0 pl-5 pr-4 box-border text-[14px] text-brand-cyan font-semibold font-mono">
              {language === "ru" ? "Причина" : language === "es" ? "Razón" : "Reason"}
            </div>
            <div className="w-[215px] shrink-0 pl-4 pr-5 box-border text-[14px] text-brand-cyan font-semibold font-mono">
              {language === "ru" ? "Решение" : language === "es" ? "Solución" : "Solution"}
            </div>
          </div>

          {/* Rows */}
          <div className="flex flex-col gap-5 w-full">
            {adultsPains.map((pain, idx) => {
              const reason = language === "ru" ? pain.reasonRu : language === "es" ? pain.reasonEs : pain.reason;
              const desc = language === "ru" ? pain.reasonDescRu : language === "es" ? pain.reasonDescEs : pain.reasonDesc;
              const solution = language === "ru" ? pain.solutionRu : language === "es" ? pain.solutionEs : pain.solution;

              return (
                <div key={idx} className="flex flex-col w-full relative z-20">
                  {/* Cyan category header badge */}
                  <div className="flex justify-start w-full">
                    <span className="bg-brand-cyan text-black text-[14px] line-h-[95%] font-mono py-1 pl-5 pr-4 rounded-none inline-block">
                      {reason}
                    </span>
                  </div>

                  {/* Split details row */}
                  <div className="flex w-full mt-2.5 box-border">
                    {/* Left: Description */}
                    <div className="w-[175px] shrink-0 pl-5 pr-4 box-border flex items-center">
                      <span className="text-[14px] text-white font-sans leading-tight">
                        {desc}
                      </span>
                    </div>

                    {/* Right: Solution */}
                    <div className="w-[215px] shrink-0 pl-4 pr-2 box-border flex items-center">
                      <span className="text-[14px] text-white/60 font-sans leading-tight">
                        {solution}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex gap-2.5 w-full grow min-h-[350px]">
          {/* Left Column */}
          <div className="flex-1 flex flex-col gap-2.5 min-h-0">
            {/* Zoom & Calls */}
            <div className="flex-1 min-h-0 rounded-[40px] bg-brand-dark-gray p-5 py-7.5 flex flex-col box-border relative overflow-hidden">
              <span className="text-[18px] text-white block mb-1 font-sans">
                {t.onboarding.zoomCalls}
              </span>
              <span className="text-[13px] text-white/40 block font-sans">
                {t.onboarding.voipMode}
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
              className={`flex-1 min-h-0 rounded-[40px] bg-brand-dark-gray p-5 py-7.5 flex flex-col justify-between box-border ${
                wifiSecurity ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <div>
                <span className="text-[16px] text-white block mb-1 font-sans">
                  {t.onboarding.wifiSecurity}
                </span>
                <span className="text-[13px] text-white/40 block font-sans">
                  {t.onboarding.alwaysOn}
                </span>
              </div>
              <div className="flex justify-end">
                <Toggle value={wifiSecurity} onChange={handleToggleWifiSecurity} />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 flex flex-col gap-2.5 min-h-0">
            {/* Gaming mode */}
            <div
              onClick={handleToggleGamingMode}
              className={`h-[70px] rounded-[30px] bg-brand-dark-gray p-5 flex items-center justify-between box-border ${
                gamingMode ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <div className="flex flex-col max-w-[80px]">
                <span className="text-[14px] text-white font-sans">
                  {t.onboarding.gamingMode}
                </span>
              </div>
              <Toggle value={gamingMode} onChange={handleToggleGamingMode} />
            </div>

            {/* Bypass blocks */}
            <div className="flex-1 min-h-0 rounded-[40px] bg-brand-dark-gray p-5 py-7.5 flex flex-col box-border relative overflow-hidden">
              <span className="text-[16px] text-white block mb-1 font-sans z-10">
                {t.onboarding.bypassBlocks}
              </span>
              <span className="text-[13px] text-white/40 block font-sans z-10">
                {t.onboarding.serversCount}
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
                    <path opacity="0.6" d="M0 27.5H175H350" stroke="url(#paint0_linear_1_2)" strokeDasharray="1 8" />

                    <rect x="0" y="25" width="5" height="5" fill="#40D1FD" filter="url(#svg-glow)">
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
                      <linearGradient id="paint0_linear_1_2" x1="0" y1="28" x2="350" y2="28" gradientUnits="userSpaceOnUse">
                        <stop stopColor="white" stopOpacity="0" />
                        <stop offset="0.197122" stopColor="white" />
                        <stop offset="0.807705" stopColor="white" />
                        <stop offset="1" stopColor="white" stopOpacity="0" />
                      </linearGradient>
                      <filter id="svg-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="1" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>

            {/* Private browsing */}
            <div className="h-[90px] rounded-[24px] bg-brand-dark-gray p-3 px-5 flex flex-col justify-between box-border">
              <div className="flex flex-col">
                <span className="text-[16px] text-white whitespace-nowrap font-sans">
                  {t.onboarding.privateBrowsing}
                </span>
                <span className="text-[13px] text-white/40 font-sans">
                  {t.onboarding.noLog}
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
    </div>
  );
}
