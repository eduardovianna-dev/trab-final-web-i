/* script.js
   Versão final: suporte a teclado, vírgula, CE, C, backspace, +/-,
   % no modo "Windows", visor secundário, operação em cadeia.
*/

/* Elementos do DOM */
const display = document.getElementById('result');
const operationDisplay = document.getElementById('operation');
const buttons = Array.from(document.querySelectorAll('.buttons button'));

/* Estado interno
   current: string que representa o número que está sendo digitado (com vírgula)
   previous: string (em ponto) armazenado para cálculo
   operator: string com operador atual ("+", "-", "*", "/")
   lastOperand: último operando usado ao pressionar "=" repetidamente (opcional)
*/
let current = "";
let previous = null;
let operator = null;
let lastOperand = null;
let lastOperator = null;

/* =========================
   Funções utilitárias
   ========================= */

/**
 * formata para mostrar com vírgula no visor (string ou number)
 */
function formatForDisplay(value) {
    if (value === null || value === undefined || value === "") return "0";
    // Se for número em string com ponto, converte
    const asStr = String(value);
    if (asStr === "Erro") return "Erro";
    return asStr.replace(".", ",");
}

/**
 * converte string com vírgula para número float (ponto)
 */
function parseInputToNumber(str) {
    if (!str) return 0;
    return parseFloat(str.replace(",", "."));
}

/**
 * Opera dois números (a e b são números JS)
 */
function compute(a, b, op) {
    if (op === "+") return a + b;
    if (op === "-") return a - b;
    if (op === "*") return a * b;
    if (op === "/") {
        if (b === 0) return "Erro";
        return a / b;
    }
    return b;
}

/* =========================
   Atualização do visor
   ========================= */

function updateDisplays() {
    display.innerText = current === "" ? (previous !== null ? formatForDisplay(previous) : "0") : formatForDisplay(current);
    // operação secundária: se houver previous e operator, mostra "previous operator [current]"
    if (previous !== null && operator) {
        const prevDisp = formatForDisplay(previous);
        if (current !== "") {
            operationDisplay.innerText = `${prevDisp} ${operator} ${formatForDisplay(current)}`;
        } else {
            operationDisplay.innerText = `${prevDisp} ${operator}`;
        }
    } else {
        // se não há previous e operator, mas há current e última operação concluída com equals, pode mostrar a operação completa
        operationDisplay.innerText = "";
    }
}

/* =========================
   Entrada por clique
   ========================= */

buttons.forEach(btn => btn.addEventListener('click', () => {
    const value = btn.dataset.value;
    const action = btn.dataset.action;

    if (btn.classList.contains('number')) {
        handleNumber(value);
    } else if (btn.classList.contains('operator')) {
        handleOperator(action);
    } else if (action) {
        handleFunction(action);
    }
}));

/* =========================
   Entrada por teclado
   ========================= */

window.addEventListener('keydown', (e) => {
    // números
    if ((e.key >= '0' && e.key <= '9') || e.key === ',' || e.key === '.') {
        e.preventDefault();
        handleNumber(e.key === '.' ? ',' : e.key);
        return;
    }

    // operadores
    if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        e.preventDefault();
        handleOperator(e.key);
        return;
    }

    // Enter ou '='
    if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleFunction('equal');
        return;
    }

    // Backspace
    if (e.key === 'Backspace') {
        e.preventDefault();
        handleFunction('back');
        return;
    }

    // Escape -> C
    if (e.key === 'Escape') {
        e.preventDefault();
        handleFunction('clear');
        return;
    }

    // % key
    if (e.key === '%') {
        e.preventDefault();
        handleFunction('percent');
        return;
    }

    // numpad +/- (não universal) — ignoramos
});

/* =========================
   Manipuladores
   ========================= */

function handleNumber(d) {
    // evita múltiplas vírgulas
    if (d === ',' && current.includes(',')) return;

    // limita tamanho para evitar overflow do display
    if (current.replace(',', '').length >= 18) return;

    // se display está "Erro", resetar antes
    if (display.innerText === "Erro") {
        current = "";
        previous = null;
        operator = null;
    }

    // evitar leading zeros estranhos
    if (current === "0" && d !== ",") {
        current = d;
    } else {
        current += d;
    }

    updateDisplays();
}

