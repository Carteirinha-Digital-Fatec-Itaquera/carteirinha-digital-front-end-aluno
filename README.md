# 🪪 Carteirinha Digital - Frontend (Aluno)

Frontend destinado aos alunos do projeto **Carteirinha Digital**, desenvolvido para a **FATEC Itaquera**.

A aplicação foi construída com foco em performance, acessibilidade, experiência responsiva e funcionamento offline por meio de recursos de PWA.

---

## 🚀 Acesso rápido

A aplicação pode ser acessada pelos links:

- [bit.ly/carteirinha-digital-aluno](https://bit.ly/carteirinha-digital-aluno)
- [carteirinha-digital-front-end-aluno-alpha.vercel.app](https://carteirinha-digital-front-end-aluno-alpha.vercel.app)

---

## ✨ Principais funcionalidades

- **PWA (Progressive Web App)**
  - Permite a instalação da aplicação como app no dispositivo.
  - Utiliza Service Workers para cache e funcionamento offline.

- **Cache de imagens**
  - Fotos de perfil podem ser convertidas para Base64 e armazenadas localmente.
  - Permite a exibição de informações mesmo sem conexão.

- **QR Code responsivo**
  - Geração dinâmica de QR Code para validação da carteirinha.
  - Layout adaptado para diferentes tamanhos de tela.

- **Design responsivo**
  - Desktop com conteúdo centralizado e distribuição equilibrada.
  - Mobile seguindo a identidade visual da FATEC, utilizando principalmente a cor `#BA1A1A`.

- **Internet Watcher**
  - Indica visualmente o estado de conexão da aplicação.
  - Permite identificar quando os dados exibidos são provenientes do cache local.

- **Eventos e certificados**
  - Navegação para eventos e palestras disponíveis.
  - Consulta de certificados vinculados às participações do aluno.
  - Suporte a mocks para desenvolvimento independente do backend.

---

## 🛠️ Tecnologias e bibliotecas

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

### 2. Instalar as dependências

Para reproduzir exatamente as versões registradas no `package-lock.json`:

```bash
npm ci
```

Também é possível utilizar:

```bash
npm install
```

durante o desenvolvimento quando houver necessidade de atualização das dependências.

### 3. Configurar as variáveis de ambiente

Copie o arquivo `.env.example` para `.env.local`.

No Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Linux/macOS:

```bash
cp .env.example .env.local
```

Exemplo:

```env
VITE_USE_MOCK=true
VITE_API_URL=http://localhost:3000
```

### 4. Executar em desenvolvimento

```bash
npm run dev
```

### 5. Gerar o build de produção

```bash
npm run build
```

Para visualizar o build localmente:

```bash
npm run preview
```

---

## 📁 Estrutura principal

```text
src/
├── api/
│   └── Funções e clientes utilizados na comunicação com o backend
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
│   └── Serviços responsáveis pela comunicação com mocks ou API
│
└── ui/
    └── Telas e componentes de interface
```

Os assets estáticos da aplicação estão disponíveis em:

```text
public/
```

---

# 📅 Eventos do aluno — Issue #3

A Issue #3 adiciona a base necessária para o desenvolvimento das funcionalidades de **Eventos & Palestras** e **Meus Certificados** sem depender da conclusão prévia dos endpoints do backend.

## Objetivo

A implementação contempla:

- tipos TypeScript de `Event`, `Attendance` e `Certificate`;
- fixtures locais para desenvolvimento;
- serviço com alternância transparente entre mocks e API;
- novos acessos no menu principal;
- rotas protegidas para eventos, scanner e certificados.

---

## Tipos adicionados

Foram adicionadas as entidades:

```text
src/domains/Event.ts
src/domains/Attendance.ts
src/domains/Certificate.ts
```

Os tipos foram baseados no **Contrato V1** disponibilizado pelo backend.

---

## Mocks e fixtures

As fixtures estão localizadas em:

```text
src/mocks/
```

Incluindo:

```text
events.mock.ts
attendance.mock.ts
certificates.mock.ts
```

Os dados simulados foram baseados nos contratos e exemplos fornecidos pelo backend.

As fixtures podem representar fases diferentes de um mesmo evento e não devem necessariamente ser consideradas como um único estado simultâneo.

---

## Feature flag

O comportamento do serviço é controlado por:

```env
VITE_USE_MOCK=true
```

Quando o valor é exatamente `true`, a aplicação utiliza as fixtures locais e não realiza requisições HTTP.

Qualquer outro valor faz com que a aplicação utilize a API definida em:

```env
VITE_API_URL=http://localhost:3000
```

Após alterar as variáveis de ambiente, reinicie o Vite.

A configuração também é considerada durante o processo de build.

---

## Event Service

O arquivo:

```text
src/services/eventService.ts
```

expõe os seguintes métodos:

```text
getEvents()
getMyAttendances()
getMyCertificates()
```

No modo mock:

- nenhuma chamada HTTP é realizada;
- os métodos retornam cópias independentes das fixtures.

No modo HTTP:

- o serviço utiliza a API real;
- o Bearer Token da sessão é enviado nas requisições;
- falhas são propagadas como Promise rejeitada e tratadas pela interface.

Endpoints utilizados:

```text
GET /events
GET /attendances/me
GET /certificates/me
```

---

## Navegação adicionada

O `MainMenuScreen` possui os novos cards:

- **Eventos & Palestras**
- **Meus Certificados**

Rotas registradas:

```text
/eventos
/eventos/scanner
/certificados
/certificado/:id
```

As rotas permanecem protegidas pelas regras de autenticação já existentes na aplicação.

A feature flag de mocks **não cria sessão e não ignora a autenticação**.

---

## Teste local sem backend

Para testar os mocks sem realizar login real, é possível criar temporariamente um perfil fictício pelo console do navegador:

```javascript
localStorage.setItem(
  '@Carteirinha:profile',
  JSON.stringify({
    name: 'Aluno Exemplo',
  })
);

localStorage.removeItem('mustChangePassword');
```

Depois, recarregue:

```text
/MainMenu
```

Ao finalizar o teste, remova os dados temporários:

```javascript
localStorage.removeItem('@Carteirinha:profile');
localStorage.removeItem('mustChangePassword');
```

Esse procedimento é destinado exclusivamente ao desenvolvimento local.

---

## Validação manual da Issue #3

Com:

```env
VITE_USE_MOCK=true
```

valide o seguinte fluxo:

1. Acesse o menu principal.
2. Abra **Eventos & Palestras**.
3. Verifique o carregamento dos eventos.
4. Verifique o total de participações registradas.
5. Acesse **Registrar presença**.
6. Retorne ao menu principal.
7. Abra **Meus Certificados**.
8. Abra o detalhe de um certificado.
9. Retorne ao menu.

Sem token e sem perfil local, as rotas protegidas devem redirecionar para:

```text
/login
```

Quando:

```text
mustChangePassword=true
```

a aplicação deve seguir a regra de primeiro acesso e redirecionar para:

```text
/first-access
```

---

## Estado atual das telas

As telas adicionadas nesta etapa funcionam como **stubs de navegação e validação dos serviços**.

Foi aplicada uma interface consistente com a identidade visual atual do sistema, porém permanecem fora do escopo desta issue:

- acesso real à câmera;
- leitura de QR Code;
- registro definitivo de presença;
- emissão real de certificados;
- geração de PDF;
- download de certificado.

Essas funcionalidades serão desenvolvidas nas issues específicas.

---

## ✅ Validação técnica

### Build

Execute:

```bash
npm run build
```

Ou, quando necessário no ambiente local:

```bash
npm run build -- --configLoader native
```

O build deve finalizar sem erros do TypeScript (`tsc -b`).

### ESLint dos arquivos da Issue #3

```bash
npx eslint src/domains/Attendance.ts src/domains/Certificate.ts src/domains/Event.ts src/services/eventService.ts src/ui/screens/events src/routes/index.tsx src/ui/screens/mainmenu/MainMenuScreen.tsx src/vite-env.d.ts
```

Os arquivos relacionados à implementação devem passar sem erros.

> O lint global do projeto pode apresentar avisos ou erros preexistentes em arquivos fora do escopo desta issue.

---

## 👥 Autores

**Orientador**

- Jonatas Santos de Souza — Mobile / Desenvolvimento de Sistemas Multiplataforma — FATEC Itaquera

**Estudantes**

- Arthur dos Anjos — Desenvolvimento de Sistemas Multiplataforma — FATEC Itaquera
