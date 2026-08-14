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

  /* ---- proyectos: la imagen principal abre y cierra ---- */
  function closeProject(project) {
    project.classList.remove("is-open");
    project.querySelector(".box-hero").setAttribute("aria-expanded", "false");
    /* si quedó desplazada, vuelve al inicio para que la portada calce */
    project.querySelector(".strip").scrollLeft = 0;
  }

  function toggleProject(project) {
    var wasOpen = project.classList.contains("is-open");

    document.querySelectorAll(".project.is-open").forEach(closeProject);

    if (wasOpen) return;

    project.classList.add("is-open");
    project.querySelector(".box-hero").setAttribute("aria-expanded", "true");

    /* al cerrarse otro proyecto la página se corre, así que reencuadramos */
    requestAnimationFrame(function () {
      var nav = document.querySelector(".nav");
      var offset = (nav ? nav.offsetHeight : 0) + 20;
      var top = project.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  }

  document.querySelectorAll(".project").forEach(function (project) {
    project.querySelector(".box-hero").addEventListener("click", function () {
      toggleProject(project);
    });
    /* el nombre y la ficha también abren, no sólo la imagen */
    project.querySelector(".box-meta").addEventListener("click", function () {
      toggleProject(project);
    });
  });

  /* ---- conjuntos que se hojean sin salir de la tira ---- */
  document.querySelectorAll(".box-set").forEach(function (caja) {
    var fotos = caja.querySelectorAll(".set-frame img");
    var cuenta = caja.querySelector(".set-count");
    var pie = caja.querySelector(".set-cap");
    var total = fotos.length;
    var i = 0;

    function mostrar(n) {
      i = (n + total) % total;
      fotos.forEach(function (f, k) { f.classList.toggle("is-on", k === i); });
      if (cuenta) cuenta.textContent = ("0" + (i + 1)).slice(-2) + " / " + ("0" + total).slice(-2);
      if (pie) {
        pie.querySelectorAll("span").forEach(function (s, k) {
          s.hidden = Math.floor(k / 2) !== i;
        });
      }
    }

    /* un clic en la imagen avanza; las flechas permiten volver */
    caja.querySelector(".set-frame").addEventListener("click", function () { mostrar(i + 1); });
    var prev = caja.querySelector(".set-prev");
    var next = caja.querySelector(".set-next");
    if (prev) prev.addEventListener("click", function (e) { e.stopPropagation(); mostrar(i - 1); });
    if (next) next.addEventListener("click", function (e) { e.stopPropagation(); mostrar(i + 1); });

    mostrar(0);
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

    /* si venia de arrastrar, el clic no debe activar nada de adentro */
    strip.addEventListener("click", function (e) {
      if (moved > 4) {
        e.preventDefault();
        e.stopPropagation();
        moved = 0;
      }
    }, true);
  });
})();
