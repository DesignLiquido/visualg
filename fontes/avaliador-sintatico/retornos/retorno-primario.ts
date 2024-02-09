import {
    AcessoIndiceVariavel,
    Agrupamento,
    Chamada,
    Dicionario,
    FuncaoConstruto,
    Literal,
    Super,
    Variavel,
    Vetor,
} from '../../construtos';
import { Importar } from '../../declaracoes';

export type RetornoPrimario =
    | Super
    | Vetor
    | Dicionario
    | Literal
    | Agrupamento
    | Variavel
    | AcessoIndiceVariavel
    | Chamada
    | Importar
    | FuncaoConstruto;
