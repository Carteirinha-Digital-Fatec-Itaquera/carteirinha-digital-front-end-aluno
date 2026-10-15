import { useParams } from 'react-router-dom';
import PresencaConfirmacaoScreen from './PresencaConfirmacaoScreen';
import PublicEventsScreen from '../events/PublicEventsScreen';
export default function PublicPresenceGateway() { const { reference } = useParams(); return localStorage.getItem('token') ? <PresencaConfirmacaoScreen /> : <PublicEventsScreen reference={reference} />; }
