/* Fossil Tone — página de manutenção (manutencao.html): peças de reposição e pedido de conserto.
   As peças saem dos produtos do tipo "peça" publicados no painel admin;
   os dois formulários caem na caixa de entrada do painel. */
(function () {
  "use strict";

  var FT = window.FT;
  if (!FT) return;
  var t = FT.t;

  function money(v) {
    return new Intl.NumberFormat(FT.lang() === "en" ? "en-US" : "pt-BR", { style: "currency", currency: "BRL" }).format(v);
  }

  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    });
    (children || []).forEach(function (c) { if (c) el.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return el;
  }

  // dados de contato comuns aos dois formulários
  function contactRules(form) {
    var el = form.elements;
    return [
      [el.nome, function () { return el.nome.value.trim().length >= 2; }, "form.invalidName"],
      [el.whatsapp, function () { return !!FT.whatsappDigits(el.whatsapp.value); }, "form.invalidWa"],
      [el.email, function () { return FT.emailOk(el.email.value); }, "form.invalidEmail"]
    ];
  }

  function contactData(form) {
    var el = form.elements;
    return { nome: el.nome.value.trim(), whatsapp: FT.whatsappDigits(el.whatsapp.value), email: el.email.value.trim().toLowerCase() };
  }

  function submitWith(form, build, doneKey, waText) {
    var status = form.querySelector(".form__status");
    var btn = form.querySelector("button[type=submit]");
    form.addEventListener("input", function () { if (!form.classList.contains("is-sent")) FT.formStatus(status, ""); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (btn.disabled) return;
      var payload = build();
      if (!payload) return;
      if (form.elements.site.value) { FT.formStatus(status, doneKey); return; }   // robô
      btn.disabled = true;
      FT.formStatus(status, "form.sending");
      FT.sendContact(payload).then(function (res) {
        if (res === "limite") { FT.formStatus(status, "form.tooMany", true); return; }
        form.classList.add("is-sent");
        FT.formStatus(status, doneKey);
        form.reset();
        if (form.id === "pecas") { cart = {}; renderParts(); }
        syncAmp();
      }).catch(function () {
        FT.formStatus(status, "form.error", true, waText(payload));
      }).then(function () { btn.disabled = false; });
    });
  }

  /* ---------- 1. peças de reposição ---------- */

  var partsForm = document.getElementById("pecas");
  var list = document.getElementById("parts-list");
  var cartBox = document.getElementById("parts-cart");
  var cartList = document.getElementById("parts-cart-list");
  var totalEl = document.getElementById("parts-total");
  var parts = null, loadError = false;
  var cart = {};   // slug -> quantidade

  function price(p) { return Number(p.preco_promocional || p.preco) || 0; }
  function buyable(p) { return p.status !== "esgotado"; }

  function renderParts() {
    list.innerHTML = "";
    if (!parts || !parts.length) {
      list.appendChild(h("li", { class: "parts__msg", text: t(loadError ? "rest.loadError" : parts ? "rest.empty" : "rest.loading") }));
    } else {
      parts.forEach(function (p) {
        var inCart = !!cart[p.slug];
        var tag = p.status === "esgotado" ? t("rest.soldOut") : p.status === "sob_encomenda" ? t("rest.onOrder") : "";
        list.appendChild(h("li", { class: "part" + (inCart ? " is-in" : "") + (buyable(p) ? "" : " is-out") }, [
          h("span", { class: "part__no", text: p.numero || "" }),
          h("span", { class: "part__name", text: p.nome }),
          p.descricao ? h("span", { class: "part__desc", text: p.descricao }) : null,
          h("span", { class: "part__foot" }, [
            h("span", { class: "part__price", text: price(p) > 0 ? money(price(p)) : t("rest.priceAsk") }),
            tag ? h("span", { class: "part__tag", text: tag }) : null,
            buyable(p) ? h("button", {
              type: "button", class: "part__add", "aria-pressed": String(inCart),
              "aria-label": t(inCart ? "rest.remove" : "rest.addAria", { name: p.nome }),
              text: t(inCart ? "rest.added" : "rest.add"),
              onclick: function () {
                if (cart[p.slug]) delete cart[p.slug]; else cart[p.slug] = 1;
                renderParts();
                var again = list.querySelector('[data-slug="' + p.slug + '"]');
                if (again) again.focus();
              },
              "data-slug": p.slug
            }) : null
          ])
        ]));
      });
    }
    renderCart();
  }

  function renderCart() {
    var chosen = (parts || []).filter(function (p) { return cart[p.slug]; });
    cartBox.hidden = !chosen.length;
    cartList.innerHTML = "";
    var total = 0, unpriced = false;
    chosen.forEach(function (p) {
      total += price(p) * cart[p.slug];
      if (!price(p)) unpriced = true;
      var qty = h("input", {
        type: "number", min: "1", max: "50", value: String(cart[p.slug]), class: "parts__qty",
        "aria-label": t("rest.qty", { name: p.nome }),
        onchange: function () { cart[p.slug] = Math.max(1, Math.min(50, parseInt(qty.value, 10) || 1)); renderCart(); }
      });
      cartList.appendChild(h("li", null, [
        h("span", { text: p.nome }),
        qty,
        h("button", { type: "button", class: "parts__rm", "aria-label": t("rest.remove", { name: p.nome }), text: "×",
          onclick: function () { delete cart[p.slug]; renderParts(); } })
      ]));
    });
    totalEl.textContent = money(total) + (unpriced ? " +" : "");
  }

  function partItems() {
    return (parts || []).filter(function (p) { return cart[p.slug]; }).map(function (p) {
      return { slug: p.slug, numero: p.numero, nome: p.nome, quantidade: cart[p.slug], preco: price(p) };
    });
  }

  submitWith(partsForm, function () {
    var status = partsForm.querySelector(".form__status");
    var itens = partItems(), outra = partsForm.elements.outra.value.trim();
    if (!itens.length && !outra) { FT.formStatus(status, "rest.shopNeed", true); partsForm.elements.outra.focus(); return null; }
    var problem = FT.checkFields(contactRules(partsForm));
    if (problem) { FT.formStatus(status, problem, true); return null; }
    var c = contactData(partsForm);
    return {
      tipo: "pecas", nome: c.nome, whatsapp: c.whatsapp, email: c.email,
      mensagem: outra || null,
      dados: { itens: itens, total: itens.reduce(function (s, i) { return s + i.preco * i.quantidade; }, 0) }
    };
  }, "rest.shopDone", function (p) {
    var lines = [t("rest.waParts"), ""];
    p.dados.itens.forEach(function (i) { lines.push(i.quantidade + "x " + i.nome); });
    if (p.mensagem) lines.push(p.mensagem);
    lines.push("", t("wa.name") + ": " + p.nome);
    return lines.join("\n");
  });

  FT.apiGet("produtos?select=slug,numero,nome,descricao,preco,preco_promocional,status&tipo=eq.peca&status=in.(ativo,sob_encomenda,esgotado)&order=numero.asc")
    .then(function (rows) { parts = rows || []; })
    .catch(function () { parts = []; loadError = true; })
    .then(renderParts);

  /* ---------- 2. pedido de manutenção ---------- */

  var fixForm = document.getElementById("conserto");

  // "Válvula" só aparece para amplificador
  function syncAmp() {
    var amp = fixForm.elements.equip.value === "amp";
    fixForm.querySelectorAll(".only-amp").forEach(function (l) {
      l.hidden = !amp;
      if (!amp) l.querySelector("input").checked = false;
    });
  }
  fixForm.addEventListener("change", syncAmp);
  syncAmp();

  submitWith(fixForm, function () {
    var el = fixForm.elements, status = fixForm.querySelector(".form__status");
    var problem = FT.checkFields([
      [el.modelo, function () { return el.modelo.value.trim().length >= 2; }, "rest.invalidModel"],
      [el.descricao, function () { return el.descricao.value.trim().length >= 5; }, "rest.invalidDesc"]
    ].concat(contactRules(fixForm)));
    if (problem) { FT.formStatus(status, problem, true); return null; }
    var c = contactData(fixForm);
    return {
      tipo: "manutencao", nome: c.nome, whatsapp: c.whatsapp, email: c.email,
      produto: el.modelo.value.trim(),
      mensagem: el.descricao.value.trim(),
      dados: {
        equipamento: el.equip.value === "amp" ? "amplificador" : "pedal",
        problemas: Array.prototype.map.call(fixForm.querySelectorAll("input[name=problema]:checked"), function (i) { return i.value; }),
        tempoDeUso: el.tempo.value || null
      }
    };
  }, "rest.fixDone", function (p) {
    return [t("rest.waFix"), "", p.produto, p.mensagem, "", t("wa.name") + ": " + p.nome].join("\n");
  });

  FT.onLang(renderParts);
  FT.applyLang();
})();
