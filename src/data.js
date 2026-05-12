export const lessons = [
  {
    id: "parts",
    title: "Prompt 的五个部件",
    summary: "先学会看见结构，再开始写。",
    principle: "一个稳定 prompt 至少要说明角色、任务、框架、输出和约束。缺任何一块，AI 都会自行补全，结果就容易漂。",
    weakExample: "帮我写一篇关于 AI 的文章，写得专业一点。",
    strongExample:
      "你是一位面向企业管理者的技术专栏作者。请围绕“AI 如何改变知识工作”写一篇 1200 字文章。按“变化现象、组织影响、行动建议”三部分展开。语言克制、具体，避免空泛口号。",
    explanation: "强版本不是更长，而是把 AI 需要自行猜测的部分都显式写出来。",
    exerciseIds: ["parts-rewrite"],
  },
  {
    id: "role",
    title: "角色不是头衔",
    summary: "角色要包含身份、能力和立场。",
    principle: "“你是专家”通常不够。好角色会说明这个角色擅长什么、反对什么、用什么标准判断问题。",
    weakExample: "你是商业专家，分析一下这家公司。",
    strongExample:
      "你是一位系统战略分析师，擅长从财报、新闻和业务动作中识别组织背后的结构动力。你不做流水账复述，而是判断公司在外部压力、核心能力和业务边界之间形成了什么结构。",
    explanation: "头衔只给身份；能力和立场才会改变输出质量。",
    exerciseIds: ["role-fill"],
  },
  {
    id: "worldview",
    title: "世界观决定方向",
    summary: "先告诉 AI 如何看世界。",
    principle: "世界观是 prompt 的判断底座。它让模型知道什么算重要、什么算表面、什么算好答案。",
    weakExample: "帮我看看这个产品有什么问题。",
    strongExample:
      "你认为产品不是功能清单，而是一套帮助用户完成任务的行为系统。请从用户目标、关键阻力、反馈机制和使用成本四个角度分析这个产品。",
    explanation: "世界观能把分析从“点评功能”拉到“解释系统”。",
    exerciseIds: ["worldview-rewrite"],
  },
  {
    id: "framework",
    title: "把抽象词改成步骤",
    summary: "不要写“深入”，要写路径。",
    principle: "深入、全面、专业、高级都是愿望，不是方法。把它们改成层级、步骤或维度，AI 才能执行。",
    weakExample: "请深入分析这个社会现象。",
    strongExample:
      "请从三层分析：现象层说明发生了什么；机制层解释这些现象由什么结构生成；本质层指出去掉偶然因素后最不可移除的核心原因。",
    explanation: "强版本把抽象要求变成了可执行路径。",
    exerciseIds: ["framework-rewrite"],
  },
  {
    id: "questions",
    title: "用问题链防跑偏",
    summary: "每个维度都要配追问。",
    principle: "维度名称只是路牌，问题链才是轨道。问题越具体，模型越不容易滑向常识复述。",
    weakExample: "分析一下这个团队文化。",
    strongExample:
      "请分析团队文化。重点回答：他们依据什么判断真相？决策更依赖权威、数据还是共识？错误更常归因于个人还是系统？冲突是被回避还是被正面处理？",
    explanation: "问题链让模型持续面向证据和判断，而不是泛泛描述。",
    exerciseIds: ["questions-fill"],
  },
  {
    id: "output",
    title: "输出格式决定交付",
    summary: "先设计结果长什么样。",
    principle: "当你只说“给我建议”，AI 会自由发挥。当你定义报告、清单、表格或卡片，它会更像在交付作品。",
    weakExample: "请给我一些改进建议。",
    strongExample:
      "请输出一份诊断报告，包含：一句话结论、三个关键问题、每个问题的证据、一个可能反例、三个按优先级排序的行动建议。",
    explanation: "输出格式让答案有容器，也让用户更容易检查质量。",
    exerciseIds: ["output-rewrite"],
  },
  {
    id: "constraints",
    title: "风格和禁止项",
    summary: "写清楚要什么，也写清楚不要什么。",
    principle: "风格不能只写“高级”。要明确语气、句式、证据要求和禁止项。",
    weakExample: "帮我润色一下，写得高级一点。",
    strongExample:
      "请保留原意进行洗练。语言要克制、准确，少用形容词，多用名词和动词。禁止使用网络流行语，禁止为了押韵牺牲逻辑，禁止增加原文没有的新观点。",
    explanation: "负向约束能切断常见坏输出路径。",
    exerciseIds: ["constraints-rewrite"],
  },
  {
    id: "weak-to-strong",
    title: "从弱到强",
    summary: "每次只修一个关键缺口。",
    principle: "改 prompt 不一定要推倒重写。先判断缺的是角色、框架、输出还是约束，再做最小修改。",
    weakExample: "帮我分析一下这篇文章。",
    strongExample:
      "请先判断这篇文章试图解决的核心问题，再拆解它的论证结构，指出最薄弱的假设，最后给出我可以带走的一个行动启发。",
    explanation: "强版本保留了原任务，但补上了分析路径和输出终点。",
    exerciseIds: ["weak-diagnose"],
  },
  {
    id: "template",
    title: "写可复用模板",
    summary: "把一次性需求变成可替换结构。",
    principle: "模板要留下变量，也要保留判断标准。变量负责适配场景，标准负责稳定质量。",
    weakExample: "以后都按这个风格帮我写。",
    strongExample:
      "你是【角色】。请针对【输入对象】完成【任务】。按【框架】分析，并输出【格式】。语言风格为【风格】。禁止【禁止项】。如果信息不足，先列出需要补充的问题。",
    explanation: "模板不是空壳，而是一套可替换的工作流。",
    exerciseIds: ["template-compose"],
  },
  {
    id: "practice",
    title: "自己的场景实战",
    summary: "把真实需求改成完整 prompt。",
    principle: "最终目标不是背规则，而是能处理自己的模糊需求。实战时先写需求，再补结构，再自评。",
    weakExample: "我想让 AI 帮我做一个产品调研。",
    strongExample:
      "你是一位产品研究员。请基于我提供的资料，为【目标产品】做竞品调研。按目标用户、核心场景、功能差异、定价策略、风险机会五部分输出。每个判断都要标注依据；信息不足处写明假设。",
    explanation: "完整 prompt 应该让另一个人不问你也能执行。",
    exerciseIds: ["practice-compose"],
  },
];

