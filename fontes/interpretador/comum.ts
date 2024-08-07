import {
    AcessoElementoMatriz,
    AcessoIndiceVariavel,
    AcessoMetodoOuPropriedade,
    AtribuicaoPorIndice,
    AtribuicaoPorIndicesMatriz,
    Binario,
    Construto,
    FimPara,
    FormatacaoEscrita,
    Literal,
    Logico,
    Unario,
    Variavel,
    Vetor,
} from '@designliquido/delegua/construtos';
import {
    Aleatorio,
    CabecalhoPrograma,
    Classe,
    Declaracao,
    Expressao,
    InicioAlgoritmo,
    Leia,
    Para,
    Var,
} from '@designliquido/delegua/declaracoes';
import { Simbolo } from '@designliquido/delegua/lexador';
import { SimboloInterface, VariavelInterface } from '@designliquido/delegua/interfaces';

import { ErroEmTempoDeExecucao } from '@designliquido/delegua/excecoes';
import { InterpretadorBase } from '@designliquido/delegua/interpretador/interpretador-base';
import { PilhaEscoposExecucaoInterface } from '@designliquido/delegua/interfaces/pilha-escopos-execucao-interface';
import {
    DescritorTipoClasse,
    DeleguaFuncao,
    FuncaoPadrao,
    ObjetoDeleguaClasse,
} from '@designliquido/delegua/estruturas';

import { inferirTipoVariavel } from './inferenciador';
import { InterpretadorVisuAlgInterface } from '../interfaces';

import tiposDeSimbolos from '../tipos-de-simbolos/lexico-regular';

import * as bibliotecaCaracteres from '../bibliotecas/caracteres';
import * as bibliotecaNumerica from '../bibliotecas/numerica';

export function carregarBibliotecaGlobalCaracter(pilhaEscoposExecucao: PilhaEscoposExecucaoInterface) {
    pilhaEscoposExecucao.definirVariavel('asc', new FuncaoPadrao(1, bibliotecaCaracteres.asc));
    pilhaEscoposExecucao.definirVariavel('carac', new FuncaoPadrao(1, bibliotecaCaracteres.carac));
    pilhaEscoposExecucao.definirVariavel('caracpnum', new FuncaoPadrao(1, bibliotecaCaracteres.caracpnum));
    pilhaEscoposExecucao.definirVariavel('compr', new FuncaoPadrao(1, bibliotecaCaracteres.compr));
    pilhaEscoposExecucao.definirVariavel('copia', new FuncaoPadrao(3, bibliotecaCaracteres.copia));
    pilhaEscoposExecucao.definirVariavel('maiusc', new FuncaoPadrao(1, bibliotecaCaracteres.maiusc));
    pilhaEscoposExecucao.definirVariavel('minusc', new FuncaoPadrao(1, bibliotecaCaracteres.minusc));
    pilhaEscoposExecucao.definirVariavel('numpcarac', new FuncaoPadrao(1, bibliotecaCaracteres.numpcarac));
    pilhaEscoposExecucao.definirVariavel('pos', new FuncaoPadrao(2, bibliotecaCaracteres.pos));
}

export function carregarBibliotecaGlobalNumerica(pilhaEscoposExecucao: PilhaEscoposExecucaoInterface) {
    pilhaEscoposExecucao.definirVariavel('abs', new FuncaoPadrao(1, bibliotecaNumerica.abs));
    pilhaEscoposExecucao.definirVariavel('arccos', new FuncaoPadrao(1, bibliotecaNumerica.arccos));
    pilhaEscoposExecucao.definirVariavel('arcsen', new FuncaoPadrao(1, bibliotecaNumerica.arcsen));
    pilhaEscoposExecucao.definirVariavel('arctan', new FuncaoPadrao(1, bibliotecaNumerica.arctan));
    pilhaEscoposExecucao.definirVariavel('cos', new FuncaoPadrao(1, bibliotecaNumerica.cos));
    pilhaEscoposExecucao.definirVariavel('cotan', new FuncaoPadrao(1, bibliotecaNumerica.cotan));
    pilhaEscoposExecucao.definirVariavel('exp', new FuncaoPadrao(2, bibliotecaNumerica.exp));
    pilhaEscoposExecucao.definirVariavel('grauprad', new FuncaoPadrao(1, bibliotecaNumerica.grauprad));
    pilhaEscoposExecucao.definirVariavel('int', new FuncaoPadrao(1, bibliotecaNumerica.int));
    pilhaEscoposExecucao.definirVariavel('log', new FuncaoPadrao(1, bibliotecaNumerica.log));
    pilhaEscoposExecucao.definirVariavel('logn', new FuncaoPadrao(1, bibliotecaNumerica.logn));
    pilhaEscoposExecucao.definirVariavel('pi', new FuncaoPadrao(0, bibliotecaNumerica.pi));
    pilhaEscoposExecucao.definirVariavel('quad', new FuncaoPadrao(1, bibliotecaNumerica.quad));
    pilhaEscoposExecucao.definirVariavel('radpgrau', new FuncaoPadrao(1, bibliotecaNumerica.radpgrau));
    pilhaEscoposExecucao.definirVariavel('raizq', new FuncaoPadrao(1, bibliotecaNumerica.raizq));
    pilhaEscoposExecucao.definirVariavel('rand', new FuncaoPadrao(0, bibliotecaNumerica.rand));
    pilhaEscoposExecucao.definirVariavel('randi', new FuncaoPadrao(1, bibliotecaNumerica.randi));
    pilhaEscoposExecucao.definirVariavel('sen', new FuncaoPadrao(1, bibliotecaNumerica.sen));
    pilhaEscoposExecucao.definirVariavel('tan', new FuncaoPadrao(1, bibliotecaNumerica.tan));
}

