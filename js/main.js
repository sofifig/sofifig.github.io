(function () {
  var html = document.documentElement;

  /* ---- idioma ---- */
  var toggle = document.getElementById("langToggle");
  var saved = null;
  try { saved = localStorage.getItem("lang"); } catch (e) {}
  if (saved === "en" || saved === "es") setLang(saved);

  if (toggle) {
    toggle.addEventListener("click", function () {
      setLang(html.getAttribute("data-lang") === "es" ? "en" : "es");
    });
  }

  function setLang(lang) {
    html.setAttribute("data-lang", lang);
    html.setAttribute("lang", lang);
    try { localStorage.setItem("lang", lang); } catch (e) {}
  }

  /* ---- aparición al hacer scroll ---- */
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach(function (el) {
    observer.observe(el);
  });

  /* ---- tiras horizontales: arrastrar con el mouse ---- */
  document.querySelectorAll(".strip").forEach(function (strip) {
    var down = false, startX = 0, startScroll = 0, moved = 0;

    strip.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch") return;
      down = true;
      moved = 0;
      startX = e.clientX;
      startScroll = strip.scrollLeft;
    });

    strip.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) {
        moved = Math.abs(dx);
        strip.classList.add("is-dragging");
        strip.setPointerCapture(e.pointerId);
      }
      strip.scrollLeft = startScroll - dx;
    });

    function release(e) {
      if (!down) return;
      down = false;
      strip.classList.remove("is-dragging");
      if (e.pointerId !== undefined && strip.hasPointerCapture(e.pointerId)) {
        strip.releasePointerCapture(e.pointerId);
      }
    }

    strip.addEventListener("pointerup", release);
    strip.addEventListener("pointercancel", release);
    strip.addEventListener("pointerleave", release);

    strip.addEventListener("click", function (e) {
      if (moved > 4) { e.preventDefault(); moved = 0; }
    }, true);
  });
})();
