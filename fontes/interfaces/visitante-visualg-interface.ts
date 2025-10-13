import { VisitanteComumInterface } from '@designliquido/delegua';

import { LimpaTela } from '../construtos/limpa-tela';
import { Aleatorio } from '../declaracoes';

export interface VisitanteVisuAlgInterface extends VisitanteComumInterface {
    visitarDeclaracaoAleatorio(declaracao: Aleatorio): Promise<any> | void;
    visitarExpressaoLimpaTela(expressao: LimpaTela): void | Promise<any>;
}
