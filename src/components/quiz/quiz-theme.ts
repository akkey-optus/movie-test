import type { QuizDefinition } from "@/src/lib/config";

export type QuizThemeId = "planet" | "movie" | "fairy";
export type QuizVisualFamily = "observatory" | "comic" | "scroll";

type ThemeStep = {
  label: string;
  description: string;
};

export type QuizExperienceTheme = {
  id: QuizThemeId;
  visualFamily: QuizVisualFamily;
  routeLabel: string;
  shellTitle: string;
  shellDescription: string;
  introSteps: [ThemeStep, ThemeStep, ThemeStep];
  activeLabel: string;
  activeTitle: string;
  activeDescription: string;
  asideLabel: string;
  asideTitle: string;
  asideDescription: string;
  figureLabel: string;
  boundaryLabel: string;
  boundaryDescription: string;
  flow: {
    panelLabel: string;
    resumePanelLabel: string;
    panelDescription: string;
    resumePanelDescription: string;
    progressLabel: string;
    progressSavedLabel: string;
    stageLabel: string;
    advancePendingLabel: string;
    advanceIdleLabel: string;
    questionDescription: string;
    selectedHint: string;
    idleHint: string;
    storageNote: string;
    asideLabel: string;
    asideTitle: string;
    asideDescription: string;
    modeValue: string;
  };
  result: {
    gateLabel: string;
    gateTitle: string;
    gateDescription: string;
    holdHintIdle: string;
    holdHintHolding: string;
    holdHintTap: string;
    revealIdleLabel: string;
    revealHoldingLabel: string;
    revealIdleAction: string;
    revealHoldingAction: string;
    revealDurationLabel: string;
    summaryLabel: string;
    artworkEyebrow: string;
    artworkTitle: string;
    artworkDescription: string;
    exportNote: string;
    buildSummaryLead: (title: string) => string;
  };
};

