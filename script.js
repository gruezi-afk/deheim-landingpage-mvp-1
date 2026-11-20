// ===== Texte im Script in drei Sprachen (Sprache kommt aus <html lang="…">) =====
const LANG = (document.documentElement.lang || 'en').slice(0, 2);
const STRINGS = {
  de: {
    'Thanks! You’re subscribed.': 'Danke! Du bist angemeldet.',
    'Open menu': 'Menü öffnen',
    'Close menu': 'Menü schliessen',
    'Neighborhood Onboarding': 'Nachbarschafts-Onboarding',
    'Neighborhood Activation': 'Nachbarschafts-Aktivierung',
    'Neighborhood Pizza Party': 'Nachbarschafts-Pizzafest',
    'Partnership': 'Partnerschaft',
    'Sponsoring': 'Sponsoring',
    'General inquiry': 'Allgemeine Anfrage',
    'Please enter your email address.': 'Bitte gib deine E-Mail-Adresse ein.',
    'This email address isn’t valid. Example: name@example.com': 'Diese E-Mail-Adresse ist ungültig. Beispiel: name@beispiel.ch',
    'Please fill in this field.': 'Bitte fülle dieses Feld aus.',
    'Please confirm that you accept the privacy policy.': 'Bitte bestätige, dass du die Datenschutzerklärung akzeptierst.',
    'Interest': 'Interesse',
    'First name': 'Vorname',
    'Last name': 'Nachname',
    'Email': 'E-Mail',
    'Follow-up: by phone call': 'Rückmeldung: lieber per Telefon',
    'Follow-up: by email': 'Rückmeldung: per E-Mail',
    'Inquiry': 'Anfrage',
    'Thank you for your message!': 'Danke für deine Nachricht!',
    'Your email app has opened with the prepared message. Please send it from there. If nothing opened, write to us directly at': 'Dein Mailprogramm wurde mit der vorbereiteten Nachricht geöffnet. Bitte sende sie dort ab. Falls sich nichts geöffnet hat, schreib uns direkt an',
  },
  fr: {
    'Thanks! You’re subscribed.': 'Merci ! Votre inscription est enregistrée.',
    'Open menu': 'Ouvrir le menu',
    'Close menu': 'Fermer le menu',
    'Neighborhood Onboarding': 'Accueil de quartier',
    'Neighborhood Activation': 'Animation de quartier',
    'Neighborhood Pizza Party': 'Pizza party de quartier',
    'Partnership': 'Partenariat',
    'Sponsoring': 'Sponsoring',
    'General inquiry': 'Demande générale',
    'Please enter your email address.': 'Veuillez saisir votre adresse e-mail.',
    'This email address isn’t valid. Example: name@example.com': 'Cette adresse e-mail n’est pas valide. Exemple : nom@exemple.ch',
    'Please fill in this field.': 'Veuillez remplir ce champ.',
    'Please confirm that you accept the privacy policy.': 'Veuillez confirmer que vous acceptez la politique de confidentialité.',
    'Interest': 'Intérêt',
    'First name': 'Prénom',
    'Last name': 'Nom',
    'Email': 'E-mail',
    'Follow-up: by phone call': 'Réponse : de préférence par téléphone',
    'Follow-up: by email': 'Réponse : par e-mail',
    'Inquiry': 'Demande',
    'Thank you for your message!': 'Merci pour votre message !',
    'Your email app has opened with the prepared message. Please send it from there. If nothing opened, write to us directly at': 'Votre messagerie s’est ouverte avec le message préparé. Veuillez l’envoyer depuis celle-ci. Si rien ne s’est ouvert, écrivez-nous directement à',
  },
};
const t = (text) => (STRINGS[LANG] && STRINGS[LANG][text]) || text;

// Endlos-Laufband (Hero): Inhalt verdoppeln, damit die Animation nahtlos wirkt
document.querySelectorAll('.marquee__track').forEach((track) => {
  const group = track.firstElementChild;
  const copy = group.cloneNode(true);
  copy.setAttribute('aria-hidden', 'true');
  track.appendChild(copy);
});

