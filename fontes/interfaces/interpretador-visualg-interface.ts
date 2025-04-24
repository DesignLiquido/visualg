import { InterpretadorInterface } from '@designliquido/delegua/interfaces';

import { VisitanteVisuAlgInterface } from './visitante-visualg-interface';
import { Const, ConstMultiplo, Var, VarMultiplo } from '@designliquido/delegua/declaracoes';
import { TipoEscopoExecucao } from '@designliquido/delegua/interfaces/escopo-execucao';

export interface InterpretadorVisuAlgInterface extends InterpretadorInterface, VisitanteVisuAlgInterface {
    proximoEscopo?: TipoEscopoExecucao;
    tiposConhecidos: string[];
    deveEscreverPrompt: boolean;
    avaliacaoDeclaracaoVarOuConst(declaracao: Const | ConstMultiplo | Var | VarMultiplo): Promise<any>;
}
