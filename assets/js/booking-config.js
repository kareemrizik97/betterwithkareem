/*
 * Launch configuration — edit these values once Kareem has chosen a scheduler.
 *
 * Recommended v1: Calendly + a connected Google Calendar + required payment
 * in Calendly. This keeps availability, payment data, receipts, reminders, and
 * calendar invitations in the services designed to handle them.
 */
window.KAREEM_BOOKING_CONFIG = {
  // Paste the exact event-type scheduling URL here, for example:
  // "https://calendly.com/kareem-rizik/coaching-session"
  bookingUrl: "",

  // Currently supported: "calendly". Leave as-is when bookingUrl is empty.
  provider: "calendly",

  // Set this to false if the scheduler has its own confirmation destination.
  redirectOnBooked: true,

  // Update before launch. This is only used for visible contact links.
  contactEmail: "hello@kareemrizik.com"
};

