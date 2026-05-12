import type { CoinFace, LineKind, TossResult } from "../types/liuyao";

function randomCoin(): CoinFace {
  return Math.random() > 0.5 ? "yang" : "yin";
}

function sumCoins(coins: CoinFace[]): 6 | 7 | 8 | 9 {
  const sum = coins.reduce((total, coin) => total + (coin === "yang" ? 3 : 2), 0);
  return sum as 6 | 7 | 8 | 9;
}

export function castCoins(tossIndex: number): TossResult {
  const coins = [randomCoin(), randomCoin(), randomCoin()];
  return {
    tossIndex,
    coins,
    sum: sumCoins(coins),
  };
}

export function resolveLineKind(sum: TossResult["sum"]): LineKind {
  switch (sum) {
    case 6:
      return "old-yin";
    case 7:
      return "young-yang";
    case 8:
      return "young-yin";
    case 9:
      return "old-yang";
  }
}
