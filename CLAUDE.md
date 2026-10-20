## Skills de diseño (uso obligatorio)
En cualquier tarea de frontend, UI, UX, maquetación, estilos o componentes de este proyecto:
- Antes de diseñar: usa ui-ux-pro-max para elegir estilo, paleta, tipografía y reglas UX según el tipo de producto.
- Al construir: aplica design-taste-frontend (taste skill) para evitar el diseño genérico "de IA".
- Al terminar: pasa /impeccable critique y /impeccable polish sobre lo que hayas hecho y corrige lo que salga.
Lee el SKILL.md de cada una antes de empezar; no te las saltes aunque la tarea parezca pequeña.

Notas de uso (skills instaladas en `.claude/skills/`):
- El script de ui-ux-pro-max se ejecuta con ruta del proyecto, no con `${CLAUDE_PLUGIN_ROOT}`:
  `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<consulta>" --design-system` (o `--domain <dominio>`, `--stack nextjs`).
- Impeccable: `.claude/skills/impeccable/scripts/impeccable context` al empezar la sesión; `detect` al terminar el trabajo de UI.
- Stack del proyecto: Next.js (App Router) + Tailwind. Paleta de marca azul de idesie.com: respétala; las recomendaciones de las skills no la sustituyen sin aprobación.
