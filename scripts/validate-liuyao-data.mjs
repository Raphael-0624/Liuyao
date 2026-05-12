import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const dataPath = path.join(projectRoot, "src/data/liuyao-data.json");

const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const problems = [];

if (data.meta.totalHexagrams !== 64) {
  problems.push(`totalHexagrams 应为 64，当前为 ${data.meta.totalHexagrams}`);
}

const codeMap = new Map();
for (const item of data.hexagrams) {
  if (codeMap.has(item.binaryCode)) {
    problems.push(`卦码重复：${item.binaryCode} -> ${codeMap.get(item.binaryCode)} / ${item.name}`);
  } else {
    codeMap.set(item.binaryCode, item.name);
  }

  if (!item.summary) {
    problems.push(`缺少 summary：${item.name}`);
  }

  if (!item.judgment) {
    problems.push(`缺少 judgment：${item.name}`);
  }

  if (!Array.isArray(item.lineTexts) || item.lineTexts.length < 6) {
    problems.push(`爻辞数量不足：${item.name}，当前 ${item.lineTexts?.length ?? 0}`);
  }
}

if (problems.length > 0) {
  console.error("Liuyao data validation failed:");
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exit(1);
}

console.log("Liuyao data validation passed.");
