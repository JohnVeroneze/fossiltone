/* ==========================================================
   Fossil Tone — painel admin: camada de dados
   Duas fontes com a mesma interface:
   - Supabase: login real e banco compartilhado
   - demonstração: dados de exemplo guardados só neste navegador
   ========================================================== */

(function () {
  "use strict";

  const SUPABASE_JS = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js";
  const DEMO_KEY = "ft-admin-demo-v1";

  const TABELAS = ["produtos", "clientes", "pedidos", "itens_pedido", "cupons", "configuracoes"];

  const ORDEM = {
    produtos: ["numero", true],
    clientes: ["nome", true],
    pedidos: ["criado_em", false],
    itens_pedido: ["nome", true],
    cupons: ["criado_em", false],
    configuracoes: ["chave", true]
  };

  function carregarScript(src) {
    return new Promise((ok, falha) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = ok;
      s.onerror = () => falha(new Error("Não foi possível carregar o Supabase. Verifique a internet."));
      document.head.appendChild(s);
    });
  }

  function uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  /* ---------- Supabase ---------- */

  async function fonteSupabase(cfg) {
    if (!window.supabase) await carregarScript(SUPABASE_JS);
    const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });

    function erro(res) {
      if (res.error) throw new Error(traduzirErro(res.error.message));
      return res.data;
    }

    return {
      modo: "supabase",

      async sessao() {
        const { data } = await sb.auth.getSession();
        return data.session ? { email: data.session.user.email } : null;
      },

      async entrar(email, senha) {
        erro(await sb.auth.signInWithPassword({ email, password: senha }));
        const admin = erro(await sb.rpc("sou_admin"));
        if (!admin) {
          await sb.auth.signOut();
          throw new Error("Este usuário não tem acesso ao painel.");
        }
        return { email };
      },

      // está na lista de admins (o banco só libera os dados depois do segundo fator)
      async ehAdmin() {
        return erro(await sb.rpc("sou_admin")) === true;
      },

      /* ---------- verificação em duas etapas ----------
         "ok": sessão já passou pelo código; "verificar": tem o app, falta o código;
         "cadastrar": ainda não ligou o Google Authenticator */
      async estadoMfa() {
        const nivel = erro(await sb.auth.mfa.getAuthenticatorAssuranceLevel());
        if (nivel.currentLevel === "aal2") return "ok";
        const fatores = erro(await sb.auth.mfa.listFactors());
        return fatores.totp.some((f) => f.status === "verified") ? "verificar" : "cadastrar";
      },

      async cadastrarMfa() {
        // uma tentativa anterior não concluída bloquearia o nome do fator
        const fatores = erro(await sb.auth.mfa.listFactors());
        for (const f of fatores.all.filter((x) => x.factor_type === "totp" && x.status !== "verified")) {
          erro(await sb.auth.mfa.unenroll({ factorId: f.id }));
        }
        const d = erro(await sb.auth.mfa.enroll({ factorType: "totp", issuer: "Fossil Tone", friendlyName: "Google Authenticator" }));
        return { id: d.id, qr: d.totp.qr_code, segredo: d.totp.secret };
      },

      async confirmarCodigo(codigo, factorId) {
        let id = factorId;
        if (!id) {
          const fatores = erro(await sb.auth.mfa.listFactors());
          const f = fatores.totp.find((x) => x.status === "verified");
          if (!f) throw new Error("Nenhum autenticador cadastrado.");
          id = f.id;
        }
        erro(await sb.auth.mfa.challengeAndVerify({ factorId: id, code: codigo }));
      },

      async fatoresMfa() {
        const fatores = erro(await sb.auth.mfa.listFactors());
        return fatores.totp.filter((f) => f.status === "verified").map((f) => ({ nome: f.friendly_name, desde: f.created_at }));
      },

      async sair() { await sb.auth.signOut(); },

      async recuperar(email) {
        const volta = location.href.split("#")[0];
        erro(await sb.auth.resetPasswordForEmail(email, { redirectTo: volta }));
      },

      async novaSenha(senha) { erro(await sb.auth.updateUser({ password: senha })); },

      aoRecuperar(fn) {
        sb.auth.onAuthStateChange((evento) => { if (evento === "PASSWORD_RECOVERY") fn(); });
      },

      async listar(tabela) {
        const [col, asc] = ORDEM[tabela];
        return erro(await sb.from(tabela).select("*").order(col, { ascending: asc }));
      },

      async salvar(tabela, linha) {
        const dados = erro(await sb.from(tabela).upsert(linha).select().single());
        return dados;
      },

      async excluir(tabela, id) {
        erro(await sb.from(tabela).delete().eq("id", id));
      },

      async salvarPedido(pedido, itens) {
        const salvo = erro(await sb.from("pedidos").upsert(pedido).select().single());
        erro(await sb.from("itens_pedido").delete().eq("pedido_id", salvo.id));
        if (itens.length) {
          erro(await sb.from("itens_pedido").insert(itens.map((i) => ({
            pedido_id: salvo.id, produto_id: i.produto_id || null, nome: i.nome,
            quantidade: i.quantidade, preco_unitario: i.preco_unitario
          }))));
        }
        return salvo;
      },

      async config(chave) {
        const d = erro(await sb.from("configuracoes").select("valor").eq("chave", chave).maybeSingle());
        return d ? d.valor : {};
      },

      async salvarConfig(chave, valor) {
        erro(await sb.from("configuracoes").upsert({ chave, valor }));
      }
    };
  }

  function traduzirErro(msg) {
    if (/Invalid login credentials/i.test(msg)) return "E-mail ou senha incorretos.";
    if (/Email not confirmed/i.test(msg)) return "Confirme o e-mail antes de entrar.";
    if (/rate limit/i.test(msg)) return "Muitas tentativas. Espere alguns minutos.";
    if (/duplicate key/i.test(msg)) return "Já existe um registro com esse código ou e-mail.";
    if (/row-level security/i.test(msg)) return "Sem permissão para essa ação.";
    if (/Failed to fetch/i.test(msg)) return "Sem conexão com o servidor.";
    if (/Invalid TOTP code|invalid.*code/i.test(msg)) return "Código incorreto. Confira o relógio do celular e use o código atual.";
    if (/AAL2 session is required/i.test(msg)) return "Confirme o código do Google Authenticator antes.";
    return msg;
  }

  /* ---------- demonstração ---------- */

  function semente() {
    const dia = 86400000;
    const agora = Date.now();
    const quando = (d, h) => new Date(agora - d * dia - (h || 0) * 3600000).toISOString();

    const produtos = [
      { id: uuid(), slug: "megalodon", numero: "FT-001", nome: "Megalodon", tipo: "pedal", preco: 890, preco_promocional: null, estoque: 3, estoque_minimo: 2, status: "ativo", sku: "FT-MEG-01", descricao: "Overdrive e distortion de dois estágios. Primeira edição.", foto: "assets/img/megalodon-angle-thumb.jpg", peso_g: 420, criado_em: quando(60), atualizado_em: quando(2) },
      { id: uuid(), slug: "kraken", numero: "FT-002", nome: "Kraken", tipo: "amplificador", preco: 6900, preco_promocional: null, estoque: 0, estoque_minimo: 0, status: "sob_encomenda", sku: "FT-KRK-01", descricao: "Amplificador valvulado. Lista de espera aberta.", foto: "assets/figuras/kraken-estatico.png", peso_g: 14000, criado_em: quando(45), atualizado_em: quando(5) },
      { id: uuid(), slug: "zero", numero: "FT-L01", nome: "ZeRO", tipo: "pedal", preco: 650, preco_promocional: 590, estoque: 1, estoque_minimo: 2, status: "ativo", sku: "FT-ZER-01", descricao: "Fuzz com chave Si/Ge. Peça do laboratório.", foto: "assets/figuras/zero-estatico.png", peso_g: 380, criado_em: quando(30), atualizado_em: quando(1) },
      { id: uuid(), slug: "cabo-patch", numero: "FT-A01", nome: "Cabo patch 15 cm", tipo: "acessorio", preco: 45, preco_promocional: null, estoque: 22, estoque_minimo: 10, status: "rascunho", sku: "FT-CAB-15", descricao: "", foto: "", peso_g: 40, criado_em: quando(10), atualizado_em: quando(10) }
    ];

    const nomes = [
      ["Rafael Monteiro", "rafael.m@exemplo.com", "(11) 98811-2041", "São Paulo", "SP"],
      ["Bianca Tavares", "bianca.t@exemplo.com", "(19) 99102-7733", "Campinas", "SP"],
      ["Diego Arantes", "diego.arantes@exemplo.com", "(31) 98420-1180", "Belo Horizonte", "MG"],
      ["Lívia Prado", "livia.prado@exemplo.com", "(41) 99733-5021", "Curitiba", "PR"],
      ["Otávio Lemos", "otavio@exemplo.com", "(21) 97650-3398", "Rio de Janeiro", "RJ"],
      ["Marina Kato", "marina.kato@exemplo.com", "(16) 99200-4410", "Ribeirão Preto", "SP"]
    ];
    const clientes = nomes.map((n, i) => ({ id: uuid(), nome: n[0], email: n[1], telefone: n[2], cidade: n[3], uf: n[4], notas: "", criado_em: quando(50 - i * 6) }));

    const roteiro = [
      [1, 0, 0, 1, "aguardando_pagamento", "pix"],
      [2, 1, 2, 1, "pago", "cartao"],
      [3, 2, 0, 1, "em_producao", "pix"],
      [5, 3, 0, 2, "em_producao", "pix"],
      [7, 4, 2, 1, "enviado", "cartao"],
      [9, 5, 0, 1, "enviado", "pix"],
      [12, 0, 2, 1, "entregue", "pix"],
      [15, 1, 0, 1, "entregue", "cartao"],
      [18, 2, 0, 1, "cancelado", "pix"],
      [21, 3, 2, 1, "entregue", "pix"],
      [26, 4, 0, 1, "entregue", "cartao"],
      [33, 5, 0, 1, "entregue", "pix"],
      [38, 1, 2, 2, "entregue", "pix"]
    ];
    const pedidos = [];
    const itens = [];
    roteiro.forEach((r, i) => {
      const [d, c, p, q, status, pagamento] = r;
      const prod = produtos[p];
      const preco = prod.preco_promocional || prod.preco;
      const subtotal = preco * q;
      const frete = 38.9;
      const id = uuid();
      pedidos.push({
        id, codigo: 1001 + roteiro.length - 1 - i, cliente_id: clientes[c].id, status, canal: i % 3 === 0 ? "whatsapp" : "site", pagamento,
        subtotal, frete, desconto: 0, total: subtotal + frete, cupom_codigo: null,
        rastreio: status === "enviado" || status === "entregue" ? "QB" + (482910350 + i * 7) + "BR" : "",
        endereco: clientes[c].cidade + " / " + clientes[c].uf, notas: "", criado_em: quando(d, 3 + i), atualizado_em: quando(d)
      });
      itens.push({ id: uuid(), pedido_id: id, produto_id: prod.id, nome: prod.nome, quantidade: q, preco_unitario: preco });
    });

    const cupons = [
      { id: uuid(), codigo: "PRIMEIRAEDICAO", tipo: "percentual", valor: 10, ativo: true, validade: null, limite_usos: 20, usos: 4, criado_em: quando(40) },
      { id: uuid(), codigo: "FRETE50", tipo: "valor", valor: 50, ativo: false, validade: null, limite_usos: null, usos: 2, criado_em: quando(20) }
    ];

    const configuracoes = [{ chave: "loja", valor: { nome: "Fossil Tone", email: "fossiltonefx@gmail.com", whatsapp: "5519991226377", freteFixo: 38.9, freteGratisAcima: 1500, prazoProducaoDias: 15, pix: "" } }];

    return { produtos, clientes, pedidos, itens_pedido: itens, cupons, configuracoes };
  }

  function fonteDemo() {
    let db;
    try { db = JSON.parse(localStorage.getItem(DEMO_KEY)); } catch (e) { db = null; }
    if (!db || !TABELAS.every((t) => Array.isArray(db[t]))) db = semente();

    const gravar = () => { try { localStorage.setItem(DEMO_KEY, JSON.stringify(db)); } catch (e) { /* sem armazenamento: segue em memória */ } };
    gravar();
    const copia = (x) => JSON.parse(JSON.stringify(x));
    let logado = false;
    try { logado = sessionStorage.getItem(DEMO_KEY + "-sessao") === "1"; } catch (e) { /* idem */ }

    function ordenar(tabela, lista) {
      const [col, asc] = ORDEM[tabela];
      return lista.sort((a, b) => {
        const x = a[col] == null ? "" : a[col], y = b[col] == null ? "" : b[col];
        return (x > y ? 1 : x < y ? -1 : 0) * (asc ? 1 : -1);
      });
    }

    function salvarLinha(tabela, linha) {
      const chave = tabela === "configuracoes" ? "chave" : "id";
      const lista = db[tabela];
      const i = lista.findIndex((l) => l[chave] === linha[chave] && linha[chave] != null);
      const agora = new Date().toISOString();
      if (i >= 0) {
        lista[i] = Object.assign({}, lista[i], linha, "atualizado_em" in lista[i] ? { atualizado_em: agora } : {});
        return lista[i];
      }
      const nova = Object.assign({ id: uuid(), criado_em: agora }, linha);
      if (tabela === "pedidos" && nova.codigo == null) nova.codigo = Math.max(1000, ...db.pedidos.map((p) => p.codigo || 0)) + 1;
      if (tabela === "produtos" || tabela === "pedidos") nova.atualizado_em = agora;
      lista.push(nova);
      return nova;
    }

    return {
      modo: "demo",
      async sessao() { return logado ? { email: "demonstracao" } : null; },
      async entrar() {
        logado = true;
        try { sessionStorage.setItem(DEMO_KEY + "-sessao", "1"); } catch (e) { /* idem */ }
        return { email: "demonstracao" };
      },
      async ehAdmin() { return true; },
      async estadoMfa() { return "ok"; },
      async fatoresMfa() { return []; },
      async sair() {
        logado = false;
        try { sessionStorage.removeItem(DEMO_KEY + "-sessao"); } catch (e) { /* idem */ }
      },
      async recuperar() { throw new Error("Indisponível na demonstração."); },
      async novaSenha() { throw new Error("Indisponível na demonstração."); },
      aoRecuperar() {},
      async listar(tabela) { return ordenar(tabela, copia(db[tabela])); },
      async salvar(tabela, linha) {
        if (tabela === "cupons" || tabela === "clientes") {
          const campo = tabela === "cupons" ? "codigo" : "email";
          const v = linha[campo];
          if (v && db[tabela].some((l) => l[campo] === v && l.id !== linha.id)) throw new Error("Já existe um registro com esse código ou e-mail.");
        }
        if (tabela === "produtos" && db.produtos.some((l) => l.slug === linha.slug && l.id !== linha.id)) throw new Error("Já existe um produto com esse identificador.");
        const r = salvarLinha(tabela, linha); gravar(); return copia(r);
      },
      async excluir(tabela, id) {
        db[tabela] = db[tabela].filter((l) => l.id !== id);
        if (tabela === "pedidos") db.itens_pedido = db.itens_pedido.filter((i) => i.pedido_id !== id);
        if (tabela === "clientes") db.pedidos.forEach((p) => { if (p.cliente_id === id) p.cliente_id = null; });
        if (tabela === "produtos") db.itens_pedido.forEach((i) => { if (i.produto_id === id) i.produto_id = null; });
        gravar();
      },
      async salvarPedido(pedido, itens) {
        const salvo = salvarLinha("pedidos", pedido);
        db.itens_pedido = db.itens_pedido.filter((i) => i.pedido_id !== salvo.id);
        itens.forEach((i) => db.itens_pedido.push({ id: uuid(), pedido_id: salvo.id, produto_id: i.produto_id || null, nome: i.nome, quantidade: i.quantidade, preco_unitario: i.preco_unitario }));
        gravar();
        return copia(salvo);
      },
      async config(chave) {
        const c = db.configuracoes.find((l) => l.chave === chave);
        return c ? copia(c.valor) : {};
      },
      async salvarConfig(chave, valor) { salvarLinha("configuracoes", { chave, valor }); gravar(); },
      reiniciar() { db = semente(); gravar(); }
    };
  }

  window.FTDados = {
    configurado() {
      const c = window.FT_ADMIN_CONFIG || {};
      return Boolean(c.supabaseUrl && c.supabaseAnonKey);
    },
    async supabase() { return fonteSupabase(window.FT_ADMIN_CONFIG); },
    demo() { return fonteDemo(); }
  };
})();
