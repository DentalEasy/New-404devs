# The Kraken Design System Handoff

Fonte analisada:
- `C:\Users\sh050\Downloads\Breaching training by The Kraken.html`

Objetivo definido:
- Fazer engenharia reversa completa da referência para reconstruir um Design System profissional e escalável.
- Entregáveis finais esperados:
  - `variables.css`
  - `tailwind.config.js`

## Decisões já tomadas

- Formato do Tailwind escolhido: `Tailwind v3 + aliases`
- O sistema final deve cobrir:
  - tokens visuais
  - componentes
  - motion system
- Motion stack desejado:
  - `GSAP` para animações estruturais e de scroll
  - `Canvas/WebGL` para backgrounds animados
  - `CSS Keyframes` para micro-interações

## Regra importante da análise

O HTML salvo contém muito CSS injetado por terceiros/extensões. Para manter fidelidade, a análise deve considerar apenas o CSS original do site e ignorar ruído como:
- Monica
- Ant Design/overlays externos
- Vimeo player CSS
- outros estilos de terceiros injetados no arquivo salvo

## Fontes e Tipografia extraídas

Famílias:
- Heading: `stratos, sans-serif`
- Body/UI/Buttons: `Ppneuemontreal, Arial, sans-serif`
- Labels/All caps: `Dmmono, Georgia, sans-serif`

Estilos principais identificados:
- `.heading-style-h1`
  - `font-family: stratos`
  - `font-size: 18rem`
  - `font-weight: 500`
  - `line-height: 1`
  - `letter-spacing: -.375rem`
- `.heading-style-h2`
  - `font-family: stratos`
  - `text-transform: uppercase`
  - `font-weight: 700`
  - `line-height: 1.2`
  - `letter-spacing: -.075rem`
- `.heading-style-h3`
  - `font-family: Ppneuemontreal`
  - `font-weight: 500`
  - `line-height: 1.2`
  - `letter-spacing: -.02rem`
- `.text-style-allcaps`
  - `font-family: Dmmono`
  - `text-transform: uppercase`
  - `font-weight: 500`
  - cor padrão verde clara da marca

## Cores extraídas

Base da marca:
- `--base-color-brand--green-dark: #1c261f`
- `--base-color-brand--green: #707f6f`
- `--base-color-brand--green-light: #a1a89a`
- `--base-color-brand--green-lightest: #c5cebd`
- `--base-color-brand--red: #df3838`

Neutros:
- `--base-color-neutral--black: #000000`
- `--base-color-neutral--white: #ffffff`
- `--base-color-neutral--neutral: #666666`
- `--base-color-neutral--neutral-dark: #444444`
- `--base-color-neutral--neutral-darker: #222222`
- `--base-color-neutral--neutral-darkest: #111111`
- `--base-color-neutral--white-opacity-10: #ffffff1a`
- `--base-color-neutral--white-opacity-20: #fff3`
- `--base-color-neutral--white-opacity-40: #fff6`

Estados:
- Success bg: `#cef5ca`
- Success text/dark: `#114e0b`
- Warning bg: `#fcf8d8`
- Warning dark: `#5e5515`
- Error: `#df3838`
- Focus state: `#c5cebd`
- Validation error explícito em form: `#ff4c24`

## Escala de sizing e spacing detectada

Sizing relevantes:
- `.125rem`
- `.25rem`
- `.5rem`
- `.75rem`
- `1rem`
- `1.125rem`
- `1.25rem`
- `1.5rem`
- `1.75rem`
- `2rem`
- `2.5rem`
- `3rem`
- `4rem`
- `5rem`
- `6rem`
- `8rem`
- `10rem`
- `12rem`
- `16rem`
- `18rem` no hero principal

Spacing relevantes:
- `.125rem`
- `.25rem`
- `.5rem`
- `.75rem`
- `1rem`
- `1.5rem`
- `2rem`
- `3rem`
- `4rem`
- `6rem`

Observação:
- A base pública deve seguir um sistema de 8px, mas sem perder fidelidade visual. Se necessário, manter steps intermediários como `.75rem` e `1.5rem`.

