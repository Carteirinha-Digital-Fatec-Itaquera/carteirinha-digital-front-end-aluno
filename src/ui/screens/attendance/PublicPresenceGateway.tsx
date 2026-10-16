import { useParams } from 'react-router-dom';
import PresencaConfirmacaoScreen from './PresencaConfirmacaoScreen';
import PublicEventsScreen from '../events/PublicEventsScreen';

export default function PublicPresenceGateway() {
  const { reference } = useParams();
  const isStudent = Boolean(
    localStorage.getItem('token') && localStorage.getItem('@Carteirinha:profile'),
  );
  return isStudent ? (
    <PresencaConfirmacaoScreen />
  ) : (
    <PublicEventsScreen reference={reference} />
  );
}
