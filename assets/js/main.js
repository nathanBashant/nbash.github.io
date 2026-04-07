(function () {
  const body = document.body;
  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".site-nav");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
  const reveals = document.querySelectorAll(".reveal");
  const rotatingRole = document.querySelector(".hero-rotating");

  const closeNav = function () {
    body.classList.remove("nav-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
    }
  };

  const toggleScrolledState = function () {
    body.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  const updateActiveNav = function () {
    const headerOffset = header ? header.offsetHeight + 140 : 180;
    const scrollPosition = window.scrollY + headerOffset;
    let currentSectionId = "hero";

    navLinks.forEach(function (link) {
      const target = document.querySelector(link.getAttribute("href"));
      if (target && scrollPosition >= target.offsetTop) {
        currentSectionId = target.id;
      }
    });

    navLinks.forEach(function (link) {
      const isActive = link.getAttribute("href") === "#" + currentSectionId;
      link.classList.toggle("is-active", isActive);
    });
  };

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      const isOpen = body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      closeNav();
    });
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) {
      closeNav();
    }
  });

  window.addEventListener("scroll", function () {
    toggleScrolledState();
    updateActiveNav();
  });

  toggleScrolledState();
  updateActiveNav();

  if (rotatingRole) {
    const items = (rotatingRole.getAttribute("data-rotate-items") || "")
      .split(",")
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);

    if (items.length > 1) {
      let itemIndex = 0;
      let charIndex = 0;
      let deleting = false;

      const tick = function () {
        const current = items[itemIndex];
        rotatingRole.textContent = current.slice(0, charIndex);

        if (!deleting && charIndex === current.length) {
          deleting = true;
          window.setTimeout(tick, 1400);
          return;
        }

        if (deleting && charIndex === 0) {
          deleting = false;
          itemIndex = (itemIndex + 1) % items.length;
        }

        charIndex += deleting ? -1 : 1;
        window.setTimeout(tick, deleting ? 42 : 68);
      };

      rotatingRole.textContent = "";
      window.setTimeout(tick, 350);
    }
  }

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -10% 0px"
      }
    );

    reveals.forEach(function (element) {
      revealObserver.observe(element);
    });
  } else {
    reveals.forEach(function (element) {
      element.classList.add("is-visible");
    });
  }
})();
