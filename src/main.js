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
  const result = scorePrompt(draft);

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
          <button class="button ghost" data-copy-improved>复制最小修改建议</button>
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
      saveDraft(id, editor.value);
      completeExercise(id);
      document.querySelector("#exerciseFeedback").innerHTML = renderScore(scorePrompt(editor.value));
    });
  });

  document.querySelectorAll("[data-reset-draft]").forEach((button) => {
    button.addEventListener("click", () => {
      const exercise = exercises.find((item) => item.id === button.dataset.resetDraft);
      const editor = document.querySelector("#exerciseEditor");
      editor.value = exercise.starter || "";
      saveDraft(exercise.id, editor.value);
      document.querySelector("#exerciseFeedback").innerHTML = renderScore(scorePrompt(editor.value));
    });
  });

  const exerciseEditor = document.querySelector("#exerciseEditor");
  if (exerciseEditor && route.page === "exercise") {
    const exerciseId = route.id;
    exerciseEditor.addEventListener("input", () => {
      saveDraft(exerciseId, exerciseEditor.value);
      document.querySelector("#exerciseFeedback").innerHTML = renderScore(scorePrompt(exerciseEditor.value));
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
      <span class="meta-label">结构评分</span>
      <strong>${result.total} / ${result.max}</strong>
      <div class="progress-track"><span style="width:${Math.round((result.total / result.max) * 100)}%"></span></div>
      <p>${result.verdict}</p>
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
            </article>
          `,
        )
        .join("")}
    </div>
    <div class="rewrite-box">
      <span class="meta-label">最小修改建议</span>
      <pre>${escapeHtml(buildMinimalRewrite(result.source))}</pre>
    </div>
  `;
}

function scorePrompt(text) {
  const source = text.trim();
  const items = [
    scoreRole(source),
    scoreTask(source),
    scoreFramework(source),
    scoreOutput(source),
    scoreConstraints(source),
    scoreVagueWords(source),
  ];
  const total = items.reduce((sum, item) => sum + item.score, 0);
  const max = items.reduce((sum, item) => sum + item.max, 0);
  const ratio = total / max;
  const verdict =
    ratio >= 0.82
      ? "结构已经比较完整，可以继续打磨例子和边界。"
      : ratio >= 0.55
        ? "有基本方向，但还需要补框架、输出或约束。"
        : "目前更像一句愿望，需要先补齐结构。";

  return { source, items, total, max, verdict };
}

function scoreRole(text) {
  let score = 0;
  if (/你是|担任|作为/.test(text)) score += 1;
  if (/擅长|熟悉|专门|负责/.test(text)) score += 1;
  if (/不做|不是|而是|优先|立场|标准/.test(text)) score += 1;
  return {
    key: "role",
    label: "角色清晰度",
    score,
    max: 3,
    feedback:
      score === 3 ? "角色包含身份、能力和边界。" : "建议补充角色的能力和判断立场，而不只是写一个头衔。",
  };
}

function scoreTask(text) {
  let score = 0;
  if (/请|帮我|输出|生成|分析|改写|整理|诊断|比较|制定/.test(text)) score += 1;
  if (/文章|会议|产品|公司|行业|材料|文本|记录|资料|问题|场景/.test(text)) score += 1;
  if (/目标|为了|完成|得到|用于|面向/.test(text)) score += 1;
  return {
    key: "task",
    label: "任务明确度",
    score,
    max: 3,
    feedback: score === 3 ? "任务、对象和目标比较明确。" : "建议说明输入对象和最终要完成的目标。",
  };
}

function scoreFramework(text) {
  let score = 0;
  if (/第一|第二|第三|1\.|2\.|3\.|一、|二、|三、/.test(text)) score += 1;
  if (/维度|步骤|层|框架|路径|部分|角度/.test(text)) score += 1;
  if (/为什么|如何|什么|是否|哪些|哪里|怎样/.test(text)) score += 1;
  return {
    key: "framework",
    label: "框架可执行性",
    score,
    max: 3,
    feedback: score === 3 ? "已经有可执行分析路径。" : "把“深入/全面”改成维度、步骤或问题链。",
  };
}

function scoreOutput(text) {
  let score = 0;
  if (/输出|报告|清单|表格|模板|卡片|格式|结构/.test(text)) score += 1;
  if (/包含|包括|分为|部分|字段|结论|建议|证据/.test(text)) score += 1;
  if (/一句话|三个|五个|按优先级|字|条/.test(text)) score += 1;
  return {
    key: "output",
    label: "输出具体度",
    score,
    max: 3,
    feedback: score === 3 ? "交付物形状清楚。" : "建议明确输出格式，以及结果必须包含哪些部分。",
  };
}

function scoreConstraints(text) {
  let score = 0;
  if (/语言|风格|语气|克制|简洁|具体|中立|专业/.test(text)) score += 1;
  if (/禁止|不要|避免|不得|不可/.test(text)) score += 1;
  if (/证据|依据|假设|不确定|反例|边界|原文/.test(text)) score += 1;
  return {
    key: "constraints",
    label: "约束有效性",
    score,
    max: 3,
    feedback: score === 3 ? "风格、禁止项和证据边界都比较清楚。" : "建议补充风格要求、禁止项或证据边界。",
  };
}

function scoreVagueWords(text) {
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
