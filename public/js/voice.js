import { els } from "./dom.js";
import { state } from "./state.js";
import { toast } from "./ui.js";
import { updateInputUi } from "./input.js";

// Language code → BCP-47 tag for speech recognition (common languages).
const BCP47 = {
  english: "en-US",
  bangla: "bn-BD",
  hindi: "hi-IN",
  urdu: "ur-PK",
  spanish: "es-ES",
  french: "fr-FR",
  german: "de-DE",
  italian: "it-IT",
  portuguese: "pt-BR",
  russian: "ru-RU",
  arabic: "ar-SA",
  turkish: "tr-TR",
  "chinese-simplified": "zh-CN",
  japanese: "ja-JP",
  korean: "ko-KR",
  indonesian: "id-ID",
  dutch: "nl-NL",
  polish: "pl-PL",
  vietnamese: "vi-VN",
  thai: "th-TH",
  tamil: "ta-IN",
  telugu: "te-IN",
  marathi: "mr-IN",
};

/**
 * Voice input (speech-to-text) via the Web Speech API. Falls back gracefully:
 * if the browser has no SpeechRecognition, the mic button stays hidden.
 */
export function initVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const btn = els.mic;
  if (!btn) return;
  if (!SR) {
    btn.hidden = true; // unsupported (e.g. Firefox) — no mic button
    return;
  }
  btn.hidden = false;

  let recognition = null;
  let listening = false;

  btn.addEventListener("click", () => {
    if (listening) {
      recognition?.stop();
      return;
    }
    recognition = new SR();
    const src = state.sourcePicker?.getValue();
    recognition.lang = (src && src !== "auto" && BCP47[src]) || navigator.language || "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    const base = els.input.value ? els.input.value.replace(/\s*$/, "") + " " : "";

    recognition.onstart = () => {
      listening = true;
      btn.classList.add("listening");
    };
    recognition.onend = () => {
      listening = false;
      btn.classList.remove("listening");
    };
    recognition.onerror = (e) => {
      listening = false;
      btn.classList.remove("listening");
      toast(e.error === "not-allowed" ? "Microphone permission denied" : "Voice input error");
    };
    recognition.onresult = (e) => {
      let transcript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      els.input.value = base + transcript;
      updateInputUi();
    };

    recognition.start();
  });
}
