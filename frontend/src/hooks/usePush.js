import { useState, useEffect } from 'react';
import { api } from '../api';

// Convert base64url VAPID public key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function usePush() {
  // 'unsupported' | 'denied' | 'enabled' | 'disabled'
  const [pushState, setPushState] = useState('disabled');

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPushState('unsupported');
      return;
    }
    if (Notification.permission === 'denied') {
      setPushState('denied');
      return;
    }
    // Check if already subscribed
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setPushState(sub ? 'enabled' : 'disabled');
      });
    });
  }, []);

  const enable = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setPushState('denied');
        return false;
      }
      const { key } = await api.getVapidKey();
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      });
      await api.subscribePush(sub.toJSON());
      setPushState('enabled');
      return true;
    } catch (err) {
      console.error('Push subscribe failed', err);
      return false;
    }
  };

  const disable = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await api.unsubscribePush(sub.toJSON());
        await sub.unsubscribe();
      }
      setPushState('disabled');
    } catch (err) {
      console.error('Push unsubscribe failed', err);
    }
  };

  const toggle = () => {
    if (pushState === 'enabled') disable();
    else if (pushState !== 'unsupported' && pushState !== 'denied') enable();
  };

  return { pushState, toggle };
}
