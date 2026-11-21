export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatTimer(totalSeconds) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatDurationText(totalSeconds) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  if (mins === 0) return `${secs} giây`;
  if (secs === 0) return `${mins} phút`;
  return `${mins} phút ${secs} giây`;
}

export function formatDateTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return String(isoString);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export function isSourceLine(text) {
  const trimmed = String(text || '').trim();
  return trimmed.startsWith('(') && trimmed.endsWith(')') && !trimmed.includes('\n');
}

export function formatPassageHtml(passageText) {
  const blocks = String(passageText || '')
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  if (!blocks.length) {
    return '<p class="passage-empty">Chưa có nội dung ngữ liệu.</p>';
  }

  return blocks
    .map((block) => {
      if (isSourceLine(block)) {
        return `<p class="passage-source">${escapeHtml(block)}</p>`;
      }
      if (block.includes('\n')) {
        return `<div class="passage-poem">${escapeHtml(block)}</div>`;
      }
      return `<p class="passage-para">${escapeHtml(block)}</p>`;
    })
    .join('');
}

export function formatQuestionHtml(questionText) {
  const raw = String(questionText || '');
  const blocks = raw
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  if (blocks.length <= 1 && !raw.includes('\n')) {
    return escapeHtml(raw);
  }

  return blocks
    .map((block, idx) => {
      const isLast = idx === blocks.length - 1;
      if (isSourceLine(block)) {
        return `<div class="q-source">${escapeHtml(block)}</div>`;
      }
      if (block.includes('\n')) {
        return `<div class="q-poem">${escapeHtml(block)}</div>`;
      }
      if (isLast || (block.length < 90 && block.endsWith(':'))) {
        return `<p class="q-prompt">${escapeHtml(block)}</p>`;
      }
      return `<p class="q-para">${escapeHtml(block)}</p>`;
    })
    .join('');
}
