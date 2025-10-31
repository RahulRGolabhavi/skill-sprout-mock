import type { NextApiRequest, NextApiResponse } from "next";
import { Worker as JobWorker } from "../../../lib/worker";
import { getBearerToken, verifyToken } from "../../../lib/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const bearer = getBearerToken(
    req.headers.authorization as string | undefined
  );
  if (!bearer) return res.status(401).json({ error: "Missing token" });

  const payload = verifyToken(bearer);
  if (!payload) return res.status(401).json({ error: "Invalid token" });

  const jobId = req.query.jobId as string | undefined;
  if (!jobId) return res.status(400).json({ error: "jobId required" });

  const result = JobWorker.getResult(jobId);
  if (!result) return res.status(202).json({ status: "pending" });

  return res.status(200).json({ status: "done", result });
}
