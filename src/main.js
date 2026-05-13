import { exercises, lessons, templates } from "./data.js";

const app = document.querySelector("#app");
const storageKey = "prompt-training-lab-progress";
const draftKeyPrefix = "prompt-training-lab-draft:";
const navItems = [
  { id: "home", label: "训练" },
  { id: "lessons", label: "课程" },
  { id: "diagnose", label: "诊断" },
  { id: "templates", label: "模板" },
];
const scoreDimensionLabels = [
  ["role", "角色"],
  ["task", "任务"],
  ["framework", "框架"],
  ["output", "输出"],
  ["constraints", "约束"],
  ["vague", "空泛词"],
];

let state = loadProgress();

window.addEventListener("hashchange", render);
render();

function render() {
  const route = parseRoute();
  app.innerHTML = layout(renderRoute(route), route);
  bindGlobalActions(route);
}

function parseRoute() {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const [page = "home", id = ""] = raw.split("/");
  return { page: page || "home", id };
}

function layout(content, route) {
  return `
    <div class="app-shell">
      <aside class="sidebar">
        <a class="brand" href="#/home" aria-label="Prompt 训练场首页">
          <span class="brand-mark">P</span>
          <span>
            <strong>Prompt 训练场</strong>
            <small>写作能力工作台</small>
          </span>
        </a>
        <nav class="nav-list" aria-label="主导航">
          ${navItems
            .map(
              (item) => `
                <a class="nav-item ${route.page === item.id ? "active" : ""}" href="#/${item.id}">
                  ${item.label}
                </a>
              `,
            )
            .join("")}
        </nav>
        <div class="progress-card">
          <span class="meta-label">学习进度</span>
          <strong>${getCompletedLessonCount()} / ${lessons.length}</strong>
          <div class="progress-track"><span style="width:${getProgressPercent()}%"></span></div>
          <p>${getProgressPercent()}% 已完成</p>
        </div>
      </aside>
      <main class="main-area">${content}</main>
    </div>
  `;
}

function renderRoute(route) {
  if (route.page === "lessons" && route.id) {
    return renderLesson(route.id);
  }

  if (route.page === "exercise" && route.id) {
    return renderExercise(route.id);
  }

  if (route.page === "lessons") {
    return renderLessons();
  }

  if (route.page === "diagnose") {
    return renderDiagnose();
  }

  if (route.page === "templates") {
    return renderTemplates();
  }

  return renderHome();
}

function renderHome() {
  const nextLesson = getNextLesson();
  const currentExercise = exercises.find((exercise) => exercise.lessonId === nextLesson.id) ?? exercises[0];

  return `
    <section class="page-header compact">
      <div>
        <span class="eyebrow">MVP 训练闭环</span>
        <h1>把模糊需求改成可执行 prompt</h1>
        <p>每一课都包含规则、弱/强例子、练习和即时评分。先练会结构，再谈高级技巧。</p>
      </div>
      <div class="header-actions">
        <a class="button primary" href="#/lessons/${nextLesson.id}">继续学习</a>
        <a class="button ghost" href="#/diagnose">诊断我的 Prompt</a>
      </div>
    </section>

    <section class="dashboard-grid">
      <article class="panel focus-panel">
        <span class="meta-label">下一课</span>
        <h2>${nextLesson.title}</h2>
        <p>${nextLesson.summary}</p>
        <div class="example-split">
          <div>
            <span>弱写法</span>
            <pre>${escapeHtml(nextLesson.weakExample)}</pre>
          </div>
          <div>
            <span>强写法</span>
            <pre>${escapeHtml(nextLesson.strongExample)}</pre>
          </div>
        </div>
      </article>

      <article class="panel">
        <span class="meta-label">今日练习</span>
        <h2>${currentExercise.title}</h2>
        <p>${currentExercise.prompt}</p>
        <a class="button secondary" href="#/exercise/${currentExercise.id}">开始练习</a>
      </article>

      <article class="panel">
        <span class="meta-label">评分维度</span>
        <div class="metric-list">
          ${["角色", "任务", "框架", "输出", "约束", "空泛词"].map((item) => `<span>${item}</span>`).join("")}
        </div>
        <p>第一版采用规则评分，适合训练基本结构感。后续可以接入 AI 做更细的语义反馈。</p>
      </article>
    </section>
  `;
}

function renderLessons() {
  return `
    <section class="page-header">
      <div>
        <span class="eyebrow">Learning Path</span>
        <h1>十节课建立 prompt 写作骨架</h1>
        <p>按顺序学习最稳，也可以直接跳到你最想练的能力。</p>
      </div>
    </section>
    <section class="lesson-grid">
      ${lessons
        .map((lesson, index) => {
          const done = state.completedLessonIds.includes(lesson.id);
          return `
            <a class="lesson-card ${done ? "done" : ""}" href="#/lessons/${lesson.id}">
              <span class="lesson-index">${String(index + 1).padStart(2, "0")}</span>
              <h2>${lesson.title}</h2>
              <p>${lesson.summary}</p>
              <span class="status-pill">${done ? "已完成" : "未完成"}</span>
            </a>
          `;
        })
        .join("")}
    </section>
  `;
}

function renderLesson(id) {
  const lesson = lessons.find((item) => item.id === id) ?? lessons[0];
  const exercise = exercises.find((item) => lesson.exerciseIds.includes(item.id));
  const next = getNextLessonAfter(lesson.id);

  return `
    <section class="workspace lesson-workspace">
      <div class="learn-pane">
        <a class="back-link" href="#/lessons">返回课程</a>
        <span class="eyebrow">Lesson</span>
        <h1>${lesson.title}</h1>
        <p class="lead">${lesson.summary}</p>
        <div class="rule-box">
          <span class="meta-label">核心规则</span>
          <p>${lesson.principle}</p>
        </div>
        <div class="explanation-box">
          <span class="meta-label">为什么这样写</span>
          <p>${lesson.explanation}</p>
        </div>
      </div>
      <div class="example-pane">
        <div class="example-card weak">
          <span>弱写法</span>
          <pre>${escapeHtml(lesson.weakExample)}</pre>
        </div>
        <div class="example-card strong">
          <span>强写法</span>
          <pre>${escapeHtml(lesson.strongExample)}</pre>
        </div>
        <div class="action-row">
          <button class="button ghost" data-complete-lesson="${lesson.id}">标记完成</button>
          ${exercise ? `<a class="button primary" href="#/exercise/${exercise.id}">进入练习</a>` : ""}
          ${next ? `<a class="button secondary" href="#/lessons/${next.id}">下一课</a>` : ""}
        </div>
      </div>
    </section>
  `;
}

