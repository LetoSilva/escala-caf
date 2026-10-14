/**
 * ==========================================================
 * CAF • PROGRAMAÇÃO INTELIGENTE DE ESCALAS
 * JAVASCRIPT COMPLETO E MODULAR (VANILLA JS CLEAN)
 * ==========================================================
 */

/* ==========================================================
   01. FERIADOS (NACIONAIS E REGIONAIS)
========================================================== */
const Holidays = {
    formatar(data) {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const dia = String(data.getDate()).padStart(2, "0");
        return `${ano}-${mes}-${dia}`;
    },

    calcularPascoa(ano) {
        const a = ano % 19;
        const b = Math.floor(ano / 100);
        const c = ano % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);

        return new Date(
            ano,
            Math.floor((h + l - 7 * m + 114) / 31) - 1,
            ((h + l - 7 * m + 114) % 31) + 1
        );
    },

    obter(ano) {
        const lista = {};
        const pascoa = this.calcularPascoa(ano);

        const carnavalSeg = new Date(pascoa);
        carnavalSeg.setDate(pascoa.getDate() - 48);

        const carnavalTer = new Date(pascoa);
        carnavalTer.setDate(pascoa.getDate() - 47);

        const quartaCinzas = new Date(pascoa);
        quartaCinzas.setDate(pascoa.getDate() - 46);

        const sextaSanta = new Date(pascoa);
        sextaSanta.setDate(pascoa.getDate() - 2);

        const corpusChristi = new Date(pascoa);
        corpusChristi.setDate(pascoa.getDate() + 60);

        /* Feriados Fixos Nacionais */
        lista[`${ano}-01-01`] = "Ano Novo";
        lista[`${ano}-04-21`] = "Tiradentes";
        lista[`${ano}-05-01`] = "Dia do Trabalho";
        lista[`${ano}-09-07`] = "Independência do Brasil";
        lista[`${ano}-10-12`] = "Nossa Senhora Aparecida";
        lista[`${ano}-11-02`] = "Finados";
        lista[`${ano}-11-15`] = "Proclamação da República";
        lista[`${ano}-11-20`] = "Consciência Negra";
        lista[`${ano}-12-25`] = "Natal";

        /* Feriados Móveis */
        lista[this.formatar(carnavalSeg)] = "Carnaval";
        lista[this.formatar(carnavalTer)] = "Carnaval";
        lista[this.formatar(quartaCinzas)] = "Ponto Facultativo - Quarta-feira de Cinzas";
        lista[this.formatar(sextaSanta)] = "Sexta-feira Santa";
        lista[this.formatar(corpusChristi)] = "Corpus Christi";

        /* Pernambuco e Recife */
        lista[`${ano}-03-06`] = "Revolução Pernambucana";
        lista[`${ano}-06-24`] = "São João";
        lista[`${ano}-07-16`] = "Nossa Senhora do Carmo";

        return lista;
    }
};

