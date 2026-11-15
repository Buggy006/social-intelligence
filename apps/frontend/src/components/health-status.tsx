"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkReadiness } from "@/lib/api";

export function HealthStatus() {
  const [status, setStatus] = useState<"checking" | "ready" | "unavailable">("checking");
  const pending = useRef<AbortController | null>(null);
  const check = useCallback(() => {
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    const timeout = setTimeout(() => controller.abort(), 12000);
    void checkReadiness(controller.signal)
      .then((ready) => {
        if (pending.current === controller) setStatus(ready ? "ready" : "unavailable");
      })
      .catch(() => {
        if (pending.current === controller) setStatus("unavailable");
      })
      .finally(() => clearTimeout(timeout));
  }, []);

  useEffect(() => {
    void check();
    return () => {
      pending.current?.abort();
      pending.current = null;
    };
  }, [check]);

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      <span role="status" className="flex items-center gap-2 text-muted-foreground">
        <span aria-hidden="true" className={`size-2 rounded-full ${status === "ready" ? "bg-emerald-600" : "bg-amber-500"}`} />
        {status === "ready" ? "API, database & Redis ready" : status === "checking" ? "Checking services..." : "Services unavailable"}
      </span>
      <Button size="sm" variant="outline" onClick={() => { setStatus("checking"); void check(); }} disabled={status === "checking"} aria-label="Refresh service status">
        <RefreshCw className="size-3" aria-hidden="true" /> Retry
      </Button>
    </div>
  );
}
