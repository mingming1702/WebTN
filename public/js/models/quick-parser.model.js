import {
  GROUP_SECTION_LIMIT,
  OPTION_KEYS,
  SINGLE_SECTION_LIMIT,
  createEmptyQuestion,
  renumberExamQuestions
} from './exam.model.js';

export function extractPassageBlock(text, groupNum) {
  const regex = new RegExp(
    `\\[NGỮ LIỆU ${groupNum}\\]\\s*([\\s\\S]*?)(?=\\[(?:NGỮ LIỆU|HẾT NGỮ LIỆU)|^Câu\\s+\\d+\\s*[:.)]|(?![\\s\\S]))`,
    'im'
  );
  const match = String(text || '').match(regex);
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

function parseSingleBlockOptions(body) {
  const optionMarkers = [
    { key: 'A', regex: /(?:^|\n)\s*A[\.\):]\s*/m },
    { key: 'B', regex: /(?:^|\n)\s*B[\.\):]\s*/m },
    { key: 'C', regex: /(?:^|\n)\s*C[\.\):]\s*/m },
    { key: 'D', regex: /(?:^|\n)\s*D[\.\):]\s*/m }
  ];

  const found = [];
  optionMarkers.forEach(({ key, regex }) => {
    const match = body.match(regex);
    if (match) {
      found.push({
        key,
        start: match.index,
        contentStart: match.index + match[0].length
      });
    }
  });
  found.sort((a, b) => a.start - b.start);

  const tailMatch = body.match(/(?:^|\n)\s*(?:Đáp án|Dap an|ĐA|Giải thích|Giai thich)\s*[:\-]/im);
  const tailIndex = tailMatch ? tailMatch.index : body.length;

  const firstMarkerPos = found.length ? found[0].start : tailIndex;
  const questionText = body.slice(0, firstMarkerPos).trim();

  const options = {};
  found.forEach((item, idx) => {
    const nextBoundary = idx + 1 < found.length ? found[idx + 1].start : tailIndex;
    const rawVal = body.slice(item.contentStart, Math.max(item.contentStart, nextBoundary)).trim();
    if (rawVal) options[item.key] = rawVal;
  });

  const ansMatch = body.match(/(?:^|\n)\s*(?:Đáp án|Dap an|ĐA)\s*[:\-]?\s*([ABCD])/im);
  const expMatch = body.match(
    /(?:^|\n)\s*(?:Giải thích|Giai thich)\s*[:\-]\s*([\s\S]*?)(?=\n\s*(?:Đáp án|Dap an|ĐA)\s*[:\-]|(?![\s\S]))/im
  );

  return {
    questionText,
    options,
    correctAnswer: ansMatch ? ansMatch[1].toUpperCase() : null,
    explanation: expMatch ? expMatch[1].trim() : null
  };
}

function ensureQuestionSlot(exam, num) {
  if (num >= 1 && num <= SINGLE_SECTION_LIMIT) {
    while (exam.singleQuestions.length < num) {
      exam.singleQuestions.push(createEmptyQuestion(exam.singleQuestions.length + 1));
    }
    return exam.singleQuestions[num - 1];
  }

  if (num >= 21 && num <= 25) {
    const gIdx = 0;
    const targetIdx = num - 21;
    while (exam.groups[gIdx].questions.length <= targetIdx && exam.groups[gIdx].questions.length < GROUP_SECTION_LIMIT) {
      exam.groups[gIdx].questions.push(createEmptyQuestion(21 + exam.groups[gIdx].questions.length));
    }
    return exam.groups[gIdx].questions[targetIdx] || null;
  }

  if (num >= 26 && num <= 30) {
    const gIdx = 1;
    const targetIdx = num - 26;
    while (exam.groups[gIdx].questions.length <= targetIdx && exam.groups[gIdx].questions.length < GROUP_SECTION_LIMIT) {
      exam.groups[gIdx].questions.push(createEmptyQuestion(26 + exam.groups[gIdx].questions.length));
    }
    return exam.groups[gIdx].questions[targetIdx] || null;
  }

  return null;
}

export function parseQuickText(rawText, targetExam) {
  const exam = structuredClone(targetExam);
  const normalized = String(rawText || '').replace(/\r\n/g, '\n');

  const p1 = extractPassageBlock(normalized, 1);
  if (p1 && exam.groups[0]) {
    if (p1.passageTitle) exam.groups[0].passageTitle = p1.passageTitle;
    if (p1.passage) exam.groups[0].passage = p1.passage;
  }

  const p2 = extractPassageBlock(normalized, 2);
  if (p2 && exam.groups[1]) {
    if (p2.passageTitle) exam.groups[1].passageTitle = p2.passageTitle;
    if (p2.passage) exam.groups[1].passage = p2.passage;
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
    const parsed = parseSingleBlockOptions(body);

    const targetQ = ensureQuestionSlot(exam, num);
    if (!targetQ) return;

    if (parsed.questionText) targetQ.question = parsed.questionText;
    OPTION_KEYS.forEach((key) => {
      if (parsed.options[key]) targetQ.options[key] = parsed.options[key];
    });
    if (parsed.correctAnswer) targetQ.correctAnswer = parsed.correctAnswer;
    if (parsed.explanation !== null) targetQ.explanation = parsed.explanation;
    updatedCount += 1;
  });

  return {
    exam: renumberExamQuestions(exam),
    updatedCount
  };
}

export function buildQuickSampleText30() {
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
