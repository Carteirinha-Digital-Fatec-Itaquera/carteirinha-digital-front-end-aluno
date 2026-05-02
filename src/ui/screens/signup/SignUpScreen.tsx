// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ArrowLeft } from 'lucide-react';

// import logoFatec from "../../../assets/images/fatec_itaquera_logo.png";
// import { ErrorModalComp } from '../../components/ErrorModal/ErrorModalComp';
// import { InternetWatcher } from '../../components/internetwatcher/InternetWatcher';

// import type { ErrorField } from '../../../utils/Types';
// import { FirstAccess } from '../../../domains/FirstAccess';

// import { sendCpf } from '../../../api/firstaccess/sendCpf';
// import { sendCode } from '../../../api/firstaccess/sendCode';
// import { sendPassword } from '../../../api/firstaccess/sendPassword';

// import styles from './style.module.css';

// type Step = 1 | 2 | 3 | 4;

// export default function SignUpScreen() {
//   const navigate = useNavigate();

//   const [step, setStep] = useState<Step>(1);

//   const [cpf, setCpf] = useState("");
//   const [email, setEmail] = useState("");
//   const [code, setCode] = useState("");
//   const [password, setPassword] = useState("");
//   const [repeatPassword, setRepeatPassword] = useState("");

//   const [message, setMessage] = useState("");
//   const [errorFields, setErrorFields] = useState<ErrorField[]>([]);
//   const [modalErrorVisible, setModalErrorVisible] = useState(false);
//   const [onLoading, setOnLoading] = useState(false);

//   function showError(message: string, fields?: ErrorField[] | null) {
//     setMessage(message);
//     setErrorFields(fields ?? []);
//     setModalErrorVisible(true);
//   }

//   return (
//     <div className={styles.container}>
//       <div className={styles.appWrapper}>
//         <InternetWatcher />
        
//         <ErrorModalComp
//           visible={modalErrorVisible}
//           error={message}
//           fields={errorFields.map((val) => val.description)}
//           onClose={() => {
//             setMessage("");
//             setErrorFields([]);
//             setModalErrorVisible(false);
//           }}
//         />

//         {/* Cabeçalho Vermelho */}
//         <div className={styles.redHeader}>
//           <img src={logoFatec} className={styles.logo} alt="Logo Fatec" />
//         </div>

//         {/* Conteúdo Branco */}
//         <div className={styles.subcontainer}>
          
//           <h1 className={styles.mainTitle}>Primeiro Acesso</h1>

//           {/* PASSO 1: CPF */}
//           {step === 1 && (
//             <div className={styles.stepContainer}>
//               <p className={styles.infoText}>Digite seu CPF para iniciarmos o cadastro.</p>
              
//               <div className={styles.inputGroup}>
//                 <label>CPF</label>
//                 <input 
//                   type="text" 
//                   placeholder="Ex: 000.000.000-00" 
//                   value={cpf} 
//                   onChange={(e) => setCpf(e.target.value)}
//                   className={styles.input}
//                 />
//               </div>

//               <button 
//                 className={styles.primaryButton} 
//                 disabled={onLoading}
//                 onClick={async () => {
//                   setOnLoading(true);
//                   const result = await sendCpf(new FirstAccess({ cpf, code: null, password: null }));
//                   if ('email' in result && result.email !== "") {
//                     setEmail(result.email);
//                     setStep(2);
//                   } else {
//                     showError(result.message, result.errorFields);
//                   }
//                   setOnLoading(false);
//                 }}
//               >
//                 {onLoading ? "Carregando..." : "Enviar CPF"}
//               </button>

//               <button className={styles.linkButton} onClick={() => navigate("/login")}>
//                 Este não é seu primeiro acesso? Clique aqui
//               </button>
//             </div>
//           )}

//           {/* PASSO 2: E-MAIL */}
//           {step === 2 && (
//             <div className={styles.stepContainer}>
//               <button className={styles.backButton} onClick={() => setStep(1)}>
//                 <ArrowLeft size={20} /> Voltar
//               </button>
              
//               <p className={styles.infoText}>
//                 Enviamos um código no seu e-mail institucional para definição da senha!
//               </p>
              
//               <div className={styles.emailBox}>
//                 <strong>E-mail:</strong>
//                 <span>{email}</span>
//               </div>

//               <button 
//                 className={styles.primaryButton} 
//                 disabled={onLoading}
//                 onClick={() => setStep(3)}
//               >
//                 Prosseguir
//               </button>
//             </div>
//           )}

//           {/* PASSO 3: CÓDIGO */}
//           {step === 3 && (
//             <div className={styles.stepContainer}>
//               <button className={styles.backButton} onClick={() => setStep(2)}>
//                 <ArrowLeft size={20} /> Voltar
//               </button>

//               <p className={styles.infoText}>
//                 Insira o código de segurança que enviamos no seu e-mail institucional.
//               </p>

//               <div className={styles.inputGroup}>
//                 <label>Código</label>
//                 <input 
//                   type="text" 
//                   placeholder="Digite o código" 
//                   value={code} 
//                   onChange={(e) => setCode(e.target.value)}
//                   className={styles.input}
//                 />
//               </div>

//               <button 
//                 className={styles.primaryButton} 
//                 disabled={onLoading}
//                 onClick={async () => {
//                   setOnLoading(true);
//                   const result = await sendCode(new FirstAccess({ cpf, code, password: null }));
//                   if ('ok' in result) {
//                     setStep(4);
//                   } else {
//                     showError(result.message, result.errorFields);
//                   }
//                   setOnLoading(false);
//                 }}
//               >
//                 {onLoading ? "Verificando..." : "Validar Código"}
//               </button>
//             </div>
//           )}

//           {/* PASSO 4: SENHA */}
//           {step === 4 && (
//             <div className={styles.stepContainer}>
//               <button className={styles.backButton} onClick={() => setStep(3)}>
//                 <ArrowLeft size={20} /> Voltar
//               </button>

//               <p className={styles.successText}>Código validado com sucesso! Defina sua senha.</p>

//               <div className={styles.inputGroup}>
//                 <label>Nova Senha</label>
//                 <input 
//                   type="password" 
//                   placeholder="Ex: ********" 
//                   value={password} 
//                   onChange={(e) => setPassword(e.target.value)}
//                   className={styles.input}
//                 />
//               </div>

//               <div className={styles.inputGroup}>
//                 <label>Repita a Senha</label>
//                 <input 
//                   type="password" 
//                   placeholder="Ex: ********" 
//                   value={repeatPassword} 
//                   onChange={(e) => setRepeatPassword(e.target.value)}
//                   className={styles.input}
//                 />
//               </div>

//               <button 
//                 className={styles.primaryButton} 
//                 disabled={onLoading}
//                 onClick={async () => {
//                   setOnLoading(true);
//                   if (password !== repeatPassword) {
//                     showError("As senhas não são iguais.");
//                     setOnLoading(false);
//                     return;
//                   }
//                   const result = await sendPassword(new FirstAccess({ cpf, code, password }));
//                   if ('ok' in result) {
//                     navigate("/login");
//                   } else {
//                     showError(result.message, result.errorFields);
//                   }
//                   setOnLoading(false);
//                 }}
//               >
//                 {onLoading ? "Salvando..." : "Definir Senha"}
//               </button>
//             </div>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// }