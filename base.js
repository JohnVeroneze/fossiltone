/* Fossil Tone — base comum às páginas: textos PT / EN, troca de idioma
   e envio dos formulários para o painel admin. Carregar antes dos outros scripts. */
(function () {
  "use strict";

  var WA = "https://wa.me/5519991226377";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- textos PT / EN ---------- */

  var T = {
    pt: {
      "skip": "Pular para o conteúdo",
      "a11y.home": "Fossil Tone, voltar ao topo", "a11y.nav": "Seções",
      "nav.collection": "Coleção", "nav.lab": "Laboratório", "nav.contact": "Contato",
      "depth.surface": "Superfície", "depth.pleistocene": "Pleistoceno", "depth.miocene": "Mioceno",
      "depth.jurassic": "Jurássico", "depth.triassic": "Triássico", "depth.magma": "Câmara magmática",
      "menu.open": "Abrir o mapa das camadas", "menu.close": "Fechar o mapa das camadas", "menu.label": "Camadas do site",
      "menu.top": "Início", "menu.about": "Sobre", "menu.collection": "Coleção", "menu.lab": "Laboratório",
      "menu.create": "Crie sua espécie", "menu.contact": "Contato",
      "hero.l1": "Timbres extintos", "hero.l2": "trazidos de volta.",
      "hero.lead": "Pedais e amplificadores analógicos, valvulados e feitos à mão no interior de SP. Partimos dos circuitos clássicos e ajustamos cada um pro som de quem vai tocar.",
      "cta.quote": "Solicite um orçamento", "hero.see": "Ver a coleção",
      "hero.alt": "Logotipo da Fossil Tone preso dentro de uma pedra de âmbar.",
      "hero.tag1": "Fossil Tone, preservado em âmbar", "hero.tag2": "Período Valvulado",
      "about.title": "A gente escava som",
      "about.p1": "Tem timbre que sumiu do mapa: circuito que saiu de linha, amp que só existe em disco antigo, pedal que custa um rim no usado. A Fossil Tone desenterra esses clássicos, estuda cada componente e remonta tudo à mão.",
      "about.p2": "Nada de digital, nada de simulação. É válvula esquentando, transistor e solda. E como cada músico vive na sua própria era, qualquer pedal ou amp nosso pode ganhar arte, pintura e mods de circuito feitos pra você.",
      "about.f1": "Analógico de ponta a ponta", "about.f2": "Montado à mão no interior de SP", "about.f3": "Enviamos para todo o Brasil",
      "col.title": "A coleção", "col.lead": "Uma peça já está em exposição. A outra ainda está no sítio de escavação.",
      "mega.photos": "Fotos do Megalodon",
      "mega.alt1": "Megalodon em ângulo sobre uma mesa de madeira.",
      "mega.alt2": "Detalhe da arte: a boca do tubarão em volta do footswitch.",
      "mega.alt3": "Lateral do Megalodon com a placa First Edition Pedal, Overdrive/Distortion.",
      "mega.alt4": "Cartão de instruções do Megalodon explicando cada knob.",
      "mega.kind": "Overdrive e distortion de dois estágios",
      "mega.p": "Um predador com duas fileiras de dentes. Inspirado no clássico overdrive boutique, ele vai do crunch macio a uma distorção cheia de mordida girando um knob só.",
      "card.sci": "Nome científico", "card.class": "Classe", "card.habitat": "Habitat", "card.diet": "Dieta", "card.status": "Situação",
      "card.found": "Criado para", "card.instrument": "Instrumento", "card.ref": "Referência", "card.mutations": "Mutações", "card.discoverer": "Descoberto por",
      "mega.class": "Pedal, overdrive/distortion", "mega.habitat": "Do blues sujo ao rock pesado", "mega.diet": "Guitarras, de preferência altas",
      "mega.status": "Primeira edição, sob encomenda", "mega.stamp": "1ª edição",
      "knobs.title": "Favor tocar. Gire os knobs.", "knobs.aria": "Controles do Megalodon",
      "knob.level": "<b>Level</b> é o volume de saída. Deixa no mesmo nível do som limpo ou empurra o amp pra frente.",
      "knob.sustain": "<b>Sustain</b> é o drive principal. Quanto mais pra direita, mais saturação e mais tempo a nota segura.",
      "knob.hicut": "<b>Hi-Cut</b> controla o brilho. Pra direita, mais brilhante e definido. Pra esquerda, mais quente e suave.",
      "knob.stage2": "<b>Stage 2</b> solta a segunda fileira de dentes, com até 9 dB a mais de ganho. Todo pra esquerda, só overdrive. Girando pra direita, vira distorção, com mais peso e presença.",
      "mega.cta": "Encomendar um Megalodon",
      "kraken.svg": "Silhueta do cabeçote Kraken ainda parcialmente enterrada.",
      "kraken.kind": "Cabeçote valvulado. Em escavação.",
      "kraken.p": "Inspirado no clássico britânico dos anos 80, o som de metade dos discos de rock que você ama. Ainda está saindo da rocha: primeiro em cabeçote, depois também em combo.",
      "kraken.class": "Amplificador valvulado", "kraken.habitat": "Hard rock, punk e afins", "kraken.diet": "Power chords e volume alto",
      "kraken.status": "Em desenvolvimento", "kraken.stamp": "Em escavação",
      "kraken.cta": "Quero saber quando ficar pronto",
      "kraken.msg": "Olá, Fossil Tone! Quero saber quando o Kraken ficar pronto.",
      "lab.title": "Laboratório Âmbar",
      "lab.plate": "Setor B, nível −1.450 m",
      "lab.monitor": "sequenciando o DNA do seu timbre",
      "lab.incubator": "espécime FT-L01, em incubação",
      "lab.stDone": "completo", "lab.stRun": "em curso", "lab.stWait": "aguardando você",
      "lab.lead": "Você já viu esse filme: tiram o DNA de um mosquito preso no âmbar e um dinossauro volta à vida. Aqui, o DNA é o seu som.",
      "lab.p": "O laboratório é a nossa oficina sob medida. Você conta o timbre que procura e a gente cria uma espécie única, com circuito ajustado, arte exclusiva e pintura do jeito que você imaginar.",
      "lab.s1t": "Extração", "lab.s1": "Você conta o timbre que procura, suas referências e o que falta no seu setup.",
      "lab.s2t": "Sequenciamento", "lab.s2": "A gente define com você o circuito, os mods e a arte.",
      "lab.s3t": "Incubação", "lab.s3": "Montagem à mão, componente por componente, e pintura.",
      "lab.s4t": "Eclosão", "lab.s4": "Sua espécie nasce, passa nos testes e vai pra sua casa.",
      "lab.ctaText": "Tem um timbre na cabeça? A gente extrai o DNA dele e cria a sua espécie.",
      "lab.cta": "Criar minha espécie", "lab.ctaWa": "Falar com o laboratório no WhatsApp",
      "lab.ctaMsg": "Olá, Fossil Tone! Quero criar uma peça sob medida no Laboratório Âmbar.",
      "zero.alt1": "Pedal ZeRO Alcino Edition, preto, com o nome ZeRO em letras brancas e um raio vermelho.",
      "zero.alt2": "O pedal ZeRO na mão, mostrando os controles Volume, Tone e Gain.",
      "zero.alt3": "Fundo do pedal com a tracklist do disco Alcino gravada.",
      "zero.kicker": "Exposição temporária, ainda em incubação",
      "zero.p1": "Um pedal criado do zero (com o perdão do trocadilho) para o ZeRO, a partir do disco Alcino.",
      "zero.p2": "Volume, Tone e Gain, uma chave Si/Ge pra alternar entre silício e germânio, e a tracklist do disco gravada no fundo da caixa.",
      "zero.status": "Em desenvolvimento",
      "form.title": "Crie sua espécie",
      "form.lead": "Conte o que você procura. A ficha ao lado vai se montando. Envie e a gente responde com o orçamento pelo WhatsApp ou por e-mail.",
      "form.type": "O que vamos criar?", "form.pedal": "Pedal", "form.amp": "Amplificador",
      "form.instrument": "Pra qual instrumento?", "form.guitar": "Guitarra", "form.bass": "Baixo",
      "form.custom": "O que você quer personalizar?", "form.art": "Arte e pintura", "form.mods": "Mods de circuito",
      "form.ref": "Timbre de referência", "form.refPh": "Um pedal, um amp, um disco, uma banda",
      "form.details": "Conte mais (opcional)", "form.detailsPh": "Estilo que você toca, o que falta no seu som, ideia de arte",
      "form.name": "Seu nome",
      "form.send": "Enviar ficha",
      "form.stampDraft": "Rascunho", "form.stampReady": "Catalogada",
      "form.none": "Nenhuma, quero o clássico",
      "wa.hello": "Olá, Fossil Tone! Quero criar uma nova espécie.",
      "wa.card": "Ficha", "wa.type": "Tipo", "wa.instrument": "Instrumento", "wa.custom": "Personalizar",
      "wa.ref": "Referência de timbre", "wa.details": "Detalhes", "wa.name": "Nome",
      "contact.cold": "Crosta fria", "contact.warming": "Aquecendo o magma…", "contact.ready": "No ponto pra tocar",
      "contact.title": "Fale com a gente",
      "contact.lead": "Orçamento, dúvida, ideia maluca de pedal. A gente responde.",
      "contact.where": "Interior de SP. Enviamos para todo o Brasil.",
      "core.label": "Coluna estratigráfica",
      "examine": "Examinar o espécime",
      "wait.title": "Lista de espera do Kraken",
      "wait.lead": "Deixe seu contato e a gente avisa quando ele sair da rocha.",
      "wait.name": "Seu nome", "wait.contact": "Seu e-mail",
      "wait.submit": "Entrar na lista de espera",
      "wait.note": "Usamos seu contato só para avisar quando o Kraken ficar pronto.",
      "wait.count": "{n} músicos na lista de espera",
      "wait.sending": "Guardando seu nome…",
      "wait.done": "Pronto, você está na lista. A gente avisa quando o Kraken sair da rocha.",
      "wait.already": "Você já está na lista de espera do Kraken.",
      "wait.whatsapp": "Abrimos o WhatsApp com seu pedido de lista de espera. É só enviar a mensagem.",
      "wait.error": "Não deu pra salvar agora.", "wait.errorLink": "Enviar pelo WhatsApp",
      "wait.invalidName": "Escreva seu nome.",
      "wait.invalidContact": "Escreva um e-mail válido.",
      "wait.msg": "Olá, Fossil Tone! Quero entrar na lista de espera do Kraken.",
      "wait.contactLabel": "E-mail",
      "drawer.title": "Fichário do acervo",
      "drawer.lead": "Todas as peças catalogadas até agora. Puxe uma ficha para abrir o dossiê.",
      "drawer.loading": "Abrindo a gaveta…",
      "drawer.error": "Não foi possível abrir o fichário agora. Recarregue a página para tentar de novo.",
      "drawer.prev": "Fichas anteriores", "drawer.next": "Próximas fichas",
      "drawer.count": "{n} peças catalogadas", "drawer.countOne": "1 peça catalogada",
      "info.open": "Abrir a ficha técnica do {name}",
      "media.title": "Na bancada de testes",
      "media.soon": "Vídeo de teste em gravação",
      "media.play": "Assistir: {title}",
      "media.audios": "Testes de timbre",
      "media.audioSoon": "Áudios de teste em gravação.",
      "media.audioSoonOne": "{title}, em breve",
      "dossier.archive": "Arquivo Fossil Tone",
      "dossier.close": "Fechar",
      "dossier.ficha": "Ficha técnica",
      "dossier.exhibit": "Ver na exposição",
      "dossier.order": "Encomendar um {name}",
      "dossier.wait": "Entrar na lista de espera",
      "dossier.lab": "Criar uma peça assim",
      "dossier.noPhoto": "Silhueta do {name}, ainda sem foto.",
      "dossier.photos": "Fotos do {name}",
      "dossier.buried": "{name} ainda enterrado, em escavação.",
      "dossier.photo": "Foto {n}",
      "ficha.title": "Ficha técnica",
      "ficha.loading": "Abrindo o desenho…",
      "ficha.error": "Não foi possível abrir o desenho agora.",
      "ficha.drawing": "Desenho do {name} com os controles identificados.",
      "ficha.pending": "A ficha técnica do {name} ainda está sendo catalogada. Volte em breve.",
      "ficha.pendingStamp": "Em catalogação",
      "fig.title": "Desenho interativo do {name}. Clique nos knobs, na chave Si/Ge e no footswitch.",
      "fig.titleNoSwitch": "Desenho interativo do {name}. Clique nos knobs e no footswitch.",
      "fig.tilt": "Ver conexões",
      "fig.wake": "Carregar pedal interativo",
      "fig.loading": "Carregando…",
      "fig.still": "Desenho do {name} deitado, com os cabos conectados.",
      "fig.stillUpright": "Desenho do {name} com os cabos conectados.",
      "fig.on": "Efeito ligado, LED aceso",
      "fig.off": "Bypass: o sinal passa direto",
      "fig.layDown": "Deitando o pedal…",
      "fig.titleAmp": "Desenho interativo do {name}. Clique nos knobs, nas chaves Power e Stand-by e nos jacks HIGH e LOW.",
      "fig.stillAmp": "Desenho do {name} com o cabo plugado.",
      "fig.wakeAmp": "Carregar amplificador interativo",
      "fig.ampOn": "Ligado: as válvulas estão aquecendo",
      "fig.ampOff": "Desligado: as válvulas esfriam",
      "fig.ampNeedPower": "Ligue o Power primeiro: as válvulas precisam aquecer",
      "fig.ampWarming": "Aguarde: válvulas aquecendo ({pct})",
      "fig.ampReady": "Stand-by liberado: pronto para tocar",
      "fig.ampStandby": "Em stand-by: som cortado",
      "fig.ampJackIn": "O cabo já está em {jack}",
      "panel.aria": "Controles do {name}",
      "selos.aria": "Características",
      "nav.restore": "Manutenção",
      "menu.restore": "Manutenção",
      "depth.permian": "Permiano",
      "form.whatsapp": "WhatsApp",
      "form.email": "E-mail",
      "form.contactHint": "Usamos seu contato só para responder o seu pedido.",
      "form.waLink": "Prefiro falar pelo WhatsApp",
      "form.sending": "Enviando…",
      "form.done": "Ficha recebida! A gente responde com o orçamento pelo WhatsApp ou por e-mail.",
      "form.error": "Não deu pra enviar agora.",
      "form.errorLink": "Enviar pelo WhatsApp",
      "form.tooMany": "Recebemos vários envios seguidos. Tente de novo em alguns minutos.",
      "form.invalidName": "Escreva seu nome.",
      "form.invalidWa": "Escreva um WhatsApp com DDD.",
      "form.invalidEmail": "Escreva um e-mail válido.",
      "form.invalidRef": "Conte um timbre de referência.",
      "form.again": "Enviar outra ficha",
      "form.stampSent": "Recebida",
      "wait.whatsappLabel": "WhatsApp (opcional)",
      "wait.invalidWa": "Confira o WhatsApp, com DDD.",
      "rest.kicker": "Oficina de restauração",
      "rest.title": "Manutenção",
      "rest.lead": "Fóssil também precisa de cuidado. Anos de palco, ensaio alto e estrada cansam qualquer pedal ou amplificador.",
      "rest.p": "A gente diagnostica, troca o que for preciso e devolve pronto pra tocar. Atendemos peças da Fossil Tone e de outras marcas.",
      "rest.shopTitle": "Peças de reposição",
      "rest.shopLead": "Knobs, chaves, jacks e válvulas pra quem prefere trocar em casa. Escolha as peças e a gente confirma estoque e frete.",
      "rest.loading": "Abrindo o almoxarifado…",
      "rest.empty": "O catálogo de peças está sendo montado. Descreva abaixo a peça que você procura.",
      "rest.loadError": "Não deu pra abrir o catálogo agora. Descreva abaixo a peça que você procura.",
      "rest.add": "Adicionar",
      "rest.added": "Na lista",
      "rest.addAria": "Adicionar {name} à lista",
      "rest.remove": "Tirar {name} da lista",
      "rest.soldOut": "Esgotado",
      "rest.onOrder": "Sob encomenda",
      "rest.priceAsk": "Sob consulta",
      "rest.listTitle": "Sua lista de peças",
      "rest.qty": "Quantidade de {name}",
      "rest.other": "Precisa de outra peça? (opcional)",
      "rest.otherPh": "Ex.: knob creme para eixo liso de 6 mm",
      "rest.total": "Total estimado",
      "rest.totalNote": "sem frete",
      "rest.shopSend": "Pedir as peças",
      "rest.shopNeed": "Escolha uma peça ou descreva a que você precisa.",
      "rest.shopDone": "Pedido recebido! A gente confirma estoque, frete e pagamento pelo WhatsApp ou por e-mail.",
      "rest.fixTitle": "Pedir manutenção",
      "rest.fixLead": "Conte o que está acontecendo. A gente responde com o diagnóstico inicial e o orçamento.",
      "rest.equip": "O que precisa de manutenção?",
      "rest.pedal": "Pedal",
      "rest.amp": "Amplificador",
      "rest.model": "Marca e modelo",
      "rest.modelPh": "Ex.: Fossil Tone Megalodon, Marshall JCM800",
      "rest.problems": "O que está acontecendo?",
      "rest.pNoSound": "Sem som",
      "rest.pPower": "Não liga",
      "rest.pNoise": "Chiado ou ruído",
      "rest.pIntermittent": "Falha de vez em quando",
      "rest.pKnob": "Knob ou potenciômetro",
      "rest.pJack": "Jack ou conector",
      "rest.pSwitch": "Chave ou footswitch",
      "rest.pTube": "Válvula",
      "rest.pOther": "Outro",
      "rest.age": "Há quanto tempo está em uso?",
      "rest.agePick": "Escolha",
      "rest.ageLt1": "Menos de 1 ano",
      "rest.age1": "1 a 3 anos",
      "rest.age3": "3 a 10 anos",
      "rest.age10": "Mais de 10 anos",
      "rest.ageUnknown": "Não sei",
      "rest.desc": "Descreva o problema",
      "rest.descPh": "Quando começou, em que situação acontece, se já foi aberto antes",
      "rest.fixSend": "Enviar pedido de manutenção",
      "rest.fixDone": "Pedido recebido! A gente responde pelo WhatsApp ou por e-mail com os próximos passos.",
      "rest.invalidModel": "Diga a marca e o modelo.",
      "rest.invalidDesc": "Conte o que está acontecendo.",
      "rest.waFix": "Olá, Fossil Tone! Preciso de manutenção.",
      "rest.waParts": "Olá, Fossil Tone! Quero comprar peças de reposição.",
      "rest.s1": "Diagnóstico e orçamento antes de qualquer conserto",
      "rest.s2": "Troca de jacks, chaves, potenciômetros e knobs",
      "rest.s3": "Válvulas e revisão completa de amplificadores",
      "rest.s4": "Fossil Tone e outras marcas",
      "rest.ctaFix": "Solicitar orçamento",
      "rest.ctaParts": "Ver peças de reposição",
      "page.back": "Voltar ao site",
      "page.home": "Fossil Tone, voltar à página inicial",
      "footer.joke": "Nenhum dinossauro foi ferido na fabricação destes pedais."
    },
    en: {
      "skip": "Skip to content",
      "a11y.home": "Fossil Tone, back to top", "a11y.nav": "Sections",
      "nav.collection": "Collection", "nav.lab": "Lab", "nav.contact": "Contact",
      "depth.surface": "Surface", "depth.pleistocene": "Pleistocene", "depth.miocene": "Miocene",
      "depth.jurassic": "Jurassic", "depth.triassic": "Triassic", "depth.magma": "Magma chamber",
      "menu.open": "Open the layer map", "menu.close": "Close the layer map", "menu.label": "Site layers",
      "menu.top": "Home", "menu.about": "About", "menu.collection": "Collection", "menu.lab": "Lab",
      "menu.create": "Create your species", "menu.contact": "Contact",
      "hero.l1": "Extinct tones", "hero.l2": "brought back.",
      "hero.lead": "Analog, tube-driven pedals and amps, built by hand in the countryside of São Paulo, Brazil. We start from classic circuits and tune each one to the player who'll use it.",
      "cta.quote": "Request a quote", "hero.see": "See the collection",
      "hero.alt": "The Fossil Tone logo trapped inside a piece of amber.",
      "hero.tag1": "Fossil Tone, preserved in amber", "hero.tag2": "Tube Period",
      "about.title": "We dig up sound",
      "about.p1": "Some tones fell off the map: discontinued circuits, amps you only hear on old records, pedals that cost a kidney used. Fossil Tone digs up those classics, studies every component and rebuilds them by hand.",
      "about.p2": "No digital, no modeling. Just warm tubes, transistors and solder. And since every musician lives in their own era, any of our pedals or amps can get custom art, paint and circuit mods made for you.",
      "about.f1": "Analog from end to end", "about.f2": "Hand-built in São Paulo state", "about.f3": "Shipping across Brazil",
      "col.title": "The collection", "col.lead": "One piece is already on display. The other is still at the dig site.",
      "mega.photos": "Megalodon photos",
      "mega.alt1": "Megalodon at an angle on a wooden table.",
      "mega.alt2": "Artwork detail: the shark's mouth around the footswitch.",
      "mega.alt3": "Side of the Megalodon with the First Edition Pedal, Overdrive/Distortion plate.",
      "mega.alt4": "Megalodon instruction card explaining each knob.",
      "mega.kind": "Two-stage overdrive and distortion",
      "mega.p": "A predator with two rows of teeth. Inspired by the classic boutique overdrive, it goes from a soft crunch to a distortion with real bite, all with one knob.",
      "card.sci": "Scientific name", "card.class": "Class", "card.habitat": "Habitat", "card.diet": "Diet", "card.status": "Status",
      "card.found": "Built for", "card.instrument": "Instrument", "card.ref": "Reference", "card.mutations": "Mutations", "card.discoverer": "Discovered by",
      "mega.class": "Pedal, overdrive/distortion", "mega.habitat": "From dirty blues to heavy rock", "mega.diet": "Guitars, preferably loud",
      "mega.status": "First edition, made to order", "mega.stamp": "1st edition",
      "knobs.title": "Please touch. Turn the knobs.", "knobs.aria": "Megalodon controls",
      "knob.level": "<b>Level</b> is the output volume. Match your clean sound or push the amp harder.",
      "knob.sustain": "<b>Sustain</b> is the main drive. The further right, the more saturation and the longer notes hold.",
      "knob.hicut": "<b>Hi-Cut</b> shapes the brightness. To the right, brighter and more defined. To the left, warmer and smoother.",
      "knob.stage2": "<b>Stage 2</b> releases the second row of teeth, with up to 9 dB of extra gain. All the way left, pure overdrive. Turn it right and it becomes distortion, with more weight and presence.",
      "mega.cta": "Order a Megalodon",
      "kraken.svg": "Silhouette of the Kraken amp head, still partly buried.",
      "kraken.kind": "Tube amp head. Still being excavated.",
      "kraken.p": "Inspired by the classic British amp of the 80s, the sound of half the rock records you love. It's still coming out of the rock: head first, then a combo too.",
      "kraken.class": "Tube amplifier", "kraken.habitat": "Hard rock, punk and friends", "kraken.diet": "Power chords at high volume",
      "kraken.status": "In development", "kraken.stamp": "Excavating",
      "kraken.cta": "Tell me when it's ready",
      "kraken.msg": "Hi, Fossil Tone! I'd like to know when the Kraken is ready.",
      "lab.title": "Amber Lab",
      "lab.plate": "Sector B, level −1,450 m",
      "lab.monitor": "sequencing your tone's DNA",
      "lab.incubator": "specimen FT-L01, incubating",
      "lab.stDone": "complete", "lab.stRun": "running", "lab.stWait": "waiting for you",
      "lab.lead": "You've seen the movie: they pull DNA from a mosquito trapped in amber and a dinosaur comes back to life. Here, the DNA is your sound.",
      "lab.p": "The lab is our custom shop. Tell us the tone you're after and we'll create a one-of-a-kind species, with a tuned circuit, exclusive art and paint the way you picture it.",
      "lab.s1t": "Extraction", "lab.s1": "You tell us the tone you want, your references and what's missing from your rig.",
      "lab.s2t": "Sequencing", "lab.s2": "Together we define the circuit, the mods and the art.",
      "lab.s3t": "Incubation", "lab.s3": "Hand assembly, one component at a time, and paint.",
      "lab.s4t": "Hatching", "lab.s4": "Your species is born, gets tested and ships to your door.",
      "lab.ctaText": "Got a tone in your head? We'll extract its DNA and create your species.",
      "lab.cta": "Create my species", "lab.ctaWa": "Talk to the lab on WhatsApp",
      "lab.ctaMsg": "Hi, Fossil Tone! I'd like a custom piece from the Amber Lab.",
      "zero.alt1": "ZeRO Alcino Edition pedal, black, with the name ZeRO in white letters and a red lightning bolt.",
      "zero.alt2": "The ZeRO pedal in hand, showing the Volume, Tone and Gain controls.",
      "zero.alt3": "Back of the pedal with the Alcino album tracklist engraved.",
      "zero.kicker": "Temporary exhibit, still incubating",
      "zero.p1": "A pedal built from zero (pun intended) for ZeRO, based on the album Alcino.",
      "zero.p2": "Volume, Tone and Gain, a Si/Ge switch to swap between silicon and germanium, and the album tracklist on the back of the enclosure.",
      "zero.status": "In development",
      "form.title": "Create your species",
      "form.lead": "Tell us what you're after. The card fills in as you go. Send it and we'll reply with a quote on WhatsApp or by email.",
      "form.type": "What are we creating?", "form.pedal": "Pedal", "form.amp": "Amplifier",
      "form.instrument": "For which instrument?", "form.guitar": "Guitar", "form.bass": "Bass",
      "form.custom": "What do you want to customize?", "form.art": "Art and paint", "form.mods": "Circuit mods",
      "form.ref": "Reference tone", "form.refPh": "A pedal, an amp, a record, a band",
      "form.details": "Tell us more (optional)", "form.detailsPh": "What you play, what's missing from your sound, art ideas",
      "form.name": "Your name",
      "form.send": "Send card",
      "form.stampDraft": "Draft", "form.stampReady": "Catalogued",
      "form.none": "None, I want the classic",
      "wa.hello": "Hi, Fossil Tone! I'd like to create a new species.",
      "wa.card": "Card", "wa.type": "Type", "wa.instrument": "Instrument", "wa.custom": "Customize",
      "wa.ref": "Reference tone", "wa.details": "Details", "wa.name": "Name",
      "contact.cold": "Cold crust", "contact.warming": "Heating the magma…", "contact.ready": "Hot and ready to play",
      "contact.title": "Talk to us",
      "contact.lead": "Quotes, questions, crazy pedal ideas. We answer.",
      "contact.where": "São Paulo state, Brazil. We ship across Brazil.",
      "core.label": "Stratigraphic column",
      "examine": "Examine the specimen",
      "wait.title": "Kraken waiting list",
      "wait.lead": "Leave your contact and we'll let you know when it comes out of the rock.",
      "wait.name": "Your name", "wait.contact": "Your email",
      "wait.submit": "Join the waiting list",
      "wait.note": "We only use your contact to tell you when the Kraken is ready.",
      "wait.count": "{n} musicians on the waiting list",
      "wait.sending": "Saving your name…",
      "wait.done": "Done, you're on the list. We'll tell you when the Kraken is out of the rock.",
      "wait.already": "You're already on the Kraken waiting list.",
      "wait.whatsapp": "We opened WhatsApp with your waiting list request. Just send the message.",
      "wait.error": "We couldn't save it right now.", "wait.errorLink": "Send it on WhatsApp",
      "wait.invalidName": "Please write your name.",
      "wait.invalidContact": "Please enter a valid email.",
      "wait.msg": "Hi, Fossil Tone! I'd like to join the Kraken waiting list.",
      "wait.contactLabel": "Email",
      "drawer.title": "Collection card catalog",
      "drawer.lead": "Every piece catalogued so far. Pull a card to open its dossier.",
      "drawer.loading": "Opening the drawer…",
      "drawer.error": "We couldn't open the card catalog right now. Reload the page to try again.",
      "drawer.prev": "Previous cards", "drawer.next": "Next cards",
      "drawer.count": "{n} catalogued pieces", "drawer.countOne": "1 catalogued piece",
      "info.open": "Open the {name} spec sheet",
      "media.title": "On the test bench",
      "media.soon": "Test video being recorded",
      "media.play": "Watch: {title}",
      "media.audios": "Tone tests",
      "media.audioSoon": "Test audio being recorded.",
      "media.audioSoonOne": "{title}, coming soon",
      "dossier.archive": "Fossil Tone archive",
      "dossier.close": "Close",
      "dossier.ficha": "Spec sheet",
      "dossier.exhibit": "See it on display",
      "dossier.order": "Order a {name}",
      "dossier.wait": "Join the waiting list",
      "dossier.lab": "Create a piece like this",
      "dossier.noPhoto": "Silhouette of the {name}, no photo yet.",
      "dossier.photos": "Photos of the {name}",
      "dossier.buried": "The {name}, still buried and being dug up.",
      "dossier.photo": "Photo {n}",
      "ficha.title": "Spec sheet",
      "ficha.loading": "Opening the drawing…",
      "ficha.error": "We couldn't load the drawing right now.",
      "ficha.drawing": "Drawing of the {name} with its controls labelled.",
      "ficha.pending": "The {name} spec sheet is still being catalogued. Check back soon.",
      "ficha.pendingStamp": "Being catalogued",
      "fig.title": "Interactive drawing of the {name}. Click the knobs, the Si/Ge switch and the footswitch.",
      "fig.titleNoSwitch": "Interactive drawing of the {name}. Click the knobs and the footswitch.",
      "fig.tilt": "See connections",
      "fig.wake": "Load the interactive pedal",
      "fig.loading": "Loading…",
      "fig.still": "Drawing of the {name} lying flat, with the cables plugged in.",
      "fig.stillUpright": "Drawing of the {name} with the cables plugged in.",
      "fig.on": "Effect on, LED lit",
      "fig.off": "Bypass: the signal goes straight through",
      "fig.layDown": "Laying the pedal down…",
      "fig.titleAmp": "Interactive drawing of the {name}. Click the knobs, the Power and Stand-by switches and the HIGH and LOW jacks.",
      "fig.stillAmp": "Drawing of the {name} with the cable plugged in.",
      "fig.wakeAmp": "Load the interactive amp",
      "fig.ampOn": "On: the tubes are warming up",
      "fig.ampOff": "Off: the tubes are cooling down",
      "fig.ampNeedPower": "Turn on Power first: the tubes need to warm up",
      "fig.ampWarming": "Hold on: tubes warming up ({pct})",
      "fig.ampReady": "Stand-by off: ready to play",
      "fig.ampStandby": "On stand-by: sound muted",
      "fig.ampJackIn": "The cable is already in {jack}",
      "panel.aria": "{name} controls",
      "selos.aria": "Features",
      "nav.restore": "Repairs",
      "menu.restore": "Repairs",
      "depth.permian": "Permian",
      "form.whatsapp": "WhatsApp",
      "form.email": "Email",
      "form.contactHint": "We only use your contact to reply to your request.",
      "form.waLink": "I'd rather talk on WhatsApp",
      "form.sending": "Sending…",
      "form.done": "Card received! We'll reply with a quote on WhatsApp or by email.",
      "form.error": "We couldn't send it right now.",
      "form.errorLink": "Send it on WhatsApp",
      "form.tooMany": "We got several submissions in a row. Please try again in a few minutes.",
      "form.invalidName": "Please write your name.",
      "form.invalidWa": "Please enter a WhatsApp number with area code.",
      "form.invalidEmail": "Please enter a valid email.",
      "form.invalidRef": "Tell us a reference tone.",
      "form.again": "Send another card",
      "form.stampSent": "Received",
      "wait.whatsappLabel": "WhatsApp (optional)",
      "wait.invalidWa": "Please check the WhatsApp number, with area code.",
      "rest.kicker": "Restoration workshop",
      "rest.title": "Repairs",
      "rest.lead": "Fossils need care too. Years of gigs, loud rehearsals and the road wear out any pedal or amp.",
      "rest.p": "We diagnose it, replace what's needed and send it back ready to play. We service Fossil Tone gear and other brands.",
      "rest.shopTitle": "Replacement parts",
      "rest.shopLead": "Knobs, switches, jacks and tubes for those who'd rather swap them at home. Pick your parts and we'll confirm stock and shipping.",
      "rest.loading": "Opening the parts room…",
      "rest.empty": "The parts catalog is still being put together. Describe the part you need below.",
      "rest.loadError": "We couldn't open the catalog right now. Describe the part you need below.",
      "rest.add": "Add",
      "rest.added": "On the list",
      "rest.addAria": "Add {name} to the list",
      "rest.remove": "Remove {name} from the list",
      "rest.soldOut": "Sold out",
      "rest.onOrder": "Made to order",
      "rest.priceAsk": "Price on request",
      "rest.listTitle": "Your parts list",
      "rest.qty": "Quantity of {name}",
      "rest.other": "Need another part? (optional)",
      "rest.otherPh": "E.g. cream knob for a 6 mm smooth shaft",
      "rest.total": "Estimated total",
      "rest.totalNote": "before shipping",
      "rest.shopSend": "Request these parts",
      "rest.shopNeed": "Pick a part or describe the one you need.",
      "rest.shopDone": "Request received! We'll confirm stock, shipping and payment on WhatsApp or by email.",
      "rest.fixTitle": "Request a repair",
      "rest.fixLead": "Tell us what's going on. We'll reply with a first diagnosis and a quote.",
      "rest.equip": "What needs repair?",
      "rest.pedal": "Pedal",
      "rest.amp": "Amplifier",
      "rest.model": "Brand and model",
      "rest.modelPh": "E.g. Fossil Tone Megalodon, Marshall JCM800",
      "rest.problems": "What's going on?",
      "rest.pNoSound": "No sound",
      "rest.pPower": "Won't turn on",
      "rest.pNoise": "Hiss or noise",
      "rest.pIntermittent": "Cuts out now and then",
      "rest.pKnob": "Knob or pot",
      "rest.pJack": "Jack or connector",
      "rest.pSwitch": "Switch or footswitch",
      "rest.pTube": "Tube",
      "rest.pOther": "Something else",
      "rest.age": "How long has it been in use?",
      "rest.agePick": "Choose",
      "rest.ageLt1": "Less than a year",
      "rest.age1": "1 to 3 years",
      "rest.age3": "3 to 10 years",
      "rest.age10": "Over 10 years",
      "rest.ageUnknown": "Not sure",
      "rest.desc": "Describe the problem",
      "rest.descPh": "When it started, when it happens, whether it's been opened before",
      "rest.fixSend": "Send repair request",
      "rest.fixDone": "Request received! We'll reply on WhatsApp or by email with the next steps.",
      "rest.invalidModel": "Tell us the brand and model.",
      "rest.invalidDesc": "Tell us what's going on.",
      "rest.waFix": "Hi, Fossil Tone! I need a repair.",
      "rest.waParts": "Hi, Fossil Tone! I'd like to buy replacement parts.",
      "rest.s1": "Diagnosis and a quote before any repair",
      "rest.s2": "Jacks, switches, pots and knobs replaced",
      "rest.s3": "Tubes and full amplifier servicing",
      "rest.s4": "Fossil Tone and other brands",
      "rest.ctaFix": "Request a quote",
      "rest.ctaParts": "See replacement parts",
      "page.back": "Back to the site",
      "page.home": "Fossil Tone, back to the home page",
      "footer.joke": "No dinosaurs were harmed in the making of these pedals."
    }
  };

  var lang = "pt";
  try { if (localStorage.getItem("ft-lang") === "en") lang = "en"; } catch (e) {}

  function t(key, vars) {
    var str = (T[lang] && T[lang][key]) || T.pt[key] || "";
    if (vars) str = str.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return str;
  }
  function fmt(n) { return new Intl.NumberFormat(lang === "en" ? "en-US" : "pt-BR").format(n); }

  var langListeners = [];
  function onLang(fn) { langListeners.push(fn); }

  function applyLang() {
    document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
    document.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    document.querySelectorAll("[data-i18n-alt]").forEach(function (el) { el.alt = t(el.getAttribute("data-i18n-alt")); });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) { el.placeholder = t(el.getAttribute("data-i18n-ph")); });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria"))); });
    document.querySelectorAll(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === lang)); });
    langListeners.forEach(function (fn) { fn(); });
  }

  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () {
      lang = b.dataset.lang;
      try { localStorage.setItem("ft-lang", lang); } catch (e) {}
      if (document.startViewTransition && !reduceMotion) document.startViewTransition(applyLang);
      else applyLang();
    });
  });

  /* ---------- envio dos formulários para o painel ----------
     Os pedidos caem na caixa de entrada do painel admin (tabela "contatos" do Supabase).
     A chave publicável só permite criar contatos e ler produtos publicados: quem lê os
     pedidos é o painel, depois do login com senha e Google Authenticator. */

  var API = "https://mlyahqfoslwzbwjoxaas.supabase.co/rest/v1/";
  var API_KEY = "sb_publishable_VAVTupljhEVyXcpzL5Bj_w_9WB8JEH7";
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // "(19) 99122-6377" vira "5519991226377"; números de fora do Brasil vão com o DDI
  function whatsappDigits(v) {
    var d = String(v || "").replace(/\D/g, "");
    if ((d.length === 10 || d.length === 11) && d.indexOf("55") !== 0) d = "55" + d;
    return /^\d{10,15}$/.test(d) ? d : null;
  }

  // resolve "ok", "duplicado" (já estava na lista) ou "limite" (muitos envios seguidos)
  function sendContact(data) {
    data.idioma = lang;
    return fetch(API + "contatos", {
      method: "POST",
      headers: { apikey: API_KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(data)
    }).then(function (r) {
      if (r.ok) return "ok";
      if (r.status === 409) return "duplicado";
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (/muitos envios/.test(j.message || "")) return "limite";
        throw new Error(j.message || String(r.status));
      });
    });
  }

  function apiGet(path) {
    return fetch(API + path, { headers: { apikey: API_KEY } }).then(function (r) {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    });
  }

  // marca o primeiro campo com problema e devolve a chave do aviso
  function checkFields(rules) {
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i];
      r[0].removeAttribute("aria-invalid");
    }
    for (var j = 0; j < rules.length; j++) {
      if (!rules[j][1]()) {
        rules[j][0].setAttribute("aria-invalid", "true");
        rules[j][0].focus();
        return rules[j][2];
      }
    }
    return "";
  }

  // aviso abaixo do botão; no erro, oferece o WhatsApp com a mensagem pronta
  function formStatus(el, key, isError, waText) {
    el.classList.toggle("is-error", !!isError);
    el.textContent = key ? t(key) : "";
    if (waText) {
      var a = document.createElement("a");
      a.href = WA + "?text=" + encodeURIComponent(waText);
      a.target = "_blank"; a.rel = "noopener";
      a.textContent = t("form.errorLink");
      el.appendChild(document.createTextNode(" "));
      el.appendChild(a);
    }
  }

  /* ---------- fotos do acervo ----------
     Cada foto tem { grande (1200 px), media (800 px), card (560×420), mini (240×360) }.
     Caminho "assets/..." é arquivo do site (JPEG com irmão AVIF); o resto vem do storage "acervo". */

  var STORAGE = API.replace("/rest/v1/", "/storage/v1/object/public/acervo/");

  function arquivo(caminho) {
    if (!caminho) return "";
    return /^(assets\/|https?:)/.test(caminho) ? caminho : STORAGE + caminho;
  }

  // um campo pode ser texto puro ou { "pt": "...", "en": "..." }
  function tx(v) {
    if (v == null) return "";
    if (typeof v === "string" || Array.isArray(v)) return v;
    return v[lang] || v.pt || "";
  }

  // <picture> de uma foto. tipo "full": srcset 800/1200; "card", "mini" ou "media": um tamanho só, com reserva
  function picture(arquivos, alt, tipo, sizes) {
    var a = arquivos || {};
    var first = function (keys) { for (var i = 0; i < keys.length; i++) if (a[keys[i]]) return a[keys[i]]; return ""; };
    var src, srcset = "";
    if (tipo === "full") {
      src = first(["media", "grande", "card", "mini"]);
      if (a.media && a.grande) srcset = arquivo(a.media) + " 800w, " + arquivo(a.grande) + " 1200w";
    } else if (tipo === "mini") {
      src = first(["mini", "card", "media", "grande"]);
    } else if (tipo === "card") {
      src = first(["card", "media", "grande", "mini"]);
    } else {
      src = first(["media", "grande", "card", "mini"]);
    }
    if (!src) return null;
    var pic = document.createElement("picture");
    // as fotos do site têm versão AVIF ao lado do JPEG
    if (/^assets\/.*\.jpg$/.test(src)) {
      var av = document.createElement("source");
      av.type = "image/avif";
      av.srcset = srcset ? srcset.replace(/\.jpg/g, ".avif") : src.replace(/\.jpg$/, ".avif");
      if (srcset && sizes) av.sizes = sizes;
      pic.appendChild(av);
    }
    var img = document.createElement("img");
    img.src = arquivo(src);
    if (srcset) { img.srcset = srcset; if (sizes) img.sizes = sizes; }
    img.alt = alt || "";
    img.decoding = "async";
    pic.appendChild(img);
    return pic;
  }

  /* ---------- ponte para os scripts de cada página ---------- */

  window.FT = {
    t: t,
    fmt: fmt,
    wa: WA,
    reduceMotion: reduceMotion,
    lang: function () { return lang; },
    onLang: onLang,
    applyLang: applyLang,
    tx: tx,
    arquivo: arquivo,
    picture: picture,
    sendContact: sendContact,
    apiGet: apiGet,
    whatsappDigits: whatsappDigits,
    checkFields: checkFields,
    formStatus: formStatus,
    emailOk: function (v) { return EMAIL_RE.test(String(v || "").trim()); }
  };

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
