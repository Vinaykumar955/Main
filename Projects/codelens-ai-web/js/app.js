import { CodeEditor } from './editor.js';
import { Renderer } from './renderer.js';
import { Storage } from './storage.js';
import { SpacedRepetition, QuizEngine, StatsTracker } from './learner.js';
import { Glossary } from './glossary.js';
import { Visualizer } from './visualizer.js';
import { ToastManager, ModalManager, TooltipManager, CommandPalette, ContextMenu, SplitPaneManager, KeyboardShortcuts, OnboardingTour } from './ui.js';
import { explainCode, cancelRequest, setApiKey } from './api.js';
import { parseExplanation, parseCodeSmells, parseComplexityScore, parseAnalogies, parseConcepts } from './parser.js';

const state = {
  initialized: false,
  theme: 'dark',
  language: 'javascript',
  model: 'qwen/qwen3-coder:free',
  depth: 'how',
  apiKey: '',
  code: '',
  currentExplanation: null,
  isLoading: false,
  activeTab: 'learn',
  historyCount: 0,
};

export async function init() {
  const storage = new Storage();
  const toast = new ToastManager();
  const modal = new ModalManager();
  const tooltip = new TooltipManager();
  const glossary = new Glossary();
  const spacedRepetition = new SpacedRepetition();
  const quizEngine = new QuizEngine();
  const statsTracker = new StatsTracker(storage);
  const visualizer = new Visualizer();

  state.apiKey = storage.getApiKey();
  const settings = storage.getSettings();
  Object.assign(state, settings);

  document.documentElement.setAttribute('data-theme', state.theme);

  const editor = new CodeEditor(document.getElementById('code-panel'));
  editor.init();
  editor.setLanguage(state.language);

  const renderer = new Renderer(document.getElementById('explanation-content'));
  renderer.showEmptyState();

  initTabs();
  initKeyboardShortcuts(editor, toast, modal);
  setupEventListeners(editor, renderer, storage, toast, modal, glossary, statsTracker, visualizer);

  if (!state.apiKey) {
    toast.show('Please enter your OpenRouter API key in Settings', 'warning', 6000);
    setTimeout(() => openSettings(storage, toast), 1000);
  }

  updateHistoryBadge(storage);
  state.initialized = true;
}

function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
}

function switchTab(tabId) {
  state.activeTab = tabId;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelector(`.tab[data-tab="${tabId}"]`)?.classList.add('active');
  document.getElementById(`tab-${tabId}`)?.classList.add('active');

  switch (tabId) {
    case 'learn': renderLearnTab(); break;
    case 'history': renderHistoryTab(); break;
    case 'quiz': renderQuizTab(); break;
    case 'glossary': renderGlossaryTab(); break;
    case 'stats': renderStatsTab(); break;
  }
}

