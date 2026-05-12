export type CoinFace = "yin" | "yang";

export type TossResult = {
  tossIndex: number;
  coins: CoinFace[];
  sum: 6 | 7 | 8 | 9;
};

export type LineKind = "old-yin" | "young-yang" | "young-yin" | "old-yang";

export type LineRecord = {
  lineIndex: number;
  toss: TossResult;
  kind: LineKind;
  isMoving: boolean;
  basePolarity: "yin" | "yang";
  changedPolarity: "yin" | "yang";
};

export type HexagramSnapshot = {
  code: string;
  upperTrigramCode: string;
  lowerTrigramCode: string;
  lines: Array<"yin" | "yang">;
};

export type ReadingStage = "draft" | "casting" | "ready";

export type HexagramDefinition = {
  id: string;
  name: string;
  symbol: string;
  binaryCode: string;
  palace: string;
  palaceElement: string;
  type: string;
  orderInPalace: number;
  globalOrder: number | null;
  upperTrigram: string;
  lowerTrigram: string;
  trigramMeaning: {
    upper: Record<string, string | number>;
    lower: Record<string, string | number>;
  };
  shiLine: number | null;
  yingLine: number | null;
  judgment: string;
  imageText: string;
  commentary: string;
  summary: string;
  divinationHints: {
    usefulGod: string;
    temperament: string;
    lineHints: Record<string, string>;
  };
  lineTexts: Array<{
    line: number | null;
    label: string;
    text: string;
    imageText: string;
    interpretation: string;
  }>;
  lineMeta: Array<unknown>;
  dataQualityNotes: string[];
  isDetailComplete: boolean;
  detailSource: string | null;
};

export type LiuyaoKnowledge = {
  trigrams: Record<string, Record<string, string | number>>;
  fiveElements: {
    相生: Record<string, string>;
    相克: Record<string, string>;
  };
  branches: Record<string, unknown>;
  naJia: Record<string, unknown>;
  sixRelations: Record<string, unknown>;
  sixGods: Record<string, unknown>;
  shiYing: Record<string, unknown>;
  judging: Record<string, unknown>;
};

export type LiuyaoDataBundle = {
  generatedAt: string;
  sourceDir: string;
  meta: {
    totalHexagrams: number;
    completeDetails: number;
    fallbackDetails: number;
  };
  knowledge: LiuyaoKnowledge;
  hexagrams: HexagramDefinition[];
};

export type MovingLineReading = {
  line: number;
  kind: LineKind;
  label: string;
  baseText: string;
  baseInterpretation: string;
  changedText?: string;
  changedInterpretation?: string;
};

export type StructuredReading = {
  question: string;
  baseHexagram: HexagramDefinition;
  changedHexagram: HexagramDefinition;
  baseSnapshot: HexagramSnapshot;
  changedSnapshot: HexagramSnapshot;
  movingLines: number[];
  movingLineReadings: MovingLineReading[];
  structuralSummary: string;
  trendSummary: string;
  adviceSummary: string;
  relationSummary: string;
};

export type ReadingInterpretation = {
  title: string;
  summary: string;
  hints: string[];
  tone?: string;
  personalized?: {
    overall: string;
    presentState: string;
    trend: string;
    advice: string;
  };
  missingDataNote?: string;
};

export type ReadingRecord = {
  question: string;
  topicTags: string[];
  stage: ReadingStage;
  lines: LineRecord[];
  baseHexagram?: HexagramSnapshot;
  changedHexagram?: HexagramSnapshot;
  movingLines: number[];
  interpretation?: ReadingInterpretation;
};

export type AiInterpretationRequest = {
  question: string;
  baseHexagram: {
    code: string;
    name: string;
    symbol: string;
    palace: string;
    palaceElement: string;
    summary: string;
    judgment: string;
    imageText: string;
    usefulGod: string;
    temperament: string;
  };
  changedHexagram: {
    code: string;
    name: string;
    symbol: string;
    palace: string;
    palaceElement: string;
    summary: string;
    judgment: string;
    imageText: string;
    usefulGod: string;
    temperament: string;
  };
  movingLines: Array<{
    line: number;
    kind: LineKind;
    label: string;
    baseText: string;
    baseInterpretation: string;
    changedText?: string;
    changedInterpretation?: string;
  }>;
  structuralSummary: string;
  trendSummary: string;
  adviceSummary: string;
};
