class Peca 
{   
    constructor(id, ladoA, ladoB) { 
        this.id = id;        
        this.ladoA = ladoA;  
        this.ladoB = ladoB;}
    
    isBucha() {
        return this.ladoA === this.ladoB;
    }
    getValorTotal() {
        return this.ladoA + this.ladoB;
    }
    inverter() {
        const temp = this.ladoA;
        this.ladoA = this.ladoB;
        this.ladoB = temp;
    }
}



const coresDosNumeros = {
    0: "#9e9e9e",
    1: "#ffeb3b",
    2: "#4caf50",
    3: "#00b0ff",
    4: "#ff5722"
};



    const peca1 = new Peca("pc1", 0, 0)
    const peca2 = new Peca("pc2", 0, 1)
    const peca3 = new Peca("pc3", 0, 2)
    const peca4 = new Peca("pc4", 0, 3)
    const peca5 = new Peca("pc5", 0, 4)

    const peca6 = new Peca("pc6", 1, 1)
    const peca7 = new Peca("pc7", 2, 1)
    const peca8 = new Peca("pc8", 3, 1)
    const peca9 = new Peca("pc9", 4, 1)
    const peca10 = new Peca("pc10", 2, 2)

    const peca11 = new Peca("pc11", 3, 2)
    const peca12 = new Peca("pc12", 4, 2)
    const peca13 = new Peca("pc13", 3, 3)
    const peca14 = new Peca("pc14", 4, 3)
    const peca15 = new Peca("pc15", 4, 4)



// ==========================================
// 1. GERADOR DE PEÇAS E EMBARALHAMENTO
// ==========================================

// Função que gera um lote novinho e limpo de 15 peças
function gerarLoteDePecas() {
    const novoLote = []; 
    let contadorId = 1;

    for (let i = 0; i <= 4; i++) {
        for (let j = i; j <= 4; j++) {
            novoLote.push(new Peca(`pc${contadorId}`, i, j));
            contadorId++; 
        }
    }
    return novoLote;
}

// Sua função de embaralhar
function embaralhar(arrayDePecas) {
    for (let i = arrayDePecas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = arrayDePecas[i];
        arrayDePecas[i] = arrayDePecas[j];
        arrayDePecas[j] = temp;
    }
    return arrayDePecas; 
}

// ==========================================
// 2. VARIÁVEIS GLOBAIS DO JOGO
// ==========================================
let mesa = [];
let maoJogador1 = [];
let maoJogador2 = [];
let monteDeCompra = [];

let vitoriasJogador1 = 0;
let vitoriasJogador2 = 0;
let pecaAguardandoLado = null;
let indicePecaAguardando = -1;
let jaComprouNesteTurno = false;
let jogadorAtual = 1;

// ==========================================
// 3. DISTRIBUIÇÃO E INICIALIZAÇÃO DO JOGO
// ==========================================
function distribuirPecas(deck) {
    // Limpa os arrays para garantir que começam vazios
    maoJogador1 = [];
    maoJogador2 = [];
    
    for (let i = 0; i < 5; i++) {
        maoJogador1.push(deck.pop());
        maoJogador2.push(deck.pop());
    }
    monteDeCompra = deck; // O que sobrou vira o monte
}

// 🚀 ESSA É A CARGA INICIAL DO JOGO (Roda assim que a página abre)
function inicializarPrimeiraPartida() {
    const pecasIniciais = gerarLoteDePecas();
    
    console.log("Antes:", [...pecasIniciais]); // O log que você queria ver!
    const deckEmbaralhado = embaralhar(pecasIniciais);
    console.log("Depois:", [...deckEmbaralhado]);

    distribuirPecas(deckEmbaralhado);

    // Define quem começa
    jogadorAtual = definirInicialPorBucha(maoJogador1, maoJogador2);

    // Renderiza tudo na tela
    renderizarMao(maoJogador1, "mao-jogador1");
    renderizarMao(maoJogador2, "mao-jogador2");
    renderizarMesa();
    atualizarBotoesDeControle();
    atualizarPlacarVisual();

    // Se for a IA, faz ela jogar
    if (jogadorAtual === 2) {
        setTimeout(() => { executarTurnoComputador(); }, 1500);
    }
}

// Executa a inicialização assim que o script é lido
inicializarPrimeiraPartida();

