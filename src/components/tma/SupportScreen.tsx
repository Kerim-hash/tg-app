"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import WebApp from "@twa-dev/sdk";
import type { Translations, HapticType, Language } from "./types";

interface SupportScreenProps {
  t: Translations;
  triggerHaptic: (type: HapticType) => void;
  language: Language;
  autoOpenForm?: boolean;
  onFormClose?: () => void;
}

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px dashed rgba(255, 255, 255, 0.1)" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "16px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "none",
          border: "none",
          color: isOpen ? "#40D1FD" : "#fff",
          fontSize: "16px",
          fontWeight: 600,
          cursor: "pointer",
          textAlign: "left",
          outline: "none",
        }}
      >
        <span>{question}</span>
        <span style={{ fontSize: "16px", color: "#8A94A6", fontWeight: 400 }}>
          {isOpen ? "−" : "+"}
        </span>
      </button>
      <div
        style={{
          maxHeight: isOpen ? "200px" : "0",
          overflow: "hidden",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          fontSize: "14px",
          color: "#fff",
          lineHeight: 1.5,
          paddingBottom: isOpen ? "16px" : "0",
        }}
      >
        {answer}
      </div>
    </div>
  );
};

const FORM_T = {
  en: {
    writeToSupport: "Write to Support",
    fillForm: "Fill out the form below to submit a request directly to our support team.",
    emailLabel: "Email address",
    emailPlaceholder: "example@domain.com",
    subjectLabel: "Subject",
    subjectPlaceholder: "How can we help you?",
    descLabel: "Description",
    descPlaceholder: "Provide as much detail as possible about your inquiry...",
    send: "Send Request",
    sending: "Sending...",
    successTitle: "Request Received!",
    successDesc: (email: string) => `Thank you! Your support request has been successfully registered directly in Intercom. Our team will contact you at ${email} shortly.`,
    sendAnother: "Send Another Request",
    errEmail: "Please enter a valid email address.",
    errSubject: "Subject must be at least 3 characters.",
    errDesc: "Description must be at least 10 characters.",
    errSubmit: "Failed to submit ticket. Please try again later.",
    errNetwork: "Could not connect to the server. Please check your connection."
  },
  ru: {
    writeToSupport: "Написать в поддержку",
    fillForm: "Заполните форму ниже, чтобы отправить обращение напрямую в нашу службу поддержки.",
    emailLabel: "Электронная почта",
    emailPlaceholder: "example@domain.com",
    subjectLabel: "Тема обращения",
    subjectPlaceholder: "С чем вам помочь?",
    descLabel: "Описание проблемы",
    descPlaceholder: "Опишите ваш запрос максимально подробно...",
    send: "Отправить запрос",
    sending: "Отправка...",
    successTitle: "Обращение принято!",
    successDesc: (email: string) => `Спасибо! Ваше обращение успешно зарегистрировано в системе поддержки Intercom. Наша команда ответит вам на адрес ${email} в ближайшее время.`,
    sendAnother: "Отправить другое обращение",
    errEmail: "Пожалуйста, введите корректный email.",
    errSubject: "Тема должна содержать не менее 3 символов.",
    errDesc: "Описание должно содержать не менее 10 символов.",
    errSubmit: "Не удалось отправить обращение. Пожалуйста, попробуйте позже.",
    errNetwork: "Не удалось связаться с сервером. Пожалуйста, проверьте подключение."
  },
  es: {
    writeToSupport: "Escribir al Soporte",
    fillForm: "Complete el formulario a continuación para enviar un ticket directamente a nuestro equipo de soporte.",
    emailLabel: "Correo electrónico",
    emailPlaceholder: "ejemplo@dominio.com",
    subjectLabel: "Asunto",
    subjectPlaceholder: "¿Cómo podemos ayudarte?",
    descLabel: "Descripción",
    descPlaceholder: "Proporcione tantos detalles como sea posible sobre su consulta...",
    send: "Enviar Solicitud",
    sending: "Enviando...",
    successTitle: "¡Solicitud Recibida!",
    successDesc: (email: string) => `¡Gracias! Su solicitud de soporte se ha registrado con éxito directamente en Intercom. Nuestro equipo se pondrá en contacto con usted en ${email} en breve.`,
    sendAnother: "Enviar Otra Solicitud",
    errEmail: "Por favor, introduce una dirección de correo válida.",
    errSubject: "El asunto debe tener al menos 3 caracteres.",
    errDesc: "La descripción debe tener al menos 10 caracteres.",
    errSubmit: "Error al enviar la solicitud. Por favor, inténtelo de nuevo más tarde.",
    errNetwork: "No se pudo conectar al servidor. Por favor, compruebe su conexión."
  }
};

