"use client";

import type { Translations } from "./types";
import { trackEvent } from "../../lib/mixpanel";
import Popup, { PopupButton, PopupTitle } from "./Popup";

interface ErrorScreenProps {
  t: Translations;
  onRetry: () => void;
  /** Optional explanation under the title (auth errors); payment errors show only the title */
  desc?: string;
  /** When given, the pop-up gets an X button and can be dismissed */
  onClose?: () => void;
}

// Figma "Smth gone wrong :(" pop-up: title + TRY AGAIN
export default function ErrorScreen({ t, onRetry, desc, onClose }: ErrorScreenProps) {
  return (
    <Popup open onClose={onClose}>
      <PopupTitle>{t.error.title}</PopupTitle>

      {desc && (
        <p style={{ fontSize: "14px", lineHeight: "20px", color: "#8A94A6", margin: 0, textAlign: "center" }}>
          {desc}
        </p>
      )}

      <PopupButton
        onClick={() => {
          trackEvent("try_again_tapped", { attempt_number: 1 });
          onRetry();
        }}
      >
        {t.error.tryAgain}
      </PopupButton>
    </Popup>
  );
}