function definirInicialPorBucha(maoJ1, maoJ2) {
    console.log("--- Verificando Buchas nas Mãos (Regra A) ---");
    
    let maiorBuchaJ1 = -1;
    let maiorBuchaJ2 = -1;

    // Procura a maior bucha na mão do Jogador 1
    for (let peca of maoJ1) {
        if (peca.isBucha() && peca.ladoA > maiorBuchaJ1) {
            maiorBuchaJ1 = peca.ladoA; // Guarda o valor (ex: se for 4x4, guarda 4)
        }
    }

    // Procura a maior bucha na mão do Jogador 2
    for (let peca of maoJ2) {
        if (peca.isBucha() && peca.ladoA > maiorBuchaJ2) {
            maiorBuchaJ2 = peca.ladoA;
        }
    }

    console.log("Maior bucha do J1 (valor):", maiorBuchaJ1 === -1 ? "Nenhuma" : maiorBuchaJ1);
    console.log("Maior bucha do J2 (valor):", maiorBuchaJ2 === -1 ? "Nenhuma" : maiorBuchaJ2);

    // Compara quem tem a maior bucha
    if (maiorBuchaJ1 > maiorBuchaJ2) {
        console.log("Jogador 1 tem a maior bucha e começa!");
        return 1;
    } else if (maiorBuchaJ2 > maiorBuchaJ1) {
        console.log("Jogador 2 tem a maior bucha e começa!");
        return 2;
    } else {
        // MUDANÇA AQUI: Ninguém tem bucha! O código ativa o plano B automaticamente.
        console.log("Ninguém tem bucha na mão! Ativando a Regra B (Sorteio)...");
        
        // Passamos o monteDeCompra (as peças que sobraram) para fazer o sorteio
        return sortearJogadorInicial(monteDeCompra);
    }
}



function sortearJogadorInicial(deck) {
    console.log("--- Iniciando Sorteio de Peças (Regra B) ---");
    
    // Retira temporariamente duas peças do deck para o sorteio
    const pecaSorteioJ1 = deck[0];
    const pecaSorteioJ2 = deck[1];
    
    console.log(`Jogador 1 sorteou: [${pecaSorteioJ1.ladoA}|${pecaSorteioJ1.ladoB}] (Total: ${pecaSorteioJ1.getValorTotal()})`);
    console.log(`Jogador 2 sorteou: [${pecaSorteioJ2.ladoA}|${pecaSorteioJ2.ladoB}] (Total: ${pecaSorteioJ2.getValorTotal()})`);
    
    if (pecaSorteioJ1.getValorTotal() > pecaSorteioJ2.getValorTotal()) {
        console.log("Jogador 1 começa a partida!");
        return 1; // Retorna 1 se o J1 vencer
    } else if (pecaSorteioJ2.getValorTotal() > pecaSorteioJ1.getValorTotal()) {
        console.log("Jogador 2 começa a partida!");
        return 2; // Retorna 2 se o J2 vencer
    } else {
        console.log("Empate no sorteio! Reembaralhando para tentar de novo...");
        embaralhar(deck);
        return sortearJogadorInicial(deck); // Isso se chama recursividade (a função chama ela mesma se empatar)
    }
}



// 🚀 FUNÇÃO PARA ATIVAR ARRASTO LATERAL VIA MOUSE OU TOQUE (Mesa e Mãos)
function ativarArrastabilidade(seletorElemento) {
    const elemento = document.getElementById(seletorElemento) || document.querySelector(seletorElemento);
    if (!elemento) return;

    let estaPrecionado = false;
    let inicioX;
    let rolagemEsquerda;

    // --- EVENTOS PARA DESKTOP (MOUSE) ---
    elemento.addEventListener('mousedown', (e) => {
        estaPrecionado = true;
        inicioX = e.pageX - elemento.offsetLeft;
        rolagemEsquerda = elemento.scrollLeft;
    });

    elemento.addEventListener('mouseleave', () => {
        estaPrecionado = false;
    });

    elemento.addEventListener('mouseup', () => {
        estaPrecionado = false;
    });

    elemento.addEventListener('mousemove', (e) => {
        if (!estaPrecionado) return;
        e.preventDefault();
        const x = e.pageX - elemento.offsetLeft;
        const caminhado = (x - inicioX) * 1.5; // Multiplicador de velocidade do arrasto
        elemento.scrollLeft = rolagemEsquerda - caminhado;
    });

    // --- EVENTOS PARA MOBILE (TOUCH / ANDROID) ---
    elemento.addEventListener('touchstart', (e) => {
        estaPrecionado = true;
        inicioX = e.touches[0].pageX - elemento.offsetLeft;
        rolagemEsquerda = elemento.scrollLeft;
    }, { passive: true });

    elemento.addEventListener('touchend', () => {
        estaPrecionado = false;
    });

    elemento.addEventListener('touchmove', (e) => {
        if (!estaPrecionado) return;
        const x = e.touches[0].pageX - elemento.offsetLeft;
        const caminhado = (x - inicioX) * 1.5;
        elemento.scrollLeft = rolagemEsquerda - caminhado;
    }, { passive: true });
}