## Radius detectado

Tokens observados:
- `.125rem`
- `.25rem`
- `.5rem`
- `.75rem`
- `1rem`
- `3rem`
- `999rem`

## Motion / Easing detectado

Easings principais:
- `cubic-bezier(0.625, 0.05, 0, 1)`
- `cubic-bezier(.7, 0, .3, 1)`
- `ease`

Durações recorrentes:
- `0.3s`
- `0.5s`
- `0.6s`
- `0.75s`
- `1s`

## Componentes identificados

### Botões

`.button`
- `background-color: var(--background-color--background-dark)`
- `color: var(--text-color--text-alternate)`
- `border-radius: .25rem`
- `padding: .75rem 1.5rem`
- `font-weight: 600`

Variantes detectadas:
- `.button.is-small`
- `.button.is-large`
- `.button.is-secondary`
- `.button.is-icon`

Botão animado:
- `.btn-animate-chars`
- `.btn-animate-chars__text`
- `.btn-animate-chars__bg`

Características:
- hover com deslocamento vertical de caracteres
- background inset no hover
- raio `0.25em`
- transição com `0.6s cubic-bezier(0.625, 0.05, 0, 1)`

### Inputs / Form

Blocos identificados:
- `.form`
- `.form-group`
- `.form-field-group`
- `.form-field`
- `.form_input`
- `.form-input`
- `.form-field-icon`

Características:
- fundo transparente
- borda verde clara
- placeholder claro
- foco com texto branco e borda mais clara
- estado de erro com `#ff4c24`
- textarea com variação específica

### Cards / Panels

Não apareceu um `.card` único dominante como naming principal, mas a linguagem de surface já é clara:
- superfícies dark
- bordas suaves ou tracejadas
- cantos pequenos a médios
- possível uso de opacidades de branco para contraste

Exemplo real detectado:
- `.cookie-banner`
  - fundo preto
  - borda tracejada com branco translúcido
  - texto branco
  - `border-radius: .25rem`

## Background e atmosfera visual

Direção visual geral:
- tema tático / militar premium / tecnológico
- predominância de fundo escuro verde-oliva
- tipografia hero muito expressiva
- contraste alto entre branco e verdes dessaturados
- vermelho usado como acento operacional

Para o motion system final:
- GSAP para reveals, stagger, parallax e abertura de navegação
- Canvas/WebGL para background animado atmosférico
- Keyframes para brilho, pulse e hover loops leves
- sempre prever fallback para `prefers-reduced-motion`

## Estrutura recomendada dos entregáveis finais

### `variables.css`

Incluir:
- tokens semânticos:
  - `--color-primary-*`
  - `--color-accent-*`
  - `--color-neutral-*`
  - `--color-success-*`
  - `--color-warning-*`
  - `--color-error-*`
  - `--font-heading`
  - `--font-body`
  - `--font-label`
  - `--space-*`
  - `--radius-*`
  - `--shadow-*`
  - `--ease-*`
  - `--duration-*`
- aliases compatíveis com os nomes originais do CSS exportado

### `tailwind.config.js`

Mapear:
- `colors`
- `fontFamily`
- `fontSize`
- `spacing`
- `borderRadius`
- `boxShadow`
- `transitionTimingFunction`
- `transitionDuration`
- `keyframes`
- `animation`

## Presets de motion planejados

Presets sugeridos:
- `reveal-up`
- `reveal-mask`
- `fade-scale`
- `parallax-soft`
- `parallax-depth`
- `nav-open`
- `section-stagger`
- `glow-soft`
- `pulse-subtle`

## Próximo passo recomendado

Quando retomar, o próximo passo ideal é:
1. Gerar `variables.css` com tokens limpos e aliases.
2. Gerar `tailwind.config.js` apontando para CSS vars.
3. Documentar os 3 componentes-base:
   - button
   - input
   - card/panel
4. Definir os presets de motion no Tailwind e na camada GSAP.

## Nota final

Este arquivo resume o que já foi consolidado nesta conversa para você não perder o contexto quando os créditos acabarem.
