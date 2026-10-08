# Gather Inbox Papers

Script em TypeScript que anima Smart Objects do tipo **Inbox** no [Gather](https://www.gather.town), fazendo a pilha de papéis subir e descer sozinha.

## Como funciona

Cada objeto recebe eventos `counter.increment` e `counter.decrement` via webhook (padrão Standard Webhooks, usando o SDK oficial `@gathertown/webhook-object-sdk`). Os 3 objetos rodam em paralelo e de forma independente, cada um com um ritmo aleatório próprio.

## Configuração

1. Instale as dependências:

```bash
   npm install
```

2. Crie um arquivo `.env` com a URL e o secret de cada objeto (cada objeto tem o seu par; o token de um não funciona em outro):

GATHER_URL_1=

GATHER_SECRET_1=


GATHER_URL_2=

GATHER_SECRET_2=


GATHER_URL_3=

GATHER_SECRET_3=


O secret é gerado em ⋮ → "Regenerate token" no objeto e aparece só uma vez.

3. Rode:

```bash
   npx tsx script.ts
```

## Ajustes

- `OBJECT_COUNT`: quantidade de objetos (adicione as variáveis correspondentes no `.env`).
- `MAX`: máximo de papéis na pilha.
- `INTERVAL`: intervalo base entre eventos. O limite do Gather é de 60 req/min por espaço, compartilhado entre os 3 objetos.

## Segurança

Nunca commite o `.env`. Ele já deve estar no `.gitignore`.

Para parar, use `Ctrl+C`: o script zera o contador dos objetos antes de sair.
