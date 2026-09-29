import { CheckCircle2, LogIn } from 'lucide-react';
import type { Attendance } from '../../../domains/Attendance';
import BadgeComp from '../badge/BadgeComp';
import { formatDate, formatTime } from '../../screens/events/eventPresentation';
import styles from './style.module.css';

export default function AttendanceInfo({ attendance }: { attendance: Attendance }) {
  const confirmed = attendance.status === 'CONFIRMED';
  return <div className={styles.attendance}>
    <BadgeComp tone={confirmed ? 'success' : 'info'}>
      {confirmed ? <CheckCircle2 size={14} aria-hidden="true" /> : <LogIn size={14} aria-hidden="true" />}
      {confirmed ? 'Presença Confirmada' : 'Entrada Registrada'}
    </BadgeComp>
    {attendance.checkInAt && <p>Entrada: <time dateTime={attendance.checkInAt}>
      {formatDate(attendance.checkInAt)} às {formatTime(attendance.checkInAt)}
    </time></p>}
    {attendance.checkOutAt && <p>Saída: <time dateTime={attendance.checkOutAt}>
      {formatDate(attendance.checkOutAt)} às {formatTime(attendance.checkOutAt)}
    </time></p>}
  </div>;
}
