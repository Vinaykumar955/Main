/* =========== State =========== */
const state = {
  activeTab: 'chat',
  messages: [],
  history: [],
  bookmarks: [],
  settings: {},
  streaming: false,
  context: { fileName: '', language: '', lines: '' },
};

let vscode = null;
let debounceTimers = {};
let pendingStreamContent = '';

/* =========== Initialize =========== */
function init() {
  try {
    vscode = acquireVsCodeApi();
  } catch (e) {
    console.warn('VS Code API not available, running in standalone mode');
  }

  setupTabHandling();
  setupChatInput();
  setupHistorySearch();
  setupBookmarkSearch();
  setupClearHistory();
  setupExportHistory();
  setupResetSettings();
  setupAttachButton();
  setupAutoResize();
  setupKeyboardShortcuts();
  setupMessageListener();
  populateSettings();

  const now = new Date();
  document.getElementById('welcomeTime').textContent = formatTime(now);

  showToast('CodeLens AI ready', 'info');
}

/* =========== VS Code Communication =========== */
function sendVsCodeMessage(message) {
  if (vscode) {
    try {
      vscode.postMessage(message);
    } catch (e) {
      console.error('Failed to send message to extension:', e);
      showToast('Failed to communicate with extension', 'error');
    }
  } else {
    console.log('VS Code message (standalone):', message);
  }
}

