// js/learner.js - Learning Engine (Spaced Repetition, Quiz, Stats)

const MIN_EASE = 1.3;
const INTERVAL_FIRST = 1;
const INTERVAL_SECOND = 6;

const STORAGE_KEYS = {
  stats: 'codelens-stats',
  streak: 'codelens-streak',
  reviews: 'codelens-reviews',
  quizHistory: 'codelens-quiz-history',
};

const DEFAULT_STATS = () => ({
  totalExplanations: 0,
  totalQuizzes: 0,
  quizScore: 0,
  streakDays: 0,
  lastActive: Date.now(),
  topicsMastered: [],
  topicsInProgress: [],
  totalReviews: 0,
  averageDifficulty: 0,
});

/**
 * SM-2 Spaced Repetition Algorithm
 */
export class SpacedRepetition {
  constructor() {}

  calculateNextReview(item, quality) {
    const clampedQuality = Math.max(0, Math.min(5, Math.round(quality)));
    const ease = this.calculateEase(item.ease, clampedQuality);
    let repetitions;
    let interval;

    if (clampedQuality < 3) {
      repetitions = 0;
      interval = INTERVAL_FIRST;
    } else {
      repetitions = item.repetitions + 1;
      if (repetitions === 1) {
        interval = INTERVAL_FIRST;
      } else if (repetitions === 2) {
        interval = INTERVAL_SECOND;
      } else {
        interval = Math.round(item.interval * ease);
      }
    }

    const nextReview = Date.now() + interval * 24 * 60 * 60 * 1000;

    return {
      ...item,
      ease,
      interval,
      repetitions,
      nextReview,
      lastReview: Date.now(),
    };
  }

  getDueItems(items) {
    const now = Date.now();
    return items.filter(item => item.nextReview <= now);
  }

  getItemPriority(item) {
    const now = Date.now();
    if (item.nextReview <= now) {
      const overdue = now - item.nextReview;
      return overdue * (1 / Math.max(item.ease, MIN_EASE));
    }
    return -(item.nextReview - now);
  }

  assessRecall(quality) {
    const clamped = Math.max(0, Math.min(5, Math.round(quality)));
    if (clamped >= 5) return 'perfect';
    if (clamped >= 3) return 'hard';
    if (clamped >= 1) return 'forgot';
    return 'review';
  }

  calculateEase(currentEase, quality) {
    const ef = currentEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    return Math.max(MIN_EASE, ef);
  }
}

/**
 * Quiz Engine
 */
export class QuizEngine {
  constructor() {}

  async evaluateAnswer(question, userAnswer, aiEvaluate) {
    const normalize = (s) => s.replace(/\s+/g, ' ').trim().toLowerCase();

    if (!userAnswer || typeof userAnswer !== 'string') {
      return { isCorrect: false, explanation: 'No answer provided.' };
    }

    const exactMatch = normalize(question.correctAnswer) === normalize(userAnswer);

    if (exactMatch) {
      return { isCorrect: true, explanation: 'Correct!' };
    }

    if (aiEvaluate && typeof aiEvaluate === 'function') {
      try {
        return await aiEvaluate(question, userAnswer);
      } catch {
        return { isCorrect: false, explanation: expected(question.correctAnswer) };
      }
    }

    const keywords = question.correctAnswer
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3);

    const matched = keywords.filter(kw =>
      userAnswer.toLowerCase().includes(kw)
    ).length;

    const threshold = Math.max(1, Math.ceil(keywords.length * 0.5));
    const isCorrect = matched >= threshold;

    return { isCorrect, explanation: expected(question.correctAnswer) };
  }

  calculateScore(quizHistory) {
    if (!quizHistory || quizHistory.length === 0) {
      return { total: 0, correct: 0, score: 0, streak: 0 };
    }

    const total = quizHistory.length;
    const correct = quizHistory.filter(q => q.isCorrect).length;
    const score = Math.round((correct / total) * 100);

    let streak = 0;
    for (let i = quizHistory.length - 1; i >= 0; i--) {
      if (quizHistory[i].isCorrect) {
        streak++;
      } else {
        break;
      }
    }

    return { total, correct, score, streak };
  }
}

