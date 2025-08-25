/* =====================================================
   Shoc Services – Script
   - Smooth scroll + état nav actif
   - Année dynamique footer
   - Validation & envoi du formulaire (AJAX)
   - Remplacer FORM_EMAIL ou FORM_ENDPOINT selon votre choix
   ===================================================== */

// === Config envoi =====================================
// Option A : service sans backend (FormSubmit)
// 1) Remplacez par votre e‑mail ci-dessous.
// 2) Optionnel : ajoutez sur FormSubmit le domaine autorisé.
const FORM_EMAIL = "rayan.habib05@gmail.com"; // ← à remplacer

// Option B : votre backend (PHP/Node/etc.)
// Exemple d’endpoint custom : "/api/send-mail" (à coder côté serveur)
// const FORM_ENDPOINT = "/api/send-mail";

// ======================================================

// L’année dynamique dans le footer
document.getElementById("year").textContent = new Date().getFullYear();

// Défilement fluide + nav active
const navLinks = document.querySelectorAll('.nav-link, .btn-cta');
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href?.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Met à jour l’état "actif" de la nav selon le scroll
const sections = [...document.querySelectorAll('section[id]')];
const setActive = () => {
  const y = window.scrollY + 120; // marge sous header
  let current = sections[0]?.id;
  for (const sec of sections) {
    if (y >= sec.offsetTop) current = sec.id;
  }
  document.querySelectorAll('.menu a').forEach(a => {
    a.classList.toggle('is-active', a.getAttribute('href') === `#${current}`);
  });
};
window.addEventListener('scroll', setActive);
setActive();

// ===== Formulaire : validation + envoi =================
const form = document.getElementById('quote-form');
const statusEl = document.getElementById('form-status');

const validatePhone = (value) => {
  // tolérant (+chiffres, espaces, -, parenthèses)
  return /^[+()0-9\s-]{7,}$/.test(value.trim());
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = "";

  // Honeypot anti-spam
  if (document.getElementById('website').value.trim() !== "") {
    statusEl.textContent = "Une erreur est survenue. Veuillez réessayer.";
    return;
  }

  // Champs requis
  const nom = form.nom.value.trim();
  const email = form.email.value.trim();
  const tel = form.tel.value.trim();
  const localisation = form.localisation.value.trim();
  const service = form.service.value;
  const secteur = form.secteur.value;
  const message = form.message.value.trim();
  const consent = document.getElementById('consent').checked;

  if (!nom || !email || !tel || !localisation || !service || !secteur || !message || !consent) {
    statusEl.textContent = "Merci de compléter tous les champs requis.";
    return;
  }
  if (!validatePhone(tel)) {
    statusEl.textContent = "Numéro de téléphone invalide.";
    return;
  }

  // Prépare les données
  const payload = {
    nom, societe: form.societe.value.trim(), email, tel, localisation,
    service, secteur, surface: form.surface.value.trim(), message
  };

  // ——— Option A : Envoi via FormSubmit (sans backend) ———
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(FORM_EMAIL)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();

    // Succès
    form.reset();
    statusEl.textContent = "Merci ! Votre demande a bien été envoyée. Nous vous contactons très vite.";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Impossible d’envoyer le formulaire pour le moment. Réessayez plus tard ou écrivez-nous à rayan.habib05@gmail.com.";
  }
});
