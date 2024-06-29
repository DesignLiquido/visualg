# Avaliador Sintático para dialeto VisuAlg

Aqui temos toda a implementação da avaliação sintática para VisuAlg, separada em dois arquivos:

- `avaliador-sintatico-visualg.ts`: O avaliador sintático em si;
- `parametro-visualg.ts`: Uma declaração de tipo de parâmetro. Ao analisar a seção `var` de um fonte com extensão `.alg`, temos a declaração de várias variáveis com o mesmo tipo. Essa estrutura ajuda a mapear essa condensação de variáveis.

## Características do VisuAlg

- Quebras de linha são significativas;
- Durante a avaliação sintática, o avaliador sintático mantém em memória os tipos conhecidos (normalmente registros) e funções e procedimentos conhecidos. Os tipos são usados tanto para indicar quando é necessário uma tipagem mais criteriosa - assim como sua respectiva inicialização, já que um registro é uma composição de outras variáveis de tipos primitivos ou complexos - quanto para validar se o acesso a elementos do registro fazem sentido ou não. Por exemplo, se meu registro é declarado da seguinte forma:

```
tipo teste = registro
   campo1: inteiro
   campo2: caractere
fimregistro
```

Tentar um acesso como o abaixo precisa causar um erro de avaliação sintática, já que o avaliador sabe que a propriedade `campo3` não existe:

```
algoritmo "Acesso a propriedade que não existe"
var
    t: teste
inicio
    leia(t.campo3) // Isso deve causar um erro de avaliação sintática
fimalgoritmo
```

Já para procedimentos e funções, simplesmente mencionar um procedimento ou função causa a sua execução. Por exemplo:

```
algoritmo "Chamada a procedimento sem parênteses"
var
    procedimento escreva123 ()
    inicio
        escreval(123)
    fimprocedimento
inicio
    escreva123 // Isso chama o procedimento, ainda que não tenha parênteses.
fimalgoritmo
```

No ecossistema de Delégua, procedimentos e funções são mantidos no ambiente como variáveis. Delégua e alguns outros dialetos decidem se uma variável é uma chamada ou não com a inclusão de parênteses logo após o nome da função chamada. 

Para decidir se uma expressão é uma chamada sem parênteses ou uma menção a uma variável, o analisador sintático precisa saber os nomes de procedimentos e funções declarados anteriormente.