import { Navigate, Link } from 'react-router-dom';
import useStudentProfile from '../../../hooks/useStudentProfile';
import { studentProfileResource } from '../../../api/student/profileResource';
import PageLayout from '../../components/page/PageLayout';
import StudentPhoto from '../../components/studentPhoto/StudentPhoto';
import styles from './style.module.css';
const text = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value : 'Não informado';
const calendarDate = (value: unknown) =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)
    ? value.slice(0, 10).split('-').reverse().join('/')
    : text(value);
export default function StudentProfileScreen() {
  const { data: student, availability, expired } = useStudentProfile();
  if (expired) return <Navigate to="/login" replace />;
  return (
    <PageLayout
      title="Meu Perfil"
      subtitle="Confira seus dados cadastrados pela Secretaria."
      backTo="/MainMenu"
      roundedHeader
    >
      <div className={styles.layout}>
        {availability === 'loading' && !student && (
          <p role="status">Carregando seu perfil…</p>
        )}
        {availability === 'unavailable' && (
          <section className={styles.panel} role="alert">
            <p>
              Não foi possível atualizar seu perfil.{' '}
              {student
                ? 'Os últimos dados consultados permanecem visíveis.'
                : ''}
            </p>
            <button
              type="button"
              onClick={() => void studentProfileResource.refresh(true)}
            >
              Tentar novamente
            </button>
          </section>
        )}
        {student && (
          <>
            <section
              className={styles.intro}
              aria-label="Identificação do aluno"
            >
              <div className={styles.avatar}>
                <StudentPhoto
                  key={student.ra}
                  src={student.photoStatus === 'APPROVED' ? student.photo : ''}
                />
              </div>
              <div className={styles.identity}>
                <h2>{text(student.name)}</h2>
                <p>Seu cadastro no Portal de Alunos</p>
              </div>
            </section>
            <section className={styles.panel}>
              <h2>Dados pessoais e contato</h2>
              <dl className={styles.fields}>
                <div>
                  <dt>
                    {student.socialName
                      ? 'Nome de identificação'
                      : 'Nome completo'}
                  </dt>
                  <dd>{text(student.name)}</dd>
                </div>
                <div>
                  <dt>Nome social</dt>
                  <dd>{text(student.socialName)}</dd>
                </div>
                <div>
                  <dt>E-mail</dt>
                  <dd>{text(student.email)}</dd>
                </div>
                <div>
                  <dt>CPF</dt>
                  <dd>{text(student.cpf)}</dd>
                </div>
              </dl>
            </section>
            <section className={styles.panel}>
              <h2>Vínculo acadêmico</h2>
              <dl className={styles.fields}>
                <div>
                  <dt>RA</dt>
                  <dd>{text(student.ra)}</dd>
                </div>
                <div>
                  <dt>Curso</dt>
                  <dd>{text(student.course)}</dd>
                </div>
                <div>
                  <dt>Situação acadêmica</dt>
                  <dd>{text(student.status)}</dd>
                </div>
                <div>
                  <dt>Ingresso</dt>
                  <dd>{text(student.admission)}</dd>
                </div>
                <div>
                  <dt>Validade da carteirinha</dt>
                  <dd>{calendarDate(student.dueDate)}</dd>
                </div>
              </dl>
            </section>
            <p className={styles.guidance}>
              Para corrigir um dado cadastral,{' '}
              <Link to="/suporte">abra uma solicitação</Link>.
            </p>
          </>
        )}
      </div>
    </PageLayout>
  );
}
