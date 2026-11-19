import {
  deleteExam,
  deleteSubmission,
  getExamById,
  getLocalCloudConfig,
  getStorageMode,
  getTeacherPin,
  listExams,
  listSubmissions,
  resetDemoData,
  saveExam,
  setLocalCloudConfig,
  setTeacherPin
} from './storage.js';
import {
  OPTION_KEYS,
  createEmptyExamTemplate,
  escapeHtml,
  flattenExamQuestions,
  formatDateTime,
  formatDurationText,
  generateId,
  validateExam
} from './utils.js';

const TEACHER_UNLOCK_KEY = 'tv_teacher_unlocked';

const pinGateSection = document.getElementById('pinGateSection');
const pinForm = document.getElementById('pinForm');
const pinInput = document.getElementById('pinInput');
const pinError = document.getElementById('pinError');
const demoQuickLoginBtn = document.getElementById('demoQuickLoginBtn');

const teacherApp = document.getElementById('teacherApp');
const teacherStorageBadge = document.getElementById('teacherStorageBadge');
const localModeNotice = document.getElementById('localModeNotice');

const tabExams = document.getElementById('tabExams');
const tabScores = document.getElementById('tabScores');
const tabSettings = document.getElementById('tabSettings');

const examListPanel = document.getElementById('examListPanel');
const examEditorPanel = document.getElementById('examEditorPanel');
const teacherExamList = document.getElementById('teacherExamList');

const editorHeading = document.getElementById('editorHeading');
const editorCompletionBadge = document.getElementById('editorCompletionBadge');
const editorTitle = document.getElementById('editorTitle');
const editorDuration = document.getElementById('editorDuration');
const editorDesc = document.getElementById('editorDesc');
const editorPublished = document.getElementById('editorPublished');
const editorErrorBox = document.getElementById('editorErrorBox');

const editorPart1 = document.getElementById('editorPart1');
const editorPart2 = document.getElementById('editorPart2');
const editorPart3 = document.getElementById('editorPart3');

const filterScoreExam = document.getElementById('filterScoreExam');
const searchScoreStudent = document.getElementById('searchScoreStudent');
const scoresTableBody = document.getElementById('scoresTableBody');
const scoreStatsGrid = document.getElementById('scoreStatsGrid');
const wrongStatsCard = document.getElementById('wrongStatsCard');
const wrongStatsGrid = document.getElementById('wrongStatsGrid');

const quickImportModal = document.getElementById('quickImportModal');
const quickImportTextarea = document.getElementById('quickImportTextarea');
const submissionDetailModal = document.getElementById('submissionDetailModal');
const subDetailTitle = document.getElementById('subDetailTitle');
const subDetailBody = document.getElementById('subDetailBody');

let examsCache = [];
let submissionsCache = [];
let editingExam = null;

function isTeacherUnlocked() {
  return sessionStorage.getItem(TEACHER_UNLOCK_KEY) === '1';
}

function unlockTeacher() {
  sessionStorage.setItem(TEACHER_UNLOCK_KEY, '1');
  pinGateSection.classList.add('hidden');
  teacherApp.classList.remove('hidden');
  initTeacherWorkspace();
}

async function refreshStorageStatus() {
  const mode = await getStorageMode();
  if (mode.mode === 'supabase') {
    teacherStorageBadge.textContent = 'Đồng bộ Cloud (Supabase)';
    teacherStorageBadge.className = 'badge badge-green';
    localModeNotice.classList.add('hidden');
  } else {
    teacherStorageBadge.textContent = 'Lưu cục bộ (LocalStorage)';
    teacherStorageBadge.className = 'badge badge-blue';
    localModeNotice.classList.remove('hidden');
  }
}

function switchMainTab(tabName) {
  document.querySelectorAll('[data-main-tab]').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-main-tab') === tabName);
  });
  tabExams.classList.toggle('hidden', tabName !== 'exams');
  tabScores.classList.toggle('hidden', tabName !== 'scores');
  tabSettings.classList.toggle('hidden', tabName !== 'settings');

  if (tabName === 'scores') {
    loadAndRenderScores();
  }
}

function switchEditorTab(partName) {
  document.querySelectorAll('[data-editor-tab]').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-editor-tab') === partName);
  });
  editorPart1.classList.toggle('hidden', partName !== 'part1');
  editorPart2.classList.toggle('hidden', partName !== 'part2');
  editorPart3.classList.toggle('hidden', partName !== 'part3');
}

async function loadAndRenderExams() {
  examsCache = await listExams({ includeUnpublished: true });
  renderTeacherExamList();
  populateScoreExamFilter();
}