function renderExercise(id) {
  const exercise = exercises.find((item) => item.id === id) ?? exercises[0];
  const lesson = lessons.find((item) => item.id === exercise.lessonId);
  const draft = loadDraft(exercise.id) || exercise.starter || "";
  const result = scorePrompt(draft, getExerciseContext(exercise), getExerciseScoreOptions(exercise));

  return `
    <section class="exercise-layout" data-exercise-id="${exercise.id}">
      <aside class="task-pane">
        <a class="back-link" href="#/lessons/${lesson.id}">返回课程</a>
        <span class="eyebrow">${lesson.title}</span>
        <h1>${exercise.title}</h1>
        <p>${exercise.prompt}</p>
        <div class="material-box">
          <span class="meta-label">材料</span>
          <p>${exercise.material}</p>
        </div>
        <details>
          <summary>参考答案</summary>
          <pre>${escapeHtml(exercise.referenceAnswer)}</pre>
        </details>
      </aside>

      <section class="editor-pane">
        <label for="exerciseEditor">你的 prompt</label>
        <textarea id="exerciseEditor" spellcheck="false">${escapeHtml(draft)}</textarea>
        <div class="action-row">
          <button class="button primary" data-score-exercise="${exercise.id}">重新评分</button>
          <button class="button ghost" data-save-exercise="${exercise.id}">保存进度</button>
          <button class="button secondary" data-reset-draft="${exercise.id}">恢复开头</button>
        </div>
      </section>

      <aside class="feedback-pane" id="exerciseFeedback">
        ${renderScore(result)}
      </aside>
    </section>
  `;
}

function renderDiagnose() {
  const draft = loadDraft("diagnose") || "帮我分析一下这个行业，越全面越好。";
  const result = scorePrompt(draft);

  return `
    <section class="diagnose-layout">
      <div class="page-header stacked">
        <span class="eyebrow">Prompt Diagnosis</span>
        <h1>诊断我的 Prompt</h1>
        <p>贴入你的 prompt，先用规则评分找结构缺口。这里不会调用 AI，也不会上传内容。</p>
      </div>
      <section class="editor-pane">
        <label for="diagnoseEditor">待诊断 prompt</label>
        <textarea id="diagnoseEditor" spellcheck="false">${escapeHtml(draft)}</textarea>
        <div class="action-row">
          <button class="button primary" data-score-diagnose>立即诊断</button>
          <button class="button ghost" data-copy-improved>复制参考模板</button>
        </div>
      </section>
      <aside class="feedback-pane" id="diagnoseFeedback">
        ${renderScore(result)}
      </aside>
    </section>
  `;
}

function renderTemplates() {
  const categories = [...new Set(templates.map((template) => template.category))];

  return `
    <section class="page-header">
      <div>
        <span class="eyebrow">Prompt Library</span>
        <h1>模板库</h1>
        <p>先复制能用的结构，再按自己的场景替换变量。</p>
      </div>
    </section>
    <section class="template-layout">
      ${categories
        .map(
          (category) => `
            <div class="template-group">
              <h2>${category}</h2>
              ${templates
                .filter((template) => template.category === category)
                .map(
                  (template) => `
                    <article class="template-card">
                      <div>
                        <h3>${template.title}</h3>
                        <p>${template.useCase}</p>
                      </div>
                      <pre>${escapeHtml(template.body)}</pre>
                      <p class="why">${template.why}</p>
                      <button class="button secondary" data-copy-template="${template.id}">复制模板</button>
                    </article>
                  `,
                )
                .join("")}
            </div>
          `,
        )
        .join("")}
    </section>
  `;
}

function bindGlobalActions(route) {
  document.querySelectorAll("[data-complete-lesson]").forEach((button) => {
    button.addEventListener("click", () => {
      completeLesson(button.dataset.completeLesson);
      render();
    });
  });

  document.querySelectorAll("[data-save-exercise]").forEach((button) => {
    button.addEventListener("click", () => saveExercise(button.dataset.saveExercise));
  });

  document.querySelectorAll("[data-score-exercise]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.scoreExercise;
      const editor = document.querySelector("#exerciseEditor");
      const exercise = exercises.find((item) => item.id === id);
      saveDraft(id, editor.value);
      completeExercise(id);
      document.querySelector("#exerciseFeedback").innerHTML = renderScore(
        scorePrompt(editor.value, getExerciseContext(exercise), getExerciseScoreOptions(exercise)),
      );
    });
  });

  document.querySelectorAll("[data-reset-draft]").forEach((button) => {
    button.addEventListener("click", () => {
      const exercise = exercises.find((item) => item.id === button.dataset.resetDraft);
      const editor = document.querySelector("#exerciseEditor");
      editor.value = exercise.starter || "";
      saveDraft(exercise.id, editor.value);
      document.querySelector("#exerciseFeedback").innerHTML = renderScore(
        scorePrompt(editor.value, getExerciseContext(exercise), getExerciseScoreOptions(exercise)),
      );
    });
  });

  const exerciseEditor = document.querySelector("#exerciseEditor");
  if (exerciseEditor && route.page === "exercise") {
    const exerciseId = route.id;
    exerciseEditor.addEventListener("input", () => {
      saveDraft(exerciseId, exerciseEditor.value);
      const exercise = exercises.find((item) => item.id === exerciseId);
      document.querySelector("#exerciseFeedback").innerHTML = renderScore(
        scorePrompt(exerciseEditor.value, getExerciseContext(exercise), getExerciseScoreOptions(exercise)),
      );
    });
  }

  const diagnoseEditor = document.querySelector("#diagnoseEditor");
  if (diagnoseEditor) {
    diagnoseEditor.addEventListener("input", () => {
      saveDraft("diagnose", diagnoseEditor.value);
      document.querySelector("#diagnoseFeedback").innerHTML = renderScore(scorePrompt(diagnoseEditor.value));
    });
  }

  document.querySelectorAll("[data-score-diagnose]").forEach((button) => {
    button.addEventListener("click", () => {
      const editor = document.querySelector("#diagnoseEditor");
      saveDraft("diagnose", editor.value);
      document.querySelector("#diagnoseFeedback").innerHTML = renderScore(scorePrompt(editor.value));
    });
  });

  document.querySelectorAll("[data-copy-template]").forEach((button) => {
    button.addEventListener("click", () => {
      const template = templates.find((item) => item.id === button.dataset.copyTemplate);
      copyText(template.body, button);
    });
  });

  document.querySelectorAll("[data-copy-improved]").forEach((button) => {
    button.addEventListener("click", () => {
      const editor = document.querySelector("#diagnoseEditor");
      const improved = buildMinimalRewrite(editor.value);
      copyText(improved, button);
    });
  });
}

