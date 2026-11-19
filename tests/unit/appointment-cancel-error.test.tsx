import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// lib/constants throws at import time without this, so it must be set before any app import.
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_BASE_URL = "http://api.test/api/v1";
});

vi.mock("next/navigation", () => ({
  useParams: () => ({ appointmentId: "appt-1" }),
  useRouter: () => ({ push: vi.fn() }),
}));

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppointmentDetailPage from "@/app/(dashboard)/appointments/[appointmentId]/page";

const APPOINTMENT = {
  id: "appt-1",
  person_id: "person-1",
  appointment_datetime: "2026-12-07T04:00:00Z",
  status: "booked",
  booking_source: "inbound_call",
  created_at: "2026-11-01T00:00:00Z",
  updated_at: "2026-11-01T00:00:00Z",
};
const PERSON = { id: "person-1", full_name: "Asha", phone_number: "+919800000001", created_at: "", updated_at: "" };

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("appointment detail page — cancel failure", () => {
  beforeEach(() => {
    // Real api-client + real React Query hooks; only the network is faked, answering exactly
    // what the backend sends when the appointment was already cancelled elsewhere (409 + detail).
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.endsWith("/appointments/appt-1/cancel") && init?.method === "POST") {
          return json(409, { detail: "This appointment is already cancelled" });
        }
        if (url.endsWith("/appointments/appt-1")) return json(200, APPOINTMENT);
        if (url.endsWith("/persons/person-1")) return json(200, PERSON);
        return json(404, { detail: "not found" });
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows the backend's reason instead of failing silently", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <AppointmentDetailPage />
      </QueryClientProvider>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Cancel appointment" }));
    // The confirm dialog has its own "Cancel appointment" button — the last one rendered.
    const confirmButton = screen.getAllByRole("button", { name: "Cancel appointment" }).at(-1);
    if (!confirmButton) throw new Error("confirm dialog button was not rendered");
    fireEvent.click(confirmButton);

    expect(await screen.findByText("This appointment is already cancelled")).toBeTruthy();
  });
});