export async function visitarDeclaracaoCabecalhoPrograma(
    interpretador: InterpretadorVisuAlgInterface,
    declaracao: CabecalhoPrograma
): Promise<any> {
    return Promise.resolve();
}

/**
 * Uma declaração de "classe" no VisuAlg nada mais é que a definição de um registro.
 * Não há propriedades e não há herança. Por isso usamos uma versão simplificada
 * da implementação original de Delégua.
 * @param declaracao A declaração de registro.
 * @returns Sempre retorna nulo, por ser requerido pelo contrato de visita.
 */
export async function visitarDeclaracaoClasse(
    interpretador: InterpretadorVisuAlgInterface,
    declaracao: Classe
): Promise<any> {
    const metodos = {};
    if (declaracao.metodos.length > 0) {
        const declaracaoConstrutor = declaracao.metodos[0];
        const funcao = new DeleguaFuncao('construtor', declaracaoConstrutor.funcao, undefined, true);
        metodos['construtor'] = funcao;
    }

    const descritorTipoClasse: DescritorTipoClasse = new DescritorTipoClasse(
        declaracao.simbolo,
        undefined,
        metodos,
        declaracao.propriedades
    );

    interpretador.pilhaEscoposExecucao.definirConstante(declaracao.simbolo.lexema, descritorTipoClasse);
    interpretador.tiposConhecidos.push(declaracao.simbolo.lexema);
    return null;
}

export async function visitarDeclaracaoInicioAlgoritmo(
    interpretador: InterpretadorVisuAlgInterface,
    declaracao: InicioAlgoritmo
): Promise<any> {
    return Promise.resolve();
}

function converterValor(valor: any, tipo: string) {
    switch (tipo) {
        case 'inteiro':
            return parseInt(valor);
        case 'lógico':
            return Boolean(valor);
        case 'número':
        case 'real':
            return Number(valor);
        case 'texto':
            return String(valor);
        default:
            return valor;
    }
}