/**
 * Stats Tracker
 */
export class StatsTracker {
  constructor(storage) {
    this.storage = storage;
    this._statsKey = 'learner-stats';
    this._quizKey = 'quiz-history';
    this._reviewsKey = 'reviews';
    this._streakKey = 'streak';
  }

  _get(key, fallback) {
    try {
      if (typeof this.storage.getItem === 'function') {
        const raw = this.storage.getItem(key);
        return raw ? JSON.parse(raw) : (typeof fallback === 'function' ? fallback() : fallback);
      }
      return this.storage.get(key, typeof fallback === 'function' ? fallback() : fallback);
    } catch {
      return typeof fallback === 'function' ? fallback() : fallback;
    }
  }

  _set(key, data) {
    try {
      if (typeof this.storage.setItem === 'function') {
        this.storage.setItem(key, JSON.stringify(data));
      } else {
        this.storage.set(key, data);
      }
    } catch {}
  }

  recordExplanation(concepts) {
    const stats = this._get(this._statsKey, DEFAULT_STATS);
    stats.totalExplanations = (stats.totalExplanations || 0) + 1;
    stats.lastActive = Date.now();
    if (concepts && Array.isArray(concepts)) {
      concepts.forEach(c => {
        if (!stats.topicsInProgress.includes(c)) stats.topicsInProgress.push(c);
      });
    }
    this._set(this._statsKey, stats);
    this.updateStreak();
  }

  recordQuizResult(isCorrect) {
    const stats = this._get(this._statsKey, DEFAULT_STATS);
    const quizHistory = this._get(this._quizKey, []);
    stats.totalQuizzes = (stats.totalQuizzes || 0) + 1;
    stats.lastActive = Date.now();
    quizHistory.push({ isCorrect, timestamp: Date.now() });
    const correctCount = quizHistory.filter(q => q.isCorrect).length;
    stats.quizScore = Math.round((correctCount / quizHistory.length) * 100);
    this._set(this._statsKey, stats);
    this._set(this._quizKey, quizHistory);
    this.updateStreak();
  }

  recordQuiz(score, total) {
    const stats = this._get(this._statsKey, DEFAULT_STATS);
    stats.totalQuizzes = (stats.totalQuizzes || 0) + 1;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    stats.quizScore = Math.round(((stats.quizScore || 0) + pct) / 2);
    stats.lastActive = Date.now();
    const quizHistory = this._get(this._quizKey, []);
    quizHistory.push({ score, total, timestamp: Date.now() });
    this._set(this._quizKey, quizHistory);
    this._set(this._statsKey, stats);
    this.updateStreak();
  }

  recordReview(concept, quality) {
    const stats = this._get(this._statsKey, DEFAULT_STATS);
    const reviews = this._get(this._reviewsKey, []);
    stats.totalReviews = (stats.totalReviews || 0) + 1;
    stats.lastActive = Date.now();
    reviews.push({ concept, quality, timestamp: Date.now() });
    const recent = reviews.slice(-20).map(r => r.quality);
    stats.averageDifficulty = Math.round(recent.reduce((a, b) => a + b, 0) / recent.length);
    if (quality >= 4 && stats.topicsInProgress.includes(concept)) {
      const count = reviews.filter(r => r.concept === concept).length;
      if (count >= 3) {
        stats.topicsInProgress = stats.topicsInProgress.filter(t => t !== concept);
        if (!stats.topicsMastered.includes(concept)) stats.topicsMastered.push(concept);
      }
    }
    this._set(this._statsKey, stats);
    this._set(this._reviewsKey, reviews);
    this.updateStreak();
  }

  getStats() {
    return this._get(this._statsKey, DEFAULT_STATS);
  }

