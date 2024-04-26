import { AvaliadorSintaticoVisuAlg } from "../fontes/avaliador-sintatico";
import { LexadorVisuAlg } from "../fontes/lexador";
import { InterpretadorVisuAlgComDepuracao } from '../fontes/interpretador/interpretador-visualg-com-depuracao';

describe('Interpretador com suporte a depuração', () => {
    describe('interpretar()', () => {
        let lexador: LexadorVisuAlg;
        let avaliadorSintatico: AvaliadorSintaticoVisuAlg;
        let interpretador: InterpretadorVisuAlgComDepuracao;

        beforeEach(() => {
            lexador = new LexadorVisuAlg();
            avaliadorSintatico = new AvaliadorSintaticoVisuAlg();
            interpretador = new InterpretadorVisuAlgComDepuracao(process.cwd(), console.log, console.log);
        });

        describe('Cenários de sucesso', () => {
            it('Para, reatribuição do valor inicial de variável de controle', async () => {
                let _saidas = '';
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

                interpretador.funcaoDeRetorno = (saida: any) => {
                    _saidas += saida;
                }

                let execucaoFinalizada: boolean = false;
                interpretador.finalizacaoDaExecucao = () => {
                    execucaoFinalizada = true;
                }

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.prepararParaDepuracao(retornoAvaliadorSintatico.declaracoes);
                await interpretador.instrucaoContinuarInterpretacao();

                expect(execucaoFinalizada).toBe(true);
                expect(_saidas).toBe('123456123456');

                // expect(retornoInterpretador.erros).toHaveLength(0);
            });
        });
    });
});
