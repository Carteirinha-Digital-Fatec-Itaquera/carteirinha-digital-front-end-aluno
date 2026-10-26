import { useCallback, useEffect, useRef, useState } from 'react';
import MessageModal from '../components/MessageModal/MessageModal';

const cancelled = () => Object.assign(new Error('Registro cancelado. Nenhuma presença foi registrada.'), { code: 'LOCATION_CANCELLED' });

export function useLocationNotice() {
  const [visible, setVisible] = useState(false);
  const pending = useRef<{ promise: Promise<void>; resolve: () => void; reject: (error: Error) => void } | null>(null);

  const confirmLocation = useCallback(() => {
    if (pending.current) return pending.current.promise;
    let resolve!: () => void;
    let reject!: (error: Error) => void;
    const promise = new Promise<void>((accept, decline) => { resolve = accept; reject = decline; });
    pending.current = { promise, resolve, reject };
    setVisible(true);
    return promise;
  }, []);

  const finish = (accepted: boolean) => {
    const current = pending.current;
    pending.current = null;
    setVisible(false);
    if (accepted) current?.resolve();
    else current?.reject(cancelled());
  };

  useEffect(() => () => {
    pending.current?.reject(cancelled());
    pending.current = null;
  }, []);

  const locationNotice = <MessageModal
    visible={visible}
    tone="warning"
    title="Ative sua localização para registrar presença"
    message="Por segurança, a localização é obrigatória para confirmar que você está no local do evento."
    details={[
      'Ligue a localização/GPS nas configurações do celular.',
      'Ao continuar, permita o acesso à localização quando o navegador solicitar.',
      'Se o acesso estiver bloqueado, libere a permissão nas configurações do navegador. Se houver dificuldade, procure a Secretaria presencialmente.',
    ]}
    confirmText="Entendi, continuar"
    cancelText="Cancelar"
    onConfirm={() => finish(true)}
    onCancel={() => finish(false)}
  />;
  return { confirmLocation, locationNotice };
}
