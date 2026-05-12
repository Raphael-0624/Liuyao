import type {
  HexagramSnapshot,
  LineKind,
  LineRecord,
  ReadingInterpretation,
  TossResult,
} from "../types/liuyao";
import { resolveLineKind } from "./coins";

function kindToPolarities(kind: LineKind) {
  switch (kind) {
    case "old-yin":
      return { basePolarity: "yin" as const, changedPolarity: "yang" as const };
    case "young-yang":
      return { basePolarity: "yang" as const, changedPolarity: "yang" as const };
    case "young-yin":
      return { basePolarity: "yin" as const, changedPolarity: "yin" as const };
    case "old-yang":
      return { basePolarity: "yang" as const, changedPolarity: "yin" as const };
  }
}

export function buildLineRecord(toss: TossResult): LineRecord {
  const kind = resolveLineKind(toss.sum);
  const polarity = kindToPolarities(kind);

  return {
    lineIndex: toss.tossIndex,
    toss,
    kind,
    isMoving: kind === "old-yin" || kind === "old-yang",
    ...polarity,
  };
}

function buildSnapshot(lines: LineRecord[], changed = false): HexagramSnapshot {
  const targetLines = lines.map((line) =>
    changed ? line.changedPolarity : line.basePolarity,
  );
  const code = targetLines.map((line) => (line === "yang" ? "1" : "0")).join("");
  const lowerTrigramCode = code.slice(0, 3);
  const upperTrigramCode = code.slice(3, 6);

  return {
    code,
    lowerTrigramCode,
    upperTrigramCode,
    lines: targetLines,
  };
}

export function deriveReading(lines: LineRecord[]) {
  const movingLines = lines.filter((line) => line.isMoving).map((line) => line.lineIndex);

  return {
    baseHexagram: buildSnapshot(lines, false),
    changedHexagram: buildSnapshot(lines, true),
    movingLines,
  };
}

export function buildPlaceholderInterpretation(
  question: string,
  lines: LineRecord[],
): ReadingInterpretation {
  const movingCount = lines.filter((line) => line.isMoving).length;
  const dynamicsLabel =
    movingCount === 0 ? "静卦倾向更强" : `出现 ${movingCount} 条动爻，变化信息较强`;

  return {
    title: "结构化解读占位",
    summary: `当前已完成起卦结构与动静判断，问题为“${question || "未填写问题"}”。${dynamicsLabel}。`,
    hints: [
      "当前仅输出程序化结果：六次投掷、动爻位置、本卦与变卦编码。",
      "正式卦库已接入后，这个占位仅作为兜底。",
      "展示层已按“基础含义 / 结构信息 / 扩展解读 / AI 解读”四层预留。",
    ],
    tone: "克制、平实、偏咨询式",
    personalized: {
      overall: "当前为结构化占位解读，主要用于确认流程与展示层可用。",
      presentState: "程序已能判断动静结构，但尚未接正式卦义、六亲与六神数据。",
      trend: "数据层补齐后，可进一步生成更贴近问题语境的个性化说明。",
      advice: "现阶段先把投掷结果、卦码和问题表述固定下来，后续再接正式断语。",
    },
    missingDataNote: "最终卦名、宫位、卦辞、爻辞与断卦扩展内容暂未接入正式数据库。",
  };
}