function renderScore(result) {
  return `
    <div class="score-summary">
      <span class="meta-label">${result.scopeLabel}</span>
      <strong>${result.total} / ${result.max}</strong>
      <div class="progress-track"><span style="width:${Math.round((result.total / result.max) * 100)}%"></span></div>
      <p>${result.verdict}</p>
      ${result.focusLabels.length ? `<div class="focus-list">${result.focusLabels.map((label) => `<span>${label}</span>`).join("")}</div>` : ""}
    </div>
    <div class="score-list">
      ${result.items
        .map(
          (item) => `
            <article class="score-item ${item.score === item.max ? "pass" : ""}">
              <div>
                <strong>${item.label}</strong>
                <span>${item.score}/${item.max}</span>
              </div>
              <p>${item.feedback}</p>
              ${renderScoreChecks(item)}
              ${renderImprovementTips(item)}
            </article>
          `,
        )
        .join("")}
    </div>
    <div class="rewrite-box">
      <span class="meta-label">通用参考模板</span>
      <p>这是规则模板，不是 AI 逐句改写。复制后按你的原文替换变量。</p>
      <pre>${escapeHtml(buildMinimalRewrite(result.source))}</pre>
    </div>
  `;
}

function renderScoreChecks(item) {
  if (!item.checks?.length) return "";
  return `
    <ul class="score-checks">
      ${item.checks
        .map(
          (check) => `
            <li class="${check.pass ? "pass" : "miss"}">
              <span>${check.pass ? "已满足" : "待补"}</span>
              ${escapeHtml(check.label)}
            </li>
          `,
        )
        .join("")}
    </ul>
  `;
}

function renderImprovementTips(item) {
  if (item.score === item.max || (!item.rewrite && !item.tips?.length)) return "";
  const suggestion = item.rewrite || item.tips.join("\n");
  return `
    <div class="score-rewrite">
      <span>参考模板</span>
      <pre>${escapeHtml(suggestion)}</pre>
    </div>
  `;
}

function getExerciseContext(exercise) {
  if (!exercise) return "";
  return [exercise.title, exercise.prompt, exercise.material].filter(Boolean).join("\n");
}

function getExerciseScoreOptions(exercise) {
  return {
    focusKeys: exercise?.focusKeys ?? [],
    scopeLabel:
      exercise?.focusKeys?.length === scoreDimensionLabels.length
        ? "综合评分"
        : exercise?.focusKeys?.length
          ? "本练习评分"
          : "结构评分",
  };
}

function scorePrompt(text, contextText = "", options = {}) {
  const source = text.trim();
  const context = detectPromptContext(`${source}\n${contextText}`);
  const allItems = [
    scoreRole(source, context),
    scoreTask(source, context),
    scoreFramework(source, context),
    scoreOutput(source, context),
    scoreConstraints(source, context),
    scoreVagueWords(source, context),
  ];
  const focusKeys = options.focusKeys?.length ? options.focusKeys : scoreDimensionLabels.map(([key]) => key);
  const items = allItems.filter((item) => focusKeys.includes(item.key));
  const total = items.reduce((sum, item) => sum + item.score, 0);
  const max = items.reduce((sum, item) => sum + item.max, 0);
  const ratio = total / max;
  const focusLabels = scoreDimensionLabels.filter(([key]) => focusKeys.includes(key)).map(([, label]) => label);
  const verdict =
    ratio >= 0.82
      ? "本次练习目标已经比较完整，可以继续打磨例子和边界。"
      : ratio >= 0.55
        ? "有基本方向，但当前练习重点还需要补清楚。"
        : "当前练习重点还不够明确，先按右侧改写建议补齐。";

  return { source, items, total, max, verdict, focusLabels, scopeLabel: options.scopeLabel ?? "结构评分" };
}

function scoreRole(text, context) {
  const roleText = extractRoleText(text);
  const hasWorldview = /你认为.+不是.+而是/.test(roleText);
  const hasIdentity = /你是|你是一|你是一个|你是一位|担任|作为|以.+身份/.test(roleText) || hasWorldview;
  const hasAbility =
    /擅长|熟悉|专门|负责|经验|能力|善于|从.+角度|专家|顾问|分析师|研究|写作者|制定/.test(roleText) || hasWorldview;
  const hasStance = /不做|不是|而是|优先|立场|标准|判断|关注|反对/.test(roleText);
  const score = [hasIdentity, hasAbility, hasStance].filter(Boolean).length;
  return {
    key: "role",
    label: "角色清晰度",
    score,
    max: 3,
    feedback:
      score === 3 ? "角色包含身份、能力和边界。" : "建议补充角色的能力和判断立场，而不只是写一个头衔。",
    checks: [
      { label: "写清角色身份", pass: hasIdentity },
      { label: "写清角色擅长什么", pass: hasAbility },
      { label: "写清判断立场或边界", pass: hasStance },
    ],
    rewrite: score === 3 ? "" : context.roleRewrite,
    tips: [
      !hasAbility && `把第一句改成：${context.roleAbility}`,
      !hasStance && `在角色句后追加：${context.roleStance}`,
      !hasIdentity && `开头先写清身份：${context.roleIdentity}`,
    ].filter(Boolean),
  };
}