function handleOperator(op) {
    // aceitar operadores como "*" "/" "+" "-"
    op = op.toString();

    // se não há número atual mas há previous: só altera o operador
    if (current === "" && previous !== null) {
        operator = op;
        updateDisplays();
        return;
    }

    // se não há previous, move current para previous
    if (previous === null) {
        previous = current === "" ? 0 : parseInputToNumber(current);
        current = "";
        operator = op;
        lastOperand = null;
        lastOperator = null;
        updateDisplays();
        return;
    }

    // se existe previous e current -> calcular e armazenar resultado como previous
    if (current !== "") {
        const a = Number(previous);
        const b = parseInputToNumber(current);
        const res = compute(a, b, operator);
        if (res === "Erro") {
            showError();
            return;
        }
        previous = Number(res);
        operator = op;
        current = "";
        lastOperand = null;
        lastOperator = null;
        updateDisplays();
        return;
    }

    // caso geral: apenas atualiza operador
    operator = op;
    updateDisplays();
}

function handleFunction(action) {
    switch (action) {
        case 'clear':
            clearAll();
            break;
        case 'clear-entry':
            clearEntry();
            break;
        case 'back':
            backspace();
            break;
        case 'percent':
            percent();
            break;
        case 'plusminus':
            togglePlusMinus();
            break;
        case 'equal':
            equal();
            break;
        default:
            break;
    }
}

/* =========================
   Funções especiais
   ========================= */

function clearAll() {
    current = "";
    previous = null;
    operator = null;
    lastOperand = null;
    lastOperator = null;
    updateDisplays();
    operationDisplay.innerText = "";
}

function clearEntry() {
    current = "";
    updateDisplays();
}

function backspace() {
    if (display.innerText === "Erro") {
        clearAll();
        return;
    }
    if (current !== "") {
        current = current.slice(0, -1);
        updateDisplays();
    } else {
        // se não há current, talvez apagar previous exibido -> não faz nada, mantém previous
    }
}

function togglePlusMinus() {
    if (current === "" && previous !== null && operator === null) {
        // alterar sinal do previous (quando só tem um número no visor)
        previous = -Number(previous);
        updateDisplays();
        return;
    }

    if (current === "") {
        current = "-";
        updateDisplays();
        return;
    }

    // se já começa com -, remover; senão, adicionar
    if (current.startsWith('-')) current = current.slice(1);
    else current = '-' + current;

    updateDisplays();
}

/**
 * percent(): comportamento compatível com Windows:
 * - Se existe previous e operator: current = previous * current / 100
 * - Senão: current = current / 100
 */
function percent() {
    if (current === "") return;
    let curNum = parseInputToNumber(current);

    if (previous !== null && operator) {
        const p = Number(previous);
        const computed = (p * curNum) / 100;
        current = String(computed).replace('.', ',');
    } else {
        current = String(curNum / 100).replace('.', ',');
    }
    updateDisplays();
}

/**
 * equal(): aplica a operação
 * trata pressões repetidas de "=" (repete última operação)
 */
function equal() {
    if (display.innerText === "Erro") {
        clearAll();
        return;
    }

    // Se temos previous e operator e current -> calcular
    if (previous !== null && operator && current !== "") {
        const a = Number(previous);
        const b = parseInputToNumber(current);
        const res = compute(a, b, operator);
        if (res === "Erro") { showError(); return; }

        // atualiza visor secundário com operação completa
        operationDisplay.innerText = `${formatForDisplay(previous)} ${operator} ${formatForDisplay(current)} =`;

        // salva para possível repetição do "="
        lastOperand = b;
        lastOperator = operator;

        // atualiza previous com resultado e zera current
        previous = Number(res);
        current = "";
        operator = null;

        // mostra resultado
        display.innerText = formatForDisplay(previous);
        return;
    }

    // Caso: se pressionou "=" repetidamente, repete operação anterior
    if (previous !== null && lastOperator && lastOperand !== null) {
        const a = Number(previous);
        const b = Number(lastOperand);
        const res = compute(a, b, lastOperator);
        if (res === "Erro") { showError(); return; }

        // atualiza operation display (ex: "20 + 5 =")
        operationDisplay.innerText = `${formatForDisplay(previous)} ${lastOperator} ${formatForDisplay(lastOperand)} =`;

        previous = Number(res);
        display.innerText = formatForDisplay(previous);
        return;
    }

    // Se não há nada para calcular, faz nada
}

/* =========================
   Mensagem de erro
   ========================= */

function showError() {
    display.innerText = "Erro";
    operationDisplay.innerText = "";
    // trava a calculadora até C
    current = "";
    previous = null;
    operator = null;
    lastOperand = null;
    lastOperator = null;
}

/* =========================
   Inicializa estado
   ========================= */
updateDisplays();