// Ativa o recurso de arrastar na Mesa, na Mão do J1 e na Mão do J2
setTimeout(() => {
    ativarArrastabilidade('tabuleiro');
    ativarArrastabilidade('mao-jogador1');
    ativarArrastabilidade('mao-jogador2');
}, 500);



function tentarJogarPeca(peca, ladoDaMesa) {
    // CENÁRIO 1: Mesa vazia (Primeira jogada do jogo)
    if (mesa.length === 0) {
        console.log(`Primeira peça jogada na mesa: [${peca.ladoA}|${peca.ladoB}]`);
        mesa.push(peca);
        renderizarMesa(); // mostrar Mesa
        return true; // Jogada válida!
    }

    // Descobre os números das extremidades atuais da mesa
    const pontaEsquerda = mesa[0].ladoA;
    const pontaDireita = mesa[mesa.length - 1].ladoB;

    // CENÁRIO 2: Jogador quer jogar na ESQUERDA da mesa
    if (ladoDaMesa === "esquerda") {
        if (peca.ladoB === pontaEsquerda) {
            // Encaixe perfeito: o ladoB da peça bate com a ponta esquerda
            mesa.unshift(peca); // .unshift() adiciona o elemento no INÍCIO do array
            renderizarMesa();             
            return true;
        } else if (peca.ladoA === pontaEsquerda) {
            // Encaixa, mas precisa girar a peça!
            peca.inverter();
            mesa.unshift(peca);
            renderizarMesa(); 
            return true;
        }
    }

    // CENÁRIO 3: Jogador quer jogar na DIREITA da mesa
    if (ladoDaMesa === "direita") {
        if (peca.ladoA === pontaDireita) {
            // Encaixe perfeito: o ladoA da peça bate com a ponta direita
            mesa.push(peca); // .push() adiciona o elemento no FINAL do array
            renderizarMesa();
            return true;
        } else if (peca.ladoB === pontaDireita) {
            // Encaixa, mas precisa girar a peça!
            peca.inverter();
            mesa.push(peca);
            renderizarMesa(); 
            return true;
        }
    }

    // CENÁRIO 4: A peça não encaixa de jeito nenhum
    console.log(`Jogada inválida! A peça [${peca.ladoA}|${peca.ladoB}] não encaixa na ${ladoDaMesa}.`);
    renderizarMesa();
    return false; // Retorna falso para avisar o jogo que a peça não pôde ser jogada
}




function jogadorTemJogadaValida(maoDoJogador) {
    // Se a mesa estiver vazia, qualquer peça é válida!
    if (mesa.length === 0) return true;

    // Pega os valores das duas pontas atuais da mesa
    const pontaEsquerda = mesa[0].ladoA;
    const pontaDireita = mesa[mesa.length - 1].ladoB;

    // Passa por cada peça da mão do jogador
    for (let peca of maoDoJogador) {
        // Se o ladoA ou ladoB de qualquer peça bater com uma das pontas, ele tem jogo!
        if (peca.ladoA === pontaEsquerda || peca.ladoB === pontaEsquerda ||
            peca.ladoA === pontaDireita || peca.ladoB === pontaDireita) {
            return true; 
        }
    }

    return false; // Se olhou todas as peças e nenhuma bateu, retorna falso
}



