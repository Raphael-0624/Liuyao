import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const rawDir = "/Users/edy/Desktop/liuyao/六爻数据库";
const outputPath = path.join(projectRoot, "src/data/liuyao-data.json");

const trigramCodeMap = {
  乾: "111",
  兑: "110",
  离: "101",
  震: "100",
  巽: "011",
  坎: "010",
  艮: "001",
  坤: "000",
};

const relationMap = {
  同我: "兄弟",
  生我: "父母",
  我生: "子孙",
  我克: "妻财",
  克我: "官鬼",
};

const elementGenerateMap = {
  木: "火",
  火: "土",
  土: "金",
  金: "水",
  水: "木",
};

const elementControlMap = {
  木: "土",
  火: "金",
  土: "水",
  金: "木",
  水: "火",
};

const lineLabelMap = {
  初爻: 1,
  一爻: 1,
  二爻: 2,
  三爻: 3,
  四爻: 4,
  五爻: 5,
  六爻: 6,
  上爻: 6,
};

function readJson(filename) {
  return JSON.parse(fs.readFileSync(path.join(rawDir, filename), "utf8"));
}

function normalizeName(value) {
  return String(value ?? "").replace(/\s+/g, "").trim();
}

function normalizeLineNumber(label) {
  return lineLabelMap[label] ?? null;
}

function parseUpDown(code) {
  const raw = code.replace("上", "").replace("下", "");
  if (raw.length !== 2) {
    return {
      upper: code.slice(0, 1),
      lower: code.slice(1, 2),
    };
  }

  return {
    upper: raw[0],
    lower: raw[1],
  };
}

function buildElementLookup(branchElementRaw) {
  const lookup = {};
  for (const [branches, element] of Object.entries(branchElementRaw)) {
    for (const branch of branches.split("")) {
      lookup[branch] = element;
    }
  }
  return lookup;
}

function getRelation(selfElement, targetElement) {
  if (selfElement === targetElement) {
    return relationMap["同我"];
  }
  if (elementGenerateMap[targetElement] === selfElement) {
    return relationMap["生我"];
  }
  if (elementGenerateMap[selfElement] === targetElement) {
    return relationMap["我生"];
  }
  if (elementControlMap[selfElement] === targetElement) {
    return relationMap["我克"];
  }
  if (elementControlMap[targetElement] === selfElement) {
    return relationMap["克我"];
  }

  return "未知";
}

function extractLineTexts(lines) {
  const result = [];

  for (const [label, content] of Object.entries(lines ?? {})) {
    const line =
      normalizeLineNumber(label.replace(/^初九$/, "初爻").replace(/^初六$/, "初爻")) ??
      normalizeLineNumber(label.includes("二") ? "二爻" : "") ??
      normalizeLineNumber(label.includes("三") ? "三爻" : "") ??
      normalizeLineNumber(label.includes("四") ? "四爻" : "") ??
      normalizeLineNumber(label.includes("五") ? "五爻" : "") ??
      normalizeLineNumber(label.includes("上") ? "上爻" : "") ??
      normalizeLineNumber(label.includes("九") && label.startsWith("初") ? "初爻" : "");

    result.push({
      line: line ?? null,
      label,
      text: content?.爻辞 ?? "",
      imageText: content?.["象曰"] ?? "",
      interpretation: content?.解读 ?? "",
    });
  }

  return result.sort((a, b) => (a.line ?? 99) - (b.line ?? 99));
}