function detectPromptContext(text) {
  if (/真实工作场景|自己的场景|建议场景|写出完整 prompt/.test(text)) {
    return {
      roleIdentity: "你是一位适合当前工作场景的专业执行者。",
      roleAbility: "你是一位适合当前工作场景的专业执行者，擅长把模糊需求转成结构化、可交付的工作成果。",
      roleStance: "你优先明确任务对象、输出格式和信息边界，而不是直接给泛泛答案。",
      roleRewrite:
        "你是一位适合当前工作场景的专业执行者，擅长把模糊需求转成结构化、可交付的工作成果。你优先明确任务对象、输出格式和信息边界，而不是直接给泛泛答案。",
      taskObject: "输入对象是用户选择的真实工作材料，例如会议记录、产品资料、文章草稿或业务问题。",
      taskGoal: "目标是产出可直接使用的工作成果。",
      taskRewrite:
        "请基于我提供的真实工作材料完成任务，产出一份可直接使用的工作成果；如果信息不足，请先标注需要补充的内容。",
      frameworkDimensions: "请按目标、输入材料、处理步骤、输出格式和约束五部分写清 prompt。",
      frameworkQuestions: "每一部分都回答：要处理什么、怎么处理、交付什么、不能做什么。",
      frameworkRewrite:
        "请把 prompt 写成五部分：\n1. 角色：谁来完成任务。\n2. 输入对象：要处理什么材料。\n3. 任务目标：最终要解决什么问题。\n4. 输出格式：结果按什么结构交付。\n5. 约束边界：不能补充什么、信息不足如何处理。",
      outputQuantity: "输出格式至少包含 4 个明确字段，并说明信息不足时如何处理。",
      constraintNegative: "不要只写“帮我分析/总结/润色”。",
      evidenceBoundary: "信息不足处标注“待确认”。",
      constraintsRewrite:
        "要求：任务、输入对象、输出格式和约束都要明确；不要只写“帮我分析/总结/润色”；信息不足处标注“待确认”。",
    };
  }

  if (/可复用|模板|文章分析 prompt|结构化分析|贴一篇文章/.test(text)) {
    return {
      roleIdentity: "你是一位文章分析师。",
      roleAbility: "你是一位文章分析师，擅长拆解文章的核心问题、作者主张、论证结构、关键证据和薄弱假设。",
      roleStance: "你只基于原文做判断，不把文章分析写成泛泛摘要。",
      roleRewrite:
        "你是一位文章分析师，擅长拆解文章的核心问题、作者主张、论证结构、关键证据和薄弱假设。你只基于原文做判断，不把文章分析写成泛泛摘要。",
      taskObject: "输入对象是用户提供的【文章】。",
      taskGoal: "目标是得到一份可复用的结构化文章分析结果。",
      taskRewrite: "请阅读用户提供的【文章】，输出一份可复用的结构化文章分析结果。",
      frameworkDimensions: "请按核心问题、作者主张、论证结构、关键证据、薄弱假设和行动启发六部分分析。",
      frameworkQuestions: "每部分都回答：原文说了什么、依据在哪里、这个判断有什么用。",
      frameworkRewrite:
        "请按六部分输出：\n1. 核心问题\n2. 作者主张\n3. 论证结构\n4. 关键证据\n5. 最薄弱假设\n6. 我可以采取的一个行动",
      outputQuantity: "保留【文章】等变量，方便下次替换复用。",
      constraintNegative: "不要脱离原文发挥。",
      evidenceBoundary: "所有判断必须基于原文；信息不足处标注“待确认”。",
      constraintsRewrite:
        "要求：保留【文章】等变量；语言简洁；所有判断必须基于原文；不要脱离原文发挥；信息不足处标注“待确认”。",
    };
  }

  if (/远程办公|团队协作|管理挑战/.test(text)) {
    return {
      roleIdentity: "你是一位面向企业管理者的组织研究写作者。",
      roleAbility:
        "你是一位面向企业管理者的组织研究写作者，擅长从协作方式、管理挑战和组织机制解释远程办公带来的变化。",
      roleStance: "你优先给出对管理者有用的结构化判断，而不是泛泛描述远程办公的优缺点。",
      roleRewrite:
        "你是一位面向企业管理者的组织研究写作者，擅长从协作方式、管理挑战和组织机制解释远程办公带来的变化。你优先给出对管理者有用的结构化判断，而不是泛泛描述远程办公的优缺点。",
      taskObject: "输入对象是“远程办公如何改变团队协作”这个管理议题。",
      taskGoal: "目标是写出一篇面向企业管理者、能提出可执行建议的文章。",
      taskRewrite:
        "请围绕“远程办公如何改变团队协作”写一篇面向企业管理者的文章，目标是解释变化、指出管理挑战，并给出可执行建议。",
      frameworkDimensions: "请按变化现象、管理挑战、可执行建议三部分展开。",
      frameworkQuestions: "每一部分都回答：发生了什么、为什么重要、管理者可以做什么。",
      frameworkRewrite:
        "请按三部分展开：\n1. 变化现象：远程办公改变了哪些协作行为？\n2. 管理挑战：这些变化带来哪些沟通、信任和协同成本？\n3. 可执行建议：管理者可以调整哪些规则、工具和会议方式？",
      outputQuantity: "文章长度约 1000 字，每部分至少给出 2 个具体判断。",
      constraintNegative: "不要写成泛泛的趋势介绍或口号。",
      evidenceBoundary: "如果缺少具体公司信息，请标注“待确认”或写明假设。",
    };
  }

  if (/增长|获客|转化|留存|商业化|公司/.test(text)) {
    return {
      roleIdentity: "你是一位增长诊断顾问。",
      roleAbility:
        "你是一位增长诊断顾问，擅长从用户获取、转化、留存和商业化四个环节识别增长瓶颈。",
      roleStance: "你不做泛泛建议，优先找出最限制增长的结构性约束。",
      roleRewrite:
        "你是一位增长诊断顾问，擅长从用户获取、转化、留存和商业化四个环节识别增长瓶颈。你不做泛泛建议，优先找出最限制增长的结构性约束。",
      taskObject: "输入对象是一家公司的增长问题。",
      taskGoal: "目标是识别最关键的增长瓶颈，并给出优先级明确的改进方向。",
      taskRewrite: "请分析这家公司的增长问题，识别最关键的增长瓶颈，并给出优先级明确的改进方向。",
      frameworkDimensions: "请按用户获取、转化、留存和商业化四个环节分析。",
      frameworkQuestions: "每个环节都回答：当前阻力是什么、证据是什么、下一步如何验证。",
      frameworkRewrite:
        "请按四个环节分析：\n1. 用户获取：目标用户和渠道是否匹配？\n2. 转化：用户在哪一步放弃？\n3. 留存：用户为什么持续使用或流失？\n4. 商业化：收入模式和付费理由是否成立？",
      outputQuantity: "输出三个关键瓶颈，并按影响大小排序。",
      constraintNegative: "不要给泛泛的营销建议。",
      evidenceBoundary: "信息不足处标注“待确认”，不要编造经营数据。",
    };
  }

  if (/在线课程|课程产品|学习|视频仓库|完成成本/.test(text)) {
    return {
      roleIdentity: "你是一位在线教育产品研究员。",
      roleAbility:
        "你是一位在线教育产品研究员，擅长从学习动机、路径清晰度、反馈机制和完成成本分析课程产品。",
      roleStance: "你认为在线课程不是视频仓库，而是帮助用户持续完成学习任务的行为系统。",
      roleRewrite:
        "你是一位在线教育产品研究员，擅长从学习动机、路径清晰度、反馈机制和完成成本分析课程产品。你认为在线课程不是视频仓库，而是帮助用户持续完成学习任务的行为系统。",
      taskObject: "输入对象是一个在线课程产品。",
      taskGoal: "目标是找出影响用户开始学习、持续学习和完成学习的问题。",
      taskRewrite: "请分析这个在线课程产品，找出影响用户开始学习、持续学习和完成学习的问题。",
      frameworkDimensions: "请按学习动机、路径清晰度、反馈机制和完成成本四个角度分析。",
      frameworkQuestions: "每个角度都回答：用户卡在哪里、产品机制如何造成阻力、应该如何改。",
      frameworkRewrite:
        "请按四个角度分析：\n1. 学习动机：用户为什么要开始学？\n2. 路径清晰度：用户是否知道下一步做什么？\n3. 反馈机制：用户能否看到进步和问题？\n4. 完成成本：时间、理解和执行成本是否过高？",
      outputQuantity: "每个角度至少给出 1 个问题和 1 条改进建议。",
      constraintNegative: "不要只罗列功能缺失。",
      evidenceBoundary: "信息不足处写明假设。",
    };
  }

  if (/会议|沟通|团队|决策|冲突|创新|组织文化|组织氛围/.test(text)) {
    return {
      roleIdentity: "你是一个对组织氛围敏感的专业咨询顾问。",
      roleAbility:
        "你是一个对组织氛围敏感的专业咨询顾问，擅长从会议记录中识别团队的沟通模式、决策机制、冲突处理方式和创新状态。",
      roleStance: "你不评价个人性格，优先判断互动方式背后的组织规则、协作成本和信任水平。",
      roleRewrite:
        "你是一个对组织氛围敏感的专业咨询顾问，擅长从会议记录中识别团队的沟通模式、决策机制、冲突处理方式和创新状态。你不评价个人性格，优先判断互动方式背后的组织规则、协作成本和信任水平。",
      taskObject: "输入对象是团队会议记录中的发言、回应、决策和冲突处理片段。",
      taskGoal: "分析结果用于识别团队沟通文化的主要问题，并给出可改进的管理动作。",
      taskRewrite:
        "请根据团队会议记录中的发言、回应、决策和冲突处理片段，分析团队沟通文化的主要问题，并给出可改进的管理动作。",
      frameworkDimensions:
        "请按四个维度分析：沟通方式、决策方式、冲突处理方式、创新情况。",
      frameworkQuestions:
        "在沟通维度下回答三个具体问题：是否直接说明事实和诉求？是否有人追问依据和责任人？不同意见出现时是被讨论、忽略还是转移？",
      frameworkRewrite:
        "请按四个维度分析：\n1. 沟通方式：是否直接说明事实和诉求？是否有人追问依据和责任人？\n2. 决策方式：决策依据来自数据、权威、共识还是惯例？\n3. 冲突处理方式：不同意见出现时是被讨论、忽略还是转移？\n4. 创新情况：新想法是否被追问、试验和推进？",
      outputQuantity: "每个关键判断至少给出 1 条会议记录依据和 1 条改进建议。",
      constraintNegative: "不要把问题归因于某个人性格，也不要写成泛泛的团队氛围评价。",
      evidenceBoundary: "如果会议记录中没有足够证据，请标注“待确认”，不要补充记录外的细节。",
      constraintsRewrite:
        "要求：语言具体、克制；不要把问题归因于某个人性格；不要写成泛泛的团队氛围评价；如果会议记录中没有足够证据，请标注“待确认”。",
    };
  }

  if (/润色|洗练|高级|原意|流行语|形容词/.test(text)) {
    return {
      roleIdentity: "你是一位文笔洗练师。",
      roleAbility: "你是一位文笔洗练师，擅长在保留原意的前提下让表达更简洁、准确、有节奏。",
      roleStance: "你不新增原文没有的观点，也不为了显得高级而牺牲逻辑清晰。",
      roleRewrite:
        "你是一位文笔洗练师，擅长在保留原意的前提下让表达更简洁、准确、有节奏。你不新增原文没有的观点，也不为了显得高级而牺牲逻辑清晰。",
      taskObject: "输入对象是用户提供的一段文字。",
      taskGoal: "目标是在保留原意的基础上完成洗练改写。",
      taskRewrite: "请保留原意改写用户提供的文字，目标是让表达更简洁、准确、有节奏。",
      frameworkDimensions: "请按原意保留、表达压缩、语气准确三个维度处理。",
      frameworkQuestions: "修改时检查：是否改变原意？是否减少冗余？是否使用了更清晰的动词？",
      frameworkRewrite:
        "请按三个步骤处理：\n1. 保留原意：不新增原文没有的观点。\n2. 压缩表达：删掉重复、虚词和堆叠形容词。\n3. 调整语气：多用清晰动词，少用夸张修饰。",
      outputQuantity: "只输出改写后的文本；如有必要，可附 2 条修改说明。",
      constraintNegative: "禁止新增原文没有的观点，禁止使用网络流行语，禁止把简单意思写得绕。",
      evidenceBoundary: "如果原文信息不足，请标注“待确认”。",
      constraintsRewrite:
        "要求：语言克制、准确；减少形容词堆叠，多使用清晰动词；禁止新增原文没有的观点；禁止使用网络流行语；禁止把简单意思写得绕。",
    };
  }

  if (/公众号|爆款|标题|开头|结尾|节奏|写作|文章/.test(text)) {
    return {
      roleIdentity: "你是一位公众号内容诊断顾问。",
      roleAbility:
        "你是一位公众号内容诊断顾问，擅长从选题、标题、开头、内容展开、结尾转化和阅读节奏判断文章的传播潜力。",
      roleStance: "你不做泛泛夸奖，优先指出影响读者点击、读完和转发的具体问题。",
      roleRewrite:
        "你是一位公众号内容诊断顾问，擅长从选题、标题、开头、内容展开、结尾转化和阅读节奏判断文章的传播潜力。你不做泛泛夸奖，优先指出影响读者点击、读完和转发的具体问题。",
      taskObject: "输入对象是用户给定的公众号文章全文，包括标题、开头、正文、结尾和节奏安排。",
      taskGoal: "诊断目标是找出影响文章成为爆款的具体问题，并给出可执行的修改方向。",
      taskRewrite:
        "请诊断用户给定的公众号文章全文，包括标题、开头、正文展开、结尾转化和阅读节奏。诊断目标是找出影响文章成为爆款的具体问题，并给出可执行的修改方向。",
      frameworkDimensions: "请按标题、开头、内容展开、结尾转化、阅读节奏五个维度分析。",
      frameworkQuestions:
        "每个维度都回答：当前写法的问题是什么？它会如何影响点击、读完或转发？应该如何修改？",
      frameworkRewrite:
        "请按五个维度分析：\n1. 标题：是否有明确利益点、冲突或好奇心？\n2. 开头：是否在前三段建立问题、场景或情绪张力？\n3. 内容展开：论点是否清楚，案例和判断是否支撑主线？\n4. 结尾转化：是否推动评论、收藏、转发或行动？\n5. 阅读节奏：段落长度、信息密度和转场是否影响读完率？",
      outputQuantity: "每个关键判断至少给出 1 条原文依据和 1 条具体修改建议。",
      constraintNegative: "不要只说“吸引人、增强共鸣、优化结构”这类泛泛建议。",
      evidenceBoundary: "如果没有看到原文或信息不足，请标注“待确认”，不要编造文章内容。",
      constraintsRewrite:
        "要求：语言具体、克制；不要只说“吸引人、增强共鸣、优化结构”这类泛泛建议；如果没有看到原文或信息不足，请标注“待确认”，不要编造文章内容。",
    };
  }

  if (/加班|年轻人|薪酬|晋升|员工|职场/.test(text)) {
    return {
      roleIdentity: "你是一位面向管理层提供组织诊断建议的企业 HR。",
      roleAbility:
        "你是一位面向管理层提供组织诊断建议的企业 HR，擅长从组织制度、激励机制和员工关系角度解释行为变化。",
      roleStance: "你优先寻找可被组织改进的结构性原因，而不是把问题归因于员工态度。",
      roleRewrite:
        "你是一位面向管理层提供组织诊断建议的企业 HR，擅长从组织制度、激励机制和员工关系角度解释行为变化。你优先寻找可被组织改进的结构性原因，而不是把问题归因于员工态度。",
      taskObject: "分析对象是“年轻人不喜欢加班”这一职场现象。",
      taskGoal: "分析结果用于帮助企业调整薪酬、晋升和组织管理机制。",
      taskRewrite:
        "请分析“年轻人不喜欢加班”这一职场现象，识别背后的制度和关系变化，并给出企业在薪酬、晋升和组织管理上的改进方向。",
      frameworkDimensions: "请按现象层、机制层、本质层展开。",
      frameworkQuestions: "每一层都回答：看到了什么、为什么发生、对组织改进意味着什么。",
      frameworkRewrite:
        "请按三层分析：\n1. 现象层：年轻人不喜欢加班的具体表现，以及下班后的时间流向。\n2. 机制层：薪酬、晋升和组织管理如何影响加班选择。\n3. 本质层：员工与组织之间的交换关系、信任关系或边界感发生了什么变化。",
      outputQuantity: "每个关键判断至少给出 2 条依据，并对应 1 条组织改进建议。",
      constraintNegative: "不要写成对年轻人的道德评价或空泛口号。",
      evidenceBoundary: "信息不足处标注“待确认”，不要编造企业内部数据。",
      constraintsRewrite:
        "要求：语言具体、克制；不要写成对年轻人的道德评价或空泛口号；信息不足处标注“待确认”，不要编造企业内部数据。",
    };
  }

  if (/市场|竞争|壁垒|风险|用户需求|增长驱动/.test(text)) {
    return {
      roleIdentity: "你是一位市场分析顾问。",
      roleAbility: "你是一位市场分析顾问，擅长从用户需求、竞争格局、增长驱动、进入壁垒和主要风险拆解市场机会。",
      roleStance: "你不追求面面俱到，优先识别会影响进入决策的关键约束。",
      roleRewrite:
        "你是一位市场分析顾问，擅长从用户需求、竞争格局、增长驱动、进入壁垒和主要风险拆解市场机会。你不追求面面俱到，优先识别会影响进入决策的关键约束。",
      taskObject: "输入对象是用户指定的目标市场。",
      taskGoal: "目标是判断这个市场是否值得进入，以及下一步需要验证什么。",
      taskRewrite: "请分析【目标市场】，判断这个市场是否值得进入，并说明下一步需要验证什么。",
      frameworkDimensions: "请按用户需求、竞争格局、增长驱动、进入壁垒和主要风险五部分输出。",
      frameworkQuestions: "每部分都回答：关键判断是什么、证据来源是什么、还缺什么信息。",
      frameworkRewrite:
        "请按五部分输出：\n1. 用户需求：真实需求和付费动机是什么？\n2. 竞争格局：主要玩家和差异化空间在哪里？\n3. 增长驱动：市场增长来自哪里？\n4. 进入壁垒：渠道、产品、资金或资质门槛是什么？\n5. 主要风险：最可能导致判断失误的因素是什么？",
      outputQuantity: "每部分给出关键判断和证据来源。",
      constraintNegative: "不要用“前景广阔、潜力巨大”这类空泛判断。",
      evidenceBoundary: "信息不足处标注假设或“待确认”。",
      constraintsRewrite:
        "要求：每个判断都说明证据来源；不要用“前景广阔、潜力巨大”这类空泛判断；信息不足处标注假设或“待确认”。",
    };
  }

  if (/会议总结|会议纪要|待办|负责人|截止时间|会议记录/.test(text)) {
    return {
      roleIdentity: "你是一位会议纪要整理专家。",
      roleAbility: "你是一位会议纪要整理专家，擅长把会议记录整理成结论、责任人、截止时间和风险点。",
      roleStance: "你只基于会议记录提取信息，不补充记录中没有的内容。",
      roleRewrite:
        "你是一位会议纪要整理专家，擅长把会议记录整理成结论、责任人、截止时间和风险点。你只基于会议记录提取信息，不补充记录中没有的内容。",
      taskObject: "输入对象是用户提供的会议记录。",
      taskGoal: "目标是把会议内容转成可执行的行动清单。",
      taskRewrite: "请根据用户提供的会议记录，整理出可执行的会议纪要和行动清单。",
      frameworkDimensions: "请按会议目标、关键结论、待办事项、负责人、截止时间、风险点和追问问题输出。",
      frameworkQuestions: "每个待办事项都回答：谁负责、什么时候完成、风险是什么。",
      frameworkRewrite:
        "请按以下结构输出：\n1. 会议目标\n2. 关键结论\n3. 待办事项\n4. 负责人\n5. 截止时间\n6. 风险点\n7. 需要追问的问题",
      outputQuantity: "每个待办事项都必须包含负责人和截止时间；缺失则标注“待确认”。",
      constraintNegative: "不要补充会议记录中没有的信息。",
      evidenceBoundary: "不确定内容标注为“待确认”。",
      constraintsRewrite:
        "要求：不要补充会议记录中没有的信息；不确定内容标注为“待确认”；每个待办事项尽量包含负责人和截止时间。",
    };
  }

  return {
    roleIdentity: "你是一位面向业务负责人提供诊断建议的专业顾问。",
    roleAbility: "你是一位面向业务负责人提供诊断建议的专业顾问，擅长从事实、机制和风险中提炼关键判断。",
    roleStance: "你优先给出基于证据的结构性判断，而不是泛泛评价。",
    roleRewrite:
      "你是一位面向业务负责人提供诊断建议的专业顾问，擅长从事实、机制和风险中提炼关键判断。你优先给出基于证据的结构性判断，而不是泛泛评价。",
    taskObject: "输入对象是用户提供的材料、记录或现象描述。",
    taskGoal: "分析结果用于帮助用户做出下一步行动决策。",
    taskRewrite:
      "请分析用户提供的材料、记录或现象描述，找出关键问题，并给出可执行的下一步行动建议。",
    frameworkDimensions: "请按现象、原因、影响和建议四个维度展开。",
    frameworkQuestions: "每个维度都回答：是什么、依据是什么、下一步要做什么。",
    frameworkRewrite:
      "请按四个维度分析：\n1. 现象：当前能观察到什么？\n2. 原因：这些现象可能由什么机制造成？\n3. 影响：它会带来什么风险或机会？\n4. 建议：下一步应该做什么？",
    outputQuantity: "每个关键判断至少给出 1 条依据和 1 条行动建议。",
    constraintNegative: "不要使用空泛口号，不要补充材料中没有的信息。",
    evidenceBoundary: "信息不足处标注“待确认”。",
    constraintsRewrite:
      "要求：语言具体、克制；不要使用空泛口号；不要补充材料中没有的信息；信息不足处标注“待确认”。",
  };
}

