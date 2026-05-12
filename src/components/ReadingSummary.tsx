import type { ReadingInterpretation, StructuredReading } from "../types/liuyao";

type ReadingSummaryProps = {
  reading: StructuredReading | null;
  interpretation?: ReadingInterpretation;
  isGenerating: boolean;
  errorMessage?: string;
  canGenerate: boolean;
  onGenerate: () => void;
};

export function ReadingSummary({
  reading,
  interpretation,
  isGenerating,
  errorMessage,
  canGenerate,
  onGenerate,
}: ReadingSummaryProps) {
  return (
    <section className="panel panel-tall">
      <div className="panel-header">
        <p className="eyebrow">解卦</p>
        <h2>{reading ? "结构化解读与个性化解读" : "等待成卦"}</h2>
      </div>

      <div className="toolbar reading-toolbar">
        <button
          type="button"
          className="primary-button"
          disabled={!canGenerate || isGenerating}
          onClick={onGenerate}
        >
          {isGenerating ? "正在生成个性化解读" : "生成 AI 个性化解读"}
        </button>
        <span className="helper-text">AI 负责个性化表述，结构化内容始终以本地卦库为准。</span>
      </div>

      {reading ? (
        <>
          <div className="reading-sections">
            <section className="reading-section">
              <h3>卦势总览</h3>
              <p>{reading.structuralSummary}</p>
            </section>
            <section className="reading-section">
              <h3>趋势观察</h3>
              <p>{reading.trendSummary}</p>
            </section>
            <section className="reading-section">
              <h3>行动建议</h3>
              <p>{reading.adviceSummary}</p>
            </section>
            <section className="reading-section">
              <h3>上下卦关系</h3>
              <p>{reading.relationSummary}</p>
            </section>
          </div>

          <div className="moving-lines-block">
            <div className="panel-header compact">
              <p className="eyebrow">动爻</p>
              <h3>{reading.movingLines.length === 0 ? "无动爻" : `${reading.movingLines.join("、")} 爻发动`}</h3>
            </div>

            {reading.movingLineReadings.length > 0 ? (
              <div className="moving-line-list">
                {reading.movingLineReadings.map((item) => (
                  <article key={item.line} className="moving-line-card">
                    <h4>
                      {item.label} · {item.kind}
                    </h4>
                    <p>{item.baseInterpretation || item.baseText}</p>
                    {item.changedInterpretation ? (
                      <p className="muted-copy">变卦参考：{item.changedInterpretation}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="placeholder-text">
                静卦时不以动爻推动判断，重点回到本卦卦义、世应位置与现实处境。
              </p>
            )}
          </div>

          <div className="ai-reading-block">
            <div className="panel-header compact">
              <p className="eyebrow">AI 解读</p>
              <h3>{interpretation?.title ?? "尚未生成"}</h3>
            </div>

            {interpretation ? (
              <>
                <p className="summary-text">{interpretation.summary}</p>
                <div className="tag-row">
                  <span className="tag">{reading.baseHexagram.name}</span>
                  <span className="tag">{reading.changedHexagram.name}</span>
                  {interpretation.tone ? <span className="tag">语气：{interpretation.tone}</span> : null}
                </div>
                {interpretation.personalized ? (
                  <div className="reading-sections">
                    <section className="reading-section">
                      <h3>整体判断</h3>
                      <p>{interpretation.personalized.overall}</p>
                    </section>
                    <section className="reading-section">
                      <h3>当前态势</h3>
                      <p>{interpretation.personalized.presentState}</p>
                    </section>
                    <section className="reading-section">
                      <h3>趋势观察</h3>
                      <p>{interpretation.personalized.trend}</p>
                    </section>
                    <section className="reading-section">
                      <h3>行动建议</h3>
                      <p>{interpretation.personalized.advice}</p>
                    </section>
                  </div>
                ) : null}
                <ul className="hint-list">
                  {interpretation.hints.map((hint) => (
                    <li key={hint}>{hint}</li>
                  ))}
                </ul>
                {interpretation.missingDataNote ? (
                  <p className="note-box">{interpretation.missingDataNote}</p>
                ) : null}
              </>
            ) : (
              <p className="placeholder-text">
                先看结构化解卦，再按需生成一版更贴近你问题语境的个性化解读。
              </p>
            )}
          </div>

          {errorMessage ? <p className="error-box">{errorMessage}</p> : null}
        </>
      ) : (
        <>
          <p className="placeholder-text">
            起卦完成后，这里会依次出现卦势总览、动爻解释、变卦趋势，以及 AI 个性化解读。
          </p>
          {errorMessage ? <p className="error-box">{errorMessage}</p> : null}
        </>
      )}
    </section>
  );
}
