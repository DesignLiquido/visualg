import { AvaliadorSintaticoVisuAlg } from "../fontes/avaliador-sintatico";
import { LexadorVisuAlg } from "../fontes/lexador";
import { InterpretadorVisuAlgComDepuracao } from '../fontes/interpretador/interpretador-visualg-com-depuracao';

describe('Interpretador com suporte a depuração', () => {
    describe('interpretar()', () => {
        let lexador: LexadorVisuAlg;
        let avaliadorSintatico: AvaliadorSintaticoVisuAlg;
        let interpretador: InterpretadorVisuAlgComDepuracao;
        let _saidas: string[] = [];
        const funcaoSaida = (texto: string) => {
            _saidas.push(texto);
        }

        beforeEach(() => {
            _saidas = [];
            lexador = new LexadorVisuAlg();
            avaliadorSintatico = new AvaliadorSintaticoVisuAlg();
            interpretador = new InterpretadorVisuAlgComDepuracao(process.cwd(), funcaoSaida, funcaoSaida);
        });

        describe('Cenários de sucesso', () => {
            it('Para, reatribuição do valor inicial de variável de controle', async () => {
                const retornoLexador = lexador.mapear([
                    'algoritmo "valor x"',
                    'var',
                    '    x: inteiro',
                    'inicio',
                    '    x <- 0',
                    '    para x de 1 ate 6 faca',
                    '        escreval(x)',
                    '    fimpara',
                    '    para x de 1 ate 6 faca',
                    '        escreval(x)',
                    '    fimpara',
                    'fimalgoritmo'
                ], -1);

                let execucaoFinalizada: boolean = false;
                interpretador.finalizacaoDaExecucao = () => {
                    execucaoFinalizada = true;
                }

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.prepararParaDepuracao(retornoAvaliadorSintatico.declaracoes);
                await interpretador.instrucaoContinuarInterpretacao();

                expect(execucaoFinalizada).toBe(true);
                expect(_saidas).toHaveLength(12);
                expect(_saidas[0]).toBe('1');
                expect(_saidas[1]).toBe('2');
                expect(_saidas[2]).toBe('3');
                expect(_saidas[3]).toBe('4');
                expect(_saidas[4]).toBe('5');
                expect(_saidas[5]).toBe('6');
                expect(_saidas[6]).toBe('1');
                expect(_saidas[7]).toBe('2');
                expect(_saidas[8]).toBe('3');
                expect(_saidas[9]).toBe('4');
                expect(_saidas[10]).toBe('5');
                expect(_saidas[11]).toBe('6');
            });
        });
    });
});
