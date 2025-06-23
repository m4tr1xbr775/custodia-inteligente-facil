
/**
 * Utilitários para manipulação segura de datas, evitando problemas de fuso horário
 */

/**
 * Converte uma string de data no formato YYYY-MM-DD para um objeto Date local
 * sem problemas de fuso horário
 */
export function parseLocalDate(dateString: string): Date {
  if (!dateString) return new Date();
  
  // Quebra a string em partes para evitar problemas de timezone
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Cria a data usando o construtor local (mês é 0-indexado)
  return new Date(year, month - 1, day);
}

/**
 * Formata uma data para o formato YYYY-MM-DD garantindo que seja a data local
 */
export function formatLocalDate(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Converte uma data para string no formato YYYY-MM-DD usando a data local
 * Esta função evita problemas de timezone ao converter Date para string
 */
export function toLocalDateString(date: Date | string): string {
  if (typeof date === 'string') {
    // Se já é string, valida e retorna
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(date)) {
      return date;
    }
    // Se não está no formato correto, tenta converter
    const parsedDate = parseLocalDate(date);
    return formatLocalDate(parsedDate);
  }
  
  return formatLocalDate(date);
}

/**
 * Cria uma data para hoje no formato local
 */
export function getTodayLocalString(): string {
  return formatLocalDate(new Date());
}

/**
 * Verifica se uma data string está no formato correto (YYYY-MM-DD)
 */
export function isValidDateString(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = parseLocalDate(dateString);
  const formatted = formatLocalDate(date);
  
  return formatted === dateString;
}
