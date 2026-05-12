import { getHexagramByCode } from "../data/loadLiuyao";
import type {
  AiInterpretationRequest,
  HexagramDefinition,
  LineRecord,
  MovingLineReading,
  StructuredReading,
} from "../types/liuyao";
import { deriveReading } from "./hexagram";

function getLineLabel(line: number) {
  return ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"][line - 1] ?? `${line}爻`;
}

function getLineText(definition: HexagramDefinition, line: number) {
  return definition.lineTexts.find((item) => item.line === line);
}

function buildStructuralSummary(
  baseHexagram: HexagramDefinition,
  changedHexagram: HexagramDefinition,
  movingCount: number,
) {
  if (movingCount === 0) {
    return `本卦为${baseHexagram.name}，当前以定势为主，事情更像在原有格局里缓慢发展，重点在于看清现状而不是强行求变。`;
  }

  if (baseHexagram.binaryCode === changedHexagram.binaryCode) {
    return `本卦与变卦同归 ${baseHexagram.name}，虽然有动爻，但核心主题没有改变，说明变化更多发生在过程与节奏，而不是方向本身。`;
  }

  return `本卦为${baseHexagram.name}，变卦为${changedHexagram.name}。这表示问题不是静态判断，而是带有明显演进路径，先看眼下格局，再看后续转向。`;
}

function buildTrendSummary(
  baseHexagram: HexagramDefinition,
  changedHexagram: HexagramDefinition,
  movingLines: number[],
) {
  if (movingLines.length === 0) {
    return `没有动爻，趋势信号较收敛。${baseHexagram.name} 的卦意更值得反复咀嚼，短期不一定出现剧烈转折。`;
  }

  if (movingLines.length <= 2) {
    return `动爻不多，变化集中，说明事情并非全面翻盘，而是在关键节点上出现偏转。变卦 ${changedHexagram.name} 更像是后续走向。`;
  }

  return `动爻较多，局势变化感强，说明这件事受外部条件和内部选择双重影响，过程比结论更值得重视。`;
}

function buildAdviceSummary(
  baseHexagram: HexagramDefinition,
  changedHexagram: HexagramDefinition,
  movingLines: number[],
) {
  const baseHint = baseHexagram.divinationHints.usefulGod || baseHexagram.summary;
  const changedHint = changedHexagram.divinationHints.temperament || changedHexagram.summary;

  if (movingLines.length === 0) {
    return `先按 ${baseHexagram.name} 的卦意行事即可。重点不是追加动作，而是守住节奏、确认边界、观察时机。`;
  }

  return `行动上宜先参照本卦的处境判断，再用变卦校正方向。简化来说：先处理“现在怎么站稳”，再考虑“接下来往哪边走”。当前提示更接近：${baseHint}；后续提示更接近：${changedHint}`;
}

function buildRelationSummary(baseHexagram: HexagramDefinition) {
  const upper = baseHexagram.trigramMeaning.upper;
  const lower = baseHexagram.trigramMeaning.lower;

  return `上卦取 ${baseHexagram.upperTrigram}，偏向 ${String(upper.自然象)}、${String(upper.大意)}；下卦取 ${baseHexagram.lowerTrigram}，偏向 ${String(lower.自然象)}、${String(lower.大意)}。这组组合决定了你当前所问之事的表层表现与底层动力。`;
}

export function buildStructuredReading(
  question: string,
  lines: LineRecord[],
): StructuredReading | null {
  const derived = deriveReading(lines);
  const baseHexagram = getHexagramByCode(derived.baseHexagram.code);
  const changedHexagram = getHexagramByCode(derived.changedHexagram.code);

  if (!baseHexagram || !changedHexagram) {
    return null;
  }

  const movingLineReadings: MovingLineReading[] = derived.movingLines.map((line) => {
    const lineRecord = lines.find((item) => item.lineIndex === line)!;
    const baseLine = getLineText(baseHexagram, line);
    const changedLine = getLineText(changedHexagram, line);

    return {
      line,
      kind: lineRecord.kind,
      label: getLineLabel(line),
      baseText: baseLine?.text ?? "",
      baseInterpretation: baseLine?.interpretation ?? baseHexagram.divinationHints.lineHints[getLineLabel(line)] ?? "",
      changedText: changedLine?.text ?? "",
      changedInterpretation:
        changedLine?.interpretation ??
        changedHexagram.divinationHints.lineHints[getLineLabel(line)] ??
        "",
    };
  });

  return {
    question: question.trim(),
    baseHexagram,
    changedHexagram,
    baseSnapshot: derived.baseHexagram,
    changedSnapshot: derived.changedHexagram,
    movingLines: derived.movingLines,
    movingLineReadings,
    structuralSummary: buildStructuralSummary(
      baseHexagram,
      changedHexagram,
      derived.movingLines.length,
    ),
    trendSummary: buildTrendSummary(baseHexagram, changedHexagram, derived.movingLines),
    adviceSummary: buildAdviceSummary(baseHexagram, changedHexagram, derived.movingLines),
    relationSummary: buildRelationSummary(baseHexagram),
  };
}

export function buildAiInterpretationRequest(
  reading: StructuredReading,
): AiInterpretationRequest {
  return {
    question: reading.question,
    baseHexagram: {
      code: reading.baseSnapshot.code,
      name: reading.baseHexagram.name,
      symbol: reading.baseHexagram.symbol,
      palace: reading.baseHexagram.palace,
      palaceElement: reading.baseHexagram.palaceElement,
      summary: reading.baseHexagram.summary,
      judgment: reading.baseHexagram.judgment,
      imageText: reading.baseHexagram.imageText,
      usefulGod: reading.baseHexagram.divinationHints.usefulGod,
      temperament: reading.baseHexagram.divinationHints.temperament,
    },
    changedHexagram: {
      code: reading.changedSnapshot.code,
      name: reading.changedHexagram.name,
      symbol: reading.changedHexagram.symbol,
      palace: reading.changedHexagram.palace,
      palaceElement: reading.changedHexagram.palaceElement,
      summary: reading.changedHexagram.summary,
      judgment: reading.changedHexagram.judgment,
      imageText: reading.changedHexagram.imageText,
      usefulGod: reading.changedHexagram.divinationHints.usefulGod,
      temperament: reading.changedHexagram.divinationHints.temperament,
    },
    movingLines: reading.movingLineReadings,
    structuralSummary: reading.structuralSummary,
    trendSummary: reading.trendSummary,
    adviceSummary: reading.adviceSummary,
  };
}