/* ==========================================================
   02. MOTOR DE ESCALA & REGRAS INTELIGENTES
========================================================== */
const Scheduler = {
    rodizioPadrao: [
        // Ordem oficial da escala:
        // Dia 13 (hoje):
        // Duda: E-mail e V360
        // Leto: Retorno, Spot Materiais e Encerramento
        // Adri: Fieldglass e FUP
        // Girlene: Service Now
        {
            email: "Duda",
            v360: "Duda",
            retorno: "Leto",
            spot: "Leto",
            encerramento: "Leto",
            fieldglass: "Adri",
            fup: "Adri",
            service: "Girlene"
        },
        // Dia 14:
        // Adri: E-mail e V360
        // Duda: Retorno, Spot Materiais e Encerramento
        // Leto: Fieldglass e FUP
        // Girlene: Service Now
        {
            email: "Adri",
            v360: "Adri",
            retorno: "Duda",
            spot: "Duda",
            encerramento: "Duda",
            fieldglass: "Leto",
            fup: "Leto",
            service: "Girlene"
        },
        // Dia 15 (sequência do rodízio):
        // Leto: E-mail e V360
        // Adri: Retorno, Spot Materiais e Encerramento
        // Duda: Fieldglass e FUP
        // Girlene: Service Now
        {
            email: "Leto",
            v360: "Leto",
            retorno: "Adri",
            spot: "Adri",
            encerramento: "Adri",
            fieldglass: "Duda",
            fup: "Duda",
            service: "Girlene"
        }
    ],

    // Data base padrão: 13 de Outubro de 2026 (Hoje: Duda no E-mail/V360)
    dataBase: new Date(2026, 9, 13),

    // Lista de ausências cadastradas (Férias, Folga, Ausência).
    // NÃO adiciona automaticamente Adri de férias. Usuário ativa quando quiser.
    ausencias: [],

    obterIndiceParaData(dataAlvo, ano) {
        let contador = 0;
        const base = new Date(this.dataBase.getFullYear(), this.dataBase.getMonth(), this.dataBase.getDate());
        const alvo = new Date(dataAlvo.getFullYear(), dataAlvo.getMonth(), dataAlvo.getDate());
        const feriados = Holidays.obter(ano);
        const feriadosDatas = Object.keys(feriados);

        if (base.getTime() === alvo.getTime()) {
            return 0;
        }

        if (base < alvo) {
            const cursor = new Date(base);
            while (cursor < alvo) {
                const diaSemana = cursor.getDay();
                const iso = Holidays.formatar(cursor);
                const diaUtil = diaSemana !== 0 && diaSemana !== 6 && !feriadosDatas.includes(iso);
                if (diaUtil) contador++;
                cursor.setDate(cursor.getDate() + 1);
            }
        } else {
            const cursor = new Date(alvo);
            while (cursor < base) {
                const diaSemana = cursor.getDay();
                const iso = Holidays.formatar(cursor);
                const diaUtil = diaSemana !== 0 && diaSemana !== 6 && !feriadosDatas.includes(iso);
                if (diaUtil) contador--;
                cursor.setDate(cursor.getDate() + 1);
            }
        }
        const total = this.rodizioPadrao.length;
        return ((contador % total) + total) % total;
    },

    /**
     * Retorna ausências ativas para uma data específica (YYYY-MM-DD)
     */
    obterAusenciasParaData(iso) {
        return this.ausencias.filter(a => a.ativa && iso >= a.inicio && iso <= a.fim);
    },

    /**
     * Gera a escala do dia:
     * - Dias normais: cumprem rigorosamente a ordem de rodízio oficial enviada pelo usuário:
     *   * Dia 13: Duda E-mail/V360 | Leto Retorno/Spot/Encerramento | Adri Fieldglass/FUP | Girlene Service Now
     *   * Dia 14: Adri E-mail/V360 | Duda Retorno/Spot/Encerramento | Leto Fieldglass/FUP | Girlene Service Now
     *   * Dia 15: Leto E-mail/V360 | Adri Retorno/Spot/Encerramento | Duda Fieldglass/FUP | Girlene Service Now
     *   * NUNCA o mesmo colaborador 2 dias seguidos no E-mail/V360!
     * - Quando um colaborador estiver de férias, folga ou ausente:
     *   aplica automaticamente a regra de redistribuição:
     *   * Quem fica no E-mail recebe 3 funções: E-mail, V360 e SPOT.
     *   * O outro colaborador recebe as 4 funções restantes: Retorno, Fieldglass, FUP e Encerramento.
     *   * Girlene sempre fixa no Service Now.
     *   * Alterna a cada dia útil para nunca colocar o mesmo colaborador 2 dias seguidos no E-mail.
     */
    gerarEscalaDia(data, ano, emailDiaAnterior) {
        const iso = Holidays.formatar(data);

        // Verifica colaboradores ausentes nesta data
        const ausenciasDoDia = this.obterAusenciasParaData(iso);
        const colaboradoresAusentes = ausenciasDoDia.map(a => a.colaborador);

        // 1. DIA NORMAL (SEM NENHUM COLABORADOR AUSENTE):
        // Segue a rotação cíclica oficial!
        if (colaboradoresAusentes.length === 0) {
            let indice = this.obterIndiceParaData(data, ano);
            // Regra inviolável: NUNCA o mesmo colaborador 2 dias seguidos no E-mail e V360
            if (emailDiaAnterior && this.rodizioPadrao[indice].email === emailDiaAnterior) {
                indice = (indice + 1) % this.rodizioPadrao.length;
            }
            return {
                valores: { ...this.rodizioPadrao[indice] },
                ausencias: []
            };
        }

        // 2. DIA COM AUSÊNCIA (FÉRIAS, FOLGA OU AUSÊNCIA):
        // As regras especiais são ativadas automaticamente!
        // Girlene SEMPRE FIXA em Service Now! (1 função)
        // Sobram 7 atribuições para os 2 colaboradores disponíveis.
        const todosOperadores = ["Duda", "Adri", "Leto"];
        const disponiveis = todosOperadores.filter(c => !colaboradoresAusentes.includes(c));

        if (disponiveis.length === 2) {
            let colabEmail;
            let colabOutro;

            // Se ontem um dos disponíveis fez E-mail, hoje OBRIGATORIAMENTE o outro assume:
            if (emailDiaAnterior && disponiveis.includes(emailDiaAnterior)) {
                colabEmail = disponiveis.find(c => c !== emailDiaAnterior);
                colabOutro = emailDiaAnterior;
            } else {
                // Início da ausência ou dia anterior não era um dos disponíveis:
                const indiceNormal = this.obterIndiceParaData(data, ano);
                const titularNormal = this.rodizioPadrao[indiceNormal].email;
                if (disponiveis.includes(titularNormal) && titularNormal !== emailDiaAnterior) {
                    colabEmail = titularNormal;
                    colabOutro = disponiveis.find(c => c !== titularNormal);
                } else {
                    colabEmail = disponiveis.find(c => c !== emailDiaAnterior) || disponiveis[0];
                    colabOutro = disponiveis.find(c => c !== colabEmail);
                }
            }

            return {
                valores: {
                    email: colabEmail,        // 1ª função de quem está no E-mail
                    v360: colabEmail,         // 2ª função de quem está no E-mail (sincronizado)
                    spot: colabEmail,         // 3ª função de quem está no E-mail -> TOTAL: 3 funções!

                    retorno: colabOutro,      // 1ª função do outro colaborador
                    fieldglass: colabOutro,   // 2ª função do outro colaborador
                    fup: colabOutro,          // 3ª função do outro colaborador
                    encerramento: colabOutro, // 4ª função do outro colaborador -> TOTAL: 4 funções!

                    service: "Girlene"        // Girlene sempre FIXA no Service Now (1 função)
                },
                ausencias: ausenciasDoDia
            };
        }

        // Caso excepcional com 2 ausentes simultâneos (1 operador disponível):
        if (disponiveis.length === 1) {
            const unico = disponiveis[0];
            return {
                valores: {
                    email: unico,
                    v360: unico,
                    spot: unico,
                    retorno: unico,
                    fieldglass: unico,
                    fup: unico,
                    encerramento: unico,
                    service: "Girlene"
                },
                ausencias: ausenciasDoDia
            };
        }

        return {
            valores: { ...this.escalaBasePadrao },
            ausencias: ausenciasDoDia
        };
    }
};

