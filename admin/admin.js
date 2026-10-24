/* ==========================================================
   Fossil Tone — painel admin
   Entrada, rotas e as telas: visão geral, pedidos, produtos,
   clientes, cupons e configurações.
   ========================================================== */

(function () {
  "use strict";

  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));

  const STATUS_PEDIDO = {
    aguardando_pagamento: "Aguardando pagamento",
    pago: "Pago",
    em_producao: "Em produção",
    enviado: "Enviado",
    entregue: "Entregue",
    cancelado: "Cancelado"
  };
  const STATUS_PRODUTO = {
    ativo: "À venda",
    sob_encomenda: "Sob encomenda",
    esgotado: "Esgotado",
    rascunho: "Rascunho",
    arquivado: "Arquivado"
  };
  const TIPOS = { pedal: "Pedal", amplificador: "Amplificador", acessorio: "Acessório" };
  const CANAIS = { site: "Site", whatsapp: "WhatsApp", instagram: "Instagram", presencial: "Presencial" };
  const PAGAMENTOS = { pix: "Pix", cartao: "Cartão", boleto: "Boleto", transferencia: "Transferência", dinheiro: "Dinheiro" };
  const FATURADOS = ["pago", "em_producao", "enviado", "entregue"];

  let fonte = null;
  let db = { produtos: [], clientes: [], pedidos: [], itens_pedido: [], cupons: [] };
  const filtros = { pedidos: { status: "", busca: "" }, produtos: { status: "", busca: "" }, clientes: { busca: "" } };

  /* ---------- utilidades ---------- */

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const dinheiro = (v) => brl.format(Number(v) || 0);
  const data = (iso) => iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "";
  const dataHora = (iso) => iso ? new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
  const numero = (v) => { const n = parseFloat(String(v).replace(",", ".")); return isNaN(n) ? 0 : n; };
  const inteiro = (v) => { const n = parseInt(v, 10); return isNaN(n) ? 0 : n; };
  const vazioNulo = (v) => { const t = String(v == null ? "" : v).trim(); return t === "" ? null : t; };
  const slug = (t) => String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const stamp = (status, mapa) => `<span class="stamp st-${esc(status)}">${esc(mapa[status] || status)}</span>`;
  const fotoUrl = (f) => !f ? "" : /^(https?:)?\/\//.test(f) || f.startsWith("data:") ? f : "../" + f.replace(/^\/+/, "");

  function toast(msg, erro) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.toggle("is-erro", Boolean(erro));
    t.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { t.hidden = true; }, erro ? 5200 : 2800);
  }

  async function tentar(fn, botao) {
    if (botao) botao.disabled = true;
    try { return await fn(); }
    catch (e) { toast(e.message || "Algo deu errado.", true); return undefined; }
    finally { if (botao) botao.disabled = false; }
  }

  const cliente = (id) => db.clientes.find((c) => c.id === id);
  const itensDe = (pedidoId) => db.itens_pedido.filter((i) => i.pedido_id === pedidoId);
  const estoqueBaixo = () => db.produtos.filter((p) => p.status === "ativo" && p.estoque <= p.estoque_minimo);

  async function recarregar() {
    const [produtos, clientes, pedidos, itens, cupons] = await Promise.all(
      ["produtos", "clientes", "pedidos", "itens_pedido", "cupons"].map((t) => fonte.listar(t))
    );
    db = { produtos, clientes, pedidos, itens_pedido: itens, cupons };
    const pendentes = pedidos.filter((p) => p.status === "pago" || p.status === "em_producao").length;
    const badge = $("#badge-pedidos");
    badge.hidden = !pendentes;
    badge.textContent = pendentes;
  }

  /* ==========================================================
     ENTRADA
     ========================================================== */

  function mostrarForm(id) {
    ["form-entrar", "form-recuperar", "form-nova-senha"].forEach((f) => { $("#" + f).hidden = f !== id; });
    $$(".gate__erro").forEach((e) => { e.hidden = true; });
    const campo = $("#" + id + " input");
    if (campo) campo.focus();
  }

  function erroGate(id, msg, ok) {
    const el = $("#" + id);
    el.textContent = msg;
    el.classList.toggle("is-ok", Boolean(ok));
    el.hidden = false;
  }

  function abrirGate() {
    $("#app").hidden = true;
    $("#gate").hidden = false;
    document.title = "Entrar · Gabinete · Fossil Tone";
  }

  async function abrirApp(sessao) {
    $("#gate").hidden = true;
    $("#app").hidden = false;
    $("#usuario").textContent = fonte.modo === "demo" ? "Demonstração" : sessao.email;
    $("#demo-bar").hidden = fonte.modo !== "demo";
    $("#view").innerHTML = '<p class="loading">Abrindo o acervo…</p>';
    const ok = await tentar(recarregar);
    if (ok === undefined && !db.produtos.length && fonte.modo !== "demo") { /* erro já avisado */ }
    rotear();
  }

  function ligarEntrada() {
    $("#form-entrar").addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const f = ev.currentTarget;
      const email = f.email.value.trim(), senha = f.senha.value;
      if (!fonte || fonte.modo === "demo") return erroGate("entrar-erro", "O login ainda não está ligado ao Supabase. Use a demonstração abaixo.");
      if (!email || !senha) return erroGate("entrar-erro", "Preencha e-mail e senha.");
      const btn = $("button[type=submit]", f);
      btn.disabled = true;
      try {
        const s = await fonte.entrar(email, senha);
        f.senha.value = "";
        await abrirApp(s);
      } catch (e) { erroGate("entrar-erro", e.message); }
      finally { btn.disabled = false; }
    });

    $("#btn-esqueci").addEventListener("click", () => {
      $("#recuperar-email").value = $("#entrar-email").value;
      mostrarForm("form-recuperar");
    });
    $$("[data-voltar-entrar]").forEach((b) => b.addEventListener("click", () => mostrarForm("form-entrar")));

    $("#form-recuperar").addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const email = ev.currentTarget.email.value.trim();
      if (!email) return erroGate("recuperar-erro", "Informe o e-mail.");
      try {
        await fonte.recuperar(email);
        erroGate("recuperar-erro", "Se esse e-mail tiver acesso, o link chega em alguns minutos.", true);
      } catch (e) { erroGate("recuperar-erro", e.message); }
    });

    $("#form-nova-senha").addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const senha = ev.currentTarget.senha.value;
      if (senha.length < 10) return erroGate("nova-senha-erro", "Use pelo menos 10 caracteres.");
      try {
        await fonte.novaSenha(senha);
        history.replaceState(null, "", location.pathname);
        const s = await fonte.sessao();
        await abrirApp(s);
        toast("Senha atualizada.");
      } catch (e) { erroGate("nova-senha-erro", e.message); }
    });

    $("#btn-demo").addEventListener("click", async () => {
      fonte = window.FTDados.demo();
      const s = await fonte.entrar();
      await abrirApp(s);
    });

    $("#btn-sair").addEventListener("click", async () => {
      await fonte.sair();
      if (!window.FTDados.configurado()) fonte = null;
      fecharGaveta();
      history.replaceState(null, "", location.pathname);
      abrirGate();
      mostrarForm("form-entrar");
    });

    $("#btn-reiniciar-demo").addEventListener("click", async () => {
      if (!confirm("Apagar as mudanças da demonstração e voltar aos dados de exemplo?")) return;
      fonte.reiniciar();
      await recarregar();
      rotear();
      toast("Exemplos restaurados.");
    });
  }

  /* ==========================================================
     ROTAS
     ========================================================== */

  const TELAS = {
    "visao-geral": telaVisaoGeral,
    pedidos: telaPedidos,
    produtos: telaProdutos,
    clientes: telaClientes,
    cupons: telaCupons,
    configuracoes: telaConfiguracoes
  };

  function rotear() {
    if ($("#app").hidden) return;
    const rota = (location.hash.replace(/^#\/?/, "") || "visao-geral").split("/")[0];
    const tela = TELAS[rota] ? rota : "visao-geral";
    $$(".side__nav a").forEach((a) => {
      const ativo = a.dataset.rota === tela;
      a.classList.toggle("is-active", ativo);
      if (ativo) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    const nome = $(`.side__nav a[data-rota="${tela}"]`).lastChild.textContent;
    document.title = (tela === "pedidos" ? "Pedidos" : nome) + " · Gabinete · Fossil Tone";
    TELAS[tela]($("#view"));
    const ativo = $(".side__nav a.is-active");
    if (ativo && ativo.scrollIntoView && window.innerWidth <= 900) ativo.scrollIntoView({ block: "nearest", inline: "center" });
  }

  function cabecalho(kicker, titulo, acoes) {
    return `<header class="head">
      <div><p class="head__kicker">${esc(kicker)}</p><h1 class="head__title">${esc(titulo)}</h1></div>
      ${acoes ? `<div class="head__actions">${acoes}</div>` : ""}
    </header>`;
  }

  /* ==========================================================
     VISÃO GERAL
     ========================================================== */

  function telaVisaoGeral(view) {
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const inicioMesPassado = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
    const faturados = db.pedidos.filter((p) => FATURADOS.includes(p.status));
    const doMes = faturados.filter((p) => new Date(p.criado_em) >= inicioMes);
    const doMesPassado = faturados.filter((p) => { const d = new Date(p.criado_em); return d >= inicioMesPassado && d < inicioMes; });
    const soma = (l) => l.reduce((s, p) => s + Number(p.total || 0), 0);
    const fatMes = soma(doMes), fatPassado = soma(doMesPassado);
    const ticket = doMes.length ? fatMes / doMes.length : 0;
    const despachar = db.pedidos.filter((p) => p.status === "pago" || p.status === "em_producao");
    const aguardando = db.pedidos.filter((p) => p.status === "aguardando_pagamento");
    const baixo = estoqueBaixo();
    const mes = agora.toLocaleDateString("pt-BR", { month: "long" });

    let comparacao = "Primeiro mês com vendas registradas.";
    if (fatPassado > 0) {
      const v = Math.round(((fatMes - fatPassado) / fatPassado) * 100);
      comparacao = `${v >= 0 ? "+" : ""}${v}% em relação ao mês passado`;
    }

    view.innerHTML = cabecalho("Gabinete do curador", "Visão geral", `<a class="btn btn--sm" href="#/pedidos" data-novo-pedido>Registrar pedido</a>`) + `
      <section class="kpis" aria-label="Indicadores">
        <div class="kpi"><p class="kpi__label">Faturamento em ${esc(mes)}</p><p class="kpi__value">${dinheiro(fatMes)}</p><p class="kpi__note">${esc(comparacao)}</p></div>
        <div class="kpi ${despachar.length ? "kpi--alert" : ""}"><p class="kpi__label">Pedidos a despachar</p><p class="kpi__value">${despachar.length}</p><p class="kpi__note">${aguardando.length} aguardando pagamento</p></div>
        <div class="kpi"><p class="kpi__label">Ticket médio do mês</p><p class="kpi__value">${dinheiro(ticket)}</p><p class="kpi__note">${doMes.length} ${doMes.length === 1 ? "pedido pago" : "pedidos pagos"}</p></div>
        <div class="kpi ${baixo.length ? "kpi--alert" : ""}"><p class="kpi__label">Estoque baixo</p><p class="kpi__value">${baixo.length}</p><p class="kpi__note">${baixo.length ? "produtos à venda no limite" : "tudo em ordem"}</p></div>
      </section>
      <section class="panels">
        <div class="panel panel--wide">
          <div class="panel__head"><h2 class="panel__title">Vendas dos últimos 30 dias</h2><span class="head__kicker">${dinheiro(soma(faturados.filter((p) => Date.now() - new Date(p.criado_em) < 30 * 864e5)))}</span></div>
          ${grafico(faturados)}
        </div>
        <div class="panel">
          <div class="panel__head"><h2 class="panel__title">Pedidos recentes</h2><a class="panel__link" href="#/pedidos">Ver todos</a></div>
          ${db.pedidos.length ? tabelaPedidos(db.pedidos.slice(0, 6), true) : '<p class="empty">Nenhum pedido ainda.</p>'}
        </div>
        <div class="panel">
          <div class="panel__head"><h2 class="panel__title">Repor estoque</h2><a class="panel__link" href="#/produtos">Produtos</a></div>
          ${baixo.length ? `<ul class="lowstock">${baixo.map((p) => `<li><b>${esc(p.nome)}</b><span>${p.estoque} em estoque · mín. ${p.estoque_minimo}</span></li>`).join("")}</ul>` : '<p class="empty">Nenhum produto no limite.</p>'}
        </div>
      </section>`;
    ligarLinhasPedido(view);
    $("[data-novo-pedido]", view).addEventListener("click", (ev) => { ev.preventDefault(); abrirPedido(null); });
  }

  function grafico(faturados) {
    const dias = 30, largura = 900, altura = 220, base = 190, topo = 14;
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const valores = Array.from({ length: dias }, (_, i) => {
      const ini = new Date(hoje); ini.setDate(ini.getDate() - (dias - 1 - i));
      const fim = new Date(ini); fim.setDate(fim.getDate() + 1);
      const v = faturados.filter((p) => { const d = new Date(p.criado_em); return d >= ini && d < fim; }).reduce((s, p) => s + Number(p.total || 0), 0);
      return { ini, v };
    });
    const max = Math.max(1, ...valores.map((x) => x.v));
    const passo = largura / dias, barra = passo * 0.62;
    const barras = valores.map((x, i) => {
      const h = x.v ? Math.max(3, (x.v / max) * (base - topo)) : 0;
      const rot = x.ini.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      return `<rect class="bar" x="${(i * passo + (passo - barra) / 2).toFixed(1)}" y="${(base - h).toFixed(1)}" width="${barra.toFixed(1)}" height="${h.toFixed(1)}"><title>${rot}: ${dinheiro(x.v)}</title></rect>` +
        (i % 5 === 4 || i === 0 ? `<text class="axis" x="${(i * passo + passo / 2).toFixed(1)}" y="${altura - 6}" text-anchor="middle">${rot}</text>` : "");
    }).join("");
    return `<svg class="chart" viewBox="0 0 ${largura} ${altura}" role="img" aria-label="Faturamento por dia nos últimos 30 dias">
      <line class="grid" x1="0" x2="${largura}" y1="${base}" y2="${base}"/>
      <line class="grid" x1="0" x2="${largura}" y1="${topo}" y2="${topo}" stroke-dasharray="4 6"/>
      <text class="axis" x="0" y="${topo - 3}">${dinheiro(max)}</text>
      ${barras}
    </svg>`;
  }

  /* ==========================================================
     PEDIDOS
     ========================================================== */

  function tabelaPedidos(lista, compacta) {
    return `<div class="table-wrap"><table class="table table--cards">
      <thead><tr><th>Nº</th><th>Data</th><th>Cliente</th>${compacta ? "" : '<th class="col-opt">Itens</th><th class="col-opt">Canal</th>'}<th class="num">Total</th><th>Status</th></tr></thead>
      <tbody>${lista.map((p) => {
        const c = cliente(p.cliente_id);
        const itens = itensDe(p.id);
        return `<tr data-pedido="${esc(p.id)}" tabindex="0">
          <td data-label="Nº" class="code">#${esc(p.codigo)}</td>
          <td data-label="Data">${data(p.criado_em)}</td>
          <td data-label="Cliente"><span class="strong">${esc(c ? c.nome : "Sem cliente")}</span></td>
          ${compacta ? "" : `<td data-label="Itens" class="col-opt">${esc(itens.map((i) => (i.quantidade > 1 ? i.quantidade + "× " : "") + i.nome).join(", ") || "—")}</td><td data-label="Canal" class="col-opt">${esc(CANAIS[p.canal] || p.canal || "")}</td>`}
          <td data-label="Total" class="num">${dinheiro(p.total)}</td>
          <td data-label="Status">${stamp(p.status, STATUS_PEDIDO)}</td>
        </tr>`;
      }).join("")}</tbody></table></div>`;
  }

  function ligarLinhasPedido(el) {
    $$("tr[data-pedido]", el).forEach((tr) => {
      const abrir = () => abrirPedido(db.pedidos.find((p) => p.id === tr.dataset.pedido));
      tr.addEventListener("click", abrir);
      tr.addEventListener("keydown", (ev) => { if (ev.key === "Enter") abrir(); });
    });
  }

  function telaPedidos(view) {
    const f = filtros.pedidos;
    const contagem = (s) => db.pedidos.filter((p) => !s || p.status === s).length;
    view.innerHTML = cabecalho("01 · Vendas", "Pedidos",
      `<button class="btn btn--ghost btn--sm" type="button" id="exportar">Exportar CSV</button><button class="btn btn--sm" type="button" id="novo">Novo pedido</button>`) + `
      <div class="toolbar">
        <input class="search" type="search" id="busca" placeholder="Buscar nº, cliente ou rastreio" value="${esc(f.busca)}" aria-label="Buscar pedidos">
        <div class="chips" role="group" aria-label="Filtrar por status">
          <button type="button" data-status="" aria-pressed="${!f.status}">Todos<b>${contagem("")}</b></button>
          ${Object.keys(STATUS_PEDIDO).map((s) => `<button type="button" data-status="${s}" aria-pressed="${f.status === s}">${STATUS_PEDIDO[s]}<b>${contagem(s)}</b></button>`).join("")}
        </div>
      </div>
      <div id="lista"></div>`;

    const desenhar = () => {
      const q = f.busca.trim().toLowerCase();
      const lista = db.pedidos.filter((p) => {
        if (f.status && p.status !== f.status) return false;
        if (!q) return true;
        const c = cliente(p.cliente_id);
        return [p.codigo, p.rastreio, c && c.nome, c && c.email].some((v) => v && String(v).toLowerCase().includes(q));
      });
      $("#lista", view).innerHTML = lista.length ? tabelaPedidos(lista) : '<p class="empty">Nenhum pedido encontrado.</p>';
      ligarLinhasPedido(view);
      return lista;
    };
    desenhar();

    $("#busca", view).addEventListener("input", (ev) => { f.busca = ev.target.value; desenhar(); });
    $$(".chips button", view).forEach((b) => b.addEventListener("click", () => {
      f.status = b.dataset.status;
      $$(".chips button", view).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      desenhar();
    }));
    $("#novo", view).addEventListener("click", () => abrirPedido(null));
    $("#exportar", view).addEventListener("click", () => exportarCSV(desenhar()));
  }

  function exportarCSV(lista) {
    const linhas = [["Pedido", "Data", "Cliente", "E-mail", "Telefone", "Itens", "Subtotal", "Frete", "Desconto", "Total", "Status", "Pagamento", "Canal", "Rastreio"]];
    lista.forEach((p) => {
      const c = cliente(p.cliente_id) || {};
      linhas.push([p.codigo, dataHora(p.criado_em), c.nome || "", c.email || "", c.telefone || "",
        itensDe(p.id).map((i) => i.quantidade + "x " + i.nome).join(" | "),
        p.subtotal, p.frete, p.desconto, p.total, STATUS_PEDIDO[p.status] || p.status, PAGAMENTOS[p.pagamento] || p.pagamento || "", CANAIS[p.canal] || p.canal || "", p.rastreio || ""]);
    });
    const csv = "﻿" + linhas.map((l) => l.map((v) => {
      const t = String(v == null ? "" : v);
      return /[;"\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
    }).join(";")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = "pedidos-fossil-tone-" + new Date().toISOString().slice(0, 10) + ".csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  function opcoes(mapa, atual) {
    return Object.keys(mapa).map((k) => `<option value="${k}"${k === atual ? " selected" : ""}>${esc(mapa[k])}</option>`).join("");
  }

  function abrirPedido(p) {
    const novo = !p;
    p = p || { status: "aguardando_pagamento", canal: "whatsapp", pagamento: "pix", frete: 0, desconto: 0 };
    let itens = novo ? [] : itensDe(p.id).map((i) => Object.assign({}, i));
    if (novo) itens.push({ produto_id: "", nome: "", quantidade: 1, preco_unitario: 0 });
    const c = cliente(p.cliente_id);
    const vendaveis = db.produtos.filter((x) => x.status !== "arquivado");

    const zap = c && c.telefone ? "https://wa.me/" + (c.telefone.replace(/\D/g, "").length <= 11 ? "55" : "") + c.telefone.replace(/\D/g, "") +
      "?text=" + encodeURIComponent(`Olá, ${c.nome.split(" ")[0]}! Aqui é da Fossil Tone. Seu pedido #${p.codigo} está: ${STATUS_PEDIDO[p.status]}.` + (p.rastreio ? ` Código de rastreio: ${p.rastreio}` : "")) : "";

    abrirGaveta(novo ? "Novo registro" : "Pedido #" + p.codigo, novo ? "Novo pedido" : (c ? c.nome : "Pedido sem cliente"), `
      ${novo ? "" : `<div>${stamp(p.status, STATUS_PEDIDO)}</div>
      <dl class="sheet">
        <div class="sheet__row"><dt>Feito em</dt><dd>${dataHora(p.criado_em)}</dd></div>
        ${c ? `<div class="sheet__row"><dt>Contato</dt><dd>${esc(c.email || "")}${c.email && c.telefone ? "<br>" : ""}${esc(c.telefone || "")}</dd></div>` : ""}
        ${p.cupom_codigo ? `<div class="sheet__row"><dt>Cupom</dt><dd>${esc(p.cupom_codigo)}</dd></div>` : ""}
      </dl>
      ${zap ? `<a class="link-btn" href="${esc(zap)}" target="_blank" rel="noopener">Avisar o cliente no WhatsApp ↗</a>` : ""}`}
      <form id="form-pedido" class="grid-form" novalidate style="display:grid;gap:1.1rem">
        <div class="grid2">
          <div class="field"><label for="p-status">Status</label><select id="p-status" name="status">${opcoes(STATUS_PEDIDO, p.status)}</select></div>
          <div class="field"><label for="p-cliente">Cliente</label><select id="p-cliente" name="cliente_id"><option value="">Sem cliente</option>${db.clientes.map((x) => `<option value="${esc(x.id)}"${x.id === p.cliente_id ? " selected" : ""}>${esc(x.nome)}</option>`).join("")}</select></div>
          <div class="field"><label for="p-canal">Canal</label><select id="p-canal" name="canal">${opcoes(CANAIS, p.canal)}</select></div>
          <div class="field"><label for="p-pag">Pagamento</label><select id="p-pag" name="pagamento">${opcoes(PAGAMENTOS, p.pagamento)}</select></div>
        </div>
        <div>
          <p class="sheet__title">Itens</p>
          <table class="items items--edit">
            <thead><tr><th>Produto</th><th class="num">Qtd.</th><th class="num">Preço un.</th><th class="num">Total</th><th></th></tr></thead>
            <tbody id="itens"></tbody>
            <tfoot>
              <tr><td colspan="5"><button class="link-btn" type="button" id="add-item">+ Adicionar item</button></td></tr>
              <tr><td colspan="3">Subtotal</td><td class="num" id="t-sub"></td><td></td></tr>
              <tr><td colspan="2">Frete</td><td colspan="2"><input name="frete" inputmode="decimal" value="${esc(p.frete)}" aria-label="Frete" style="text-align:right"></td><td></td></tr>
              <tr><td colspan="2">Desconto</td><td colspan="2"><input name="desconto" inputmode="decimal" value="${esc(p.desconto)}" aria-label="Desconto" style="text-align:right"></td><td></td></tr>
              <tr><td colspan="3">Total</td><td class="num" id="t-total"></td><td></td></tr>
            </tfoot>
          </table>
        </div>
        <div class="grid2">
          <div class="field"><label for="p-rastreio">Código de rastreio</label><input id="p-rastreio" name="rastreio" value="${esc(p.rastreio || "")}" autocomplete="off"></div>
          <div class="field"><label for="p-cupom">Cupom usado</label><input id="p-cupom" name="cupom_codigo" value="${esc(p.cupom_codigo || "")}" autocomplete="off"></div>
        </div>
        <div class="field"><label for="p-end">Endereço de entrega</label><textarea id="p-end" name="endereco" rows="2">${esc(p.endereco || "")}</textarea></div>
        <div class="field"><label for="p-notas">Anotações internas</label><textarea id="p-notas" name="notas" rows="3">${esc(p.notas || "")}</textarea></div>
        <div class="actions">
          <button class="btn" type="submit">${novo ? "Registrar pedido" : "Salvar"}</button>
          <span class="spacer"></span>
          ${novo ? "" : '<button class="btn btn--danger btn--sm" type="button" id="excluir">Excluir</button>'}
        </div>
      </form>`);

    const form = $("#form-pedido");
    const corpo = $("#itens");

    function desenharItens() {
      corpo.innerHTML = itens.map((i, k) => `<tr>
        <td><select data-k="${k}" data-campo="produto_id" aria-label="Produto"><option value="">${esc(i.produto_id ? "" : i.nome || "Escolha…")}</option>${vendaveis.map((x) => `<option value="${esc(x.id)}"${x.id === i.produto_id ? " selected" : ""}>${esc(x.numero ? x.numero + " · " : "")}${esc(x.nome)}</option>`).join("")}</select></td>
        <td class="num"><input class="qtd" data-k="${k}" data-campo="quantidade" type="number" min="1" step="1" value="${esc(i.quantidade)}" aria-label="Quantidade"></td>
        <td class="num"><input data-k="${k}" data-campo="preco_unitario" inputmode="decimal" value="${esc(i.preco_unitario)}" aria-label="Preço unitário" style="width:6.5rem;text-align:right"></td>
        <td class="num">${dinheiro(i.quantidade * i.preco_unitario)}</td>
        <td><button class="rm" type="button" data-rm="${k}" aria-label="Remover item">×</button></td>
      </tr>`).join("");
      totais();
    }
    function totais() {
      const sub = itens.reduce((s, i) => s + i.quantidade * i.preco_unitario, 0);
      $("#t-sub").textContent = dinheiro(sub);
      $("#t-total").textContent = dinheiro(Math.max(0, sub + numero(form.frete.value) - numero(form.desconto.value)));
      return sub;
    }
    corpo.addEventListener("change", (ev) => {
      const el = ev.target, k = +el.dataset.k, i = itens[k];
      if (!i) return;
      if (el.dataset.campo === "produto_id") {
        const prod = db.produtos.find((x) => x.id === el.value);
        i.produto_id = el.value;
        if (prod) { i.nome = prod.nome; i.preco_unitario = Number(prod.preco_promocional || prod.preco); }
      } else if (el.dataset.campo === "quantidade") i.quantidade = Math.max(1, inteiro(el.value));
      else i.preco_unitario = numero(el.value);
      desenharItens();
    });
    corpo.addEventListener("click", (ev) => {
      const rm = ev.target.closest("[data-rm]");
      if (rm) { itens.splice(+rm.dataset.rm, 1); desenharItens(); }
    });
    $("#add-item").addEventListener("click", () => { itens.push({ produto_id: "", nome: "", quantidade: 1, preco_unitario: 0 }); desenharItens(); });
    form.frete.addEventListener("input", totais);
    form.desconto.addEventListener("input", totais);
    desenharItens();

    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const validos = itens.filter((i) => i.nome);
      if (!validos.length) return toast("Adicione pelo menos um item.", true);
      const sub = totais();
      const frete = numero(form.frete.value), desconto = numero(form.desconto.value);
      const dados = {
        status: form.status.value, cliente_id: form.cliente_id.value || null, canal: form.canal.value, pagamento: form.pagamento.value,
        subtotal: sub, frete, desconto, total: Math.max(0, sub + frete - desconto),
        rastreio: vazioNulo(form.rastreio.value), cupom_codigo: vazioNulo(form.cupom_codigo.value),
        endereco: vazioNulo(form.endereco.value), notas: vazioNulo(form.notas.value)
      };
      if (!novo) dados.id = p.id;
      const salvo = await tentar(() => fonte.salvarPedido(dados, validos), $("button[type=submit]", form));
      if (!salvo) return;
      await tentar(recarregar);
      fecharGaveta();
      rotear();
      toast(novo ? `Pedido #${salvo.codigo} registrado.` : "Pedido salvo.");
    });

    const ex = $("#excluir");
    if (ex) ex.addEventListener("click", async () => {
      if (!confirm(`Excluir o pedido #${p.codigo}? Isso não pode ser desfeito.`)) return;
      if (await tentar(() => fonte.excluir("pedidos", p.id).then(() => true), ex)) {
        await tentar(recarregar); fecharGaveta(); rotear(); toast("Pedido excluído.");
      }
    });
  }

  /* ==========================================================
     PRODUTOS
     ========================================================== */

  function telaProdutos(view) {
    const f = filtros.produtos;
    const contagem = (s) => db.produtos.filter((p) => !s || p.status === s).length;
    view.innerHTML = cabecalho("02 · Acervo", "Produtos", `<button class="btn btn--sm" type="button" id="novo">Novo produto</button>`) + `
      <div class="toolbar">
        <input class="search" type="search" id="busca" placeholder="Buscar nome, nº ou SKU" value="${esc(f.busca)}" aria-label="Buscar produtos">
        <div class="chips" role="group" aria-label="Filtrar por situação">
          <button type="button" data-status="" aria-pressed="${!f.status}">Todos<b>${contagem("")}</b></button>
          ${Object.keys(STATUS_PRODUTO).map((s) => `<button type="button" data-status="${s}" aria-pressed="${f.status === s}">${STATUS_PRODUTO[s]}<b>${contagem(s)}</b></button>`).join("")}
        </div>
      </div>
      <div id="lista"></div>`;

    const desenhar = () => {
      const q = f.busca.trim().toLowerCase();
      const lista = db.produtos.filter((p) => (!f.status || p.status === f.status) &&
        (!q || [p.nome, p.numero, p.sku, p.slug].some((v) => v && v.toLowerCase().includes(q))));
      $("#lista", view).innerHTML = !lista.length ? '<p class="empty">Nenhum produto encontrado.</p>' : `<div class="table-wrap"><table class="table table--cards">
        <thead><tr><th></th><th>Produto</th><th>Tipo</th><th class="num">Preço</th><th class="num">Estoque</th><th>Situação</th></tr></thead>
        <tbody>${lista.map((p) => `<tr data-produto="${esc(p.id)}" tabindex="0">
          <td data-label="">${p.foto ? `<img class="thumb" src="${esc(fotoUrl(p.foto))}" alt="" loading="lazy">` : '<span class="thumb thumb--vazio">sem foto</span>'}</td>
          <td data-label="Produto"><span><span class="strong">${esc(p.nome)}</span><span class="sub">${esc([p.numero, p.sku].filter(Boolean).join(" · "))}</span></span></td>
          <td data-label="Tipo">${esc(TIPOS[p.tipo] || p.tipo)}</td>
          <td data-label="Preço" class="num">${p.preco_promocional ? `<s class="sub" style="display:inline">${dinheiro(p.preco)}</s> ${dinheiro(p.preco_promocional)}` : dinheiro(p.preco)}</td>
          <td data-label="Estoque" class="num ${p.status === "ativo" && p.estoque <= p.estoque_minimo ? "warn" : ""}">${p.estoque}</td>
          <td data-label="Situação">${stamp(p.status, STATUS_PRODUTO)}</td>
        </tr>`).join("")}</tbody></table></div>`;
      $$("tr[data-produto]", view).forEach((tr) => {
        const abrir = () => abrirProduto(db.produtos.find((p) => p.id === tr.dataset.produto));
        tr.addEventListener("click", abrir);
        tr.addEventListener("keydown", (ev) => { if (ev.key === "Enter") abrir(); });
      });
    };
    desenhar();
    $("#busca", view).addEventListener("input", (ev) => { f.busca = ev.target.value; desenhar(); });
    $$(".chips button", view).forEach((b) => b.addEventListener("click", () => {
      f.status = b.dataset.status;
      $$(".chips button", view).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      desenhar();
    }));
    $("#novo", view).addEventListener("click", () => abrirProduto(null));
  }

  function abrirProduto(p) {
    const novo = !p;
    p = p || { tipo: "pedal", status: "rascunho", preco: 0, estoque: 0, estoque_minimo: 2 };
    abrirGaveta(novo ? "Nova peça" : (p.numero || "Produto"), novo ? "Novo produto" : p.nome, `
      <form id="form-produto" novalidate style="display:grid;gap:1.1rem">
        <div class="grid2">
          <div class="field"><label for="pr-nome">Nome</label><input id="pr-nome" name="nome" value="${esc(p.nome || "")}" required></div>
          <div class="field"><label for="pr-slug">Identificador</label><input id="pr-slug" name="slug" value="${esc(p.slug || "")}" pattern="[a-z0-9-]+"><small>Letras minúsculas e hífen. Vira o endereço do produto na loja.</small></div>
          <div class="field"><label for="pr-numero">Nº de catálogo</label><input id="pr-numero" name="numero" value="${esc(p.numero || "")}" placeholder="FT-003"></div>
          <div class="field"><label for="pr-sku">SKU</label><input id="pr-sku" name="sku" value="${esc(p.sku || "")}"></div>
          <div class="field"><label for="pr-tipo">Tipo</label><select id="pr-tipo" name="tipo">${opcoes(TIPOS, p.tipo)}</select></div>
          <div class="field"><label for="pr-status">Situação</label><select id="pr-status" name="status">${opcoes(STATUS_PRODUTO, p.status)}</select><small>Só "À venda", "Sob encomenda" e "Esgotado" aparecem na loja.</small></div>
        </div>
        <div class="grid3">
          <div class="field"><label for="pr-preco">Preço (R$)</label><input id="pr-preco" name="preco" inputmode="decimal" value="${esc(p.preco)}"></div>
          <div class="field"><label for="pr-promo">Promocional</label><input id="pr-promo" name="preco_promocional" inputmode="decimal" value="${esc(p.preco_promocional == null ? "" : p.preco_promocional)}" placeholder="opcional"></div>
          <div class="field"><label for="pr-peso">Peso (g)</label><input id="pr-peso" name="peso_g" type="number" min="0" value="${esc(p.peso_g == null ? "" : p.peso_g)}"></div>
          <div class="field"><label for="pr-estoque">Estoque</label><input id="pr-estoque" name="estoque" type="number" step="1" value="${esc(p.estoque)}"></div>
          <div class="field"><label for="pr-min">Estoque mínimo</label><input id="pr-min" name="estoque_minimo" type="number" min="0" step="1" value="${esc(p.estoque_minimo)}"><small>Abaixo disso, avisa na visão geral.</small></div>
        </div>
        <div class="field"><label for="pr-foto">Foto</label><input id="pr-foto" name="foto" value="${esc(p.foto || "")}" placeholder="assets/img/nome-thumb.jpg ou https://…"><small>Caminho dentro do site ou endereço completo da imagem.</small></div>
        <img class="foto-prev" id="pr-prev" alt="" ${p.foto ? `src="${esc(fotoUrl(p.foto))}"` : "hidden"}>
        <div class="field"><label for="pr-desc">Descrição</label><textarea id="pr-desc" name="descricao" rows="4">${esc(p.descricao || "")}</textarea></div>
        <div class="actions">
          <button class="btn" type="submit">${novo ? "Cadastrar produto" : "Salvar"}</button>
          <span class="spacer"></span>
          ${novo ? "" : '<button class="btn btn--danger btn--sm" type="button" id="excluir">Excluir</button>'}
        </div>
      </form>`);

    const form = $("#form-produto");
    let slugManual = !novo;
    form.slug.addEventListener("input", () => { slugManual = true; });
    form.nome.addEventListener("input", () => { if (!slugManual) form.slug.value = slug(form.nome.value); });
    form.foto.addEventListener("change", () => {
      const prev = $("#pr-prev"), v = form.foto.value.trim();
      prev.hidden = !v;
      if (v) prev.src = fotoUrl(v);
    });
    $("#pr-prev").addEventListener("error", (ev) => { ev.target.hidden = true; });

    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const nome = form.nome.value.trim();
      const s = slug(form.slug.value || nome);
      if (!nome) return toast("Dê um nome ao produto.", true);
      if (!s) return toast("Preencha o identificador.", true);
      const dados = {
        nome, slug: s, numero: vazioNulo(form.numero.value), sku: vazioNulo(form.sku.value),
        tipo: form.tipo.value, status: form.status.value,
        preco: numero(form.preco.value), preco_promocional: vazioNulo(form.preco_promocional.value) == null ? null : numero(form.preco_promocional.value),
        peso_g: vazioNulo(form.peso_g.value) == null ? null : inteiro(form.peso_g.value),
        estoque: inteiro(form.estoque.value), estoque_minimo: inteiro(form.estoque_minimo.value),
        foto: vazioNulo(form.foto.value), descricao: vazioNulo(form.descricao.value)
      };
      if (!novo) dados.id = p.id;
      const salvo = await tentar(() => fonte.salvar("produtos", dados), $("button[type=submit]", form));
      if (!salvo) return;
      await tentar(recarregar); fecharGaveta(); rotear();
      toast(novo ? "Produto cadastrado." : "Produto salvo.");
    });

    const ex = $("#excluir");
    if (ex) ex.addEventListener("click", async () => {
      const usado = db.itens_pedido.some((i) => i.produto_id === p.id);
      if (!confirm(usado ? `${p.nome} aparece em pedidos. Os pedidos continuam, mas perdem o vínculo com o produto. Para só tirar da loja, use a situação "Arquivado". Excluir mesmo assim?` : `Excluir ${p.nome}?`)) return;
      if (await tentar(() => fonte.excluir("produtos", p.id).then(() => true), ex)) {
        await tentar(recarregar); fecharGaveta(); rotear(); toast("Produto excluído.");
      }
    });
  }

  /* ==========================================================
     CLIENTES
     ========================================================== */

  function telaClientes(view) {
    const f = filtros.clientes;
    view.innerHTML = cabecalho("03 · Pessoas", "Clientes", `<button class="btn btn--sm" type="button" id="novo">Novo cliente</button>`) + `
      <div class="toolbar"><input class="search" type="search" id="busca" placeholder="Buscar nome, e-mail, telefone ou cidade" value="${esc(f.busca)}" aria-label="Buscar clientes"></div>
      <div id="lista"></div>`;

    const resumo = (c) => {
      const ps = db.pedidos.filter((p) => p.cliente_id === c.id);
      return { qtd: ps.length, gasto: ps.filter((p) => FATURADOS.includes(p.status)).reduce((s, p) => s + Number(p.total || 0), 0) };
    };
    const desenhar = () => {
      const q = f.busca.trim().toLowerCase();
      const lista = db.clientes.filter((c) => !q || [c.nome, c.email, c.telefone, c.cidade].some((v) => v && v.toLowerCase().includes(q)));
      $("#lista", view).innerHTML = !lista.length ? '<p class="empty">Nenhum cliente encontrado.</p>' : `<div class="table-wrap"><table class="table table--cards">
        <thead><tr><th>Cliente</th><th>Telefone</th><th>Cidade</th><th class="num">Pedidos</th><th class="num">Total comprado</th></tr></thead>
        <tbody>${lista.map((c) => { const r = resumo(c); return `<tr data-cliente="${esc(c.id)}" tabindex="0">
          <td data-label="Cliente"><span><span class="strong">${esc(c.nome)}</span><span class="sub">${esc(c.email || "")}</span></span></td>
          <td data-label="Telefone">${esc(c.telefone || "—")}</td>
          <td data-label="Cidade">${esc([c.cidade, c.uf].filter(Boolean).join(" / ") || "—")}</td>
          <td data-label="Pedidos" class="num">${r.qtd}</td>
          <td data-label="Total comprado" class="num">${dinheiro(r.gasto)}</td>
        </tr>`; }).join("")}</tbody></table></div>`;
      $$("tr[data-cliente]", view).forEach((tr) => {
        const abrir = () => abrirCliente(db.clientes.find((c) => c.id === tr.dataset.cliente));
        tr.addEventListener("click", abrir);
        tr.addEventListener("keydown", (ev) => { if (ev.key === "Enter") abrir(); });
      });
    };
    desenhar();
    $("#busca", view).addEventListener("input", (ev) => { f.busca = ev.target.value; desenhar(); });
    $("#novo", view).addEventListener("click", () => abrirCliente(null));
  }

  function abrirCliente(c) {
    const novo = !c;
    c = c || {};
    const pedidos = novo ? [] : db.pedidos.filter((p) => p.cliente_id === c.id);
    abrirGaveta(novo ? "Novo registro" : "Cliente desde " + data(c.criado_em), novo ? "Novo cliente" : c.nome, `
      <form id="form-cliente" novalidate style="display:grid;gap:1.1rem">
        <div class="field"><label for="c-nome">Nome</label><input id="c-nome" name="nome" value="${esc(c.nome || "")}" autocomplete="off" required></div>
        <div class="grid2">
          <div class="field"><label for="c-email">E-mail</label><input id="c-email" name="email" type="email" value="${esc(c.email || "")}" autocomplete="off"></div>
          <div class="field"><label for="c-tel">Telefone / WhatsApp</label><input id="c-tel" name="telefone" type="tel" value="${esc(c.telefone || "")}" autocomplete="off"></div>
        </div>
        <div class="grid2">
          <div class="field"><label for="c-cidade">Cidade</label><input id="c-cidade" name="cidade" value="${esc(c.cidade || "")}" autocomplete="off"></div>
          <div class="field"><label for="c-uf">UF</label><input id="c-uf" name="uf" maxlength="2" value="${esc(c.uf || "")}" autocomplete="off" style="text-transform:uppercase"></div>
        </div>
        <div class="field"><label for="c-notas">Anotações</label><textarea id="c-notas" name="notas" rows="3" placeholder="Equipamento, preferências de timbre, histórico…">${esc(c.notas || "")}</textarea></div>
        <div class="actions">
          <button class="btn" type="submit">${novo ? "Cadastrar cliente" : "Salvar"}</button>
          <span class="spacer"></span>
          ${novo ? "" : '<button class="btn btn--danger btn--sm" type="button" id="excluir">Excluir</button>'}
        </div>
      </form>
      ${novo ? "" : `<div><p class="sheet__title">Pedidos</p>${pedidos.length ? `<table class="items"><tbody>${pedidos.map((p) => `<tr data-pedido="${esc(p.id)}" style="cursor:pointer"><td><b>#${esc(p.codigo)}</b></td><td>${data(p.criado_em)}</td><td class="num">${dinheiro(p.total)}</td><td class="num">${stamp(p.status, STATUS_PEDIDO)}</td></tr>`).join("")}</tbody></table>` : "<p>Nenhum pedido ainda.</p>"}</div>`}`);

    $$("#drawer-body tr[data-pedido]").forEach((tr) => tr.addEventListener("click", () => abrirPedido(db.pedidos.find((p) => p.id === tr.dataset.pedido))));

    const form = $("#form-cliente");
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const nome = form.nome.value.trim();
      if (!nome) return toast("Preencha o nome.", true);
      const dados = {
        nome, email: vazioNulo(form.email.value && form.email.value.toLowerCase()), telefone: vazioNulo(form.telefone.value),
        cidade: vazioNulo(form.cidade.value), uf: vazioNulo(form.uf.value.toUpperCase()), notas: vazioNulo(form.notas.value)
      };
      if (!novo) dados.id = c.id;
      const salvo = await tentar(() => fonte.salvar("clientes", dados), $("button[type=submit]", form));
      if (!salvo) return;
      await tentar(recarregar); fecharGaveta(); rotear();
      toast(novo ? "Cliente cadastrado." : "Cliente salvo.");
    });

    const ex = $("#excluir");
    if (ex) ex.addEventListener("click", async () => {
      if (!confirm(pedidos.length ? `${c.nome} tem ${pedidos.length} pedido(s). Os pedidos ficam, mas sem cliente. Excluir mesmo assim?` : `Excluir ${c.nome}?`)) return;
      if (await tentar(() => fonte.excluir("clientes", c.id).then(() => true), ex)) {
        await tentar(recarregar); fecharGaveta(); rotear(); toast("Cliente excluído.");
      }
    });
  }

  /* ==========================================================
     CUPONS
     ========================================================== */

  function telaCupons(view) {
    const hoje = new Date().toISOString().slice(0, 10);
    const situacao = (c) => !c.ativo ? ["arquivado", "Pausado"] : c.validade && c.validade < hoje ? ["cancelado", "Vencido"] : c.limite_usos && c.usos >= c.limite_usos ? ["esgotado", "Esgotado"] : ["ativo", "Ativo"];
    view.innerHTML = cabecalho("04 · Promoções", "Cupons", `<button class="btn btn--sm" type="button" id="novo">Novo cupom</button>`) +
      (!db.cupons.length ? '<p class="empty">Nenhum cupom criado.</p>' : `<div class="table-wrap"><table class="table table--cards">
        <thead><tr><th>Código</th><th>Desconto</th><th class="num">Usos</th><th>Validade</th><th>Situação</th></tr></thead>
        <tbody>${db.cupons.map((c) => { const [st, rot] = situacao(c); return `<tr data-cupom="${esc(c.id)}" tabindex="0">
          <td data-label="Código" class="code">${esc(c.codigo)}</td>
          <td data-label="Desconto">${c.tipo === "percentual" ? esc(c.valor) + "%" : dinheiro(c.valor)}</td>
          <td data-label="Usos" class="num">${c.usos}${c.limite_usos ? " / " + c.limite_usos : ""}</td>
          <td data-label="Validade">${c.validade ? data(c.validade + "T12:00:00") : "Sem validade"}</td>
          <td data-label="Situação"><span class="stamp st-${st}">${rot}</span></td>
        </tr>`; }).join("")}</tbody></table></div>`);
    $$("tr[data-cupom]", view).forEach((tr) => {
      const abrir = () => abrirCupom(db.cupons.find((c) => c.id === tr.dataset.cupom));
      tr.addEventListener("click", abrir);
      tr.addEventListener("keydown", (ev) => { if (ev.key === "Enter") abrir(); });
    });
    $("#novo", view).addEventListener("click", () => abrirCupom(null));
  }

  function abrirCupom(c) {
    const novo = !c;
    c = c || { tipo: "percentual", valor: 10, ativo: true, usos: 0 };
    abrirGaveta(novo ? "Nova promoção" : "Usado " + c.usos + (c.usos === 1 ? " vez" : " vezes"), novo ? "Novo cupom" : c.codigo, `
      <form id="form-cupom" novalidate style="display:grid;gap:1.1rem">
        <div class="field"><label for="cu-codigo">Código</label><input id="cu-codigo" name="codigo" value="${esc(c.codigo || "")}" autocomplete="off" style="text-transform:uppercase" required><small>O que o cliente digita no carrinho.</small></div>
        <div class="grid2">
          <div class="field"><label for="cu-tipo">Tipo</label><select id="cu-tipo" name="tipo">${opcoes({ percentual: "Porcentagem (%)", valor: "Valor fixo (R$)" }, c.tipo)}</select></div>
          <div class="field"><label for="cu-valor">Desconto</label><input id="cu-valor" name="valor" inputmode="decimal" value="${esc(c.valor)}"></div>
          <div class="field"><label for="cu-limite">Limite de usos</label><input id="cu-limite" name="limite_usos" type="number" min="1" value="${esc(c.limite_usos == null ? "" : c.limite_usos)}" placeholder="sem limite"></div>
          <div class="field"><label for="cu-validade">Válido até</label><input id="cu-validade" name="validade" type="date" value="${esc(c.validade || "")}"></div>
        </div>
        <label class="check"><input type="checkbox" name="ativo"${c.ativo ? " checked" : ""}> Cupom ativo</label>
        <div class="actions">
          <button class="btn" type="submit">${novo ? "Criar cupom" : "Salvar"}</button>
          <span class="spacer"></span>
          ${novo ? "" : '<button class="btn btn--danger btn--sm" type="button" id="excluir">Excluir</button>'}
        </div>
      </form>`);

    const form = $("#form-cupom");
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const codigo = form.codigo.value.trim().toUpperCase().replace(/\s+/g, "");
      if (!codigo) return toast("Preencha o código.", true);
      const valor = numero(form.valor.value);
      if (form.tipo.value === "percentual" && (valor <= 0 || valor > 100)) return toast("A porcentagem vai de 1 a 100.", true);
      const dados = { codigo, tipo: form.tipo.value, valor, ativo: form.ativo.checked, validade: vazioNulo(form.validade.value), limite_usos: vazioNulo(form.limite_usos.value) == null ? null : inteiro(form.limite_usos.value) };
      if (!novo) dados.id = c.id;
      const salvo = await tentar(() => fonte.salvar("cupons", dados), $("button[type=submit]", form));
      if (!salvo) return;
      await tentar(recarregar); fecharGaveta(); rotear();
      toast(novo ? "Cupom criado." : "Cupom salvo.");
    });
    const ex = $("#excluir");
    if (ex) ex.addEventListener("click", async () => {
      if (!confirm(`Excluir o cupom ${c.codigo}?`)) return;
      if (await tentar(() => fonte.excluir("cupons", c.id).then(() => true), ex)) {
        await tentar(recarregar); fecharGaveta(); rotear(); toast("Cupom excluído.");
      }
    });
  }

  /* ==========================================================
     CONFIGURAÇÕES
     ========================================================== */

  async function telaConfiguracoes(view) {
    view.innerHTML = cabecalho("05 · Loja", "Configurações") + '<p class="loading">Carregando…</p>';
    const cfg = (await tentar(() => fonte.config("loja"))) || {};
    if (!view.isConnected || !$(".side__nav a.is-active[data-rota=configuracoes]")) return;
    view.innerHTML = cabecalho("05 · Loja", "Configurações") + `
      <form id="form-config" class="panel" novalidate style="display:grid;gap:1.2rem;max-width:760px">
        <h2 class="panel__title">Dados da loja</h2>
        <div class="grid2">
          <div class="field"><label for="cf-nome">Nome da loja</label><input id="cf-nome" name="nome" value="${esc(cfg.nome || "Fossil Tone")}"></div>
          <div class="field"><label for="cf-email">E-mail de contato</label><input id="cf-email" name="email" type="email" value="${esc(cfg.email || "")}"></div>
          <div class="field"><label for="cf-zap">WhatsApp</label><input id="cf-zap" name="whatsapp" inputmode="tel" value="${esc(cfg.whatsapp || "")}"><small>Só números, com DDI e DDD (ex.: 5519991226377).</small></div>
          <div class="field"><label for="cf-pix">Chave Pix</label><input id="cf-pix" name="pix" value="${esc(cfg.pix || "")}" autocomplete="off"></div>
        </div>
        <h2 class="panel__title">Entrega e produção</h2>
        <div class="grid3">
          <div class="field"><label for="cf-frete">Frete fixo (R$)</label><input id="cf-frete" name="freteFixo" inputmode="decimal" value="${esc(cfg.freteFixo == null ? "" : cfg.freteFixo)}"></div>
          <div class="field"><label for="cf-gratis">Frete grátis acima de</label><input id="cf-gratis" name="freteGratisAcima" inputmode="decimal" value="${esc(cfg.freteGratisAcima == null ? "" : cfg.freteGratisAcima)}" placeholder="sem frete grátis"></div>
          <div class="field"><label for="cf-prazo">Prazo de produção (dias)</label><input id="cf-prazo" name="prazoProducaoDias" type="number" min="0" value="${esc(cfg.prazoProducaoDias == null ? "" : cfg.prazoProducaoDias)}"></div>
        </div>
        <div class="actions"><button class="btn" type="submit">Salvar configurações</button></div>
      </form>
      <section class="panel" style="max-width:760px;margin-top:1rem">
        <h2 class="panel__title" style="margin-bottom:.6rem">Acesso ao painel</h2>
        ${fonte.modo === "demo"
          ? "<p>Na demonstração não há login. Quando o Supabase estiver ligado, quem pode entrar é definido lá, na tabela <b>admins</b>. O passo a passo está em <b>backend/COMO-CONFIGURAR-PAINEL-ADMIN.md</b>.</p>"
          : "<p>Novos administradores são criados no Supabase: <b>Authentication › Users › Add user</b> e depois uma linha na tabela <b>admins</b>. O passo a passo está em <b>backend/COMO-CONFIGURAR-PAINEL-ADMIN.md</b>.</p>"}
      </section>`;

    const form = $("#form-config", view);
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const opcional = (v) => vazioNulo(v) == null ? null : numero(v);
      const valor = Object.assign({}, cfg, {
        nome: form.nome.value.trim(), email: form.email.value.trim(), whatsapp: form.whatsapp.value.replace(/\D/g, ""), pix: form.pix.value.trim(),
        freteFixo: opcional(form.freteFixo.value), freteGratisAcima: opcional(form.freteGratisAcima.value),
        prazoProducaoDias: vazioNulo(form.prazoProducaoDias.value) == null ? null : inteiro(form.prazoProducaoDias.value)
      });
      const ok = await tentar(() => fonte.salvarConfig("loja", valor).then(() => true), $("button[type=submit]", form));
      if (ok) toast("Configurações salvas.");
    });
  }

  /* ==========================================================
     GAVETA
     ========================================================== */

  let focoAntes = null;

  function abrirGaveta(no, titulo, html) {
    const d = $("#drawer");
    if (d.hidden) focoAntes = document.activeElement;
    $("#drawer-no").textContent = no;
    $("#drawer-title").textContent = titulo;
    $("#drawer-body").innerHTML = html;
    $("#drawer-body").scrollTop = 0;
    d.hidden = false;
    document.body.style.overflow = "hidden";
    const primeiro = $("#drawer-body input:not([type=hidden]), #drawer-body select, #drawer-body textarea");
    (primeiro || $(".drawer__close")).focus({ preventScroll: true });
  }

  function fecharGaveta() {
    const d = $("#drawer");
    if (d.hidden) return;
    d.hidden = true;
    document.body.style.overflow = "";
    if (focoAntes && focoAntes.isConnected) focoAntes.focus({ preventScroll: true });
  }

  function ligarGaveta() {
    $$("#drawer [data-fechar]").forEach((b) => b.addEventListener("click", fecharGaveta));
    document.addEventListener("keydown", (ev) => {
      const d = $("#drawer");
      if (d.hidden) return;
      if (ev.key === "Escape") { fecharGaveta(); return; }
      if (ev.key === "Tab") {
        const focaveis = $$("#drawer .drawer__panel button, #drawer .drawer__panel input, #drawer .drawer__panel select, #drawer .drawer__panel textarea, #drawer .drawer__panel a[href]").filter((el) => !el.disabled && el.offsetParent !== null);
        if (!focaveis.length) return;
        const pri = focaveis[0], ult = focaveis[focaveis.length - 1];
        if (ev.shiftKey && document.activeElement === pri) { ev.preventDefault(); ult.focus(); }
        else if (!ev.shiftKey && document.activeElement === ult) { ev.preventDefault(); pri.focus(); }
      }
    });
  }

  /* ==========================================================
     INÍCIO
     ========================================================== */

  async function iniciar() {
    ligarEntrada();
    ligarGaveta();
    window.addEventListener("hashchange", () => { fecharGaveta(); rotear(); });

    if (!window.FTDados.configurado()) {
      const demo = window.FTDados.demo();
      if (await demo.sessao()) { fonte = demo; return abrirApp({ email: "demonstracao" }); }
      abrirGate();
      $("#gate-demo").hidden = false;
      return;
    }

    abrirGate();
    $("#gate-demo").hidden = true;
    try {
      fonte = await window.FTDados.supabase();
    } catch (e) {
      erroGate("entrar-erro", e.message);
      return;
    }
    let recuperando = /type=recovery/.test(location.hash);
    fonte.aoRecuperar(() => { recuperando = true; abrirGate(); mostrarForm("form-nova-senha"); });
    if (recuperando) { mostrarForm("form-nova-senha"); return; }

    const s = await fonte.sessao();
    if (s && await tentar(() => fonte.ehAdmin())) return abrirApp(s);
    if (s) await fonte.sair();
    mostrarForm("form-entrar");
  }

  iniciar();
})();
