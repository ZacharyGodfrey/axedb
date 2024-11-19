import sharp from 'sharp';

const TOOL_HATCHET = 'hatchet';
const TOOL_BIG_AXE = 'big axe';
const TARGET_BULLSEYE = 'bullseye';
const TARGET_CLUTCH = 'clutch';

export const logError = (error) => {
  const data = {
    message: error.message,
    stack: error.stack.split('\n').slice(1).map(x => x.trim())
  };

  console.error(`ERROR: ${JSON.stringify(data, null, '\t')}`);
};

export const waitMilliseconds = async (milliseconds) => {
  await new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};

export const sortAscending = (selector) => {
  return (left, right) => {
    const l = selector(left);
    const r = selector(right);

    return l < r ? -1 : l > r ? 1 : 0;
  };
};

export const sortDescending = (selector) => {
  return (left, right) => {
    const l = selector(left);
    const r = selector(right);

    return r < l ? -1 : r > l ? 1 : 0;
  };
};

export const imageToWebp = async (originalBuffer, width = 200, height = 200, quality = 100) => {
  return await sharp(originalBuffer)
    .resize(width, height)
    .webp({ lossless: true, quality })
    .toBuffer();
};

export const round = (places, value) => {
  const factor = 10 ** places;

  return Math.round(value * factor) / factor;
};

export const scorePerAxe = (score, attempts) => {
  return round(2, score / Math.max(1, attempts));
};

export const hitPercent = (hits, attempts) => {
  const value = round(2, 100 * hits / Math.max(1, attempts));
  const [left, right] = `${value}`.split('.');
  const padded = `${right ?? 0}00`.slice(0, 2);

  return `${left}.${padded}`;
};

export const buildStats = (throws) => {
  const result = {
    overall: {
      attempts: 0,
      totalScore: 0,
      scorePerAxe: 0
    },
    hatchet: {
      overall: {
        attempts: 0,
        totalScore: 0,
        scorePerAxe: 0
      },
      bullseye: {
        attempts: 0,
        totalScore: 0,
        scorePerAxe: 0,
        count: {
          0: 0,
          1: 0,
          3: 0,
          5: 0
        },
        percent: {
          0: '',
          1: '',
          3: '',
          5: ''
        }
      },
      clutch: {
        attempts: 0,
        totalScore: 0,
        scorePerAxe: 0,
        count: {
          0: 0,
          5: 0,
          7: 0
        },
        percent: {
          0: '',
          5: '',
          7: ''
        }
      }
    },
    bigAxe: {
      overall: {
        attempts: 0,
        totalScore: 0,
        scorePerAxe: 0
      },
      bullseye: {
        attempts: 0,
        totalScore: 0,
        scorePerAxe: 0,
        count: {
          0: 0,
          1: 0,
          3: 0,
          5: 0
        },
        percent: {
          0: '',
          1: '',
          3: '',
          5: ''
        }
      },
      clutch: {
        attempts: 0,
        totalScore: 0,
        scorePerAxe: 0,
        count: {
          0: 0,
          5: 0,
          7: 0
        },
        percent: {
          0: '',
          5: '',
          7: ''
        }
      }
    }
  };

  for (const { tool, target, score } of throws) {
    result.overall.attempts += 1;
    result.overall.totalScore += score;

    if (tool === TOOL_HATCHET) {
      result.hatchet.overall.attempts += 1;
      result.hatchet.overall.totalScore += score;

      if (target === TARGET_BULLSEYE) {
        result.hatchet.bullseye.attempts += 1;
        result.hatchet.bullseye.totalScore += score;
        result.hatchet.bullseye.count[score] += 1;
      } else if (target === TARGET_CLUTCH) {
        result.hatchet.clutch.attempts += 1;
        result.hatchet.clutch.totalScore += score;
        result.hatchet.clutch.count[score] += 1;
      }
    } else if (tool === TOOL_BIG_AXE) {
      result.bigAxe.overall.attempts += 1;
      result.bigAxe.overall.totalScore += score;

      if (target === TARGET_BULLSEYE) {
        result.bigAxe.bullseye.attempts += 1;
        result.bigAxe.bullseye.totalScore += score;
        result.bigAxe.bullseye.count[score] += 1;
      } else if (target === TARGET_CLUTCH) {
        result.bigAxe.clutch.attempts += 1;
        result.bigAxe.clutch.totalScore += score;
        result.bigAxe.clutch.count[score] += 1;
      }
    }
  }

  result.overall.scorePerAxe = scorePerAxe(result.overall.totalScore, result.overall.attempts);
  result.hatchet.overall.scorePerAxe = scorePerAxe(result.hatchet.overall.totalScore, result.hatchet.overall.attempts);
  result.bigAxe.overall.scorePerAxe = scorePerAxe(result.bigAxe.overall.totalScore, result.bigAxe.overall.attempts);

  result.hatchet.bullseye.scorePerAxe = scorePerAxe(result.hatchet.bullseye.totalScore, result.hatchet.bullseye.attempts);
  result.hatchet.bullseye.percent[0] = hitPercent(result.hatchet.bullseye.count[0], result.hatchet.bullseye.attempts);
  result.hatchet.bullseye.percent[1] = hitPercent(result.hatchet.bullseye.count[1], result.hatchet.bullseye.attempts);
  result.hatchet.bullseye.percent[3] = hitPercent(result.hatchet.bullseye.count[3], result.hatchet.bullseye.attempts);
  result.hatchet.bullseye.percent[5] = hitPercent(result.hatchet.bullseye.count[5], result.hatchet.bullseye.attempts);

  result.hatchet.clutch.scorePerAxe = scorePerAxe(result.hatchet.clutch.totalScore, result.hatchet.clutch.attempts);
  result.hatchet.clutch.percent[0] = hitPercent(result.hatchet.clutch.count[0], result.hatchet.clutch.attempts);
  result.hatchet.clutch.percent[5] = hitPercent(result.hatchet.clutch.count[5], result.hatchet.clutch.attempts);
  result.hatchet.clutch.percent[7] = hitPercent(result.hatchet.clutch.count[7], result.hatchet.clutch.attempts);

  result.bigAxe.bullseye.scorePerAxe = scorePerAxe(result.bigAxe.bullseye.totalScore, result.bigAxe.bullseye.attempts);
  result.bigAxe.bullseye.percent[0] = hitPercent(result.bigAxe.bullseye.count[0], result.bigAxe.bullseye.attempts);
  result.bigAxe.bullseye.percent[1] = hitPercent(result.bigAxe.bullseye.count[1], result.bigAxe.bullseye.attempts);
  result.bigAxe.bullseye.percent[3] = hitPercent(result.bigAxe.bullseye.count[3], result.bigAxe.bullseye.attempts);
  result.bigAxe.bullseye.percent[5] = hitPercent(result.bigAxe.bullseye.count[5], result.bigAxe.bullseye.attempts);

  result.bigAxe.clutch.scorePerAxe = scorePerAxe(result.bigAxe.clutch.totalScore, result.bigAxe.clutch.attempts);
  result.bigAxe.clutch.percent[0] = hitPercent(result.bigAxe.clutch.count[0], result.bigAxe.clutch.attempts);
  result.bigAxe.clutch.percent[5] = hitPercent(result.bigAxe.clutch.count[5], result.bigAxe.clutch.attempts);
  result.bigAxe.clutch.percent[7] = hitPercent(result.bigAxe.clutch.count[7], result.bigAxe.clutch.attempts);

  return result;
};