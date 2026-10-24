/* Fossil Tone — acervo: fichário, dossiê, ficha técnica, mídia e lista de espera.
   Tudo sai de data/catalogo.json e data/config.json. */
(function () {
  "use strict";

  var FT = window.FT;
  if (!FT) return;
  var t = FT.t;

  var pecas = [], byId = {}, config = {};
  var dossier = document.getElementById("dossier");
  var fichaDialog = document.getElementById("ficha-dialog");
  var track = document.getElementById("drawer-track");
  var svgCache = {};

  /* ---------- utilidades ---------- */

  // um campo pode ser texto puro ou { "pt": "...", "en": "..." }
  function tx(v) {
    if (v == null) return "";
    if (typeof v === "string" || Array.isArray(v)) return v;
    return v[FT.lang()] || v.pt || "";
  }

  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var val = attrs[k];
        if (val == null || val === false) return;
        if (k === "class") el.className = val;
        else if (k === "text") el.textContent = val;
        else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), val);
        else el.setAttribute(k, val === true ? "" : val);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null || c === false) return;
      el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return el;
  }

  function fromMarkup(markup) {
    var tpl = document.createElement("template");
    tpl.innerHTML = markup.trim();
    return tpl.content.firstElementChild;
  }

  function getJSON(url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(url + " " + r.status);
      return r.json();
    });
  }

  function isMixedCase(name) { return /[a-z]/.test(name) && /[A-Z].*[A-Z]/.test(name); }

  // "megalodon-angle" vira as versões -card, -800 e -1200; um caminho com extensão é usado como está
  function photo(p, variant) {
    if (!p.foto) return null;
    var alt = tx(p.fotoAlt) || p.nome;
    if (/\.(jpe?g|png|webp|avif)$/i.test(p.foto)) {
      return h("img", { src: p.foto, alt: alt, loading: "lazy", decoding: "async" });
    }
    var base = "assets/img/" + p.foto;
    if (variant === "card") {
      return h("picture", null, [
        h("source", { type: "image/avif", srcset: base + "-card.avif" }),
        h("img", { src: base + "-card.jpg", alt: alt, width: "560", height: "420", loading: "lazy", decoding: "async" })
      ]);
    }
    var sizes = "(min-width: 721px) 440px, calc(100vw - 4rem)";
    return h("picture", null, [
      h("source", { type: "image/avif", srcset: base + "-800.avif 800w, " + base + "-1200.avif 1200w", sizes: sizes }),
      h("img", { src: base + "-800.jpg", srcset: base + "-800.jpg 800w, " + base + "-1200.jpg 1200w", sizes: sizes, alt: alt, decoding: "async" })
    ]);
  }

  // peça sem foto: a silhueta enterrada, como na exposição do Kraken
  function silhouette(p) {
    var svg = fromMarkup(
      '<svg viewBox="0 -40 400 300" preserveAspectRatio="xMidYMid slice" role="img">' +
      '<g fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round">' +
      '<path d="M140 52 v-16 q0-10 10-10 h100 q10 0 10 10 v16"/><rect x="30" y="52" width="340" height="176" rx="14"/>' +
      '<rect x="150" y="104" width="100" height="26" rx="3"/><line x1="46" y1="180" x2="354" y2="180"/>' +
      '<circle cx="80" cy="204" r="9"/><circle cx="122" cy="204" r="9"/><circle cx="164" cy="204" r="9"/><circle cx="206" cy="204" r="9"/></g>' +
      '<path fill="#7A4A22" d="M0 150 C60 138 110 162 170 150 S290 132 400 148 V270 H0Z"/>' +
      '<path fill="#5E3519" d="M0 186 C80 176 140 200 220 188 S330 174 400 186 V270 H0Z"/>' +
      '<path fill="#44240F" d="M0 220 C70 212 150 232 230 222 S340 210 400 220 V270 H0Z"/></svg>'
    );
    svg.setAttribute("aria-label", t("dossier.noPhoto", { name: p.nome }));
    return svg;
  }

  // selos da peça ("Pedal 100% analógico", "True bypass"…), no quadro da figura e na ficha técnica
  function selos(p, extraClass) {
    if (!p.selos || !p.selos.length) return null;
    return h("ul", { class: "selos " + extraClass, "aria-label": t("selos.aria") }, p.selos.map(function (s) { return h("li", { text: tx(s) }); }));
  }

  function stamp(p, extraClass) {
    var label = tx(p.carimbo);
    if (!label) return null;
    var wip = p.acao === "lista-de-espera";
    return h("span", { class: "stamp" + (wip ? " stamp--wip" : "") + (extraClass ? " " + extraClass : ""), text: label });
  }

  /* ---------- transições nativas entre a ficha e o dossiê ---------- */

  function transition(update, fromEl, name) {
    if (!document.startViewTransition || FT.reduceMotion) { update(); return; }
    if (fromEl) fromEl.style.viewTransitionName = name;
    var vt = document.startViewTransition(function () {
      if (fromEl) fromEl.style.viewTransitionName = "";
      update();
    });
    vt.finished.finally(function () {
      document.querySelectorAll("[data-vt]").forEach(function (el) {
        el.style.viewTransitionName = "";
        el.removeAttribute("data-vt");
      });
    });
  }

  function openSheet(dialog, viaTransition) {
    dialog.classList.toggle("vt", !!viaTransition);
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }

  function closeButton(dialog) {
    return h("button", {
      type: "button", class: "sheet__close", "aria-label": t("dossier.close"),
      onclick: function () { dialog.close(); }
    }, [fromMarkup('<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2 2 12"/></svg>')]);
  }

  [dossier, fichaDialog].forEach(function (d) {
    // toque no fundo escuro fecha a janela
    d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
    d.addEventListener("close", function () { stopAudio(); d.innerHTML = ""; d.removeAttribute("data-id"); d.removeAttribute("data-from"); });
  });
  // fechou o dossiê: a figura volta ao início (knobs zerados, pedal desligado) na próxima vez
  dossier.addEventListener("close", function () { figStates = {}; });

  /* ---------- figura interativa: o pedal desenhado no lugar da foto, com knobs e chave ao lado ---------- */

  // estado de cada figura enquanto o dossiê está aberto (sobrevive à troca de idioma, que refaz o dossiê)
  var figStates = {}, pageStates = {}, toastTimer = 0;
  // um valor por knob do painel (ZeRO tem 3, Megalodon tem 4): o "inicio" do catálogo, ou zero; começa mostrando o último
  function figState(id) {
    var knobs = byId[id] && byId[id].painel && byId[id].painel.knobs || [{}, {}, {}];
    var k = knobs.map(function (o) { return o.inicio || 0; });
    return figStates[id] || (figStates[id] = { k: k, mode: "SI", tilt: 0, on: false, sel: "k" + (k.length - 1), live: false });
  }
  function pageState(id) {
    return pageStates[id] || (pageStates[id] = { k: [0, 0, 0], mode: "SI", sel: "k2" });
  }

  // knob do desenho que cada knob do painel gira: "figuraKnob" no catálogo (o Kraken mostra 3 dos 6), senão a mesma posição
  function figKnob(p, i) {
    var k = p.painel && p.painel.knobs[i];
    return k && k.figuraKnob != null ? k.figuraKnob : i;
  }

  // conexão boa (e sem economia de dados): o pedal interativo já carrega; senão fica a imagem fixa até a pessoa mexer
  function goodConnection() {
    var c = navigator.connection;
    return !!c && !c.saveData && c.effectiveType === "4g";
  }

  var tiltIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 9.5A5.2 5.2 0 1 1 11.4 4"/><path d="M12.2 1.2v3.3H8.9"/></svg>';
  var playIcon16 = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 3.5v9l7-4.5z"/></svg>';
  var knobIcon = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17"/><line x1="20" y1="20" x2="20" y2="6"/></svg>';
  // chave Si/Ge vista de frente: alavanca afilada sobre uma cúpula de metal e a porca; ela tomba pro lado escolhido
  var switchIcon = '<svg viewBox="0 0 40 40" aria-hidden="true"><g transform="translate(20 22) scale(1.3) translate(-20 -22)">' +
    '<text class="chave__si" x="6" y="35">SI</text><text class="chave__ge" x="34" y="35">GE</text>' +
    '<g class="chave__lever"><path class="chave__bat" d="M18.8 31 18.1 14.4Q18.1 11.2 20 11.2T21.9 14.4L21.2 31Z"/>' +
    '<path class="chave__shine" d="M19.5 28.5 19.15 14.6Q19.2 12.9 20 12.4"/></g>' +
    '<path class="chave__dome" d="M13.4 31A6.6 6.6 0 0 1 26.6 31Z"/>' +
    '<rect class="chave__nut" x="11" y="31" width="18" height="4.8" rx="1.2"/><path class="chave__line" d="M17 31v4.8M23 31v4.8"/></g></svg>';

  // mensagens para a figura; enquanto ela não carregou, ficam na fila (e pedem para carregar)
  function sendFig(box, msg) {
    msg.ft = "zero-pagina";
    if (!box._ready) { (box._queue = box._queue || []).push(msg); wakeFigure(box); return; }
    var frame = box.querySelector(".figura__frame");
    if (frame && frame.contentWindow) frame.contentWindow.postMessage(msg, "*");
  }

  // troca a imagem fixa pelo pedal interativo (o iframe só entra na página aqui)
  function wakeFigure(box) {
    if (box.querySelector(".figura__frame")) return;
    var p = byId[box.getAttribute("data-fig")], s = figState(p.id);
    s.live = true;
    var kq = [];
    s.k.forEach(function (v, i) { kq[figKnob(p, i)] = v; });
    var q = "k=" + Array.from(kq, function (v) { return v == null ? "" : v; }).join(",") + "&mode=" + s.mode + (s.tilt ? "&tilt=1" : "") + (s.on ? "&on=1" : "");
    var wake = box.querySelector(".figura__wake");
    if (wake) { wake.disabled = true; wake.lastChild.textContent = t("fig.loading"); }
    var amp = p.tipo === "amplificador";
    var title = t(amp ? "fig.titleAmp" : p.painel && p.painel.chave ? "fig.title" : "fig.titleNoSwitch", { name: p.nome });
    box.insertBefore(h("iframe", { class: "figura__frame", src: p.figura + "?" + q, title: title }), box.firstChild.nextSibling);
  }

  // "figuraVirar": false no catálogo = figura sem o botão "Ver conexões" (o Megalodon já mostra os cabos em pé)
  function figureBox(p) {
    var s = figState(p.id), still = p.figuraEstatica, canTilt = p.figuraVirar !== false;
    var box = h("div", { class: "dossier__photo dossier__photo--figura" + (p.tipo === "amplificador" ? " dossier__photo--amp" : ""), "data-vt": "", "data-fig": p.id }, [
      still ? h("picture", { class: "figura__still" }, [
        h("source", { type: "image/avif", srcset: still + ".avif" }),
        h("img", { src: still + ".png", alt: t(p.tipo === "amplificador" ? "fig.stillAmp" : canTilt ? "fig.still" : "fig.stillUpright", { name: p.nome }), width: "900", height: "900", decoding: "async" })
      ]) : h("span", { class: "figura__still" }),
      canTilt ? h("button", {
        type: "button", class: "ficha-btn figura__tilt", "aria-pressed": String(!!s.tilt),
        onclick: function () { sendFig(box, { type: "tilt" }); }
      }, [h("i", { "aria-hidden": "true" }, [fromMarkup(tiltIcon)]), t("fig.tilt")]) : null,
      s.live || goodConnection() ? null : h("button", {
        type: "button", class: "ficha-btn figura__wake",
        onclick: function () { wakeFigure(box); }
      }, [h("i", { "aria-hidden": "true" }, [fromMarkup(playIcon16)]), h("span", { text: t(p.tipo === "amplificador" ? "fig.wakeAmp" : "fig.wake") })]),
      h("p", { class: "figura__toast", role: "status" }),
      selos(p, "selos--figura")
    ]);
    if (s.live || goodConnection()) wakeFigure(box);
    return box;
  }

  // knobs e chave Si/Ge, como os do Megalodon na coleção. No dossiê, cada clique gira o knob no desenho também (onChange)
  function knobPanel(p, s, extraClass, onChange) {
    var pn = p.painel, chave = pn.chave;
    var desc = h("p", { class: "knobs__desc", "aria-live": "polite" });
    var knobs = (pn.knobs || []).map(function (k, i) {
      return h("button", {
        type: "button", class: "knob",
        onclick: function () {
          s.k[i] = s.k[i] + 2 > 10 ? 0 : s.k[i] + 2;
          s.sel = "k" + i;
          if (onChange) onChange({ type: "knob", i: figKnob(p, i), v: s.k[i] });
          sync();
        }
      }, [fromMarkup(knobIcon), h("span", { text: k.nome })]);
    });
    var sw = chave ? h("button", {
      type: "button", class: "knob chave",
      onclick: function () {
        s.mode = s.mode === "SI" ? "GE" : "SI";
        s.sel = "mode";
        if (onChange) onChange({ type: "mode", mode: s.mode });
        sync();
      }
    }, [fromMarkup(switchIcon), h("span", { text: chave.nome })]) : null;
    var panel = h("div", { class: "knobs" + (extraClass ? " " + extraClass : "") }, [
      h("h4", { class: "knobs__title", text: t("knobs.title") }),
      h("div", { class: "knobs__row", role: "group", "aria-label": t("panel.aria", { name: p.nome }) }, knobs.concat([sw])),
      desc
    ]);
    function option() {
      return chave && chave.opcoes.filter(function (o) { return o.valor === s.mode; })[0];
    }
    function sync() {
      knobs.forEach(function (b, i) {
        b.style.setProperty("--rot", (-140 + 28 * s.k[i]) + "deg");   // 0 = 7 horas, 10 = 5 horas, como no pedal
        b.setAttribute("aria-pressed", String(s.sel === "k" + i));
        b.setAttribute("aria-label", pn.knobs[i].nome + " " + s.k[i] + "/10");
      });
      var o = option();
      if (sw) {
        sw.classList.toggle("is-ge", s.mode === "GE");
        sw.setAttribute("aria-pressed", String(s.sel === "mode"));
        sw.setAttribute("aria-label", chave.nome + ": " + (o ? o.nome : s.mode));
      }
      var item = s.sel === "mode" ? o : pn.knobs[Number(s.sel.slice(1))];
      desc.innerHTML = "";
      if (item) { desc.appendChild(h("b", { text: item.nome })); desc.appendChild(document.createTextNode(" " + tx(item.texto))); }
    }
    panel._sync = sync;
    sync();
    return panel;
  }

  // knobs das peças na própria página (o do ZeRO, no laboratório): <div data-painel="zero"></div>
  function renderPagePanels() {
    document.querySelectorAll("[data-painel]").forEach(function (slot) {
      var p = byId[slot.getAttribute("data-painel")];
      slot.innerHTML = "";
      if (p && p.painel) slot.appendChild(knobPanel(p, pageState(p.id), "knobs--case", null));
    });
  }

  function figToast(box, text) {
    var el = box.querySelector(".figura__toast");
    if (!el || !text) return;
    el.textContent = text;
    el.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("is-on"); }, 1800);
  }

  // a figura avisa quando carregou e quando algo muda nela (clique num knob, na chave, no footswitch, pedal virado)
  window.addEventListener("message", function (e) {
    var m = e.data;
    if (!m || m.ft !== "zero-figura" || !dossier.open) return;
    var box = dossier.querySelector(".dossier__photo--figura");
    var frame = box && box.querySelector(".figura__frame");
    if (!frame || e.source !== frame.contentWindow) return;
    var p = byId[box.getAttribute("data-fig")], s = figState(p.id);
    if (m.type === "ready" && !box._ready) {
      box._ready = true;
      box.classList.add("is-live");
      var wake = box.querySelector(".figura__wake");
      if (wake) wake.remove();
      (box._queue || []).splice(0).forEach(function (q) { frame.contentWindow.postMessage(q, "*"); });
      return;
    }
    if (Array.isArray(m.k)) s.k.forEach(function (v, i) { var x = m.k[figKnob(p, i)]; if (x != null) s.k[i] = Number(x); });
    if (m.mode === "SI" || m.mode === "GE") s.mode = m.mode;
    s.tilt = m.tilt ? 1 : 0;
    s.on = !!m.on;
    if (m.touched === "mode") s.sel = "mode";
    else if (/^k\d$/.test(m.touched || "")) s.k.forEach(function (v, i) { if ("k" + figKnob(p, i) === m.touched) s.sel = "k" + i; });
    var tilt = box.querySelector(".figura__tilt");
    if (tilt) tilt.setAttribute("aria-pressed", String(!!s.tilt));
    var panel = dossier.querySelector(".knobs--sheet");
    if (panel && panel._sync) panel._sync();
    if (m.type === "flash") figToast(box, t("fig." + m.key, m));   // m traz os valores do aviso ({jack}, {pct})
  });

  /* ---------- mídia: vídeos (YouTube só carrega no clique) e áudios ---------- */

  function youtubeId(v) {
    if (!v) return "";
    var m = String(v).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    if (m) return m[1];
    return /^[\w-]{11}$/.test(v) ? v : "";
  }

  var playIcon = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle class="disc" cx="32" cy="32" r="30"/><path class="tri" d="M26 20 46 32 26 44z"/></svg>';

  function videoBlock(v) {
    var id = youtubeId(v.youtube);
    var title = tx(v.titulo);
    if (!id) {
      return h("div", { class: "video video--soon" }, [
        h("div", { class: "video__play" }, [
          fromMarkup(playIcon),
          h("span", { class: "video__label" }, [h("b", { text: title }), h("span", { text: t("media.soon") })])
        ])
      ]);
    }
    var box = h("div", { class: "video" });
    box.appendChild(h("img", { class: "video__poster", src: "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg", alt: "", loading: "lazy", decoding: "async" }));
    box.appendChild(h("button", {
      type: "button", class: "video__play", "aria-label": t("media.play", { title: title }),
      onclick: function () {
        box.innerHTML = "";
        box.appendChild(h("iframe", {
          src: "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0",
          title: title, allow: "autoplay; encrypted-media; picture-in-picture", allowfullscreen: true
        }));
      }
    }, [fromMarkup(playIcon), h("span", { class: "video__label" }, [h("b", { text: title })])]));
    return box;
  }

  var playing = null; // { audio, btn }

  function stopAudio() {
    if (!playing) return;
    playing.audio.pause();
    playing.btn.classList.remove("is-playing");
    playing.btn.setAttribute("aria-pressed", "false");
    playing.btn.style.setProperty("--p", "0%");
    playing = null;
  }

  function audioButton(a) {
    var title = tx(a.titulo);
    var btn = h("button", { type: "button", class: "audio-btn" }, [
      fromMarkup('<svg class="ico-play" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1l9 5-9 5z"/></svg>'),
      fromMarkup('<svg class="ico-pause" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1h3v10H2zM7 1h3v10H7z"/></svg>'),
      h("span", { text: title })
    ]);
    if (!a.arquivo) {
      btn.disabled = true;
      btn.setAttribute("aria-label", t("media.audioSoonOne", { title: title }));
      return btn;
    }
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", function () {
      if (playing && playing.btn === btn) {
        if (playing.audio.paused) { playing.audio.play(); btn.classList.add("is-playing"); btn.setAttribute("aria-pressed", "true"); }
        else { playing.audio.pause(); btn.classList.remove("is-playing"); btn.setAttribute("aria-pressed", "false"); }
        return;
      }
      stopAudio();
      var audio = new Audio();
      audio.preload = "none";
      audio.src = a.arquivo;
      audio.addEventListener("timeupdate", function () {
        if (audio.duration) btn.style.setProperty("--p", (audio.currentTime / audio.duration * 100).toFixed(1) + "%");
      });
      audio.addEventListener("ended", stopAudio);
      playing = { audio: audio, btn: btn };
      btn.classList.add("is-playing");
      btn.setAttribute("aria-pressed", "true");
      audio.play().catch(stopAudio);
    });
    return btn;
  }

  function mediaBlock(p, container) {
    container.innerHTML = "";
    var videos = p.videos || [], audios = p.audios || [];
    if (!videos.length && !audios.length) return container;
    container.appendChild(h("h4", { class: "media__title", text: t("media.title") }));
    videos.forEach(function (v) { container.appendChild(videoBlock(v)); });
    if (audios.length) {
      container.appendChild(h("div", { class: "audios", role: "group", "aria-label": t("media.audios") }, audios.map(audioButton)));
      if (audios.every(function (a) { return !a.arquivo; })) {
        container.appendChild(h("p", { class: "media__note", text: t("media.audioSoon") }));
      }
    }
    return container;
  }


  /* ---------- fichário do acervo ---------- */

  function cardFor(p) {
    var art = h("div", { class: "fcard__photo" }, [photo(p, "card") || silhouette(p), stamp(p)]);
    var name = h("h4", { class: "fcard__name" }, [
      h("button", {
        type: "button", class: "fcard__open" + (isMixedCase(p.nome) ? " is-mixed" : ""), text: p.nome,
        onclick: function () { openDossier(p.id, art); }
      })
    ]);
    return h("article", { class: "fcard", role: "listitem", "data-id": p.id }, [
      h("span", { class: "fcard__tab", text: p.numero }),
      art,
      name,
      p.nomeCientifico ? h("p", { class: "fcard__sci" }, [h("i", { text: p.nomeCientifico })]) : null,
      h("p", { class: "fcard__class", text: tx(p.classe) }),
      h("span", { class: "fcard__hole", "aria-hidden": "true" })
    ]);
  }

  var navPrev = document.querySelector('.drawer__nav[data-dir="-1"]');
  var navNext = document.querySelector('.drawer__nav[data-dir="1"]');

  function syncDrawerNav() {
    var max = track.scrollWidth - track.clientWidth;
    // todas as fichas cabem na gaveta: as setas somem
    track.parentNode.classList.toggle("is-static", max <= 2);
    navPrev.disabled = track.scrollLeft <= 2;
    navNext.disabled = track.scrollLeft >= max - 2;
  }

  function renderDrawer() {
    track.innerHTML = "";
    pecas.forEach(function (p) { track.appendChild(cardFor(p)); });
    document.getElementById("drawer-count").textContent =
      pecas.length === 1 ? t("drawer.countOne") : t("drawer.count", { n: FT.fmt(pecas.length) });
    syncDrawerNav();
  }

  [navPrev, navNext].forEach(function (b) {
    b.addEventListener("click", function () {
      var card = track.querySelector(".fcard");
      var step = card ? card.getBoundingClientRect().width + 18 : 280;
      track.scrollBy({ left: Number(b.dataset.dir) * step, behavior: FT.reduceMotion ? "auto" : "smooth" });
    });
  });
  track.addEventListener("scroll", function () { requestAnimationFrame(syncDrawerNav); }, { passive: true });
  window.addEventListener("resize", syncDrawerNav);

  /* ---------- dossiê ---------- */

  function rows(p) {
    var list = [
      ["card.class", tx(p.classe)],
      ["card.habitat", tx(p.habitat)],
      ["card.diet", tx(p.dieta)],
      ["card.found", p.criadoPara ? h("a", { href: p.criadoPara.link, target: "_blank", rel: "noopener", text: p.criadoPara.texto }) : null],
      ["card.status", tx(p.situacao)]
    ].filter(function (r) { return r[1]; });
    return h("dl", { class: "card__rows" }, list.map(function (r) {
      return h("div", null, [h("dt", { text: t(r[0]) }), h("dd", null, [r[1]])]);
    }));
  }

  function goTo(id, focusSelector) {
    var target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: FT.reduceMotion ? "auto" : "smooth", block: "start" });
    if (focusSelector) {
      var f = document.querySelector(focusSelector);
      if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, FT.reduceMotion ? 0 : 600);
    }
  }

  function actionButton(p) {
    if (p.acao === "encomendar") {
      return h("button", {
        type: "button", class: "btn", text: t("dossier.order", { name: p.nome }),
        onclick: function () { dossier.close(); FT.preset(p.tipo === "amplificador" ? "amp" : "pedal", p.nome); goTo("orcamento", "#f-name"); }
      });
    }
    if (p.acao === "lista-de-espera") {
      return h("button", {
        type: "button", class: "btn", text: t("dossier.wait"),
        onclick: function () { dossier.close(); goTo("waitlist", "#w-name"); }
      });
    }
    if (p.acao === "laboratorio") {
      return h("button", {
        type: "button", class: "btn", text: t("dossier.lab"),
        onclick: function () { dossier.close(); goTo("laboratorio"); }
      });
    }
    return null;
  }

  function buildDossier(p, fromExhibit) {
    var photoBox = p.figura ? figureBox(p) : h("div", { class: "dossier__photo", "data-vt": "" }, [photo(p, "full") || silhouette(p)]);
    var title = h("h2", { class: "dossier__name" + (isMixedCase(p.nome) ? " is-mixed" : ""), id: "dossier-title" }, [
      p.nome, p.subtitulo ? h("small", { text: p.subtitulo }) : null
    ]);
    var exhibit = !fromExhibit && p.exposicao && document.getElementById(p.exposicao)
      ? h("a", { class: "link", href: "#" + p.exposicao, text: t("dossier.exhibit"), onclick: function (e) { e.preventDefault(); dossier.close(); goTo(p.exposicao); } })
      : null;
    var actions = h("div", { class: "dossier__actions" }, [
      h("button", {
        type: "button", class: "ficha-btn",
        onclick: function () { openFicha(p.id); }
      }, [h("i", { "aria-hidden": "true", text: "i" }), t("dossier.ficha")]),
      actionButton(p),
      exhibit
    ]);
    // peça com figura interativa: os botões ficam embaixo do pedal, e os knobs ao lado
    var visual = p.figura ? h("div", { class: "dossier__visual" }, [photoBox, actions]) : photoBox;
    var paper = h("div", { class: "sheet__paper" }, [
      closeButton(dossier),
      h("div", { class: "sheet__head" }, [h("span", { text: t("dossier.archive") }), h("span", { text: p.numero })]),
      h("div", { class: "dossier__body" }, [
        visual,
        h("div", null, [
          title,
          p.nomeCientifico ? h("p", { class: "dossier__sci" }, [h("i", { text: p.nomeCientifico })]) : null,
          tx(p.resumo) ? h("p", { class: "dossier__summary", text: tx(p.resumo) }) : null,
          rows(p),
          stamp(p),
          p.figura && p.painel ? knobPanel(p, figState(p.id), "knobs--sheet", function (msg) { sendFig(photoBox, msg); }) : null,
          p.figura ? null : actions
        ])
      ]),
      mediaBlock(p, h("div", { class: "media dossier__media" }))
    ]);
    return { paper: paper, photoBox: photoBox };
  }

  function openDossier(id, fromEl, fromExhibit) {
    var p = byId[id];
    if (!p) return;
    var built = buildDossier(p, fromExhibit);
    var update = function () {
      dossier.innerHTML = "";
      dossier.setAttribute("data-id", id);
      dossier.setAttribute("data-from", fromExhibit ? "exhibit" : "drawer");
      dossier.appendChild(built.paper);
      if (fromEl) built.photoBox.style.viewTransitionName = "dossier-photo";
      openSheet(dossier, !!fromEl && !!document.startViewTransition && !FT.reduceMotion);
    };
    transition(update, fromEl, "dossier-photo");
  }

  /* ---------- ficha técnica ---------- */

  function control(c) {
    return h("div", { class: "ctrl" }, [
      h("h3", { class: "ctrl__name" }, [c.nome + " ", h("span", { text: "(" + tx(c.funcao) + ")" })])
    ].concat((tx(c.texto) || []).map(function (line) { return h("p", { text: line }); })));
  }

  function loadDrawing(p, slot) {
    var url = p.ficha.desenho;
    var get = svgCache[url] || (svgCache[url] = fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(url);
      return r.text();
    }));
    get.then(function (markup) {
      slot.innerHTML = markup;
      var svg = slot.querySelector("svg");
      if (!svg) throw new Error("svg");
      if (p.ficha.recorte) svg.setAttribute("viewBox", p.ficha.recorte);
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.setAttribute("class", "ficha__art");
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", t("ficha.drawing", { name: p.nome }));
    }).catch(function () {
      delete svgCache[url];
      slot.innerHTML = "";
      slot.appendChild(h("p", { class: "ficha__loading", text: t("ficha.error") }));
    });
  }

  function buildFicha(p) {
    var head = h("div", { class: "ficha__title" }, [
      p.ficha && tx(p.ficha.edicao) ? h("p", { class: "ficha__edition", text: tx(p.ficha.edicao) }) : null,
      h("h2", { class: "ficha__name" + (isMixedCase(p.nome) ? " is-mixed" : ""), id: "ficha-title" }, [
        p.nome, p.subtitulo ? h("small", { text: p.subtitulo }) : null
      ]),
      h("p", { class: "ficha__class", text: tx(p.classe) })
    ]);
    var body;
    if (p.ficha && p.ficha.controles) {
      var c = p.ficha.controles;
      var slot = h("div", { class: "ficha__art-wrap" }, [h("p", { class: "ficha__loading", text: t("ficha.loading") })]);
      // ordem dos knobs: 1º e 3º à esquerda, 2º e 4º à direita (como no pedal)
      body = h("div", { class: "ficha__body" }, [
        h("div", { class: "ficha__col ficha__col--left" }, c.filter(function (x, i) { return i % 2 === 0; }).map(control)),
        slot,
        h("div", { class: "ficha__col" }, c.filter(function (x, i) { return i % 2 === 1; }).map(control))
      ]);
      if (p.ficha.desenho) loadDrawing(p, slot); else slot.innerHTML = "";
    } else {
      body = h("div", { class: "ficha__pending" }, [
        h("p", { text: t("ficha.pending", { name: p.nome }) }),
        h("span", { class: "stamp", text: t("ficha.pendingStamp") })
      ]);
    }
    return h("div", { class: "sheet__paper" }, [
      closeButton(fichaDialog),
      h("div", { class: "sheet__head" }, [h("span", { text: t("dossier.archive") }), h("span", { text: t("ficha.title") + " " + p.numero })]),
      head,
      body,
      h("div", { class: "ficha__foot" }, [
        h("div", { class: "ficha__brand" }, [
          fromMarkup('<svg aria-hidden="true"><use href="#logo"/></svg>'),
          h("span", { text: "Vintage Handmade Amps & Pedals" })
        ]),
        selos(p, "selos--ficha")
      ])
    ]);
  }

  function openFicha(id) {
    var p = byId[id];
    if (!p) return;
    fichaDialog.innerHTML = "";
    fichaDialog.setAttribute("data-id", id);
    fichaDialog.appendChild(buildFicha(p));
    openSheet(fichaDialog, false);
  }

  function syncInfoButtons() {
    document.querySelectorAll("[data-ficha]").forEach(function (b) {
      var p = byId[b.getAttribute("data-ficha")];
      b.hidden = !p;
      if (!p) return;
      var label = t("info.open", { name: p.nome });
      b.setAttribute("aria-label", label);
      b.title = label;
    });
  }

  document.querySelectorAll("[data-ficha]").forEach(function (b) {
    b.addEventListener("click", function () { openFicha(b.getAttribute("data-ficha")); });
  });

  document.querySelectorAll("[data-examine]").forEach(function (b) {
    b.addEventListener("click", function () {
      var piece = b.closest(".specimen, .case");
      var art = piece && piece.querySelector(".gallery__main, .dig, .case__main");
      openDossier(b.getAttribute("data-examine"), art, true);
    });
  });

  /* ---------- lista de espera do Kraken ---------- */

  // o envio cai na caixa de entrada do painel admin; se falhar, oferece o WhatsApp
  var wForm = document.getElementById("waitlist");
  var wStatus = document.getElementById("waitlist-status");
  var wName = document.getElementById("w-name");
  var wEmail = document.getElementById("w-contact");
  var wWa = document.getElementById("w-wa");
  var wBtn = document.getElementById("wait-send");
  var wState = "";

  function waitText() {
    var lines = [t("wait.msg"), "", t("wa.name") + ": " + wName.value.trim(), t("wait.contactLabel") + ": " + wEmail.value.trim()];
    if (wWa.value.trim()) lines.push("WhatsApp: " + wWa.value.trim());
    return lines.join("\n");
  }

  function renderWait() {
    var errors = { invalidName: 1, invalidContact: 1, invalidWa: 1, error: 1, tooMany: 1 };
    var keys = { sending: "wait.sending", done: "wait.done", already: "wait.already", error: "wait.error",
      tooMany: "form.tooMany", invalidName: "wait.invalidName", invalidContact: "wait.invalidContact", invalidWa: "wait.invalidWa" };
    FT.formStatus(wStatus, wState ? keys[wState] : "", !!errors[wState], wState === "error" ? waitText() : null);
    wForm.classList.toggle("is-done", wState === "done" || wState === "already");
  }

  wForm.addEventListener("input", function () { if (wState !== "done" && wState !== "already") { wState = ""; renderWait(); } });
  wForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (wBtn.disabled) return;
    var waNum = FT.whatsappDigits(wWa.value);
    var problem = FT.checkFields([
      [wName, function () { return wName.value.trim().length >= 2; }, "invalidName"],
      [wEmail, function () { return FT.emailOk(wEmail.value); }, "invalidContact"],
      [wWa, function () { return !wWa.value.trim() || !!waNum; }, "invalidWa"]
    ]);
    if (problem) { wState = problem; renderWait(); return; }
    if (wForm.elements.site.value) { wState = "done"; renderWait(); return; }   // robô

    wBtn.disabled = true;
    wState = "sending"; renderWait();
    FT.sendContact({
      tipo: "lista_espera",
      nome: wName.value.trim(),
      email: wEmail.value.trim().toLowerCase(),
      whatsapp: waNum,
      produto: wForm.getAttribute("data-produto") || "kraken"
    }).then(function (res) {
      wState = res === "duplicado" ? "already" : res === "limite" ? "tooMany" : "done";
    }).catch(function () {
      wState = "error";
    }).then(function () { wBtn.disabled = false; renderWait(); });
  });

  /* ---------- início ---------- */

  function renderAll() {
    renderDrawer();
    renderPagePanels();
    syncInfoButtons();
    renderWait();
    // janelas abertas são refeitas no idioma novo
    if (fichaDialog.open && fichaDialog.dataset.id) {
      fichaDialog.innerHTML = "";
      fichaDialog.appendChild(buildFicha(byId[fichaDialog.dataset.id]));
    }
    if (dossier.open && dossier.dataset.id) {
      dossier.innerHTML = "";
      dossier.appendChild(buildDossier(byId[dossier.dataset.id], dossier.dataset.from === "exhibit").paper);
    }
  }

  syncInfoButtons();
  renderWait();

  Promise.all([
    getJSON("data/catalogo.json"),
    getJSON("data/config.json").catch(function () { return {}; })
  ]).then(function (res) {
    pecas = (res[0] && res[0].pecas || []).filter(function (p) { return p && p.id && p.nome; });
    pecas.forEach(function (p) { byId[p.id] = p; });
    config = res[1] || {};
    renderAll();
    FT.onLang(function () { stopAudio(); renderAll(); });
    if (FT.relayout) FT.relayout();
  }).catch(function () {
    var empty = document.getElementById("drawer-empty");
    if (empty) empty.textContent = t("drawer.error");
    FT.onLang(function () { var el = document.getElementById("drawer-empty"); if (el) el.textContent = t("drawer.error"); });
  });
})();
