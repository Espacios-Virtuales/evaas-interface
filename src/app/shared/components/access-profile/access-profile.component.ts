import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MyAccessContextDto, MyOrganizationContextDto } from '../../../core/models/evaas-contracts.model';
import { AccessContextStore } from '../../../core/access/access-context.store';

@Component({
  standalone: true,
  selector: 'evaas-access-profile',
  imports: [CommonModule],
  templateUrl: './access-profile.component.html',
  styleUrls: ['./access-profile.component.scss'],
})
export class AccessProfileComponent implements OnInit {
  private readonly accessContextStore = inject(AccessContextStore);

  readonly state = this.accessContextStore.state;
  readonly accessContext = this.accessContextStore.context;
  readonly error = this.accessContextStore.errorMessage;
  readonly loading = this.accessContextStore.loading;
  readonly ready = this.accessContextStore.ready;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.accessContextStore.load().subscribe({ error: () => undefined });
  }

  retry(): void {
    this.accessContextStore.refresh().subscribe({ error: () => undefined });
  }

  organizationState(organization: MyOrganizationContextDto): string {
    return organization.organizationEnabled ? 'Organización habilitada' : 'Organización deshabilitada';
  }

  userState(accessContext: MyAccessContextDto): string {
    return accessContext.enabled ? 'Cuenta habilitada' : 'Cuenta deshabilitada';
  }

  trackAuthority(_: number, authority: string): string {
    return authority;
  }

  trackOrganization(_: number, organization: MyOrganizationContextDto): string {
    return organization.memberRef;
  }
}
