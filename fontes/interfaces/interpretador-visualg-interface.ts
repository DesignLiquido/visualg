import { InterpretadorInterface } from "@designliquido/delegua/interfaces";

import { VisitanteVisuAlgInterface } from "./visitante-visualg-interface";
import { Const, ConstMultiplo, Var, VarMultiplo } from "@designliquido/delegua/declaracoes";

export interface InterpretadorVisuAlgInterface extends InterpretadorInterface, VisitanteVisuAlgInterface {
    tiposConhecidos: string[];
    deveEscreverPrompt: boolean;
    avaliacaoDeclaracaoVarOuConst(declaracao: Const | ConstMultiplo | Var | VarMultiplo): Promise<any>;
}
