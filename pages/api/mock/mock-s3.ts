import type { NextApiRequest, NextApiResponse } from 'next';

const store = new Map<string, { contentType: string; data: string; uploadedAt: string }>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { key, contentType } = req.query as { key?: string; contentType?: string };
  if (!key) return res.status(400).json({ error: 'Missing key' });

  if (req.method === 'PUT' || req.method === 'POST') {
    const data = (req.body && typeof req.body === 'string') ? req.body : JSON.stringify(req.body);
    store.set(String(key), { contentType: String(contentType || 'application/octet-stream'), data, uploadedAt: new Date().toISOString() });
    return res.status(200).json({ ok: true, key });
  }

  if (req.method === 'GET') {
    const item = store.get(String(key));
    if (!item) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json({ key, ...item });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