function renderLearnTab() {
  const pane = document.getElementById('tab-learn');
  if (!pane) return;

  const storage = new Storage();
  const spacedRepetition = new SpacedRepetition();
  const quizEngine = new QuizEngine();
  const statsTracker = new StatsTracker(storage);

  const streak = statsTracker.getStreak();
  const dueItems = spacedRepetition.getDueItems();
  const summary = statsTracker.getSummary();
  const skills = statsTracker.getSkillLevels();

  pane.innerHTML = `
    <div class="learn-grid">
      <div class="card streak-card">
        <div class="card-header">
          <span class="card-icon">&#x1F525;</span>
          <h3>Daily Streak</h3>
        </div>
        <div class="streak-display">
          <span class="streak-count">${streak.current}</span>
          <span class="streak-label">day${streak.current !== 1 ? 's' : ''}</span>
        </div>
        <div class="streak-dots">
          ${Array.from({ length: 7 }, (_, i) => {
            const dayDate = new Date();
            dayDate.setDate(dayDate.getDate() - (6 - i));
            const dayStr = dayDate.toISOString().split('T')[0];
            const active = streak.history && streak.history.includes(dayStr);
            return `<span class="streak-dot ${active ? 'active' : ''}" title="${dayDate.toLocaleDateString()}"></span>`;
          }).join('')}
        </div>
        <p class="streak-message">${streak.current === 0 ? 'Start today to build your streak!' : 'Keep learning every day!'}</p>
      </div>

      <div class="card reviews-card">
        <div class="card-header">
          <span class="card-icon">&#x1F504;</span>
          <h3>Reviews Due</h3>
          <span class="card-badge">${dueItems.length}</span>
        </div>
        <div class="reviews-list">
          ${dueItems.length === 0
            ? '<p class="empty-message">No reviews due. Add more explanations to learn!</p>'
            : dueItems.slice(0, 5).map(item => `
              <div class="review-item" data-id="${item.id}">
                <span class="review-concept">${item.concept || 'Unknown'}</span>
                <span class="review-difficulty">${'&#9733;'.repeat(item.difficulty || 1)}</span>
                <span class="review-next">Next: ${new Date(item.nextReview).toLocaleDateString()}</span>
              </div>
            `).join('')
          }
        </div>
        ${dueItems.length > 5 ? '<p class="more-link">+' + (dueItems.length - 5) + ' more items</p>' : ''}
      </div>

      <div class="card skill-tree-card">
        <div class="card-header">
          <span class="card-icon">&#x1F331;</span>
          <h3>Skill Tree</h3>
        </div>
        <div class="skill-tree-placeholder">
          <svg viewBox="0 0 200 150" class="skill-tree-svg">
            <path d="M100 10 L100 140" stroke="var(--border-color)" stroke-width="2" fill="none"/>
            <path d="M100 30 Q60 50 40 40" stroke="var(--border-color)" stroke-width="2" fill="none"/>
            <path d="M100 30 Q140 50 160 40" stroke="var(--border-color)" stroke-width="2" fill="none"/>
            <path d="M100 60 Q50 80 20 70" stroke="var(--border-color)" stroke-width="2" fill="none"/>
            <path d="M100 60 Q150 80 180 70" stroke="var(--border-color)" stroke-width="2" fill="none"/>
            <path d="M100 100 Q60 120 30 110" stroke="var(--border-color)" stroke-width="2" fill="none"/>
            <path d="M100 100 Q140 120 170 110" stroke="var(--border-color)" stroke-width="2" fill="none"/>
            <circle cx="100" cy="10" r="6" class="skill-node unlocked" fill="var(--accent-color)"/>
            <circle cx="40" cy="40" r="5" class="skill-node ${skills.length > 2 ? 'unlocked' : 'locked'}" fill="var(--accent-color)"/>
            <circle cx="160" cy="40" r="5" class="skill-node ${skills.length > 3 ? 'unlocked' : 'locked'}" fill="var(--accent-color)"/>
            <circle cx="20" cy="70" r="4" class="skill-node locked" fill="var(--border-color)"/>
            <circle cx="180" cy="70" r="4" class="skill-node locked" fill="var(--border-color)"/>
            <circle cx="30" cy="110" r="4" class="skill-node locked" fill="var(--border-color)"/>
            <circle cx="170" cy="110" r="4" class="skill-node locked" fill="var(--border-color)"/>
          </svg>
          <p class="skill-tree-hint">Explain more code to unlock advanced skills</p>
        </div>
      </div>

      <div class="card learn-stats-card">
        <div class="card-header">
          <span class="card-icon">&#x1F4CA;</span>
          <h3>Learning Stats</h3>
        </div>
        <div class="mini-stats">
          <div class="mini-stat">
            <span class="mini-stat-value">${summary.totalExplanations || 0}</span>
            <span class="mini-stat-label">Explanations</span>
          </div>
          <div class="mini-stat">
            <span class="mini-stat-value">${summary.totalQuizzes || 0}</span>
            <span class="mini-stat-label">Quizzes</span>
          </div>
          <div class="mini-stat">
            <span class="mini-stat-value">${summary.totalConcepts || 0}</span>
            <span class="mini-stat-label">Concepts</span>
          </div>
          <div class="mini-stat">
            <span class="mini-stat-value">${streak.best || 0}</span>
            <span class="mini-stat-label">Best Streak</span>
          </div>
        </div>
      </div>
    </div>
  `;

  pane.querySelectorAll('.review-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      const history = storage.getHistory();
      const entry = history.find(h => h.id === id || h.timestamp?.toString() === id);
      if (entry) {
        document.getElementById('code-panel')?.__editor?.setValue(entry.code || '');
        document.getElementById('explain-btn')?.click();
      }
    });
  });
}

function renderHistoryTab() {
  const pane = document.getElementById('tab-history');
  if (!pane) return;

  const storage = new Storage();
  let history = storage.getHistory() || [];

  pane.innerHTML = `
    <div class="history-controls">
      <div class="history-search">
        <input type="text" id="history-search-input" class="input" placeholder="Search explanations..." />
        <span class="search-icon">&#x1F50D;</span>
      </div>
      <div class="history-filters">
        <button class="filter-btn active" data-filter="all">All</button>
        <button class="filter-btn" data-filter="today">Today</button>
        <button class="filter-btn" data-filter="week">This Week</button>
        <button class="filter-btn" data-filter="month">This Month</button>
      </div>
      <div class="history-actions">
        <button id="clear-history-btn" class="btn btn-danger btn-sm">Clear All</button>
        <button id="export-history-btn" class="btn btn-primary btn-sm">Export All</button>
      </div>
    </div>
    <div class="history-list" id="history-list">
      ${renderHistoryItems(history)}
    </div>
  `;

  const searchInput = document.getElementById('history-search-input');
  const filterBtns = document.querySelectorAll('.filter-btn');

  searchInput?.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const filtered = filterHistory(history, activeFilter, query);
    document.getElementById('history-list').innerHTML = renderHistoryItems(filtered);
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      const query = searchInput?.value.toLowerCase() || '';
      const filtered = filterHistory(history, filter, query);
      document.getElementById('history-list').innerHTML = renderHistoryItems(filtered);
    });
  });

  document.getElementById('clear-history-btn')?.addEventListener('click', () => clearHistory(storage, new ToastManager()));
  document.getElementById('export-history-btn')?.addEventListener('click', () => exportAllHistory(storage, new ToastManager()));
}

function renderHistoryItems(items) {
  if (!items || items.length === 0) {
    return '<div class="history-empty"><span class="empty-icon">&#x1F4AD;</span><p>No explanations yet. Start by explaining some code!</p></div>';
  }

  return items.map((item, index) => {
    const snippet = item.explanation
      ? item.explanation.replace(/<[^>]*>/g, '').substring(0, 120) + (item.explanation.length > 120 ? '...' : '')
      : 'No explanation content';
    const codeSnippet = item.code
      ? item.code.substring(0, 80).replace(/\n/g, ' ') + (item.code.length > 80 ? '...' : '')
      : '';

    return `
      <div class="history-item" data-index="${index}">
        <div class="history-item-header">
          <span class="history-lang">${item.language || 'unknown'}</span>
          <span class="history-depth">${item.depth || 'how'}</span>
          <span class="history-date">${item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}</span>
          <span class="history-complexity ${item.complexity ? 'complexity-' + (item.complexity.level || 'moderate') : ''}">
            ${item.complexity ? (item.complexity.label || item.complexity.level || '') : ''}
          </span>
        </div>
        <div class="history-item-code">${escapeHtml(codeSnippet)}</div>
        <div class="history-item-explanation">${escapeHtml(snippet)}</div>
        <div class="history-item-footer">
          <span class="history-concepts">${item.concepts ? item.concepts.slice(0, 3).map(c => `<span class="concept-chip">${c}</span>`).join('') : ''}</span>
          <span class="history-duration">${item.duration ? (item.duration / 1000).toFixed(1) + 's' : ''}</span>
        </div>
      </div>
    `;
  }).join('');
}

