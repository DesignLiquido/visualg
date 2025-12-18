import { VariavelInterface } from '@designliquido/delegua/interfaces';

import { PilhaVariaveis } from '../fontes/analisador-semantico/pilha-variaveis';

describe('PilhaVariaveis', () => {
    let pilha: PilhaVariaveis;

    beforeEach(() => {
        pilha = new PilhaVariaveis();
    });

    describe('constructor', () => {
        it('Deve inicializar uma pilha vazia', () => {
            expect(pilha.pilha).toEqual([]);
            expect(pilha.eVazio()).toBe(true);
        });
    });

    describe('empilhar()', () => {
        it('Deve adicionar um item à pilha', () => {
            const variaveis = {
                x: { valor: 10, tipo: 'inteiro', imutavel: false } as VariavelInterface
            };

            pilha.empilhar(variaveis);

            expect(pilha.pilha).toHaveLength(1);
            expect(pilha.pilha[0]).toEqual(variaveis);
            expect(pilha.eVazio()).toBe(false);
        });

        it('Deve adicionar múltiplos itens à pilha', () => {
            const variaveis1 = {
                x: { valor: 10, tipo: 'inteiro', imutavel: false } as VariavelInterface
            };
            const variaveis2 = {
                y: { valor: 3.14, tipo: 'real', imutavel: false } as VariavelInterface
            };
            const variaveis3 = {
                z: { valor: 'teste', tipo: 'caractere', imutavel: false } as VariavelInterface
            };

            pilha.empilhar(variaveis1);
            pilha.empilhar(variaveis2);
            pilha.empilhar(variaveis3);

            expect(pilha.pilha).toHaveLength(3);
            expect(pilha.pilha[0]).toEqual(variaveis1);
            expect(pilha.pilha[1]).toEqual(variaveis2);
            expect(pilha.pilha[2]).toEqual(variaveis3);
        });

        it('Deve aceitar um objeto vazio', () => {
            const variaveisVazio = {};

            pilha.empilhar(variaveisVazio);

            expect(pilha.pilha).toHaveLength(1);
            expect(pilha.pilha[0]).toEqual({});
        });

        it('Deve aceitar múltiplas variáveis em um único objeto', () => {
            const variaveis = {
                x: { valor: 10, tipo: 'inteiro', imutavel: false } as VariavelInterface,
                y: { valor: 3.14, tipo: 'real', imutavel: false } as VariavelInterface,
                z: { valor: 'abc', tipo: 'caractere', imutavel: false } as VariavelInterface
            };

            pilha.empilhar(variaveis);

            expect(pilha.pilha).toHaveLength(1);
            expect(pilha.pilha[0]).toEqual(variaveis);
            expect(Object.keys(pilha.pilha[0])).toHaveLength(3);
        });
    });

    describe('eVazio()', () => {
        it('Deve retornar true quando a pilha está vazia', () => {
            expect(pilha.eVazio()).toBe(true);
        });

        it('Deve retornar false quando a pilha contém itens', () => {
            const variaveis = {
                x: { valor: 10, tipo: 'inteiro', imutavel: false } as VariavelInterface
            };

            pilha.empilhar(variaveis);

            expect(pilha.eVazio()).toBe(false);
        });

        it('Deve retornar true após remover todos os itens', () => {
            const variaveis = {
                x: { valor: 10, tipo: 'inteiro', imutavel: false } as VariavelInterface
            };

            pilha.empilhar(variaveis);
            pilha.removerUltimo();

            expect(pilha.eVazio()).toBe(true);
        });
    });

    describe('topoDaPilha()', () => {
        it('Deve retornar o elemento do topo sem removê-lo', () => {
            const variaveis1 = {
                x: { valor: 10, tipo: 'inteiro', imutavel: false } as VariavelInterface
            };
            const variaveis2 = {
                y: { valor: 3.14, tipo: 'real', imutavel: false } as VariavelInterface
            };

            pilha.empilhar(variaveis1);
            pilha.empilhar(variaveis2);

            const topo = pilha.topoDaPilha();

            expect(topo).toEqual(variaveis2);
            expect(pilha.pilha).toHaveLength(2);
        });

        it('Deve lançar erro quando a pilha está vazia', () => {
            expect(() => pilha.topoDaPilha()).toThrow('Pilha vazia.');
        });

        it('Deve retornar sempre o último elemento adicionado', () => {
            const variaveis1 = {
                x: { valor: 10, tipo: 'inteiro', imutavel: false } as VariavelInterface
            };
            const variaveis2 = {
                y: { valor: 3.14, tipo: 'real', imutavel: false } as VariavelInterface
            };
            const variaveis3 = {
                z: { valor: 'teste', tipo: 'caractere', imutavel: false } as VariavelInterface
            };

            pilha.empilhar(variaveis1);
            expect(pilha.topoDaPilha()).toEqual(variaveis1);

            pilha.empilhar(variaveis2);
            expect(pilha.topoDaPilha()).toEqual(variaveis2);

            pilha.empilhar(variaveis3);
            expect(pilha.topoDaPilha()).toEqual(variaveis3);

            expect(pilha.pilha).toHaveLength(3);
        });
    });

    describe('removerUltimo()', () => {
        it('Deve remover e retornar o elemento do topo', () => {
            const variaveis1 = {
                x: { valor: 10, tipo: 'inteiro', imutavel: false } as VariavelInterface
            };
            const variaveis2 = {
                y: { valor: 3.14, tipo: 'real', imutavel: false } as VariavelInterface
            };

            pilha.empilhar(variaveis1);
            pilha.empilhar(variaveis2);

            const removido = pilha.removerUltimo();

            expect(removido).toEqual(variaveis2);
            expect(pilha.pilha).toHaveLength(1);
            expect(pilha.topoDaPilha()).toEqual(variaveis1);
        });

        it('Deve lançar erro quando a pilha está vazia', () => {
            expect(() => pilha.removerUltimo()).toThrow('Pilha vazia.');
        });

        it('Deve remover elementos na ordem LIFO (Last In, First Out)', () => {
            const variaveis1 = {
                x: { valor: 10, tipo: 'inteiro', imutavel: false } as VariavelInterface
            };
            const variaveis2 = {
                y: { valor: 3.14, tipo: 'real', imutavel: false } as VariavelInterface
            };
            const variaveis3 = {
                z: { valor: 'teste', tipo: 'caractere', imutavel: false } as VariavelInterface
            };

            pilha.empilhar(variaveis1);
            pilha.empilhar(variaveis2);
            pilha.empilhar(variaveis3);

            expect(pilha.removerUltimo()).toEqual(variaveis3);
            expect(pilha.removerUltimo()).toEqual(variaveis2);
            expect(pilha.removerUltimo()).toEqual(variaveis1);
            expect(pilha.eVazio()).toBe(true);
        });

        it('Deve permitir remover até esvaziar completamente a pilha', () => {
            const variaveis = {
                x: { valor: 10, tipo: 'inteiro', imutavel: false } as VariavelInterface
            };

            pilha.empilhar(variaveis);

            expect(pilha.eVazio()).toBe(false);
            pilha.removerUltimo();
            expect(pilha.eVazio()).toBe(true);
        });
    });

    describe('Cenários integrados', () => {
        it('Deve suportar múltiplas operações de empilhar e remover', () => {
            const variaveis1 = {
                x: { valor: 10, tipo: 'inteiro', imutavel: false } as VariavelInterface
            };
            const variaveis2 = {
                y: { valor: 3.14, tipo: 'real', imutavel: false } as VariavelInterface
            };
            const variaveis3 = {
                z: { valor: 'teste', tipo: 'caractere', imutavel: false } as VariavelInterface
            };

            pilha.empilhar(variaveis1);
            pilha.empilhar(variaveis2);
            expect(pilha.pilha).toHaveLength(2);

            pilha.removerUltimo();
            expect(pilha.pilha).toHaveLength(1);

            pilha.empilhar(variaveis3);
            expect(pilha.pilha).toHaveLength(2);
            expect(pilha.topoDaPilha()).toEqual(variaveis3);

            pilha.removerUltimo();
            expect(pilha.topoDaPilha()).toEqual(variaveis1);
        });

        it('Deve lançar erro após remover todos os elementos e tentar acessar o topo', () => {
            const variaveis = {
                x: { valor: 10, tipo: 'inteiro', imutavel: false } as VariavelInterface
            };

            pilha.empilhar(variaveis);
            pilha.removerUltimo();

            expect(() => pilha.topoDaPilha()).toThrow('Pilha vazia.');
            expect(() => pilha.removerUltimo()).toThrow('Pilha vazia.');
        });

        it('Deve simular escopos de variáveis aninhados', () => {
            const escopoGlobal = {
                x: { valor: 10, tipo: 'inteiro', imutavel: false } as VariavelInterface,
                y: { valor: 20, tipo: 'inteiro', imutavel: false } as VariavelInterface
            };
            const escopoFuncao1 = {
                a: { valor: 3.14, tipo: 'real', imutavel: false } as VariavelInterface
            };
            const escopoFuncao2 = {
                b: { valor: 'abc', tipo: 'caractere', imutavel: false } as VariavelInterface
            };

            pilha.empilhar(escopoGlobal);
            pilha.empilhar(escopoFuncao1);
            pilha.empilhar(escopoFuncao2);

            expect(pilha.pilha).toHaveLength(3);
            expect(pilha.topoDaPilha()).toEqual(escopoFuncao2);

            pilha.removerUltimo();
            expect(pilha.topoDaPilha()).toEqual(escopoFuncao1);

            pilha.removerUltimo();
            expect(pilha.topoDaPilha()).toEqual(escopoGlobal);

            pilha.removerUltimo();
            expect(pilha.eVazio()).toBe(true);
        });
    });
});