export async function atribuirVariavel(
    interpretador: InterpretadorVisuAlgInterface,
    expressao: Construto,
    valor: any
): Promise<any> {
    if (expressao instanceof Variavel) {
        interpretador.pilhaEscoposExecucao.atribuirVariavel(expressao.simbolo, valor);
        return;
    }

    if (expressao instanceof AcessoElementoMatriz) {
        const promises = await Promise.all([
            avaliar(interpretador, expressao.indicePrimario),
            avaliar(interpretador, expressao.indiceSecundario),
            avaliar(interpretador, expressao.entidadeChamada),
        ]);
    
        let indicePrimario = promises[0];
        let indiceSecundario = promises[1];
        let entidadeChamada = promises[2];
    
        entidadeChamada = entidadeChamada.hasOwnProperty('valor') ? entidadeChamada.valor : entidadeChamada;
        indicePrimario = indicePrimario.hasOwnProperty('valor') ? indicePrimario.valor : indicePrimario;
        indiceSecundario = indiceSecundario.hasOwnProperty('valor') ? indiceSecundario.valor : indiceSecundario;
    
        if (Array.isArray(entidadeChamada)) {
            if (indicePrimario < 0 && entidadeChamada.length !== 0) {
                while (indicePrimario < 0) {
                    indicePrimario += entidadeChamada.length;
                }
            }
            if (indiceSecundario < 0 && entidadeChamada.length !== 0) {
                while (indiceSecundario < 0) {
                    indiceSecundario += entidadeChamada.length;
                }
            }
    
            while (entidadeChamada.length < indicePrimario || entidadeChamada.length < indiceSecundario) {
                entidadeChamada.push(null);
            }
    
            entidadeChamada[indicePrimario][indiceSecundario] = valor;
            return Promise.resolve();
        }
    
        if (entidadeChamada instanceof Vetor) {
            const primeiraDimensao = entidadeChamada.valores[indicePrimario];
            const tipoElementar = primeiraDimensao.tipo.replace('[]', '');
            primeiraDimensao.valores[indiceSecundario] = converterValor(valor, tipoElementar);
            return Promise.resolve();
        }
    }

    if (expressao instanceof AcessoIndiceVariavel) {
        const promises = await Promise.all([
            interpretador.avaliar(expressao.entidadeChamada),
            interpretador.avaliar(expressao.indice),
        ]);

        let alvo = promises[0];
        let indice = promises[1];
        let valorAlvo: Vetor | Array<any>;
        let valorIndice: any;

        if (alvo.hasOwnProperty('valor')) {
            valorAlvo = alvo.valor;
        } else {
            valorAlvo = alvo;
        }

        if (indice.hasOwnProperty('valor')) {
            valorIndice = indice.valor;
        } else {
            valorIndice = indice;
        }

        const subtipo = String(alvo.tipo).replace('[]', '');
        const valorResolvido: any = converterValor(valor, subtipo);

        if (valorAlvo instanceof Vetor) {
            valorAlvo.valores[valorIndice] = valorResolvido;
        } else {
            valorAlvo[valorIndice] = valorResolvido;
        }

        return;
    }

    if (expressao instanceof AcessoMetodoOuPropriedade) {
        // Há apenas duas possibilidades aqui:
        // 1. A entidade é uma variável
        // 2. A entidade é um elemento de um vetor.
        let referenciaVariavel;
        let tipoBaseVariavel: string;
        if (expressao.objeto instanceof AcessoIndiceVariavel) {
            referenciaVariavel = await interpretador.avaliar(expressao.objeto.entidadeChamada);
            tipoBaseVariavel = referenciaVariavel.tipo.replace('[]', '');
        } else {
            referenciaVariavel = await interpretador.avaliar(expressao.objeto);
            tipoBaseVariavel = referenciaVariavel.tipo;
        }

        // A única forma de o avaliador sintático gerar uma expressão do tipo
        // `AcessoMetodoOuPropriedade` é se o `objeto` é um registro.
        // Portanto, temos que pesquisar aqui o tipo da propriedade.
        const tipoRelacionado = interpretador.pilhaEscoposExecucao.obterVariavelPorNome(tipoBaseVariavel);
        const descritorTipoRelacionado: DescritorTipoClasse = tipoRelacionado.hasOwnProperty('valor')
            ? tipoRelacionado.valor
            : tipoRelacionado;
        const propriedadeRelacionada = descritorTipoRelacionado.propriedades.find(
            (p) => p.nome.lexema === expressao.simbolo.lexema
        );
        if (!propriedadeRelacionada) {
            throw new ErroEmTempoDeExecucao(
                expressao.simbolo,
                `Propriedade "${expressao.simbolo.lexema}" não existe no tipo ${descritorTipoRelacionado.simboloOriginal.lexema}.`
            );
        }

        let variavelObjeto: VariavelInterface = await interpretador.avaliar(expressao.objeto);
        const valorVariavelObjeto: ObjetoDeleguaClasse = variavelObjeto.hasOwnProperty('valor')
            ? variavelObjeto.valor
            : variavelObjeto;
        let valorConvertido = converterValor(valor, propriedadeRelacionada.tipo);
        valorVariavelObjeto.definir(expressao.simbolo, valorConvertido);
    }
}

async function avaliar(interpretador: InterpretadorVisuAlgInterface, expressao: Construto): Promise<any> {
    return await expressao.aceitar(interpretador);
}

function eIgual(esquerda: VariavelInterface | any, direita: VariavelInterface | any): boolean {
    if (esquerda === null && direita === null) return true;
    if (esquerda === null) return false;
    return esquerda === direita;
}

function eVerdadeiro(objeto: any): boolean {
    if (objeto === null) return false;
    if (typeof objeto === 'boolean') return Boolean(objeto);
    if (objeto.hasOwnProperty('valor')) {
        return Boolean(objeto.valor);
    }

    return true;
}