function filterHistory(history, filter, query) {
  let filtered = [...history];

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  switch (filter) {
    case 'today':
      filtered = filtered.filter(item => item.timestamp >= startOfDay.getTime());
      break;
    case 'week':
      filtered = filtered.filter(item => item.timestamp >= startOfWeek.getTime());
      break;
    case 'month':
      filtered = filtered.filter(item => item.timestamp >= startOfMonth.getTime());
      break;
  }

  if (query) {
    filtered = filtered.filter(item =>
      (item.code && item.code.toLowerCase().includes(query)) ||
      (item.explanation && item.explanation.toLowerCase().includes(query)) ||
      (item.language && item.language.toLowerCase().includes(query)) ||
      (item.concepts && item.concepts.some(c => c.toLowerCase().includes(query)))
    );
  }

  return filtered.reverse();
}

function renderQuizTab() {
  const pane = document.getElementById('tab-quiz');
  if (!pane) return;

  const storage = new Storage();
  const quizEngine = new QuizEngine();
  const statsTracker = new StatsTracker(storage);
  const currentCode = state.code || '';

  pane.innerHTML = `
    <div class="quiz-container">
      <div class="quiz-header">
        <div class="quiz-score">
          <span class="score-label">Score</span>
          <span class="score-value" id="quiz-score">0</span>
        </div>
        <div class="quiz-total">
          <span class="total-label">Questions</span>
          <span class="total-value" id="quiz-total">0</span>
        </div>
        <div class="quiz-streak">
          <span class="streak-label">Streak</span>
          <span class="streak-value" id="quiz-streak">0</span>
        </div>
        <button id="quiz-generate-btn" class="btn btn-primary" ${!currentCode ? 'disabled' : ''}>
          Generate Quiz from Code
        </button>
      </div>
      <div class="quiz-content" id="quiz-content">
        <div class="quiz-placeholder">
          <span class="placeholder-icon">&#x2753;</span>
          <p>${currentCode ? 'Click "Generate Quiz from Code" to test your understanding!' : 'Enter some code first, then generate a quiz to test your knowledge.'}</p>
        </div>
      </div>
    </div>
  `;

  let currentQuestion = null;
  let score = 0;
  let total = 0;
  let streak = 0;
  let answered = false;

  document.getElementById('quiz-generate-btn')?.addEventListener('click', async () => {
    const code = currentCode || document.querySelector('#code-panel textarea')?.value || '';
    if (!code.trim()) {
      new ToastManager().show('Please enter code first.', 'warning');
      return;
    }

    const quizContent = document.getElementById('quiz-content');
    quizContent.innerHTML = '<div class="quiz-loading"><div class="spinner"></div><p>Generating quiz questions...</p></div>';

    try {
      const questions = await quizEngine.generateQuiz(code, state.language, {
        apiKey: state.apiKey
      });

      if (!questions || questions.length === 0) {
        quizContent.innerHTML = '<div class="quiz-placeholder"><span class="placeholder-icon">&#x26A0;</span><p>Could not generate questions. Try a different code snippet.</p></div>';
        return;
      }

      score = 0;
      total = 0;
      streak = 0;
      currentQuestion = 0;
      answered = false;
      document.getElementById('quiz-score').textContent = '0';
      document.getElementById('quiz-total').textContent = '0';
      document.getElementById('quiz-streak').textContent = '0';

      showQuizQuestion(quizContent, questions, 0);
    } catch (err) {
      quizContent.innerHTML = `<div class="quiz-placeholder"><span class="placeholder-icon">&#x26A0;</span><p>Error: ${err.message}</p></div>`;
    }
  });

  function showQuizQuestion(container, questions, index) {
    if (index >= questions.length) {
      container.innerHTML = `
        <div class="quiz-complete">
          <span class="complete-icon">&#x1F389;</span>
          <h3>Quiz Complete!</h3>
          <p>You scored ${score} out of ${questions.length}</p>
          <div class="quiz-result-bar">
            <div class="quiz-result-fill" style="width:${questions.length > 0 ? (score / questions.length) * 100 : 0}%"></div>
          </div>
          <p class="result-message">${score === questions.length ? 'Perfect score! Amazing!' : score >= questions.length * 0.7 ? 'Great job! Keep it up!' : 'Keep practicing, you\'ll get better!'}</p>
          <button class="btn btn-primary" id="quiz-retry-btn">Try Again</button>
        </div>
      `;
      document.getElementById('quiz-retry-btn')?.addEventListener('click', () => {
        document.getElementById('quiz-generate-btn')?.click();
      });
      statsTracker.recordQuiz(score, questions.length);
      return;
    }

    const q = questions[index];
    currentQuestion = index;
    answered = false;
    document.getElementById('quiz-total').textContent = `${index + 1}/${questions.length}`;

    const optionsHtml = q.options.map((opt, i) => `
      <button class="quiz-option" data-index="${i}" disabled="${answered}">
        <span class="option-letter">${String.fromCharCode(65 + i)}</span>
        <span class="option-text">${escapeHtml(opt)}</span>
      </button>
    `).join('');

    container.innerHTML = `
      <div class="quiz-question" data-index="${index}">
        <div class="question-progress">Question ${index + 1} of ${questions.length}</div>
        <h3 class="question-text">${escapeHtml(q.question)}</h3>
        <div class="quiz-options">${optionsHtml}</div>
        <div class="quiz-feedback" id="quiz-feedback" style="display:none;"></div>
        <button class="btn btn-primary quiz-next-btn" id="quiz-next-btn" style="display:none;">Next Question</button>
      </div>
    `;

    const correctIndex = q.correctIndex !== undefined ? q.correctIndex : (q.correct || 0);

    container.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;

        const selected = parseInt(btn.dataset.index);
        const isCorrect = selected === correctIndex;

        container.querySelectorAll('.quiz-option').forEach((opt, i) => {
          opt.disabled = true;
          if (i === correctIndex) opt.classList.add('correct');
          if (i === selected && !isCorrect) opt.classList.add('incorrect');
        });

        if (isCorrect) {
          score++;
          streak++;
          document.getElementById('quiz-score').textContent = score;
          document.getElementById('quiz-streak').textContent = streak;
        } else {
          streak = 0;
          document.getElementById('quiz-streak').textContent = '0';
        }

        const feedback = document.getElementById('quiz-feedback');
        feedback.style.display = 'block';
        feedback.className = `quiz-feedback ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`;
        feedback.innerHTML = `
          <span class="feedback-icon">${isCorrect ? '&#x2713;' : '&#x2717;'}</span>
          <div>
            <strong>${isCorrect ? 'Correct!' : 'Incorrect'}</strong>
            <p>${isCorrect ? (q.explanation || 'Great job!') : (q.explanation || `The correct answer was: ${q.options[correctIndex]}`)}</p>
          </div>
        `;

        const nextBtn = document.getElementById('quiz-next-btn');
        nextBtn.style.display = 'inline-flex';
        nextBtn.onclick = () => showQuizQuestion(container, questions, index + 1);
      });
    });
  }
}

