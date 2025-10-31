const results = new Map<string, any>();
let running = false;

// local in-memory job queue
const localQueue: { jobId: string; payload: any }[] = [];

/**
 * Enqueue a new job (called by API)
 */
export async function enqueueJob(payload: any) {
  const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const job = { jobId, payload };
  localQueue.push(job);
  console.log("[Worker] enqueued job", jobId);
  return job;
}

/**
 * Worker loop to process jobs
 */
export const Worker = {
  start: () => {
    if (running) return;
    running = true;

    const loop = async () => {
      try {
        const job = localQueue.shift();
        if (job) {
          console.log("[Worker] picked job", job.jobId);
          await new Promise((r) => setTimeout(r, 10000)); // 10 seconds
          const result = {
            jobId: job.jobId,
            processedAt: new Date().toISOString(),
            ok: true,
            payload: job.payload,
          };
          results.set(job.jobId, result);
          console.log("[Worker] completed job", job.jobId);
        }
      } catch (err) {
        console.error("[Worker] error", err);
      }
      setTimeout(loop, 500);
    };
    loop();
  },

  getResult: (jobId: string) => results.get(jobId) ?? null,
};

// start worker automatically
Worker.start();
