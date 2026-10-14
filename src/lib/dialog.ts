import { Alert, Platform } from 'react-native';
import type { AlertButton } from 'react-native';

/**
 * Cross-platform dialog. Native: Alert.alert. Web (where Alert.alert is a no-op):
 * no buttons -> window.alert; two buttons -> window.confirm; 3+ -> small in-app modal.
 */
export function showDialog(title: string, message?: string, buttons?: AlertButton[]): void {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }
  const text = message ? `${title}\n\n${message}` : title;
  const list = buttons ?? [];
  const cancel = list.find((b) => b.style === 'cancel');
  const actions = list.filter((b) => b !== cancel);

  if (list.length === 0 || (list.length === 1 && !list[0].onPress)) {
    if (typeof window !== 'undefined') window.alert(text);
    list[0]?.onPress?.();
    return;
  }
  if (list.length <= 2 && actions.length === 1) {
    const ok = typeof window !== 'undefined' ? window.confirm(text) : false;
    if (ok) actions[0].onPress?.();
    else cancel?.onPress?.();
    return;
  }
  if (typeof document === 'undefined') return;
  showWebSheet(title, message, list);
}

function showWebSheet(title: string, message: string | undefined, buttons: AlertButton[]) {
  const previouslyFocused = document.activeElement as HTMLElement | null;
  const overlay = document.createElement('div');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', title);
  overlay.style.cssText =
    'position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:16px;';
  const box = document.createElement('div');
  box.style.cssText =
    'background:#fff;color:#111;border-radius:14px;padding:20px;max-width:360px;width:100%;font-family:system-ui,sans-serif;';
  const h = document.createElement('div');
  h.textContent = title;
  h.style.cssText = 'font-size:18px;font-weight:700;margin-bottom:6px;';
  box.appendChild(h);
  if (message) {
    const m = document.createElement('div');
    m.textContent = message;
    m.style.cssText = 'font-size:14px;margin-bottom:12px;';
    box.appendChild(m);
  }
  const cancelButton = buttons.find((b) => b.style === 'cancel');
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      close();
      cancelButton?.onPress?.();
    }
  };
  function close() {
    document.removeEventListener('keydown', onKeyDown);
    overlay.remove();
    previouslyFocused?.focus?.();
  }
  buttons.forEach((b) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = b.text ?? '';
    btn.style.cssText = `display:block;width:100%;padding:12px;margin-top:8px;border-radius:10px;border:1px solid #ddd;background:#f6f6f6;font-size:16px;cursor:pointer;color:${
      b.style === 'destructive' ? '#c00' : '#111'
    };font-weight:${b.style === 'cancel' ? '400' : '600'};`;
    btn.onclick = () => {
      close();
      b.onPress?.();
    };
    box.appendChild(btn);
  });
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      close();
      cancelButton?.onPress?.();
    }
  };
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  document.addEventListener('keydown', onKeyDown);
  // Move focus into the dialog so keyboard and screen-reader users land on it.
  (box.querySelector('button') as HTMLButtonElement | null)?.focus();
}
