import { InterpretadorInterface } from '@designliquido/delegua/interfaces';

export function asc(interpretador: InterpretadorInterface, valor: any): Promise<number> {
    const valorResolvido = valor.hasOwnProperty('valor') ? valor.valor : valor;
    return Promise.resolve(String(valorResolvido).charCodeAt(0));
}

export function carac(interpretador: InterpretadorInterface, valor: number): Promise<string> {
    return Promise.resolve(String.fromCharCode(valor));
}

export function caracpnum(interpretador: InterpretadorInterface, valor: any): Promise<number> {
    const valorResolvido = valor.hasOwnProperty('valor') ? valor.valor : valor;
    return Promise.resolve(Number(valorResolvido));
}

export function compr(interpretador: InterpretadorInterface, valor: any): Promise<number> {
    const valorResolvido = valor.hasOwnProperty('valor') ? valor.valor : valor;
    return Promise.resolve(String(valorResolvido).length);
}

export function copia(
    interpretador: InterpretadorInterface,
    valor: string,
    inicio: number,
    fim: number
): Promise<string> {
    const resultadoCopia = valor.substring(inicio - 1, (inicio - 1) + fim);
    return Promise.resolve(resultadoCopia);
}

export function maiusc(interpretador: InterpretadorInterface, valor: any): Promise<string> {
    const valorResolvido = valor.hasOwnProperty('valor') ? valor.valor : valor;
    return Promise.resolve(String(valorResolvido).toUpperCase());
}

export function minusc(interpretador: InterpretadorInterface, valor: string): Promise<string> {
    return Promise.resolve(valor.toLowerCase());
}

export function numpcarac(interpretador: InterpretadorInterface, valor: number): Promise<string> {
    return Promise.resolve(String(valor));
}

export function pos(interpretador: InterpretadorInterface, busca: string, valor: any): Promise<number> {
    const valorResolvido = valor.hasOwnProperty('valor') ? valor.valor : valor;
    return Promise.resolve(String(valorResolvido).indexOf(busca) + 1);
}
