# Issue #6 — Certificados do aluno

Branch: `feature/student-certificates-viewer`

Título sugerido do PR: `feat(aluno): telas de certificados e visualizador com qr`

## Base e aplicação

A entrega parte de `carteirinha-digital-front-end-aluno-main (3).zip`, enviado nesta conversa. Preserva o scanner da #5 e o lockfile atualizado. O backend #26 não foi alterado.

O ZIP contém o frontend completo. O patch contém apenas as alterações da #6 sobre essa base. Escolha uma das duas formas de aplicação; não é necessário reaplicar a #5.

Na raiz do repositório atualizado, com as alterações locais preservadas:

```sh
git switch -c feature/student-certificates-viewer
git apply --check /caminho/issue-6-certificados.patch
git apply /caminho/issue-6-certificados.patch
npm ci
npm run build
```

Não inclui node_modules, dist, arquivos locais do Expo ou segredos. Nenhum PR remoto foi aberto por esta entrega.

## Comportamento

- `/certificados`: lista autenticada, ordenada por emissão, com data, carga horária, código, carregamento, vazio, erro e atualização.
- `/certificado/:id`: documento baseado no snapshot emitido, moldura inspirada no protótipo e identidade da área de eventos. Não reconstrói nome/evento a partir do perfil atual.
- QR e link apontam para `/certificado/verificar/:code`, página pública incluída nesta entrega. Ela consulta a API sem transmitir o JWT do aluno; nunca presume autenticidade localmente.
- Download busca o blob PDF autenticado da API, valida MIME e assinatura `%PDF-`, impede cliques simultâneos e oferece link para abrir/salvar quando o navegador não baixa automaticamente. Certificado revogado não permite download.
- Erros HTTP não ativam mocks automaticamente. Não há geração de PDF no frontend.

## Configuração

Configure `VITE_API_URL` com a URL base do backend, sem barra final, e `VITE_USE_MOCK=false` para integração.

`VITE_PUBLIC_APP_URL` é opcional: origem pública HTTPS do frontend do aluno (por exemplo, `https://aluno.exemplo.edu.br`). Sem ela, o QR usa a origem do navegador. A hospedagem deve servir o SPA ao abrir diretamente `/certificado/verificar/:code`. Não use localhost para um QR que será lido em outro aparelho. Variáveis VITE são aplicadas no build.

Com `VITE_USE_MOCK=true`, lista e documento usam as fixtures do Contrato V1 e exibem a indicação de demonstração. O PDF fica desabilitado. A consulta de autenticidade continua dependente da API real e não confirma fixtures como certificados oficiais.

## Contrato e dependência da #27

O backend atualizado `carteirinha-digital-backend-main (3).zip` contém Attendance (#26), mas ainda não contém o módulo Certificate. A implementação foi também comparada com `conteudo-back-end-issue-27.txt`: os quatro endpoints, snapshot, campos da verificação pública, resposta 404 e download application/pdf estão alinhados. A descrição abrevia a lista como Certificate[]; os campos concretos seguem CertificateListItem do Contrato V1. A integração HTTP está implementada no frontend segundo `src/contracts/v1-events.types.ts`; o fluxo real permanece pendente da #27:

- `GET /certificates/me`: array de CertificateListItem;
- `GET /certificates/:id`: CertificateView com payloadSnapshot;
- `GET /certificates/:id/pdf`: application/pdf;
- `GET /certificates/verify/:code`: CertificateVerificationResponse público.

A API deve validar conta ativa/accountId e titularidade nos endpoints privados, responder adequadamente a certificado inexistente ou revogado e limitar dados na verificação pública. O frontend não substitui essas verificações. O PDF da #27 deve usar a mesma URL pública de autenticidade usada na tela.

## Validação reproduzível

```sh
npm run test:events
npm run test:scanner
npm run test:certificates
npm run build
npm run preview -- --port 5173
# em outro terminal, com Google Chrome instalado:
npm run test:certificates:browser
```

O teste de navegador utiliza respostas HTTP controladas do Contrato V1; verifica lista, vazio, erros, revogação, rota pública sem login, ausência de JWT público, download byte a byte e decodifica o QR renderizado com a biblioteca real html5-qrcode. O conteúdo PDF do teste é uma fixture mínima para testar transporte, não um certificado oficial. `TEST_ORIGIN`, `BROWSER_CHANNEL` e `SCREENSHOT_DIR` permitem configurar os testes.

No ambiente isolado desta entrega foi usado `npm run build -- --configLoader native` e o mesmo argumento no preview por restrição de acesso ao diretório ancestral do esbuild. Não foi necessário alterar a configuração do projeto.

Pendências para aceite final: executar os quatro endpoints reais da #27, conferir titularidade e revogação, comparar o PDF oficial com seu QR e validar leitura/download em dispositivos físicos Android e iOS/Safari/PWA. Testes automatizados com API controlada não comprovam essas etapas.

## Resultado desta entrega

Instalação com npm ci sobre o lockfile atualizado concluída. Build de produção e lint dos arquivos novos/alterados de certificados passaram. Passaram 28 testes unitários de eventos, scanner e certificados (10 específicos de certificados), além do fluxo de navegador descrito acima. As telas foram inspecionadas em capturas mobile e desktop. O patch foi aplicado e comparado com os arquivos finais em uma extração limpa da base fornecida.