function setupMessageListener() {
  window.addEventListener('message', function (event) {
    const message = event.data;
    if (!message || !message.type) return;

    try {
      switch (message.type) {
        case 'initialState':
          if (message.messages) state.messages = message.messages;
          if (message.history) state.history = message.history;
          if (message.bookmarks) state.bookmarks = message.bookmarks;
          if (message.settings) {
            state.settings = message.settings;
            applySettings(message.settings);
          }
          if (message.context) state.context = message.context;
          renderAll();
          break;

        case 'streamChunk':
          handleStreamChunk(message.content);
          break;

        case 'streamEnd':
          handleStreamEnd();
          break;

        case 'streamError':
          handleStreamError(message.error);
          break;

        case 'historyUpdate':
          state.history = message.data || [];
          renderHistory(state.history);
          break;

        case 'bookmarksUpdate':
          state.bookmarks = message.data || [];
          renderBookmarks(state.bookmarks);
          break;

        case 'settingsUpdate':
          state.settings = { ...state.settings, ...(message.data || {}) };
          applySettings(message.data);
          populateSettings();
          break;

        case 'showToast':
          showToast(message.text || message.message, message.type || 'info');
          break;

        case 'contextUpdate':
          state.context = message.data || {};
          updateContextIndicator();
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (e) {
      console.error('Error handling message:', e);
    }
  });
}

/* =========== Tab Handling =========== */
function setupTabHandling() {
  const tabBar = document.querySelector('.tab-bar');
  tabBar.addEventListener('click', function (e) {
    const tabButton = e.target.closest('.tab-button');
    if (!tabButton) return;
    const tabName = tabButton.dataset.tab;
    if (tabName) switchTab(tabName);
  });

  tabBar.addEventListener('keydown', function (e) {
    const current = document.querySelector('.tab-button.active');
    if (!current) return;
    let next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      next = current.nextElementSibling;
      if (!next) next = tabBar.firstElementChild;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      next = current.previousElementSibling;
      if (!next) next = tabBar.lastElementChild;
    }
    if (next && next.classList.contains('tab-button')) {
      switchTab(next.dataset.tab);
      next.focus();
    }
  });
}

function switchTab(tabName) {
  state.activeTab = tabName;

  document.querySelectorAll('.tab-button').forEach(function (btn) {
    const isActive = btn.dataset.tab === tabName;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    btn.setAttribute('tabindex', isActive ? '0' : '-1');
  });

  document.querySelectorAll('.tab-pane').forEach(function (pane) {
    pane.classList.toggle('active', pane.id === 'panel-' + tabName);
  });

  if (tabName === 'history' && state.history.length > 0) {
    renderHistory(state.history);
  }
  if (tabName === 'bookmarks' && state.bookmarks.length > 0) {
    renderBookmarks(state.bookmarks);
  }
  if (tabName === 'settings') {
    populateSettings();
  }
}

/* =========== Chat Functions =========== */
function setupChatInput() {
  const textarea = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');

  sendBtn.addEventListener('click', sendMessage);

  textarea.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  textarea.addEventListener('input', function () {
    autoResize(textarea);
  });
}

function sendMessage() {
  if (state.streaming) {
    showToast('Please wait for the current response to finish', 'warning');
    return;
  }

  const textarea = document.getElementById('chatInput');
  const text = textarea.value.trim();
  if (!text) return;

  textarea.value = '';
  autoResize(textarea);
  textarea.focus();

  const timestamp = getTimestamp();
  addMessage('user', text, timestamp);
  state.messages.push({ role: 'user', content: text, timestamp: timestamp });

  startStreaming();

  sendVsCodeMessage({
    type: 'sendMessage',
    text: text,
    context: state.context,
    depth: getSelectedDepth(),
  });
}

function addMessage(role, content, timestamp) {
  const container = document.getElementById('chatMessages');
  const msgDiv = document.createElement('div');
  msgDiv.className = 'message ' + role;
  msgDiv.setAttribute('role', 'listitem');

  const isUser = role === 'user';
  const avatarLabel = isUser ? 'You' : 'CodeLens AI';

  msgDiv.innerHTML =
    '<div class="message-avatar" aria-label="' + avatarLabel + '" aria-hidden="true">' +
    (isUser
      ? '<svg viewBox="0 0 16 16" width="14" height="14"><path fill="currentColor" d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 1c-3.315 0-6 1.79-6 4v1h12v-1c0-2.21-2.685-4-6-4z"/></svg>'
      : '<svg viewBox="0 0 16 16" width="14" height="14"><path fill="currentColor" d="M8 1a3 3 0 0 0-3 3v1h6V4a3 3 0 0 0-3-3zM4 7V5a4 4 0 1 1 8 0v2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/></svg>') +
    '</div>' +
    '<div class="message-content">' +
    '<div class="message-header">' +
    '<span class="message-role">' + (isUser ? 'You' : 'CodeLens AI') + '</span>' +
    '<span class="message-time">' + (timestamp || '') + '</span>' +
    '</div>' +
    '<div class="message-body"></div>' +
    '</div>';

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function appendToLastMessage(chunk) {
  const container = document.getElementById('chatMessages');
  const messages = container.querySelectorAll('.message.assistant');
  if (messages.length === 0) {
    const timestamp = getTimestamp();
    addMessage('assistant', '', timestamp);
    state.messages.push({ role: 'assistant', content: '', timestamp: timestamp });
  }

  const lastMsg = container.querySelector('.message.assistant:last-child .message-body');
  if (lastMsg) {
    pendingStreamContent += chunk;
    lastMsg.innerHTML = renderMarkdown(pendingStreamContent);
    container.scrollTop = container.scrollHeight;
  }
}

function handleStreamChunk(content) {
  appendToLastMessage(content);
}

function handleStreamEnd() {
  if (pendingStreamContent) {
    const lastMsg = state.messages[state.messages.length - 1];
    if (lastMsg && lastMsg.role === 'assistant') {
      lastMsg.content = pendingStreamContent;
    }
    pendingStreamContent = '';
  }
  stopStreaming();
}

function handleStreamError(error) {
  stopStreaming();
  const container = document.getElementById('chatMessages');
  const lastMsg = container.querySelector('.message.assistant:last-child .message-body');
  if (lastMsg) {
    lastMsg.innerHTML = '<p style="color: var(--danger-color);">Error: ' + escapeHtml(error || 'An error occurred') + '</p>';
  }
  showToast(error || 'An error occurred during streaming', 'error');
  pendingStreamContent = '';
}

function startStreaming() {
  state.streaming = true;
  document.getElementById('streamingIndicator').hidden = false;
  document.getElementById('sendBtn').disabled = true;
}

function stopStreaming() {
  state.streaming = false;
  document.getElementById('streamingIndicator').hidden = true;
  document.getElementById('sendBtn').disabled = false;
}

/* =========== Markdown Renderer =========== */
function renderMarkdown(text) {
  if (!text) return '';
  let html = escapeHtml(text);

  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, function (_, lang, code) {
    var langAttr = lang ? ' class="language-' + escapeHtml(lang) + '"' : '';
    var langBadge = lang ? '<span class="badge badge-language">' + escapeHtml(lang) + '</span>' : '';
    return '<pre><div class="code-header">' + langBadge +
      '<button class="copy-btn" onclick="copyToClipboard(this.nextElementSibling.textContent)" aria-label="Copy code">Copy</button>' +
      '</div><code' + langAttr + '>' + escapeHtml(code.trim()) + '</code></pre>';
  });

  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, function (match) {
    if (match.indexOf('<ol>') === -1) return '<ol>' + match + '</ol>';
    return match;
  });

  html = html.replace(/\n{2,}/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  html = '<p>' + html + '</p>';

  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<br><\/p>/g, '</p>');
  html = html.replace(/<p><br>/g, '<p>');

  return html;
}

