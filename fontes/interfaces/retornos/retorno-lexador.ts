import { Pragma } from '../../lexador/pragma';
import { ErroLexador } from '../../lexador/erro-lexador';

export interface RetornoLexador<T> {
    simbolos: T[];
    erros: ErroLexador[];
    pragmas?: { [linha: number]: Pragma };
}
