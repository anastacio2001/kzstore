// PWA Service Worker Registration and Push Notifications
// KZSTORE - Progressive Web App Utilities

export class PWAManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  }

  /**
   * Register service worker
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported) {
      console.log('[PWA] Service Worker not supported');
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('[PWA] Service Worker registered:', this.registration);

      // Check for updates periodically
      setInterval(() => {
        this.registration?.update();
      }, 60 * 60 * 1000); // Every hour

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              this.showUpdateNotification();
            }
          });
        }
      });

      return this.registration;
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
      return null;
    }
  }

  /**
   * Request permission for push notifications
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('[PWA] Notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('[PWA] Notification permission:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('[PWA] Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(vapidPublicKey?: string): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.error('[PWA] Service Worker not registered');
      return null;
    }

    try {
      const permission = await this.requestNotificationPermission();
      if (!permission) {
        return null;
      }

      const options: PushSubscriptionOptionsInit = {
        userVisibleOnly: true,
        ...(vapidPublicKey && { 
          applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) 
        })
      };

      const subscription = await this.registration.pushManager.subscribe(options);
      console.log('[PWA] Push subscription:', JSON.stringify(subscription));
      
      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);

      return subscription;
    } catch (error) {
      console.error('[PWA] Error subscribing to push:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await this.removeSubscriptionFromServer(subscription);
        console.log('[PWA] Unsubscribed from push notifications');
        return true;
      }
      return false;
    } catch (error) {
      console.error('[PWA] Error unsubscribing from push:', error);
      return false;
    }
  }

  /**
   * Check if user is subscribed to push notifications
   */
  async isSubscribedToPush(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      return subscription !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Show a local notification
   */
  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.registration || Notification.permission !== 'granted') {
      console.log('[PWA] Cannot show notification - permission not granted');
      return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      vibrate: [200, 100, 200],
      tag: 'kzstore-notification',
      ...options
    };

    await this.registration.showNotification(title, defaultOptions);
  }

  /**
   * Check if app can be installed
   */
  canInstall(): boolean {
    return this.isSupported && !this.isInstalled();
  }

  /**
   * Check if app is already installed
   */
  isInstalled(): boolean {
    // Check if running as PWA
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  /**
   * Prompt user to install PWA
   */
  async promptInstall(deferredPrompt: any): Promise<boolean> {
    if (!deferredPrompt) {
      console.log('[PWA] Install prompt not available');
      return false;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA] Install prompt outcome:', outcome);
      return outcome === 'accepted';
    } catch (error) {
      console.error('[PWA] Error prompting install:', error);
      return false;
    }
  }

  /**
   * Cache specific URLs
   */
  async cacheUrls(urls: string[]): Promise<void> {
    if (!this.registration || !this.registration.active) {
      return;
    }

    this.registration.active.postMessage({
      type: 'CACHE_URLS',
      urls
    });
  }

  /**
   * Clear all caches
   */
  async clearCache(): Promise<void> {
    if (!this.registration || !this.registration.active) {
      return;
    }

    this.registration.active.postMessage({
      type: 'CLEAR_CACHE'
    });
  }

  /**
   * Show update notification to user
   */
  private showUpdateNotification(): void {
    // This should be handled by the app with a toast or modal
    console.log('[PWA] New version available');
    
    // You can dispatch a custom event that the app can listen to
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }

  /**
   * Send subscription to server
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      // TODO: Implement server endpoint to save subscription
      console.log('[PWA] Sending subscription to server:', subscription);
      
      // Example:
      // await fetch('/api/push/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(subscription)
      // });
    } catch (error) {
      console.error('[PWA] Error sending subscription to server:', error);
    }
  }

  /**
   * Remove subscription from server
   */
  private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
    try {
      console.log('[PWA] Removing subscription from server:', subscription);
      
      // Example:
      // await fetch('/api/push/unsubscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(subscription)
      // });
    } catch (error) {
      console.error('[PWA] Error removing subscription from server:', error);
    }
  }

  /**
   * Convert VAPID key from base64 to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Export singleton instance
export const pwaManager = new PWAManager();

// Initialize PWA features when DOM is ready
if (typeof window !== 'undefined') {
  window.addEventListener('load', async () => {
    await pwaManager.registerServiceWorker();
    
    // Log PWA status
    console.log('[PWA] Is Installed:', pwaManager.isInstalled());
    console.log('[PWA] Can Install:', pwaManager.canInstall());
  });

  // Handle install prompt
  let deferredPrompt: any;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('[PWA] Install prompt available');
    
    // Dispatch event so app can show install button
    window.dispatchEvent(new CustomEvent('pwa-installable', { detail: deferredPrompt }));
  });

  // App installed
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed successfully');
    deferredPrompt = null;
    
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });
}