function escapeHtml(text) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

/* =========== History Functions =========== */
function loadHistory(data) {
  state.history = data || [];
  renderHistory(state.history);
}

function renderHistory(entries) {
  var container = document.getElementById('historyList');
  var empty = document.getElementById('historyEmpty');
  var searchQuery = (document.getElementById('historySearch').value || '').toLowerCase();

  if (!entries || entries.length === 0) {
    container.innerHTML = '';
    empty.hidden = false;
    return;
  }

  empty.hidden = true;

  var filtered = entries;
  if (searchQuery) {
    filtered = entries.filter(function (item) {
      return (item.fileName && item.fileName.toLowerCase().indexOf(searchQuery) !== -1) ||
        (item.explanation && item.explanation.toLowerCase().indexOf(searchQuery) !== -1) ||
        (item.language && item.language.toLowerCase().indexOf(searchQuery) !== -1);
    });
  }

  if (filtered.length === 0) {
    container.innerHTML = '<div class="history-empty"><p>No results found for "' + escapeHtml(searchQuery) + '"</p></div>';
    return;
  }

  var groups = groupByDate(filtered);
  var html = '';
  var groupOrder = ['today', 'yesterday', 'thisWeek', 'earlier'];
  var groupLabels = { today: 'Today', yesterday: 'Yesterday', thisWeek: 'This Week', earlier: 'Earlier' };

  groupOrder.forEach(function (key) {
    var items = groups[key];
    if (!items || items.length === 0) return;

    html += '<div class="history-date-group" role="listitem">';
    html += '<div class="history-date-header">' + groupLabels[key] + '</div>';
    items.forEach(function (item) {
      html += '<div class="history-item" onclick="viewHistoryItem(this)" data-index="' + escapeHtml(String(item.index != null ? item.index : '')) + '" role="button" tabindex="0" aria-label="View explanation">';
      html += '<div class="history-item-header">';
      html += '<span class="history-filename">' + escapeHtml(item.fileName || 'Unknown file') + '</span>';
      if (item.language) html += '<span class="badge badge-language">' + escapeHtml(item.language) + '</span>';
      if (item.depth) html += '<span class="badge badge-depth">' + escapeHtml(item.depth) + '</span>';
      html += '<span class="history-time">' + escapeHtml(item.timestamp || '') + '</span>';
      html += '</div>';
      html += '<div class="history-snippet">' + escapeHtml((item.explanation || '').substring(0, 120)) + '</div>';
      html += '</div>';
    });
    html += '</div>';
  });

  container.innerHTML = html;
}

function groupByDate(entries) {
  var groups = { today: [], yesterday: [], thisWeek: [], earlier: [] };
  var now = new Date();
  var todayStr = now.toDateString();
  var yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  var yesterdayStr = yesterday.toDateString();

  var startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  entries.forEach(function (item) {
    var itemDate = item.timestamp ? new Date(item.timestamp) : new Date();
    if (isNaN(itemDate.getTime())) itemDate = new Date();
    var itemDateStr = itemDate.toDateString();

    if (itemDateStr === todayStr) {
      groups.today.push(item);
    } else if (itemDateStr === yesterdayStr) {
      groups.yesterday.push(item);
    } else if (itemDate >= startOfWeek) {
      groups.thisWeek.push(item);
    } else {
      groups.earlier.push(item);
    }
  });

  return groups;
}

