import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const SECRET = process.env.MOCK_JWT_SECRET || 'supersecretlocalkey';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { sub = 'user-123', email = 'user@example.com', name = 'Local User' } = req.body || {};

  const payload = {
    sub,
    email,
    name,
    iss: 'https://mock-cognito.local',
    aud: 'mock-client-id'
  };

  const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });

  res.status(200).json({ token });
}
