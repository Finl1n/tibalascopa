# Regras de Negocio

## Regras principais

1. A plataforma deve exibir dados reais mesmo sem uso do agente de IA.
2. A fonte oficial do MVP e o TheSportsDB free.
3. A IA nao pode afirmar algo como fato sem base na resposta da API ou no conteudo editorial.
4. Quando um dado estiver ausente, a interface precisa mostrar isso com clareza.
5. O usuario deve conseguir consultar jogos, jogadores e fatos historicos sem usar o chat.
6. A experiencia deve ser rapida, visual e consistente.
7. O projeto precisa estar pronto para adicionar novas competicoes no futuro.

## Regras de dados

- jogos devem ter selecao mandante, visitante, placar e status
- jogadores devem ter identificacao unica sempre que a API fornecer
- fatos historicos devem indicar a edicao ou a fonte editorial
- toda resposta do agente precisa preservar rastreabilidade

## Regras do agente

- nao inventar nomes, numeros ou eventos
- usar apenas contexto recuperado da base
- responder em portugues por padrao
- sinalizar incerteza quando a fonte nao trouxer o dado

## Regras de experiencia

- o dashboard deve funcionar sem login no MVP
- o chat deve ser opcional
- a navegacao deve ser simples
- o visual precisa manter uma identidade forte e nao generica