function verificarOperandosNumeros(
    operador: SimboloInterface,
    direita: VariavelInterface | any,
    esquerda: VariavelInterface | any
): void {
    const tipoDireita: string = direita.tipo ? direita.tipo : typeof direita === 'number' ? 'número' : String(NaN);
    const tipoEsquerda: string = esquerda.tipo ? esquerda.tipo : typeof esquerda === 'number' ? 'número' : String(NaN);

    const tiposNumericos = ['inteiro', 'numero', 'número', 'real'];
    if (tiposNumericos.includes(tipoDireita.toLowerCase()) && tiposNumericos.includes(tipoEsquerda.toLowerCase()))
        return;

    throw new ErroEmTempoDeExecucao(operador, 'Operadores precisam ser números.', operador.linha);
}

function inicializacaoVetorOuMatriz(vetor: Vetor, valorPadrao: any, tipoVetor: string) {
    vetor.tipo = tipoVetor;
    for (let i = 0; i < vetor.valores.length; i++) {
        if (vetor.valores[i] instanceof Vetor) {
            inicializacaoVetorOuMatriz((vetor as any).valores[i], valorPadrao, tipoVetor);
        } else {
            vetor.valores[i] = valorPadrao;
        }
    }
}

/**
 * Executa expressão de definição de variável.
 * @param declaracao A declaração Var
 * @returns Sempre retorna nulo.
 */
export async function visitarDeclaracaoVar(
    interpretador: InterpretadorVisuAlgInterface,
    declaracao: Var
): Promise<any> {
    let valorFinal: any = await interpretador.avaliacaoDeclaracaoVarOuConst(declaracao);
    const tipoInferido: string = declaracao.tipo;

    if (String(declaracao.tipo).includes('[]')) {
        switch (declaracao.tipo as any) {
            case 'caracter[]':
            case 'caractere[]': // TODO: Reduzir para 'caracter' na análise sintática.
            case 'texto[]':
                inicializacaoVetorOuMatriz(valorFinal, '', tipoInferido);
                break;
            case 'inteiro[]':
            case 'real[]':
                inicializacaoVetorOuMatriz(valorFinal, 0, tipoInferido);
                break;
        }
    }

    interpretador.pilhaEscoposExecucao.definirVariavel(declaracao.simbolo.lexema, valorFinal, tipoInferido);

    return null;
}


export async function visitarExpressaoAcessoIndiceVariavel(
    interpretador: InterpretadorVisuAlgInterface,
    expressao: AcessoIndiceVariavel | any
): Promise<any> {
    const promises = await Promise.all([
        interpretador.avaliar(expressao.entidadeChamada),
        interpretador.avaliar(expressao.indice),
    ]);

    const variavelObjeto: VariavelInterface = promises[0];
    const indice = promises[1];

    const objeto = variavelObjeto.hasOwnProperty('valor') ? variavelObjeto.valor : variavelObjeto;
    let valorIndice = indice.hasOwnProperty('valor') ? indice.valor : indice;

    if (Array.isArray(objeto)) {
        if (!Number.isInteger(valorIndice)) {
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    expressao.simboloFechamento,
                    'Somente inteiros podem ser usados para indexar um vetor.',
                    expressao.linha
                )
            );
        }

        if (valorIndice < 0 && objeto.length !== 0) {
            while (valorIndice < 0) {
                valorIndice += objeto.length;
            }
        }

        if (valorIndice >= objeto.length) {
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    expressao.simboloFechamento,
                    'Índice do vetor fora do intervalo.',
                    expressao.linha
                )
            );
        }

        return objeto[valorIndice];
    }

    if (objeto instanceof Vetor) {
        return objeto.valores[valorIndice];
    }

    if (
        objeto.constructor === Object ||
        objeto instanceof ObjetoDeleguaClasse ||
        objeto instanceof DeleguaFuncao ||
        objeto instanceof DescritorTipoClasse
    ) {
        return objeto[valorIndice] || null;
    }

    if (typeof objeto === 'string') {
        if (!Number.isInteger(valorIndice)) {
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    expressao.simboloFechamento,
                    'Somente inteiros podem ser usados para indexar um vetor.',
                    expressao.linha
                )
            );
        }

        if (valorIndice < 0 && objeto.length !== 0) {
            while (valorIndice < 0) {
                valorIndice += objeto.length;
            }
        }

        if (valorIndice >= objeto.length) {
            return Promise.reject(
                new ErroEmTempoDeExecucao(expressao.simboloFechamento, 'Índice fora do tamanho.', expressao.linha)
            );
        }

        return objeto.charAt(valorIndice);
    }

    return Promise.reject(
        new ErroEmTempoDeExecucao(
            expressao.entidadeChamada.nome,
            'Somente listas, dicionários, classes e objetos podem ter seus valores indexados.',
            expressao.linha
        )
    );
}