function renderGlossaryTab() {
  const pane = document.getElementById('tab-glossary');
  if (!pane) return;

  const glossary = new Glossary();
  const terms = glossary.getAllTerms() || [];
  const categories = [...new Set(terms.map(t => t.category).filter(Boolean))];

  pane.innerHTML = `
    <div class="glossary-controls">
      <div class="glossary-search">
        <input type="text" id="glossary-search-input" class="input" placeholder="Search glossary terms..." />
        <span class="search-icon">&#x1F50D;</span>
      </div>
      <div class="glossary-categories">
        <button class="category-chip active" data-category="all">All</button>
        ${categories.map(cat => `
          <button class="category-chip" data-category="${cat}">${escapeHtml(cat)}</button>
        `).join('')}
      </div>
    </div>
    <div class="glossary-list" id="glossary-list">
      ${renderGlossaryTerms(terms)}
    </div>
  `;

  const searchInput = document.getElementById('glossary-search-input');
  const categoryChips = document.querySelectorAll('.category-chip');

  let activeCategory = 'all';

  function filterAndRender() {
    const query = searchInput?.value.toLowerCase() || '';
    let filtered = terms;

    if (activeCategory !== 'all') {
      filtered = filtered.filter(t => t.category === activeCategory);
    }

    if (query) {
      filtered = filtered.filter(t =>
        t.term.toLowerCase().includes(query) ||
        t.definition.toLowerCase().includes(query) ||
        (t.aliases && t.aliases.some(a => a.toLowerCase().includes(query)))
      );
    }

    document.getElementById('glossary-list').innerHTML = renderGlossaryTerms(filtered);
  }

  searchInput?.addEventListener('input', filterAndRender);

  categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      categoryChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.dataset.category;
      filterAndRender();
    });
  });
}

function renderGlossaryTerms(terms) {
  if (!terms || terms.length === 0) {
    return '<div class="glossary-empty"><span class="empty-icon">&#x1F4D6;</span><p>No glossary terms found.</p></div>';
  }

  return terms.map(t => `
    <div class="glossary-term" data-term="${escapeHtml(t.term)}">
      <div class="glossary-term-header">
        <span class="glossary-term-name">${escapeHtml(t.term)}</span>
        ${t.category ? `<span class="glossary-term-category">${escapeHtml(t.category)}</span>` : ''}
        <span class="glossary-term-toggle">&#x25BC;</span>
      </div>
      <div class="glossary-term-body">
        <p class="glossary-term-definition">${escapeHtml(t.definition)}</p>
        ${t.aliases && t.aliases.length > 0 ? `<div class="glossary-aliases"><strong>Also known as:</strong> ${t.aliases.map(a => `<span class="alias-chip">${escapeHtml(a)}</span>`).join(', ')}</div>` : ''}
        ${t.example ? `<pre class="glossary-example"><code>${escapeHtml(t.example)}</code></pre>` : ''}
        ${t.related && t.related.length > 0 ? `<div class="glossary-related"><strong>Related:</strong> ${t.related.map(r => `<span class="related-link" data-term="${escapeHtml(r)}">${escapeHtml(r)}</span>`).join(', ')}</div>` : ''}
      </div>
    </div>
  `).join('');
}

