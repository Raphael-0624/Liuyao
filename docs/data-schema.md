# 六爻数据 Schema 建议

## 1. 起卦记录

```ts
type ReadingRecord = {
  question: string;
  topicTags: string[];
  stage: "draft" | "casting" | "ready";
  lines: LineRecord[];
  baseHexagram?: HexagramSnapshot;
  changedHexagram?: HexagramSnapshot;
  movingLines: number[];
  interpretation?: ReadingInterpretation;
};
```

## 2. 单爻记录

```ts
type LineRecord = {
  lineIndex: number; // 1-6，自下而上
  toss: TossResult;
  kind: "old-yin" | "young-yang" | "young-yin" | "old-yang";
  isMoving: boolean;
  basePolarity: "yin" | "yang";
  changedPolarity: "yin" | "yang";
};
```

## 3. 卦快照

```ts
type HexagramSnapshot = {
  code: string; // 例如 101011，自下而上
  upperTrigramCode: string;
  lowerTrigramCode: string;
  lines: Array<"yin" | "yang">;
};
```

## 4. 正式卦库建议结构

```ts
type HexagramDefinition = {
  id: string;
  name: string;
  symbol?: string;
  palace?: string;
  order?: number;
  element?: string;
  upperTrigram: string;
  lowerTrigram: string;
  binaryCode: string;
  shiLine?: number;
  yingLine?: number;
  judgment?: string;
  imageText?: string;
  summary?: string;
  lineTexts: Array<{
    line: number;
    label: string;
    text: string;
    imageText?: string;
    interpretation?: string;
  }>;
  divinationHints?: {
    usefulGod?: string[];
    temperament?: string;
    notes?: string[];
  };
};
```

## 5. 数据清洗要求

- 所有爻位统一使用数字 `1-6`
- 所有卦编码统一使用自下而上的二进制字符串
- 世应位置不要再混用“初爻/一爻”
- 原始资料字段保留，但前端只消费 normalized data
- 卦象字符与卦名映射需要单独校验