export async function visitarExpressaoAtribuicaoPorIndice(
    interpretador: InterpretadorVisuAlgInterface,
    expressao: AtribuicaoPorIndice
): Promise<any> {
    const promises = await Promise.all([
        interpretador.avaliar(expressao.objeto),
        interpretador.avaliar(expressao.indice),
        interpretador.avaliar(expressao.valor),
    ]);

    let objeto = promises[0];
    let indice = promises[1];
    const valor = promises[2];

    objeto = objeto.hasOwnProperty('valor') ? objeto.valor : objeto;
    indice = indice.hasOwnProperty('valor') ? indice.valor : indice;

    if (Array.isArray(objeto)) {
        if (indice < 0 && objeto.length !== 0) {
            while (indice < 0) {
                indice += objeto.length;
            }
        }

        while (objeto.length < indice) {
            objeto.push(null);
        }

        objeto[indice] = valor;
    } else if (objeto instanceof Vetor) {
        objeto.valores[indice] = valor;
    } else if (
        objeto.constructor === Object ||
        objeto instanceof ObjetoDeleguaClasse ||
        objeto instanceof DeleguaFuncao ||
        objeto instanceof DescritorTipoClasse
    ) {
        objeto[indice] = valor;
    } else {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                expressao.objeto.nome,
                'Somente listas, dicionários, classes e objetos podem ser mudados por sobrescrita.',
                expressao.linha
            )
        );
    }
}

/**
 * Método de visita de expressão binária.
 * Reintroduzido pelas particularidades do VisuAlg.
 * @param expressao A expressão binária.
 * @returns O resultado da resolução da expressão.
 */
export async function visitarExpressaoBinaria(
    interpretador: InterpretadorVisuAlgInterface,
    expressao: Binario | any
): Promise<any> {
    try {
        const promises = await Promise.all([
            avaliar(interpretador, expressao.esquerda),
            avaliar(interpretador, expressao.direita),
        ]);

        const esquerda: VariavelInterface | any = promises[0];
        const direita: VariavelInterface | any = promises[1];

        let valorEsquerdo: any = esquerda?.hasOwnProperty('valor') ? esquerda.valor : esquerda;
        let valorDireito: any = direita?.hasOwnProperty('valor') ? direita.valor : direita;

        // No VisuAlg, uma variável pode resolver para função porque funções não precisam ter parênteses.
        // Esta parte evita o problema.
        if (valorEsquerdo && valorEsquerdo.hasOwnProperty('funcao')) {
            valorEsquerdo = valorEsquerdo.funcao();
        }

        if (valorDireito && valorDireito.hasOwnProperty('funcao')) {
            valorDireito = valorDireito.funcao();
        }

        const tipoEsquerdo: string = esquerda?.hasOwnProperty('tipo') ? esquerda.tipo : inferirTipoVariavel(esquerda);
        const tipoDireito: string = direita?.hasOwnProperty('tipo') ? direita.tipo : inferirTipoVariavel(direita);

        switch (expressao.operador.tipo) {
            case tiposDeSimbolos.EXPONENCIACAO:
                verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Math.pow(valorEsquerdo, valorDireito);

            case tiposDeSimbolos.MAIOR:
                verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Number(valorEsquerdo) > Number(valorDireito);

            case tiposDeSimbolos.MAIOR_IGUAL:
                verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Number(valorEsquerdo) >= Number(valorDireito);

            case tiposDeSimbolos.MENOR:
                verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Number(valorEsquerdo) < Number(valorDireito);

            case tiposDeSimbolos.MENOR_IGUAL:
                verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Number(valorEsquerdo) <= Number(valorDireito);

            case tiposDeSimbolos.SUBTRACAO:
                verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Number(valorEsquerdo) - Number(valorDireito);

            case tiposDeSimbolos.ADICAO:
                let tiposNumericos = ['inteiro', 'numero', 'número', 'real'];
                if (
                    tiposNumericos.includes(tipoEsquerdo.toLowerCase()) &&
                    tiposNumericos.includes(tipoDireito.toLowerCase())
                ) {
                    return Number(valorEsquerdo) + Number(valorDireito);
                } else {
                    return String(valorEsquerdo) + String(valorDireito);
                }

            case tiposDeSimbolos.DIVISAO:
                verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Number(valorEsquerdo) / Number(valorDireito);

            case tiposDeSimbolos.DIVISAO_INTEIRA:
                verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Math.floor(Number(valorEsquerdo) / Number(valorDireito));

            case tiposDeSimbolos.MULTIPLICACAO:
                if (tipoEsquerdo === 'texto' || tipoDireito === 'texto') {
                    // Sem ambos os valores resolvem como texto, multiplica normal.
                    // Se apenas um resolve como texto, o outro repete o
                    // texto n vezes, sendo n o valor do outro.
                    if (tipoEsquerdo === 'texto' && tipoDireito === 'texto') {
                        return Number(valorEsquerdo) * Number(valorDireito);
                    }

                    if (tipoEsquerdo === 'texto') {
                        return valorEsquerdo.repeat(Number(valorDireito));
                    }

                    return valorDireito.repeat(Number(valorEsquerdo));
                }

                return Number(valorEsquerdo) * Number(valorDireito);

            case tiposDeSimbolos.MODULO:
                verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Number(valorEsquerdo) % Number(valorDireito);

            case tiposDeSimbolos.DIFERENTE:
                return !eIgual(valorEsquerdo, valorDireito);

            case tiposDeSimbolos.IGUAL:
                return eIgual(valorEsquerdo, valorDireito);
        }
    } catch (erro: any) {
        return Promise.reject(erro);
    }
}

