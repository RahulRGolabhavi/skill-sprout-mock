import type { NextApiRequest, NextApiResponse } from "next";
import { getBearerToken, verifyToken } from "../../../lib/auth";
import { DB } from "../../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const bearer = getBearerToken(
    req.headers.authorization as string | undefined
  );
  if (!bearer) return res.status(401).json({ error: "Missing token" });

  const payload = verifyToken(bearer);
  if (!payload) return res.status(401).json({ error: "Invalid token" });

  const userId = payload.sub;
  const profile = await DB.getUserProfile(userId);
  if (!profile) return res.status(404).json({ error: "Profile not found" });

  return res.status(200).json({ profile });
}