function viewHistoryItem(el) {
  var index = el.dataset.index;
  sendVsCodeMessage({ type: 'viewHistoryItem', index: Number(index) });
}

function filterHistory(query) {
  renderHistory(state.history);
}

function setupHistorySearch() {
  var input = document.getElementById('historySearch');
  input.addEventListener('input', function () {
    filterHistory(input.value);
  });
}

function setupClearHistory() {
  document.getElementById('clearHistoryBtn').addEventListener('click', function () {
    clearHistory();
  });
}

function clearHistory() {
  if (state.history.length === 0) {
    showToast('No history to clear', 'info');
    return;
  }

  showConfirmDialog(
    'Clear all history?',
    'This action cannot be undone. All saved explanations will be permanently deleted.',
    function () {
      sendVsCodeMessage({ type: 'clearHistory' });
      state.history = [];
      renderHistory(state.history);
      showToast('History cleared', 'success');
    }
  );
}

function exportHistory() {
  if (state.history.length === 0) {
    showToast('No history to export', 'info');
    return;
  }

  var md = '# CodeLens AI History\n\n';
  state.history.forEach(function (item) {
    md += '## ' + (item.fileName || 'Unknown file') + '\n';
    md += '- **Language:** ' + (item.language || 'N/A') + '\n';
    md += '- **Depth:** ' + (item.depth || 'N/A') + '\n';
    md += '- **Timestamp:** ' + (item.timestamp || 'N/A') + '\n\n';
    md += (item.explanation || 'No explanation') + '\n\n---\n\n';
  });

  sendVsCodeMessage({ type: 'exportHistory', markdown: md });
  showToast('Exporting history...', 'info');
}

function setupExportHistory() {
  document.getElementById('exportHistoryBtn').addEventListener('click', exportHistory);
}

/* =========== Bookmark Functions =========== */
function loadBookmarks(data) {
  state.bookmarks = data || [];
  renderBookmarks(state.bookmarks);
}

function renderBookmarks(bookmarks) {
  var container = document.getElementById('bookmarkList');
  var empty = document.getElementById('bookmarkEmpty');
  var searchQuery = (document.getElementById('bookmarkSearch').value || '').toLowerCase();

  if (!bookmarks || bookmarks.length === 0) {
    container.innerHTML = '';
    empty.hidden = false;
    return;
  }

  empty.hidden = true;

  var filtered = bookmarks;
  if (searchQuery) {
    filtered = bookmarks.filter(function (b) {
      return b.filePath && b.filePath.toLowerCase().indexOf(searchQuery) !== -1;
    });
  }

  if (filtered.length === 0) {
    container.innerHTML = '<div class="bookmark-empty"><p>No bookmarks found for "' + escapeHtml(searchQuery) + '"</p></div>';
    return;
  }

  var html = '';
  filtered.forEach(function (bm, idx) {
    html += '<div class="bookmark-item" role="listitem">';
    html += '<div class="bookmark-header">';
    html += '<span class="bookmark-file">' + escapeHtml(bm.filePath || 'Unknown file') + '</span>';
    if (bm.lineNumber != null) html += '<span class="bookmark-line">Line ' + bm.lineNumber + '</span>';
    html += '</div>';
    if (bm.codeSnippet) html += '<div class="bookmark-code">' + escapeHtml(bm.codeSnippet) + '</div>';
    if (bm.note) html += '<div class="bookmark-note">' + escapeHtml(bm.note) + '</div>';
    html += '<div class="bookmark-actions">';
    html += '<button class="btn btn-small" onclick="navigateToBookmark(\'' + escapeHtml(bm.filePath || '') + '\', ' + (bm.lineNumber || 1) + ')" aria-label="Navigate to line ' + (bm.lineNumber || 1) + '">Open</button>';
    html += '<button class="delete-bookmark" onclick="deleteBookmark(' + idx + ')" aria-label="Delete bookmark">Delete</button>';
    html += '</div>';
    html += '</div>';
  });

  container.innerHTML = html;
}

