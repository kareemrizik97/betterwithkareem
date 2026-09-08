(() => {
  const config = window.KAREEM_BOOKING_CONFIG || {};
  const currentParams = new URLSearchParams(window.location.search);
  const track = (eventName, parameters = {}) => {
    if (typeof window.kareemTrack === 'function') window.kareemTrack(eventName, parameters);
  };

  document.querySelectorAll('[data-current-year]').forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  document.querySelectorAll('[data-contact-email]').forEach((element) => {
    const email = config.contactEmail || 'hello@kareemrizik.com';
    element.textContent = email;
    element.href = `mailto:${email}`;
  });

  // Preserve Instagram / campaign attribution as visitors move to booking.
  document.querySelectorAll('a[href*="/book"]').forEach((link) => {
    const destination = new URL(link.href, window.location.origin);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'fbclid'].forEach((key) => {
      const value = currentParams.get(key);
      if (value && !destination.searchParams.has(key)) destination.searchParams.set(key, value);
    });
    link.href = destination.pathname + destination.search + destination.hash;
  });

  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      menu.classList.toggle('is-open', !expanded);
      document.body.classList.toggle('nav-open', !expanded);
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
      });
    });
  }

  const scheduler = document.querySelector('[data-scheduler]');
  if (window.location.pathname === '/thank-you/' && sessionStorage.getItem('kareem_booking_completed') === 'true') {
    track('generate_lead', { lead_source: currentParams.get('utm_source') || 'booking' });
    track('appointment_scheduled');
    sessionStorage.removeItem('kareem_booking_completed');
  }
  if (!scheduler) return;

  const bookingUrl = (config.bookingUrl || '').trim();
  const fallback = document.querySelector('[data-scheduler-fallback]');
  const schedulerStatus = document.querySelector('[data-scheduler-status]');
  const externalBookingLink = document.querySelector('[data-external-booking-link]');

  if (!bookingUrl) {
    scheduler.classList.add('scheduler--pending');
    if (fallback) fallback.hidden = false;
    if (schedulerStatus) schedulerStatus.textContent = 'The live booking calendar is being prepared.';
    track('booking_unavailable');
    return;
  }

  let schedulerUrl;
  try {
    schedulerUrl = new URL(bookingUrl);
  } catch (_) {
    scheduler.classList.add('scheduler--pending');
    if (fallback) fallback.hidden = false;
    if (schedulerStatus) schedulerStatus.textContent = 'The booking link needs a quick update before it can go live.';
    return;
  }

  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'fbclid'].forEach((key) => {
    const value = currentParams.get(key);
    if (value && !schedulerUrl.searchParams.has(key)) schedulerUrl.searchParams.set(key, value);
  });

  if (externalBookingLink) {
    externalBookingLink.href = schedulerUrl.href;
    externalBookingLink.hidden = false;
  }

  if (config.provider !== 'calendly') {
    scheduler.innerHTML = `<a class="button button--primary" href="${schedulerUrl.href}" target="_blank" rel="noopener">Open the booking calendar <span aria-hidden="true">↗</span></a>`;
    if (schedulerStatus) schedulerStatus.textContent = 'Select a time and complete payment in the secure booking window.';
    track('booking_calendar_ready', { booking_provider: config.provider || 'external' });
    return;
  }

  scheduler.classList.add('scheduler--live');
  if (schedulerStatus) schedulerStatus.textContent = 'Choose a time below. Payment, if required, is completed securely in the booking flow.';
  const embedScript = document.createElement('script');
  embedScript.src = 'https://assets.calendly.com/assets/external/widget.js';
  embedScript.async = true;
  embedScript.onload = () => {
    if (!window.Calendly) return;
    window.Calendly.initInlineWidget({
      url: schedulerUrl.href,
      parentElement: scheduler,
      prefill: {},
      utm: Object.fromEntries(['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].map((key) => [key, currentParams.get(key) || '']))
    });
    track('booking_calendar_ready', { booking_provider: 'calendly' });
  };
  document.head.appendChild(embedScript);

  if (config.redirectOnBooked) {
    window.addEventListener('message', (event) => {
      if (!event.origin.endsWith('calendly.com') || !event.data || event.data.event !== 'calendly.event_scheduled') return;
      sessionStorage.setItem('kareem_booking_completed', 'true');
      track('booking_completed', { booking_provider: 'calendly' });
      const next = new URL('/thank-you/', window.location.origin);
      ['utm_source', 'utm_medium', 'utm_campaign'].forEach((key) => {
        const value = currentParams.get(key);
        if (value) next.searchParams.set(key, value);
      });
      window.location.assign(next.href);
    });
  }
})();
