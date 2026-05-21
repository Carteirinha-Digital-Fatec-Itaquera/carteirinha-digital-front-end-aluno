import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Importado para pegar o token da URL
import styles from './style.module.css';

import Badge from "../../components/validacaoqrcode/Badge";
import CardInfoInstituicao from "../../components/validacaoqrcode/cardinstituicaoinfo/CardInstituicao";
import CardMatriculaInfo from "../../components/validacaoqrcode/cardmatriculainfo/CardMatricula";

import { Student } from "../../../domains/Student"; 
import perfilDefault from "../../../assets/images/perfil_default.png";
import logoGoverno from "../../../assets/images/logos_cps_governo_com_slogan.png";
import { GLOBAL_VAR } from "../../../api/config/globalVar";

import { formatDateBR } from "../../../utils/dateProcessing";
const logoFatec = '/fatec_itaquera_logo.png'


export default function TelaQrcode() {
  const { qrcodeToken } = useParams(); 
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!qrcodeToken) {
        setError("QR Code inválido.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${GLOBAL_VAR.BASE_URL}/estudantes/verificar/${qrcodeToken}`);
        
        if (response.ok) {
          const result = await response.json();
          console.log(result)
          setStudent(new Student(result)); 
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Perfil não encontrado.");
        }
      } catch (err) {
        setError("Erro ao conectar com o servidor.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [qrcodeToken]);

  if (loading) return <div className={styles.loading}>Validando carteirinha...</div>;
  
  if (error || !student) {
    return (
      <div className={styles.loading}>
        <p>{error || "Perfil não encontrado."}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.redHeader}>
        <div className={styles.headerContent}>
          <img src={logoFatec} alt="Logo Fatec" style={{width: 100}}/>
        </div>
      </header>

      <main className={styles.mainContent}>
        <section className={styles.card}>
          <h3 className={styles.cardHeaderTitle}>Aluno</h3>
          <div className={styles.studentInfoSection}>
            <img 
              src={
                student?.photo && student?.photoStatus === 'APPROVED' 
                  // ? `${GLOBAL_VAR.BASE_URL}${student.photo}` 
                  ?`${student.photo}`
                  : perfilDefault
              } 
              className={styles.avatar} 
              alt="Perfil" 
              onError={(e) => {
                e.currentTarget.src = perfilDefault; 
              }}
            />
            <div className={styles.studentDetails}>
              <h2 className={styles.studentName}>{student.name}</h2>
              <p className={styles.studentCourse}>{student.course}</p>
              <p className={styles.studentRa}>RA: {student.ra}</p>
            </div>
          </div>
          <div className={styles.badgeWrapper}>
            {/* O Badge exibe o status (Ativo/Inativo) e a validade */}
            <Badge status={student.status} validade={new Date(student.dueDate)} />
          </div>
        </section>

        <CardMatriculaInfo 
          // period={student.period}
          admission={formatDateBR(student.admission)}
          dueDate={formatDateBR(student.dueDate)}
          status={student.status}
        />

        <CardInfoInstituicao />

        <p className={styles.timestamp}>
          Verificado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </main>

      <footer className={styles.redFooter}>
        <img src={logoGoverno} className={styles.govLogo} alt="Governo SP" />
      </footer>
    </div>
  );
}