export async function visitarExpressaoLogica(
    interpretador: InterpretadorVisuAlgInterface,
    expressao: Logico
): Promise<any> {
    const esquerda = await avaliar(interpretador, expressao.esquerda);

    // se um estado for verdadeiro, retorna verdadeiro
    if (expressao.operador.tipo === tiposDeSimbolos.OU) {
        if (eVerdadeiro(esquerda)) return esquerda;
    }

    // se a primeira variável é verdadeiro, retorna a segunda invertida
    if (expressao.operador.tipo === tiposDeSimbolos.XOU) {
        const valorDireito = await avaliar(interpretador, expressao.direita);
        return eVerdadeiro(esquerda) !== eVerdadeiro(valorDireito);
    }

    // se um estado for falso, retorna falso
    if (expressao.operador.tipo === tiposDeSimbolos.E) {
        if (!eVerdadeiro(esquerda)) return esquerda;
    }

    return await avaliar(interpretador, expressao.direita);
}

/* Isso existe porque o laço `para` do VisuAlg pode ter o passo positivo ou negativo
 * dependendo dos operandos de início e fim, que só são possíveis de determinar
 * em tempo de execução.
 * Quando um dos operandos é uma variável, tanto a condição do laço quanto o
 * passo são considerados indefinidos aqui.
 */
export async function resolverIncrementoPara(
    interpretador: InterpretadorVisuAlgInterface,
    declaracao: Para
): Promise<any> {
    if (declaracao.resolverIncrementoEmExecucao) {
        const promises = await Promise.all([
            avaliar(interpretador, (declaracao.condicao as any).esquerda),
            avaliar(interpretador, (declaracao.condicao as any).direita),
        ]);
        const operandoEsquerdo = promises[0];
        const operandoDireito = promises[1];
        const valorAtualEsquerdo = operandoEsquerdo.hasOwnProperty('valor') ? operandoEsquerdo.valor : operandoEsquerdo;
        const valorAtualDireito = operandoDireito.hasOwnProperty('valor') ? operandoDireito.valor : operandoDireito;

        if (valorAtualEsquerdo < valorAtualDireito) {
            (declaracao.condicao as any).operador = new Simbolo(
                tiposDeSimbolos.MENOR_IGUAL,
                '',
                '',
                Number(declaracao.linha),
                declaracao.hashArquivo
            );
            (declaracao.incrementar as FimPara).condicaoPara.operador = new Simbolo(
                tiposDeSimbolos.MENOR,
                '',
                '',
                Number(declaracao.linha),
                declaracao.hashArquivo
            );
            ((declaracao.incrementar as FimPara).incremento as Expressao).expressao.valor.direita = new Literal(
                declaracao.hashArquivo,
                Number(declaracao.linha),
                1
            );
        } else {
            (declaracao.condicao as any).operador = new Simbolo(
                tiposDeSimbolos.MAIOR_IGUAL,
                '',
                '',
                Number(declaracao.linha),
                declaracao.hashArquivo
            );
            (declaracao.incrementar as FimPara).condicaoPara.operador = new Simbolo(
                tiposDeSimbolos.MAIOR,
                '',
                '',
                Number(declaracao.linha),
                declaracao.hashArquivo
            );
            ((declaracao.incrementar as FimPara).incremento as Expressao).expressao.valor.direita = new Unario(
                declaracao.hashArquivo,
                new Simbolo(tiposDeSimbolos.SUBTRACAO, '-', undefined, declaracao.linha, declaracao.hashArquivo),
                new Literal(declaracao.hashArquivo, Number(declaracao.linha), 1),
                'ANTES'
            );
        }
    }
}