/* ==========================================================
   03. APLICAÇÃO PRINCIPAL (UI, EVENTOS & STORAGE)
========================================================== */
const App = {
    meses: [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ],

    colaboradores: ["Duda", "Adri", "Leto", "Girlene"],

    atividades: [
        "email", "retorno", "fieldglass", "fup",
        "service", "v360", "spot", "encerramento"
    ],

    nomesAtividades: {
        email: "E-MAIL",
        retorno: "RETORNO",
        fieldglass: "FIELDGLASS",
        fup: "FUP",
        service: "SERVICE NOW",
        v360: "V360",
        spot: "SPOT MATERIAIS",
        encerramento: "ENCERRAMENTO"
    },

    storageKey: "CAF_ESCALA_SUBSTITUICOES_V3",
    storageAusenciasKey: "CAF_ESCALA_AUSENCIAS_V3",
    substituicoes: {},
    modalContexto: null,
    toastTimer: null,
    historicoEmailsDias: {}, // Para validação de dias seguidos no e-mail

    temasMensais: [
        {
            nome: "Janeiro",
            campanha: "Janeiro Branco e Roxo",
            descricao: "Branco – saúde mental; Roxo – combate à hanseníase",
            principal: "#7c3aed",
            secundario: "#475569",
            gradiente: "linear-gradient(135deg, #7c3aed, #475569)",
            badgeBg: "rgba(124, 58, 237, 0.12)",
            badgeCor: "#7c3aed",
            badgeBorda: "rgba(124, 58, 237, 0.35)"
        },
        {
            nome: "Fevereiro",
            campanha: "Fevereiro Roxo e Laranja",
            descricao: "Roxo – lúpus, Alzheimer e fibromialgia; Laranja – leucemia",
            principal: "#9333ea",
            secundario: "#ea580c",
            gradiente: "linear-gradient(135deg, #9333ea, #ea580c)",
            badgeBg: "rgba(147, 51, 234, 0.12)",
            badgeCor: "#9333ea",
            badgeBorda: "rgba(234, 88, 12, 0.35)"
        },
        {
            nome: "Março",
            campanha: "Março Lilás e Azul Escuro",
            descricao: "Lilás – prevenção do câncer de colo do útero; Azul Escuro – prevenção do câncer colorretal",
            principal: "#a855f7",
            secundario: "#1e3a8a",
            gradiente: "linear-gradient(135deg, #a855f7, #1e3a8a)",
            badgeBg: "rgba(168, 85, 247, 0.12)",
            badgeCor: "#a855f7",
            badgeBorda: "rgba(30, 58, 138, 0.35)"
        },
        {
            nome: "Abril",
            campanha: "Abril Azul",
            descricao: "Azul – conscientização sobre o autismo",
            principal: "#2563eb",
            secundario: "#0284c7",
            gradiente: "linear-gradient(135deg, #2563eb, #0284c7)",
            badgeBg: "rgba(37, 99, 235, 0.12)",
            badgeCor: "#2563eb",
            badgeBorda: "rgba(37, 99, 235, 0.35)"
        },
        {
            nome: "Maio",
            campanha: "Maio Amarelo, Vermelho e Cinza",
            descricao: "Amarelo – prevenção de acidentes de trânsito; Vermelho – câncer bucal; Cinza – câncer cerebral",
            principal: "#eab308",
            secundario: "#dc2626",
            gradiente: "linear-gradient(135deg, #eab308, #dc2626)",
            badgeBg: "rgba(234, 179, 8, 0.15)",
            badgeCor: "#ca8a04",
            badgeBorda: "rgba(220, 38, 38, 0.35)"
        },
        {
            nome: "Junho",
            campanha: "Junho Vermelho e Verde",
            descricao: "Vermelho – conscientização sobre doenças cardiovasculares; Verde – conscientização sobre a doação de órgãos",
            principal: "#dc2626",
            secundario: "#16a34a",
            gradiente: "linear-gradient(135deg, #dc2626, #16a34a)",
            badgeBg: "rgba(220, 38, 38, 0.12)",
            badgeCor: "#dc2626",
            badgeBorda: "rgba(22, 163, 74, 0.35)"
        },
        {
            nome: "Julho",
            campanha: "Julho Amarelo e Azul",
            descricao: "Amarelo – prevenção de queimaduras solares; Azul – prevenção de hepatites",
            principal: "#eab308",
            secundario: "#0284c7",
            gradiente: "linear-gradient(135deg, #eab308, #0284c7)",
            badgeBg: "rgba(234, 179, 8, 0.15)",
            badgeCor: "#ca8a04",
            badgeBorda: "rgba(2, 132, 199, 0.35)"
        },
        {
            nome: "Agosto",
            campanha: "Agosto Laranja e Verde",
            descricao: "Laranja – prevenção do câncer infantojuvenil; Verde – conscientização sobre a saúde da amamentação",
            principal: "#ea580c",
            secundario: "#16a34a",
            gradiente: "linear-gradient(135deg, #ea580c, #16a34a)",
            badgeBg: "rgba(234, 88, 12, 0.12)",
            badgeCor: "#ea580c",
            badgeBorda: "rgba(22, 163, 74, 0.35)"
        },
        {
            nome: "Setembro",
            campanha: "Setembro Amarelo e Verde",
            descricao: "Amarelo – prevenção do suicídio; Verde – prevenção do câncer infantil",
            principal: "#eab308",
            secundario: "#16a34a",
            gradiente: "linear-gradient(135deg, #eab308, #16a34a)",
            badgeBg: "rgba(234, 179, 8, 0.15)",
            badgeCor: "#ca8a04",
            badgeBorda: "rgba(22, 163, 74, 0.35)"
        },
        {
            nome: "Outubro",
            campanha: "Outubro Rosa",
            descricao: "Rosa – prevenção do câncer de mama",
            principal: "#db2777",
            secundario: "#f43f5e",
            gradiente: "linear-gradient(135deg, #db2777, #f43f5e)",
            badgeBg: "rgba(219, 39, 119, 0.12)",
            badgeCor: "#db2777",
            badgeBorda: "rgba(219, 39, 119, 0.35)"
        },
        {
            nome: "Novembro",
            campanha: "Novembro Azul e Roxo",
            descricao: "Azul – prevenção do câncer de próstata; Roxo – prevenção da violência contra a pessoa idosa",
            principal: "#0284c7",
            secundario: "#7c3aed",
            gradiente: "linear-gradient(135deg, #0284c7, #7c3aed)",
            badgeBg: "rgba(2, 132, 199, 0.12)",
            badgeCor: "#0284c7",
            badgeBorda: "rgba(124, 58, 237, 0.35)"
        },
        {
            nome: "Dezembro",
            campanha: "Dezembro Vermelho e Azul",
            descricao: "Vermelho – prevenção da AIDS; Azul – conscientização sobre a segurança no trânsito",
            principal: "#dc2626",
            secundario: "#0284c7",
            gradiente: "linear-gradient(135deg, #dc2626, #0284c7)",
            badgeBg: "rgba(220, 38, 38, 0.12)",
            badgeCor: "#dc2626",
            badgeBorda: "rgba(2, 132, 199, 0.35)"
        }
    ],

    canalBroadcast: null,
    evtSource: null,
    firestoreDb: null,
    firebaseIniciado: false,

    init() {
        const selectMes = document.getElementById("mes");
        const selectAno = document.getElementById("ano");

        if (!selectMes || !selectAno) return;

        // Canal de transmissão entre abas e janelas do mesmo navegador (0ms de atraso)
        try {
            if (typeof BroadcastChannel !== "undefined") {
                this.canalBroadcast = new BroadcastChannel("escala_caf_live_channel");
                this.canalBroadcast.onmessage = (event) => {
                    if (event.data && event.data.tipo === "atualizacao") {
                        this.aplicarDadosServidor(event.data.dados);
                    }
                };
            }
        } catch (e) {
            console.warn("BroadcastChannel não suportado neste navegador.");
        }

        // Sincronização via evento 'storage' nativo do navegador
        window.addEventListener("storage", (e) => {
            if (e.key === this.storageKey || e.key === this.storageAusenciasKey) {
                this.carregarLocalStorage();
                this.gerarMes();
                this.renderizarListaAusencias();
            }
        });

        this.carregarLocalStorage();
        this.preencherMeses(selectMes);
        this.definirAnoAtual(selectAno);

        const agora = new Date();
        selectMes.value = agora.getMonth();

        // Listeners dos controles principais
        selectMes.addEventListener("change", () => this.gerarMes());
        selectAno.addEventListener("change", () => this.gerarMes());

        document.getElementById("btnTema")?.addEventListener("click", () => this.alternarTema());
        document.getElementById("btnExcel")?.addEventListener("click", () => this.exportarExcel());
        document.getElementById("btnPDF")?.addEventListener("click", () => this.exportarPDF());
        document.getElementById("btnRestaurarMes")?.addEventListener("click", () => this.restaurarMes());
        document.getElementById("btnGestaoEscala")?.addEventListener("click", () => this.abrirModalGestao());

        this.configurarModal();
        this.configurarModalGestao();
        this.atualizarAnoRodape();
        this.carregarTemaSalvo();

        this.gerarMes();
        this.monitorarData();

        // 1. Sincronização em Nuvem Firebase Firestore (Garante que no GitHub todos os colaboradores vejam em tempo real)
        this.iniciarSincronizacaoFirebase();

        // 2. Conecta ao Stream Server-Sent Events (SSE) se backend Node estiver ativo
        this.iniciarStreamTempoReal();

        // 3. Sincronização inicial e polling periódico
        this.sincronizarComServidor();
        setInterval(() => this.sincronizarComServidor(), 3000);
        window.addEventListener("focus", () => {
            this.sincronizarComServidor();
            this.sincronizarComFirebase();
        });
    },

    /* ======================================================
       SINCRONIZAÇÃO EM TEMPO REAL (FIREBASE FIRESTORE & SSE)
    ====================================================== */
    iniciarSincronizacaoFirebase() {
        if (typeof firebase === "undefined" || !firebase.initializeApp) {
            console.warn("Firebase SDK ainda não carregado.");
            return;
        }

        try {
            if (!firebase.apps || !firebase.apps.length) {
                firebase.initializeApp({
                    projectId: "lucid-verve-v5wls",
                    appId: "1:583537049211:web:57acb4efb0efbfd499acde",
                    apiKey: "AIzaSyADKOchhieB7hpOXzZ6mQ95c9q6FmUJYzA",
                    authDomain: "lucid-verve-v5wls.firebaseapp.com",
                    storageBucket: "lucid-verve-v5wls.firebasestorage.app",
                    messagingSenderId: "583537049211"
                });
            }

            if (firebase.auth) {
                firebase.auth().signInAnonymously().catch(e => {
                    console.log("Firebase Auth notice:", e.message);
                });
            }

            let db = null;
            try {
                db = firebase.app().firestore("ai-studio-d6f88baf-4bec-474b-942e-52c76691d087");
            } catch (errDb) {
                try {
                    db = firebase.firestore();
                } catch (e) {
                    console.warn("Erro ao obter firestore default:", e);
                }
            }

            if (!db) return;
            this.firestoreDb = db;
            this.firebaseIniciado = true;

            // Escuta mudanças em tempo real no documento geral da escala
            db.collection("escalas").doc("geral").onSnapshot((doc) => {
                if (doc && doc.exists) {
                    const dados = doc.data();
                    if (dados && (dados.substituicoes || dados.ausencias)) {
                        this.aplicarDadosServidor(dados);
                        this.atualizarIndicadorConexao(true, "Ao vivo: Conectado em Nuvem (GitHub & Tempo Real)");
                    }
                }
            }, (err) => {
                console.warn("Aviso onSnapshot Firebase:", err.message);
            });
        } catch (err) {
            console.warn("Erro na inicialização Firebase:", err);
        }
    },

    async sincronizarComFirebase() {
        if (!this.firestoreDb) return;
        try {
            const doc = await this.firestoreDb.collection("escalas").doc("geral").get();
            if (doc && doc.exists) {
                const dados = doc.data();
                if (dados) this.aplicarDadosServidor(dados);
            }
        } catch (e) {
            // Silencioso em caso de erro de rede
        }
    },

    iniciarStreamTempoReal() {
        if (typeof EventSource === "undefined") return;

        try {
            if (this.evtSource) {
                this.evtSource.close();
            }

            this.evtSource = new EventSource("/api/stream");

            this.evtSource.onmessage = (event) => {
                try {
                    const dados = JSON.parse(event.data);
                    if (dados && (dados.substituicoes || dados.ausencias)) {
                        this.aplicarDadosServidor(dados);
                        this.atualizarIndicadorConexao(true);
                    }
                } catch (err) {
                    console.error("Erro ao processar stream:", err);
                }
            };

            this.evtSource.onopen = () => {
                this.atualizarIndicadorConexao(true);
            };

            this.evtSource.onerror = () => {
                // Se o backend SSE cair (ex: página servida estática pelo GitHub Pages),
                // o Firebase Firestore e BroadcastChannel continuam garantindo a sincronização
                if (!this.firebaseIniciado) {
                    this.atualizarIndicadorConexao(false);
                }
            };
        } catch (err) {
            console.warn("Stream SSE não pôde ser iniciado:", err);
        }
    },

    atualizarIndicadorConexao(conectado, textoPersonalizado) {
        const textEl = document.getElementById("liveSyncText");
        const indicator = document.getElementById("liveSyncStatus");
        if (textEl && indicator) {
            if (conectado) {
                textEl.textContent = textoPersonalizado || "Ao vivo: Sincronizado para todos os colaboradores";
                indicator.style.display = "inline-flex";
            } else {
                textEl.textContent = "Sincronização em nuvem";
            }
        }
    },

    aplicarDadosServidor(dados) {
        const substServidor = dados.substituicoes || {};
        const ausenciasServidor = dados.ausencias || [];

        const mudou = (
            JSON.stringify(this.substituicoes) !== JSON.stringify(substServidor) ||
            JSON.stringify(Scheduler.ausencias) !== JSON.stringify(ausenciasServidor)
        );

        if (mudou) {
            this.substituicoes = substServidor;
            Scheduler.ausencias = ausenciasServidor;
            localStorage.setItem(this.storageKey, JSON.stringify(this.substituicoes));
            localStorage.setItem(this.storageAusenciasKey, JSON.stringify(Scheduler.ausencias));
            this.gerarMes();
            this.renderizarListaAusencias();
        }
    },

    async sincronizarComServidor() {
        try {
            const res = await fetch("/api/escala");
            if (res.ok) {
                const dados = await res.json();
                this.aplicarDadosServidor(dados);
                this.atualizarIndicadorConexao(true);
            }
        } catch (err) {
            // Em caso de GitHub Pages estático ou offline
        }
    },

    async salvarTudoNoServidor() {
        const payload = {
            substituicoes: this.substituicoes,
            ausencias: Scheduler.ausencias,
            atualizadoEm: new Date().toISOString()
        };

        // 1. Notifica abas locais imediatamente via BroadcastChannel (0ms)
        try {
            this.canalBroadcast?.postMessage({
                tipo: "atualizacao",
                dados: payload
            });
        } catch (e) {}

        // 2. Salva no Firebase Firestore (Nuvem em tempo real para GitHub Pages e todos os usuários)
        if (this.firestoreDb) {
            try {
                this.firestoreDb.collection("escalas").doc("geral").set(payload, { merge: true })
                    .catch(err => console.warn("Firestore save aviso:", err.message));
            } catch (err) {
                console.warn("Erro ao salvar no Firestore:", err);
            }
        }

        // 3. Salva no servidor Node backend (se disponível)
        try {
            await fetch("/api/escala", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } catch (err) {
            // Silencioso se estiver rodando em hosting puramente estático no GitHub Pages
        }
    },

    carregarLocalStorage() {
        try {
            const dadosSubst = localStorage.getItem(this.storageKey);
            this.substituicoes = dadosSubst ? JSON.parse(dadosSubst) : {};

            const dadosAusencias = localStorage.getItem(this.storageAusenciasKey);
            Scheduler.ausencias = dadosAusencias ? JSON.parse(dadosAusencias) : [];
        } catch (erro) {
            console.error("Erro ao carregar do LocalStorage:", erro);
            this.substituicoes = {};
            Scheduler.ausencias = [];
        }
    },

    salvarLocalStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.substituicoes));
            localStorage.setItem(this.storageAusenciasKey, JSON.stringify(Scheduler.ausencias));
            // Envia imediatamente para o servidor para que todos os colaboradores vejam
            this.salvarTudoNoServidor();
            return true;
        } catch (erro) {
            console.error("Erro ao salvar LocalStorage:", erro);
            this.mostrarToast("Não foi possível salvar os dados.");
            return false;
        }
    },

    chaveSubstituicao(ano, mes, dia, atividade) {
        return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}_${atividade}`;
    },

    obterSubstituicao(ano, mes, dia, atividade) {
        const chave = this.chaveSubstituicao(ano, mes, dia, atividade);
        return this.substituicoes[chave] || null;
    },

    /* ======================================================
       UI HELPERS
    ====================================================== */
    preencherMeses(select) {
        select.innerHTML = this.meses
            .map((mes, idx) => `<option value="${idx}">${mes}</option>`)
            .join("");
    },

    definirAnoAtual(select) {
        const anoAtual = new Date().getFullYear();
        const existe = [...select.options].some(opt => Number(opt.value) === anoAtual);
        if (existe) select.value = anoAtual;
    },

    classe(nome) {
        return (nome || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    },

    escaparHTML(str) {
        return String(str || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    aplicarTemaMensal(mes) {
        const tema = this.temasMensais[mes];
        if (!tema) return;
        const root = document.documentElement;
        root.style.setProperty("--primary", tema.principal);
        root.style.setProperty("--secondary", tema.secundario);
        root.style.setProperty("--gradient", tema.gradiente);

        document.title = `CAF • ${this.meses[mes]} | ${tema.campanha}`;

        // Atualiza o banner oficial da campanha do mês
        const bannerEl = document.getElementById("bannerCampanhaMes");
        if (bannerEl) {
            bannerEl.innerHTML = `
                <div class="campanha-tag" style="background: ${tema.badgeBg}; border: 1px solid ${tema.badgeBorda}; color: ${tema.badgeCor};">
                    <span style="font-size: 14px;">🎗️</span>
                    <strong>${this.escaparHTML(tema.campanha)}:</strong>
                    <span>${this.escaparHTML(tema.descricao)}</span>
                </div>
            `;
        }
    },

    /* ======================================================
       RENDERIZAÇÃO DA ESCALA
    ====================================================== */
    gerarMes() {
        const tbody = document.getElementById("tbodyProgramacao");
        if (!tbody) return;

        tbody.innerHTML = "";

        const mes = Number(document.getElementById("mes").value);
        const ano = Number(document.getElementById("ano").value);

        this.aplicarTemaMensal(mes);

        const feriados = Holidays.obter(ano);
        const feriadosDatas = Object.keys(feriados);
        const ultimoDia = new Date(ano, mes + 1, 0).getDate();

        let diasUteis = 0;
        let totalFeriados = 0;
        const hoje = new Date();
        let emailHoje = "-";
        let v360Hoje = "-";

        this.historicoEmailsDias = {};
        let emailDiaUtilAnterior = null;

        for (let dia = 1; dia <= ultimoDia; dia++) {
            const data = new Date(ano, mes, dia);
            const diaSemana = data.getDay();

            // Pula fins de semana (sábado e domingo)
            if (diaSemana === 0 || diaSemana === 6) continue;

            const iso = Holidays.formatar(data);
            const tr = document.createElement("tr");

            const ehHoje = (
                data.getDate() === hoje.getDate() &&
                data.getMonth() === hoje.getMonth() &&
                data.getFullYear() === hoje.getFullYear()
            );

            if (ehHoje) tr.classList.add("hoje");

            // Caso FERIADO
            if (feriadosDatas.includes(iso)) {
                totalFeriados++;
                tr.classList.add("feriado");
                tr.innerHTML = `
                    <td>${data.toLocaleDateString("pt-BR")}</td>
                    <td colspan="8">FERIADO: ${this.escaparHTML(feriados[iso])}</td>
                `;
            } else {
                // DIA NORMAL OU COM AUSÊNCIA
                diasUteis++;

                // Gera escala com as regras:
                // 1. Ausências (Férias, Folga, Ausência)
                // 2. Girlene 100% FIXA no ServiceNow
                // 3. NUNCA 2 dias seguidos no E-mail
                const resultadoEscala = Scheduler.gerarEscalaDia(data, ano, emailDiaUtilAnterior);
                const valores = { ...resultadoEscala.valores };
                const ausenciasNoDia = resultadoEscala.ausencias;

                // Aplica substituições manuais salvas no LocalStorage
                this.atividades.forEach(ativ => {
                    const subst = this.obterSubstituicao(ano, mes, dia, ativ);
                    if (subst) {
                        valores[ativ] = subst;
                    }
                });

                // Registra o email deste dia útil para a regra de não repetição consecutiva
                emailDiaUtilAnterior = valores.email;
                this.historicoEmailsDias[iso] = valores.email;

                if (ehHoje) {
                    emailHoje = valores.email;
                    v360Hoje = valores.v360;
                }

                // Badges de ausências presentes no dia
                let badgesAusencias = "";
                if (ausenciasNoDia.length > 0) {
                    badgesAusencias = ausenciasNoDia.map(a => {
                        const icone = a.tipo === "ferias" ? "🏖️" : a.tipo === "folga" ? "🌴" : "⚠️";
                        return `<span class="tag-ausencia-badge" title="${a.colaborador}: ${a.tipo.toUpperCase()} (${a.motivo || ''})">${icone}</span>`;
                    }).join("");
                }

                // Cria as células
                tr.innerHTML = `
                    <td>
                        ${data.toLocaleDateString("pt-BR")}
                        ${badgesAusencias}
                    </td>
                    ${this.atividades.map(ativ => this.criarCelulaColaborador(ano, mes, dia, ativ, valores[ativ])).join("")}
                `;
            }

            tbody.appendChild(tr);
        }

        this.atualizarIndicadores(diasUteis, totalFeriados, emailHoje, v360Hoje);
        this.atualizarSubtitulo(mes, ano);
    },

    criarCelulaColaborador(ano, mes, dia, atividade, nome) {
        const ehModificado = !!this.obterSubstituicao(ano, mes, dia, atividade);
        const ehPar = atividade === "email" || atividade === "v360";

        return `
            <td
                class="colaborador ${this.classe(nome)} ${ehModificado ? 'modificado' : ''}"
                data-ano="${ano}"
                data-mes="${mes}"
                data-dia="${dia}"
                data-atividade="${atividade}"
                data-colaborador="${nome}"
                title="Clique para alterar ${this.nomesAtividades[atividade]} (Atual: ${nome})${ehPar ? ' • Sincronizado automaticamente E-mail ⇄ V360' : ''}">
                ${this.escaparHTML(nome)}
            </td>
        `;
    },

    /* ======================================================
       INDICADORES
    ====================================================== */
    atualizarIndicadores(diasUteis, feriados, emailHoje, v360Hoje) {
        const diasEl = document.getElementById("diasMes");
        const feriadosEl = document.getElementById("feriadosMes");
        const emailEl = document.getElementById("ultimoEmail");
        const v360El = document.getElementById("v360HojeInfo");

        if (diasEl) diasEl.textContent = diasUteis;
        if (feriadosEl) feriadosEl.textContent = feriados;
        if (emailEl) emailEl.textContent = emailHoje;
        if (v360El) v360El.textContent = emailHoje !== "-" ? `V360: ${v360Hoje} (Sincronizado)` : "";
    },

    atualizarSubtitulo(mes, ano) {
        const el = document.getElementById("tableSubtitle");
        if (el) {
            el.textContent = `${this.meses[mes]} de ${ano} • Programação Operacional`;
        }
    },

    /* ======================================================
       MODAL DE SUBSTITUIÇÃO COM SINCRONIZAÇÃO INTELIGENTE
    ====================================================== */
    configurarModal() {
        const tbody = document.getElementById("tbodyProgramacao");
        tbody?.addEventListener("click", event => {
            const celula = event.target.closest("td.colaborador");
            if (!celula) return;

            const ano = Number(celula.dataset.ano);
            const mes = Number(celula.dataset.mes);
            const dia = Number(celula.dataset.dia);
            const atividade = celula.dataset.atividade;
            const nomeAtual = celula.textContent.trim().replace("✎", "");

            this.abrirModal(ano, mes, dia, atividade, nomeAtual);
        });

        document.getElementById("btnFecharModal")?.addEventListener("click", () => this.fecharModal());
        document.getElementById("btnCancelarModal")?.addEventListener("click", () => this.fecharModal());
        document.getElementById("btnSalvarSubstituicao")?.addEventListener("click", () => this.salvarSubstituicao());
        document.getElementById("btnRestaurarCelula")?.addEventListener("click", () => this.restaurarCelula());

        document.getElementById("modalSubstituicao")?.addEventListener("click", event => {
            if (event.target.id === "modalSubstituicao") this.fecharModal();
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                this.fecharModal();
                this.fecharModalGestao();
            }
        });
    },

    abrirModal(ano, mes, dia, atividade, nomeAtual) {
        this.modalContexto = { ano, mes, dia, atividade, nomeAtual };

        const data = new Date(ano, mes, dia);
        const iso = Holidays.formatar(data);

        document.getElementById("modalData").textContent = data.toLocaleDateString("pt-BR");
        document.getElementById("modalAtividade").textContent = this.nomesAtividades[atividade] || atividade;
        document.getElementById("modalColaboradorAtual").textContent = nomeAtual;

        const ehParEmailV360 = atividade === "email" || atividade === "v360";
        const parBox = document.getElementById("modalSyncBox");
        const checkboxSync = document.getElementById("checkSyncPar");
        const warningBox = document.getElementById("modalWarningEmailConsecutivo");

        if (warningBox) warningBox.style.display = "none";

        if (parBox) {
            if (ehParEmailV360) {
                parBox.style.display = "block";
                const outro = atividade === "email" ? "V360" : "E-MAIL";
                document.getElementById("modalSyncText").textContent =
                    `As tratativas de E-MAIL e V360 são vinculadas para o mesmo colaborador. Ao alterar esta atividade, ${outro} atualizará automaticamente.`;
                if (checkboxSync) checkboxSync.checked = true;
            } else {
                parBox.style.display = "none";
            }
        }

        const select = document.getElementById("selectSubstituto");
        const substituicao = this.obterSubstituicao(ano, mes, dia, atividade);

        // Lista de colaboradores (se for Service Now, avisa que Girlene é fixa)
        select.innerHTML = [
            `<option value="">Selecione um colaborador</option>`,
            ...this.colaboradores.map(nome => `
                <option value="${this.escaparHTML(nome)}" ${substituicao === nome ? "selected" : ""}>
                    ${this.escaparHTML(nome)}${nome === "Girlene" ? " (Fixa Service Now)" : ""}
                </option>
            `)
        ].join("");

        // Validação dinâmica para não colocar o mesmo colaborador 2 dias seguidos no E-mail
        select.onchange = () => {
            if (atividade === "email" && select.value) {
                const escolhido = select.value;
                // Checa dia útil anterior
                const dataAnt = new Date(data);
                dataAnt.setDate(dataAnt.getDate() - 1);
                while (dataAnt.getDay() === 0 || dataAnt.getDay() === 6) dataAnt.setDate(dataAnt.getDate() - 1);
                const isoAnt = Holidays.formatar(dataAnt);

                // Checa dia útil posterior
                const dataPos = new Date(data);
                dataPos.setDate(dataPos.getDate() + 1);
                while (dataPos.getDay() === 0 || dataPos.getDay() === 6) dataPos.setDate(dataPos.getDate() + 1);
                const isoPos = Holidays.formatar(dataPos);

                const colabAnt = this.historicoEmailsDias[isoAnt];
                const colabPos = this.historicoEmailsDias[isoPos];

                if (colabAnt === escolhido || colabPos === escolhido) {
                    if (warningBox) {
                        warningBox.style.display = "block";
                        warningBox.textContent = `Atenção: A regra do sistema não permite o mesmo colaborador 2 dias seguidos no E-mail! ${escolhido} já está escalado(a) no dia adjacente (${colabAnt === escolhido ? 'dia anterior' : 'dia seguinte'}).`;
                    }
                } else {
                    if (warningBox) warningBox.style.display = "none";
                }
            }
        };

        const modal = document.getElementById("modalSubstituicao");
        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
        setTimeout(() => select.focus(), 80);
    },

    fecharModal() {
        const modal = document.getElementById("modalSubstituicao");
        if (!modal) return;
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        this.modalContexto = null;
    },

    salvarSubstituicao() {
        if (!this.modalContexto) return;

        const select = document.getElementById("selectSubstituto");
        const novoNome = select.value;

        if (!novoNome) {
            this.mostrarToast("Selecione o novo colaborador.");
            return;
        }

        const { ano, mes, dia, atividade } = this.modalContexto;
        const chavePrincipal = this.chaveSubstituicao(ano, mes, dia, atividade);

        // Validação da regra: NUNCA adicionar o mesmo colaborador 2 dias seguidos no e-mail
        if (atividade === "email") {
            const dataAtual = new Date(ano, mes, dia);

            const dataAnt = new Date(dataAtual);
            dataAnt.setDate(dataAnt.getDate() - 1);
            while (dataAnt.getDay() === 0 || dataAnt.getDay() === 6) dataAnt.setDate(dataAnt.getDate() - 1);
            const isoAnt = Holidays.formatar(dataAnt);

            const dataPos = new Date(dataAtual);
            dataPos.setDate(dataPos.getDate() + 1);
            while (dataPos.getDay() === 0 || dataPos.getDay() === 6) dataPos.setDate(dataPos.getDate() + 1);
            const isoPos = Holidays.formatar(dataPos);

            if (this.historicoEmailsDias[isoAnt] === novoNome || this.historicoEmailsDias[isoPos] === novoNome) {
                const prosseguir = confirm(
                    `REGRA DE ESCALA:\nNão é permitido o mesmo colaborador 2 dias seguidos no E-mail!\n${novoNome} já está no e-mail no dia adjacente.\n\nDeseja forçar essa alteração como exceção?`
                );
                if (!prosseguir) return;
            }
        }

        this.substituicoes[chavePrincipal] = novoNome;

        const ehParEmailV360 = atividade === "email" || atividade === "v360";
        const sincronizar = document.getElementById("checkSyncPar")?.checked;

        let mensagemToast = `${novoNome} definido na escala.`;

        // Sincronização automática E-MAIL ⇄ V360
        if (ehParEmailV360 && sincronizar) {
            const atividadePar = atividade === "email" ? "v360" : "email";
            const chavePar = this.chaveSubstituicao(ano, mes, dia, atividadePar);
            this.substituicoes[chavePar] = novoNome;

            mensagemToast = `⚡ ${novoNome} definido em ${this.nomesAtividades[atividade]} e sincronizado em ${this.nomesAtividades[atividadePar]}!`;
        }

        if (!this.salvarLocalStorage()) return;

        this.fecharModal();
        this.gerarMes();
        this.mostrarToast(mensagemToast);
    },

    restaurarCelula() {
        if (!this.modalContexto) return;

        const { ano, mes, dia, atividade } = this.modalContexto;
        const chavePrincipal = this.chaveSubstituicao(ano, mes, dia, atividade);
        const ehParEmailV360 = atividade === "email" || atividade === "v360";

        if (!this.substituicoes[chavePrincipal]) {
            this.mostrarToast("Essa célula já está na escala original.");
            return;
        }

        delete this.substituicoes[chavePrincipal];

        if (ehParEmailV360) {
            const atividadePar = atividade === "email" ? "v360" : "email";
            const chavePar = this.chaveSubstituicao(ano, mes, dia, atividadePar);
            if (this.substituicoes[chavePar]) {
                delete this.substituicoes[chavePar];
            }
        }

        this.salvarLocalStorage();
        this.fecharModal();
        this.gerarMes();
        this.mostrarToast("Escala original restaurada.");
    },

    restaurarMes() {
        const mes = Number(document.getElementById("mes").value);
        const ano = Number(document.getElementById("ano").value);
        const prefixo = `${ano}-${String(mes + 1).padStart(2, "0")}-`;

        const chavesDoMes = Object.keys(this.substituicoes).filter(c => c.startsWith(prefixo));

        if (chavesDoMes.length === 0) {
            this.mostrarToast("Não existem alterações manuais neste mês.");
            return;
        }

        const confirmar = confirm(
            `Restaurar toda a escala de ${this.meses[mes]} de ${ano}?\n\nTodas as ${chavesDoMes.length} substituições manuais deste mês serão removidas.`
        );

        if (!confirmar) return;

        chavesDoMes.forEach(k => delete this.substituicoes[k]);
        this.salvarLocalStorage();
        this.gerarMes();
        this.mostrarToast("Escala original do mês restaurada com sucesso.");
    },

    /* ======================================================
       MODAL DE GESTÃO DE ESCALA (FÉRIAS, FOLGA, AUSÊNCIA)
    ====================================================== */
    configurarModalGestao() {
        document.getElementById("btnFecharModalGestao")?.addEventListener("click", () => this.fecharModalGestao());
        document.getElementById("btnAdicionarAusencia")?.addEventListener("click", () => this.adicionarAusencia());
        document.getElementById("btnPredefinirFeriasAdri")?.addEventListener("click", () => this.predefinirFeriasAdri());
        document.getElementById("btnExportarJson")?.addEventListener("click", () => this.exportarJsonGithub());
        document.getElementById("btnImportarJson")?.addEventListener("click", () => document.getElementById("fileInputJson")?.click());
        document.getElementById("fileInputJson")?.addEventListener("change", e => this.importarJsonGithub(e));

        document.getElementById("modalGestao")?.addEventListener("click", event => {
            if (event.target.id === "modalGestao") this.fecharModalGestao();
        });
    },

    abrirModalGestao() {
        const modal = document.getElementById("modalGestao");
        if (!modal) return;

        // Define datas sugeridas no formulário
        const anoAtual = document.getElementById("ano").value;
        const mesAtual = String(Number(document.getElementById("mes").value) + 1).padStart(2, "0");
        document.getElementById("inputAusenciaInicio").value = `${anoAtual}-${mesAtual}-01`;
        document.getElementById("inputAusenciaFim").value = `${anoAtual}-${mesAtual}-05`;

        this.renderizarListaAusencias();

        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
    },

    fecharModalGestao() {
        const modal = document.getElementById("modalGestao");
        if (!modal) return;
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
    },

    renderizarListaAusencias() {
        const container = document.getElementById("listaAusenciasCadastradas");
        if (!container) return;

        if (Scheduler.ausencias.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: var(--muted); padding: 14px; font-size: 11px;">
                    Nenhuma ausência ativa cadastrada. A escala está operando no rodízio padrão.
                </div>
            `;
            return;
        }

        container.innerHTML = Scheduler.ausencias.map((item, idx) => {
            const badgeClass = item.tipo === "ferias" ? "badge-ferias" : item.tipo === "folga" ? "badge-folga" : "badge-ausencia";
            const icone = item.tipo === "ferias" ? "🏖️" : item.tipo === "folga" ? "🌴" : "⚠️";

            return `
                <div class="ausencia-item">
                    <div class="ausencia-info">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span class="badge-tipo ${badgeClass}">${icone} ${item.tipo.toUpperCase()}</span>
                            <strong>${item.colaborador}</strong>
                        </div>
                        <span style="color: var(--muted); font-size: 10.5px;">
                            Período: ${item.inicio} até ${item.fim} ${item.motivo ? `• ${item.motivo}` : ''}
                        </span>
                    </div>
                    <button class="btn-del-ausencia" onclick="App.removerAusencia(${idx})" title="Remover e reverter escala">
                        ✕ Excluir
                    </button>
                </div>
            `;
        }).join("");
    },

    adicionarAusencia() {
        const colaborador = document.getElementById("selectAusenciaColaborador").value;
        const tipo = document.getElementById("selectAusenciaTipo").value; // ferias | folga | ausencia
        const inicio = document.getElementById("inputAusenciaInicio").value;
        const fim = document.getElementById("inputAusenciaFim").value;
        const motivo = document.getElementById("inputAusenciaMotivo").value.trim();

        if (!colaborador || !inicio || !fim) {
            this.mostrarToast("Preencha o colaborador e o período (início e fim).");
            return;
        }

        if (inicio > fim) {
            this.mostrarToast("A data inicial não pode ser maior que a data final.");
            return;
        }

        // Adiciona à lista de ausências
        Scheduler.ausencias.push({
            id: Date.now().toString(),
            colaborador,
            tipo,
            inicio,
            fim,
            motivo: motivo || (tipo === "ferias" ? "Férias" : tipo === "folga" ? "Folga programada" : "Ausência"),
            ativa: true
        });

        this.salvarLocalStorage();
        this.renderizarListaAusencias();
        this.gerarMes();

        const labelTipo = tipo === "ferias" ? "Férias" : tipo === "folga" ? "Folga" : "Ausência";
        this.mostrarToast(`✅ ${labelTipo} de ${colaborador} ativada! Escala redistribuída automaticamente.`);
    },

    removerAusencia(index) {
        if (!confirm("Remover esta ausência e restaurar o rodízio normal do período?")) return;
        Scheduler.ausencias.splice(index, 1);
        this.salvarLocalStorage();
        this.renderizarListaAusencias();
        this.gerarMes();
        this.mostrarToast("Ausência removida. Escala recalculada.");
    },

    /**
     * Atalho rápido para aplicar as férias da Adri de 13/10 a 27/10
     */
    predefinirFeriasAdri() {
        const anoAtual = document.getElementById("ano").value;
        const inicio = `${anoAtual}-10-13`;
        const fim = `${anoAtual}-10-27`;

        // Verifica se já existe
        const jaExiste = Scheduler.ausencias.some(a => a.colaborador === "Adri" && a.inicio === inicio && a.fim === fim);
        if (jaExiste) {
            this.mostrarToast("As férias da Adri já estão cadastradas neste período.");
            return;
        }

        Scheduler.ausencias.push({
            id: Date.now().toString(),
            colaborador: "Adri",
            tipo: "ferias",
            inicio,
            fim,
            motivo: "Férias regulamentares",
            ativa: true
        });

        this.salvarLocalStorage();
        this.renderizarListaAusencias();
        this.gerarMes();
        this.mostrarToast(`🏖️ Férias de Adri (13/10 a 27/10 de ${anoAtual}) ativadas e redistribuídas para Leto e Duda!`);
    },

    /* ======================================================
       SINCRONIZAÇÃO GITHUB / EXPORTAÇÃO JSON
    ====================================================== */
    exportarJsonGithub() {
        const backup = {
            versao: "3.0",
            exportadoEm: new Date().toISOString(),
            substituicoes: this.substituicoes,
            ausencias: Scheduler.ausencias,
            observacao: "Configurações e escalas personalizadas CAF para versionamento GitHub"
        };

        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `CAF_Escala_Github_Config_${Holidays.formatar(new Date())}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.mostrarToast("Arquivo JSON gerado! Pronto para commitar no GitHub.");
    },

    importarJsonGithub(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = e => {
            try {
                const dados = JSON.parse(e.target.result);
                if (dados.substituicoes || dados.ausencias) {
                    this.substituicoes = dados.substituicoes || {};
                    Scheduler.ausencias = dados.ausencias || [];
                    this.salvarLocalStorage();
                    this.gerarMes();
                    this.renderizarListaAusencias();
                    this.mostrarToast("✅ Escalas e ausências importadas do arquivo com sucesso!");
                } else {
                    alert("Formato de arquivo JSON inválido.");
                }
            } catch (err) {
                alert("Erro ao ler o arquivo JSON: " + err.message);
            }
        };
        reader.readAsText(file);
    },

    /* ======================================================
       TOAST
    ====================================================== */
    mostrarToast(mensagem) {
        const toast = document.getElementById("toast");
        if (!toast) return;

        toast.textContent = mensagem;
        toast.classList.add("show");

        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 3400);
    },

    /* ======================================================
       TEMA ESCURO
    ====================================================== */
    alternarTema() {
        document.body.classList.toggle("dark");
        const modoEscuro = document.body.classList.contains("dark");
        localStorage.setItem("CAF_TEMA", modoEscuro ? "dark" : "light");
        this.atualizarBotaoTema();
    },

    atualizarBotaoTema() {
        const btn = document.getElementById("btnTema");
        if (!btn) return;
        const escuro = document.body.classList.contains("dark");
        btn.innerHTML = escuro ? `☀️ Modo Claro` : `🌙 Modo Escuro`;
    },

    carregarTemaSalvo() {
        const tema = localStorage.getItem("CAF_TEMA");
        if (tema === "dark") {
            document.body.classList.add("dark");
        }
        this.atualizarBotaoTema();
    },

    /* ======================================================
       EXPORTAÇÃO EXCEL & PDF
    ====================================================== */
    exportarExcel() {
        if (typeof XLSX === "undefined") {
            alert("Biblioteca Excel não encontrada.");
            return;
        }

        const tabela = document.getElementById("tabelaProgramacao");
        const workbook = XLSX.utils.table_to_book(tabela, { sheet: "Programação" });
        const mes = Number(document.getElementById("mes").value);
        const ano = document.getElementById("ano").value;

        XLSX.writeFile(workbook, `Escala_CAF_${this.meses[mes]}_${ano}.xlsx`);
        this.mostrarToast("Planilha Excel exportada!");
    },

    exportarPDF() {
        if (typeof window.jspdf === "undefined") {
            alert("Biblioteca PDF não encontrada.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
        });

        const mes = Number(document.getElementById("mes").value);
        const ano = document.getElementById("ano").value;

        pdf.setFillColor(37, 99, 235);
        pdf.rect(0, 0, 297, 16, "F");

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(13);
        pdf.text(`CAF • PROGRAMAÇÃO OPERACIONAL — ${this.meses[mes].toUpperCase()} ${ano}`, 14, 10);

        pdf.setFontSize(8);
        pdf.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 240, 10);

        pdf.autoTable({
            html: "#tabelaProgramacao",
            startY: 20,
            theme: "grid",
            styles: {
                fontSize: 7.5,
                cellPadding: 1.8,
                halign: "center",
                valign: "middle"
            },
            headStyles: {
                fillColor: [37, 99, 235],
                textColor: [255, 255, 255],
                fontStyle: "bold"
            }
        });

        pdf.save(`Escala_CAF_${this.meses[mes]}_${ano}.pdf`);
        this.mostrarToast("Relatório PDF exportado!");
    },

    atualizarAnoRodape() {
        const el = document.getElementById("systemYear");
        if (el) el.textContent = ` ${new Date().getFullYear()}`;
    },

    monitorarData() {
        setInterval(() => {
            const agora = new Date();
            if (agora.getHours() === 0 && agora.getMinutes() === 0) {
                this.gerarMes();
            }
        }, 60000);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    App.init();
});
