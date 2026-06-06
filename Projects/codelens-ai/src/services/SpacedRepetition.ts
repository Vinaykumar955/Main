import { SpacedRepetitionItem } from '../utils/types';

export type RecallQuality = 'perfect' | 'hard' | 'forgot' | 'review';

const MIN_EASE = 1.3;
const INTERVAL_FIRST = 1;
const INTERVAL_SECOND = 6;

export class SpacedRepetition {
  calculateNextReview(item: SpacedRepetitionItem, quality: number): SpacedRepetitionItem {
    const clampedQuality = Math.max(0, Math.min(5, Math.round(quality)));

    const ease = this.calculateEase(item.ease, clampedQuality);
    let repetitions: number;
    let interval: number;

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

  getDueItems(items: SpacedRepetitionItem[]): SpacedRepetitionItem[] {
    const now = Date.now();
    return items.filter(item => item.nextReview <= now);
  }

  getItemPriority(item: SpacedRepetitionItem): number {
    const now = Date.now();
    if (item.nextReview <= now) {
      const overdue = now - item.nextReview;
      return overdue * (1 / Math.max(item.ease, MIN_EASE));
    }
    return -item.nextReview - now;
  }

  assessRecall(quality: number): RecallQuality {
    const clamped = Math.max(0, Math.min(5, Math.round(quality)));
    if (clamped >= 5) return 'perfect';
    if (clamped >= 3) return 'hard';
    if (clamped >= 1) return 'forgot';
    return 'review';
  }

  getNextReviewDate(item: SpacedRepetitionItem): number {
    return item.nextReview;
  }

  private calculateEase(currentEase: number, quality: number): number {
    const ef = currentEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    return Math.max(MIN_EASE, ef);
  }
}
