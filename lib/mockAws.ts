import { v4 as uuidv4 } from 'uuid';

type SignedUrl = {
  url: string;
  fields?: Record<string, string>;
  expiresIn: number;
};

export function createPresignedUrl(key: string, contentType: string, expires = 900): SignedUrl {
  const base = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  const url = `${base}/api/mock/mock-s3?key=${encodeURIComponent(key)}&contentType=${encodeURIComponent(contentType)}`;
  return { url, expiresIn: expires };
}

const jobQueue: Array<any> = [];
export function enqueueJob(payload: any) {
  const jobId = uuidv4();
  const job = { jobId, payload, enqueuedAt: new Date().toISOString(), status: 'queued' };
  jobQueue.push(job);
  return job;
}

export function dequeueJob() {
  return jobQueue.shift() || null;
}

export function peekJobs() {
  return [...jobQueue];
}
