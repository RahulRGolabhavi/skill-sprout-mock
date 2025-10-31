import type { NextApiRequest, NextApiResponse } from "next";
import { getBearerToken, verifyToken } from "../../../lib/auth";
import { enqueueJob } from "../../../lib/worker";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const bearer = getBearerToken(
    req.headers.authorization as string | undefined
  );
  if (!bearer) return res.status(401).json({ error: "Missing token" });

  const payload = verifyToken(bearer);
  if (!payload) return res.status(401).json({ error: "Invalid token" });

  const body = req.body;

  //'await' is valid because the function is marked async
  const job = await enqueueJob({
    userId: payload.sub,
    projectId: body.projectId,
    meta: body.meta ?? {},
  });

  return res.status(200).json({
    message: "Processing started",
    jobId: job.jobId,
  });
}