const QUIZ_THEMES: Record<QuizThemeId, QuizExperienceTheme> = {
  planet: {
    id: "planet",
    visualFamily: "observatory",
    routeLabel: "星图手记",
    shellTitle: "同一套星图里的一段问答航线。",
    shellDescription:
      "这一页会沿着同一张星图继续展开：层次更稳定，状态更清楚，从进入、作答到揭晓都保持连贯的节奏。",
    introSteps: [
      {
        label: "01 校准航向",
        description: "先看清这次旅程的主题，再让眼前的第一道题慢慢亮起来。",
      },
      {
        label: "02 跟着直觉作答",
        description: "每次选择都会立即记下，并用轻量过渡把你送往下一段轨道。",
      },
      {
        label: "03 揭晓归属",
        description: "答完整段旅程后，结果会先停在星图表面，再由你亲手揭开。",
      },
    ],
    activeLabel: "正在航行",
    activeTitle: "现在开始，把直觉落到一题一题的轨道里。",
    activeDescription:
      "一次只看一题，让节奏干净地向前推进。你刚刚做出的选择，会悄悄把下一张题卡推到眼前。",
    asideLabel: "航线侧记",
    asideTitle: "一段为指尖和夜空准备好的问答旅程。",
    asideDescription:
      "入口、问题流与结果摘要都保持同一条版式线索，让整个体验在手机和桌面上都能稳定推进。",
    figureLabel: "Route chart",
    boundaryLabel: "体验边界",
    boundaryDescription:
      "动效只循环 transform 与 opacity，背景使用低频率的星图漂移和光雾层，并在系统偏好降低动态效果时停止非必要循环。",
    flow: {
      panelLabel: "当前航线",
      resumePanelLabel: "已恢复航线",
      panelDescription: "每次选择都会立即记录，并在短暂停顿后将下一张题卡平稳推到眼前，保持一题一屏的节奏。",
      resumePanelDescription:
        "已从上次停下的位置继续。答案会实时写入当前浏览器，所以回到这条链接时能直接恢复同一段进度。",
      progressLabel: "轨道进度",
      progressSavedLabel: "已记录",
      stageLabel: "当前航段",
      advancePendingLabel: "星图正在记录这次选择",
      advanceIdleLabel: "选择后自动切到下一题",
      questionDescription: "把注意力停在眼前这一题就好。页面不会回退成整屏列表，而是沿着你的选择继续向前推进。",
      selectedHint: "答案已锁定，下一段轨道正在靠近。",
      idleHint: "点击后立即写入当前设备，并切往下一题。",
      storageNote: "当前进度会保存在这台设备里，所以你只需要顺着眼前这一题继续往前走。",
      asideLabel: "页边批注",
      asideTitle: "这一题只记录当下，不要求你回头校正。",
      asideDescription: "这里只记录你当下的判断：单次选择、即时保存、顺滑前进，不需要回头重新整理整段节奏。",
      modeValue: "单题单页",
    },
    result: {
      gateLabel: "按住揭晓",
      gateTitle: "最后一道讯号已经归位，现在按住让结果慢慢浮现。",
      gateDescription:
        "轻点只会给出提示，不会直接展开结果。完成记录一旦写入本地，再次回到同一链接时会直接进入摘要页。",
      holdHintIdle: "结果已经准备好，按住 0.9 秒让它从星图里浮现。",
      holdHintHolding: "继续按住，结果正在从夜幕里慢慢显形。",
      holdHintTap: "轻点不会直接展开结果，请按住满 0.9 秒。",
      revealIdleLabel: "按住",
      revealHoldingLabel: "正在揭晓",
      revealIdleAction: "按住",
      revealHoldingAction: "继续",
      revealDurationLabel: "0.9s 揭晓",
      summaryLabel: "已保存落点",
      artworkEyebrow: "观测图像预留",
      artworkTitle: "结果插画安全区已留出位置。",
      artworkDescription: "后续接入星球结果图时，可以直接填入这块纵向画幅，不会影响当前导出与版式稳定性。",
      exportNote: "导出的结果图会保留这块画面区域，后续接入插画时无需重排摘要结构。",
      buildSummaryLead: (title) => `这一站落在 ${title}`,
    },
  },
  movie: {
    id: "movie",
    visualFamily: "comic",
    routeLabel: "银幕札记",
    shellTitle: "把这一轮提问剪成一页有余温的银幕样片。",
    shellDescription:
      "进入、作答、揭晓都沿着同一套片场节奏推进：像翻一本文艺杂志，也像看一段带片头片尾的私人电影。",
    introSteps: [
      {
        label: "01 对准片头",
        description: "先看清故事将从哪里开场，再让第一道题像字幕一样慢慢亮起。",
      },
      {
        label: "02 交出第一反应",
        description: "每次选择都会像一记剪辑点，把你送进下一镜情绪与留白。",
      },
      {
        label: "03 揭开片尾卡",
        description: "答完整段故事之后，结果会先停在海报边缘，再由你亲手揭幕。",
      },
    ],
    activeLabel: "正在放映",
    activeTitle: "现在开始，让每一道选择都成为下一帧分镜。",
    activeDescription:
      "一次只读一题，让镜头和情绪保持干净的推进。你刚刚交出的判断，会把下一场戏轻轻推到眼前。",
    asideLabel: "片场边栏",
    asideTitle: "像翻开一页粉雾纸感里的私人电影笔记。",
    asideDescription:
      "片头、题卡与结果页会共用同一段酒红纸纹、柔雾灯光和杂志式留白，在手机与桌面上都保持完整片感。",
    figureLabel: "Poster board",
    boundaryLabel: "放映边界",
    boundaryDescription:
      "动效只保留轻微转场、纸面光斑与字幕式推进；系统偏好降低动态效果时，会停止非必要的连续漂移与脉冲。",
    flow: {
      panelLabel: "当前场次",
      resumePanelLabel: "已接回上一场",
      panelDescription: "每次选择都会即时写入，并在一记短暂停顿后把下一镜推上来，让节奏像剪辑点一样干净。",
      resumePanelDescription:
        "已从你上次停住的场次接回。答案会实时写入当前浏览器，所以再次回到这条链接时，故事会从同一镜继续。",
      progressLabel: "片段进度",
      progressSavedLabel: "已收录",
      stageLabel: "当前镜次",
      advancePendingLabel: "场记正在记下这一镜",
      advanceIdleLabel: "选择后自动切到下一镜",
      questionDescription: "把注意力停在这一镜就好。页面不会退回成整屏列表，而是沿着你刚刚留下的情绪继续剪下去。",
      selectedHint: "这一镜已经锁定，下一帧正在显影。",
      idleHint: "点击后立即写入当前设备，并切往下一题。",
      storageNote: "当前进度会保存在这台设备里，所以你只需要顺着眼前这一镜继续往前看。",
      asideLabel: "页边旁白",
      asideTitle: "这一题只留下当下的表情，不追问重拍。",
      asideDescription: "这里只记录你此刻的偏爱：单次选择、即时落档、顺滑切镜，不需要回头重新整理整段片子的节奏。",
      modeValue: "单镜切换",
    },
    result: {
      gateLabel: "按住揭幕",
      gateTitle: "片尾卡已经停在画面中央，现在按住让结果像海报一样慢慢显影。",
      gateDescription:
        "轻点只会给出提示，不会直接展开结果。完成记录一旦写入本地，再次回到同一链接时会直接进入摘要页。",
      holdHintIdle: "结果已经准备好，按住 0.9 秒让它像片尾卡一样显影。",
      holdHintHolding: "继续按住，海报轮廓正在从柔雾里慢慢浮现。",
      holdHintTap: "轻点不会直接揭幕结果，请按住满 0.9 秒。",
      revealIdleLabel: "按住",
      revealHoldingLabel: "正在揭幕",
      revealIdleAction: "揭幕",
      revealHoldingAction: "继续",
      revealDurationLabel: "0.9s 显影",
      summaryLabel: "已保存片型",
      artworkEyebrow: "海报位预留",
      artworkTitle: "结果海报的纵向版心已经预留出来。",
      artworkDescription: "后续补入剧照或主题海报时，可以直接落进这块纸页画幅，不会造成空图或导出断层。",
      exportNote: "导出的结果图会保留这块海报位，后续补图时无需重新调整标题、关键词与正文布局。",
      buildSummaryLead: (title) => `你的故事会被剪成 ${title}`,
    },
  },
  fairy: {
    id: "fairy",
    visualFamily: "scroll",
    routeLabel: "云笺抄录",
    shellTitle: "循着月色与云笺，去见与你同频的一段仙缘。",
    shellDescription:
      "问答、揭晓与回访共用同一卷纸墨纹理：像翻开一册题签，也像在雾色山门前等一位灵姝慢慢显形。",
    introSteps: [
      {
        label: "01 凝神入卷",
        description: "先把心绪安稳下来，再让第一道题像笺上题句一样轻轻浮起。",
      },
      {
        label: "02 依心落签",
        description: "每次选择都会像落下一枚签印，把你送到下一段仙缘与气韵。",
      },
      {
        label: "03 展卷见灵",
        description: "答完整卷之后，结果会先停在画卷边上，再由你亲手展出真形。",
      },
    ],
    activeLabel: "正在入卷",
    activeTitle: "现在开始，让每一道心念都落进灵笺里。",
    activeDescription:
      "一次只看一问，让气息与节奏都保持安静。你刚刚落下的选择，会把下一枚签文轻轻送到眼前。",
    asideLabel: "卷边批注",
    asideTitle: "一段带纸墨、月色与玉光的轻古风问答。",
    asideDescription:
      "结构仍然是同一套单题流，但气韵会更像展卷、题签与灵画慢慢显形，在桌面与手机上都保持舒展。",
    figureLabel: "Immortal scroll",
    boundaryLabel: "卷中分寸",
    boundaryDescription:
      "动效只保留云雾轻移、印记显色与低频流光；系统偏好降低动态效果时，会停止非必要的漂移与脉冲。",
    flow: {
      panelLabel: "当前签文",
      resumePanelLabel: "已续上前签",
      panelDescription: "每次选择都会即时写入，并在一息停顿后把下一问送上来，让整段节奏像翻签一样轻而不断。",
      resumePanelDescription:
        "已从你上次停住的那一签续上。答案会实时写入当前浏览器，所以回到这条链接时，卷面会从同一处继续展开。",
      progressLabel: "灵卷进度",
      progressSavedLabel: "已收录",
      stageLabel: "当前灵签",
      advancePendingLabel: "仙笺正在收录这一念",
      advanceIdleLabel: "选择后自动切到下一签",
      questionDescription: "把注意力停在眼前这一问就好。页面不会退回成整屏列表，而是沿着你刚刚落下的心念继续展卷。",
      selectedHint: "这一签已定，下一卷正在徐徐展开。",
      idleHint: "点击后立即写入当前设备，并切往下一题。",
      storageNote: "当前进度会保存在这台设备里，所以你只需要顺着眼前这一签继续往前走。",
      asideLabel: "案边札记",
      asideTitle: "这一问只问此刻心意，不必回身重写。",
      asideDescription: "这里只记录你当下的心念：单次落签、即时收录、顺势展卷，不需要回头重新整理整段仙缘的节奏。",
      modeValue: "一签一页",
    },
    result: {
      gateLabel: "按住展卷",
      gateTitle: "灵签已经归位，现在按住让结果像画卷一样慢慢显形。",
      gateDescription:
        "轻点只会给出提示，不会直接展开结果。完成记录一旦写入本地，再次回到同一链接时会直接进入摘要页。",
      holdHintIdle: "结果已经准备好，按住 0.9 秒让它从画卷里显形。",
      holdHintHolding: "继续按住，灵画轮廓正在从纸墨里慢慢浮现。",
      holdHintTap: "轻点不会直接展卷结果，请按住满 0.9 秒。",
      revealIdleLabel: "按住",
      revealHoldingLabel: "正在展卷",
      revealIdleAction: "展卷",
      revealHoldingAction: "继续",
      revealDurationLabel: "0.9s 显形",
      summaryLabel: "已存仙缘",
      artworkEyebrow: "绘卷位预留",
      artworkTitle: "结果灵画的卷心画幅已经预留出来。",
      artworkDescription: "后续补入古风插画或人物立绘时，可以直接放进这块竖向画心，不会出现断图或空白错位。",
      exportNote: "导出的结果图会保留这块绘卷位，后续补图时无需重排正文、关键词与收束语。",
      buildSummaryLead: (title) => `这段仙缘最终显出 ${title}`,
    },
  },
};

type QuizThemeSource = Pick<QuizDefinition, "slug" | "theme"> | null;

export function resolveQuizThemeId(quiz: QuizThemeSource, slug: string): QuizThemeId {
  const source = `${quiz?.slug ?? ""} ${quiz?.theme ?? ""} ${slug}`.toLowerCase();

  if (source.includes("movie") || source.includes("电影")) {
    return "movie";
  }

  if (source.includes("xianling") || source.includes("fairy") || source.includes("仙")) {
    return "fairy";
  }

  return "planet";
}

export function getQuizExperienceTheme(quiz: QuizThemeSource, slug: string) {
  return QUIZ_THEMES[resolveQuizThemeId(quiz, slug)];
}
