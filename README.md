# liuyao_proj

六爻起卦网页的前端骨架与架构文档目录。

## 当前状态

- 已搭建 `Vite + React + TypeScript` 工程骨架
- 已实现完整流程：问题输入、语音输入、六次投掷、本卦/变卦、动爻结构化解读
- 已接入正式 64 卦标准化数据文件生成流程
- 已接入服务端 AI 解读代理，可调用 DeepSeek 生成个性化解读
- UI 已调整为中国古风视觉方向，移动端与 PC 均可用

## 启动

```bash
npm install
npm run dev
```

另开服务端时也可单独运行：

```bash
npm run dev:server
```

单独生成和校验数据：

```bash
npm run data:build
npm run data:validate
```

## 环境变量

新建 `.env`，至少包含：

```bash
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_MODEL=deepseek-v4-pro
PORT=8787
VITE_API_BASE_URL=http://localhost:8787
```

不要把明文 key 写进前端代码或提交进仓库。

## 目录

- `src/`：前端应用代码
- `docs/architecture.md`：产品和工程结构设计
- `docs/data-schema.md`：建议的数据 schema
- `docs/project-plan.md`：项目计划
- `docs/progress-log.md`：开发进度记录
- `scripts/generate-liuyao-data.mjs`：原始数据标准化脚本
- `scripts/validate-liuyao-data.mjs`：标准化数据验证脚本

## 下一步

- 如需更细排盘，可单独补充可计算的日辰、六神、逐爻纳甲标准数据
- 若要部署到正式域名，只需调整 `VITE_API_BASE_URL`
- 若原始 JSON 继续更新，重新运行 `npm run dev` 或 `npm run build` 即会自动刷新标准卦库