// 📦 Função para o Jogador 1 Comprar Peça
function jogadorComprarPeca() {
    // 1. Defesas de segurança
    if (jogadorAtual !== 1) {
        alert("Não é o seu turno!");
        return;
    }

    if (monteDeCompra.length === 0) {
        alert("O monte de compra está vazio!");
        return;
    }

    // 2. Regra: Só pode comprar se REALMENTE não tiver jogada na mão
    // (Criaremos a função auxiliar jogadorTemJogadaValida logo abaixo)
    if (jogadorTemJogadaValida(maoJogador1)) {
        alert("Você tem peças válidas na mão! Não pode comprar.");
        return;
    }

    // 3. Executa a compra
    const pecaComprada = monteDeCompra.pop();
    maoJogador1.push(pecaComprada);
    jaComprouNesteTurno = true;
    console.log(`🛒 Você comprou a peça [${pecaComprada.ladoA}|${pecaComprada.ladoB}]. Restam ${monteDeCompra.length} no monte.`);

    // 4. Atualiza a tela
    renderizarMao(maoJogador1, "mao-jogador1");

    // 5. Após comprar, verifica se a nova peça serve ou se liberamos o botão de Passar a Vez
    atualizarBotoesDeControle();
}

// 🚫 Função para o Jogador 1 Passar a Vez
function jogadorPassarVez() {
    if (jogadorAtual !== 1) return;

    // Só passa se não tiver jogada mesmo
    if (jogadorTemJogadaValida(maoJogador1)) {
        alert("Você tem jogadas possíveis! Não pode passar a vez.");
        return;
    }

    console.log("🚨 Você PASSOU A VEZ.");
    document.getElementById("btn-passar").disabled = true; // Desativa o botão
    finalizarTurnoJogador(); // Passa o turno para a I.A.
}

// 🔍 Função Auxiliar: Descobre se o jogador tem alguma peça que encaixa na mesa
function jogadorTemJogadaValida(maoDoJogador) {
    if (mesa.length === 0) return true; // Se a mesa está vazia, qualquer peça serve

    const pontaEsquerda = mesa[0].ladoA;
    const pontaDireita = mesa[mesa.length - 1].ladoB;

    // Se achar pelo menos uma peça que sirva em qualquer uma das pontas, retorna true
    return maoDoJogador.some(peca => 
        peca.ladoA === pontaEsquerda || peca.ladoB === pontaEsquerda ||
        peca.ladoA === pontaDireita || peca.ladoB === pontaDireita
    );
}

// 🕹️ Função para Ativar/Desativar os botões visualmente baseado nas regras
function atualizarBotoesDeControle() {
    const btnComprar = document.getElementById("btn-comprar");
    const btnPassar = document.getElementById("btn-passar");

    const temJogada = jogadorTemJogadaValida(maoJogador1);

    // Se for o turno do jogador 1 e ele NÃO tiver jogadas válidas:
    if (jogadorAtual === 1 && !temJogada) {
        
        // 🆕 Se ele ainda não comprou e o monte tem peças, ele PODE comprar
        if (!jaComprouNesteTurno && monteDeCompra.length > 0) {
            btnComprar.disabled = false;
            btnPassar.disabled = true;
        } 
        // 🆕 Se ele JÁ comprou (e continua travado) OU se o monte estiver zerado:
        else {
            btnComprar.disabled = true;  // Bloqueia a compra
            btnPassar.disabled = false; // Força a passar a vez!
        }

    } else {
        // Se tiver jogada na mão ou não for o turno dele, bloqueia ambos os botões
        btnComprar.disabled = true;
        btnPassar.disabled = true;
    }
}


function gerenciarTurnoSemOpcao(jogadorId, maoDoJogador) {
    console.log(`--- Verificando opções do Jogador ${jogadorId} ---`);

    // 1. Checa se ele já tem jogo na mão (se tiver, não precisa comprar)
    if (jogadorTemJogadaValida(maoDoJogador)) {
        console.log(`Jogador ${jogadorId} possui peças válidas para jogar.`);
        return; 
    }

    // 2. Se não tem jogo, tenta comprar APENAS UMA VEZ do Monte
    console.log(`Jogador ${jogadorId} não tem peças válidas! Comprando do monte (Regra: Apenas 1 compra)...`);

    if (monteDeCompra.length > 0) {
        // Retira uma única peça do monte
        const pecaComprada = monteDeCompra.pop();
        maoDoJogador.push(pecaComprada);
        
        console.log(`Jogador ${jogadorId} comprou a peça: [${pecaComprada.ladoA}|${pecaComprada.ladoB}]. Restam ${monteDeCompra.length} peças no monte.`);

        // Verifica se essa peça específica que acabou de vir serve para jogar
        if (jogadorTemJogadaValida([pecaComprada])) {
            console.log(`A peça comprada serve! Jogador ${jogadorId} pode realizar sua jogada.`);
            return; // Sai da função e deixa o jogador jogar a peça dele
        } else {
            console.log(`A peça comprada NÃO serve.`);
        }
    } else {
        console.log("O monte de compra já estava vazio!");
    }

    // 3. Se chegou aqui, significa que: ou o monte estava vazio, ou a única peça comprada não serviu.
    // Em ambos os casos, o jogador passa a vez compulsoriamente!
    console.log(`🚨 Jogador ${jogadorId} PASSOU A VEZ!`);
    alternarTurno(); 
}