export async function visitarExpressaoAcessoElementoMatriz(
    interpretador: InterpretadorVisuAlgInterface,
    expressao: AcessoElementoMatriz
): Promise<any> {
    const promises = await Promise.all([
        avaliar(interpretador, expressao.entidadeChamada),
        avaliar(interpretador, expressao.indicePrimario),
        avaliar(interpretador, expressao.indiceSecundario),
    ]);

    const variavelObjeto: VariavelInterface = promises[0];
    const indicePrimario = promises[1];
    const indiceSecundario = promises[2];

    const objeto = variavelObjeto.hasOwnProperty('valor') ? variavelObjeto.valor : variavelObjeto;
    let valorIndicePrimario = indicePrimario.hasOwnProperty('valor') ? indicePrimario.valor : indicePrimario;
    let valorIndiceSecundario = indiceSecundario.hasOwnProperty('valor') ? indiceSecundario.valor : indiceSecundario;

    if (!Number.isInteger(valorIndicePrimario) || !Number.isInteger(valorIndiceSecundario)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                expressao.simboloFechamento,
                'Somente inteiros podem ser usados para indexar um vetor.',
                expressao.linha
            )
        );
    }

    if (Array.isArray(objeto)) {
        if (valorIndicePrimario < 0 && objeto.length !== 0) {
            while (valorIndicePrimario < 0) {
                valorIndicePrimario += objeto.length;
            }
        }

        if (valorIndiceSecundario < 0 && objeto.length !== 0) {
            while (valorIndiceSecundario < 0) {
                valorIndiceSecundario += objeto.length;
            }
        }

        if (valorIndicePrimario >= objeto.length || valorIndiceSecundario >= objeto.length) {
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    expressao.simboloFechamento,
                    'Índice do vetor fora do intervalo.',
                    expressao.linha
                )
            );
        }

        return objeto[valorIndicePrimario][valorIndiceSecundario];
    }

    if (objeto instanceof Vetor) {
        const vetorPrimario = objeto.valores[valorIndicePrimario];
        return vetorPrimario.valores[valorIndiceSecundario];
    }

    return Promise.reject(
        new ErroEmTempoDeExecucao(
            expressao.entidadeChamada.valor,
            'Somente listas, dicionários, classes e objetos podem ser mudados por sobrescrita.',
            expressao.linha
        )
    );
}

export async function visitarExpressaoAtribuicaoPorIndicesMatriz(
    interpretador: InterpretadorVisuAlgInterface,
    expressao: AtribuicaoPorIndicesMatriz
): Promise<any> {
    const promises = await Promise.all([
        avaliar(interpretador, expressao.objeto),
        avaliar(interpretador, expressao.indicePrimario),
        avaliar(interpretador, expressao.indiceSecundario),
        avaliar(interpretador, expressao.valor),
    ]);

    let objeto = promises[0];
    let indicePrimario = promises[1];
    let indiceSecundario = promises[2];
    const valor = promises[3];

    objeto = objeto.hasOwnProperty('valor') ? objeto.valor : objeto;
    indicePrimario = indicePrimario.hasOwnProperty('valor') ? indicePrimario.valor : indicePrimario;
    indiceSecundario = indiceSecundario.hasOwnProperty('valor') ? indiceSecundario.valor : indiceSecundario;

    if (Array.isArray(objeto)) {
        if (indicePrimario < 0 && objeto.length !== 0) {
            while (indicePrimario < 0) {
                indicePrimario += objeto.length;
            }
        }
        if (indiceSecundario < 0 && objeto.length !== 0) {
            while (indiceSecundario < 0) {
                indiceSecundario += objeto.length;
            }
        }

        while (objeto.length < indicePrimario || objeto.length < indiceSecundario) {
            objeto.push(null);
        }

        objeto[indicePrimario][indiceSecundario] = valor;
        return Promise.resolve();
    }

    if (objeto instanceof Vetor) {
        const primeiraDimensao = objeto.valores[indicePrimario];
        const tipoElementar = primeiraDimensao.tipo.replace('[]', '');
        primeiraDimensao.valores[indiceSecundario] = converterValor(valor, tipoElementar);
        return Promise.resolve();
    }

    return Promise.reject(
        new ErroEmTempoDeExecucao(
            expressao.objeto.nome,
            'Somente listas, dicionários, classes e objetos podem ser mudados por sobrescrita.',
            expressao.linha
        )
    );
}

