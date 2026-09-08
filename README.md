# Kareem Rizik | Life Coaching

A polished, responsive static website for Kareem Rizik’s coaching practice. It is designed around the main conversion path:

`Instagram → /ig → /book → choose time → secure payment → confirmation`

## Included

- Home page with coaching approach, services, FAQ, and booking calls to action
- Mobile-first Instagram landing page at `/ig/`
- Booking page at `/book/`, ready to embed a live Calendly event type
- Secure-payment handoff through the scheduler rather than through this site
- Booking confirmation page at `/thank-you/`
- Draft privacy and terms pages clearly marked for launch review
- Render static-site configuration in `render.yaml`
- Attribution preservation for Instagram / UTM parameters through to booking
- Consent-based Google Analytics 4 integration with booking, campaign, FAQ, contact, social, and scroll-depth events
- Search-ready canonical URLs, structured data, `robots.txt`, and `sitemap.xml`

## Analytics and campaign links

Set the GA4 Measurement ID in `assets/js/analytics-config.js`. Analytics loads only after the visitor grants consent; advertising personalization and Google Signals are disabled in the site configuration. Enhanced Measurement can be enabled in the GA4 web stream.

Recommended profile links:

- Instagram: `https://betterwithkareem.com/ig/?utm_source=instagram&utm_medium=social&utm_campaign=profile`
- TikTok: `https://betterwithkareem.com/ig/?utm_source=tiktok&utm_medium=social&utm_campaign=profile`
- X: `https://betterwithkareem.com/?utm_source=x&utm_medium=social&utm_campaign=profile`
- LinkedIn: `https://betterwithkareem.com/?utm_source=linkedin&utm_medium=social&utm_campaign=profile`

## Turn on live scheduling and payment

This site deliberately has no payment secret, card form, or calendar credentials in its files. For the simplest production launch, configure payment-required events inside Calendly and paste the event URL into one file.

1. Create Kareem’s scheduler account and connect the calendar that represents his availability.
2. Create a paid coaching event and, optionally, a free discovery event.
3. Configure duration, price, currency, buffers, daily booking cap, minimum notice, online meeting location, reminders, and cancellation policy.
4. Connect a payment provider supported by Kareem’s legal business and payout-bank country.
5. Copy the exact public event-type URL.
6. Edit `assets/js/booking-config.js`:

   ```js
   bookingUrl: "https://calendly.com/kareem-rizik/coaching-session",
   ```

7. Deploy the updated site. The booking page will automatically embed the live calendar and pass campaign attribution into it.

The scheduler should send appointment confirmation, calendar invites, payment receipts, and reminders. Gmail can be used as Kareem’s inbox, but should not be used as the site’s payment or appointment system.

## Important payment note

Before choosing Stripe, confirm the country of Kareem’s legal business entity and payout bank account. If the business is based in Jordan, do not assume Stripe can be used: Jordan is not on Stripe’s current merchant-country availability list. Choose a compliant payment provider available to the actual business instead; do not work around country requirements.

## Deploy to Render

1. Put this folder in a GitHub repository (keep it public only if you are comfortable with all website copy being public).
2. In Render, create a new **Static Site** from the repository.
3. Render will use `render.yaml`; if configuring manually, set the publish directory to `.` and leave the build command empty.
4. Add the custom domain after confirming the production booking flow.
5. Test `/`, `/ig/`, `/book/`, `/thank-you/`, the calendar event, payment, confirmation email, and cancellation path on a phone before announcing the link on Instagram.

Do not add calendar OAuth credentials, payment keys, Gmail credentials, or other secrets to this repository.

## Information still needed before launch

- Kareem’s niche, ideal clients, bio, qualifications, and portrait
- Session types, durations, pricing, currency, and packages
- Legal business/payout country and payment provider
- Time zone, weekly availability, meeting platform, and booking rules
- Business email and social handle(s)
- Final rescheduling, cancellation, no-show, and refund policies
- Legal business name, address, and completed privacy / terms review
- Real testimonials, only with written permission

## Local preview

Open `index.html` in a browser or serve this directory from any static web server. No build step or dependencies are required.
