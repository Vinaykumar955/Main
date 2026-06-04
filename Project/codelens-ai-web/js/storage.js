// js/storage.js - LocalStorage Persistence Layer

const DEFAULTS = {
  theme: 'dark',
  language: 'javascript',
  model: 'qwen/qwen3-coder:free',
  depth: 'how',
  fontSize: 14,
  tabSize: 2,
  enableAnalogy: true,
  enableSmells: true,
  enableHeatmap: true,
  simplifyMode: false,
  dyslexiaMode: false,
  highContrast: false,
  reducedMotion: false,
  dailyGoal: 5,
  cacheEnabled: true,
};

function generateId(prefix) {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${ts}_${rand}`;
}

function isToday(ts) {
  const d = new Date(ts);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate();
}

function isThisWeek(ts) {
  const now = new Date();
  const day = new Date(ts);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return day >= startOfWeek;
}

function isThisMonth(ts) {
  const d = new Date(ts);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
}

export class Storage {
  constructor(prefix = 'codelens') {
    this._prefix = prefix;
  }

  _key(name) {
    return `${this._prefix}:${name}`;
  }

  isAvailable() {
    try {
      const key = this._key('_test_');
      localStorage.setItem(key, '1');
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(this._key(key));
      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(this._key(key), JSON.stringify(value));
    } catch {
      // localStorage full or unavailable
    }
  }

  remove(key) {
    try {
      localStorage.removeItem(this._key(key));
    } catch {
      // ignore
    }
  }

  clear() {
    try {
      const prefix = this._prefix + ':';
      const toRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) {
          toRemove.push(k);
        }
      }
      toRemove.forEach(k => localStorage.removeItem(k));
    } catch {
      // ignore
    }
  }

  getApiKey() {
    return this.get('apikey', '');
  }

  setApiKey(key) {
    this.set('apikey', key);
  }

  hasApiKey() {
    const k = this.getApiKey();
    return typeof k === 'string' && k.trim().length > 0;
  }

  getSettings() {
    const saved = this.get('settings');
    if (saved && typeof saved === 'object') {
      return { ...DEFAULTS, ...saved };
    }
    return { ...DEFAULTS };
  }

  updateSettings(partial) {
    const current = this.getSettings();
    const merged = { ...current, ...partial };
    this.set('settings', merged);
    return merged;
  }

  getSetting(key, defaultValue) {
    const settings = this.getSettings();
    return key in settings ? settings[key] : defaultValue;
  }

  setSetting(key, value) {
    const settings = this.getSettings();
    settings[key] = value;
    this.set('settings', settings);
  }

  getHistory() {
    const h = this.get('history', []);
    return Array.isArray(h) ? h : [];
  }

  addToHistory(entry) {
    let history = this.getHistory();
    const enriched = {
      id: generateId('h'),
      timestamp: Date.now(),
      ...entry,
    };
    history.unshift(enriched);
    if (history.length > 200) {
      history = history.slice(0, 200);
    }
    this.set('history', history);
    return enriched;
  }

  clearHistory() {
    this.remove('history');
  }

  searchHistory(query) {
    if (!query || typeof query !== 'string') return [];
    const q = query.toLowerCase();
    return this.getHistory().filter(e => {
      const code = (e.code || '').toLowerCase();
      const explanation = (e.explanation || '').toLowerCase();
      return code.includes(q) || explanation.includes(q);
    });
  }

  getHistoryStats() {
    const history = this.getHistory();
    const total = history.length;
    let today = 0, thisWeek = 0, thisMonth = 0;
    for (const e of history) {
      const ts = e.timestamp || 0;
      if (isToday(ts)) today++;
      if (isThisWeek(ts)) thisWeek++;
      if (isThisMonth(ts)) thisMonth++;
    }
    return { total, today, thisWeek, thisMonth };
  }

  getBookmarks() {
    const b = this.get('bookmarks', []);
    return Array.isArray(b) ? b : [];
  }

  addBookmark(bookmark) {
    const bookmarks = this.getBookmarks();
    const entry = {
      id: generateId('bm'),
      timestamp: Date.now(),
      ...bookmark,
    };
    bookmarks.push(entry);
    this.set('bookmarks', bookmarks);
    return entry;
  }

  removeBookmark(id) {
    const bookmarks = this.getBookmarks().filter(b => b.id !== id);
    this.set('bookmarks', bookmarks);
  }

  getBookmark(id) {
    return this.getBookmarks().find(b => b.id === id) || null;
  }

  getLearnerStats() {
    return this.get('learner-stats', {
      totalQueries: 0,
      totalExplanations: 0,
      totalAnalogies: 0,
      streakDays: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
    });
  }

  saveLearnerStats(stats) {
    this.set('learner-stats', stats);
  }

  getSpacedRepetitionItems() {
    const items = this.get('spaced-rep', []);
    return Array.isArray(items) ? items : [];
  }

  saveSpacedRepetitionItems(items) {
    this.set('spaced-rep', items);
  }

  getQuizHistory() {
    const h = this.get('quiz-history', []);
    return Array.isArray(h) ? h : [];
  }

  saveQuizHistory(history) {
    this.set('quiz-history', history);
  }

  getStreakData() {
    return this.get('streak', []);
  }

  recordActivity() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    let streak = this.getStreakData();
    if (!Array.isArray(streak)) streak = [];
    const existing = streak.find(s => s.date === dateStr);
    if (existing) {
      existing.count = (existing.count || 0) + 1;
    } else {
      streak.push({ date: dateStr, count: 1 });
    }
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 365);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    streak = streak.filter(s => s.date >= cutoffStr);
    this.set('streak', streak);
  }

  exportAll() {
    const data = {};
    const prefix = this._prefix + ':';
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) {
          const name = k.slice(prefix.length);
          try {
            data[name] = JSON.parse(localStorage.getItem(k));
          } catch {
            data[name] = localStorage.getItem(k);
          }
        }
      }
    } catch {
      // ignore
    }
    return JSON.stringify(data, null, 2);
  }

  importAll(json) {
    try {
      const data = typeof json === 'string' ? JSON.parse(json) : json;
      if (!data || typeof data !== 'object') return false;
      for (const [key, value] of Object.entries(data)) {
        this.set(key, value);
      }
      return true;
    } catch {
      return false;
    }
  }

  hasData() {
    const history = this.getHistory();
    const bookmarks = this.getBookmarks();
    return history.length > 0 || bookmarks.length > 0;
  }

  getStorageUsage() {
    let used = 0;
    const prefix = this._prefix + ':';
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) {
          const v = localStorage.getItem(k);
          if (v) used += k.length + v.length;
        }
      }
    } catch {
      // ignore
    }
    const total = 5 * 1024 * 1024;
    return {
      used,
      total,
      percent: total > 0 ? Math.min(100, +(used / total * 100).toFixed(1)) : 0,
    };
  }

  clearAll() {
    this.clear();
  }
}
