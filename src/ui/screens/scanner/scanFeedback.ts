import type { ScanResponse } from '../../../api/attendance/scanAttendance';

export interface ScanFeedback {
  tone: 'success' | 'info' | 'error';
  title: string;
  message: string;
  eventTitle?: string;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  certificates?: boolean;
  login?: boolean;
}

export function responseFeedback(data: ScanResponse): ScanFeedback {
  if (!data.success) return {
    tone: 'info', title: data.code === 'ALREADY_CHECKED_IN' ? 'Entrada já registrada' : 'Saída já registrada',
    message: data.code === 'ALREADY_CHECKED_IN' ? 'Sua entrada já consta no sistema. Lembre-se de registrar a saída ao final.' : 'Sua saída já consta no sistema.',
    certificates: data.code === 'ALREADY_CHECKED_OUT',
  };
  return data.type === 'CHECK_IN' ? {
    tone: 'success', title: 'Entrada registrada!', eventTitle: data.eventTitle,
    message: 'Lembre-se de registrar sua saída ao final da palestra.', checkInAt: data.timestamp,
  } : {
    tone: 'success', title: 'Presença confirmada!', eventTitle: data.eventTitle,
    message: 'Entrada e saída confirmadas. Consulte seus certificados para acompanhar a emissão.',
    checkOutAt: data.timestamp, certificates: true,
  };
}

export function errorFeedback(error: unknown): ScanFeedback {
  const value = error && typeof error === 'object' ? error as Record<string, unknown> : {};
  const code = value.code;
  const status = String(value.status ?? '');
  const message = typeof value.message === 'string' ? value.message : '';
  const result = (title: string, text: string): ScanFeedback => ({ tone: 'error', title, message: text });
  if (status === '401') return { ...result('Sua sessão expirou', 'Entre novamente para registrar presença.'), login: true };
  if (status === '403') return result('Acesso não autorizado', 'Use uma conta de aluno ativa para registrar presença.');
  // V1 ainda não fixa código para saída sem entrada; suporte ao texto NestJS até a #26.
  if (['NO_CHECK_IN', 'CHECK_IN_REQUIRED', 'CHECK_IN_NOT_FOUND'].includes(String(code)) ||
      status === '400' && /sem check.?in|nenhuma entrada|check.?in.*(?:não encontrado|necessário)/i.test(message)) {
    return result('Não foi possível registrar a saída', 'Nenhuma entrada encontrada para este evento. Procure a Secretaria.');
  }
  if (code === 'INVALID_QR_TOKEN' || status === '400') return result('QR Code inválido ou período de presença encerrado',
    'Aponte para o QR de presença atualizado, exibido na palestra. O QR da carteirinha não pode ser utilizado aqui.');
  if (code === 'RA_REUSE_HISTORY_CONFLICT') return result('Não foi possível registrar a presença', 'Procure a Secretaria para regularizar seu vínculo neste evento.');
  if (status === '409') return result('Registro indisponível', 'O evento não permite este registro no momento. Consulte a Secretaria.');
  if (status === '404' || status === '501') return result('Registro indisponível', 'O serviço de presença ou o evento não está disponível. Tente novamente mais tarde.');
  if (status === '429') return result('Muitas tentativas', 'Aguarde alguns instantes antes de tentar novamente.');
  return result('Não foi possível confirmar o registro',
    'Verifique sua conexão e consulte Minhas Participações antes de tentar novamente. A solicitação pode ter chegado ao servidor.');
}

export function cameraErrorMessage(error: unknown): string {
  const name = error && typeof error === 'object' && 'name' in error ? String(error.name) : String(error);
  if (/NotAllowed|PermissionDenied/i.test(name)) return 'Permissão de câmera negada. Libere o acesso nas configurações do navegador e tente novamente.';
  if (/NotFound|DevicesNotFound/i.test(name)) return 'Nenhuma câmera foi encontrada neste dispositivo.';
  if (/NotReadable|TrackStart/i.test(name)) return 'A câmera está ocupada ou indisponível. Feche outros aplicativos que estejam usando a câmera.';
  return 'Não foi possível abrir a câmera. Verifique as permissões e tente novamente.';
}