// Função simples para alternar quem joga
function alternarTurno() {
    jogadorAtual = (jogadorAtual === 1) ? 2 : 1;
    console.log(`Agora é o turno do Jogador ${jogadorAtual}`);
}


function exibirMesaNoConsole() {
    // Transforma o array de objetos em uma linha de texto bonita
    // Exemplo opcional se quiser ver os IDs na mesa no futuro:
const mesaVisual = mesa.map(peca => `${peca.id}[${peca.ladoA}|${peca.ladoB}]`).join(" ");
    
    console.log("==========================================");
    console.log("STATUS ATUAL DA MESA:");
    console.log(mesa.length === 0 ? "[ Mesa Vazia ]" : mesaVisual);
    console.log("==========================================");
}


function renderizarMao(mao, idContainer) {
    const container = document.getElementById(idContainer);
    if (!container) return;
    container.innerHTML = "";

    let deveOcultar = false;
    if (idContainer === "mao-jogador2") {
        deveOcultar = true; 
    }

    mao.forEach(peca => {
        const divPeca = document.createElement("div");
        
        // 🚨 CORREÇÃO AQUI: Mudamos de "peca" para "peca-domino" para resgatar o seu estilo original!
        divPeca.className = "peca-domino";
        divPeca.dataset.id = peca.id;

        if (deveOcultar) {
            // Se for ocultar (Jogador 2), adiciona a classe de ocultação e o cadeado
            divPeca.classList.add("peca-oculta");
            divPeca.innerHTML = `
                <div class="bloco-oculto">🔒</div>
            `;
        } else {
            // Se for visível (Jogador 1), monta com as metades originais do seu projeto
            const corA = coresDosNumeros[peca.ladoA] || "#fff";
            const corB = coresDosNumeros[peca.ladoB] || "#fff";

            // Usando as classes "metade-peca" que seu CSS original já reconhece
            divPeca.innerHTML = `
                <div class="metade-peca" style="color: ${corA};">${peca.ladoA}</div>
                <div class="metade-peca" style="color: ${corB};">${peca.ladoB}</div>
            `;

            divPeca.addEventListener("click", () => lidarComCliqueDaPeca(peca.id));
        }

        container.appendChild(divPeca);
    });
}



function renderizarMesa() {
    const tabuleiro = document.getElementById("tabuleiro");
    tabuleiro.innerHTML = ""; // Limpa a mesa antiga

    mesa.forEach(peca => {
        const pecaDiv = document.createElement("div");
        pecaDiv.className = "peca-domino";
        pecaDiv.id = `mesa-${peca.id}`;

        const corLadoA = coresDosNumeros[peca.ladoA];
        const corLadoB = coresDosNumeros[peca.ladoB];

        pecaDiv.innerHTML = `
            <div class="metade-peca" style="color: ${corLadoA}">${peca.ladoA}</div>
            <div class="metade-peca" style="color: ${corLadoB}">${peca.ladoB}</div>
        `;
        tabuleiro.appendChild(pecaDiv);
    });
}