function extractRoleText(text) {
  const firstLine = text.split(/\n/)[0] ?? text;
  const requestIndex = firstLine.search(/请|帮我|请你|请根据|请围绕|输出|生成/);
  return requestIndex > 0 ? firstLine.slice(0, requestIndex) : firstLine.slice(0, 220);
}

function scoreTask(text, context) {
  const hasAction = /请|帮我|输出|生成|分析|改写|整理|诊断|比较|制定|寻找|识别/.test(text);
  const hasObject =
    /文章|会议|产品|公司|行业|材料|文本|记录|资料|问题|场景|现象|年轻人|加班|组织|制度|员工|职场|课程|内容|市场|边界/.test(
      text,
    );
  const hasGoal = /目标|为了|完成|得到|用于|面向|寻找|方向|改进|解决|支持|帮助|产出|指导|选择|判断|适合/.test(text);
  const score = [hasAction, hasObject, hasGoal].filter(Boolean).length;
  return {
    key: "task",
    label: "任务明确度",
    score,
    max: 3,
    feedback: score === 3 ? "任务、对象和目标比较明确。" : "建议说明输入对象和最终要完成的目标。",
    checks: [
      { label: "写清要做什么动作", pass: hasAction },
      { label: "写清输入对象或分析对象", pass: hasObject },
      { label: "写清结果用途或目标", pass: hasGoal },
    ],
    rewrite: score === 3 ? "" : context.taskRewrite,
    tips: [
      !hasAction && "在角色句后加：请分析这份材料，并识别最需要改进的问题。",
      !hasObject && `在任务句里写明对象：${context.taskObject}`,
      !hasGoal && `在第一段末尾加一句目标：${context.taskGoal}`,
    ].filter(Boolean),
  };
}

