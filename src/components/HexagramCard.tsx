import type { HexagramDefinition, HexagramSnapshot } from "../types/liuyao";

type HexagramCardProps = {
  title: string;
  snapshot?: HexagramSnapshot;
  definition?: HexagramDefinition;
};

function LineGlyph({ line }: { line: "yin" | "yang" }) {
  return (
    <div className="hexagram-line" aria-hidden="true">
      {line === "yang" ? (
        <div className="yang-line" />
      ) : (
        <div className="yin-line">
          <span />
          <span />
        </div>
      )}
    </div>
  );
}

export function HexagramCard({ title, snapshot, definition }: HexagramCardProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <p className="eyebrow">{title}</p>
        <h3>{definition ? `${definition.symbol} ${definition.name}` : "待生成"}</h3>
      </div>
      {snapshot && definition ? (
        <>
          <div className="hexagram-grid">
            {[...snapshot.lines].reverse().map((line, index) => (
              <LineGlyph key={`${snapshot.code}-${index}`} line={line} />
            ))}
          </div>
          <div className="code-meta">
            <span>{definition.palace}</span>
            <span>{definition.type}</span>
            <span>世 {definition.shiLine ?? "-"} / 应 {definition.yingLine ?? "-"}</span>
          </div>
          <p className="hexagram-summary">{definition.summary}</p>
          <p className="hexagram-judgment">{definition.judgment}</p>
        </>
      ) : (
        <p className="placeholder-text">完成六次投掷后自动生成。</p>
      )}
    </section>
  );
}
