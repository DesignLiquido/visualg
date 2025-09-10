import { Construto } from '@designliquido/delegua';

import { VisitanteVisuAlgInterface } from '../interfaces';

export class LimpaTela implements Construto {
    linha: number;
    hashArquivo: number;

    constructor(hashArquivo: number, linha: number) {
        this.hashArquivo = hashArquivo;
        this.linha = linha;
    }
    
    async aceitar(visitante: VisitanteVisuAlgInterface): Promise<any> {
        return await visitante.visitarExpressaoLimpaTela(this);
    }

    paraTexto(): string {
        return `<limpa-tela />`;
    }
}