function scoreFramework(text, context) {
  const questionCount = (text.match(/[？?]/g) ?? []).length;
  const hasSequence =
    /第一|第二|第三|1\.|2\.|3\.|一、|二、|三、|1、|2、|3、|三层|四个|五个|五部分|六部分|七部分/.test(text) ||
    questionCount >= 3;
  const hasDimensions = /维度|步骤|层|框架|路径|部分|角度/.test(text);
  const hasQuestions = /为什么|如何|什么|是否|哪些|哪里|怎样|原因|解释|影响|变化|判断|证据|依据|来源|问题/.test(text);
  const score = [hasSequence, hasDimensions, hasQuestions].filter(Boolean).length;
  return {
    key: "framework",
    label: "框架可执行性",
    score,
    max: 3,
    feedback: score === 3 ? "已经有可执行分析路径。" : "把“深入/全面”改成维度、步骤或问题链。",
    checks: [
      { label: "有编号或顺序", pass: hasSequence },
      { label: "有维度、步骤或层次", pass: hasDimensions },
      { label: "有具体问题链", pass: hasQuestions },
    ],
    rewrite: score === 3 ? "" : context.frameworkRewrite,
    tips: [
      !hasSequence && "把分析要求改成编号列表，例如：1. 先识别事实；2. 再解释机制；3. 最后给出建议。",
      !hasDimensions && `在“请按以下框架输出”前加：${context.frameworkDimensions}`,
      !hasQuestions && `在维度后补问题链：${context.frameworkQuestions}`,
    ].filter(Boolean),
  };
}

