// Launch event constants for the World Cup 2026 Activation kickoff call.
//
// Stable identifiers — URL, meeting ID, ISO date — live here rather than in
// messages/*.json so translations stay focused on copy and the same data
// renders identically across all locales.

export const LAUNCH_EVENT = {
  registrationUrl:
    "https://staffweb.zoom.us/meeting/register/E9vxp8T5TLmyfii4gh8SXw",
  meetingId: "963 3748 1824",
  dateIso: "2026-06-01T13:00:00Z", // Monday, June 1, 2026 · 9:00 AM ET (EDT, UTC-4)
  durationMinutes: 60,
} as const;

export type LaunchEvent = typeof LAUNCH_EVENT;