function main() {
  const basics = readJson("01_八卦基础.json");
  const stemsBranches = readJson("02_五行天干地支.json");
  const naJiaRaw = readJson("03_纳甲.json").纳甲;
  const sixRelations = readJson("04_六亲.json");
  const sixGods = readJson("05_六神.json");
  const shiYing = readJson("06_世应用神持世.json");
  const judging = readJson("13_断卦步骤.json");
  const master = readJson("12_六十四卦.json").六十四卦;

  const branchElementLookup = buildElementLookup(stemsBranches.地支.五行);
  const naJia = {
    ...naJiaRaw.阳卦纳甲,
    ...naJiaRaw.阴卦纳甲,
  };

  const detailFiles = fs
    .readdirSync(rawDir)
    .filter((name) => /^\d+_.*\.json$/.test(name) && Number(name.split("_")[0]) >= 14);

  const detailsByName = {};

  for (const filename of detailFiles) {
    const file = readJson(filename);
    const contentKey = Object.keys(file).find((key) => key !== "meta");
    if (!contentKey) continue;
    const record = {
      meta: file.meta ?? {},
      content: file[contentKey] ?? {},
      filename,
    };
    const aliases = new Set([
      normalizeName(contentKey),
      normalizeName(file?.meta?.name).replace(/详解$/, ""),
      normalizeName(file?.[contentKey]?.卦名),
      normalizeName(filename.replace(/^\d+_[^_]+_\d+_/, "").replace(/\.json$/, "")),
    ]);

    for (const alias of aliases) {
      if (alias) {
        detailsByName[alias] = record;
      }
    }
  }

  const hexagrams = [];

  for (const [palaceName, palace] of Object.entries(master)) {
    for (const [sequenceKey, item] of Object.entries(palace.卦序)) {
      const detail = detailsByName[normalizeName(item.名称)];
      const upDown = parseUpDown(item.上下卦);
      const code = `${trigramCodeMap[upDown.lower]}${trigramCodeMap[upDown.upper]}`;
      const palaceElement = palace.卦宫五行;
      const lineTexts = extractLineTexts(detail?.content?.爻辞);

      hexagrams.push({
        id: `${palaceName}-${sequenceKey}`,
        name: item.名称,
        symbol: item.卦象,
        binaryCode: code,
        palace: palaceName,
        palaceElement,
        type: sequenceKey.split("_").slice(1).join("_"),
        orderInPalace: Number(sequenceKey.split("_")[0]),
        globalOrder: Number((detail?.meta?.卦序 || "").replace(/[^\d]/g, "")) || null,
        upperTrigram: upDown.upper,
        lowerTrigram: upDown.lower,
        trigramMeaning: {
          upper: basics.八卦[upDown.upper],
          lower: basics.八卦[upDown.lower],
        },
        shiLine: normalizeLineNumber(item.世爻位置),
        yingLine: normalizeLineNumber(item.应爻位置),
        judgment: detail?.content?.卦辞 ?? "",
        imageText: detail?.content?.["象曰"] ?? "",
        commentary: detail?.content?.["彖曰"] ?? "",
        summary: detail?.content?.卦义 ?? `${item.名称}，${item.上下卦}，卦宫五行为${palaceElement}。`,
        divinationHints: {
          usefulGod: detail?.content?.六爻断卦要点?.用神要点 ?? "",
          temperament: detail?.content?.六爻断卦要点?.卦气特征 ?? "",
          lineHints: detail?.content?.六爻断卦要点?.各爻提示 ?? {},
        },
        lineTexts,
        lineMeta: [],
        dataQualityNotes: [
          "逐爻纳甲与六亲排盘未直接展示。",
          "当前原始纳甲资料更适合作为知识参考，不足以在前端稳定推出逐爻结果。",
        ],
        isDetailComplete: Boolean(detail),
        detailSource: detail?.filename ?? null,
      });
    }
  }

  const output = {
    generatedAt: new Date().toISOString(),
    sourceDir: rawDir,
    meta: {
      totalHexagrams: hexagrams.length,
      completeDetails: hexagrams.filter((item) => item.isDetailComplete).length,
      fallbackDetails: hexagrams.filter((item) => !item.isDetailComplete).length,
    },
    knowledge: {
      trigrams: basics.八卦,
      fiveElements: stemsBranches.五行,
      branches: stemsBranches.地支,
      naJia: naJiaRaw,
      sixRelations: sixRelations.六亲,
      sixGods: sixGods.六神,
      shiYing,
      judging,
    },
    hexagrams,
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Generated ${outputPath}`);
  console.log(
    `Total ${output.meta.totalHexagrams}, complete ${output.meta.completeDetails}, fallback ${output.meta.fallbackDetails}`,
  );
}

main();
