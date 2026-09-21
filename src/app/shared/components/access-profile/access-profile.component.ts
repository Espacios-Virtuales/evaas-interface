import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MyAccessContextDto, MyOrganizationContextDto } from '../../../core/models/evaas-contracts.model';
import { MeService } from '../../../core/services/me.service';

type AccessProfileState = 'LOADING' | 'READY' | 'ERROR';

@Component({
  standalone: true,
  selector: 'evaas-access-profile',
  imports: [CommonModule],
  templateUrl: './access-profile.component.html',
  styleUrls: ['./access-profile.component.scss'],
})
export class AccessProfileComponent implements OnInit {
  private readonly meService = inject(MeService);

  readonly state = signal<AccessProfileState>('LOADING');
  readonly accessContext = signal<MyAccessContextDto | null>(null);
  readonly error = signal<string | null>(null);
  readonly loading = computed(() => this.state() === 'LOADING');
  readonly ready = computed(() => this.state() === 'READY');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.state.set('LOADING');
    this.error.set(null);

    this.meService.getMyAccessContext().subscribe({
      next: accessContext => {
        this.accessContext.set(accessContext);
        this.state.set('READY');
      },
      error: err => {
        console.error('[AccessProfile] access context load error', err);
        this.accessContext.set(null);
        this.error.set('No fue posible cargar tu perfil de acceso.');
        this.state.set('ERROR');
      },
    });
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
