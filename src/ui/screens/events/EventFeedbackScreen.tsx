import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Star,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  LoaderCircle,
  ArrowRight,
  MessageSquareHeart,
} from 'lucide-react';
import { submitEventFeedback } from '../../../api/events/feedback';
import { visitorRequest } from '../../../api/events/visitor';
import styles from './EventFeedbackScreen.module.css';

const RATING_LABELS: Record<number, string> = {
  1: '1 de 5 — Muito ruim',
  2: '2 de 5 — Ruim',
  3: '3 de 5 — Regular',
  4: '4 de 5 — Bom',
  5: '5 de 5 — Excelente!',
};

export default function EventFeedbackScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const profile = new URLSearchParams(location.search).get('perfil');
  const [visitorContext, setVisitorContext] = useState(false);
  const isVisitor = profile === 'visitante' || visitorContext || typeof window === 'undefined' || !localStorage.getItem('token');

  useEffect(() => {
    if (profile) return;
    const controller = new AbortController();
    void visitorRequest('visitor/session', undefined, controller.signal).then(() => {
      if (!controller.signal.aborted) setVisitorContext(true);
    }).catch(() => {});
    return () => controller.abort();
  }, [profile]);

  const eventTitle =
    (location.state as { eventTitle?: string } | null)?.eventTitle ||
    new URLSearchParams(location.search).get('title') ||
    'Palestra / Evento';

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comments, setComments] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeRating = hoverRating ?? rating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || submitting) return;

    if (rating < 1 || rating > 5) {
      setErrorMessage('Por favor, selecione uma nota de 1 a 5.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);
      await submitEventFeedback(id, {
        rating,
        comments: comments.trim() || undefined,
        suggestions: suggestions.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Não foi possível enviar sua avaliação. Tente novamente.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate(isVisitor ? '/visitantes/certificados' : '/eventos');
  };

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.topBar}>
        <span className={styles.topBadge}>
          <MessageSquareHeart size={16} /> Pesquisa de Satisfação
        </span>
        <h1 className={styles.title}>Como foi a atividade?</h1>
        <p className={styles.eventSubtitle}>{eventTitle}</p>
      </header>

      <main className={styles.container}>
        {submitted ? (
          <div className={`${styles.card} ${styles.successCard}`} role="status">
            <div className={styles.successIcon}>
              <CheckCircle2 size={48} />
            </div>
            <h2 className={styles.successTitle}>Obrigado pela sua avaliação!</h2>
            <p className={styles.successDesc}>
              Sua resposta foi registrada de forma totalmente anônima. Seu feedback é essencial para aprimorarmos os próximos encontros da Fatec Itaquera.
            </p>
            <div className={styles.btnGroup} style={{ width: '100%', marginTop: '1rem' }}>
              <Link to={isVisitor ? '/visitantes/certificados' : '/certificados'} className={styles.submitBtn}>
                Ver Meus Certificados <ArrowRight size={18} />
              </Link>
              <button
                type="button"
                className={styles.skipBtn}
                onClick={() => navigate(isVisitor ? '/visitantes' : '/eventos')}
              >
                Voltar à página inicial
              </button>
            </div>
          </div>
        ) : (
          <form className={styles.card} onSubmit={handleSubmit}>
            <div className={styles.anonShieldNotice} role="note">
              <ShieldCheck size={28} />
              <span>
                <strong>Avaliação 100% Anônima:</strong> Nenhuma informação pessoal, e-mail ou RA é associada à sua resposta. Sinta-se livre para opinar com sinceridade.
              </span>
            </div>

            {errorMessage && (
              <div className={styles.errorBanner} role="alert">
                <AlertCircle size={20} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Pergunta 1: Avaliação de 1 a 5 */}
            <div className={styles.formGroup}>
              <label id="rating-label">
                1) O que você achou da palestra? <span className={styles.required}>*</span>
              </label>
              <div
                className={styles.ratingContainer}
                role="radiogroup"
                aria-labelledby="rating-label"
              >
                <div className={styles.starGroup}>
                  {[1, 2, 3, 4, 5].map((num) => {
                    const isFilled = num <= activeRating;
                    return (
                      <button
                        key={num}
                        type="button"
                        className={`${styles.starButton} ${
                          isFilled ? styles.starButtonActive : ''
                        }`}
                        onClick={() => setRating(num)}
                        onMouseEnter={() => setHoverRating(num)}
                        onMouseLeave={() => setHoverRating(null)}
                        aria-label={`${num} estrelas`}
                        aria-checked={rating === num}
                        role="radio"
                      >
                        <Star
                          size={36}
                          fill={isFilled ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          strokeWidth={2}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className={styles.ratingLabel} aria-live="polite">
                  {RATING_LABELS[activeRating] || ''}
                </div>
              </div>
            </div>

            {/* Pergunta 2: Comentários e observações gerais */}
            <div className={styles.formGroup}>
              <label htmlFor="comments-input">
                2) Comentários ou observações sobre a palestra: <span className={styles.optional}>(opcional)</span>
              </label>
              <textarea
                id="comments-input"
                className={styles.textarea}
                placeholder="Conte o que mais gostou ou o que pode melhorar..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                maxLength={1000}
                rows={3}
              />
            </div>

            {/* Pergunta 3: Sugestão de temas para os próximos eventos */}
            <div className={styles.formGroup}>
              <label htmlFor="suggestions-input">
                3) Sugestão de temas ou assuntos para o próximo evento: <span className={styles.optional}>(opcional)</span>
              </label>
              <textarea
                id="suggestions-input"
                className={styles.textarea}
                placeholder="Quais temas você gostaria de ver em palestras futuras?"
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                maxLength={1000}
                rows={3}
              />
            </div>

            <div className={styles.btnGroup}>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <LoaderCircle size={20} className={styles.spin} /> Enviando avaliação...
                  </>
                ) : (
                  'Enviar Avaliação'
                )}
              </button>
              <button
                type="button"
                className={styles.skipBtn}
                onClick={handleSkip}
                disabled={submitting}
              >
                Pular pesquisa e concluir
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