// Karussells mit Pfeil-Buttons (Services, Team)
document.querySelectorAll('[data-carousel]').forEach((section) => {
  const track = section.querySelector('[data-carousel-track]');
  const prev = section.querySelector('[data-carousel-prev]');
  const next = section.querySelector('[data-carousel-next]');

  const step = () => {
    // Karte = markiertes Element (Testimonials) oder direktes Kind des Tracks (Team)
    const card = track.querySelector('[data-carousel-item]') || track.firstElementChild;
    const gap = parseFloat(getComputedStyle(card.parentElement).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  };

  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft >= max - 1;
  };

  // Weiches Gleiten zu einer Position (eigene Animation, damit das Einrasten
  // des Browsers nicht dazwischenspringt). Einrasten erst am Ende wieder an.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let glideFrame = null;

  const stopGlide = () => {
    if (glideFrame) cancelAnimationFrame(glideFrame);
    glideFrame = null;
  };

  const glideTo = (target) => {
    stopGlide();
    const max = track.scrollWidth - track.clientWidth;
    target = Math.max(0, Math.min(max, target));
    const from = track.scrollLeft;
    const distance = target - from;
    const finish = () => {
      track.scrollLeft = target;
      track.classList.remove('is-dragging');
      glideFrame = null;
    };
    if (Math.abs(distance) < 1 || reduceMotion.matches) {
      finish();
      return;
    }
    track.classList.add('is-dragging');
    const duration = Math.min(700, Math.max(350, 300 + Math.abs(distance) * 0.5));
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 4); // schnell los, sanft auslaufen
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      track.scrollLeft = from + distance * ease(t);
      if (t < 1) glideFrame = requestAnimationFrame(tick);
      else finish();
    };
    glideFrame = requestAnimationFrame(tick);
  };

  // Ziel-Karte für eine Position (Karte i liegt bei i × Schrittweite)
  const snapPoint = (position) => {
    const s = step();
    return Math.round(position / s) * s;
  };

  prev.addEventListener('click', () => glideTo(snapPoint(track.scrollLeft) - step()));
  next.addEventListener('click', () => glideTo(snapPoint(track.scrollLeft) + step()));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();

  // Mit der Maus ziehen (Touch und Trackpad scrollen von selbst)
  let dragStartX = 0;
  let dragStartScroll = 0;
  let dragging = false;
  let dragged = false;
  let samples = []; // letzte Mauspositionen, für den Schwung beim Loslassen

  track.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    stopGlide(); // mitten im Gleiten wieder packen
    dragging = true;
    dragged = false;
    dragStartX = event.clientX;
    dragStartScroll = track.scrollLeft;
    samples = [{ x: event.clientX, t: event.timeStamp }];
  });

  track.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    if (!dragged) {
      if (Math.abs(event.clientX - dragStartX) < 5) return; // kleiner Wackler = normaler Klick
      dragged = true;
      dragStartX = event.clientX; // ab hier mitziehen, ohne Ruck
      dragStartScroll = track.scrollLeft;
      track.classList.add('is-dragging');
      track.setPointerCapture(event.pointerId);
    }
    track.scrollLeft = dragStartScroll - (event.clientX - dragStartX);
    samples.push({ x: event.clientX, t: event.timeStamp });
    if (samples.length > 5) samples.shift();
  });

  const endDrag = (event) => {
    if (!dragging) return;
    dragging = false;
    if (!dragged) return;
    // Tempo der letzten Bewegung (px pro ms); ältere Bewegungen zählen nicht
    const first = samples[0];
    const last = samples[samples.length - 1];
    const dt = last.t - first.t;
    const fresh = event.timeStamp - last.t < 100;
    const velocity = dt > 0 && fresh ? (last.x - first.x) / dt : 0;
    // Mit Schwung weiter gleiten, dann auf die nächste Karte einrasten
    const projected = track.scrollLeft - velocity * 250;
    let target = snapPoint(projected);
    // Höchstens eine Karte weiter als dort, wo losgelassen wurde
    const s = step();
    const here = track.scrollLeft;
    target = Math.max(snapPoint(here) - s, Math.min(snapPoint(here) + s, target));
    glideTo(target);
  };
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);

  // Nach dem Ziehen keinen Klick auslösen (z. B. Team-Karte öffnen)
  track.addEventListener('click', (event) => {
    if (dragged) {
      event.preventDefault();
      event.stopPropagation();
      dragged = false;
    }
  }, true);

  // Bilder nicht als Datei «wegziehen»
  track.addEventListener('dragstart', (event) => event.preventDefault());
});