function scoreOutput(text, context) {
  const hasFormat = /输出|报告|清单|表格|模板|卡片|格式|结构|框架/.test(text);
  const hasFields = /包含|包括|分为|部分|字段|结论|建议|证据|依据/.test(text);
  const hasQuantity = /一句话|三个|五个|按优先级|字|条|关键判断|判断的依据|反例|风险|行动建议/.test(text);
  const score = [hasFormat, hasFields, hasQuantity].filter(Boolean).length;
  return {
    key: "output",
    label: "输出具体度",
    score,
    max: 3,
    feedback: score === 3 ? "交付物形状清楚。" : "建议明确输出格式，以及结果必须包含哪些部分。",
    checks: [
      { label: "写清输出形式", pass: hasFormat },
      { label: "写清包含字段", pass: hasFields },
      { label: "写清数量或颗粒度", pass: hasQuantity },
    ],
    rewrite:
      score === 3
        ? ""
        : `请按以下结构输出：\n1. 一句话结论\n2. 三个关键判断\n3. 每个判断的依据\n4. 可能的反例或风险\n5. 下一步行动建议\n\n${context.outputQuantity}`,
    tips: [
      !hasFormat && "在输出要求前加：请输出一份结构化诊断报告。",
      !hasFields && "在输出框架中加一项：每个判断都要包含“依据、风险、行动建议”。",
      !hasQuantity && `在输出框架后加：${context.outputQuantity}`,
    ].filter(Boolean),
  };
}