function lidarComCliqueDaPeca(idPeca) {

    // 🛡️ TRAVA DE SEGURANÇA MÁXIMA: Se o jogo acabou ou não for sua vez, ignora o clique na hora!
    if (jogadorAtual !== 1) {
        console.log("🚫 Clique bloqueado: Não é o turno do Jogador 1.");
        return; 
    }

    // Se a IA ganhou, a mão dele terá 0 peças. Bloqueia antes de qualquer lógica!
    if (maoJogador2.length === 0 || maoJogador1.length === 0) {
        verificarFimDeJogo();
        return;
    }

    const indicePeca = maoJogador1.findIndex(p => p.id === idPeca);
    const pecaSelecionada = maoJogador1[indicePeca];

    // 1. CENÁRIO A: Mesa vazia (Primeira jogada - vai direto)
    if (mesa.length === 0) {
        if (tentarJogarPeca(pecaSelecionada, "direita")) {
            maoJogador1.splice(indicePeca, 1); 
            renderizarMao(maoJogador1, "mao-jogador1"); 
            if (!verificarFimDeJogo()) {
                finalizarTurnoJogador(); 
            }
        }
        return; 
    }

    // 2. CENÁRIO B: Mesa com peças (Ativa o seletor visual na tela!)
    pecaAguardandoLado = pecaSelecionada;
    indicePecaAguardando = indicePeca;

    // Mostra as duas metades na mesa verde
    document.getElementById("seletor-lados-mesa").style.display = "block";
    
    // 🆕 CORREÇÃO 1: Faz o botão "Cancelar Seleção" aparecer na tela!
    const btnCancelar = document.getElementById("btn-cancelar");
    if (btnCancelar) {
        btnCancelar.style.display = "inline-block";
    }

    console.log(`💡 Escolha visual ativada para a peça [${pecaSelecionada.ladoA}|${pecaSelecionada.ladoB}]`);
}


function processarEscolhaDeLadoVisual(ladoEscolhido) {
    // Se por algum motivo não houver peça selecionada, ignora
    if (!pecaAguardandoLado) return;

    // Tenta jogar a peça guardada no lado que o usuário clicou na mesa
    const sucesso = tentarJogarPeca(pecaAguardandoLado, ladoEscolhido);

    if (sucesso) {
        // Se deu certo, remove da mão usando os dados guardados
        maoJogador1.splice(indicePecaAguardando, 1);
        renderizarMao(maoJogador1, "mao-jogador1");

        // Esconde as metades da tela novamente
        document.getElementById("seletor-lados-mesa").style.display = "none";
        
        // 🆕 CORREÇÃO 2: Esconde o botão de cancelar já que a jogada foi concluída!
        const btnCancelar = document.getElementById("btn-cancelar");
        if (btnCancelar) {
            btnCancelar.style.display = "none";
        }
        
        // Limpa as variáveis de controle
        pecaAguardandoLado = null;
        indicePecaAguardando = -1;

        // Passa a vez se o jogo não acabou
        if (!verificarFimDeJogo()) {
            finalizarTurnoJogador();
        }
    } else {
        // Se a jogada for inválida naquela ponta, avisa mas deixa as metades abertas 
        // para o usuário tentar clicar na outra ponta ou desistir!
        alert("Esta peça não encaixa deste lado da mesa! Tente o outro lado ou clique em outra peça (ou cancele a seleção).");
    }
}

// 🆕 CORREÇÃO 3: Nova função específica para limpar o estado caso o botão vermelho seja clicado
function cancelarSelecaoPeca() {
    // 1. Oculta a área de seleção verde
    document.getElementById("seletor-lados-mesa").style.display = "none";
    
    // 2. Oculta o próprio botão vermelho
    document.getElementById("btn-cancelar").style.display = "none";
    
    // 3. Reseta os estados de controle do jogo
    pecaAguardandoLado = null;
    indicePecaAguardando = -1;
    
    console.log("❌ Seleção de peça cancelada. Tabuleiro liberado para arrastar.");
}

// Configura os cliques nas metades da mesa
document.getElementById("zona-esquerda").addEventListener("click", () => processarEscolhaDeLadoVisual("esquerda"));
document.getElementById("zona-direita").addEventListener("click", () => processarEscolhaDeLadoVisual("direita"));

// Configura os cliques dos botões de controle
document.getElementById("btn-comprar").addEventListener("click", jogadorComprarPeca);
document.getElementById("btn-passar").addEventListener("click", jogadorPassarVez);

// 🆕 CORREÇÃO 4: Vincula o botão HTML à nova função de cancelamento
document.getElementById("btn-cancelar").addEventListener("click", cancelarSelecaoPeca);

// Altere a sua inicialização para atualizar o estado dos botões logo no início:
renderizarMao(maoJogador1, "mao-jogador1");
renderizarMao(maoJogador2, "mao-jogador2");
renderizarMesa();
atualizarBotoesDeControle(); // 🆕 Adicione esta linha aqui!


