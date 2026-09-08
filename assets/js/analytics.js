(() => {
  const config = window.KAREEM_ANALYTICS_CONFIG || {};
  const measurementId = String(config.measurementId || '').trim();
  if (!/^G-[A-Z0-9]+$/i.test(measurementId)) return;

  const consentKey = 'kareem_analytics_consent';
  let analyticsLoaded = false;
  let pageContextTracked = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };

  const campaign = Object.fromEntries(
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].map((key) => [key, new URLSearchParams(window.location.search).get(key) || undefined])
  );

  window.kareemTrack = (eventName, parameters = {}) => {
    if (localStorage.getItem(consentKey) !== 'granted') return;
    window.gtag('event', eventName, {
      page_path: window.location.pathname,
      ...campaign,
      ...parameters
    });
  };

  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;

    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      send_page_view: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
    trackPageContext();
  }

  function trackPageContext() {
    if (pageContextTracked) return;
    pageContextTracked = true;
    if (window.location.pathname === '/ig/') window.kareemTrack('campaign_landing_view');
    if (window.location.pathname === '/book/') window.kareemTrack('booking_page_view');
  }

  function clearAnalyticsCookies() {
    document.cookie.split(';').forEach((entry) => {
      const name = entry.split('=')[0].trim();
      if (name === '_ga' || name.startsWith('_ga_')) {
        document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
        document.cookie = `${name}=; Max-Age=0; path=/; domain=.betterwithkareem.com; SameSite=Lax`;
      }
    });
  }

  const banner = document.createElement('section');
  banner.className = 'analytics-consent';
  banner.setAttribute('aria-label', 'Analytics preferences');
  banner.innerHTML = `
    <p>May we use Google Analytics to understand visits and improve this site? Analytics loads only if you allow it. <a href="/legal/privacy.html">Privacy details</a></p>
    <div class="analytics-consent__actions">
      <button class="button button--ghost" type="button" data-analytics-decline>Decline</button>
      <button class="button button--primary" type="button" data-analytics-accept>Allow analytics</button>
    </div>`;

  const settingsButton = document.createElement('button');
  settingsButton.className = 'privacy-choices';
  settingsButton.type = 'button';
  settingsButton.textContent = 'Privacy choices';

  document.body.append(banner, settingsButton);

  const savedConsent = localStorage.getItem(consentKey);
  banner.hidden = Boolean(savedConsent);
  settingsButton.hidden = !savedConsent;

  banner.querySelector('[data-analytics-accept]').addEventListener('click', () => {
    localStorage.setItem(consentKey, 'granted');
    banner.hidden = true;
    settingsButton.hidden = false;
    loadAnalytics();
  });

  banner.querySelector('[data-analytics-decline]').addEventListener('click', () => {
    localStorage.setItem(consentKey, 'denied');
    clearAnalyticsCookies();
    banner.hidden = true;
    settingsButton.hidden = false;
  });

  settingsButton.addEventListener('click', () => {
    banner.hidden = false;
    settingsButton.hidden = true;
  });

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    const linkText = (link.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100);

    if (href.includes('/book')) window.kareemTrack('booking_cta_click', { link_text: linkText });
    if (href.startsWith('mailto:')) window.kareemTrack('contact_click', { contact_method: 'email' });

    try {
      const destination = new URL(link.href, window.location.origin);
      if (/instagram\.com|tiktok\.com|x\.com|twitter\.com|linkedin\.com/.test(destination.hostname)) {
        window.kareemTrack('social_profile_click', { destination_host: destination.hostname });
      }
    } catch (_) {}
  });

  document.querySelectorAll('details').forEach((details) => {
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      const question = details.querySelector('summary');
      window.kareemTrack('faq_open', { question: question ? question.textContent.trim() : '' });
    });
  });

  const reached = new Set();
  const recordScrollDepth = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const depth = Math.round((window.scrollY / scrollable) * 100);
    [25, 50, 75, 90].forEach((threshold) => {
      if (depth >= threshold && !reached.has(threshold)) {
        reached.add(threshold);
        window.kareemTrack('scroll_depth', { percent_scrolled: threshold });
      }
    });
  };
  window.addEventListener('scroll', recordScrollDepth, { passive: true });

  if (savedConsent === 'granted') loadAnalytics();
})();