async function encontrarLeiaNoAleatorio(
    interpretador: InterpretadorVisuAlgInterface,
    declaracao: Declaracao,
    menorNumero: number,
    maiorNumero: number
) {
    if ('declaracoes' in declaracao) {
        // Se a declaração tiver um campo 'declaracoes', ela é um Bloco
        const declaracoes = declaracao.declaracoes as Declaracao[];
        for (const subDeclaracao of declaracoes) {
            encontrarLeiaNoAleatorio(interpretador, subDeclaracao, menorNumero, maiorNumero);
        }
    } else if (declaracao instanceof Leia) {
        // Se encontrarmos um Leia, podemos efetuar as operações imediatamente
        for (const argumento of declaracao.argumentos) {
            const arg1 = await interpretador.avaliar(argumento);
            const tipoDe = arg1.tipo || inferirTipoVariavel(arg1);
            const valor =
                tipoDe === 'texto' ? palavraAleatoriaCom5Digitos() : gerarNumeroAleatorio(menorNumero, maiorNumero);
            atribuirVariavel(interpretador, argumento, valor);
        }
    }
}

function gerarNumeroAleatorio(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
}

function palavraAleatoriaCom5Digitos(): string {
    const caracteres = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let palavra = '';

    for (let i = 0; i < 5; i++) {
        const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
        palavra += caracteres.charAt(indiceAleatorio);
    }
    return palavra;
}

export async function visitarDeclaracaoAleatorio(
    interpretador: InterpretadorVisuAlgInterface,
    expressao: Aleatorio
): Promise<any> {
    let retornoExecucao: any;
    try {
        let menorNumero = 0;
        let maiorNumero = 100;

        if (expressao.argumentos) {
            menorNumero = Math.min(expressao.argumentos.min, expressao.argumentos.max);
            maiorNumero = Math.max(expressao.argumentos.min, expressao.argumentos.max);
        }
        for (let corpoDeclaracao of expressao.corpo.declaracoes) {
            encontrarLeiaNoAleatorio(interpretador, corpoDeclaracao, menorNumero, maiorNumero);
            retornoExecucao = await interpretador.executar(corpoDeclaracao, false);
        }
    } catch (error) {
        interpretador.erros.push({
            erroInterno: error,
            linha: expressao.linha,
            hashArquivo: expressao.hashArquivo,
        });
        return Promise.reject(error);
    }

    return retornoExecucao;
}

/**
 * Formata uma saída de acordo com o número e espaços e casas decimais solicitados.
 * @param declaracao A declaração de formatação de escrita.
 * @returns {string} A saída formatada como texto e os respectivos parâmetros aplicados.
 */
export async function visitarExpressaoFormatacaoEscrita(
    interpretador: InterpretadorBase,
    declaracao: FormatacaoEscrita
): Promise<string> {
    let resultado = '';
    const conteudo: VariavelInterface | any = await interpretador.avaliar(declaracao.expressao);

    const valorConteudo: any = conteudo?.hasOwnProperty('valor') ? conteudo.valor : conteudo;
    const tipoConteudo: string = conteudo?.hasOwnProperty('tipo') ? conteudo.tipo : typeof conteudo;

    resultado = valorConteudo;
    if (['real', 'inteiro'].includes(tipoConteudo) && declaracao.casasDecimais > 0) {
        resultado = valorConteudo.toLocaleString('pt', { minimumFractionDigits: declaracao.casasDecimais });
    }

    if (declaracao.espacos > 0) {
        resultado = ' '.repeat(declaracao.espacos) + resultado;
    }

    return resultado;
}

/**
 * Customização da leitura de dados de entrada.
 * A interrupção da execução para leitura de dados do usuário
 * ocorre quando o modo aleatório não está habilitado.
 * @param interpretador A instância do interpretador.
 * @param expressao A expressão `Leia`
 * @param mensagemPrompt A mensagem de prompt. Normalmente é o último conteúdo da função `escreva()`
 *                       ou ainda `escreval()`, e é usada em prompts Web, como por exemplo `window.prompt`.
 */
export async function visitarExpressaoLeia(
    interpretador: InterpretadorVisuAlgInterface,
    expressao: Leia,
    mensagemPrompt: string
): Promise<any> {
    // Verifica se a leitura deve ser interrompida antes de prosseguir
    if (!expressao.eParaInterromper) {
        for (let argumento of expressao.argumentos) {
            const promessaLeitura: Function = () =>
                new Promise((resolucao) =>
                    interpretador.interfaceEntradaSaida.question(
                        interpretador.deveEscreverPrompt ? mensagemPrompt : '',
                        (resposta: any) => {
                            mensagemPrompt = '> ';
                            resolucao(resposta);
                        }
                    )
                );
            const valorLido = await promessaLeitura();
            await atribuirVariavel(interpretador, argumento, valorLido);
        }
    }
}