function scoreConstraints(text, context) {
  const hasStyle = /语言|风格|语气|克制|简洁|具体|中立|专业/.test(text);
  const hasNegative = /禁止|不要|避免|不得|不可|不能/.test(text);
  const hasEvidenceBoundary = /证据|依据|假设|不确定|反例|边界|原文|待确认|信息不足/.test(text);
  const score = [hasStyle, hasNegative, hasEvidenceBoundary].filter(Boolean).length;
  return {
    key: "constraints",
    label: "约束有效性",
    score,
    max: 3,
    feedback: score === 3 ? "风格、禁止项和证据边界都比较清楚。" : "建议补充风格要求、禁止项或证据边界。",
    checks: [
      { label: "有语言风格要求", pass: hasStyle },
      { label: "有禁止项", pass: hasNegative },
      { label: "有证据或信息边界", pass: hasEvidenceBoundary },
    ],
    rewrite:
      score === 3
        ? ""
        : context.constraintsRewrite ||
          `要求：语言具体、克制；${context.constraintNegative}${context.evidenceBoundary}`,
    tips: [
      !hasStyle && "补风格：语言具体、克制，少用价值判断。",
      !hasNegative && `在“要求”里追加：${context.constraintNegative}`,
      !hasEvidenceBoundary && `在“要求”里追加：${context.evidenceBoundary}`,
    ].filter(Boolean),
  };
}

function scoreVagueWords(text, context) {
  const vagueWords = ["深入", "全面", "专业", "高级", "优化", "分析一下", "润色一下"];
  const hits = vagueWords.filter((word) => text.includes(word));
  const hasStructure = /维度|步骤|层|框架|输出|包含|第一|1\./.test(text);
  const score = hits.length === 0 || hasStructure ? 3 : 1;
  return {
    key: "vague",
    label: "空泛词风险",
    score,
    max: 3,
    feedback:
      hits.length === 0
        ? "没有明显空泛词。"
        : hasStructure
          ? `出现了“${hits.join("、")}”，但已有结构承接。`
          : `出现了“${hits.join("、")}”，建议改成具体判断标准或步骤。`,
    checks: [
      { label: "没有明显空泛词", pass: hits.length === 0 },
      { label: "空泛词有结构承接", pass: hits.length === 0 || hasStructure },
      { label: "要求可检查、可执行", pass: score === 3 },
    ],
    rewrite:
      hits.length > 0 && !hasStructure
        ? `把“${hits.join("、")}”改成可检查的输出要求，例如：说明关键判断、依据、风险和下一步行动。`
        : "",
    tips:
      hits.length > 0 && !hasStructure
        ? ["把空泛词替换成可检查的要求，例如“说明原因、依据、风险和行动建议”。”"]
        : [],
  };
}

function buildMinimalRewrite(text) {
  const source = text.trim() || "请在这里写入你的需求。";
  return `你是一位【角色】，擅长【核心能力】。请针对【输入对象】完成：${source}

请按以下框架输出：
1. 一句话结论
2. 三个关键判断
3. 每个判断的依据
4. 可能的反例或风险
5. 下一步行动建议

要求：语言具体、克制；不要空泛口号；信息不足处标注为“待确认”。`;
}

function completeLesson(id) {
  if (!state.completedLessonIds.includes(id)) {
    state.completedLessonIds.push(id);
  }
  state.lastLessonId = id;
  saveProgress();
}

function completeExercise(id) {
  if (!state.completedExerciseIds.includes(id)) {
    state.completedExerciseIds.push(id);
  }
  const exercise = exercises.find((item) => item.id === id);
  if (exercise) {
    completeLesson(exercise.lessonId);
  } else {
    saveProgress();
  }
}

function saveExercise(id) {
  const editor = document.querySelector("#exerciseEditor");
  saveDraft(id, editor.value);
  completeExercise(id);
  const button = document.querySelector(`[data-save-exercise="${id}"]`);
  flashButton(button, "已保存");
}

function loadProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    return {
      completedLessonIds: parsed.completedLessonIds ?? [],
      completedExerciseIds: parsed.completedExerciseIds ?? [],
      lastLessonId: parsed.lastLessonId ?? "",
      lastExerciseId: parsed.lastExerciseId ?? "",
    };
  } catch {
    return { completedLessonIds: [], completedExerciseIds: [], lastLessonId: "", lastExerciseId: "" };
  }
}

function saveProgress() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function saveDraft(id, value) {
  localStorage.setItem(`${draftKeyPrefix}${id}`, value);
}

function loadDraft(id) {
  return localStorage.getItem(`${draftKeyPrefix}${id}`) ?? "";
}

function getCompletedLessonCount() {
  return state.completedLessonIds.length;
}

function getProgressPercent() {
  return Math.round((getCompletedLessonCount() / lessons.length) * 100);
}

function getNextLesson() {
  return lessons.find((lesson) => !state.completedLessonIds.includes(lesson.id)) ?? lessons[lessons.length - 1];
}

function getNextLessonAfter(id) {
  const index = lessons.findIndex((lesson) => lesson.id === id);
  return lessons[index + 1] ?? null;
}

async function copyText(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    flashButton(button, "已复制");
  } catch {
    flashButton(button, "复制失败");
  }
}

function flashButton(button, label) {
  if (!button) return;
  const old = button.textContent;
  button.textContent = label;
  window.setTimeout(() => {
    button.textContent = old;
  }, 1200);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
