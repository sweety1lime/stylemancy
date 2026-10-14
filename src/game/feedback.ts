import { supabase } from '../lib/supabase';

/** Что случилось — студент выбирает одну из причин, учитель видит её в панели. */
export type FeedbackKind = 'unclear' | 'not-accepted' | 'bug' | 'other';

export const FEEDBACK_KINDS: Record<FeedbackKind, string> = {
  unclear: 'Непонятно, что делать',
  'not-accepted': 'Решение верное, но не засчитывается',
  bug: 'Что-то сломалось',
  other: 'Другое',
};

export interface FeedbackInput {
  studentId: string;
  levelId: string;
  kind: FeedbackKind;
  message: string;
  /** Код студента в момент сообщения */
  code?: string;
}

/** Отправить учителю сообщение о проблеме в уровне. */
export async function sendFeedback(input: FeedbackInput): Promise<void> {
  const { error } = await supabase.from('feedback').insert({
    student_id: input.studentId,
    level_id: input.levelId,
    kind: input.kind,
    message: input.message.trim().slice(0, 1000),
    code: input.code?.slice(0, 20000) ?? null,
  });
  if (!error) return;
  if (/TOO_MANY_MESSAGES/.test(error.message)) throw new Error('Слишком много сообщений подряд — подожди немного.');
  if (/fetch|network/i.test(error.message)) throw new Error('Нет связи с сервером — сообщение не ушло. Попробуй позже.');
  throw new Error(`Не получилось отправить: ${error.message}`);
}