export const exercises = [
  {
    id: "parts-rewrite",
    lessonId: "parts",
    type: "rewrite",
    title: "把一句模糊需求补成五部件 prompt",
    prompt: "将下面弱 prompt 改写成包含角色、任务、框架、输出和约束的版本。",
    material: "帮我写一篇关于远程办公的文章，写得专业一点。",
    starter: "你是",
    referenceAnswer:
      "你是一位面向企业管理者的组织研究写作者。请围绕“远程办公如何改变团队协作”写一篇 1000 字文章。按“变化现象、管理挑战、可执行建议”三部分展开。语言具体、克制，避免空泛口号。",
  },
  {
    id: "role-fill",
    lessonId: "role",
    type: "fill",
    title: "给角色补上能力和立场",
    prompt: "把“你是专家”改写成更有判断力的角色设定。",
    material: "场景：分析一家公司的增长问题。",
    starter: "你是一位",
    referenceAnswer:
      "你是一位增长诊断顾问，擅长从用户获取、转化、留存和商业化四个环节识别增长瓶颈。你不做泛泛建议，而是优先找出最限制增长的结构性约束。",
  },
  {
    id: "worldview-rewrite",
    lessonId: "worldview",
    type: "rewrite",
    title: "给分析任务加一个世界观",
    prompt: "为这个产品分析 prompt 增加一个清晰的世界观。",
    material: "帮我看看这个在线课程产品有什么问题。",
    starter: "你认为",
    referenceAnswer:
      "你认为在线课程不是视频仓库，而是一套帮助用户持续完成学习任务的行为系统。请从学习动机、路径清晰度、反馈机制和完成成本四个角度分析这个产品的问题。",
  },
  {
    id: "framework-rewrite",
    lessonId: "framework",
    type: "rewrite",
    title: "把“深入分析”改成三层框架",
    prompt: "不要使用“深入”这个词，改成具体分析路径。",
    material: "请深入分析年轻人不愿意加班这个现象。",
    starter: "请从",
    referenceAnswer:
      "请从三层分析年轻人不愿意加班：现象层说明行为变化；机制层解释薪酬、成长、组织信任如何影响选择；本质层指出这个现象背后的交换关系变化。",
  },
  {
    id: "questions-fill",
    lessonId: "questions",
    type: "fill",
    title: "为维度补问题链",
    prompt: "给“沟通维度”补三个具体问题。",
    material: "场景：分析团队会议记录中的沟通文化。",
    starter: "沟通维度：",
    referenceAnswer:
      "沟通维度：他们讨论问题时是否直指事实？责任主语是清楚的“我/我们”，还是模糊的“有人/应该”？冲突出现时，是追问证据，还是快速转移话题？",
  },
  {
    id: "output-rewrite",
    lessonId: "output",
    type: "rewrite",
    title: "把建议变成可交付报告",
    prompt: "为这个任务设计明确输出格式。",
    material: "请给我一些提升公众号文章质量的建议。",
    starter: "请输出",
    referenceAnswer:
      "请输出一份文章诊断报告，包含：一句话判断、三个主要问题、每个问题的原文证据、对应修改建议、一个改写示例和下一篇文章的检查清单。",
  },
  {
    id: "constraints-rewrite",
    lessonId: "constraints",
    type: "rewrite",
    title: "把“高级”改成风格标准和禁止项",
    prompt: "改写下面 prompt，让风格要求更可执行。",
    material: "帮我润色一下这段话，写得高级一点。",
    starter: "请保留原意",
    referenceAnswer:
      "请保留原意进行洗练。语言要克制、准确，减少形容词堆叠，多使用清晰动词。禁止新增原文没有的观点，禁止使用网络流行语，禁止把简单意思写得绕。",
  },
  {
    id: "weak-diagnose",
    lessonId: "weak-to-strong",
    type: "diagnose",
    title: "诊断弱 prompt 的缺口",
    prompt: "指出这个 prompt 至少三个问题，并给出最小修改版本。",
    material: "帮我分析一下这个市场，越全面越好。",
    starter: "主要问题：\n1. ",
    referenceAnswer:
      "主要问题：没有目标市场范围，没有分析框架，没有输出格式。最小修改版：请分析【目标市场】。按用户需求、竞争格局、增长驱动、进入壁垒和主要风险五部分输出，每部分给出关键判断和证据来源；信息不足处标注假设。",
  },
  {
    id: "template-compose",
    lessonId: "template",
    type: "compose",
    title: "写一个可复用分析模板",
    prompt: "写一个可复用的文章分析 prompt 模板，保留变量。",
    material: "目标：以后贴一篇文章，就能得到结构化分析。",
    starter: "你是【角色】。",
    referenceAnswer:
      "你是【领域】文章分析师。请阅读用户提供的【文章】，输出结构化分析：1. 核心问题；2. 作者主张；3. 论证结构；4. 关键证据；5. 最薄弱假设；6. 我可以采取的一个行动。语言简洁，所有判断必须基于原文。",
  },
  {
    id: "practice-compose",
    lessonId: "practice",
    type: "compose",
    title: "为自己的场景写完整 prompt",
    prompt: "选择一个真实工作场景，写出完整 prompt。",
    material: "建议场景：会议总结、产品调研、文章润色、学习计划、商业分析。",
    starter: "你是",
    referenceAnswer:
      "你是一位会议纪要整理专家。请根据我提供的会议记录，输出：会议目标、关键结论、待办事项、负责人、截止时间、风险点和需要追问的问题。不要补充记录中没有的信息；不确定内容标注为“待确认”。",
  },
];