export default function SupportScreen({ t, triggerHaptic, language, autoOpenForm, onFormClose }: SupportScreenProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (autoOpenForm) {
      setIsFormOpen(true);
    }
  }, [autoOpenForm]);

  const closeForm = () => {
    setIsFormOpen(false);
    setIsSuccess(false);
    setErrorMsg("");
    onFormClose?.();
  };

  // Form states
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ email?: string; subject?: string; description?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const langKey = (language === "ru" || language === "es") ? language : "en";
  const ft = FORM_T[langKey];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mainEl = document.querySelector("main");
    if (!mainEl) return;
    if (isFormOpen) {
      mainEl.style.overflowY = "hidden";
    } else {
      mainEl.style.overflowY = "auto";
    }
    return () => {
      mainEl.style.overflowY = "auto";
    };
  }, [isFormOpen]);

  const validate = () => {
    const newErrors: typeof errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      newErrors.email = ft.errEmail;
    }
    if (!subject || subject.trim().length < 3) {
      newErrors.subject = ft.errSubject;
    }
    if (!description || description.trim().length < 10) {
      newErrors.description = ft.errDesc;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setErrorMsg("");
    triggerHaptic("medium");

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subject, description }),
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        triggerHaptic("success");
        setIsSuccess(true);
        // Clear fields on success
        setSubject("");
        setDescription("");
      } else {
        triggerHaptic("warning");
        setErrorMsg(resData.error || ft.errSubmit);
      }
    } catch {
      triggerHaptic("warning");
      setErrorMsg(ft.errNetwork);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "14px",
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    fontFamily: "var(--font-onest), sans-serif",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: 600,
    color: "#8A94A6",
    display: "block",
    marginBottom: "6px",
    textAlign: "left",
    fontFamily: "var(--font-onest), sans-serif",
  };

  return (
    <div
      style={{
        padding: "50px 16px 40px",
        display: "flex",
        flexDirection: "column",
        gap: "28px",
        fontFamily: "var(--font-onest), sans-serif",
      }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes drawerSlideUp {
            from { transform: translate(-50%, 100%); }
            to { transform: translate(-50%, 0); }
          }
          @keyframes backdropFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-drawer {
            animation: drawerSlideUp 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-backdrop {
            animation: backdropFadeIn 0.3s ease forwards;
          }
          @keyframes tma-spin { to { transform: rotate(360deg); } }
        `,
      }} />

      {/* Nav title */}
      <p
        style={{
          textAlign: "center",
          fontSize: "14px",
          fontFamily: "JetBrains Mono",
          color: "#40D1FD",
          margin: 0,
        }}
      >
        {t.support.title}
      </p>

      {/* Header heading */}
      <h1
        style={{
          fontSize: "24px",
          textAlign: "center",
          color: "#fff",
          lineHeight: 1.2,
          marginBottom: "32px",
        }}
      >
        {t.support.subtitle}
      </h1>

      {/* Categories */}
      <div style={{ display: "flex", flexDirection: "column", gap: "60px" }}>

        {/* Category 1: Subscription */}
        <div>
          <h2 style={{ fontSize: "24px", color: "#fff", margin: "0 0 30px", textAlign: "center" }}>
            {t.support.subscription}
          </h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <FAQItem question={t.support.subQ1} answer={t.support.subA1} />
            <FAQItem question={t.support.subQ2} answer={t.support.subA2} />
            <FAQItem question={t.support.subQ3} answer={t.support.subA3} />
          </div>
        </div>

        {/* Category 2: Policy */}
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: "0 0 8px", textAlign: "center" }}>
            {t.support.policy}
          </h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <FAQItem question={t.support.polQ1} answer={t.support.polA1} />
            <FAQItem question={t.support.polQ2} answer={t.support.polA2} />
            <FAQItem question={t.support.polQ3} answer={t.support.polA3} />
          </div>
        </div>

        {/* Category 3: Troubleshooting */}
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: "0 0 8px", textAlign: "center" }}>
            {t.support.troubleshooting}
          </h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <FAQItem question={t.support.trQ1} answer={t.support.trA1} />
            <FAQItem question={t.support.trQ2} answer={t.support.trA2} />
            <FAQItem question={t.support.trQ3} answer={t.support.trA3} />
          </div>
        </div>

      </div>

      {/* Bottom support box */}
      <div
        style={{
          marginTop: "32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: "24px", color: "#fff" }}>
          {t.guide.needHelp}
        </span>
        <button
          onClick={() => {
            triggerHaptic("light");
            setIsFormOpen(true);
          }}
          style={{
            padding: "13px 15px",
            borderRadius: "14px",
            background: "#FFFFFF",
            border: "none",
            color: "#000000",
            fontSize: "14px",
            letterSpacing: "0.05em",
            alignSelf: "center",
            cursor: "pointer",
            outline: "none",
            textTransform: "uppercase",
            fontFamily: "JetBrains Mono, monospace",
            transition: "all 0.25s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M13.1836 2.9538C13.9088 2.64842 14.6864 3.2617 14.5583 4.03816L13.0457 13.2093C12.8998 14.0936 11.9286 14.601 11.1174 14.1603C10.4385 13.7916 9.4313 13.224 8.52356 12.6309C8.07029 12.3347 6.68236 11.385 6.85296 10.7089C6.99883 10.1308 9.33209 7.9589 10.6654 6.66724C11.1892 6.15986 10.9506 5.86674 10.3321 6.3339C8.7977 7.49277 6.33424 9.2547 5.5196 9.75057C4.80085 10.188 4.42557 10.2627 3.97794 10.188C3.16052 10.0518 2.40267 9.8409 1.78395 9.58444C0.947702 9.23777 0.988435 8.08857 1.78338 7.7539L13.1836 2.9538Z" fill="black" />
          </svg>

          {t.guide.contactSupport}
        </button>
      </div>

      {/* ─── CONTACT FORM BOTTOM SHEET ────────────────────────────────────────── */}
      {isFormOpen && mounted && createPortal(
        <>
          <div
            onClick={() => {
              if (!isSubmitting) {
                closeForm();
              }
            }}
            className="animate-backdrop"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              zIndex: 200,
            }}
          />
          <div
            className="animate-drawer"
            style={{
              position: "fixed",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              maxWidth: "480px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#000",
              border: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "none",
              borderRadius: "32px 32px 0 0",
              padding: "24px 20px 32px",
              zIndex: 210,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Drag handle */}
            <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.15)", margin: "0 auto 4px" }} />

            {!isSuccess ? (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ textAlign: "center", marginBottom: "8px" }}>
                  <h2 style={{ fontSize: "20px", color: "#fff", margin: "0 0 6px" }}>
                    {ft.writeToSupport}
                  </h2>
                  <p style={{ fontSize: "13px", color: "#8A94A6", margin: 0, lineHeight: 1.4 }}>
                    {ft.fillForm}
                  </p>
                </div>

                {errorMsg && (
                  <div style={{ padding: "12px", borderRadius: "12px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#EF4444", fontSize: "13px", textAlign: "left" }}>
                    {errorMsg}
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label htmlFor="support-email" style={labelStyle}>{ft.emailLabel}</label>
                  <input
                    id="support-email"
                    type="email"
                    placeholder={ft.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      ...inputStyle,
                      border: errors.email ? "1px solid #EF4444" : inputStyle.border
                    }}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <span style={{ fontSize: "11px", color: "#EF4444", display: "block", marginTop: "4px", textAlign: "left" }}>
                      {errors.email}
                    </span>
                  )}
                </div>

                {/* Subject Input */}
                <div>
                  <label htmlFor="support-subject" style={labelStyle}>{ft.subjectLabel}</label>
                  <input
                    id="support-subject"
                    type="text"
                    placeholder={ft.subjectPlaceholder}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    style={{
                      ...inputStyle,
                      border: errors.subject ? "1px solid #EF4444" : inputStyle.border
                    }}
                    disabled={isSubmitting}
                  />
                  {errors.subject && (
                    <span style={{ fontSize: "11px", color: "#EF4444", display: "block", marginTop: "4px", textAlign: "left" }}>
                      {errors.subject}
                    </span>
                  )}
                </div>

                {/* Description Input */}
                <div>
                  <label htmlFor="support-description" style={labelStyle}>{ft.descLabel}</label>
                  <textarea
                    id="support-description"
                    placeholder={ft.descPlaceholder}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    style={{
                      ...inputStyle,
                      minHeight: "100px",
                      resize: "none",
                      border: errors.description ? "1px solid #EF4444" : inputStyle.border
                    }}
                    disabled={isSubmitting}
                  />
                  {errors.description && (
                    <span style={{ fontSize: "11px", color: "#EF4444", display: "block", marginTop: "4px", textAlign: "left" }}>
                      {errors.description}
                    </span>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "14px",
                    background: "#FFFFFF",
                    border: "none",
                    color: "#000000",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    outline: "none",
                    marginTop: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    fontFamily: "var(--font-onest), sans-serif",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div
                        style={{
                          width: "14px",
                          height: "14px",
                          border: "2px solid rgba(0,0,0,0.1)",
                          borderTop: "2px solid #000",
                          borderRadius: "50%",
                          animation: "tma-spin 0.8s linear infinite",
                        }}
                      />
                      {ft.sending}
                    </>
                  ) : (
                    ft.send
                  )}
                </button>
              </form>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", padding: "10px 0 20px", textAlign: "center" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.2)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", color: "#22C55E" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <h2 style={{ fontSize: "20px", color: "#fff", margin: "0 0 6px" }}>
                    {ft.successTitle}
                  </h2>
                  <p style={{ fontSize: "14px", color: "#8A94A6", margin: 0, lineHeight: 1.5, maxWidth: "340px" }}>
                    {ft.successDesc(email)}
                  </p>
                </div>
                <button
                  onClick={() => setIsSuccess(false)}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "14px",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    outline: "none",
                    fontFamily: "var(--font-onest), sans-serif",
                  }}
                >
                  {ft.sendAnother}
                </button>
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
