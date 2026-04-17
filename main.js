const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const yearTarget = document.querySelector("#current-year");
const revealItems = document.querySelectorAll(".reveal");
const modalBackdrop = document.querySelector("[data-modal-backdrop]");
const modalContent = document.querySelector("[data-modal-content]");
const modalClose = document.querySelector("[data-modal-close]");
const modalTriggers = document.querySelectorAll("[data-modal-target]");

let lastFocusedTrigger = null;

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    siteNav.classList.toggle("is-open", !expanded);
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
    });
  });
}

if (yearTarget) {
  yearTarget.textContent = String(new Date().getFullYear());
}

const closeModal = () => {
  if (!modalBackdrop || !modalContent) {
    return;
  }

  modalBackdrop.hidden = true;
  modalContent.innerHTML = "";
  document.body.classList.remove("modal-open");

  if (lastFocusedTrigger) {
    lastFocusedTrigger.focus();
    lastFocusedTrigger = null;
  }
};

if (modalBackdrop && modalContent && modalClose) {
  modalTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const templateId = trigger.getAttribute("data-modal-target");
      const template = templateId ? document.getElementById(templateId) : null;

      if (!(template instanceof HTMLTemplateElement)) {
        return;
      }

      lastFocusedTrigger = trigger;
      modalContent.innerHTML = "";
      modalContent.append(template.content.cloneNode(true));
      modalBackdrop.hidden = false;
      document.body.classList.add("modal-open");
      modalClose.focus();
    });
  });

  modalClose.addEventListener("click", closeModal);

  modalBackdrop.addEventListener("click", (event) => {
    if (event.target === modalBackdrop) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modalBackdrop.hidden) {
      closeModal();
    }
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
  }
);

revealItems.forEach((item) => observer.observe(item));
