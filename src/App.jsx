import { useEffect, useRef, useState } from 'react';
import { useTheme, useHistory, makeThumb } from './lib.js';
import Logo from './Logo.jsx';

function Icon({ name }) {
  const paths = {
    history: 'M13 3a9 9 0 0 0-9 9H1l3.9 3.9.1.1L9 12H6a7 7 0 1 1 2 4.9l-1.4 1.4A9 9 0 1 0 13 3zm-1 5v5l4.3 2.5.7-1.2-3.5-2V8h-1.5z',
    light: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5 2.4 2.4h-4.8L12 2zm0 20-2.4-2.4h4.8L12 22zM2 12l2.4-2.4v4.8L2 12zm20 0-2.4 2.4v-4.8L22 12zM4.9 4.9l3.4 1-2.4 2.4-1-3.4zm14.2 14.2-3.4-1 2.4-2.4 1 3.4zM4.9 19.1l1-3.4 2.4 2.4-3.4 1zM19.1 4.9l-1 3.4-2.4-2.4 3.4-1z',
    dark: 'M12 3a9 9 0 1 0 9 9c0-.5 0-1-.1-1.4a7 7 0 0 1-9.5-9.5C11 3 11.5 3 12 3z',
    upload: 'M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z',
    close: 'M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4z',
    delete: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
    auto: 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 14a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-2.5A2.5 2.5 0 1 0 12 9.5a2.5 2.5 0 0 0 0 5z'
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name] || ''} fill="currentColor" />
    </svg>
  );
}

const PREFIX_ROLES = {
  EO: { bg: '--md-banner-blue', fg: '--md-banner-on-blue' },
  CG: { bg: '--md-banner-red', fg: '--md-banner-on-red' },
  TS: { bg: '--md-banner-purple', fg: '--md-banner-on-purple' },
  EF: { bg: '--md-banner-teal', fg: '--md-banner-on-teal' },
  ET: { bg: '--md-banner-brown', fg: '--md-banner-on-brown' }
};

const DEFAULT_ROLE = { bg: '--md-banner-slate', fg: '--md-banner-on-slate' };

function roleFor(code) {
  return PREFIX_ROLES[code.slice(4, 6)] || DEFAULT_ROLE;
}

function CodeCard({ item }) {
  const role = roleFor(item.code);
  return (
    <li className="md3-card code-card">
      <span
        className="code-banner"
        style={{ background: `var(${role.bg})`, color: `var(${role.fg})` }}
      >
        {item.code}
      </span>
      <p className="code-card__desc">{item.description}</p>
      {item.justification && <p className="code-card__just">{item.justification}</p>}
    </li>
  );
}

