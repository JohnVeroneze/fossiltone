/* Fossil Tone — interações da landing (depende do base.js) */
(function () {
  "use strict";

  var FT = window.FT;
  var t = FT.t, fmt = FT.fmt, onLang = FT.onLang, WA = FT.wa, reduceMotion = FT.reduceMotion;
  var sendContact = FT.sendContact, whatsappDigits = FT.whatsappDigits, checkFields = FT.checkFields, formStatus = FT.formStatus;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  // gerador pseudoaleatório com semente: o solo e o magma saem sempre iguais
  function seeded(seed) {
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      var x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- medidor de profundidade ---------- */

  var strata = [
    ["topo", 0, "depth.surface"],
    ["sobre", 12, "depth.pleistocene"],
    ["colecao", 340, "depth.miocene"],
    ["laboratorio", 1450, "depth.jurassic"],
    ["orcamento", 2100, "depth.triassic"],
    ["manutencao", 2900, "depth.permian"],
    ["contato", 6000, "depth.magma"]
  ];
  var topbar = document.getElementById("topbar");
  var depthPeriod = document.getElementById("depth-period");
  var depthValue = document.getElementById("depth-value");
  var anchors = [], depthKey = "depth.surface", depthNow = 0, depthFrame = 0, layerNow = 0;

  var core = document.getElementById("core");

  function measureStrata() {
    var lead = window.innerHeight * 0.35;
    sizeCore();
    anchors = strata.map(function (s, i) {
      if (i === 0) return 0;
      return Math.max(0, document.getElementById(s[0]).getBoundingClientRect().top + window.scrollY - lead);
    });
    updateDepth();
  }

  function updateDepth() {
    depthFrame = 0;
    var y = window.scrollY, i = 0;
    while (i < anchors.length - 1 && anchors[i + 1] <= y) i++;
    var d = strata[i][1];
    if (i < anchors.length - 1) {
      var f = (y - anchors[i]) / Math.max(1, anchors[i + 1] - anchors[i]);
      d += (strata[i + 1][1] - strata[i][1]) * Math.max(0, Math.min(1, f));
    }
    depthKey = strata[i][2];
    depthNow = Math.round(d);
    if (i !== layerNow) { layerNow = i; markLayer(); }
    renderDepth();
    var docH = document.documentElement.scrollHeight;
    var max = docH - window.innerHeight;
    var p = max > 0 ? Math.min(1, y / max) : 0;
    topbar.style.setProperty("--dig-r", ((1 - p) * 100).toFixed(2) + "%");
    if (core) core.style.setProperty("--p", Math.min(1, (y + window.innerHeight * 0.35) / docH).toFixed(4));
  }

  // cada camada da coluna tem a altura proporcional à seção
  function sizeCore() {
    if (!core) return;
    var docH = document.documentElement.scrollHeight;
    var tops = strata.map(function (s) { return document.getElementById(s[0]).getBoundingClientRect().top + window.scrollY; });
    core.querySelectorAll("li").forEach(function (li, i) {
      var end = i < tops.length - 1 ? tops[i + 1] : docH;
      li.style.setProperty("--h", Math.max(1, Math.round(end - tops[i])));
    });
  }

  function renderDepth() {
    depthPeriod.textContent = t(depthKey);
    depthValue.textContent = (depthNow > 0 ? "−" : "") + fmt(depthNow) + " m";
  }

  window.addEventListener("scroll", function () {
    if (!depthFrame) depthFrame = requestAnimationFrame(updateDepth);
  }, { passive: true });
  onLang(renderDepth);

  /* ---------- mapa de camadas (menu do celular e do tablet) ---------- */

  var depthBtn = document.getElementById("depth-btn");
  var strataMenu = document.getElementById("strata-menu");
  var menuLinks = strataMenu.querySelectorAll("a");
  var compact = window.matchMedia("(max-width: 860px)");

  var coreLinks = core ? core.querySelectorAll("a") : [];
  function markLayer() {
    [menuLinks, coreLinks].forEach(function (list) {
      list.forEach(function (a, i) {
        if (i === layerNow) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
      });
    });
  }

  function renderMenu() {
    document.querySelectorAll("[data-depth]").forEach(function (el) {
      var n = Number(el.dataset.depth);
      el.textContent = (n > 0 ? "\u2212" : "") + fmt(n) + " m";
    });
    depthBtn.setAttribute("aria-label", t(strataMenu.hidden ? "menu.open" : "menu.close"));
  }

  function setMenu(open, returnFocus) {
    strataMenu.hidden = !open;
    depthBtn.setAttribute("aria-expanded", String(open));
    depthBtn.setAttribute("aria-label", t(open ? "menu.close" : "menu.open"));
    if (open) {
      var current = strataMenu.querySelector("[aria-current]") || menuLinks[0];
      current.focus({ preventScroll: true });
    } else if (returnFocus) {
      depthBtn.focus({ preventScroll: true });
    }
  }

  // no desktop o medidor é só informação: sai da ordem de foco e da leitura
  function syncCompact() {
    depthBtn.tabIndex = compact.matches ? 0 : -1;
    if (compact.matches) depthBtn.removeAttribute("aria-hidden"); else depthBtn.setAttribute("aria-hidden", "true");
    if (!compact.matches && !strataMenu.hidden) setMenu(false);
  }

  depthBtn.addEventListener("click", function () {
    if (compact.matches) setMenu(strataMenu.hidden);
  });
  menuLinks.forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !strataMenu.hidden) setMenu(false, true);
  });
  document.addEventListener("click", function (e) {
    if (!strataMenu.hidden && !strataMenu.contains(e.target) && !depthBtn.contains(e.target)) setMenu(false);
  });
  if (compact.addEventListener) compact.addEventListener("change", syncCompact); else compact.addListener(syncCompact);
  syncCompact();
  markLayer();
  onLang(renderMenu);

  /* ---------- âmbar que reage ao ponteiro ---------- */

  var stone = document.querySelector(".amber__stone");
  var hero = document.querySelector(".hero");
  if (stone && !reduceMotion && finePointer) {
    var tiltFrame = 0;
    hero.addEventListener("pointermove", function (e) {
      if (tiltFrame) return;
      tiltFrame = requestAnimationFrame(function () {
        tiltFrame = 0;
        var r = stone.getBoundingClientRect();
        var nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / r.width));
        var ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / r.height));
        stone.style.setProperty("--rx", (nx * 9).toFixed(2) + "deg");
        stone.style.setProperty("--ry", (-ny * 9).toFixed(2) + "deg");
        stone.style.setProperty("--px", (-nx * 12).toFixed(1) + "px");
        stone.style.setProperty("--py", (-ny * 12).toFixed(1) + "px");
        stone.style.setProperty("--gx", (32 + nx * 28).toFixed(1) + "%");
        stone.style.setProperty("--gy", (18 + ny * 24).toFixed(1) + "%");
      });
    });
    hero.addEventListener("pointerleave", function () {
      ["--rx", "--ry", "--px", "--py", "--gx", "--gy"].forEach(function (p) { stone.style.removeProperty(p); });
    });
  }

  /* ---------- easter egg: cinco toques no âmbar ---------- */

  var amberFig = document.getElementById("amber");
  var taps = 0, tapTimer = 0, broken = false;
  document.querySelectorAll(".amber__cracks .crack").forEach(function (c) { c.setAttribute("pathLength", "1"); });

  function releaseBubbles() {
    for (var i = 0; i < 9; i++) {
      var b = document.createElement("span");
      b.className = "free-bubble";
      b.style.setProperty("--x", (25 + Math.random() * 50).toFixed(1) + "%");
      b.style.setProperty("--s", (4 + Math.random() * 9).toFixed(1) + "px");
      b.style.setProperty("--dx", ((Math.random() - 0.5) * 90).toFixed(0) + "px");
      b.style.setProperty("--d", (1.6 + Math.random() * 1.4).toFixed(2) + "s");
      b.style.animationDelay = (i * 0.08).toFixed(2) + "s";
      b.addEventListener("animationend", function () { this.remove(); });
      amberFig.appendChild(b);
    }
  }

  function healAmber() {
    amberFig.classList.remove("is-broken", "is-tapped");
    broken = false;
    taps = 0;
  }

  function breakAmber() {
    broken = true;
    clearTimeout(tapTimer);
    amberFig.removeAttribute("data-taps");
    amberFig.classList.add("is-broken");
    if (!reduceMotion) releaseBubbles();
    setTimeout(healAmber, 8000);
  }

  stone.addEventListener("click", function () {
    if (broken) return;
    taps++;
    clearTimeout(tapTimer);
    // passou muito tempo entre um toque e outro: a pedra "esquece"
    tapTimer = setTimeout(function () { taps = 0; amberFig.removeAttribute("data-taps"); }, 2500);
    amberFig.classList.remove("is-tapped");
    void amberFig.offsetWidth;
    amberFig.classList.add("is-tapped");
    if (taps < 5) amberFig.setAttribute("data-taps", String(taps));
    else breakAmber();
  });

  /* ---------- galeria do Megalodon ----------
     Começa com as fotos escritas no HTML; quando o acervo carrega, o acervo.js
     troca pela lista do painel (FT.setGallery). */

  var gallery = document.querySelector(".gallery");
  var mainBox = document.querySelector(".gallery__main");
  var thumbsBox = document.querySelector(".gallery__thumbs");
  var GALLERY_SIZES = "(min-width: 861px) 540px, (min-width: 700px) 46vw, calc(100vw - 32px)";
  // cada foto: { arquivos: { grande, media, mini }, alt: () => texto no idioma atual }
  var galleryItems = Array.prototype.map.call(thumbsBox.querySelectorAll("button"), function (btn) {
    var b = "assets/img/" + btn.dataset.photo;
    var key = btn.dataset.altKey;
    return { arquivos: { grande: b + "-1200.jpg", media: b + "-800.jpg", mini: b + "-thumb.jpg" }, alt: function () { return t(key); } };
  });
  var galleryNow = 0;

  function showPhoto(i) {
    var item = galleryItems[i];
    var pic = item && FT.picture(item.arquivos, item.alt(), "full", GALLERY_SIZES);
    if (!pic) return;
    var img = pic.querySelector("img");
    img.id = "gallery-main";
    img.width = 800; img.height = 1200;
    var old = mainBox.querySelector("picture");
    if (old) mainBox.replaceChild(pic, old); else mainBox.appendChild(pic);
    return img;
  }

  function markThumbs() {
    thumbsBox.querySelectorAll("button").forEach(function (b, i) {
      b.setAttribute("aria-pressed", String(i === galleryNow));
      b.setAttribute("aria-label", galleryItems[i].alt());
    });
  }

  function pickPhoto(i) {
    if (i === galleryNow) return;
    galleryNow = i;
    markThumbs();
    var current = mainBox.querySelector("img");
    if (reduceMotion) { showPhoto(i); return; }
    if (document.startViewTransition) {
      document.startViewTransition(function () {
        var img = showPhoto(i);
        return img && img.decode ? img.decode().catch(function () {}) : null;
      });
      return;
    }
    if (current) current.classList.add("is-swapping");
    setTimeout(function () { showPhoto(i); }, 200);
  }

  function renderThumbs() {
    thumbsBox.innerHTML = "";
    galleryItems.forEach(function (item, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      var pic = FT.picture(item.arquivos, "", "mini");
      if (pic) {
        var img = pic.querySelector("img");
        img.width = 240; img.height = 360; img.loading = "lazy";
        btn.appendChild(pic);
      }
      btn.addEventListener("click", function () { pickPhoto(i); });
      thumbsBox.appendChild(btn);
    });
    // uma foto só: as miniaturas somem
    thumbsBox.hidden = galleryItems.length < 2;
    markThumbs();
  }

  if (gallery) {
    thumbsBox.querySelectorAll("button").forEach(function (btn, i) {
      btn.addEventListener("click", function () { pickPhoto(i); });
    });
    markThumbs();
    onLang(function () {
      var img = mainBox.querySelector("img");
      if (img && galleryItems[galleryNow]) img.alt = galleryItems[galleryNow].alt();
      markThumbs();
    });
  }

  // fotos vindas do painel: [{ arquivos, alt: { pt, en } }]
  FT.setGallery = function (fotos) {
    if (!gallery || !fotos || !fotos.length) return;
    var firstBefore = galleryItems[0] && galleryItems[0].arquivos.media;
    galleryItems = fotos.map(function (f) { return { arquivos: f.arquivos, alt: function () { return FT.tx(f.alt) || "Megalodon"; } }; });
    galleryNow = 0;
    renderThumbs();
    if (galleryItems[0].arquivos.media !== firstBefore) showPhoto(0);
  };

  /* ---------- knobs ---------- */

  var currentKnob = "stage2";
  var knobDesc = document.getElementById("knob-desc");
  var rot = { level: 0, sustain: 0, hicut: 0, stage2: 0 };   // todos no centro, como no dossiê

  function showKnob(name) {
    currentKnob = name;
    knobDesc.innerHTML = t("knob." + name);
  }

  document.querySelectorAll(".knob").forEach(function (k) {
    var name = k.dataset.knob;
    k.style.setProperty("--rot", rot[name] + "deg");
    k.addEventListener("click", function () {
      // cada clique gira mais um pouco; passou do fim, volta pro começo
      rot[name] = rot[name] + 45 > 135 ? -135 : rot[name] + 45;
      k.style.setProperty("--rot", rot[name] + "deg");
      k.parentNode.querySelectorAll(".knob").forEach(function (o) { o.setAttribute("aria-pressed", String(o === k)); });
      showKnob(name);
    });
  });
  onLang(function () { showKnob(currentKnob); });

  /* ---------- crie sua espécie ---------- */

  var form = document.getElementById("species-form");
  var sendLink = document.getElementById("send-wa");
  var sendBtn = document.getElementById("send-form");
  var formStatusEl = document.getElementById("form-status");
  var formSent = false;
  var catalogNo = "FT-" + String(100 + Math.floor(Math.random() * 900));
  var wasReady = false;

  function stemOf(name) {
    var first = (name || "").trim().split(/\s+/)[0] || "";
    first = first.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z]/g, "").toLowerCase();
    if (!first) return "";
    return first.charAt(0).toUpperCase() + first.slice(1);
  }

  function readForm() {
    var fd = new FormData(form);
    return {
      type: fd.get("type"),
      instrument: fd.get("instrument"),
      custom: fd.getAll("custom"),
      ref: (fd.get("ref") || "").trim(),
      details: (fd.get("details") || "").trim(),
      name: (fd.get("name") || "").trim(),
      whatsapp: (fd.get("whatsapp") || "").trim(),
      email: (fd.get("email") || "").trim()
    };
  }

  function scientificName(d) {
    var stem = stemOf(d.name) || "Novo";
    var genus = stem + (d.type === "amp" ? "therium" : "saurus");
    var art = d.custom.indexOf("art") > -1, mods = d.custom.indexOf("mods") > -1;
    var epithet = art && mods ? "monstruosus" : art ? "pictus" : mods ? "mutatus" : d.instrument === "bass" ? "gravis" : "classicus";
    return genus + " " + epithet;
  }

  function customLabel(d) {
    if (!d.custom.length) return t("form.none");
    return d.custom.map(function (c) { return t(c === "art" ? "form.art" : "form.mods"); }).join(", ");
  }

  function waMessage(d) {
    var lines = [
      t("wa.hello"),
      "",
      t("wa.card") + " " + catalogNo + ": " + scientificName(d),
      t("wa.type") + ": " + t(d.type === "amp" ? "form.amp" : "form.pedal"),
      t("wa.instrument") + ": " + t(d.instrument === "bass" ? "form.bass" : "form.guitar"),
      t("wa.custom") + ": " + customLabel(d)
    ];
    if (d.ref) lines.push(t("wa.ref") + ": " + d.ref);
    if (d.details) lines.push(t("wa.details") + ": " + d.details);
    if (d.name) lines.push("", t("wa.name") + ": " + d.name);
    if (d.email) lines.push(t("form.email") + ": " + d.email);
    return lines.join("\n");
  }

  function updateCard() {
    var d = readForm();
    document.getElementById("nc-num").textContent = catalogNo;
    document.getElementById("nc-sci").textContent = scientificName(d);
    document.getElementById("nc-class").textContent = t(d.type === "amp" ? "form.amp" : "form.pedal");
    document.getElementById("nc-inst").textContent = t(d.instrument === "bass" ? "form.bass" : "form.guitar");
    document.getElementById("nc-ref").textContent = d.ref || "—";
    document.getElementById("nc-mut").textContent = customLabel(d);
    document.getElementById("nc-name").textContent = d.name || "—";
    var plate = document.getElementById("plate");
    plate.classList.toggle("is-amp", d.type === "amp");
    plate.classList.toggle("has-art", d.custom.indexOf("art") > -1);
    plate.classList.toggle("has-mods", d.custom.indexOf("mods") > -1);

    // a ficha é carimbada quando tem nome e referência
    var ready = !!(d.name && d.ref);
    var stamp = document.getElementById("nc-stamp");
    stamp.textContent = t(formSent ? "form.stampSent" : ready ? "form.stampReady" : "form.stampDraft");
    if (ready && !wasReady) { stamp.classList.remove("is-ready"); void stamp.offsetWidth; }
    stamp.classList.toggle("is-ready", ready);
    wasReady = ready;

    sendLink.href = WA + "?text=" + encodeURIComponent(waMessage(d));
  }

  function resetSent() {
    if (!formSent) return;
    formSent = false;
    sendBtn.textContent = t("form.send");
  }

  form.addEventListener("input", function () { resetSent(); formStatus(formStatusEl, ""); updateCard(); });
  form.addEventListener("change", updateCard);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (sendBtn.disabled) return;
    var d = readForm();
    var waNum = whatsappDigits(d.whatsapp);
    var problem = checkFields([
      [form.elements.name, function () { return d.name.length >= 2; }, "form.invalidName"],
      [form.elements.ref, function () { return d.ref.length >= 2; }, "form.invalidRef"],
      [form.elements.whatsapp, function () { return !!waNum; }, "form.invalidWa"],
      [form.elements.email, function () { return FT.emailOk(d.email); }, "form.invalidEmail"]
    ]);
    if (problem) { formStatus(formStatusEl, problem, true); return; }
    if (form.elements.site.value) { formStatus(formStatusEl, "form.done"); return; }   // robô

    sendBtn.disabled = true;
    formStatus(formStatusEl, "form.sending");
    sendContact({
      tipo: "especie",
      nome: d.name,
      email: d.email,
      whatsapp: waNum,
      produto: d.type === "amp" ? "amplificador" : "pedal",
      mensagem: d.details || null,
      dados: {
        ficha: catalogNo,
        nomeCientifico: scientificName(d),
        tipo: d.type === "amp" ? "amplificador" : "pedal",
        instrumento: d.instrument === "bass" ? "baixo" : "guitarra",
        personalizar: d.custom.map(function (c) { return c === "art" ? "arte" : "mods"; }),
        referencia: d.ref
      }
    }).then(function (res) {
      if (res === "limite") { formStatus(formStatusEl, "form.tooMany", true); return; }
      formSent = true;
      updateCard();
      formStatus(formStatusEl, "form.done");
      // a próxima ficha ganha outro número
      catalogNo = "FT-" + String(100 + Math.floor(Math.random() * 900));
      sendBtn.textContent = t("form.again");
    }).catch(function () {
      formStatus(formStatusEl, "form.error", true, waMessage(d));
    }).then(function () { sendBtn.disabled = false; });
  });
  onLang(function () { updateCard(); if (formSent) sendBtn.textContent = t("form.again"); });

  // "Encomendar um Megalodon" já preenche o formulário
  document.querySelectorAll("[data-preset]").forEach(function (a) {
    a.addEventListener("click", function () {
      form.querySelector("input[name='type'][value='" + a.dataset.preset + "']").checked = true;
      var ref = document.getElementById("f-ref");
      if (!ref.value) ref.value = "Megalodon";
      updateCard();
    });
  });



  /* ---------- laboratório: as barras do monitor enchem quando ele aparece ---------- */

  var monitor = document.querySelector(".monitor");
  // cada barra vira 12 células do mesmo tamanho; acesas = --fill do passo (1, 1, .6, 0)
  if (monitor) {
    monitor.querySelectorAll(".steps li").forEach(function (li) {
      var bar = li.querySelector(".steps__bar");
      var on = Math.round((parseFloat(getComputedStyle(li).getPropertyValue("--fill")) || 0) * 12);
      for (var c = 0; c < 12; c++) {
        var cell = document.createElement("i");
        if (c < on) cell.className = "on";
        cell.style.setProperty("--c", c);
        bar.appendChild(cell);
      }
    });
  }
  if (monitor && !reduceMotion) {
    monitor.classList.add("is-idle");
    var monitorFrame = 0;
    var checkMonitor = function () {
      monitorFrame = 0;
      var r = monitor.getBoundingClientRect();
      // metade de cima do monitor dentro da tela: as barras começam a encher
      if (r.top < window.innerHeight * 0.75 && r.bottom > window.innerHeight * 0.25) {
        monitor.classList.remove("is-idle");
        monitor.classList.add("is-run");
        window.removeEventListener("scroll", onMonitorScroll);
      }
    };
    var onMonitorScroll = function () { if (!monitorFrame) monitorFrame = requestAnimationFrame(checkMonitor); };
    window.addEventListener("scroll", onMonitorScroll, { passive: true });
    checkMonitor();
  }

  var labWa = document.getElementById("lab-wa");
  onLang(function () { labWa.href = WA + "?text=" + encodeURIComponent(t("lab.ctaMsg")); });

  /* ---------- câmara de magma ---------- */

  var contact = document.getElementById("contato");
  var tempEl = document.getElementById("magma-temp");
  var tempStatus = document.getElementById("magma-status");
  var tempNow = 20, tempKey = "contact.cold", heated = false;
  // economia de dados ligada: o magma fica parado, sem animação
  var saveData = !!(navigator.connection && navigator.connection.saveData) ||
    window.matchMedia("(prefers-reduced-data: reduce)").matches;
  var stillMagma = reduceMotion || saveData;

  function renderThermo() {
    tempEl.textContent = fmt(tempNow);
    tempStatus.textContent = t(tempKey);
  }
  onLang(renderThermo);

  function createMagma(canvas) {
    var api = { build: function () {}, refresh: function () {}, heat: function () {}, visible: function () {} };
    var ctx = canvas.getContext("2d");
    if (!ctx) return api;

    var css = getComputedStyle(document.documentElement);
    function hex(name, fallback) {
      var v = (css.getPropertyValue(name) || "").trim().replace("#", "");
      if (v.length !== 6) v = fallback.replace("#", "");
      return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
    }
    var EMBER = hex("--ember", "#D4401C"), AMBER = hex("--amber", "#F29F0D"), HONEY = hex("--honey", "#FFD54A");
    function mix(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
    function ramp(v) { return v < 0.55 ? mix(EMBER, AMBER, v / 0.55) : mix(AMBER, HONEY, (v - 0.55) / 0.45); }

    var baseC = document.createElement("canvas"), hotC = document.createElement("canvas");
    var fullC = document.createElement("canvas"), spotC = document.createElement("canvas");
    var W = 0, H = 0, ratio = 1, cssW = 0, cssH = 0, built = false;
    var warm = stillMagma ? 1 : 0, warmTarget = warm, running = false, onScreen = false, raf = 0;
    var lastDraw = 0, lastActive = 0;
    var px = 0, py = 0, spot = 0, spotTarget = 0, spotTimer = 0, t0 = performance.now();

    // placas de basalto com rachaduras incandescentes; quanto mais fundo, mais quente
    function build() {
      var r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      if (built && Math.abs(r.width - cssW) < 2 && Math.abs(r.height - cssH) < 24) return;
      cssW = r.width; cssH = r.height;
      // no celular a lava é borrada de propósito: 1x basta e poupa a placa de vídeo
      ratio = cssW < 700 ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
      W = Math.round(cssW * ratio); H = Math.round(cssH * ratio);
      canvas.width = W; canvas.height = H;

      var fw = Math.max(2, Math.round(cssW * 0.6)), fh = Math.max(2, Math.round(cssH * 0.6));
      var cell = (cssW < 700 ? 84 : 120) * 0.6;
      var cols = Math.ceil(fw / cell) + 2, rows = Math.ceil(fh / cell) + 2, count = cols * rows;
      var rnd = seeded(11);
      var sx = new Float32Array(count), sy = new Float32Array(count), sv = new Float32Array(count);
      for (var j = 0; j < rows; j++) {
        for (var i = 0; i < cols; i++) {
          var k = j * cols + i;
          sx[k] = (i - 1 + 0.12 + rnd() * 0.76) * cell;
          sy[k] = (j - 1 + 0.12 + rnd() * 0.76) * cell;
          sv[k] = rnd();
        }
      }
      // ruído suave: umas rachaduras mais vivas, outras quase apagadas
      var nStep = cell * 2.2, ncols = Math.ceil(fw / nStep) + 2, nrows = Math.ceil(fh / nStep) + 2;
      var nv = new Float32Array(ncols * nrows);
      for (var q = 0; q < nv.length; q++) nv[q] = rnd();
      function noise(nx, ny) {
        var gx = nx / nStep, gy = ny / nStep, ix = Math.floor(gx), iy = Math.floor(gy);
        var tx = gx - ix, ty = gy - iy;
        tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);
        var o = iy * ncols + ix, a = nv[o], b = nv[o + 1], c0 = nv[o + ncols], d0 = nv[o + ncols + 1];
        return a + (b - a) * tx + (c0 - a) * ty + (a - b - c0 + d0) * tx * ty;
      }
      var base = new ImageData(fw, fh), hot = new ImageData(fw, fh), full = new ImageData(fw, fh);
      var bd = base.data, hd = hot.data, fd = full.data;
      for (var y = 0; y < fh; y++) {
        var depth = y / (fh - 1);
        var heat = Math.pow(Math.max(0, (depth - 0.3) / 0.7), 1.6);
        var core = 0.02 + 0.07 * heat * heat, halo = 0.07 + 0.3 * heat;
        var cj = Math.floor(y / cell) + 1;
        for (var x = 0; x < fw; x++) {
          var ci = Math.floor(x / cell) + 1, d1 = 1e12, d2 = 1e12, n1 = 0;
          for (var dj = -1; dj <= 1; dj++) {
            var row = (cj + dj) * cols;
            for (var di = -1; di <= 1; di++) {
              var kk = row + ci + di, dx = sx[kk] - x, dy = sy[kk] - y, dd = dx * dx + dy * dy;
              if (dd < d1) { d2 = d1; d1 = dd; n1 = kk; } else if (dd < d2) { d2 = dd; }
            }
          }
          var e = (Math.sqrt(d2) - Math.sqrt(d1)) / cell;
          var m = noise(x, y), wv = noise(fw - x, y);
          var cw = core * (0.45 + 1.1 * wv);
          var c = e < cw ? 1 : Math.max(0, 1 - (e - cw) / (halo * (0.6 + 0.8 * wv)));
          c *= c * (0.25 + 0.75 * m);
          var p = (y * fw + x) * 4;
          var v = 16 + sv[n1] * 12 + (rnd() - 0.5) * 6;
          var faint = c * (0.06 + 0.35 * heat);
          bd[p] = v + 8 + faint * 150; bd[p + 1] = v * 0.45 + faint * 50; bd[p + 2] = v * 0.22 + faint * 12; bd[p + 3] = 255;
          var glow = Math.min(1, c * (0.12 + 1.0 * heat) + heat * heat * 0.16);
          var col = ramp(Math.min(1, c * (0.45 + 0.6 * heat)));
          hd[p] = col[0]; hd[p + 1] = col[1]; hd[p + 2] = col[2]; hd[p + 3] = glow * 255;
          var col2 = ramp(c * 0.8);
          fd[p] = col2[0]; fd[p + 1] = col2[1]; fd[p + 2] = col2[2]; fd[p + 3] = c * 255;
        }
      }
      [baseC, hotC, fullC, spotC].forEach(function (cv) { cv.width = fw; cv.height = fh; });
      baseC.getContext("2d").putImageData(base, 0, 0);
      hotC.getContext("2d").putImageData(hot, 0, 0);
      fullC.getContext("2d").putImageData(full, 0, 0);
      built = true;
      draw(performance.now());
      if (onScreen) start();
    }

    function draw(now) {
      if (!built) return;
      var time = (now - t0) / 1000;
      warm += (warmTarget - warm) * 0.03;
      spot += (spotTarget - spot) * 0.1;

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.drawImage(baseC, 0, 0, W, H);

      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = Math.min(1, (0.22 + 0.78 * warm) * (0.88 + 0.12 * Math.sin(time * 0.9)));
      ctx.drawImage(hotC, 0, 0, W, H);

      // correntes lentas no fundo da câmara
      if (warm > 0.02) {
        var rad = Math.min(W * 0.45, H * 0.35);
        for (var i = 0; i < 3; i++) {
          var bx = (0.18 + 0.32 * i + 0.07 * Math.sin(time * (0.19 + i * 0.06) + i * 2.1)) * W;
          var by = H - rad * (0.25 + 0.12 * Math.sin(time * (0.15 + i * 0.05) + i));
          var g = ctx.createRadialGradient(bx, by, 0, bx, by, rad);
          g.addColorStop(0, "rgba(242, 120, 20, .5)");
          g.addColorStop(1, "rgba(212, 64, 28, 0)");
          ctx.globalAlpha = 0.55 * warm;
          ctx.fillStyle = g;
          ctx.fillRect(bx - rad, by - rad, rad * 2, rad * 2);
        }
      }

      // a crosta esquenta onde o ponteiro passa
      if (spot > 0.02) {
        var sc = spotC.getContext("2d"), k = baseC.width / W;
        var fx = px * k, fy = py * k, fr = 170 * ratio * k;
        sc.globalCompositeOperation = "source-over";
        sc.clearRect(0, 0, spotC.width, spotC.height);
        var sg = sc.createRadialGradient(fx, fy, 0, fx, fy, fr);
        sg.addColorStop(0, "rgba(0, 0, 0, 1)");
        sg.addColorStop(1, "rgba(0, 0, 0, 0)");
        sc.fillStyle = sg;
        sc.fillRect(fx - fr, fy - fr, fr * 2, fr * 2);
        sc.globalCompositeOperation = "source-in";
        sc.drawImage(fullC, 0, 0);
        ctx.globalAlpha = spot;
        ctx.drawImage(spotC, 0, 0, W, H);
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    }

    // 30 quadros por segundo; pausa depois de 7 s sem ninguém mexer
    function frame(now) {
      if (now - lastDraw >= 32) { draw(now); lastDraw = now; }
      var settled = Math.abs(warmTarget - warm) < 0.01 && Math.abs(spotTarget - spot) < 0.01;
      if (settled && spotTarget === 0 && now - lastActive > 7000) { running = false; return; }
      if (running) raf = requestAnimationFrame(frame);
    }
    function start() {
      if (running || stillMagma || !built) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }
    function poke() {
      lastActive = performance.now();
      if (onScreen) start();
    }
    window.addEventListener("scroll", function () { if (onScreen) poke(); }, { passive: true });
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }
    function setPointer(e) {
      var r = canvas.getBoundingClientRect();
      px = (e.clientX - r.left) * ratio;
      py = (e.clientY - r.top) * ratio;
    }

    contact.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      setPointer(e);
      spotTarget = 1;
      poke();
    });
    contact.addEventListener("pointerleave", function () { spotTarget = 0; });
    contact.addEventListener("pointerdown", function (e) {
      setPointer(e);
      spotTarget = 1;
      poke();
      clearTimeout(spotTimer);
      if (e.pointerType !== "mouse") spotTimer = setTimeout(function () { spotTarget = 0; }, 900);
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else if (onScreen) start();
    });

    api.build = build;
    api.refresh = function () { if (built) build(); };
    api.heat = function () {
      warmTarget = 1;
      if (stillMagma) { warm = 1; draw(performance.now()); } else poke();
    };
    api.visible = function (v) {
      onScreen = v;
      if (v) poke(); else stop();
    };
    return api;
  }

  var magma = createMagma(document.getElementById("magma"));

  function heatUp() {
    if (heated) return;
    heated = true;
    magma.heat();
    tempKey = "contact.warming";
    renderThermo();
    var from = tempNow, to = 1180, dur = stillMagma ? 0 : 2600, startAt = performance.now();
    function step(now) {
      var p = dur ? Math.min(1, (now - startAt) / dur) : 1;
      tempNow = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) {
        tempEl.textContent = fmt(tempNow);
        requestAnimationFrame(step);
      } else {
        tempKey = "contact.ready";
        renderThermo();
        contact.classList.add("is-hot");
      }
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    // monta o magma um pouco antes de chegar, pra não travar a rolagem
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) magma.build(); });
    }, { rootMargin: "600px 0px" }).observe(contact);
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        magma.visible(en.isIntersecting);
        if (en.isIntersecting && en.intersectionRatio >= 0.25) heatUp();
      });
    }, { threshold: [0, 0.25] }).observe(contact);
  } else {
    magma.build();
    magma.visible(true);
    heatUp();
  }

  /* ---------- ponte para o acervo.js ---------- */

  // preenche o "Crie sua espécie" a partir do dossiê de uma peça
  FT.preset = function (type, ref) {
    var radio = form.querySelector("input[name='type'][value='" + type + "']");
    if (radio) radio.checked = true;
    if (ref) document.getElementById("f-ref").value = ref;
    updateCard();
  };
  FT.relayout = function () { measureStrata(); };

  /* ---------- início ---------- */

  FT.applyLang();
  measureStrata();

  function relayout() {
    measureStrata();
    magma.refresh();
  }
  window.addEventListener("load", relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  var resizeTimer = 0;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(relayout, 200);
  });
})();