function setupBookmarkSearch() {
  var input = document.getElementById('bookmarkSearch');
  input.addEventListener('input', function () {
    renderBookmarks(state.bookmarks);
  });
}

function navigateToBookmark(filePath, line) {
  sendVsCodeMessage({ type: 'navigateToLine', filePath: filePath, line: line });
}

function deleteBookmark(index) {
  var bm = state.bookmarks[index];
  if (!bm) return;
  state.bookmarks.splice(index, 1);
  renderBookmarks(state.bookmarks);
  sendVsCodeMessage({ type: 'deleteBookmark', index: index });
  showToast('Bookmark removed', 'success');
}

/* =========== Settings Functions =========== */
function loadSettings(data) {
  state.settings = data || {};
  applySettings(state.settings);
  populateSettings();
}

function applySettings(settings) {
  if (!settings) return;

  if (settings.dyslexiaFriendly) {
    document.body.classList.add('dyslexia-friendly');
  } else {
    document.body.classList.remove('dyslexia-friendly');
  }

  if (settings.highContrast) {
    document.body.classList.add('high-contrast');
  } else {
    document.body.classList.remove('high-contrast');
  }

  if (settings.reducedMotion) {
    document.body.classList.add('reduced-motion');
  } else {
    document.body.classList.remove('reduced-motion');
  }

  if (settings.simplifyMode) {
    document.body.classList.add('simplify-mode');
  } else {
    document.body.classList.remove('simplify-mode');
  }

  if (settings.depthLevel) {
    var radio = document.querySelector('.depth-slider input[value="' + settings.depthLevel + '"]');
    if (radio) radio.checked = true;
  }
}