  getSummary() {
    const s = this.getStats();
    return {
      totalExplanations: s.totalExplanations || 0,
      totalQuizzes: s.totalQuizzes || 0,
      streakDays: s.streakDays || 0,
      totalConcepts: (s.topicsMastered?.length || 0) + (s.topicsInProgress?.length || 0),
      quizScore: s.quizScore || 0,
      totalReviews: s.totalReviews || 0,
    };
  }

  getSkillLevels() {
    const s = this.getStats();
    const mastered = s.topicsMastered?.length || 0;
    const inProgress = s.topicsInProgress?.length || 0;
    const total = mastered + inProgress;
    return [
      { label: 'Code Reading', value: Math.min(10, Math.round((total || 0) * 1.5)), max: 10 },
      { label: 'Concepts', value: Math.min(10, total), max: 10 },
      { label: 'Quiz Score', value: Math.min(10, Math.round((s.quizScore || 0) / 10)), max: 10 },
      { label: 'Consistency', value: Math.min(10, s.streakDays || 0), max: 10 },
      { label: 'Reviews', value: Math.min(10, Math.round((s.totalReviews || 0) / 3)), max: 10 },
      { label: 'Mastery', value: Math.min(10, mastered), max: 10 },
    ];
  }

  getStreak() {
    const s = this.getStats();
    return s.streakDays || 0;
  }

  getBadges() {
    const s = this.getStats();
    const badges = [];
    if ((s.totalExplanations || 0) >= 1) badges.push({ id: 'first', name: 'First Explanation', icon: '🌟', unlocked: true });
    if ((s.totalExplanations || 0) >= 10) badges.push({ id: 'explorer', name: 'Explorer', icon: '🔍', unlocked: true });
    if ((s.totalExplanations || 0) >= 50) badges.push({ id: 'scholar', name: 'Scholar', icon: '📚', unlocked: true });
    if ((s.streakDays || 0) >= 3) badges.push({ id: 'streak3', name: '3-Day Streak', icon: '🔥', unlocked: true });
    if ((s.streakDays || 0) >= 7) badges.push({ id: 'streak7', name: 'Week Warrior', icon: '💪', unlocked: true });
    if ((s.streakDays || 0) >= 30) badges.push({ id: 'streak30', name: 'Monthly Master', icon: '👑', unlocked: true });
    if ((s.totalQuizzes || 0) >= 1) badges.push({ id: 'quiz1', name: 'First Quiz', icon: '🧪', unlocked: true });
    if ((s.quizScore || 0) >= 80) badges.push({ id: 'quizmaster', name: 'Quiz Master', icon: '🎯', unlocked: true });
    if ((s.topicsMastered?.length || 0) >= 3) badges.push({ id: 'guru', name: 'Code Guru', icon: '🧠', unlocked: true });
    if ((s.totalReviews || 0) >= 10) badges.push({ id: 'reviewer', name: 'Dedicated Reviewer', icon: '⭐', unlocked: true });
    // Locked badges
    const locked = [
      { id: 'century', name: 'Century', icon: '💯', unlocked: false },
      { id: 'polymath', name: 'Polymath', icon: '🎓', unlocked: false },
    ];
    return [...badges, ...locked];
  }

  updateStreak() {
    const stats = this._get(this._statsKey, DEFAULT_STATS);
    const now = new Date();
    const today = now.toDateString();
    const lastActive = new Date(stats.lastActive || 0);
    const lastDate = lastActive.toDateString();
    if (lastDate === today) return;
    const diffDays = Math.floor((now - lastActive) / (24 * 60 * 60 * 1000));
    if (diffDays === 1) stats.streakDays = (stats.streakDays || 0) + 1;
    else if (diffDays > 1) stats.streakDays = 1;
    stats.lastActive = now.getTime();
    this._set(this._statsKey, stats);
  }

  getStreakData() {
    const s = this.getStats();
    const now = new Date();
    const result = [];
    for (let i = 364; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      result.push({ date: dateStr, count: s.lastActive && new Date(s.lastActive).toISOString().split('T')[0] === dateStr ? 1 : 0 });
    }
    return result;
  }
}

function expected(correctAnswer) {
  return `Expected: "${correctAnswer}"`;
}
