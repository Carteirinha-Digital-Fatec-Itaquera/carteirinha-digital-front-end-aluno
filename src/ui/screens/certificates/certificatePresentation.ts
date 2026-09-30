export function formatCertificateDate(value: string): string {
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}/${month}/${year}` : 'Data indisponível';
}

export function certificateError(error: unknown, action: 'load' | 'download' | 'verify' = 'load'): string {
  const value = error && typeof error === 'object' ? error as Record<string, unknown> : {};
  const status = String(value.status ?? '');
  if (status === '401') return 'Sua sessão não é válida. Entre novamente para acessar seus certificados.';
  if (status === '403') return 'Você não tem permissão para acessar este certificado.';
  if (status === '404') return action === 'verify' ? 'Certificado não encontrado para este código. Confira o código informado.' : 'Certificado não encontrado ou serviço ainda indisponível para sua conta.';
  if (status === '409') return 'Este certificado está revogado ou indisponível para download.';
  if (value.code === 'MOCK_PDF_UNAVAILABLE') return 'O PDF está disponível apenas com a API real. Este é um exemplo de demonstração.';
  if (value.code === 'INVALID_RESPONSE') return 'O servidor retornou um documento ou resposta inválida. Tente novamente mais tarde.';
  if (action === 'verify') return 'Não foi possível consultar a autenticidade. Tente novamente; a validade não foi confirmada.';
  return action === 'download' ? 'Não foi possível baixar o PDF. Verifique sua conexão e tente novamente.' : 'Não foi possível carregar os certificados. Verifique sua conexão e tente novamente.';
}
