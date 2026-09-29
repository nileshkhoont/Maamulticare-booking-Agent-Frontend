"use client";

import { Dialog } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ErrorBanner } from "@/components/common/error-banner";
import { Badge } from "@/components/ui/badge";
import { CallStatusBadge } from "@/components/calls/call-status-badge";
import { TranscriptViewer } from "@/components/calls/transcript-viewer";
import { RecordingPlayer } from "@/components/calls/recording-player";
import { useCall } from "@/features/calls/hooks";
import { usePerson } from "@/features/persons/hooks";
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_TONE, CALL_OUTCOME_LABELS, CALL_TYPE_LABELS } from "@/lib/constants";
import { formatDateTime, formatDuration } from "@/lib/utils";
import type { Appointment } from "@/features/appointments/types";

/**
 * Shared "View more" detail panel for both the Calls and Appointments tables — opened from
 * either a call's own id, or an appointment's created_by_call_id. A modal (not a page link) so
 * neither table's filters/pagination (plain useState, not URL-synced) get lost by navigating
 * away and back.
 *
 * `appointment` is passed in only when opened from the Appointments table — it's the exact same
 * row object already loaded there (guaranteed to match the table column, no separate fetch).
 * When present, its date & time and status show as their own rows in the details grid, right
 * after Person. Opened from the Calls table, `appointment` is omitted and neither row appears —
 * appointment info was explicitly asked to be Appointments-context only.
 */
export function CallDetailModal({
  callId,
  open,
  onClose,
  appointment,
}: {
  callId: string | null | undefined;
  open: boolean;
  onClose: () => void;
  appointment?: Appointment;
}) {
  const { data: call, isLoading, isError } = useCall(open && callId ? callId : undefined);
  const { data: person } = usePerson(call?.person_id);

  return (
    <Dialog open={open} onClose={onClose} title="Call details" className="max-w-2xl">
      {!callId && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No call is linked to this record.
        </p>
      )}

      {callId && isLoading && <LoadingSpinner />}
      {callId && isError && <ErrorBanner message="Failed to load call" />}

      {callId && call && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Call date &amp; time</p>
              <p className="text-base font-medium">{formatDateTime(call.start_time ?? call.created_at)}</p>
            </div>
            <CallStatusBadge status={call.call_status} />
          </div>

          <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
            <dt className="text-muted-foreground">Person</dt>
            <dd>
              {person ? (
                <a href={`/persons/${person.id}`} className="hover:underline">
                  {person.full_name ? `${person.full_name} (${person.phone_number})` : person.phone_number}
                </a>
              ) : (
                "—"
              )}
            </dd>
            {appointment && (
              <>
                <dt className="text-muted-foreground">Appointment date &amp; time</dt>
                <dd>
                  <a href={`/appointments/${appointment.id}`} className="hover:underline">
                    {formatDateTime(appointment.appointment_datetime)}
                  </a>
                </dd>
                <dt className="text-muted-foreground">Appointment status</dt>
                <dd>
                  <Badge tone={APPOINTMENT_STATUS_TONE[appointment.status]}>
                    {APPOINTMENT_STATUS_LABELS[appointment.status]}
                  </Badge>
                </dd>
              </>
            )}
            <dt className="text-muted-foreground">Call type</dt>
            <dd>{CALL_TYPE_LABELS[call.call_type]}</dd>
            <dt className="text-muted-foreground">Outcome</dt>
            <dd>{call.outcome ? CALL_OUTCOME_LABELS[call.outcome] : "—"}</dd>
            <dt className="text-muted-foreground">Duration</dt>
            <dd>{formatDuration(call.duration_seconds)}</dd>
          </dl>

          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Recording</h3>
            <RecordingPlayer url={call.recording_url} />
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Transcript</h3>
            <TranscriptViewer summary={call.transcript_summary} transcript={call.transcript} />
          </div>
        </div>
      )}
    </Dialog>
  );
}