function populateSettings() {
  var container = document.getElementById('settingsContainer');
  var s = state.settings || {};
  var defaults = getDefaultSettings();

  var groups = [
    {
      title: 'API & Model',
      settings: [
        { key: 'apiKey', label: 'API Key', description: 'Your API key for the AI provider', type: 'password' },
        { key: 'model', label: 'Model', description: 'AI model to use for analysis', type: 'select', options: [
          { value: 'gpt-4o', label: 'GPT-4o' },
          { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
          { value: 'claude-3-opus', label: 'Claude 3 Opus' },
          { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
        ] },
      ],
    },
    {
      title: 'Analysis',
      settings: [
        { key: 'depthLevel', label: 'Depth Level', description: 'How deeply to analyze your code', type: 'depth' },
        { key: 'enableAnalogy', label: 'Enable Analogy', description: 'Use real-world analogies to explain concepts', type: 'toggle' },
        { key: 'enableHeatmap', label: 'Enable Heatmap', description: 'Show code complexity heatmap in editor', type: 'toggle' },
        { key: 'enableCodeSmells', label: 'Enable Code Smells', description: 'Detect and highlight code smells', type: 'toggle' },
      ],
    },
    {
      title: 'Tokens & Performance',
      settings: [
        { key: 'chunkSize', label: 'Chunk Size', description: 'Number of lines to analyze at once', type: 'number', min: 10, max: 500 },
        { key: 'maxTokens', label: 'Max Tokens', description: 'Maximum tokens in AI response', type: 'number', min: 100, max: 8192 },
        { key: 'temperature', label: 'Temperature', description: 'Controls randomness in output (0 = precise, 2 = creative)', type: 'range', min: 0, max: 2, step: 0.1 },
      ],
    },
    {
      title: 'Accessibility',
      settings: [
        { key: 'dyslexiaFriendly', label: 'Dyslexia-Friendly Mode', description: 'Use OpenDyslexic font and increased spacing', type: 'toggle' },
        { key: 'simplifyMode', label: 'Simplify Mode', description: 'Simplify complex explanations', type: 'toggle' },
        { key: 'highContrast', label: 'High Contrast Mode', description: 'Increase contrast for better visibility', type: 'toggle' },
        { key: 'reducedMotion', label: 'Reduced Motion', description: 'Disable animations and transitions', type: 'toggle' },
      ],
    },
    {
      title: 'Learning & Interaction',
      settings: [
        { key: 'ttsEnabled', label: 'TTS Enabled', description: 'Read explanations aloud using text-to-speech', type: 'toggle' },
        { key: 'socraticMode', label: 'Socratic Mode', description: 'Guide you with questions instead of giving answers', type: 'toggle' },
        { key: 'quizMode', label: 'Quiz Mode', description: 'Ask quiz questions after explanations', type: 'toggle' },
        { key: 'practiceMode', label: 'Practice Mode', description: 'Suggest practice exercises based on code', type: 'toggle' },
      ],
    },
    {
      title: 'Cache',
      settings: [
        { key: 'cacheSize', label: 'Cache Size', description: 'Maximum number of cached responses', type: 'number', min: 10, max: 10000 },
      ],
    },
  ];

  var html = '';
  groups.forEach(function (group) {
    html += '<div class="settings-group" role="group" aria-label="' + escapeHtml(group.title) + '">';
    html += '<div class="settings-group-title">' + escapeHtml(group.title) + '</div>';
    group.settings.forEach(function (setting) {
      var value = s[setting.key] !== undefined ? s[setting.key] : defaults[setting.key];
      html += renderSetting(setting, value);
    });
    html += '</div>';
  });

  container.innerHTML = html;
}

function renderSetting(setting, value) {
  var label = escapeHtml(setting.label);
  var description = escapeHtml(setting.description);
  var key = setting.key;

  var controlHtml = '';
  switch (setting.type) {
    case 'password':
      controlHtml =
        '<div class="password-wrapper">' +
        '<input type="password" id="setting-' + key + '" value="' + escapeHtml(String(value || '')) + '" data-setting="' + key + '" aria-describedby="desc-' + key + '" autocomplete="off">' +
        '<button class="password-toggle" onclick="togglePasswordVisibility(\'setting-' + key + '\')" aria-label="Toggle password visibility" type="button">' +
        '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M8 3C4 3 1.5 6 1.5 8s2.5 5 6.5 5 6.5-3 6.5-5S12 3 8 3zm0 8.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zM8 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>' +
        '</button>' +
        '</div>';
      break;

    case 'select':
      var options = setting.options || [];
      var optsHtml = '';
      options.forEach(function (opt) {
        var selected = opt.value === value ? ' selected' : '';
        optsHtml += '<option value="' + escapeHtml(opt.value) + '"' + selected + '>' + escapeHtml(opt.label) + '</option>';
      });
      controlHtml = '<select id="setting-' + key + '" data-setting="' + key + '" aria-describedby="desc-' + key + '">' + optsHtml + '</select>';
      break;

    case 'toggle':
      var checked = value ? ' checked' : '';
      controlHtml =
        '<label class="toggle-switch" aria-label="' + label + '">' +
        '<input type="checkbox" data-setting="' + key + '"' + checked + ' aria-describedby="desc-' + key + '">' +
        '<span class="toggle-slider"></span>' +
        '</label>';
      break;

    case 'number':
      var min = setting.min != null ? ' min="' + setting.min + '"' : '';
      var max = setting.max != null ? ' max="' + setting.max + '"' : '';
      controlHtml = '<input type="number" id="setting-' + key + '" value="' + Number(value) + '" data-setting="' + key + '"' + min + max + ' aria-describedby="desc-' + key + '">';
      break;

    case 'range':
      var min = setting.min != null ? setting.min : 0;
      var max = setting.max != null ? setting.max : 1;
      var step = setting.step != null ? setting.step : 0.1;
      controlHtml =
        '<div class="range-wrapper">' +
        '<input type="range" id="setting-' + key + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + Number(value) + '" data-setting="' + key + '" aria-describedby="desc-' + key + '">' +
        '<span class="range-value" id="rangeval-' + key + '">' + Number(value) + '</span>' +
        '</div>';
      break;

    case 'depth':
      var depths = ['what', 'how', 'why'];
      var labels = { what: 'What', how: 'How', why: 'Why' };
      controlHtml =
        '<div class="depth-slider" role="radiogroup" aria-label="' + label + '">';
      depths.forEach(function (d) {
        var checked = d === value ? ' checked' : '';
        controlHtml +=
          '<label class="depth-option">' +
          '<input type="radio" name="setting-depth" value="' + d + '"' + checked + ' data-setting="' + key + '">' +
          '<span class="depth-label">' + labels[d] + '</span>' +
          '</label>';
      });
      controlHtml += '</div>';
      break;

    default:
      controlHtml = '<input type="text" id="setting-' + key + '" value="' + escapeHtml(String(value || '')) + '" data-setting="' + key + '" aria-describedby="desc-' + key + '">';
  }

  return (
    '<div class="setting-row">' +
    '<div class="setting-info">' +
    '<label class="setting-label" for="setting-' + key + '">' + label + '</label>' +
    '<span class="setting-description" id="desc-' + key + '">' + description + '</span>' +
    '</div>' +
    '<div class="setting-control">' + controlHtml + '</div>' +
    '</div>'
  );
}

function getDefaultSettings() {
  return {
    apiKey: '',
    model: 'gpt-4o',
    depthLevel: 'what',
    enableAnalogy: false,
    enableHeatmap: false,
    enableCodeSmells: false,
    chunkSize: 50,
    maxTokens: 2048,
    temperature: 0.7,
    dyslexiaFriendly: false,
    simplifyMode: false,
    highContrast: false,
    ttsEnabled: false,
    socraticMode: false,
    quizMode: false,
    practiceMode: false,
    cacheSize: 100,
    reducedMotion: false,
  };
}

function updateSetting(key, value) {
  state.settings[key] = value;
  applySettings({ [key]: value });
  sendVsCodeMessage({ type: 'updateSetting', key: key, value: value });
}

function setupSettingListeners() {
  var container = document.getElementById('settingsContainer');
  container.addEventListener('change', function (e) {
    var target = e.target;
    var key = target.dataset.setting;
    if (!key) return;

    var value;
    if (target.type === 'checkbox') {
      value = target.checked;
    } else if (target.type === 'number') {
      value = Number(target.value);
    } else if (target.type === 'range') {
      value = parseFloat(target.value);
      var rangeVal = document.getElementById('rangeval-' + key);
      if (rangeVal) rangeVal.textContent = value;
    } else {
      value = target.value;
    }

    updateSetting(key, value);
  });

  container.addEventListener('input', function (e) {
    var target = e.target;
    if (target.type === 'range') {
      var key = target.dataset.setting;
      if (key) {
        var rangeVal = document.getElementById('rangeval-' + key);
        if (rangeVal) rangeVal.textContent = target.value;
      }
    }
  });

  container.addEventListener('blur', function (e) {
    var target = e.target;
    if ((target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && target.dataset.setting) {
      if (target.type === 'password' || target.type === 'text') {
        updateSetting(target.dataset.setting, target.value);
      }
    }
  }, true);
}

function setupResetSettings() {
  document.getElementById('resetSettingsBtn').addEventListener('click', function () {
    showConfirmDialog(
      'Reset settings to defaults?',
      'This will reset all settings to their default values.',
      function () {
        var defaults = getDefaultSettings();
        Object.keys(defaults).forEach(function (key) {
          updateSetting(key, defaults[key]);
        });
        state.settings = { ...defaults };
        populateSettings();
        showToast('Settings reset to defaults', 'success');
      }
    );
  });
}

function showSettings() {
  switchTab('settings');
}

/* =========== Confirmation Dialog =========== */
function showConfirmDialog(title, message, onConfirm) {
  var overlay = document.createElement('div');
  overlay.style.cssText =
    'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px;';

  var dialog = document.createElement('div');
  dialog.setAttribute('role', 'alertdialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', title);
  dialog.style.cssText =
    'background:var(--bg-primary);border:1px solid var(--border-color);border-radius:8px;padding:20px;max-width:400px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,0.4);';

  dialog.innerHTML =
    '<h3 style="margin:0 0 8px;font-size:var(--font-size);color:var(--text-primary);">' + escapeHtml(title) + '</h3>' +
    '<p style="margin:0 0 16px;font-size:calc(var(--font-size) - 1px);color:var(--text-secondary);">' + escapeHtml(message) + '</p>' +
    '<div style="display:flex;gap:8px;justify-content:flex-end;">' +
    '<button class="btn" id="confirmCancel" aria-label="Cancel">Cancel</button>' +
    '<button class="btn btn-danger" id="confirmOk" aria-label="Confirm">Confirm</button>' +
    '</div>';

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  document.getElementById('confirmCancel').addEventListener('click', function () {
    document.body.removeChild(overlay);
  });

  document.getElementById('confirmOk').addEventListener('click', function () {
    document.body.removeChild(overlay);
    if (onConfirm) onConfirm();
  });

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) document.body.removeChild(overlay);
  });

  document.getElementById('confirmOk').focus();
}

