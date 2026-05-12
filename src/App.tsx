import { useState } from "react";
import { CoinTossPanel } from "./components/CoinTossPanel";
import { HexagramCard } from "./components/HexagramCard";
import { QuestionInput } from "./components/QuestionInput";
import { ReadingSummary } from "./components/ReadingSummary";
import { generateAiInterpretation } from "./lib/api";
import { castCoins } from "./lib/coins";
import { buildLineRecord } from "./lib/hexagram";
import { buildAiInterpretationRequest, buildStructuredReading } from "./lib/reading";
import type { LineRecord, ReadingInterpretation } from "./types/liuyao";

const MAX_CASTS = 6;
const DEMO_QUESTION = "这次合作是否应该继续推进，我现在更适合主动扩张，还是先稳住节奏？";

export default function App() {
  const [question, setQuestion] = useState("");
  const [lines, setLines] = useState<LineRecord[]>([]);
  const [aiInterpretation, setAiInterpretation] = useState<ReadingInterpretation>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  const reading =
    lines.length === MAX_CASTS ? buildStructuredReading(question || DEMO_QUESTION, lines) : null;

  function handleCast() {
    if (lines.length >= MAX_CASTS) {
      return;
    }

    const toss = castCoins(lines.length + 1);
    const line = buildLineRecord(toss);
    setAiInterpretation(undefined);
    setGenerateError("");
    setLines((current) => [...current, line]);
  }

  function handleReset() {
    setLines([]);
    setAiInterpretation(undefined);
    setGenerateError("");
  }

  async function handleGenerateInterpretation() {
    if (!reading) {
      return;
    }

    setIsGenerating(true);
    setGenerateError("");

    try {
      const result = await generateAiInterpretation(buildAiInterpretationRequest(reading));
      setAiInterpretation(result);
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : "AI 解读生成失败");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Liuyao Divination</p>
          <h1>六爻问事</h1>
          <p className="hero-text">
            以六次投掷成卦，先给出结构化卦解，再补一版克制、清楚、不故弄玄虚的个性化解读。
          </p>
        </div>

        <div className="hero-stats">
          <div className="stat-card">
            <span>问题状态</span>
            <strong>{question.trim() ? "已起念" : "待落笔"}</strong>
          </div>
          <div className="stat-card">
            <span>投掷进度</span>
            <strong>
              {lines.length}/{MAX_CASTS}
            </strong>
          </div>
          <div className="stat-card">
            <span>解卦状态</span>
            <strong>{reading ? "可解" : "待成卦"}</strong>
          </div>
        </div>
      </header>

      <section className="layout-grid">
        <div className="left-column">
          <QuestionInput
            value={question}
            onChange={setQuestion}
            onUseDemo={() => setQuestion(DEMO_QUESTION)}
          />
          <CoinTossPanel
            castsLeft={MAX_CASTS - lines.length}
            latestLine={lines.at(-1)}
            lines={lines}
            onCast={handleCast}
            onReset={handleReset}
            disabled={lines.length >= MAX_CASTS}
          />
        </div>

        <div className="right-column">
          <div className="hexagram-pair">
            <HexagramCard
              title="本卦"
              snapshot={reading?.baseSnapshot}
              definition={reading?.baseHexagram}
            />
            <HexagramCard
              title="变卦"
              snapshot={reading?.changedSnapshot}
              definition={reading?.changedHexagram}
            />
          </div>
          <ReadingSummary
            reading={reading}
            interpretation={aiInterpretation}
            isGenerating={isGenerating}
            errorMessage={generateError}
            canGenerate={Boolean(reading)}
            onGenerate={handleGenerateInterpretation}
          />
        </div>
      </section>
    </main>
  );
}