function HistoryDialog({ open, history, onClose, onRemove, onClear }) {
  if (!open) return null;
  return (
    <div className="md3-scrim" onClick={onClose}>
      <div className="md3-dialog" role="dialog" aria-label="Histórico de códigos gerados" onClick={e => e.stopPropagation()}>
        <div className="md3-dialog__head">
          <h2>Histórico de códigos gerados</h2>
          <button className="md3-icon-btn" onClick={onClose} aria-label="Fechar histórico">
            <Icon name="close" />
          </button>
        </div>
        {history.length === 0 ? (
          <p className="md3-dialog__empty">Nenhuma análise realizada ainda.</p>
        ) : (
          <>
            <ul className="history-list">
              {history.map(entry => (
                <li key={entry.id} className="history-item">
                  <div className="history-item__main">
                    <div className="history-item__meta">
                      {entry.thumb ? <img src={entry.thumb} alt="" className="history-item__thumb" /> : null}
                      <div>
                        <span className="history-item__date">
                          {new Date(entry.date).toLocaleString('pt-BR')}
                        </span>
                        <div className="history-item__chips">
                          {entry.codes.map(c => {
                            const role = roleFor(c.code);
                            return (
                              <span
                                key={c.code}
                                className="md3-chip code-chip code-chip--sm"
                                style={{ background: `var(${role.bg})`, color: `var(${role.fg})` }}
                              >
                                {c.code}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <ul className="history-item__codes">
                      {entry.codes.map(c => (
                        <li key={c.code}>
                          <strong>{c.code}</strong> {c.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button className="md3-icon-btn" onClick={() => onRemove(entry.id)} aria-label="Remover registro">
                    <Icon name="delete" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="md3-dialog__actions">
              <button className="md3-btn md3-btn--text" onClick={onClear}>Limpar histórico</button>
              <button className="md3-btn md3-btn--filled" onClick={onClose}>Fechar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [dark, toggleTheme] = useTheme();
  const { history, addEntry, removeEntry, clearHistory } = useHistory();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  function pickImage(f) {
    if (!f || !f.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem da atividade.');
      return;
    }
    setError('');
    setResult(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    pickImage(e.dataTransfer.files[0]);
  }

  async function generate() {
    if (!file) {
      setError('Envie a imagem da atividade para gerar os códigos.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const imageBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const thumb = await makeThumb(file);
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType: file.type })
      });
      let data;
      try {
        data = await response.json();
      } catch {
        setError(`O servidor respondeu com HTTP ${response.status}, mas sem JSON válido.`);
        return;
      }
      if (!response.ok) {
        setError(data.error || `Não foi possível gerar os códigos (HTTP ${response.status}).`);
        return;
      }
      setResult(data);
      addEntry({ date: new Date().toISOString(), codes: data.codes, thumb });
    } catch (err) {
      setError('Não foi possível conectar ao servidor. Detalhe: ' + (err?.message || 'erro de rede'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="md3-topbar">
        <div className="md3-topbar__inner">
          <div className="md3-topbar__title">
            <Logo size={40} />
            <div>
              <h1>CODEBNCC</h1>
              <p>Códigos BNCC EI02 por IA</p>
            </div>
          </div>
          <div className="md3-topbar__actions">
            <button className="md3-icon-btn" onClick={() => setHistoryOpen(true)} aria-label="Histórico de códigos gerados" title="Histórico de códigos gerados">
              <Icon name="history" />
            </button>
            <button className="md3-icon-btn" onClick={toggleTheme} aria-label="Alternar claro/escuro" title="Alternar claro/escuro">
              <Icon name={dark ? 'light' : 'dark'} />
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="md3-card upload-card">
          <div
            className={`upload-zone${dragOver ? ' upload-zone--over' : ''}${file ? ' upload-zone--filled' : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
          >
            {preview ? (
              <img src={preview} alt="Pré-visualização da atividade" className="upload-zone__preview" />
            ) : (
              <>
                <Icon name="upload" />
                <p className="upload-zone__title">Envie a imagem da atividade</p>
                <p className="upload-zone__hint">Arraste um arquivo aqui ou clique para selecionar (PNG, JPG)</p>
              </>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={e => pickImage(e.target.files[0])}
          />
          {file && (
            <p className="upload-card__file" onClick={() => inputRef.current?.click()}>
              {file.name} <span>(clique para trocar)</span>
            </p>
          )}
          <button className="md3-btn md3-btn--filled md3-btn--lg" onClick={generate} disabled={loading}>
            {loading ? <span className="md3-spinner" aria-label="Analisando" /> : null}
            {loading ? 'Analisando com IA…' : 'Gerar códigos BNCC (EI02)'}
          </button>
          {error && <p className="md3-error" role="alert">{error}</p>}
        </section>

        {result && (
          <section className="results">
            <div className="results__head">
              <h2>Códigos gerados</h2>
              <span className="md3-chip model-chip">gemini-3.1-flash-lite</span>
            </div>
            <ul className="results__list">
              {result.codes.map(item => <CodeCard key={item.code} item={item} />)}
            </ul>
          </section>
        )}
      </main>

      <HistoryDialog
        open={historyOpen}
        history={history}
        onClose={() => setHistoryOpen(false)}
        onRemove={removeEntry}
        onClear={clearHistory}
      />
    </div>
  );
}