/* =========== Toast Notifications =========== */
function showToast(message, type) {
  if (!message) return;
  type = type || 'info';

  var container = document.getElementById('toastContainer');
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.setAttribute('role', 'status');

  var icon = '';
  switch (type) {
    case 'success': icon = '<span class="toast-icon" style="color:var(--success-color);">&#10003;</span>'; break;
    case 'error': icon = '<span class="toast-icon" style="color:var(--danger-color);">&#10007;</span>'; break;
    case 'warning': icon = '<span class="toast-icon" style="color:var(--warning-color);">&#9888;</span>'; break;
    default: icon = '<span class="toast-icon" style="color:var(--info-color);">&#8505;</span>';
  }

  toast.innerHTML = icon + '<span class="toast-message">' + escapeHtml(message) + '</span>';
  container.appendChild(toast);

  setTimeout(function () {
    if (toast.parentNode) {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 300ms ease';
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }
  }, 4000);
}

/* =========== Utility Functions =========== */
function getTimestamp() {
  return new Date().toISOString();
}

function formatTime(date) {
  var h = date.getHours();
  var m = date.getMinutes();
  var ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
}

function autoResize(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
}

function setupAutoResize() {
  var textarea = document.getElementById('chatInput');
  textarea.addEventListener('input', function () { autoResize(textarea); });
}

