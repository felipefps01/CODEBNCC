import { useEffect, useMemo, useState } from 'react';

const HISTORY_KEY = 'codebncc:history';
const THEME_KEY = 'codebncc:theme';

export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHistory(items) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 50)));
}

export function useTheme() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
  }, [dark]);

  return [dark, () => setDark(v => !v)];
}

export function useHistory() {
  const [history, setHistory] = useState(() => loadHistory());

  const addEntry = useMemo(() => {
    return entry => {
      setHistory(prev => {
        const next = [{ ...entry, id: `${Date.now()}` }, ...prev];
        saveHistory(next);
        return next;
      });
    };
  }, []);

  const removeEntry = useMemo(() => {
    return id => {
      setHistory(prev => {
        const next = prev.filter(item => item.id !== id);
        saveHistory(next);
        return next;
      });
    };
  }, []);

  const clearHistory = useMemo(() => {
    return () => {
      setHistory([]);
      saveHistory([]);
    };
  }, []);

  return { history, addEntry, removeEntry, clearHistory };
}

export function makeThumb(file) {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const size = 96;
      const canvas = document.createElement('canvas');
      const scale = Math.min(size / img.width, size / img.height, 1);
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve('');
    };
    img.src = url;
  });
}
