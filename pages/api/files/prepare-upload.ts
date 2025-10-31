import type { NextApiRequest, NextApiResponse } from 'next';
import { getBearerToken, verifyToken } from "../../../lib/auth";
import { createPresignedUrl } from "../../../lib/mockAws";
import { v4 as uuidv4 } from "uuid";


export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const bearer = getBearerToken(req.headers.authorization as string | undefined);
  if (!bearer) return res.status(401).json({ error: 'Missing token' });
  const payload = verifyToken(bearer);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });

  const body = req.body || {};
  const { fileName, contentType, size } = body;
  if (!fileName || !contentType) return res.status(400).json({ error: 'fileName and contentType required' });

  const key = `uploads/${payload.sub}/${uuidv4()}-${fileName}`;
  const signed = createPresignedUrl(key, contentType, 900);

  return res.status(200).json({ uploadUrl: signed.url, key, expiresIn: signed.expiresIn });
}
