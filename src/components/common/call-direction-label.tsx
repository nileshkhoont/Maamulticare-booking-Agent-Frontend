import { PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { cn } from "@/lib/utils";

/** Direction icon (no chip/ring container — just the colored glyph) followed by a text label —
 * shared by the Calls "Type" and Appointments "Source" columns so both read identically.
 *
 * lucide's own PhoneIncoming/PhoneOutgoing glyphs, used directly: an arrow pointing down-and-into
 * the handset for incoming, up-and-away for outgoing.
 *
 * Colors: green for outgoing, blue for incoming (confirmed with the user; the arrow direction
 * itself reads that way — up-and-out = green/outgoing, down-and-in = blue/incoming). Deliberately
 * not the app's brand red (reads as "missed call" by phone-app convention and collides with the
 * "Cancelled" status badge in the same row) and not the Status column's green (142° hue — this
 * is 90°, a visibly different yellow-green, so it doesn't collide with "Booked"/"Rescheduled").
 */
export function CallDirectionLabel({ incoming, label }: { incoming: boolean; label: string }) {
  const Icon = incoming ? PhoneIncoming : PhoneOutgoing;
  return (
    <span className="flex items-center gap-2">
      <Icon
        size={18}
        className={cn("shrink-0", incoming ? "text-call-incoming" : "text-call-outgoing")}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
