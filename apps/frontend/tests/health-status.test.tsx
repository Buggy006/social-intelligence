import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HealthStatus } from "@/components/health-status";
import { checkReadiness } from "@/lib/api";

vi.mock("@/lib/api", () => ({ checkReadiness: vi.fn() }));
beforeEach(() => { vi.mocked(checkReadiness).mockReset(); });
afterEach(() => vi.useRealTimers());

it("shows success after checking dependencies", async () => {
  vi.mocked(checkReadiness).mockResolvedValue(true);
  render(<HealthStatus />);
  expect(screen.getByRole("status")).toHaveTextContent("Checking services");
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("API, database & Redis ready"));
});

it("allows retry after a network failure", async () => {
  vi.mocked(checkReadiness).mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(true);
  render(<HealthStatus />);
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Services unavailable"));
  fireEvent.click(screen.getByRole("button", { name: "Refresh service status" }));
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("API, database & Redis ready"));
});

it("times out a stalled request", async () => {
  vi.useFakeTimers();
  vi.mocked(checkReadiness).mockImplementation((signal) => new Promise((resolve, reject) => {
    signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
  }));
  render(<HealthStatus />);
  await act(async () => { await vi.advanceTimersByTimeAsync(12000); });
  expect(screen.getByRole("status")).toHaveTextContent("Services unavailable");
});
