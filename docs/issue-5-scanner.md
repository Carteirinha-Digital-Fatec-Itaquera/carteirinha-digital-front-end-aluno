# Issue #5 — Scanner de presença

Branch: `feature/student-qr-camera-scanner`.

Base desta entrega: ZIP da branch `feature/student-events-list-participations` enviado pelo Arthur. O patch contém somente a implementação da #5 sobre essa base. Se as issues #3/#4 ainda não estiverem na main, integre-as antes ou crie a branch a partir da mesma base do ZIP.

## Implementação

- Rota protegida `/eventos/scanner`, usando o layout vermelho/cinza e os cards da área de eventos.
- `html5-qrcode` carregado ao abrir a câmera, somente QR, preferência traseira, 15 leituras/s, mira e linha animada com respeito a redução de movimento.
- Abertura por ação explícita do aluno; avisos para permissão negada, câmera ausente/ocupada e contexto sem HTTPS. Desligamento ao sair, ocultar a aba, enviar leitura ou usar entrada manual; liberação também quando a permissão chega depois da desmontagem.
- Bloqueio síncrono de leituras repetidas até nova tentativa. Vibração opcional.
- `POST /attendances/scan` com `{ qrToken }` e Bearer do aluno. Timeout de 12 segundos e cancelamento ao sair. Nunca usa fixtures, mesmo com `VITE_USE_MOCK=true`.
- Validação local apenas da estrutura esperada de JWT de presença; o servidor decide assinatura, validade, versão, identidade e checkpoint. Não há segredo no frontend.
- Feedback de entrada/saída, duplicidade informativa, QR inválido/expirado/checkpoint fechado, saída sem entrada, autorização e erro de rede. Uma falha de rede pode ocorrer após o registro: interface orienta consultar participações.
- Consulta real de `/attendances/me` após saída/duplicidade para complementar horários. Falha dessa consulta não apaga o resultado do scan. Timestamp da resposta de duplicidade não é tratado como hora da presença original.
- Entrada manual disponível em desenvolvimento ou dispositivo com mouse/hover. Envia à API real; não fabrica sucesso.

## Backend recebido e pendências

O ZIP recebido contém a geração real do QR, mas não o controller/service da issue #26. O contrato V1 define os códigos de duplicidade `ALREADY_CHECKED_IN`/`ALREADY_CHECKED_OUT`, porém ainda não fixa o código de saída sem entrada. O adaptador reconhece `NO_CHECK_IN`, `CHECK_IN_REQUIRED`, `CHECK_IN_NOT_FOUND` e texto NestJS equivalente; confirmar o código definitivo com Dev A ao integrar #26.

A resposta de scan V1 não inclui ambos os horários nem garante emissão de certificado. A interface complementa os horários pelo endpoint de participações e permite consultar certificados sem prometer emissão. A rota de certificados permanece com a implementação recebida (stub; issue #6/#27).

## Executar

```sh
npm ci
npm run dev
npm run build
npm run test:scanner
npm run test:events
```

Configure `VITE_API_URL` para a API e `VITE_USE_MOCK=false` para a integração final. Para celular use HTTPS com certificado confiável; HTTP em IP de rede não habilita câmera. Não comite credenciais ou tokens.

Teste automatizado de navegador (Chrome instalado; Vite em outra janela):

```sh
npm run dev
npm run test:scanner:browser
```

`BROWSER_CHANNEL=msedge` seleciona Edge; `TEST_URL` altera a URL inicial. O teste intercepta câmera e API somente no navegador de testes: valida estados, layout, bloqueio de envios e liberação tardia. Não comprova leitura física ou integração real.

## Validação física a executar após #26

1. Android/Chrome e iOS/Safari/PWA: permitir, negar e reabilitar câmera; conferir câmera traseira, retorno à tela e câmera desligada ao sair/ocultar.
2. QR real recém-gerado pela Secretaria: entrada e saída, horários retornados pelo backend, múltiplas leituras consecutivas e duplicidade idempotente.
3. Token vencido, checkpoint fechado/reaberto (versão anterior), QR da carteirinha e QR externo.
4. Saída sem entrada, sessão expirada, conta excluída/RA reutilizado, API indisponível e rede interrompida após envio.
5. Medir tempo de leitura com QR projetado, iluminação e distância reais. Meta inferior a 1 segundo ainda não aferida.

## Aplicação do patch

Com o repositório na mesma base do ZIP e sem alterações conflitantes:

```sh
git switch -c feature/student-qr-camera-scanner
git apply --check caminho/issue-5-scanner.patch
git apply caminho/issue-5-scanner.patch
npm ci
npm run build
npm run test:scanner
npm run test:events
```

O ZIP completo é alternativa ao patch; não é necessário aplicar ambos. Nenhum backend foi alterado e nenhum PR remoto foi aberto nesta entrega.

## Resultados desta entrega

- TypeScript: passou (`tsc -b`).
- Produção/PWA: passou com `npm run build -- --configLoader native`. O comando padrão esbarrou na restrição de leitura de diretórios do ambiente; o carregador nativo permitiu validar o mesmo projeto sem mudar a configuração entregue.
- `npm run test:scanner`: 6 testes passaram.
- `npm run test:events`: 12 testes passaram.
- ESLint dos arquivos de scanner, API de scan e layout compartilhado: passou. Lint global não foi usado como evidência desta entrega.
- Chrome automatizado contra a versão compilada: entrada, saída com horários, duas duplicidades, expiração, saída sem entrada, erro HTTP, Bearer/body, três detecções concorrentes gerando um único POST, permissão negada e liberação após permissão tardia passaram. Sem erros JavaScript observados. Layout revisado a 390 px e 1280 px; sem transbordamento horizontal.
- Teste de navegador usa câmera e respostas controladas. Leitura física, latência inferior a 1 segundo, Safari/iOS, Android real e integração com a #26 permanecem pendentes.

Para repetir o teste contra `vite preview`, além de `TEST_URL`, informe `SCANNER_MODULE_GLOB` com o caminho do chunk que exporta `Html5Qrcode` em `dist/assets`. No servidor de desenvolvimento o padrão já intercepta `html5-qrcode`.
