import { createServer } from "node:http";

const PORT = Number(process.env.PORT || 8787);
const API_URL = "https://api.deepseek.com/chat/completions";
const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-v4-pro";

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  });
  res.end(JSON.stringify(payload));
}

function buildPrompt(payload) {
  return [
    "请根据以下六爻起卦结构，生成一份中文个性化解读。",
    "要求：",
    "1. 语气克制、平实、清楚，像经验老到的咨询者，不神化，不恐吓，不下绝对结论。",
    "2. 明确区分“当前态势”“变化趋势”“行动建议”。",
    "3. 如果信息不足，要主动说明判断边界，不要编造传统术语细节。",
    "4. 输出必须是 JSON，不要输出 Markdown 代码块。",
    "5. JSON 结构必须包含：title, summary, hints, tone, personalized。",
    "6. personalized 必须包含：overall, presentState, trend, advice。",
    "",
    "起卦信息：",
    JSON.stringify(payload, null, 2),
  ].join("\n");
}

function buildSystemMessage() {
  return [
    "你是六爻网页中的解读助手。",
    "你的风格是：沉静、克制、诚实、结构清晰。",
    "你可以结合六爻的变化感来表达趋势，但不要伪造具体经典原文，不要制造宿命感。",
    "如果输入只有卦结构而没有正式卦库信息，就基于动静、变化、多寡、问题语境给出中度抽象的判断。",
  ].join(" ");
}

function normalizeAiResponse(parsed) {
  return {
    title: typeof parsed.title === "string" ? parsed.title : "AI 个性化解读",
    summary:
      typeof parsed.summary === "string"
        ? parsed.summary
        : "已根据当前起卦结构生成一版个性化解读。",
    hints: Array.isArray(parsed.hints) ? parsed.hints.filter((item) => typeof item === "string") : [],
    tone: typeof parsed.tone === "string" ? parsed.tone : "克制、平实、咨询式",
    personalized: {
      overall: parsed.personalized?.overall || "",
      presentState: parsed.personalized?.presentState || "",
      trend: parsed.personalized?.trend || "",
      advice: parsed.personalized?.advice || "",
    },
  };
}

async function handleInterpret(req, res) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    sendJson(res, 500, {
      error: "服务端未配置 DEEPSEEK_API_KEY。请在 .env 中设置。",
    });
    return;
  }

  let payload;

  try {
    payload = await readRequestBody(req);
  } catch {
    sendJson(res, 400, {
      error: "请求体不是合法 JSON。",
    });
    return;
  }

  try {
    const upstream = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: buildSystemMessage(),
          },
          {
            role: "user",
            content: buildPrompt(payload),
          },
        ],
        thinking: {
          type: "disabled",
        },
        response_format: {
          type: "json_object",
        },
        stream: false,
      }),
    });

    if (!upstream.ok) {
      const errorText = await upstream.text();
      sendJson(res, upstream.status, {
        error: `DeepSeek 调用失败：${errorText}`,
      });
      return;
    }

    const result = await upstream.json();
    const content = result?.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      sendJson(res, 502, {
        error: "DeepSeek 返回内容为空。",
      });
      return;
    }

    const parsed = JSON.parse(content);
    sendJson(res, 200, normalizeAiResponse(parsed));
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "AI 解读服务异常。",
    });
  }
}

const server = createServer(async (req, res) => {
  if (!req.url) {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method === "POST" && req.url === "/api/interpret") {
    await handleInterpret(req, res);
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    sendJson(res, 200, { ok: true });
    return;
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Liuyao AI server listening on http://localhost:${PORT}`);
});