function renderStatsTab() {
  const pane = document.getElementById('tab-stats');
  if (!pane) return;

  const storage = new Storage();
  const statsTracker = new StatsTracker(storage);
  const summary = statsTracker.getSummary();
  const skillLevels = statsTracker.getSkillLevels();
  const streak = statsTracker.getStreak();
  const badges = statsTracker.getBadges ? statsTracker.getBadges() : [];

  const skillCategories = [
    { key: 'syntax', label: 'Syntax Mastery', color: '#4CAF50' },
    { key: 'algorithms', label: 'Algorithms', color: '#2196F3' },
    { key: 'patterns', label: 'Design Patterns', color: '#9C27B0' },
    { key: 'optimization', label: 'Optimization', color: '#FF9800' },
    { key: 'debugging', label: 'Debugging', color: '#F44336' },
    { key: 'best-practices', label: 'Best Practices', color: '#00BCD4' },
  ];

  const maxSkill = 100;

  pane.innerHTML = `
    <div class="stats-overview">
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">&#x1F4AC;</div>
          <div class="stat-info">
            <span class="stat-number">${summary.totalExplanations || 0}</span>
            <span class="stat-label">Explanations</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">&#x270D;</div>
          <div class="stat-info">
            <span class="stat-number">${summary.totalQuizzes || 0}</span>
            <span class="stat-label">Quizzes</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">&#x1F525;</div>
          <div class="stat-info">
            <span class="stat-number">${streak.current || 0}</span>
            <span class="stat-label">Day Streak</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">&#x1F4A1;</div>
          <div class="stat-info">
            <span class="stat-number">${summary.totalConcepts || 0}</span>
            <span class="stat-label">Concepts</span>
          </div>
        </div>
      </div>

      <div class="stats-chart-section">
        <h3>Skill Radar</h3>
        <div class="radar-chart-container">
          <canvas id="radar-chart" width="300" height="300"></canvas>
        </div>
      </div>

      <div class="stats-progress-section">
        <h3>Skill Progress</h3>
        ${skillCategories.map(skill => {
          const level = skillLevels[skill.key] || 0;
          const pct = Math.min(Math.round((level / maxSkill) * 100), 100);
          return `
            <div class="skill-progress">
              <div class="skill-progress-header">
                <span class="skill-name">${skill.label}</span>
                <span class="skill-level">${pct}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width:${pct}%;background:${skill.color};"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="stats-badges-section">
        <h3>Achievement Badges</h3>
        <div class="badges-grid">
          ${badges.length === 0
            ? '<p class="empty-message">Complete activities to earn badges!</p>'
            : badges.map(badge => `
              <div class="badge ${badge.unlocked ? 'unlocked' : 'locked'}" title="${badge.description || badge.name}">
                <div class="badge-icon">${badge.icon || '&#x1F3C6;'}</div>
                <div class="badge-name">${escapeHtml(badge.name)}</div>
                ${badge.unlocked ? '' : '<div class="badge-lock">&#x1F512;</div>'}
              </div>
            `).join('')
          }
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const canvas = document.getElementById('radar-chart');
    if (canvas) {
      drawRadarChart(canvas, skillCategories, skillLevels, maxSkill);
    }
  }, 50);
}

