import { InterpretadorInterface } from "@designliquido/delegua/interfaces";

import { VisitanteVisuAlgInterface } from "./visitante-visualg-interface";

export interface InterpretadorVisuAlgInterface extends InterpretadorInterface, VisitanteVisuAlgInterface {
    tiposConhecidos: string[];
    deveEscreverPrompt: boolean;
}
