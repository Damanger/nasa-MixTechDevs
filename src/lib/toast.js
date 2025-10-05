export function emitToast(message, type = 'info', ttl = 2400) {
  try {
    const detail = { message: String(message ?? ''), type, ttl };
    const event = new CustomEvent('app:toast', { detail });
    window.dispatchEvent(event);
  } catch (_) {
    
  }
}

export const toast = {
  success: (msg, ttl) => emitToast(msg, 'success', ttl),
  warning: (msg, ttl) => emitToast(msg, 'warning', ttl),
  error:   (msg, ttl) => emitToast(msg, 'error', ttl),
  info:    (msg, ttl) => emitToast(msg, 'info', ttl),
};
