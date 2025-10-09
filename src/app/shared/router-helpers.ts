// src/app/shared/router-helpers.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export function useRouterHelpers() {
  const router = inject(Router);
  const go = (commands:any[], extras?:Parameters<Router['navigate']>[1]) => router.navigate(commands, extras);
  const goTo = (url:string) => router.navigateByUrl(url);
  const goBack = () => window.history.length > 1 ? window.history.back() : router.navigateByUrl('/');
  const withQuery = (q:Record<string,any>) => router.navigate([], { queryParams: q, queryParamsHandling: 'merge' });
  return { go, goTo, goBack, withQuery };
}
