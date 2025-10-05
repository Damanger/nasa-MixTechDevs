export function emitToast(message, type = 'success', ttl = 2400) {
  try {
    const event = new CustomEvent('app:toast', { detail: { message, type, ttl } });
    window.dispatchEvent(event);
  } catch {}
}

