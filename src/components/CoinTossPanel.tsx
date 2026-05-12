import type { LineRecord } from "../types/liuyao";

type CoinTossPanelProps = {
  castsLeft: number;
  latestLine?: LineRecord;
  lines: LineRecord[];
  onCast: () => void;
  onReset: () => void;
  disabled?: boolean;
};

function formatKind(kind: LineRecord["kind"]) {
  switch (kind) {
    case "old-yin":
      return "老阴";
    case "young-yang":
      return "少阳";
    case "young-yin":
      return "少阴";
    case "old-yang":
      return "老阳";
  }
}

export function CoinTossPanel({
  castsLeft,
  latestLine,
  lines,
  onCast,
  onReset,
  disabled,
}: CoinTossPanelProps) {
  return (
    <section className="panel panel-large">
      <div className="panel-header">
        <p className="eyebrow">投掷</p>
        <h2>三枚铜钱，六次成卦</h2>
      </div>

      <div className="casting-board">
        <div className="toss-stage">
          <div className="coin-row" aria-hidden="true">
            {[0, 1, 2].map((coin) => (
              <div
                key={coin}
                className={`coin ${disabled ? "coin-resting" : "coin-spinning"}`}
              />
            ))}
          </div>

          <div className="toss-meta">
            <p>剩余投掷次数：{castsLeft}</p>
            {latestLine ? (
              <p>
                最新结果：第 {latestLine.lineIndex} 爻，{formatKind(latestLine.kind)}，
                {latestLine.isMoving ? "动爻" : "静爻"}
              </p>
            ) : (
              <p>尚未开始投掷</p>
            )}
          </div>
        </div>

        <div className="casting-progress">
          <div className="progress-header">
            <span>成卦进度</span>
            <strong>{lines.length}/6</strong>
          </div>
          <ol className="progress-lines">
            {Array.from({ length: 6 }, (_, index) => {
              const lineNumber = 6 - index;
              const line = lines.find((item) => item.lineIndex === lineNumber);
              return (
                <li key={lineNumber} className={`progress-line ${line ? "filled" : ""}`}>
                  <span>{lineNumber === 6 ? "上" : lineNumber === 1 ? "初" : lineNumber}</span>
                  <span>{line ? formatKind(line.kind) : "未投掷"}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="toolbar">
        <button type="button" className="primary-button" onClick={onCast} disabled={disabled}>
          掷一次
        </button>
        <button type="button" className="secondary-button" onClick={onReset}>
          重新起卦
        </button>
      </div>

      <ol className="line-list">
        {[...lines].reverse().map((line) => (
          <li key={line.lineIndex} className="line-item">
            <span>第 {line.lineIndex} 爻</span>
            <span>{line.toss.coins.join(" / ")}</span>
            <span>合计 {line.toss.sum}</span>
            <span>{formatKind(line.kind)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
