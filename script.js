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
    thanks.textContent = 'Danke! Du bist angemeldet.';
    newsletter.replaceChildren(thanks);
  });
}
