import { getStore } from '@netlify/blobs';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS }
  });

const MAX_ITEMS = 200;

async function readAll(store) {
  const items = await store.get('history', { type: 'json' });
  return Array.isArray(items) ? items : [];
}

async function writeAll(store, items) {
  await store.setJSON('history', items.slice(0, MAX_ITEMS));
}

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  const store = getStore({ name: 'codebncc-history', consistency: 'strong' });

  if (req.method === 'GET') {
    return json({ items: await readAll(store) });
  }

  if (req.method === 'POST') {
    let entry;
    try {
      entry = await req.json();
    } catch {
      return json({ error: 'Corpo da requisição inválido.' }, 400);
    }
    const saved = {
      id: crypto.randomUUID(),
      date: String(entry?.date || new Date().toISOString()),
      thumb: String(entry?.thumb || ''),
      codes: Array.isArray(entry?.codes) ? entry.codes : []
    };
    const items = await readAll(store);
    items.unshift(saved);
    await writeAll(store, items);
    return json(saved);
  }

  if (req.method === 'DELETE') {
    const id = new URL(req.url).searchParams.get('id');
    const items = await readAll(store);
    if (id) {
      await writeAll(store, items.filter(item => item.id !== id));
    } else {
      await writeAll(store, []);
    }
    return json({ ok: true });
  }

  return json({ error: 'Método não permitido.' }, 405);
};

export const config = { path: '/api/history' };
