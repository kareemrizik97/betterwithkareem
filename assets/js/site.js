(() => {
  const config = window.KAREEM_BOOKING_CONFIG || {};
  const currentParams = new URLSearchParams(window.location.search);

  const style = document.createElement('style');
  style.id = 'type-refinement';
  style.textContent = '.editorial-hero h1{max-width:10ch!important;font-size:clamp(3.3rem,5.8vw,6.2rem)!important;line-height:.99!important}.split-heading h2{max-width:11ch!important;font-size:clamp(2.75rem,4.65vw,4.9rem)!important;line-height:1.03!important}.process h2,.about-copy h2,.faq-grid h2,.booking-cta h2{font-size:clamp(2.7rem,4.4vw,4.75rem)!important;line-height:1.03!important}@media(max-width:860px){.editorial-hero h1{font-size:clamp(2.9rem,7vw,4.15rem)!important;line-height:1.01!important}.split-heading h2,.process h2,.about-copy h2,.faq-grid h2,.booking-cta h2{max-width:14ch!important;font-size:clamp(2.55rem,6.5vw,3.55rem)!important;line-height:1.05!important}}@media(max-width:560px){.editorial-hero h1{font-size:clamp(2.6rem,10vw,3.35rem)!important;line-height:1.05!important}.split-heading h2,.process h2,.about-copy h2,.faq-grid h2,.booking-cta h2{max-width:14ch!important;font-size:clamp(2.25rem,9.75vw,2.9rem)!important;line-height:1.08!important}}';
  document.head.appendChild(style);

  const heroLede = document.querySelector('.editorial-hero .lede');
  if (heroLede) heroLede.textContent = 'A warm, practical space to pause and come back to yourself. Together, we’ll make sense of what feels stuck, get clear on what matters most, and turn that clarity into steady, meaningful steps toward a life that feels more like your own.';
  const socialDescription = document.querySelector('meta[property="og:description"]');
  if (socialDescription) socialDescription.setAttribute('content', 'A warm, practical space to pause, understand yourself, and take meaningful steps toward a life that feels more like your own.');

  document.querySelectorAll('[data-current-year]').forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
  document.querySelectorAll('[data-contact-email]').forEach((element) => {
    const email = config.contactEmail || 'hello@kareemrizik.com';
    element.textContent = email;
    element.href = 'mailto:' + email;
  });
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
  if (!scheduler) return;
  const bookingUrl = (config.bookingUrl || '').trim();
  const fallback = document.querySelector('[data-scheduler-fallback]');
  const schedulerStatus = document.querySelector('[data-scheduler-status]');
  const externalBookingLink = document.querySelector('[data-external-booking-link]');
  if (!bookingUrl) {
    scheduler.classList.add('scheduler--pending');
    if (fallback) fallback.hidden = false;
    if (schedulerStatus) schedulerStatus.textContent = 'The live booking calendar is being prepared.';
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
    scheduler.innerHTML = '<a class="button button--primary" href="' + schedulerUrl.href + '" target="_blank" rel="noopener">Open the booking calendar <span aria-hidden="true">↗</span></a>';
    if (schedulerStatus) schedulerStatus.textContent = 'Select a time and complete payment in the secure booking window.';
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
  };
  document.head.appendChild(embedScript);
  if (config.redirectOnBooked) {
    window.addEventListener('message', (event) => {
      if (!event.origin.endsWith('calendly.com') || !event.data || event.data.event !== 'calendly.event_scheduled') return;
      const next = new URL('/thank-you/', window.location.origin);
      ['utm_source', 'utm_medium', 'utm_campaign'].forEach((key) => {
        const value = currentParams.get(key);
        if (value) next.searchParams.set(key, value);
      });
      window.location.assign(next.href);
    });
  }
})();
