# VS Code Customizations Source

Este directorio guarda las fuentes versionables de customizaciones locales para VS Code que no conviene depender de `.github/` porque ese arbol esta ignorado por git en este repo.

## Regla

- `ai/vscode/*.agent.md` -> se sincroniza a `.github/agents/`
- `ai/vscode/*.instructions.md` -> se sincroniza a `.github/instructions/`
- `ai/vscode/*.prompt.md` -> se sincroniza a `.github/prompts/`

## Uso

```bash
npm run sync:vscode
```

Eso copia las fuentes versionables de este directorio hacia la estructura local que VS Code consume.

## Notas

- `ai/` es la fuente canónica versionable.
- `.github/` en este repo es una capa local de activación para VS Code.
- Si cambias una customización en `ai/vscode/`, vuelve a correr `npm run sync:vscode`.
