// Badging API - Show notification count on app icon
// Supported on Chrome, Edge (Android/Windows/macOS)

export class AppBadge {
  private static instance: AppBadge;
  private count: number = 0;

  private constructor() {
    this.checkSupport();
  }

  static getInstance(): AppBadge {
    if (!AppBadge.instance) {
      AppBadge.instance = new AppBadge();
    }
    return AppBadge.instance;
  }

  private checkSupport(): boolean {
    return 'setAppBadge' in navigator && 'clearAppBadge' in navigator;
  }

  async set(count: number): Promise<void> {
    if (!this.checkSupport()) {
      console.log('[Badge] API not supported');
      return;
    }

    try {
      this.count = count;

      if (count > 0) {
        await (navigator as any).setAppBadge(count);
        console.log(`[Badge] Set to ${count}`);
      } else {
        await this.clear();
      }
    } catch (error) {
      console.error('[Badge] Error setting badge:', error);
    }
  }

  async increment(): Promise<void> {
    await this.set(this.count + 1);
  }

  async decrement(): Promise<void> {
    if (this.count > 0) {
      await this.set(this.count - 1);
    }
  }

  async clear(): Promise<void> {
    if (!this.checkSupport()) return;

    try {
      await (navigator as any).clearAppBadge();
      this.count = 0;
      console.log('[Badge] Cleared');
    } catch (error) {
      console.error('[Badge] Error clearing badge:', error);
    }
  }

  getCount(): number {
    return this.count;
  }
}

// Singleton export
export const appBadge = AppBadge.getInstance();

// Usage examples:
// appBadge.set(5); // Show "5" on app icon
// appBadge.increment(); // Add 1
// appBadge.decrement(); // Remove 1
// appBadge.clear(); // Remove badge