function finalizarTurnoJogador() {
    jogadorAtual = 2;
    jaComprouNesteTurno = false; // 🆕 Reseta para a próxima rodada
    console.log("Turno do Jogador 2 (Computador)...");
    atualizarBotoesDeControle(); // 🆕 Adicione aqui para bloquear os botões!
    
    setTimeout(() => {
        executarTurnoComputador();
    }, 1500);
}


//IA jogador 2
function executarTurnoComputador() {
    console.log("🤖 Computador está pensando...");

    // Se a mesa estiver vazia, o computador joga a primeira peça na direita por padrão
    if (mesa.length === 0) {
        const pecaParaJogar = maoJogador2[0];
        if (tentarJogarPeca(pecaParaJogar, "direita")) {
            maoJogador2.splice(0, 1);
            renderizarMao(maoJogador2, "mao-jogador2");
            passarTurnoParaHumano();
        }
        return;
    }

    // Estratégia da I.A.: Procurar na mão uma peça que sirva na mesa
    for (let i = 0; i < maoJogador2.length; i++) {
        const peca = maoJogador2[i];

        // 1. Tenta jogar na esquerda
        if (tentarJogarPeca(peca, "esquerda")) {
    console.log(`🤖 Computador jogou [${peca.ladoA}|${peca.ladoB}] na esquerda.`);
    maoJogador2.splice(i, 1); // Remove da mão do PC
    renderizarMao(maoJogador2, "mao-jogador2"); // Redesenha a mão do PC
    
    // 🚨 CORREÇÃO AQUI: Checa o fim do jogo imediatamente!
    if (verificarFimDeJogo()) {
        return; // Para tudo se o PC ganhou!
    }
    
    passarTurnoParaHumano(); // Só passa o turno se o jogo continuar
    return;
}
        
        // 2. Se não deu na esquerda, tenta jogar na direita
        if (tentarJogarPeca(peca, "direita")) {
    console.log(`🤖 Computador jogou [${peca.ladoA}|${peca.ladoB}] na direita.`);
    maoJogador2.splice(i, 1);
    renderizarMao(maoJogador2, "mao-jogador2");
    
    // 🚨 CORREÇÃO AQUI: Checa o fim do jogo imediatamente!
    if (verificarFimDeJogo()) {
        return; // Para tudo se o PC ganhou!
    }
    
    passarTurnoParaHumano();
    return;
}

    // 3. Se chegou aqui, o computador NÃO tem peças válidas. Ele precisa comprar do Banco!
    console.log("🤖 Computador não tem peças válidas! Tentando comprar...");

    if (monteDeCompra.length > 0) {
        const pecaComprada = monteDeCompra.pop();
        maoJogador2.push(pecaComprada);
        console.log(`🤖 Computador comprou uma peça. Restam ${monteDeCompra.length} no monte.`);
        renderizarMao(maoJogador2, "mao-jogador2");

        // Testa imediatamente se a peça comprada serve na esquerda
        if (tentarJogarPeca(pecaComprada, "esquerda")) {
            maoJogador2.pop(); // Remove ela da mão já que foi para a mesa
            passarTurnoParaHumano();
            renderizarMao(maoJogador2, "mao-jogador2");
            return;
        }
        // Testa se serve na direita
        if (tentarJogarPeca(pecaComprada, "direita")) {
            maoJogador2.pop();
            passarTurnoParaHumano();
            renderizarMao(maoJogador2, "mao-jogador2");
            return;
        }

        // Dentro de executarTurnoComputador, após o PC jogar com sucesso:
    renderizarMao(maoJogador2, "mao-jogador2");
    if (!verificarFimDeJogo()) {
    passarTurnoParaHumano(); // Só devolve o turno se o jogo NÃO acabou
    }
        console.log("🤖 A peça comprada não serve para o Computador.");
    } else {
        console.log("🤖 O monte de compra está vazio.");
    }

    // 4. Se comprou e não serviu (ou banco vazio), ele passa a vez obrigatoriamente
    console.log("🚨 Computador NÃO tem jogadas e PASSOU A VEZ!");
    passarTurnoParaHumano();
}
    }

// Função auxiliar para devolver o controle para você
function passarTurnoParaHumano() {
    jogadorAtual = 1;
    jaComprouNesteTurno = false; // 🆕 Garante que começa falso no seu novo turno
    console.log("👉 É a sua vez, Jogador 1!");
    atualizarBotoesDeControle();
}