export const templates = [
  {
    id: "article-analysis",
    category: "文章分析",
    title: "文章逻辑拆解",
    useCase: "读长文、报告、观点文章时提炼结构。",
    body:
      "你是一位文章分析师。请阅读我提供的文章，按以下结构输出：1. 文章试图解决的核心问题；2. 作者的主要结论；3. 支撑结论的三个论据；4. 最薄弱的假设；5. 一个可能反例；6. 我可以带走的一个行动启发。语言简洁，所有判断必须基于原文。",
    why: "它把阅读拆成定位、解构、批判和行动四步，避免只做摘要。",
  },
  {
    id: "writing-polish",
    category: "写作润色",
    title: "保留原意的洗练改写",
    useCase: "把口语化、臃肿的文字改得清楚有力。",
    body:
      "你是一位文笔洗练师。请保留原意改写我提供的文字。目标是更简洁、准确、有节奏。禁止新增原文没有的观点，禁止使用网络流行语，禁止为了华丽牺牲逻辑。请只输出改写后的文本。",
    why: "它明确了润色边界，防止 AI 自行扩写或改意思。",
  },
  {
    id: "meeting-summary",
    category: "会议总结",
    title: "会议纪要转行动清单",
    useCase: "把会议记录整理成可执行事项。",
    body:
      "你是一位会议纪要整理专家。请根据我提供的会议记录输出：会议目标、关键结论、待办事项、负责人、截止时间、风险点、需要追问的问题。不要补充记录中没有的信息；不确定内容标注为“待确认”。",
    why: "它把会议内容从“记录”转成“责任和行动”。",
  },
  {
    id: "product-research",
    category: "产品调研",
    title: "产品体验诊断",
    useCase: "分析一个产品为什么好用或不好用。",
    body:
      "你是一位产品研究员。你认为产品不是功能清单，而是帮助用户完成任务的行为系统。请从目标用户、核心场景、关键阻力、反馈机制、使用成本和改进建议六部分分析【产品】。每个判断都要说明依据；信息不足处写明假设。",
    why: "它用世界观约束分析方向，避免只罗列功能。",
  },
  {
    id: "decision",
    category: "决策分析",
    title: "选择题决策框架",
    useCase: "面对多个选择时梳理取舍。",
    body:
      "你是一位决策顾问。请帮助我分析【选择 A】和【选择 B】。按目标、约束、收益、成本、风险、不可逆性和验证方式七部分比较。最后给出建议，但必须说明这个建议依赖哪些假设。",
    why: "它把建议绑定到假设，避免过度确定的结论。",
  },
];