// Video (Vision-Seite): YouTube wird erst nach dem Klick geladen, ohne Cookies (youtube-nocookie).
// Bis dahin wird nur das lokal gespeicherte Vorschaubild gezeigt, es geht nichts an Google.
document.querySelectorAll('[data-video]').forEach((video) => {
  const button = video.querySelector('.video__play');
  if (!button) return;
  button.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.dataset.video)}?autoplay=1&rel=0&playsinline=1`;
    iframe.title = video.dataset.videoTitle || 'YouTube video';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    button.replaceWith(iframe);
    iframe.focus();
  });
});

// Newsletter: noch ohne Anbindung, zeigt nur eine Bestätigung
const newsletter = document.querySelector('[data-newsletter]');
if (newsletter) {
  newsletter.addEventListener('submit', (event) => {
    event.preventDefault();
    const thanks = document.createElement('p');
    thanks.className = 'text-base newsletter__thanks';
    thanks.setAttribute('role', 'status');
    thanks.textContent = t('Thanks! You’re subscribed.');
    newsletter.replaceChildren(thanks);
  });
}

// Mobile-Navigation: Hamburger-Menü auf- und zuklappen
const nav = document.querySelector('.nav');
const navToggle = document.querySelector('[data-nav-toggle]');
if (nav && navToggle) {
  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? t('Close menu') : t('Open menu'));
  };

  navToggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  nav.querySelectorAll('.nav__links a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });
  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target)) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
}

// Schwebender Kontakt-Button: ausblenden, sobald der Footer sichtbar ist
const mobileCta = document.querySelector('[data-mobile-cta]');
const footer = document.querySelector('.footer');
if (mobileCta && footer && 'IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    mobileCta.classList.toggle('is-hidden', entry.isIntersecting);
  }).observe(footer);
}

// Kontaktformular
const contactForm = document.querySelector('[data-contact-form]');
if (contactForm) {
  const labels = {
    onboarding: t('Neighborhood Onboarding'),
    activation: t('Neighborhood Activation'),
    pizza: t('Neighborhood Pizza Party'),
    partnership: t('Partnership'),
    sponsoring: t('Sponsoring'),
  };

  // Interesse aus dem Link vorauswählen, z. B. kontakt.html?interesse=fest
  const preset = new URLSearchParams(window.location.search).get('interesse');
  const presetInput = preset && contactForm.querySelector(`input[name="interesse"][value="${CSS.escape(preset)}"]`);
  if (presetInput) presetInput.checked = true;

  const errorBox = contactForm.querySelector('[data-contact-error]');
  const privacy = contactForm.querySelector('input[name="datenschutz"]');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // Liefert die Fehlermeldung für ein Feld, oder '' wenn alles stimmt
  const fieldError = (input) => {
    const value = input.value.trim();
    if (input.type === 'email') {
      if (!value) return t('Please enter your email address.');
      if (!emailPattern.test(value)) return t('This email address isn’t valid. Example: name@example.com');
      return '';
    }
    return value ? '' : t('Please fill in this field.');
  };

  const showFieldError = (input, message) => {
    const caption = document.getElementById(input.getAttribute('aria-describedby'));
    if (message) {
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.removeAttribute('aria-invalid');
    }
    if (caption) {
      caption.textContent = message;
      caption.hidden = !message;
    }
  };

  const textFields = [...contactForm.querySelectorAll('.field__input[required]')];

  textFields.forEach((input) => {
    // Beim Verlassen des Feldes prüfen (leere Felder erst beim Absenden markieren)
    input.addEventListener('blur', () => {
      if (input.value.trim()) showFieldError(input, fieldError(input));
    });
    // Sobald ein Fehler angezeigt wird, live nachprüfen, damit er beim Korrigieren verschwindet
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') showFieldError(input, fieldError(input));
    });
  });

  privacy.addEventListener('change', () => {
    if (privacy.checked) {
      privacy.removeAttribute('aria-invalid');
      errorBox.hidden = true;
    }
  });

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const invalid = textFields.filter((input) => {
      const message = fieldError(input);
      showFieldError(input, message);
      return message;
    });

    if (!privacy.checked) {
      privacy.setAttribute('aria-invalid', 'true');
      errorBox.textContent = t('Please confirm that you accept the privacy policy.');
      errorBox.hidden = false;
      invalid.push(privacy);
    } else {
      errorBox.hidden = true;
    }

    if (invalid.length) {
      invalid[0].focus();
      return;
    }

    // Noch ohne Server: öffnet das Mailprogramm mit einer vorbereiteten Nachricht
    const data = new FormData(contactForm);
    const interest = labels[data.get('interesse')] || t('General inquiry');
    const body = [
      `${t('Interest')}: ${interest}`,
      `${t('First name')}: ${data.get('vorname')}`,
      `${t('Last name')}: ${data.get('name')}`,
      `${t('Email')}: ${data.get('email')}`,
      data.get('anruf') ? t('Follow-up: by phone call') : t('Follow-up: by email'),
      '',
      data.get('nachricht') || '',
    ].join('\n');
    window.location.href = `mailto:gruezi@deheim.org?subject=${encodeURIComponent(`${t('Inquiry')}: ${interest}`)}&body=${encodeURIComponent(body)}`;

    const thanks = document.createElement('div');
    thanks.className = 'contact__thanks';
    thanks.setAttribute('role', 'status');
    thanks.innerHTML = `<p class="text-base-b">${t('Thank you for your message!')}</p><p class="text-base">${t('Your email app has opened with the prepared message. Please send it from there. If nothing opened, write to us directly at')} <a href="mailto:gruezi@deheim.org">gruezi@deheim.org</a>.</p>`;
    contactForm.replaceChildren(thanks);
  });
}

// Team-Overlay: Klick auf eine Team-Karte öffnet mehr Infos zur Person
const teamDialog = document.querySelector('[data-team-dialog]');
const teamMembers = [...document.querySelectorAll('[data-team-member]')];
if (teamDialog && teamMembers.length && typeof teamDialog.showModal === 'function') {
  const photo = teamDialog.querySelector('[data-team-photo]');
  const nameEl = teamDialog.querySelector('[data-team-name]');
  const roleEl = teamDialog.querySelector('[data-team-role]');
  const bioEl = teamDialog.querySelector('[data-team-bio]');
  const contactBox = teamDialog.querySelector('[data-team-contact-box]');
  let current = 0;
  let opener = null;

  const show = (index) => {
    current = (index + teamMembers.length) % teamMembers.length;
    const card = teamMembers[current];
    const cardImg = card.querySelector('img');
    photo.src = cardImg.getAttribute('src');
    photo.alt = cardImg.alt;
    nameEl.textContent = card.querySelector('h3').textContent;
    roleEl.textContent = card.querySelector('.team-card__text p').textContent;
    bioEl.textContent = card.dataset.bio || '';
    // Kontaktdaten nur bei Personen mit data-team-contact (aktuell Lukas)
    contactBox.hidden = !card.hasAttribute('data-team-contact');
    teamDialog.querySelector('.team-dialog__inner').scrollTop = 0;
  };

  teamMembers.forEach((card, index) => {
    card.querySelector('[data-team-open]').addEventListener('click', (event) => {
      opener = event.currentTarget;
      show(index);
      teamDialog.showModal();
    });
  });

  teamDialog.querySelector('[data-team-prev]').addEventListener('click', () => show(current - 1));
  teamDialog.querySelector('[data-team-next]').addEventListener('click', () => show(current + 1));
  teamDialog.querySelector('[data-team-close]').addEventListener('click', () => teamDialog.close());

  // Klick auf den abgedunkelten Hintergrund schliesst das Overlay
  teamDialog.addEventListener('click', (event) => {
    if (event.target === teamDialog) teamDialog.close();
  });

  // Pfeiltasten wechseln die Person
  teamDialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(current - 1);
    if (event.key === 'ArrowRight') show(current + 1);
  });

  // Fokus nach dem Schliessen zurück auf die Karte
  teamDialog.addEventListener('close', () => opener?.focus());
}

// ===== Micro-Interaktionen & Scroll-Effekte =====

// Button-Text in einen «Roll»-Container packen (Hover: Text rollt nach oben)
document.querySelectorAll('.button, .link-button').forEach((el) => {
  const target = [...el.childNodes].find((node) =>
    (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) ||
    (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SPAN' && !node.className && node.textContent.trim())
  );
  if (!target) return;
  const textNode = target.nodeType === Node.TEXT_NODE ? target : target.firstChild;
  const text = textNode.textContent.trim();
  const roll = document.createElement('span');
  roll.className = 'roll';
  const inner = document.createElement('span');
  inner.className = 'roll__inner';
  inner.textContent = text;
  roll.appendChild(inner);
  textNode.replaceWith(roll);
});

// Navigation: feiner Schatten, sobald gescrollt wird
const updateScrolled = () => document.body.classList.toggle('is-scrolled', window.scrollY > 10);
window.addEventListener('scroll', updateScrolled, { passive: true });
updateScrolled();

if (document.documentElement.classList.contains('motion')) {
  // Überschriften in Wörter aufteilen (Zeilenumbrüche bleiben erhalten)
  const splitHeadings = document.querySelectorAll(
    '.hero h1, .page-hero h1, .section-title h2, .contact__title, .heading-newsletter'
  );
  splitHeadings.forEach((heading) => {
    let index = 0;
    [...heading.childNodes].forEach((node) => {
      if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) return;
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          fragment.appendChild(document.createTextNode(' '));
          return;
        }
        const word = document.createElement('span');
        word.className = 'split-word';
        word.style.setProperty('--i', index++);
        word.textContent = part;
        fragment.appendChild(word);
      });
      node.replaceWith(fragment);
    });
    heading.classList.add('split');
  });

  // Elemente, die beim Scrollen hochgleiten. Gruppen werden gestaffelt.
  const revealSingles = [
    '.hero__intro', '.hero-strip', '.facts__aside', '.statement__lead', '.statement__body',
    '.testimonials__intro', '.testimonials__track', '.benefit-card', '.cta', '.newsletter',
    '.video', '.story',
    '.contact__lead', '.team-dialog__inner',
  ];
  const revealGroups = [
    '.facts__grid > .stat-card', '#team .team-card',
    '.footer__columns > *', '.footer__bottom > *', '.contact__form > *',
  ];
  // Service- und CTA-Karten: keine Effekte im Inneren, die Karte erscheint als Ganzes
  const revealImages = [];

  revealSingles.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (!el.closest('dialog')) el.classList.add('reveal');
    });
  });
  // Gruppen: der gemeinsame Container wird beobachtet, alle Kinder erscheinen gestaffelt
  revealGroups.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      const siblings = [...el.parentElement.children];
      el.classList.add('reveal', 'reveal--grouped');
      el.style.setProperty('--i', Math.min(siblings.indexOf(el), 6));
      el.parentElement.classList.add('reveal-group');
    });
  });
  revealImages.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => el.classList.add('reveal-img'));
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      if (entry.target.classList.contains('reveal-group')) {
        entry.target.querySelectorAll(':scope > .reveal--grouped').forEach((child) => child.classList.add('is-visible'));
      }
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });

  document.querySelectorAll('.split, .reveal:not(.reveal--grouped), .reveal-group, .reveal-img').forEach((el) => revealObserver.observe(el));
}
