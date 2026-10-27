/* ==========================================================
   Fossil Tone — painel admin: camada de dados
   Duas fontes com a mesma interface:
   - Supabase: login real e banco compartilhado
   - demonstração: dados de exemplo guardados só neste navegador
   ========================================================== */

(function () {
  "use strict";

  const SUPABASE_JS = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js";
  const DEMO_KEY = "ft-admin-demo-v2";

  const TABELAS = ["produtos", "clientes", "pedidos", "itens_pedido", "cupons", "configuracoes", "contatos", "acervo", "midias", "emails", "anexos"];
  const BUCKET = "acervo";

  const ORDEM = {
    produtos: ["numero", true],
    clientes: ["nome", true],
    pedidos: ["criado_em", false],
    itens_pedido: ["nome", true],
    cupons: ["criado_em", false],
    configuracoes: ["chave", true],
    contatos: ["criado_em", false],
    acervo: ["ordem", true],
    midias: ["ordem", true],
    emails: ["criado_em", false],
    anexos: ["criado_em", true]
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
        // a caixa de e-mails pode crescer: o painel carrega os 500 mais recentes
        if (tabela === "emails") return erro(await sb.from(tabela).select("*").order(col, { ascending: asc }).limit(500));
        return erro(await sb.from(tabela).select("*").order(col, { ascending: asc }));
      },

      async salvar(tabela, linha) {
        const dados = erro(await sb.from(tabela).upsert(linha).select().single());
        return dados;
      },

      // muda só alguns campos de uma linha que já existe; o upsert com a linha
      // incompleta vira um INSERT e esbarra nas colunas obrigatórias (ex.: "tipo" dos contatos)
      async atualizar(tabela, id, campos) {
        return erro(await sb.from(tabela).update(campos).eq("id", id).select().single());
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
      },

      /* ---------- arquivos do acervo (storage "acervo") ---------- */

      async enviarArquivo(caminho, blob) {
        erro(await sb.storage.from(BUCKET).upload(caminho, blob, { contentType: blob.type, cacheControl: "31536000", upsert: false }));
        return caminho;
      },

      async removerArquivos(caminhos) {
        const doStorage = caminhos.filter((c) => c && !c.startsWith("assets/"));
        if (doStorage.length) erro(await sb.storage.from(BUCKET).remove(doStorage));
      },

      /* ---------- e-mails ---------- */

      // a resposta sai pelo Brevo na função enviar-email (a chave fica no Supabase, nunca no navegador)
      async enviarEmail(dados) {
        const { data, error } = await sb.functions.invoke("enviar-email", { body: dados });
        if (error) {
          let msg = error.message;
          try { const j = await error.context.json(); if (j && j.erro) msg = j.erro; } catch (e) { /* sem corpo */ }
          throw new Error(traduzirErro(msg));
        }
        return data;
      },

      // anexos ficam num storage privado: o link vale 10 minutos
      async urlAnexo(caminho) {
        const d = erro(await sb.storage.from("emails").createSignedUrl(caminho, 600, { download: true }));
        return d.signedUrl;
      },

      async removerAnexos(caminhos) {
        if (caminhos.length) erro(await sb.storage.from("emails").remove(caminhos));
      },

      // "assets/..." é arquivo do próprio site; o resto está no storage
      urlArquivo(caminho) {
        if (!caminho) return "";
        if (caminho.startsWith("assets/")) return "../" + caminho;
        return sb.storage.from(BUCKET).getPublicUrl(caminho).data.publicUrl;
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
    if (/exceeded the maximum allowed size|Payload too large/i.test(msg)) return "Arquivo grande demais (o limite é 50 MB).";
    if (/mime type .* is not supported/i.test(msg)) return "Esse tipo de arquivo não é aceito.";
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

    const contatos = [
      { id: uuid(), tipo: "especie", status: "novo", nome: "Caio Bernardes", email: "caio.b@exemplo.com", whatsapp: "5511987650012", produto: "pedal", mensagem: "Toco stoner e doom. Quero um fuzz bem grave que não suma na mixagem.", dados: { ficha: "FT-482", nomeCientifico: "Caiosaurus monstruosus", tipo: "pedal", instrumento: "guitarra", personalizar: ["arte", "mods"], referencia: "Big Muff verde russo" }, idioma: "pt", notas: null, cliente_id: null, criado_em: quando(0, 2), atualizado_em: quando(0, 2) },
      { id: uuid(), tipo: "manutencao", status: "novo", nome: "Helena Duarte", email: "helena.d@exemplo.com", whatsapp: "5519998761234", produto: "Fender Hot Rod Deluxe", mensagem: "Começou a chiar muito e às vezes corta o som no meio do show.", dados: { equipamento: "amplificador", problemas: ["ruido", "intermitente", "valvula"], tempoDeUso: "mais_10" }, idioma: "pt", notas: null, cliente_id: null, criado_em: quando(0, 6), atualizado_em: quando(0, 6) },
      { id: uuid(), tipo: "pecas", status: "em_conversa", nome: "Diego Arantes", email: "diego.arantes@exemplo.com", whatsapp: "5531984201180", produto: null, mensagem: "Knob creme para eixo liso", dados: { itens: [{ slug: "knob-davies-1900", numero: "RP-01", nome: "Knob estilo Davies 1900H", quantidade: 4, preco: 35 }], total: 140 }, idioma: "pt", notas: "Mandei foto dos knobs creme.", cliente_id: clientes[2].id, criado_em: quando(1, 3), atualizado_em: quando(0, 20) },
      { id: uuid(), tipo: "lista_espera", status: "novo", nome: "Tomás Reis", email: "tomas.reis@exemplo.com", whatsapp: null, produto: "kraken", mensagem: null, dados: {}, idioma: "pt", notas: null, cliente_id: null, criado_em: quando(2, 1), atualizado_em: quando(2, 1) },
      { id: uuid(), tipo: "lista_espera", status: "novo", nome: "Sam Carter", email: "sam.carter@example.com", whatsapp: "14155550142", produto: "kraken", mensagem: null, dados: {}, idioma: "en", notas: null, cliente_id: null, criado_em: quando(4, 5), atualizado_em: quando(4, 5) },
      { id: uuid(), tipo: "especie", status: "concluido", nome: "Bianca Tavares", email: "bianca.t@exemplo.com", whatsapp: "5519991027733", produto: "pedal", mensagem: null, dados: { ficha: "FT-317", nomeCientifico: "Biancasaurus pictus", tipo: "pedal", instrumento: "baixo", personalizar: ["arte"], referencia: "Darkglass B7K" }, idioma: "pt", notas: "Virou o pedido #1012.", cliente_id: clientes[1].id, criado_em: quando(9, 4), atualizado_em: quando(3) }
    ];

    const configuracoes = [{ chave: "loja", valor: { nome: "Fossil Tone", email: "fossiltonefx@gmail.com", whatsapp: "5519991226377", freteFixo: 38.9, freteGratisAcima: 1500, prazoProducaoDias: 15, pix: "" } }];

    const emails = [
      { id: uuid(), caixa: "contato", direcao: "entrada", de: "helena.d@exemplo.com", de_nome: "Helena Duarte", para: "contato@fossiltone.com.br", cc: null, assunto: "Orçamento para um fuzz", texto: "Oi! Vi o Megalodon no Instagram e queria saber se vocês fazem um fuzz com chave de oitava.\n\nAbraço,\nHelena", html: null, message_id: "<demo-1@exemplo.com>", em_resposta_a: null, conversa: "<demo-1@exemplo.com>", lido: false, pasta: "entrada", tem_anexo: false, criado_em: quando(0, 1) },
      { id: uuid(), caixa: "suporte", direcao: "entrada", de: "rafael.m@exemplo.com", de_nome: "Rafael Monteiro", para: "suporte@fossiltone.com.br", cc: null, assunto: "Megalodon com chiado", texto: "Meu Megalodon começou a chiar com o Stage 2 no máximo. Segue foto da placa.", html: "<p>Meu Megalodon começou a chiar com o <b>Stage 2</b> no máximo. Segue foto da placa.</p>", message_id: "<demo-2@exemplo.com>", em_resposta_a: null, conversa: "<demo-2@exemplo.com>", lido: false, pasta: "entrada", tem_anexo: true, criado_em: quando(0, 5) },
      { id: uuid(), caixa: "joao", direcao: "entrada", de: "loja@exemplo.com", de_nome: "Loja de Componentes", para: "joao@fossiltone.com.br", cc: null, assunto: "Seu pedido de potenciômetros foi enviado", texto: "Olá João, seu pedido #8812 saiu para entrega.", html: null, message_id: "<demo-3@exemplo.com>", em_resposta_a: null, conversa: "<demo-3@exemplo.com>", lido: true, pasta: "entrada", tem_anexo: false, criado_em: quando(1, 2) }
    ];
    const anexos = [{ id: uuid(), email_id: emails[1].id, nome: "placa-megalodon.jpg", tipo: "image/jpeg", tamanho: 284000, caminho: null, criado_em: quando(0, 5) }];

    return { produtos, clientes, pedidos, itens_pedido: itens, cupons, configuracoes, contatos, acervo: [], midias: [], emails, anexos };
  }

  // demonstração: o acervo sai do data/catalogo.json do site, com as fotos que já estão em assets/img
  const FOTOS_DEMO = {
    megalodon: [["megalodon-angle", "Megalodon em ângulo sobre uma mesa de madeira."], ["megalodon-art", "Detalhe da arte: a boca do tubarão em volta do footswitch."],
      ["megalodon-plate", "Lateral do Megalodon com a placa First Edition."], ["megalodon-manual", "Cartão de instruções do Megalodon."]],
    zero: [["zero-front", "Pedal ZeRO Alcino Edition, preto."]]
  };
  async function acervoDemo() {
    const r = await fetch("../data/catalogo.json", { cache: "no-cache" });
    const cat = r.ok ? await r.json() : { pecas: [] };
    const acervo = [], midias = [];
    const agora = new Date().toISOString();
    (cat.pecas || []).forEach((p, i) => {
      const id = uuid();
      const conteudo = Object.assign({}, p);
      ["id", "numero", "nome", "subtitulo", "tipo", "videos", "audios", "foto", "fotoAlt"].forEach((k) => delete conteudo[k]);
      acervo.push({ id, slug: p.id, numero: p.numero || null, nome: p.nome, subtitulo: p.subtitulo || null, tipo: p.tipo, publicado: true, ordem: i, conteudo, criado_em: agora, atualizado_em: agora });
      let ordem = 0;
      (FOTOS_DEMO[p.id] || []).forEach(([base, alt]) => midias.push({ id: uuid(), acervo_id: id, tipo: "foto", arquivos: { grande: `assets/img/${base}-1200.jpg`, media: `assets/img/${base}-800.jpg` }, youtube: null, titulo: { pt: alt, en: "" }, ordem: ordem++, criado_em: agora }));
      (p.videos || []).forEach((v) => midias.push({ id: uuid(), acervo_id: id, tipo: "video", arquivos: {}, youtube: v.youtube || null, titulo: v.titulo || {}, ordem: ordem++, criado_em: agora }));
      (p.audios || []).forEach((a) => midias.push({ id: uuid(), acervo_id: id, tipo: "audio", arquivos: a.arquivo ? { audio: a.arquivo } : {}, youtube: null, titulo: a.titulo || {}, ordem: ordem++, criado_em: agora }));
    });
    return { acervo, midias };
  }

  function fonteDemo() {
    let db;
    try { db = JSON.parse(localStorage.getItem(DEMO_KEY)); } catch (e) { db = null; }
    if (!db || !TABELAS.every((t) => Array.isArray(db[t]))) db = semente();

    const gravar = () => { try { localStorage.setItem(DEMO_KEY, JSON.stringify(db)); } catch (e) { /* sem armazenamento: segue em memória */ } };
    gravar();
    const copia = (x) => JSON.parse(JSON.stringify(x));
    let logado = false;
    const arquivosDemo = new Map();
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
      async listar(tabela) {
        if ((tabela === "acervo" || tabela === "midias") && !db.acervoSemeado) {
          const a = await acervoDemo().catch(() => ({ acervo: [], midias: [] }));
          if (!db.acervoSemeado) { db.acervo = a.acervo; db.midias = a.midias; db.acervoSemeado = true; gravar(); }
        }
        return ordenar(tabela, copia(db[tabela]));
      },
      async salvar(tabela, linha) {
        if (tabela === "cupons" || tabela === "clientes") {
          const campo = tabela === "cupons" ? "codigo" : "email";
          const v = linha[campo];
          if (v && db[tabela].some((l) => l[campo] === v && l.id !== linha.id)) throw new Error("Já existe um registro com esse código ou e-mail.");
        }
        if (tabela === "produtos" && db.produtos.some((l) => l.slug === linha.slug && l.id !== linha.id)) throw new Error("Já existe um produto com esse identificador.");
        const r = salvarLinha(tabela, linha); gravar(); return copia(r);
      },
      async atualizar(tabela, id, campos) {
        if (!db[tabela].some((l) => l.id === id)) throw new Error("Registro não encontrado.");
        const r = salvarLinha(tabela, Object.assign({}, campos, { id })); gravar(); return copia(r);
      },
      async excluir(tabela, id) {
        db[tabela] = db[tabela].filter((l) => l.id !== id);
        if (tabela === "pedidos") db.itens_pedido = db.itens_pedido.filter((i) => i.pedido_id !== id);
        if (tabela === "clientes") db.pedidos.forEach((p) => { if (p.cliente_id === id) p.cliente_id = null; });
        if (tabela === "produtos") db.itens_pedido.forEach((i) => { if (i.produto_id === id) i.produto_id = null; });
        if (tabela === "acervo") db.midias = db.midias.filter((m) => m.acervo_id !== id);
        if (tabela === "emails") db.anexos = db.anexos.filter((a) => a.email_id !== id);
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
      async enviarEmail(d) {
        const original = d.responde ? db.emails.find((e) => e.id === d.responde) : null;
        const r = salvarLinha("emails", { caixa: d.caixa, direcao: "saida", de: d.caixa + "@fossiltone.com.br", de_nome: "Fossil Tone", para: d.para, cc: null, assunto: d.assunto, texto: d.texto, html: null, message_id: "<demo-" + uuid() + ">", em_resposta_a: original ? original.message_id : null, conversa: original ? original.conversa : uuid(), lido: true, pasta: "entrada", tem_anexo: false });
        gravar(); return copia(r);
      },
      async urlAnexo() { throw new Error("Na demonstração os anexos não abrem."); },
      async removerAnexos() {},
      // na demonstração os arquivos enviados ficam só na memória desta aba
      async enviarArquivo(caminho, blob) { arquivosDemo.set(caminho, URL.createObjectURL(blob)); return caminho; },
      async removerArquivos(caminhos) { caminhos.forEach((c) => { if (arquivosDemo.has(c)) { URL.revokeObjectURL(arquivosDemo.get(c)); arquivosDemo.delete(c); } }); },
      urlArquivo(caminho) {
        if (!caminho) return "";
        if (caminho.startsWith("assets/")) return "../" + caminho;
        return arquivosDemo.get(caminho) || "";
      },
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
