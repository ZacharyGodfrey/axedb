const reactPageState = (page, selector) => {
  return page.$eval(selector, (element) => {
    return element._reactRootContainer._internalRoot.current.memoizedState.element.props.store.getState();
  });
};

const isDesiredResponse = (method, status, url) => {
  return (response) => {
    return response.request().method() === method
      && response.status() === status
      && response.url() === url;
  };
};

export const enums = {
  tool: {
    hatchet: 'hatchet',
    bigAxe: 'big axe'
  },
  target: {
    bullseye: 'bullseye',
    clutch: 'clutch'
  }
};

export const getProfileImage = async (profileId) => {
  const url = `https://admin.axescores.com/pic/${profileId}`;
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');

  return base64;
};

export const getPlayerData = async (page, profileId) => {
  await page.goto(`https://axescores.com/player/${profileId}`);
  await waitMilliseconds(1000);

  const state = await reactPageState(page, '#root');

  return state.player.playerData;
};

export const getMatchData = async (page, profileId, matchId) => {
  const throws = [];
  const url = `https://axescores.com/player/${profileId}/${matchId}`;
  const apiUrl = `https://api.axescores.com/match/${matchId}`;

  const [apiResponse] = await Promise.all([
    page.waitForResponse(isDesiredResponse('GET', 200, apiUrl), { timeout: 2000 }),
    page.goto(url)
  ]);

  const rawMatch = await apiResponse.json();

  const isInvalidRoundCount = rawMatch.rounds.length > 4;
  const isForfeit = rawMatch.players.find(x => x.id === profileId)?.forfeit === true;

  if (isInvalidRoundCount || isForfeit) {
    return throws;
  }

  const opponentId = rawMatch.players.find(x => x.id !== profileId)?.id ?? 0;

  rawMatch.rounds.forEach(({ order: roundNumber, name, games }) => {
    const game = games.find(x => x.player === profileId);

    if (!game || game.forfeit === true) {
      return;
    }

    const isBigAxe = name === 'Tie Break';
    const { Axes: axes = [] } = game;

    axes.forEach(({ order: throwNumber, score, clutchCalled: isClutch }) => {
      throws.push({
        profileId,
        matchId,
        round: roundNumber,
        throw: throwNumber,
        tool: isBigAxe ? enums.tool.bigAxe : enums.tool.hatchet,
        target: isClutch ? enums.target.clutch : enums.target.bullseye,
        score
      });
    });
  });

  return { opponentId, throws };
};

export const getStats = (throws) => {
  const result = {
    hatchet: {
      bullseye: {
        attempts: 0,
        totalScore: 0,
        scorePerAxe: 0,
        hits: 0,
        hitPercent: 0,
      },
      clutch: {
        attempts: 0,
        totalScore: 0,
        scorePerAxe: 0,
        hits: 0,
        hitPercent: 0,
        fives: 0,
        fiveHitPercent: 0,
        sevens: 0,
        sevenHitPercent: 0,
      }
    },
    bigAxe: {
      bullseye: {
        attempts: 0,
        totalScore: 0,
        scorePerAxe: 0,
        hits: 0,
        hitPercent: 0,
      },
      clutch: {
        attempts: 0,
        totalScore: 0,
        scorePerAxe: 0,
        hits: 0,
        hitPercent: 0,
        fives: 0,
        fiveHitPercent: 0,
        sevens: 0,
        sevenHitPercent: 0,
      }
    }
  };

  throws.forEach(({ tool, target, score }) => {
    if (tool === enums.tool.hatchet) {
      if (target === enums.target.bullseye) {
        result.hatchet.bullseye.attempts += 1;
        result.hatchet.bullseye.totalScore += score;
        result.hatchet.bullseye.hits += score === 5 ? 1 : 0;
      } else if (target === enums.target.clutch) {
        result.hatchet.clutch.attempts += 1;
        result.hatchet.clutch.totalScore += score;
        result.hatchet.clutch.hits += score > 0 ? 1 : 0;
        result.hatchet.clutch.fives += score === 5 ? 1 : 0;
        result.hatchet.clutch.sevens += score === 7 ? 1 : 0;
      }
    } else if (tool === enums.tool.bigAxe) {
      if (target === enums.target.bullseye) {
        result.bigAxe.bullseye.attempts += 1;
        result.bigAxe.bullseye.totalScore += score;
        result.bigAxe.bullseye.hits += score === 5 ? 1 : 0;
      } else if (target === enums.target.clutch) {
        result.bigAxe.clutch.attempts += 1;
        result.bigAxe.clutch.totalScore += score;
        result.bigAxe.clutch.hits += score > 0 ? 1 : 0;
        result.bigAxe.clutch.fives += score === 5 ? 1 : 0;
        result.bigAxe.clutch.sevens += score === 7 ? 1 : 0;
      }
    }
  });

  result.hatchet.bullseye.scorePerAxe = round(3, result.hatchet.bullseye.totalScore / Math.max(1, result.hatchet.bullseye.attempts));
  result.hatchet.bullseye.hitPercent = 100 * round(5, result.hatchet.bullseye.hits / Math.max(1, result.hatchet.bullseye.attempts));

  result.hatchet.clutch.scorePerAxe = round(3, result.hatchet.clutch.totalScore / Math.max(1, result.hatchet.clutch.attempts));
  result.hatchet.clutch.hitPercent = 100 * round(5, result.hatchet.clutch.hits / Math.max(1, result.hatchet.clutch.attempts));
  result.hatchet.clutch.fiveHitPercent = 100 * round(5, result.hatchet.clutch.fives / Math.max(1, result.hatchet.clutch.attempts));
  result.hatchet.clutch.sevenHitPercent = 100 * round(5, result.hatchet.clutch.sevens / Math.max(1, result.hatchet.clutch.attempts));

  result.bigAxe.bullseye.scorePerAxe = round(3, result.bigAxe.bullseye.totalScore / Math.max(1, result.bigAxe.bullseye.attempts));
  result.bigAxe.bullseye.hitPercent = 100 * round(5, result.bigAxe.bullseye.hits / Math.max(1, result.bigAxe.bullseye.attempts));

  result.bigAxe.clutch.scorePerAxe = round(3, result.bigAxe.clutch.totalScore / Math.max(1, result.bigAxe.clutch.attempts));
  result.bigAxe.clutch.hitPercent = 100 * round(5, result.bigAxe.clutch.hits / Math.max(1, result.bigAxe.clutch.attempts));
  result.bigAxe.clutch.fiveHitPercent = 100 * round(5, result.bigAxe.clutch.fives / Math.max(1, result.bigAxe.clutch.attempts));
  result.bigAxe.clutch.sevenHitPercent = 100 * round(5, result.bigAxe.clutch.sevens / Math.max(1, result.bigAxe.clutch.attempts));

  return result;
};

export const waitMilliseconds = (milliseconds) => {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};

export const round = (places, value) => {
  const factor = 10 ** places;

  return Math.round(value * factor) / factor;
};