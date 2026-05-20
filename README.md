# 🪪 Carteirinha Digital - Frontend (Aluno)

Repositório do **Frontend para Alunos** do projeto Carteirinha Digital, desenvolvido para a **FATEC Itaquera**. A aplicação foi construída com foco em performance, acessibilidade e funcionamento offline (PWA).

## 🚀 Acesso Rápido
A aplicação pode ser acessada diretamente através do link encurtado:
> **[bit.ly/carteirinha-digital-aluno](https://bit.ly/carteirinha-digital-aluno)** 
ou pelo link:
> ** (https://carteirinha-digital-front-end-aluno-alpha.vercel.app) **

---

## ✨ Principais Funcionalidades

- **Funcionamento PWA (Progressive Web App):** - Permite a instalação como aplicativo no celular.
  - Carregamento instantâneo via Service Workers.
- **Cache de Imagens Inteligente:** - Fotos de perfil são convertidas para Base64 e armazenadas localmente para visualização sem internet.
- **QR Code Responsivo:** - Geração dinâmica de código de validação que ocupa 100% do bloco lateral, garantindo leitura fácil.
- **Design Adaptativo:** - **Desktop:** Visualização em card centralizado com sombreamento e layout equilibrado.
  - **Mobile:** Interface limpa seguindo o padrão de cores `#BA1A1A` e fundo cinza claro.
- **Internet Watcher:** - Alerta visual instantâneo para o aluno saber se os dados exibidos são os do cache ou se estão sincronizados em tempo real.

---

## 🛠️ Tecnologias e Bibliotecas

- **React + Vite** (Ambiente de desenvolvimento ultra rápido)
- **TypeScript** (Tipagem rigorosa para evitar erros em produção)
- **Vite PWA Plugin** (Configuração do Manifest e estratégia de cache)
- **QRCode.react** (Renderização de QR Codes em formato SVG responsivo)
- **Lucide-React** (Ícones modernos e leves)
- **CSS Modules** (Escopo de estilos por componente)

---

## ⚙️ Instalação e Configuração Local

Para rodar este projeto localmente, siga os passos abaixo:

1. **Clonar o repositório:**
   ```bash
   git clone [https://github.com/Carteirinha-Digital-Fatec-Itaquera/carteirinha-digital-front-end-aluno.git](https://github.com/Carteirinha-Digital-Fatec-Itaquera/carteirinha-digital-front-end-aluno.git)
   cd carteirinha-digital-front-end-aluno-openSource

2. **Instalar as dependências:**
  ```bash
  npm install

3. **Configurar variáveis de ambiente:**
  Crie um arquivo .env na raiz e aponte para a URL do seu backend Dockerizado:
  VITE_API_URL=http://localhost:3000



4. **Executar em modo de desenvolvimento:**
  ```Bash
  npm run dev


5. **Gerar build de produção (para testar PWA):**
  ```Bash
  npm run build
  npm run preview



**Estrutura de Pastas**
- src/screens/DigitalStudentCard/: Tela principal com a lógica de QR Code e Foto.

- src/components/: Componentes globais como o InternetWatcher e Modais de erro.

- public/: Assets estáticos (Logo FATEC Vermelha, Logo CPS e Perfil Default).

- src/api/: Funções de fetch para comunicação com o backend NestJS.

Autores: 
- Orientador Docente Jonatas Santos de Souza de **Mobile** - **Desenvolvimento de Sistemas Multiplataforma** - **FATEC Itaquera.**

- Jhon Deyvid Quispe Mamani Estudante de **Desenvolvimento de Sistemas Multiplataforma** - **FATEC Itaquera.**
- Lucas Garcia de **Desenvolvimento de Sistemas Multiplataforma** - **FATEC Itaquera.**
- Manuella Oliveira de **Desenvolvimento de Sistemas Multiplataforma** - **FATEC Itaquera.**
- Maria cecilia Prado de **Desenvolvimento de Sistemas Multiplataforma** - **FATEC Itaquera.**