function drawRadarChart(canvas, categories, levels, maxVal) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(cx, cy) - 30;
  const numAxes = categories.length;
  const angleStep = (Math.PI * 2) / numAxes;

  ctx.clearRect(0, 0, width, height);

  const gridLevels = 5;
  for (let grid = 1; grid <= gridLevels; grid++) {
    const r = (radius / gridLevels) * grid;
    ctx.beginPath();
    for (let i = 0; i <= numAxes; i++) {
      const angle = -Math.PI / 2 + i * angleStep;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(var(--border-color-rgb, 100, 100, 100), 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  categories.forEach((cat, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.strokeStyle = 'rgba(var(--border-color-rgb, 100, 100, 100), 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const labelR = radius + 15;
    const lx = cx + labelR * Math.cos(angle);
    const ly = cy + labelR * Math.sin(angle);
    ctx.fillStyle = 'var(--text-color, #e0e0e0)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(cat.label, lx, ly);
  });

  ctx.beginPath();
  categories.forEach((cat, i) => {
    const level = levels[cat.key] || 0;
    const value = Math.min(level / maxVal, 1);
    const r = radius * value;
    const angle = -Math.PI / 2 + i * angleStep;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
  ctx.fill();
  ctx.strokeStyle = 'rgb(99, 102, 241)';
  ctx.lineWidth = 2;
  ctx.stroke();

  categories.forEach((cat, i) => {
    const level = levels[cat.key] || 0;
    const value = Math.min(level / maxVal, 1);
    const r = radius * value;
    const angle = -Math.PI / 2 + i * angleStep;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgb(99, 102, 241)';
    ctx.fill();
  });
}

function setupEventListeners(editor, renderer, storage, toast, modal, glossary, statsTracker, visualizer) {
  document.getElementById('explain-btn')?.addEventListener('click', () => handleExplain(editor, renderer, storage, toast));
  document.addEventListener('codelens:explain-request', () => handleExplain(editor, renderer, storage, toast));

  document.getElementById('theme-toggle')?.addEventListener('click', () => toggleTheme(storage));

  document.getElementById('settings-btn')?.addEventListener('click', () => openSettings(storage, toast));

  document.getElementById('export-btn')?.addEventListener('click', () => exportExplanation(storage, toast));

  document.addEventListener('codelens:search-glossary', (e) => {
    const term = e.detail?.term;
    if (term) {
      switchTab('glossary');
      const searchInput = document.querySelector('#tab-glossary .glossary-search input');
      if (searchInput) {
        searchInput.value = term;
        searchInput.dispatchEvent(new Event('input'));
      }
    }
  });

  document.addEventListener('click', (e) => {
    const relatedLink = e.target.closest('.related-link');
    if (relatedLink) {
      const term = relatedLink.dataset.term;
      if (term) {
        const searchInput = document.querySelector('#tab-glossary .glossary-search input');
        if (searchInput) {
          switchTab('glossary');
          searchInput.value = term;
          searchInput.dispatchEvent(new Event('input'));
        }
      }
    }
  });

  document.addEventListener('codelens:api-key-changed', (e) => {
    if (e.detail?.apiKey) {
      state.apiKey = e.detail.apiKey;
      setApiKey(state.apiKey);
    }
  });
}

async function handleExplain(editor, renderer, storage, toast) {
  const code = editor.getCode();
  if (!code || !code.trim()) {
    toast.show('Please enter or paste some code first.', 'warning');
    return;
  }

  if (!state.apiKey) {
    toast.show('Please set your OpenRouter API key first.', 'error', 5000);
    setTimeout(() => openSettings(storage, toast), 500);
    return;
  }

  state.isLoading = true;
  state.code = code;
  renderer.clear();
  renderer.showSkeleton();

  const language = editor.getLanguage();
  const depth = state.depth;
  const startTime = Date.now();

  renderer.abortController = new AbortController();

  try {
    await explainCode(code, language, depth, {
      onToken: (token) => {
        if (renderer.isSkeletonVisible()) {
          renderer.hideSkeleton();
        }
        renderer.appendStreamToken(token);
      },
      onComplete: (fullResponse) => {
        try {
          const complexity = parseComplexityScore(fullResponse);
          const smells = parseCodeSmells(fullResponse, code);
          const analogies = parseAnalogies(fullResponse);
          const concepts = parseConcepts(fullResponse);

          const data = { explanation: fullResponse, complexity, smells, analogies, concepts };
          renderer.renderComplete(data);

          const duration = Date.now() - startTime;
          storage.addToHistory({ code, language, depth, ...data, duration, timestamp: Date.now() });

          if (concepts && concepts.length > 0) {
            statsTracker.recordExplanation(concepts);
          }

          state.currentExplanation = data;
          state.isLoading = false;

          updateHistoryBadge(storage);

          const conceptChips = document.querySelectorAll('.concept-chip');
          conceptChips.forEach(chip => {
            chip.addEventListener('click', () => {
              const term = chip.textContent.trim();
              document.dispatchEvent(new CustomEvent('codelens:search-glossary', { detail: { term } }));
            });
          });
        } catch (parseErr) {
          renderer.hideSkeleton();
          renderer.renderComplete({ explanation: fullResponse });
          state.isLoading = false;
          toast.show('Explanation rendered but some data could not be parsed.', 'warning');
        }
      },
      onError: (error) => {
        renderer.hideSkeleton();
        renderer.showError(error);
        state.isLoading = false;
        toast.show(error.message || error, 'error');
      }
    }, {
      apiKey: state.apiKey,
      model: state.model,
      signal: renderer.abortController?.signal
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      renderer.hideSkeleton();
      renderer.showEmptyState();
      state.isLoading = false;
      toast.show('Request cancelled.', 'info');
      return;
    }
    renderer.hideSkeleton();
    renderer.showError(err.message || 'An unexpected error occurred.');
    state.isLoading = false;
    toast.show(err.message || 'Network error. Please try again.', 'error');
  }
}

function toggleTheme(storage) {
  const themes = ['dark', 'light', 'high-contrast', 'solarized', 'dracula', 'nord'];
  const current = themes.indexOf(state.theme);
  const next = (current + 1) % themes.length;
  state.theme = themes[next];
  document.documentElement.setAttribute('data-theme', state.theme);
  storage.updateSettings({ theme: state.theme });
}

function initKeyboardShortcuts(editor, toast, modal) {
  const shortcutDefs = [
    { key: 'ctrl+enter', description: 'Explain code', handler: () => document.getElementById('explain-btn')?.click() },
    { key: 'ctrl+k', description: 'Command palette', handler: () => {
      const palette = new CommandPalette();
      palette.show([
        { id: 'explain', label: 'Explain Code', shortcut: 'Ctrl+Enter', action: () => document.getElementById('explain-btn')?.click() },
        { id: 'theme', label: 'Toggle Theme', shortcut: 'Ctrl+D', action: () => document.getElementById('theme-toggle')?.click() },
        { id: 'settings', label: 'Open Settings', shortcut: '', action: () => document.getElementById('settings-btn')?.click() },
        { id: 'export', label: 'Export Explanation', shortcut: 'Ctrl+Shift+E', action: () => document.getElementById('export-btn')?.click() },
        { id: 'tab-learn', label: 'Go to Learn Tab', shortcut: 'Ctrl+1', action: () => switchTab('learn') },
        { id: 'tab-history', label: 'Go to History Tab', shortcut: 'Ctrl+2', action: () => switchTab('history') },
        { id: 'tab-quiz', label: 'Go to Quiz Tab', shortcut: 'Ctrl+3', action: () => switchTab('quiz') },
        { id: 'tab-glossary', label: 'Go to Glossary Tab', shortcut: 'Ctrl+4', action: () => switchTab('glossary') },
        { id: 'tab-stats', label: 'Go to Stats Tab', shortcut: 'Ctrl+5', action: () => switchTab('stats') },
      ]);
    }},
    { key: 'ctrl+d', description: 'Toggle theme', handler: () => document.getElementById('theme-toggle')?.click() },
    { key: 'ctrl+1', description: 'Learn tab', handler: () => switchTab('learn') },
    { key: 'ctrl+2', description: 'History tab', handler: () => switchTab('history') },
    { key: 'ctrl+3', description: 'Quiz tab', handler: () => switchTab('quiz') },
    { key: 'ctrl+4', description: 'Glossary tab', handler: () => switchTab('glossary') },
    { key: 'ctrl+5', description: 'Stats tab', handler: () => switchTab('stats') },
    { key: 'ctrl+shift+e', description: 'Export explanation', handler: () => document.getElementById('export-btn')?.click() },
    { key: 'ctrl+l', description: 'Focus editor', handler: () => {
      if (editor && typeof editor.focus === 'function') {
        editor.focus();
      }
    }},
    { key: '?', description: 'Show keyboard shortcuts', handler: () => {
      const modalManager = modal || new ModalManager();
      const shortcutsHtml = shortcutDefs.map(s => `
        <div class="shortcut-row">
          <span class="shortcut-key"><kbd>${s.key.replace('+', '</kbd>+<kbd>')}</kbd></span>
          <span class="shortcut-desc">${s.description}</span>
        </div>
      `).join('');
      modalManager.show('Keyboard Shortcuts', `<div class="shortcuts-list">${shortcutsHtml}</div>`, [
        { label: 'Close', variant: 'primary', action: () => modalManager.close() }
      ]);
    }},
  ];

  shortcutDefs.forEach(({ key, handler }) => KeyboardShortcuts.register(key, handler));
}

function openSettings(storage, toast) {
  const modal = new ModalManager();
  const currentKey = state.apiKey;
  const currentTheme = state.theme;
  const currentModel = state.model;

  const content = `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div>
        <label>OpenRouter API Key</label>
        <input type="password" id="settings-apikey" class="input" value="${currentKey}" placeholder="sk-or-v1-..." style="width:100%;margin-top:4px;">
      </div>
      <div>
        <label>Theme</label>
        <select id="settings-theme" class="select" style="width:100%;margin-top:4px;">
          ${['dark','light','high-contrast','solarized','dracula','nord'].map(t => 
            `<option value="${t}" ${t === currentTheme ? 'selected' : ''}>${t.charAt(0).toUpperCase() + t.slice(1)}</option>`
          ).join('')}
        </select>
      </div>
      <div>
        <label>Model</label>
        <select id="settings-model" class="select" style="width:100%;margin-top:4px;">
          <option value="qwen/qwen3-coder:free" ${currentModel === 'qwen/qwen3-coder:free' ? 'selected' : ''}>Qwen 3 Coder (Free)</option>
          <option value="meta-llama/llama-3.3-70b-instruct:free" ${currentModel === 'meta-llama/llama-3.3-70b-instruct:free' ? 'selected' : ''}>Llama 3.3 70B (Free)</option>
          <option value="deepseek/deepseek-r1:free" ${currentModel === 'deepseek/deepseek-r1:free' ? 'selected' : ''}>DeepSeek R1 (Free)</option>
          <option value="openrouter/free" ${currentModel === 'openrouter/free' ? 'selected' : ''}>OpenRouter Free</option>
        </select>
      </div>
      <div>
        <label>Default Depth</label>
        <div class="radio-group" style="margin-top:4px;">
          ${['what','how','why','teach'].map(d => 
            `<label class="depth-option" data-depth="${d}">
              <input type="radio" name="depth" value="${d}" ${d === state.depth ? 'checked' : ''}>
              <span>${d.charAt(0).toUpperCase() + d.slice(1)}</span>
            </label>`
          ).join('')}
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <label class="toggle"><input type="checkbox" id="settings-analogy" ${storage.getSetting('enableAnalogy', true) ? 'checked' : ''}> <span>Analogies</span></label>
        <label class="toggle"><input type="checkbox" id="settings-smells" ${storage.getSetting('enableSmells', true) ? 'checked' : ''}> <span>Smells</span></label>
        <label class="toggle"><input type="checkbox" id="settings-heatmap" ${storage.getSetting('enableHeatmap', true) ? 'checked' : ''}> <span>Heatmap</span></label>
        <label class="toggle"><input type="checkbox" id="settings-simplify" ${storage.getSetting('simplifyMode', false) ? 'checked' : ''}> <span>Simplify</span></label>
      </div>
      <div style="display:flex;gap:8px;">
        <label class="toggle"><input type="checkbox" id="settings-dyslexia" ${storage.getSetting('dyslexiaMode', false) ? 'checked' : ''}> <span>Dyslexia-Friendly</span></label>
        <label class="toggle"><input type="checkbox" id="settings-reduced-motion" ${storage.getSetting('reducedMotion', false) ? 'checked' : ''}> <span>Reduced Motion</span></label>
      </div>
    </div>
  `;

  modal.show('Settings', content, [
    { label: 'Save', variant: 'primary', action: () => {
      const key = document.getElementById('settings-apikey').value.trim();
      const theme = document.getElementById('settings-theme').value;
      const model = document.getElementById('settings-model').value;
      const depth = document.querySelector('input[name="depth"]:checked')?.value || 'how';
      const analogy = document.getElementById('settings-analogy').checked;
      const smells = document.getElementById('settings-smells').checked;
      const heatmap = document.getElementById('settings-heatmap').checked;
      const simplify = document.getElementById('settings-simplify').checked;
      const dyslexia = document.getElementById('settings-dyslexia').checked;
      const reducedMotion = document.getElementById('settings-reduced-motion').checked;

      if (key) {
        state.apiKey = key;
        storage.setApiKey(key);
        setApiKey(key);
      }

      state.theme = theme;
      state.model = model;
      state.depth = depth;
      document.documentElement.setAttribute('data-theme', theme);

      storage.updateSettings({ theme, model, depth, enableAnalogy: analogy, enableSmells: smells, enableHeatmap: heatmap, simplifyMode: simplify, dyslexiaMode: dyslexia, reducedMotion: reducedMotion });

      modal.close();
      toast.show('Settings saved', 'success');
    }},
    { label: 'Cancel', variant: 'ghost', action: () => modal.close() }
  ]);
}

function updateHistoryBadge(storage) {
  const history = storage.getHistory();
  const count = history ? history.length : 0;
  const badge = document.querySelector('.tab[data-tab="history"] .tab-badge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline' : 'none';
  }
  state.historyCount = count;
}

function exportExplanation(storage, toast) {
  if (!state.currentExplanation && !state.code) {
    toast.show('No explanation to export. Explain some code first.', 'warning');
    return;
  }

  const data = state.currentExplanation || {};
  const code = state.code || '';
  const lines = [];

  lines.push('# CodeLens AI - Explanation Report');
  lines.push('');
  lines.push(`**Generated:** ${new Date().toLocaleString()}`);
  lines.push(`**Language:** ${state.language}`);
  lines.push(`**Depth:** ${state.depth}`);
  lines.push(`**Model:** ${state.model}`);
  lines.push('');

  if (code) {
    lines.push('## Code');
    lines.push('```' + (state.language || '') + '');
    lines.push(code);
    lines.push('```');
    lines.push('');
  }

  if (data.explanation) {
    lines.push('## Explanation');
    lines.push('');
    const cleanExplanation = data.explanation.replace(/<[^>]*>/g, '');
    lines.push(cleanExplanation);
    lines.push('');
  }

  if (data.complexity) {
    lines.push('## Complexity Analysis');
    lines.push('');
    lines.push(`- **Level:** ${data.complexity.label || data.complexity.level || 'N/A'}`);
    if (data.complexity.score !== undefined) lines.push(`- **Score:** ${data.complexity.score}/10`);
    if (data.complexity.details) lines.push(`- **Details:** ${data.complexity.details}`);
    lines.push('');
  }

  if (data.smells && data.smells.length > 0) {
    lines.push('## Code Smells');
    lines.push('');
    data.smells.forEach((smell, i) => {
      lines.push(`${i + 1}. **${smell.name || smell.type || 'Smell'}**${smell.severity ? ` (${smell.severity})` : ''}`);
      if (smell.description) lines.push(`   - ${smell.description}`);
      if (smell.line) lines.push(`   - Line: ${smell.line}`);
    });
    lines.push('');
  }

  if (data.analogies && data.analogies.length > 0) {
    lines.push('## Analogies');
    lines.push('');
    data.analogies.forEach((analogy, i) => {
      lines.push(`${i + 1}. ${analogy}`);
    });
    lines.push('');
  }

  if (data.concepts && data.concepts.length > 0) {
    lines.push('## Concepts');
    lines.push('');
    data.concepts.forEach(c => lines.push(`- ${c}`));
    lines.push('');
  }

  const markdown = lines.join('\n');
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `codelens-explanation-${Date.now()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast.show('Explanation exported as Markdown.', 'success');
}

function exportAllHistory(storage, toast) {
  const history = storage.getHistory();
  if (!history || history.length === 0) {
    toast.show('No history to export.', 'warning');
    return;
  }

  const lines = [];
  lines.push('# CodeLens AI - Complete History Export');
  lines.push('');
  lines.push(`**Exported:** ${new Date().toLocaleString()}`);
  lines.push(`**Total Entries:** ${history.length}`);
  lines.push('');

  history.forEach((item, i) => {
    lines.push(`---`);
    lines.push(`## Entry ${i + 1}: ${item.language || 'unknown'} (${item.depth || 'how'})`);
    lines.push(`**Date:** ${item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Unknown'}`);
    lines.push(`**Duration:** ${item.duration ? (item.duration / 1000).toFixed(1) + 's' : 'N/A'}`);
    lines.push('');

    if (item.code) {
      lines.push('### Code');
      lines.push('```' + (item.language || '') + '');
      lines.push(item.code);
      lines.push('```');
      lines.push('');
    }

    if (item.explanation) {
      lines.push('### Explanation');
      lines.push('');
      lines.push(item.explanation.replace(/<[^>]*>/g, ''));
      lines.push('');
    }

    if (item.concepts && item.concepts.length > 0) {
      lines.push('### Concepts');
      item.concepts.forEach(c => lines.push(`- ${c}`));
      lines.push('');
    }

    if (item.smells && item.smells.length > 0) {
      lines.push('### Code Smells');
      item.smells.forEach(s => lines.push(`- ${s.name || s.type || 'Smell'}${s.severity ? ` (${s.severity})` : ''}`));
      lines.push('');
    }
  });

  const markdown = lines.join('\n');
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `codelens-history-${Date.now()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast.show('Full history exported as Markdown.', 'success');
}

function clearHistory(storage, toast) {
  const history = storage.getHistory();
  if (!history || history.length === 0) {
    toast.show('No history to clear.', 'warning');
    return;
  }

  const modal = new ModalManager();
  modal.show('Clear All History', `
    <p>Are you sure you want to clear all ${history.length} history entries? This action cannot be undone.</p>
    <p style="color:var(--error-color);font-size:0.9rem;margin-top:8px;">Your streak and stats will not be affected.</p>
  `, [
    { label: 'Clear All', variant: 'danger', action: () => {
      storage.clearHistory();
      updateHistoryBadge(storage);
      modal.close();
      toast.show('History cleared.', 'success');
      if (state.activeTab === 'history') renderHistoryTab();
    }},
    { label: 'Cancel', variant: 'ghost', action: () => modal.close() }
  ]);
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
