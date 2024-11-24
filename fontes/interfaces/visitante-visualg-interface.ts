import { VisitanteComumInterface } from '@designliquido/delegua';

import { LimpaTela } from '../construtos/limpa-tela';

export interface VisitanteVisuAlgInterface extends VisitanteComumInterface {
    visitarExpressaoLimpaTela(expressao: LimpaTela): void | Promise<any>;
}
