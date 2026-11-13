// Zweite Testimonial-Reihe: Kopie der ersten, läuft in Gegenrichtung
const template = document.querySelector('[data-marquee-template] .marquee__track');
const cloneTarget = document.querySelector('[data-marquee-clone]');
if (template && cloneTarget) {
  cloneTarget.appendChild(template.cloneNode(true));
}

// Endlos-Laufbänder: Inhalt verdoppeln, damit die Animation nahtlos wirkt
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
    const card = track.firstElementChild;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  };

  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft >= max - 1;
  };

  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
});

// Newsletter: noch ohne Anbindung, zeigt nur eine Bestätigung
const newsletter = document.querySelector('[data-newsletter]');
if (newsletter) {
  newsletter.addEventListener('submit', (event) => {
    event.preventDefault();
    const thanks = document.createElement('p');
    thanks.className = 'text-base newsletter__thanks';
    thanks.setAttribute('role', 'status');
    thanks.textContent = 'Thanks! You’re subscribed.';
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
    navToggle.setAttribute('aria-label', open ? 'Menü schliessen' : 'Menü öffnen');
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
    onboarding: 'Neighborhood Onboarding',
    activation: 'Neighborhood Activation',
    pizza: 'Neighborhood Pizza Party',
    partnership: 'Partnership',
    sponsoring: 'Sponsoring',
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
      if (!value) return 'Bitte gib deine Email-Adresse ein.';
      if (!emailPattern.test(value)) return 'Diese Email-Adresse ist ungültig. Beispiel: name@beispiel.ch';
      return '';
    }
    return value ? '' : 'Bitte fülle dieses Feld aus.';
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
      errorBox.textContent = 'Bitte bestätige die Datenschutzerklärung.';
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
    const interest = labels[data.get('interesse')] || 'Allgemeine Anfrage';
    const body = [
      `Interesse: ${interest}`,
      `Vorname: ${data.get('vorname')}`,
      `Name: ${data.get('name')}`,
      `Email: ${data.get('email')}`,
      data.get('anruf') ? 'Rückmeldung: lieber per Anruf' : 'Rückmeldung: per Email',
      '',
      data.get('nachricht') || '',
    ].join('\n');
    window.location.href = `mailto:gruezi@deheim.org?subject=${encodeURIComponent(`Anfrage: ${interest}`)}&body=${encodeURIComponent(body)}`;

    const thanks = document.createElement('div');
    thanks.className = 'contact__thanks';
    thanks.setAttribute('role', 'status');
    thanks.innerHTML = '<p class="text-base-b">Danke für deine Nachricht!</p><p class="text-base">Dein Mailprogramm wurde mit der vorbereiteten Nachricht geöffnet. Bitte sende sie dort ab. Falls sich nichts geöffnet hat, schreib uns direkt an <a href="mailto:gruezi@deheim.org">gruezi@deheim.org</a>.</p>';
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

// Sprachwahl: Übersetzungen gibt es noch nicht, darum vorerst kein Seitensprung nach oben
document.querySelectorAll('.lang-switch a, .footer__lang a').forEach((link) => {
  if (link.getAttribute('href') === '#') {
    link.addEventListener('click', (event) => event.preventDefault());
  }
});

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
    '.hero h1, .section-title h2, .cta h2, .contact__title, .heading-newsletter'
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
    '.testimonials__intro', '.testimonials .marquee', '.benefit-card', '.newsletter',
    '.contact__lead', '.team-dialog__inner',
  ];
  const revealGroups = [
    '.facts__grid > .stat-card', '.cta__content > *', '#team .team-card',
    '.footer__columns > *', '.footer__bottom > *', '.contact__form > *',
  ];
  const revealImages = ['.benefit-card__media', '.cta__image'];

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