function verificarFimDeJogo() {
    // 1. Cenário: Você esvaziou a mão (Vitória normal do Humano)
    if (maoJogador1.length === 0) {
        vitoriasJogador1++; // 🆕 ADICIONADO: Soma o ponto no placar do Jogador 1!
        encerrarPartida(); // Esta função já chama o atualizarPlacarVisual() internamente
        alert("🎉 Parabéns! Você venceu esta partida de Dominó!");
        return true;
    }

    // 2. Cenário: Computador esvaziou a mão (Vitória normal da I.A.)
    if (maoJogador2.length === 0) {
        vitoriasJogador2++; // 🆕 ADICIONADO: Soma o ponto no placar do Computador!
        encerrarPartida(); // Esta função já chama o atualizarPlacarVisual() internamente
        alert("🤖 O Computador venceu a partida! Mais sorte na próxima.");
        return true;
    }

    // 3. Cenário: Jogo travado/fechado
    if (monteDeCompra.length === 0 && 
        !jogadorTemJogadaValida(maoJogador1) && 
        !jogadorTemJogadaValida(maoJogador2)) {
        
        resolverJogoFechado();
        return true;
    }

    return false;
}

function resolverJogoFechado() {
    let pontosJ1 = maoJogador1.reduce((total, peca) => total + peca.ladoA + peca.ladoB, 0);
    let pontosJ2 = maoJogador2.reduce((total, peca) => total + peca.ladoA + peca.ladoB, 0);

    encerrarPartida();

    setTimeout(() => {
        if (pontosJ1 < pontosJ2) {
            vitoriasJogador1++;
            alert(`🔒 O jogo fechou! Você venceu por pontos! (Você: ${pontosJ1} vs PC: ${pontosJ2})`);
        } else if (pontosJ2 < pontosJ1) {
            vitoriasJogador2++;
            alert(`🤖 O jogo fechou! O Computador venceu por pontos! (PC: ${pontosJ2} vs Você: ${pontosJ1})`);
        } else {
            alert(`🤝 O jogo fechou em empate absoluto! Ambos terminaram com ${pontosJ1} pontos.`);
        }
        // Atualiza o placar visual após processar os pontos
        atualizarPlacarVisual();
    }, 100);
}

function encerrarPartida() {
    // 🛡️ CRUCIAL: Muda o jogador para 0 na mesma hora, tornando as mãos e botões inativos!
    jogadorAtual = 0; 
    
    // Atualiza o placar de vitórias na tela
    atualizarPlacarVisual();

    // Bloqueia os botões comuns de compra/passar e mostra o botão de próxima partida
    document.getElementById("btn-comprar").disabled = true;
    document.getElementById("btn-passar").disabled = true;
    document.getElementById("btn-reiniciar").style.display = "inline-block";
}

function atualizarPlacarVisual() {
    document.getElementById("vitorias-j1").textContent = vitoriasJogador1;
    document.getElementById("vitorias-j2").textContent = vitoriasJogador2;
}


function iniciarProximaPartida() {
    console.log("🔄 Preparando o tabuleiro para a próxima partida...");

    // 1. Reseta os estados na memória
    mesa = [];
    pecaAguardandoLado = null;
    indicePecaAguardando = -1;
    jaComprouNesteTurno = false;

    // 2. Limpa o tabuleiro visualmente
    const tabuleiro = document.getElementById("tabuleiro");
    if (tabuleiro) tabuleiro.innerHTML = ""; 

    document.getElementById("btn-reiniciar").style.display = "none";
    document.getElementById("seletor-lados-mesa").style.display = "none";

    // 3. Gera, embaralha e distribui usando as novas funções estruturadas!
    const todasAsPecas = gerarLoteDePecas();
    const pecasEmbaralhadas = embaralhar(todasAsPecas);
    distribuirPecas(pecasEmbaralhadas); 

    // 4. Define quem começa
    jogadorAtual = definirInicialPorBucha(maoJogador1, maoJogador2);

    // 5. Atualiza a tela
    renderizarMao(maoJogador1, "mao-jogador1");
    renderizarMao(maoJogador2, "mao-jogador2");
    renderizarMesa();
    atualizarBotoesDeControle();
    atualizarPlacarVisual();

    if (jogadorAtual === 2) {
        setTimeout(() => { executarTurnoComputador(); }, 1500);
    }
}


// Configura o clique para iniciar a próxima partida
document.getElementById("btn-reiniciar").addEventListener("click", iniciarProximaPartida);

