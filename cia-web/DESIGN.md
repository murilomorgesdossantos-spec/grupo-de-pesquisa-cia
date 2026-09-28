# CIA — sistema de design

Direção: laboratório digital editorial. A identidade conecta pesquisa científica, ensino e aplicação, com clareza, espaço e diagramas originais.

## Base
- Fundo: #f6f7f5. Superfície: #edf0ec. Texto: #122128. Acento: #06766e.
- Os temas escuro e magenta usam os mesmos tokens sem alterar as funcionalidades.
- Títulos em Montserrat; corpo em fontes nativas; informações de laboratório em monospace.
- Grade de até 1280 px, margens responsivas e linhas finas. Evitar sombras pesadas e indicadores inventados.

## Interação
- Canvas original com 420 pontos: toro para Controle, hélice para Instrumentação e esfera para IA. É explicitamente uma visualização conceitual, sem métricas simuladas como reais.
- Animação suspensa fora da tela, com aba do navegador oculta ou botão de pausa acionado. Densidade de pixels limitada a 2.
- Movimento do ponteiro apenas em dispositivos adequados; respeitar prefers-reduced-motion.
- Entradas via Web Animations API e IntersectionObserver; conteúdo continua legível sem o efeito.
- Abas utilizáveis com setas/Home/End, foco visível, labels em formulários e link para pular navegação.
- Busca de projetos ignora acentos; filtros são obtidos das áreas efetivamente cadastradas no Firebase.

## Referências estudadas
- Watermelon: https://ui.watermelon.sh/ — composição modular; catálogo público em https://ui.watermelon.sh/llms.txt.
- Refero: https://styles.refero.design/ — hierarquia editorial, tipografia e tokens. Referência Intercom: https://styles.refero.design/style/12255b63-e506-4bc1-a4cd-d05487de32f3.
- GetLayers: https://www.getlayers.ai/templates — profundidade e ritmo de composição. Implementação original, sem reprodução de templates pagos.
- Spell UI: https://spell.sh/ — microinterações e entradas de texto; https://spell.sh/docs/slide-up-text e https://spell.sh/docs/tilt-card.

## Preservação
Manter as rotas, o conteúdo institucional e as integrações existentes: projetos dinâmicos, editor de conteúdo, fórum, comentários, autenticação por email/Google, cadastro, perfil/Lattes, administração e área restrita. Nenhum conteúdo fictício substitui os registros do Firebase. A reformulação local não publica alterações em produção.