function togglePasswordVisibility(inputId) {
  var input = document.getElementById(inputId);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () {
      showToast('Copied to clipboard', 'success');
    }).catch(function () {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  var textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast('Copied to clipboard', 'success');
  } catch (e) {
    showToast('Failed to copy', 'error');
  }
  document.body.removeChild(textarea);
}

function getSelectedDepth() {
  var checked = document.querySelector('.depth-slider input[name="depth"]:checked');
  return checked ? checked.value : 'what';
}

function updateContextIndicator() {
  var indicator = document.getElementById('contextIndicator');
  var label = document.getElementById('contextLabel');
  var ctx = state.context;

  if (ctx && ctx.fileName) {
    indicator.hidden = false;
    var text = ctx.fileName;
    if (ctx.lines) text += ' \u2014 Lines ' + ctx.lines;
    label.textContent = text;
  } else {
    indicator.hidden = true;
  }
}

function setupAttachButton() {
  document.getElementById('attachBtn').addEventListener('click', function () {
    sendVsCodeMessage({ type: 'attachCode' });
  });
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === 'Enter') {
      if (state.activeTab === 'chat') sendMessage();
    }
    if (e.key === 'Escape') {
      if (state.streaming) stopStreaming();
    }
  });
}

function renderAll() {
  renderHistory(state.history);
  renderBookmarks(state.bookmarks);
  populateSettings();
  updateContextIndicator();
  if (state.messages.length > 0) {
    var container = document.getElementById('chatMessages');
    container.innerHTML = '';
    state.messages.forEach(function (msg) {
      addMessage(msg.role, msg.content, msg.timestamp);
      if (msg.role === 'assistant') {
        var body = container.querySelector('.message.assistant:last-child .message-body');
        if (body) body.innerHTML = renderMarkdown(msg.content);
      }
    });
  }
}

/* =========== Settings Listeners (run after DOM ready) =========== */

/* =========== Bootstrap =========== */
document.addEventListener('DOMContentLoaded', function () {
  init();
  setupSettingListeners();
});

/* =========== Export for testing =========== */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { state, renderMarkdown, escapeHtml, formatTime, groupByDate, getDefaultSettings };
}
