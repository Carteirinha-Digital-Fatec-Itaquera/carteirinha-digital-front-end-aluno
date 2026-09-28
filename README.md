# 🪪 Carteirinha Digital - Frontend (Aluno)

Frontend destinado aos alunos do projeto **Carteirinha Digital**, desenvolvido para a **FATEC Itaquera**.

A aplicação foi construída com foco em experiência responsiva, acessibilidade, performance e suporte a recursos de **PWA (Progressive Web App)**.

---

## 🚀 Acesso rápido

A aplicação pode ser acessada pelos links:

- [bit.ly/carteirinha-digital-aluno](https://bit.ly/carteirinha-digital-aluno)
- [carteirinha-digital-front-end-aluno-alpha.vercel.app](https://carteirinha-digital-front-end-aluno-alpha.vercel.app)

---

## ✨ Principais funcionalidades

### 🪪 Carteirinha Digital

- Visualização das informações do aluno.
- Exibição da carteirinha digital.
- Geração dinâmica de QR Code.
- Interface responsiva para desktop e dispositivos móveis.

### 📷 Perfil e imagem

- Exibição da foto de perfil do aluno.
- Upload e armazenamento local de imagens.
- Suporte ao uso de imagens em cache.

### 📱 PWA

- Instalação da aplicação como app no dispositivo.
- Service Worker para gerenciamento de cache.
- Suporte a funcionamento offline em determinadas funcionalidades.
- Manifesto configurado para instalação.

### 🌐 Monitoramento de conexão

A aplicação possui um **Internet Watcher** responsável por indicar visualmente o estado da conexão.

Isso permite identificar situações em que determinados dados podem estar sendo exibidos a partir do cache local.

### 📅 Eventos e Palestras

O módulo de eventos permite ao aluno:

- visualizar eventos programados e em andamento;
- consultar título, palestrante ou facilitador;
- visualizar data e horários do evento;
- consultar carga horária;
- visualizar local do evento;
- acompanhar o status do evento;
- identificar quando check-in ou check-out estão disponíveis;
- acessar o fluxo de leitura de presença;
- acompanhar suas participações.

Entre os estados apresentados pela interface estão:

- Programado;
- Em andamento;
- Check-in Aberto;
- Check-out Aberto;
- Entrada Registrada;
- Presença Confirmada;
- Encerrado;
- Cancelado.

### 🎓 Certificados

A aplicação possui estrutura para consulta dos certificados vinculados às participações do aluno.

Algumas funcionalidades relacionadas à emissão e download de certificados dependem da implementação correspondente no backend.

---

## 🛠️ Tecnologias e bibliotecas

O frontend utiliza principalmente:

- **React**
- **Vite**
- **TypeScript**
- **React Router**
- **Vite PWA Plugin**
- **QRCode.react**
- **Lucide React**
- **CSS Modules**

---

## ⚙️ Instalação e configuração local

### 1. Clonar o repositório

```bash
git clone https://github.com/Carteirinha-Digital-Fatec-Itaquera/carteirinha-digital-front-end-aluno.git

cd carteirinha-digital-front-end-aluno
```

---

### 2. Instalar as dependências

Para instalar exatamente as versões registradas no `package-lock.json`:

```bash
npm ci
```

Durante o desenvolvimento, também é possível utilizar:

```bash
npm install
```

---

### 3. Configurar as variáveis de ambiente

Copie o arquivo:

```text
.env.example
```

para:

```text
.env.local
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

No Linux/macOS:

```bash
cp .env.example .env.local
```

Exemplo de configuração:

```env
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:3000
```

---

## 🔌 Integração com API

A aplicação utiliza a API real por padrão.

```env
VITE_USE_MOCK=false
```

Quando `VITE_USE_MOCK` não estiver definido ou possuir qualquer valor diferente de `true`, os serviços utilizam a API configurada em:

```env
VITE_API_URL=http://localhost:3000
```

As requisições autenticadas utilizam o token da sessão do aluno.

Erros HTTP ou de conexão são propagados para a interface e tratados pelos componentes responsáveis.

A aplicação não substitui silenciosamente erros da API real por dados fictícios.

---

## 🧪 Desenvolvimento com mocks

Para desenvolver determinadas funcionalidades sem depender do backend, altere:

```env
VITE_USE_MOCK=true
```

Quando o valor for exatamente `true`, os serviços compatíveis utilizam as fixtures locais disponíveis em:

```text
src/mocks/
```

Atualmente existem fixtures relacionadas a:

```text
events.mock.ts
attendance.mock.ts
certificates.mock.ts
```

Os mocks são destinados exclusivamente ao desenvolvimento e testes locais.

Após alterar uma variável de ambiente, reinicie o servidor Vite.

---

## 📡 Serviços de eventos

O serviço principal do módulo está localizado em:

```text
src/services/eventService.ts
```

Entre as operações disponíveis estão:

```text
getEvents()
getEventById(id)
getMyAttendances()
getMyCertificates()
```

Os endpoints utilizados pelo módulo incluem:

```text
GET /events
GET /events/:id
GET /attendances/me
GET /certificates/me
```

A disponibilidade de cada endpoint depende da implementação correspondente no backend.

---

## 📅 Fluxo de eventos e participações

A tela principal do módulo está disponível em:

```text
/eventos
```

Ela possui áreas para:

- próximos eventos;
- eventos ao vivo;
- participações do aluno.

Os cards podem apresentar informações como:

```text
Título
Palestrante / Facilitador
Data
Horário de início
Horário de término
Carga horária
Local
Status
```

Quando um evento possui checkpoint disponível, a interface pode liberar a ação:

```text
Escanear Presença
```

que direciona para:

```text
/eventos/scanner
```

Antes da navegação, o estado atual do evento pode ser consultado novamente para evitar acesso a um checkpoint que já tenha sido encerrado.

Eventos encerrados ou cancelados não devem liberar a leitura de presença.

---

## 🎟️ Participações

A aplicação consulta as participações do aluno por meio de:

```text
GET /attendances/me
```

A interface pode apresentar estados como:

```text
Entrada Registrada
Presença Confirmada
```

A agenda de eventos e a consulta de participações possuem tratamento independente.

Dessa forma, uma falha ao carregar participações não precisa impedir a exibição da agenda disponível.

Da mesma forma, participações já registradas podem continuar sendo apresentadas mesmo quando determinados dados complementares de eventos não estiverem disponíveis.

---

## 🧭 Navegação

Entre as rotas relacionadas às funcionalidades do aluno estão:

```text
/MainMenu
/eventos
/eventos/scanner
/certificados
/certificado/:id
```

O menu principal possui acessos para funcionalidades como:

- **Eventos & Palestras**
- **Meus Certificados**

As rotas permanecem protegidas pelas regras de autenticação da aplicação.

---

## 🔐 Rotas protegidas

A ativação de mocks:

```env
VITE_USE_MOCK=true
```

não cria uma sessão de usuário e não ignora as regras de autenticação.

Sem uma sessão válida, o acesso às rotas protegidas deve direcionar para:

```text
/login
```

Quando a aplicação identificar a necessidade de alteração inicial de senha, o fluxo de primeiro acesso deve direcionar para:

```text
/first-access
```

---

## 📁 Estrutura principal

```text
src/
├── api/
│   └── Clientes e configurações de comunicação com o backend
│
├── components/
│   └── Componentes compartilhados da aplicação
│
├── domains/
│   └── Tipagens e entidades do domínio
│
├── mocks/
│   └── Fixtures utilizadas durante o desenvolvimento
│
├── routes/
│   └── Configuração das rotas da aplicação
│
├── services/
│   └── Serviços de integração com API e mocks
│
└── ui/
    ├── components/
    │   └── Componentes de interface
    │
    └── screens/
        └── Telas da aplicação
```

Os arquivos estáticos utilizados pela aplicação estão disponíveis em:

```text
public/
```

---

## 🧩 Estrutura do módulo de eventos

Entre os principais arquivos do módulo estão:

```text
src/
├── mocks/
│   ├── events.mock.ts
│   ├── attendance.mock.ts
│   └── certificates.mock.ts
│
├── services/
│   └── eventService.ts
│
└── ui/
    ├── components/
    │   ├── badge/
    │   └── eventCard/
    │
    └── screens/
        └── events/
            ├── AlunoEventosScreen.tsx
            ├── EventsPageLayout.tsx
            ├── ParticipationCard.tsx
            ├── ResourceState.tsx
            ├── EventStubs.tsx
            ├── eventPresentation.ts
            └── useEventResource.ts
```

---

## ⏳ Estados de interface

As telas relacionadas aos eventos possuem tratamento para diferentes estados de carregamento.

### Loading

Durante a consulta dos dados, a interface apresenta um estado de carregamento.

### Lista vazia

Caso nenhum evento ou participação esteja disponível, a aplicação apresenta uma mensagem apropriada em vez de uma área vazia.

### Erro

Falhas de comunicação com a API são exibidas na interface com possibilidade de nova tentativa quando aplicável.

### Cancelamento de requisições

As consultas podem utilizar `AbortSignal` para interromper requisições que deixaram de ser necessárias quando o componente correspondente é desmontado.

---

## 🧪 Testes

Os testes relacionados ao módulo de eventos estão disponíveis em:

```text
tests/
```

Para executá-los:

```bash
node --import ./tests/register.mjs --test tests/events.test.mjs
```

Os testes atualmente verificam cenários como:

- evento programado;
- evento em andamento;
- check-in aberto;
- check-out aberto;
- evento encerrado;
- evento cancelado;
- bloqueio do scanner quando necessário;
- presença do aluno;
- carga horária;
- estados de loading e erro;
- acessibilidade das mensagens;
- utilização da API HTTP;
- Bearer Token;
- `AbortSignal`;
- propagação de erros;
- utilização explícita de mocks.

---

## ✅ Build

Para gerar o build de produção:

```bash
npm run build
```

Em ambientes em que for necessário utilizar o carregador nativo de configuração do Vite:

```bash
npm run build -- --configLoader native
```

O processo executa a validação TypeScript e posteriormente gera o bundle de produção.

---

## 🔎 ESLint

Para validar os arquivos relacionados ao módulo de eventos:

```bash
npx eslint src/ui/screens/events src/ui/components/eventCard src/ui/components/badge src/routes/index.tsx src/services/eventService.ts src/mocks/events.mock.ts src/mocks/attendance.mock.ts
```

Alguns arquivos antigos do projeto podem possuir avisos ou erros de lint anteriores às funcionalidades atuais.

---

## 📱 Responsividade

A aplicação foi desenvolvida com foco em diferentes tamanhos de tela.

É recomendado validar principalmente:

```text
320px
390px
Desktop
```

A identidade visual utiliza principalmente:

```text
#BA1A1A
```

com cabeçalhos em vermelho, cards claros e fundo neutro.

---

## 🎨 Identidade visual

A interface segue a identidade visual utilizada no projeto da Carteirinha Digital da FATEC Itaquera.

Entre os principais elementos estão:

- vermelho institucional;
- cards independentes;
- fundo claro;
- ícones para facilitar a identificação das ações;
- badges para representação de estados;
- componentes adaptados para dispositivos móveis;
- navegação acessível por teclado quando aplicável.

---

## 🚧 Funcionalidades em desenvolvimento

Algumas funcionalidades possuem estrutura de navegação e interface preparada, mas dependem de implementações futuras ou integração completa com o backend.

Entre elas podem estar:

- acesso real à câmera;
- leitura definitiva de QR Code;
- registro definitivo de presença;
- emissão real de certificados;
- geração de PDF;
- download de certificados.

Essas funcionalidades são desenvolvidas conforme as respectivas etapas do projeto.

---

## 🤝 Desenvolvimento

Ao contribuir com o projeto:

1. crie uma branch específica para a funcionalidade;
2. implemente somente o escopo relacionado à tarefa;
3. execute os testes disponíveis;
4. valide o build;
5. execute o ESLint nos arquivos modificados;
6. realize testes manuais;
7. abra um Pull Request para revisão.

Exemplo:

```bash
git checkout -b feature/nome-da-feature
```

Antes de enviar:

```bash
git status
git diff --stat
```

---

## 👥 Autores

### Orientador

- **Jonatas Santos de Souza** — Mobile / Desenvolvimento de Sistemas Multiplataforma — FATEC Itaquera

### Estudantes

Projeto desenvolvido por estudantes da **FATEC Itaquera**.

---

## 📄 Sobre o projeto

A **Carteirinha Digital** busca modernizar a experiência dos alunos da FATEC Itaquera, centralizando funcionalidades acadêmicas e institucionais em uma aplicação acessível tanto pelo navegador quanto como PWA.

O frontend do aluno continua em evolução conforme novas funcionalidades e integrações com o backend são disponibilizadas.