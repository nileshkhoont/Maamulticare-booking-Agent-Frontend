import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// lib/constants throws at import time without this, so it must be set before any app import.
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_BASE_URL = "http://api.test/api/v1";
});

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QueueTable } from "@/components/schedule/queue-table";
import type { CallSchedule } from "@/features/schedule/types";

const PENDING: CallSchedule = {
  id: "sched-1",
  person_id: "person-1",
  person_full_name: "Asha",
  person_phone_number: "+919800000001",
  scheduled_at: "2026-12-07T05:30:00Z",
  call_purpose: "admin_scheduled",
  requested_by: "admin",
  status: "pending",
  created_at: "2026-11-01T00:00:00Z",
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function renderTable() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidate = vi.spyOn(queryClient, "invalidateQueries");
  render(
    <QueryClientProvider client={queryClient}>
      <QueueTable items={[PENDING]} />
    </QueryClientProvider>,
  );
  return { invalidate };
}

describe("Schedule queue — Cancel button", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  describe("when the backend accepts the cancel (unchanged behaviour)", () => {
    beforeEach(() => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => json(200, { ...PENDING, status: "cancelled" })),
      );
    });

    it("sends the cancel, refreshes the list, and shows no error", async () => {
      const { invalidate } = renderTable();
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ["call-schedules"] }));
      const [url, init] = vi.mocked(fetch).mock.calls[0]!;
      expect(String(url)).toBe("http://api.test/api/v1/call-schedules/sched-1/cancel");
      expect(init?.method).toBe("POST");
      expect(screen.queryByText(/can no longer be cancelled|already finished|Failed to cancel/)).toBeNull();
    });
  });

  describe("when the call already started (backend refuses with 409)", () => {
    beforeEach(() => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => json(409, { detail: "This call has already started and can no longer be cancelled" })),
      );
    });

    it("shows the reason on the row and refreshes the list to its real status", async () => {
      const { invalidate } = renderTable();
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(await screen.findByText("This call has already started and can no longer be cancelled")).toBeTruthy();
      await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ["call-schedules"] }));
    });
  });
});
