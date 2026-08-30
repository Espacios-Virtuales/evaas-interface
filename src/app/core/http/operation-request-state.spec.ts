import { HttpErrorResponse } from '@angular/common/http';
import { mapOperationHttpError } from './operation-request-state';

describe('mapOperationHttpError', () => {
  const messages = {
    fallback: 'No fue posible completar la operación.',
    unauthorized: 'Sesión no autorizada.',
    forbidden: 'No tienes permisos.',
    notFound: 'El contexto no está disponible.',
    conflict: 'La operación está en conflicto.',
  };

  it('maps supported HTTP errors to UI request states', () => {
    expect(mapOperationHttpError(new HttpErrorResponse({ status: 401 }), messages).state).toBe('UNAUTHORIZED');
    expect(mapOperationHttpError(new HttpErrorResponse({ status: 403 }), messages).state).toBe('FORBIDDEN');
    expect(mapOperationHttpError(new HttpErrorResponse({ status: 404 }), messages).state).toBe('NOT_FOUND');
    expect(mapOperationHttpError(new HttpErrorResponse({ status: 409 }), messages).state).toBe('CONFLICT');
  });

  it('maps unknown failures to ERROR without exposing transport details', () => {
    expect(mapOperationHttpError(new HttpErrorResponse({ status: 500 }), messages)).toEqual({
      state: 'ERROR', message: messages.fallback,
    });
  });

  it('keeps a backend 400 as ERROR while allowing operation-specific copy', () => {
    expect(mapOperationHttpError(new HttpErrorResponse({ status: 400 }), {
      ...messages,
      badRequest: 'Revisa los campos enviados.',
    })).toEqual({ state: 'ERROR', message: 'Revisa los campos enviados.' });
  });
});
