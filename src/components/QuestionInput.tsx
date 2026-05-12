import { useRef, useState } from "react";

type QuestionInputProps = {
  value: string;
  onChange: (value: string) => void;
  onUseDemo: () => void;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

export function QuestionInput({ value, onChange, onUseDemo }: QuestionInputProps) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [isListening, setIsListening] = useState(false);

  const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  const speechSupported = Boolean(Recognition);

  function handleToggleListening() {
    if (!Recognition) {
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "zh-CN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join("");

      if (transcript.trim()) {
        onChange(value ? `${value}\n${transcript.trim()}` : transcript.trim());
      }
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  return (
    <section className="panel panel-large">
      <div className="panel-header">
        <p className="eyebrow">问事</p>
        <h2>先定问题，再起一卦</h2>
      </div>
      <textarea
        className="question-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="例如：这次合作是否适合继续推进？我应该主动扩张，还是先稳住节奏？"
        rows={6}
      />
      <div className="toolbar">
        <button type="button" className="secondary-button" onClick={onUseDemo}>
          使用示例问题
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={handleToggleListening}
          disabled={!speechSupported}
        >
          {isListening ? "停止语音录入" : "语音录入"}
        </button>
        <span className="helper-text">
          {speechSupported
            ? "可直接用浏览器语音输入问题。"
            : "当前浏览器未开放语音识别接口，仍可手动输入。"}
        </span>
      </div>
    </section>
  );
}
