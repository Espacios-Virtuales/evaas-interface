// src/app/core/auth/has-role.directive.ts
import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthStore } from '../auth.store';


@Directive({
  selector: '[hasRole]',
  standalone: true   // 👈 ESTA ES LA CLAVE
})
export class HasRoleDirective {
  private tpl = inject(TemplateRef<any>);
  private vcr = inject(ViewContainerRef);
  private store = inject(AuthStore);
  private required: string[] = [];

  @Input() set hasRole(value: string | string[]) {
    this.required = Array.isArray(value) ? value : [value];
    this.render();
  }

  constructor() { effect(() => this.render()); }

  private render() {
    this.vcr.clear();
    const roles = this.store.roles(); // computed<string[]>
    const ok = this.required.length === 0 || this.required.some(r => roles.includes(r));
    if (ok) this.vcr.createEmbeddedView(this.tpl);
  }
}
