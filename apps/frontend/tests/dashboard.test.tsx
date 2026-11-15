import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DashboardPage from "@/app/page";

vi.mock("@/components/engagement-chart", () => ({ EngagementChart: () => <div>Demo chart</div> }));
vi.mock("@/components/health-status", () => ({ HealthStatus: () => <div>Service check</div> }));

describe("dashboard foundation", () => {
  it("renders navigation and clearly labels illustrative data", () => {
    render(<DashboardPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("A clearer view of your audience.");
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    expect(screen.getByRole("note")).toHaveTextContent("Demo data only.");
    expect(screen.getByRole("link", { name: /View platform status/ })).toHaveAttribute("href", "#foundation");
  });
});
