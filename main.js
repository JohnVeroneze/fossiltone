/* Fossil Tone — interações do cartão de visita */
(function () {
  "use strict";

  var WA = "https://wa.me/5519991226377";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

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

  // gerador pseudoaleatório com semente: o solo e o magma saem sempre iguais
  function seeded(seed) {
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      var x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }

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

  /* ---------- galeria do Megalodon ---------- */

  var mainImg = document.getElementById("gallery-main");
  var mainAvif = document.getElementById("gallery-main-avif");
  function photoSet(name, ext) {
    return "assets/img/" + name + "-800." + ext + " 800w, assets/img/" + name + "-1200." + ext + " 1200w";
  }
  var thumbs = document.querySelectorAll(".gallery__thumbs button");
  thumbs.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.getAttribute("aria-pressed") === "true") return;
      thumbs.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      btn.setAttribute("aria-pressed", "true");
      var swap = function () {
        var name = btn.dataset.photo;
        mainAvif.srcset = photoSet(name, "avif");
        mainImg.srcset = photoSet(name, "jpg");
        mainImg.src = "assets/img/" + name + "-800.jpg";
        mainImg.alt = t(btn.dataset.altKey);
        mainImg.classList.remove("is-swapping");
      };
      if (reduceMotion) { swap(); return; }
      if (document.startViewTransition) {
        document.startViewTransition(function () {
          swap();
          return mainImg.decode ? mainImg.decode().catch(function () {}) : null;
        });
        return;
      }
      mainImg.classList.add("is-swapping");
      setTimeout(swap, 200);
    });
  });
  // as miniaturas são só imagem: o nome do botão vem da descrição da foto, para o leitor de tela
  function labelThumbs() {
    thumbs.forEach(function (b) { b.setAttribute("aria-label", t(b.dataset.altKey)); });
  }
  labelThumbs();
  onLang(function () {
    var active = document.querySelector(".gallery__thumbs [aria-pressed='true']");
    if (active) mainImg.alt = t(active.dataset.altKey);
    labelThumbs();
  });

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
      [form.elements.email, function () { return EMAIL_RE.test(d.email); }, "form.invalidEmail"]
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

  window.FT = {
    t: t,
    fmt: fmt,
    wa: WA,
    reduceMotion: reduceMotion,
    lang: function () { return lang; },
    onLang: onLang,
    // preenche o "Crie sua espécie" a partir do dossiê de uma peça
    sendContact: sendContact,
    apiGet: apiGet,
    whatsappDigits: whatsappDigits,
    checkFields: checkFields,
    formStatus: formStatus,
    emailOk: function (v) { return EMAIL_RE.test(String(v || "").trim()); },
    preset: function (type, ref) {
      var radio = form.querySelector("input[name='type'][value='" + type + "']");
      if (radio) radio.checked = true;
      if (ref) document.getElementById("f-ref").value = ref;
      updateCard();
    },
    relayout: function () { measureStrata(); }
  };

  /* ---------- início ---------- */

  document.getElementById("year").textContent = new Date().getFullYear();
  applyLang();
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
