import { InterpretadorInterface } from '@designliquido/delegua/interfaces';

export function abs(interpretador: InterpretadorInterface, valor: number): Promise<number> {
    return Promise.resolve(Math.abs(valor));
}

export function arccos(interpretador: InterpretadorInterface, valor: number): Promise<number> {
    return Promise.resolve(Math.acos(valor));
}

export function arcsen(interpretador: InterpretadorInterface, valor: number): Promise<number> {
    return Promise.resolve(Math.asin(valor));
}

export function arctan(interpretador: InterpretadorInterface, valor: number): Promise<number> {
    return Promise.resolve(Math.atan(valor));
}

export function cos(interpretador: InterpretadorInterface, valor: number): Promise<number> {
    return Promise.resolve(Math.cos(valor));
}

export function cotan(interpretador: InterpretadorInterface, valor: number): Promise<number> {
    return Promise.resolve(1 / Math.tan(valor));
}

export function exp(interpretador: InterpretadorInterface, base: any, expoente: any): Promise<number> {
    const baseResolvida = base.hasOwnProperty('valor') ? base.valor : base;
    const expoenteResolvido = base.hasOwnProperty('valor') ? expoente.valor : expoente;
    return Promise.resolve(Math.pow(baseResolvida, expoenteResolvido));
}

export function grauprad(interpretador: InterpretadorInterface, valor: number): Promise<number> {
    return Promise.resolve((valor * Math.PI) / 180);
}

export function int(interpretador: InterpretadorInterface, valor: number): Promise<number> {
    return Promise.resolve(Math.floor(valor));
}

export function log(interpretador: InterpretadorInterface, valor: number): Promise<number> {
    return Promise.resolve(Math.log10(valor));
}

export function logn(interpretador: InterpretadorInterface, valor: number): Promise<number> {
    return Promise.resolve(Math.log(valor));
}

export function pi(): Promise<number> {
    return Promise.resolve(Math.PI);
}

export function quad(interpretador: InterpretadorInterface, valor: any): Promise<number> {
    const valorResolvido = valor.hasOwnProperty('valor') ? valor.valor : valor;
    return Promise.resolve(valorResolvido * valorResolvido);
}

export function radpgrau(interpretador: InterpretadorInterface, valor: number): Promise<number> {
    return Promise.resolve((valor * 180) / Math.PI);
}

export function raizq(interpretador: InterpretadorInterface, valor: any): Promise<number> {
    const valorResolvido = valor.hasOwnProperty('valor') ? valor.valor : valor;
    return Promise.resolve(Math.sqrt(valorResolvido));
}

export function rand(): Promise<number> {
    return Promise.resolve(Math.random());
}

export function randi(interpretador: InterpretadorInterface, limite: number): Promise<number> {
    return Promise.resolve(Math.floor(Math.random() * limite));
}

export function sen(interpretador: InterpretadorInterface, valor: number): Promise<number> {
    return Promise.resolve(Math.sin(valor));
}

export function tan(interpretador: InterpretadorInterface, valor: number): Promise<number> {
    return Promise.resolve(Math.tan(valor));
}
