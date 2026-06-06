// js/utils.js - Shared Utilities

export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function throttle(fn, limit = 300) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function formatDate(timestamp) {
  const d = new Date(timestamp);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return d.toLocaleDateString();
}

export function formatDateFull(timestamp) {
  return new Date(timestamp).toLocaleString();
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength) + '...';
}

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  return Promise.resolve();
}

export function downloadFile(content, filename, mimeType = 'text/markdown') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const MARKDOWN_RULES = [
  { re: /^### (.+)$/gm, replace: '<h3>$1</h3>' },
  { re: /^## (.+)$/gm, replace: '<h2>$1</h2>' },
  { re: /^# (.+)$/gm, replace: '<h1>$1</h1>' },
  { re: /\*\*(.+?)\*\*/g, replace: '<strong>$1</strong>' },
  { re: /\*(.+?)\*/g, replace: '<em>$1</em>' },
  { re: /`([^`]+)`/g, replace: '<code>$1</code>' },
  { re: /^- (.+)$/gm, replace: '<li>$1</li>' },
  { re: /^\d+\. (.+)$/gm, replace: '<li>$1</li>' },
  { re: /```(\w*)\n([\s\S]*?)```/g, replace: (m, lang, code) => `<pre class="code-block" data-lang="${lang}"><code>${escapeHtml(code.trim())}</code></pre>` },
  { re: /\n\n/g, replace: '</p><p>' },
];

export function markdownToHtml(md) {
  if (!md) return '';
  let html = '<p>' + escapeHtml(md) + '</p>';
  for (const rule of MARKDOWN_RULES) {
    html = html.replace(rule.re, rule.replace);
  }
  html = html.replace(/<li><\/li>/g, '');
  html = html.replace(/(<li>.*<\/li>)/s, (m) => `<ul>${m}</ul>`);
  html = html.replace(/<\/ul>\s*<ul>/g, '');
  return html;
}

export function getThemeFromSystem() {
  if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
}

export function getContrastFromSystem() {
  if (window.matchMedia('(prefers-contrast: high)').matches) return 'high-contrast';
  return null;
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