function renderTeacherExamList() {
  if (!examsCache.length) {
    teacherExamList.innerHTML = `
      <div class="card" style="grid-column:1/-1;">
        <div class="card-body" style="text-align:center; padding:36px;">
          <p style="margin:0 0 12px; color:var(--text-secondary);">Chưa có đề thi nào.</p>
          <button type="button" class="btn btn-primary" id="emptyCreateBtn">+ Tạo đề mới (30 câu)</button>
        </div>
      </div>
    `;
    document.getElementById('emptyCreateBtn')?.addEventListener('click', () => openEditor(null));
    return;
  }

  teacherExamList.innerHTML = examsCache
    .map((exam) => {
      const total = flattenExamQuestions(exam).length;
      const publishedBadge = exam.isPublished !== false
        ? '<span class="badge badge-green">Đang mở</span>'
        : '<span class="badge badge-amber">Đang ẩn</span>';

      return `
        <article class="card">
          <div class="card-body">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap;">
              ${publishedBadge}
              <span class="badge">${total} câu • ${Number(exam.durationMinutes) || 40} phút</span>
            </div>
            <h3 class="exam-card-title">${escapeHtml(exam.title)}</h3>
            <p class="exam-card-desc">${escapeHtml(exam.description || 'Chưa có mô tả.')}</p>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button type="button" class="btn btn-primary btn-sm" data-edit-exam="${escapeHtml(exam.id)}">Sửa đề</button>
              <a href="/exam?id=${encodeURIComponent(exam.id)}" target="_blank" rel="noopener" class="btn btn-soft btn-sm">Xem thử đề</a>
              <button type="button" class="btn btn-outline btn-sm" data-toggle-pub="${escapeHtml(exam.id)}">
                ${exam.isPublished !== false ? 'Ẩn đề' : 'Mở đề'}
              </button>
              <button type="button" class="btn btn-outline btn-sm" data-copy-link="${escapeHtml(exam.id)}">Copy link thi</button>
              <button type="button" class="btn btn-outline btn-sm" data-export-json="${escapeHtml(exam.id)}">Tải JSON</button>
              <button type="button" class="btn btn-danger-soft btn-sm" data-delete-exam="${escapeHtml(exam.id)}">Xóa</button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  teacherExamList.querySelectorAll('[data-edit-exam]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const exam = examsCache.find((e) => e.id === btn.getAttribute('data-edit-exam'));
      if (exam) openEditor(exam);
    });
  });

  teacherExamList.querySelectorAll('[data-toggle-pub]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const exam = examsCache.find((e) => e.id === btn.getAttribute('data-toggle-pub'));
      if (!exam) return;
      await saveExam({ ...exam, isPublished: exam.isPublished === false });
      await loadAndRenderExams();
    });
  });

  teacherExamList.querySelectorAll('[data-copy-link]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-copy-link');
      const url = `${window.location.origin}/exam?id=${encodeURIComponent(id)}`;
      try {
        await navigator.clipboard.writeText(url);
        btn.textContent = 'Đã copy link!';
        setTimeout(() => (btn.textContent = 'Copy link thi'), 1800);
      } catch {
        window.prompt('Sao chép đường dẫn làm bài cho học sinh:', url);
      }
    });
  });

  teacherExamList.querySelectorAll('[data-export-json]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const exam = examsCache.find((e) => e.id === btn.getAttribute('data-export-json'));
      if (!exam) return;
      const blob = new Blob([JSON.stringify(exam, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${exam.id}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    });
  });

  teacherExamList.querySelectorAll('[data-delete-exam]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-delete-exam');
      const exam = examsCache.find((e) => e.id === id);
      if (!exam) return;
      if (!window.confirm(`Bạn có chắc muốn xóa đề "${exam.title}" không?`)) return;
      await deleteExam(id);
      await loadAndRenderExams();
    });
  });
}

function renderQuestionEditorCard(q, num, groupIdx = null, qIdxInSection = 0) {
  const scopeAttr = groupIdx === null ? `data-single-idx="${qIdxInSection}"` : `data-group-idx="${groupIdx}" data-gq-idx="${qIdxInSection}"`;
  const radioName = `correct_q_${num}`;

  const optionsInputs = OPTION_KEYS.map((key) => {
    const checked = q.correctAnswer === key ? 'checked' : '';
    return `
      <div class="option-input-wrap">
        <input type="radio" name="${radioName}" value="${key}" ${checked} ${scopeAttr} data-field="correctAnswer" title="Đáp án đúng là ${key}" />
        <strong style="width:18px;">${key}.</strong>
        <input
          type="text"
          class="form-control"
          placeholder="Phương án ${key}"
          value="${escapeHtml(q.options?.[key] || '')}"
          ${scopeAttr}
          data-field="option-${key}"
        />
      </div>
    `;
  }).join('');

  return `
    <div class="editor-q-card">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
        <span class="badge badge-blue">Câu ${num}</span>
        <span style="font-size:12.5px; color:var(--text-muted);">Chọn nút tròn bên trái phương án đúng</span>
      </div>
      <div class="form-group" style="margin-bottom:8px;">
        <textarea class="form-control" style="min-height:66px;" placeholder="Nhập nội dung câu ${num}..." ${scopeAttr} data-field="question">${escapeHtml(q.question || '')}</textarea>
      </div>
      <div class="editor-options-grid">
        ${optionsInputs}
      </div>
      <div class="form-group" style="margin-top:10px; margin-bottom:0;">
        <input
          type="text"
          class="form-control"
          placeholder="Giải thích đáp án (không bắt buộc)"
          value="${escapeHtml(q.explanation || '')}"
          ${scopeAttr}
          data-field="explanation"
        />
      </div>
    </div>
  `;
}

function updateEditorCompletionCount() {
  if (!editingExam) return;
  const flat = flattenExamQuestions(editingExam);
  const completed = flat.filter(
    (q) =>
      q.question?.trim() &&
      OPTION_KEYS.every((k) => q.options?.[k]?.trim()) &&
      OPTION_KEYS.includes(q.correctAnswer)
  ).length;
  editorCompletionBadge.textContent = `Hoàn thành: ${completed} / 30 câu`;
  editorCompletionBadge.className = completed === 30 ? 'badge badge-green' : 'badge badge-blue';
}

function renderEditorSections() {
  editorPart1.innerHTML = `
    <div class="section-banner">
      <h2>Phần I: 20 câu hỏi đơn (Câu 1 – 20)</h2>
      <p>Mỗi câu là một câu hỏi độc lập với 4 phương án A, B, C, D.</p>
    </div>
    ${editingExam.singleQuestions.map((q, idx) => renderQuestionEditorCard(q, idx + 1, null, idx)).join('')}
  `;

  const renderGroupEditor = (group, gIdx) => {
    const startNum = gIdx === 0 ? 21 : 26;
    const endNum = startNum + 4;
    return `
      <div class="section-banner" style="border-left-color:#d97706;">
        <h2>Phần ${gIdx === 0 ? 'II' : 'III'}: Nhóm đọc hiểu ${gIdx + 1} (Câu ${startNum} – ${endNum})</h2>
        <p>Nhập đoạn văn bản/ngữ liệu chung và 5 câu hỏi trắc nghiệm liên quan.</p>
      </div>
      <div class="passage-card">
        <div class="form-group">
          <label class="form-label">Tiêu đề đoạn văn bản (không bắt buộc)</label>
          <input type="text" class="form-control" value="${escapeHtml(group.passageTitle || '')}" data-passage-group="${gIdx}" data-passage-field="passageTitle" placeholder="Ví dụ: Buổi sáng trên quê hương" />
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">Nội dung đoạn ngữ liệu đọc hiểu *</label>
          <textarea class="form-control" style="min-height:150px;" data-passage-group="${gIdx}" data-passage-field="passage" placeholder="Dán hoặc nhập đoạn văn bản đọc hiểu cho câu ${startNum}–${endNum}...">${escapeHtml(group.passage || '')}</textarea>
        </div>
      </div>
      ${group.questions.map((q, qIdx) => renderQuestionEditorCard(q, startNum + qIdx, gIdx, qIdx)).join('')}
    `;
  };

  editorPart2.innerHTML = renderGroupEditor(editingExam.groups[0], 0);
  editorPart3.innerHTML = renderGroupEditor(editingExam.groups[1], 1);

  bindEditorInputs();
  updateEditorCompletionCount();
}

function bindEditorInputs() {
  const root = document.getElementById('examEditorPanel');

  root.querySelectorAll('[data-single-idx]').forEach((el) => {
    const handler = () => {
      const idx = Number(el.getAttribute('data-single-idx'));
      const field = el.getAttribute('data-field');
      const q = editingExam.singleQuestions[idx];
      if (!q) return;
      if (field === 'question') q.question = el.value;
      else if (field === 'explanation') q.explanation = el.value;
      else if (field === 'correctAnswer') q.correctAnswer = el.value;
      else if (field.startsWith('option-')) {
        const key = field.split('-')[1];
        q.options[key] = el.value;
      }
      updateEditorCompletionCount();
    };
    el.addEventListener(el.type === 'radio' ? 'change' : 'input', handler);
  });

  root.querySelectorAll('[data-group-idx]').forEach((el) => {
    const handler = () => {
      const gIdx = Number(el.getAttribute('data-group-idx'));
      const qIdx = Number(el.getAttribute('data-gq-idx'));
      const field = el.getAttribute('data-field');
      const q = editingExam.groups[gIdx]?.questions[qIdx];
      if (!q) return;
      if (field === 'question') q.question = el.value;
      else if (field === 'explanation') q.explanation = el.value;
      else if (field === 'correctAnswer') q.correctAnswer = el.value;
      else if (field.startsWith('option-')) {
        const key = field.split('-')[1];
        q.options[key] = el.value;
      }
      updateEditorCompletionCount();
    };
    el.addEventListener(el.type === 'radio' ? 'change' : 'input', handler);
  });

  root.querySelectorAll('[data-passage-group]').forEach((el) => {
    el.addEventListener('input', () => {
      const gIdx = Number(el.getAttribute('data-passage-group'));
      const field = el.getAttribute('data-passage-field');
      if (editingExam.groups[gIdx]) {
        editingExam.groups[gIdx][field] = el.value;
      }
    });
  });
}

function openEditor(exam) {
  editingExam = exam ? structuredClone(exam) : createEmptyExamTemplate();
  editorHeading.textContent = exam ? `Chỉnh sửa đề: ${exam.title}` : 'Soạn đề thi mới (30 câu)';
  editorTitle.value = editingExam.title || '';
  editorDuration.value = Number(editingExam.durationMinutes) || 40;
  editorDesc.value = editingExam.description || '';
  editorPublished.checked = editingExam.isPublished !== false;
  editorErrorBox.classList.add('hidden');

  examListPanel.classList.add('hidden');
  examEditorPanel.classList.remove('hidden');
  switchEditorTab('part1');
  renderEditorSections();
}

function closeEditor() {
  examEditorPanel.classList.add('hidden');
  examListPanel.classList.remove('hidden');
  editingExam = null;
}

function extractPassageBlock(text, groupNum) {
  const regex = new RegExp(
    `\\[NGỮ LIỆU ${groupNum}\\]\\s*([\\s\\S]*?)(?=\\[(?:NGỮ LIỆU|HẾT NGỮ LIỆU)|^Câu\\s+\\d+\\s*[:.)]|$)`,
    'im'
  );
  const match = text.match(regex);
  if (!match) return null;

  const lines = match[1].trim().split('\n');
  let passageTitle = '';
  if (lines[0] && /^Tiêu đề\s*:/i.test(lines[0])) {
    passageTitle = lines[0].replace(/^Tiêu đề\s*:/i, '').trim();
    lines.shift();
  }
  return {
    passageTitle,
    passage: lines.join('\n').trim()
  };
}

function parseQuickText(rawText) {
  const normalized = rawText.replace(/\r\n/g, '\n');

  const p1 = extractPassageBlock(normalized, 1);
  if (p1 && editingExam.groups[0]) {
    if (p1.passageTitle) editingExam.groups[0].passageTitle = p1.passageTitle;
    if (p1.passage) editingExam.groups[0].passage = p1.passage;
  }

  const p2 = extractPassageBlock(normalized, 2);
  if (p2 && editingExam.groups[1]) {
    if (p2.passageTitle) editingExam.groups[1].passageTitle = p2.passageTitle;
    if (p2.passage) editingExam.groups[1].passage = p2.passage;
  }

  const blocks = normalized.split(/(?=^Câu\s+\d+\s*[:.)])/gim).filter((b) => b.trim());
  let updatedCount = 0;

  blocks.forEach((block) => {
    const numMatch = block.match(/^Câu\s+(\d+)\s*[:.)]\s*([\s\S]*)/i);
    if (!numMatch) return;
    const num = Number(numMatch[1]);
    if (num < 1 || num > 30) return;

    const cleanBlock = block.split(/\[NGỮ LIỆU \d+\]/i)[0];
    const bodyMatch = cleanBlock.match(/^Câu\s+\d+\s*[:.)]\s*([\s\S]*)/i);
    const body = bodyMatch ? bodyMatch[1] : numMatch[2];

    const optAMatch = body.match(/(?:^|\n)\s*A[\.\):]\s*(.+)/);
    const optBMatch = body.match(/(?:^|\n)\s*B[\.\):]\s*(.+)/);
    const optCMatch = body.match(/(?:^|\n)\s*C[\.\):]\s*(.+)/);
    const optDMatch = body.match(/(?:^|\n)\s*D[\.\):]\s*(.+)/);
    const ansMatch = body.match(/(?:Đáp án|Dap an|ĐA)\s*[:\-]?\s*([ABCD])/i);

    const firstOptionPos = body.search(/(?:^|\n)\s*A[\.\):]/);
    const questionText = (firstOptionPos >= 0 ? body.slice(0, firstOptionPos) : body).trim();

    let targetQ = null;
    if (num <= 20) {
      targetQ = editingExam.singleQuestions[num - 1];
    } else if (num <= 25) {
      targetQ = editingExam.groups[0].questions[num - 21];
    } else {
      targetQ = editingExam.groups[1].questions[num - 26];
    }
    if (!targetQ) return;

    if (questionText) targetQ.question = questionText;
    if (optAMatch) targetQ.options.A = optAMatch[1].trim();
    if (optBMatch) targetQ.options.B = optBMatch[1].trim();
    if (optCMatch) targetQ.options.C = optCMatch[1].trim();
    if (optDMatch) targetQ.options.D = optDMatch[1].trim();
    if (ansMatch) targetQ.correctAnswer = ansMatch[1].toUpperCase();
    updatedCount += 1;
  });

  return updatedCount;
}

function buildQuickSampleText30() {
  const lines = [];
  for (let i = 1; i <= 20; i += 1) {
    lines.push(
      `Câu ${i}: Câu hỏi trắc nghiệm Tiếng Việt số ${i} (mẫu nhập nhanh)?`,
      `A. Phương án A câu ${i}`,
      `B. Phương án B câu ${i}`,
      `C. Phương án C câu ${i}`,
      `D. Phương án D câu ${i}`,
      `Đáp án: ${OPTION_KEYS[(i - 1) % 4]}`,
      ''
    );
  }
  lines.push(
    '[NGỮ LIỆU 1]',
    'Tiêu đề: Kỷ niệm mùa thu đến trường',
    'Sáng thu, bầu trời trong xanh vời vợi. Những hàng cây ven đường khẽ rung rinh trong làn gió mát rượi, chào đón bước chân học trò trở lại mái trường thân yêu.',
    ''
  );
  for (let i = 21; i <= 25; i += 1) {
    lines.push(
      `Câu ${i}: Câu hỏi đọc hiểu nhóm 1 số ${i}?`,
      `A. Phương án A câu ${i}`,
      `B. Phương án B câu ${i}`,
      `C. Phương án C câu ${i}`,
      `D. Phương án D câu ${i}`,
      `Đáp án: ${OPTION_KEYS[(i - 1) % 4]}`,
      ''
    );
  }
  lines.push(
    '[NGỮ LIỆU 2]',
    'Tiêu đề: Vai trò của cây xanh đô thị',
    'Cây xanh đô thị không chỉ tạo bóng mát, điều hòa không khí mà còn góp phần làm giảm tiếng ồn và mang lại cảnh quan dịu mắt cho người dân thành phố.',
    ''
  );
  for (let i = 26; i <= 30; i += 1) {
    lines.push(
      `Câu ${i}: Câu hỏi đọc hiểu nhóm 2 số ${i}?`,
      `A. Phương án A câu ${i}`,
      `B. Phương án B câu ${i}`,
      `C. Phương án C câu ${i}`,
      `D. Phương án D câu ${i}`,
      `Đáp án: ${OPTION_KEYS[(i - 1) % 4]}`,
      ''
    );
  }
  return lines.join('\n');
}

function populateScoreExamFilter() {
  const current = filterScoreExam.value;
  filterScoreExam.innerHTML =
    '<option value="">Tất cả đề thi</option>' +
    examsCache
      .map((e) => `<option value="${escapeHtml(e.id)}">${escapeHtml(e.title)}</option>`)
      .join('');
  filterScoreExam.value = current;
}

async function loadAndRenderScores() {
  submissionsCache = await listSubmissions();
  renderScoreTable();
}

function getFilteredSubmissions() {
  const examId = filterScoreExam.value;
  const keyword = searchScoreStudent.value.trim().toLowerCase();

  return submissionsCache.filter((s) => {
    if (examId && s.examId !== examId) return false;
    if (
      keyword &&
      !s.studentName.toLowerCase().includes(keyword) &&
      !(s.studentClass || '').toLowerCase().includes(keyword)
    ) {
      return false;
    }
    return true;
  });
}

function renderWrongQuestionStats(filteredSubs) {
  if (!filteredSubs.length) {
    wrongStatsCard.classList.add('hidden');
    return;
  }

  const examMap = new Map(examsCache.map((e) => [e.id, e]));
  const statMap = new Map();

  filteredSubs.forEach((sub) => {
    const exam = examMap.get(sub.examId);
    if (!exam) return;
    const flat = flattenExamQuestions(exam);
    flat.forEach((q) => {
      const key = `${exam.id}::${q.number}`;
      if (!statMap.has(key)) {
        statMap.set(key, {
          examTitle: exam.title,
          number: q.number,
          question: q.question,
          total: 0,
          wrong: 0
        });
      }
      const entry = statMap.get(key);
      entry.total += 1;
      const chosen = sub.answers?.[String(q.number)] || '';
      if (chosen !== q.correctAnswer) {
        entry.wrong += 1;
      }
    });
  });

  const topWrong = Array.from(statMap.values())
    .filter((item) => item.wrong > 0)
    .sort((a, b) => b.wrong / b.total - a.wrong / a.total || b.wrong - a.wrong)
    .slice(0, 4);

  if (!topWrong.length) {
    wrongStatsCard.classList.add('hidden');
    return;
  }

  wrongStatsCard.classList.remove('hidden');
  wrongStatsGrid.innerHTML = topWrong
    .map((item) => {
      const rate = Math.round((item.wrong / item.total) * 100);
      const snippet = item.question.length > 78 ? `${item.question.slice(0, 78)}...` : item.question;
      return `
        <div class="wrong-stat-item">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:6px;">
            <span class="badge badge-red">Câu ${item.number}</span>
            <strong style="font-size:13px; color:var(--danger);">Sai ${item.wrong}/${item.total} lượt (${rate}%)</strong>
          </div>
          <div style="font-size:13px; color:var(--text); font-weight:500;">${escapeHtml(snippet)}</div>
          <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">${escapeHtml(item.examTitle)}</div>
        </div>
      `;
    })
    .join('');
}

function renderScoreTable() {
  const list = getFilteredSubmissions();

  const totalCount = list.length;
  const avgScore = totalCount
    ? (list.reduce((sum, s) => sum + Number(s.score || 0), 0) / totalCount).toFixed(2)
    : '0.00';
  const maxScore = totalCount
    ? Math.max(...list.map((s) => Number(s.score || 0))).toFixed(2)
    : '0.00';
  const highRate = totalCount
    ? Math.round((list.filter((s) => Number(s.score || 0) >= 8).length / totalCount) * 100)
    : 0;

  scoreStatsGrid.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Tổng lượt nộp bài</div>
      <div class="stat-value">${totalCount}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Điểm trung bình</div>
      <div class="stat-value">${avgScore} / 10</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Điểm cao nhất</div>
      <div class="stat-value">${maxScore} / 10</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Tỷ lệ khá giỏi (≥ 8.0)</div>
      <div class="stat-value">${highRate}%</div>
    </div>
  `;

  renderWrongQuestionStats(list);

  if (!list.length) {
    scoresTableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding:28px; color:var(--text-muted);">
          Chưa có kết quả bài làm nào phù hợp.
        </td>
      </tr>
    `;
    return;
  }

  scoresTableBody.innerHTML = list
    .map(
      (s) => `
        <tr>
          <td><strong>${escapeHtml(s.studentName)}</strong></td>
          <td>${escapeHtml(s.studentClass || '—')}</td>
          <td>${escapeHtml(s.examTitle)}</td>
          <td>${s.correctCount} / ${s.totalQuestions}</td>
          <td><span class="badge ${s.score >= 8 ? 'badge-green' : s.score >= 5 ? 'badge-blue' : 'badge-red'}">${s.score}</span></td>
          <td>${formatDurationText(s.elapsedSeconds)}</td>
          <td>${formatDateTime(s.submittedAt)}</td>
          <td>
            <div style="display:flex; gap:6px;">
              <button type="button" class="btn btn-soft btn-sm" data-view-sub="${escapeHtml(s.id)}">Xem bài</button>
              <button type="button" class="btn btn-danger-soft btn-sm" data-del-sub="${escapeHtml(s.id)}">Xóa</button>
            </div>
          </td>
        </tr>
      `
    )
    .join('');

  scoresTableBody.querySelectorAll('[data-view-sub]').forEach((btn) => {
    btn.addEventListener('click', () => openSubmissionDetail(btn.getAttribute('data-view-sub')));
  });

  scoresTableBody.querySelectorAll('[data-del-sub]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-del-sub');
      if (!window.confirm('Xóa kết quả bài làm này?')) return;
      await deleteSubmission(id);
      await loadAndRenderScores();
    });
  });
}

async function openSubmissionDetail(subId) {
  const sub = submissionsCache.find((s) => s.id === subId);
  if (!sub) return;

  const classLabel = sub.studentClass ? ` (${sub.studentClass})` : '';
  subDetailTitle.textContent = `${sub.studentName}${classLabel} – ${sub.score}/10 (${sub.correctCount}/${sub.totalQuestions} câu)`;
  const exam = await getExamById(sub.examId);

  if (!exam) {
    subDetailBody.innerHTML = '<p>Đề thi gốc đã bị xóa nên không thể hiển thị chi tiết câu hỏi.</p>';
  } else {
    const flat = flattenExamQuestions(exam);
    subDetailBody.innerHTML = `
      <div style="display:grid; gap:10px;">
        ${flat
          .map((q) => {
            const chosen = sub.answers?.[String(q.number)] || '';
            const ok = chosen === q.correctAnswer;
            return `
              <div style="padding:10px 12px; border-radius:10px; border:1px solid ${ok ? 'var(--success-border)' : 'var(--danger-border)'}; background:${ok ? '#f0fdf4' : '#fef2f2'};">
                <div style="font-weight:600; margin-bottom:4px;">Câu ${q.number}: ${escapeHtml(q.question)}</div>
                <div style="font-size:13.5px;">
                  Học sinh chọn: <strong>${chosen || 'Bỏ trống'}</strong> •
                  Đáp án đúng: <strong style="color:var(--success);">${q.correctAnswer}</strong>
                  ${ok ? '✓' : '✗'}
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
    `;
  }

  submissionDetailModal.classList.remove('hidden');
}

function exportFilteredScoresCsv() {
  const list = getFilteredSubmissions();
  if (!list.length) {
    window.alert('Không có dữ liệu điểm để xuất.');
    return;
  }

  const csvCell = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
  const headers = ['Họ và tên', 'Lớp', 'Đề thi', 'Số câu đúng', 'Tổng số câu', 'Điểm', 'Thời gian (giây)', 'Ngày nộp'];
  const rows = list.map((s) =>
    [
      s.studentName,
      s.studentClass,
      s.examTitle,
      s.correctCount,
      s.totalQuestions,
      s.score,
      s.elapsedSeconds,
      formatDateTime(s.submittedAt)
    ]
      .map(csvCell)
      .join(',')
  );

  const csvContent = '\uFEFF' + [headers.map(csvCell).join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `bang-diem-tieng-viet-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

async function initTeacherWorkspace() {
  await refreshStorageStatus();
  await loadAndRenderExams();

  const localCfg = getLocalCloudConfig();
  document.getElementById('supabaseUrlInput').value = localCfg.supabaseUrl || '';
  document.getElementById('supabaseKeyInput').value = localCfg.supabaseAnonKey || '';
}

// Event bindings
pinForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (pinInput.value.trim() === getTeacherPin()) {
    pinError.classList.add('hidden');
    unlockTeacher();
  } else {
    pinError.classList.remove('hidden');
  }
});

demoQuickLoginBtn.addEventListener('click', () => {
  pinError.classList.add('hidden');
  unlockTeacher();
});

document.querySelectorAll('[data-main-tab]').forEach((btn) => {
  btn.addEventListener('click', () => switchMainTab(btn.getAttribute('data-main-tab')));
});

document.querySelectorAll('[data-editor-tab]').forEach((btn) => {
  btn.addEventListener('click', () => switchEditorTab(btn.getAttribute('data-editor-tab')));
});

document.getElementById('createExamBtn').addEventListener('click', () => openEditor(null));
document.getElementById('backToExamListBtn').addEventListener('click', closeEditor);
document.getElementById('cancelEditorBtn').addEventListener('click', closeEditor);

document.getElementById('saveExamBtn').addEventListener('click', async () => {
  if (!editingExam) return;
  editingExam.title = editorTitle.value.trim();
  editingExam.durationMinutes = Number(editorDuration.value) || 40;
  editingExam.description = editorDesc.value.trim();
  editingExam.isPublished = editorPublished.checked;

  const errors = validateExam(editingExam);
  if (errors.length) {
    editorErrorBox.classList.remove('hidden');
    editorErrorBox.innerHTML = `
      <div>
        <strong>Cần hoàn thiện ${errors.length} mục trước khi lưu:</strong>
        <ul style="margin:6px 0 0 18px; padding:0;">
          ${errors.slice(0, 6).map((err) => `<li>${escapeHtml(err)}</li>`).join('')}
          ${errors.length > 6 ? `<li>... và ${errors.length - 6} lỗi khác.</li>` : ''}
        </ul>
      </div>
    `;
    editorErrorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  editorErrorBox.classList.add('hidden');
  await saveExam(editingExam);
  closeEditor();
  await loadAndRenderExams();
});

document.getElementById('fillSampleMissingBtn').addEventListener('click', () => {
  if (!editingExam) return;
  if (!editorTitle.value.trim()) {
    editorTitle.value = `Đề Tiếng Việt mới (${new Date().toLocaleDateString('vi-VN')})`;
  }
  editingExam.singleQuestions.forEach((q, idx) => {
    if (!q.question.trim()) q.question = `Câu hỏi mẫu số ${idx + 1} (hãy sửa nội dung này)`;
    OPTION_KEYS.forEach((k) => {
      if (!q.options[k].trim()) q.options[k] = `Phương án ${k} của câu ${idx + 1}`;
    });
  });
  editingExam.groups.forEach((g, gIdx) => {
    const start = gIdx === 0 ? 21 : 26;
    if (!g.passageTitle.trim()) g.passageTitle = `Đoạn đọc hiểu mẫu ${gIdx + 1}`;
    if (!g.passage.trim()) {
      g.passage = `Đây là đoạn ngữ liệu đọc hiểu mẫu cho nhóm câu ${start}–${start + 4}. Giáo viên hãy thay thế bằng đoạn văn bản thực tế.`;
    }
    g.questions.forEach((q, qIdx) => {
      const num = start + qIdx;
      if (!q.question.trim()) q.question = `Câu hỏi đọc hiểu số ${num} (hãy sửa nội dung này)`;
      OPTION_KEYS.forEach((k) => {
        if (!q.options[k].trim()) q.options[k] = `Phương án ${k} của câu ${num}`;
      });
    });
  });
  renderEditorSections();
});

document.getElementById('openQuickImportBtn').addEventListener('click', () => {
  quickImportModal.classList.remove('hidden');
});
document.getElementById('closeQuickImport').addEventListener('click', () => {
  quickImportModal.classList.add('hidden');
});
document.getElementById('cancelQuickImport').addEventListener('click', () => {
  quickImportModal.classList.add('hidden');
});
document.getElementById('insertQuickSampleBtn').addEventListener('click', () => {
  quickImportTextarea.value = buildQuickSampleText30();
  if (!editorTitle.value.trim()) {
    editorTitle.value = `Đề Tiếng Việt nhập nhanh (${new Date().toLocaleDateString('vi-VN')})`;
  }
});
document.getElementById('applyQuickImport').addEventListener('click', () => {
  const count = parseQuickText(quickImportTextarea.value);
  quickImportModal.classList.add('hidden');
  renderEditorSections();
  window.alert(`Đã nhận diện và điền tự động ${count} câu hỏi (cùng ngữ liệu nếu có) vào biểu mẫu.`);
});

document.getElementById('importJsonFileInput').addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const imported = {
      ...createEmptyExamTemplate(),
      ...parsed,
      id: generateId('exam'),
      createdAt: new Date().toISOString()
    };
    openEditor(imported);
  } catch (err) {
    window.alert(`File JSON không hợp lệ: ${err.message}`);
  } finally {
    e.target.value = '';
  }
});

filterScoreExam.addEventListener('change', renderScoreTable);
searchScoreStudent.addEventListener('input', renderScoreTable);
document.getElementById('refreshScoresBtn').addEventListener('click', loadAndRenderScores);
document.getElementById('exportCsvBtn').addEventListener('click', exportFilteredScoresCsv);
document.getElementById('closeSubDetail').addEventListener('click', () => {
  submissionDetailModal.classList.add('hidden');
});

document.getElementById('cloudConfigForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = document.getElementById('supabaseUrlInput').value.trim();
  const key = document.getElementById('supabaseKeyInput').value.trim();
  setLocalCloudConfig({ supabaseUrl: url, supabaseAnonKey: key });
  await refreshStorageStatus();
  await loadAndRenderExams();
  document.getElementById('cloudStatusMsg').innerHTML =
    '<span class="badge badge-green">Đã lưu cấu hình Supabase và làm mới dữ liệu!</span>';
});

document.getElementById('disconnectCloudBtn').addEventListener('click', async () => {
  setLocalCloudConfig({ supabaseUrl: '', supabaseAnonKey: '' });
  document.getElementById('supabaseUrlInput').value = '';
  document.getElementById('supabaseKeyInput').value = '';
  await refreshStorageStatus();
  await loadAndRenderExams();
  document.getElementById('cloudStatusMsg').innerHTML =
    '<span class="badge badge-blue">Đã chuyển về chế độ lưu cục bộ (LocalStorage).</span>';
});

document.getElementById('changePinForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const newPin = document.getElementById('newPinInput').value.trim();
  if (newPin.length < 4) return;
  setTeacherPin(newPin);
  document.getElementById('newPinInput').value = '';
  document.getElementById('pinChangeMsg').innerHTML =
    '<span class="badge badge-green">Đã đổi mã PIN giáo viên thành công!</span>';
});

document.getElementById('resetDemoDataBtn').addEventListener('click', async () => {
  if (!window.confirm('Khôi phục lại 2 đề mẫu và 5 bài làm mẫu ban đầu?')) return;
  await resetDemoData();
  await loadAndRenderExams();
  await loadAndRenderScores();
  document.getElementById('resetDemoMsg').innerHTML =
    '<span class="badge badge-green">Đã khôi phục dữ liệu Demo gốc thành công!</span>';
});

if (isTeacherUnlocked()) {
  unlockTeacher();
}
