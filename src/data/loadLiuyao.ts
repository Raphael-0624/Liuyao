import rawData from "./liuyao-data.json";
import type { HexagramDefinition, LiuyaoDataBundle } from "../types/liuyao";

export const liuyaoData = rawData as LiuyaoDataBundle;

const hexagramCodeMap = new Map<string, HexagramDefinition>(
  liuyaoData.hexagrams.map((item) => [item.binaryCode, item]),
);

export function getHexagramByCode(code: string) {
  return hexagramCodeMap.get(code);
}
