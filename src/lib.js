import { useEffect, useRef, useState } from 'react';

const HISTORY_KEY = 'codebncc:history:local';
const THEME_KEY = 'codebncc:theme';

function loadLocal() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocal(items) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 50)));
  } catch {
    // armazenamento indisponível
  }
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
  const [history, setHistory] = useState([]);
  const modeRef = useRef('server');

  useEffect(() => {
    let active = true;
    fetch('/api/history')
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('http ' + r.status))))
      .then(data => {
        if (active) setHistory(Array.isArray(data.items) ? data.items : []);
      })
      .catch(() => {
        if (active) {
          modeRef.current = 'local';
          setHistory(loadLocal());
        }
      });
    return () => {
      active = false;
    };
  }, []);

  function addLocal(entry) {
    const local = { ...entry, id: `${Date.now()}` };
    setHistory(prev => {
      const next = [local, ...prev];
      saveLocal(next);
      return next;
    });
  }

  function addEntry(entry) {
    if (modeRef.current === 'server') {
      fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      })
        .then(r => (r.ok ? r.json() : Promise.reject(new Error('http ' + r.status))))
        .then(saved => setHistory(prev => [saved, ...prev]))
        .catch(() => {
          modeRef.current = 'local';
          addLocal(entry);
        });
      return;
    }
    addLocal(entry);
  }

  function removeEntry(id) {
    setHistory(prev => {
      const next = prev.filter(item => item.id !== id);
      if (modeRef.current === 'local') saveLocal(next);
      return next;
    });
    if (modeRef.current === 'server') {
      fetch(`/api/history?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
    }
  }

  function clearHistory() {
    setHistory([]);
    if (modeRef.current === 'local') {
      saveLocal([]);
      return;
    }
    fetch('/api/history', { method: 'DELETE' }).catch(() => {});
  }

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
