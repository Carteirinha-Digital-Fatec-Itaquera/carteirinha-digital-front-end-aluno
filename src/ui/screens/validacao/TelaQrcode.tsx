import styles from './style.module.css'
import Badge from "../../components/validacaoqrcode/Badge";

import CardInfoInstituicao from '../../components/validacaoqrcode/cardinstituicaoinfo/CardInstituicao';
import CardMatriculaInfo from '../../components/validacaoqrcode/cardmatriculainfo/CardMatricula';


import logoFatec from "../../../assets/images/fatec_itaquera_logo.png";
import perfilDefault from "../../../assets/images/perfil_default.png";
import logoGoverno from "../../../assets/images/logos_cps_governo_com_slogan.png";

export default function TelaQrcode() {
  const dataValidade = new Date("2029-03-02");

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <img src={logoFatec} className={styles.logo} alt="Logo Fatec Itaquera" />
      </header>

      <main className={styles.containerInformacoes}>
        
        <section className={styles.containerCard}>
          <h2 className={styles.title}>Aluno</h2>

          <div className={styles.containerImgInfo}>
            <img src={perfilDefault} className={styles.imgAluno} alt="Foto do Aluno" />
            
            <div className={styles.containerInfo}>
              <div className={styles.containerNome}>
                <h1 className={styles.textAluno}>Joao Fulano</h1>
              </div>
              <p className={styles.textCurso}>Desenvolvimento de software</p>
              <p className={styles.textRA}>RA: 874375327</p>
            </div>
          </div>

          <Badge status="Ativo" validade={dataValidade} />
        </section>

        <CardMatriculaInfo status="Ativo" validade={dataValidade} />
        <CardInfoInstituicao />

      </main>

      <footer className={styles.containerRodape}>
        <img src={logoGoverno} className={styles.logoRodape} alt="Logos CPS e Governo de SP" />
      </footer>
    </div>
  );
}