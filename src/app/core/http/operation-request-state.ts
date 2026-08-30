import { HttpErrorResponse } from '@angular/common/http';

/** UI lifecycle for a request. It is intentionally independent from domain states. */
export type OperationRequestState =
  | 'IDLE'
  | 'VALIDATION_ERROR'
  | 'SUBMITTING'
  | 'SUCCESS'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'ERROR';

export interface OperationErrorMessages {
  fallback: string;
  badRequest?: string;
  unauthorized?: string;
  forbidden?: string;
  notFound?: string;
  conflict?: string;
}

export interface OperationErrorPresentation {
  state: Extract<OperationRequestState, 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'ERROR'>;
  message: string;
}

export function mapOperationHttpError(
  error: unknown,
  messages: OperationErrorMessages,
): OperationErrorPresentation {
  const status = error instanceof HttpErrorResponse ? error.status : 0;

  if (status === 400) return { state: 'ERROR', message: messages.badRequest ?? messages.fallback };
  if (status === 401) return { state: 'UNAUTHORIZED', message: messages.unauthorized ?? messages.fallback };
  if (status === 403) return { state: 'FORBIDDEN', message: messages.forbidden ?? messages.fallback };
  if (status === 404) return { state: 'NOT_FOUND', message: messages.notFound ?? messages.fallback };
  if (status === 409) return { state: 'CONFLICT', message: messages.conflict ?? messages.fallback };
  return { state: 'ERROR', message: messages.fallback };
}
