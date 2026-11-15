export async function checkReadiness(signal: AbortSignal): Promise<boolean> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/v1/health/ready`, {
    signal,
    cache: "no-store",
  });
  if (!response.ok) return false;
  const body: unknown = await response.json();
  if (typeof body !== "object" || body === null || !("status" in body) || body.status !== "ok") {
    return false;
  }
  if (!("checks" in body) || typeof body.checks !== "object" || body.checks === null) return false;
  return "postgresql" in body.checks && body.checks.postgresql === "ok"
    && "redis" in body.checks && body.checks.redis === "ok";
}
