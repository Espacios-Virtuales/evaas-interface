import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription, catchError, of } from 'rxjs';
import { AuthStore } from '../../../core/auth/auth.store';
import { AltaEvaasIntakePayload, AltaEvaasIntakeResponse } from '../../../core/models/intake.model';
import { IntakeService } from '../../../core/services/intake.service';

type IntakeUiState =
  | 'loading'
  | 'empty/new intake'
  | 'draft loaded'
  | 'saving'
  | 'saved'
  | 'error'
  | 'unauthenticated';

interface WizardStep {
  title: string;
  description: string;
}

interface OptionItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-alta-evaas-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './alta-evaas-onboarding.component.html',
  styleUrls: ['./alta-evaas-onboarding.component.scss'],
})
export class AltaEvaasOnboardingComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authStore = inject(AuthStore);
  private intakeService = inject(IntakeService);
  private intakeSub?: Subscription;
  private saveSub?: Subscription;

  readonly steps: WizardStep[] = [
    {
      title: 'Identidad',
      description: 'Datos base para reconocer a la persona que inicia el abordaje.',
    },
    {
      title: 'Empresa / Formalización',
      description: 'Estado formal del proyecto y necesidades previas a la activación digital.',
    },
    {
      title: 'Proyecto',
      description: 'Lectura inicial de nombre, etapa y presencia digital actual.',
    },
    {
      title: 'Arquetipo EVAAS',
      description: 'Marco de trabajo posible para ordenar el acompañamiento.',
    },
    {
      title: 'Necesidades',
      description: 'Servicios que podrían formar parte de la continuidad operacional.',
    },
    {
      title: 'Consentimiento ético',
      description: 'Permisos y criterios de uso responsable de la información.',
    },
  ];

  readonly pillarOptions: OptionItem[] = [
    { label: 'Activación Digital', value: 'ACTIVACION_DIGITAL' },
    { label: 'Sistema Operativo', value: 'SISTEMA_OPERATIVO' },
    { label: 'Flujo y Escalabilidad', value: 'FLUJO_ESCALABILIDAD' },
    { label: 'Formación y Experiencia', value: 'FORMACION_EXPERIENCIA' },
  ];

  readonly serviceOptions = [
    'ALTA_EVAAS',
    'DIAGNOSTICO_DIGITAL',
    'ACTIVACION_DIGITAL',
    'SISTEMA_OPERATIVO',
    'FLUJO_ESCALABILIDAD',
    'FORMACION_EXPERIENCIA',
    'CONSTITUCION_EMPRESA',
    'FORMALIZACION_PROYECTO',
    'CONTINUIDAD_OPERACIONAL',
  ];

  readonly activeStepIndex = signal(0);
  readonly activeStep = computed(() => this.steps[this.activeStepIndex()]);
  readonly uiState = signal<IntakeUiState>('loading');
  readonly statusMessage = signal('Cargando borrador de Alta EVAAS...');
  readonly validationMessage = signal<string | null>(null);
  readonly hasExistingIntake = signal(false);
  readonly secondaryPillars = signal<string[]>([]);
  readonly selectedServices = signal<string[]>([]);

  readonly form = this.fb.nonNullable.group({
    phone: [''],
    clientType: [''],
    clientRut: [''],
    companyRut: [''],
    companyName: [''],
    legalStage: [''],
    hasCompany: [false],
    needsCompanyConstitution: [false],
    projectName: [''],
    currentStage: [''],
    websiteUrl: [''],
    hasWebsite: [false],
    hasDomain: [false],
    hasPayments: [false],
    primaryPillar: [''],
    organizationArchetype: [''],
    mainNeed: [''],
    urgency: [''],
    budgetRange: [''],
    message: [''],
    acceptsDataUseForDiagnosis: [false],
    acceptsContact: [false],
    wantsHumanReview: [true],
  });

  ngOnInit(): void {
    if (!this.authStore.isLoggedIn()) {
      this.uiState.set('unauthenticated');
      this.statusMessage.set('Para continuar Alta EVAAS, inicia sesión con tu cuenta activada.');
      return;
    }

    this.loadIntake();
  }

  ngOnDestroy(): void {
    this.intakeSub?.unsubscribe();
    this.saveSub?.unsubscribe();
  }

  previousStep(): void {
    this.activeStepIndex.update(index => Math.max(0, index - 1));
  }

  nextStep(): void {
    this.activeStepIndex.update(index => Math.min(this.steps.length - 1, index + 1));
  }

  setStep(index: number): void {
    if (index < 0 || index >= this.steps.length) return;
    this.activeStepIndex.set(index);
  }

  isOptionSelected(collection: string[], value: string): boolean {
    return collection.includes(value);
  }

  toggleSecondaryPillar(value: string, checked: boolean): void {
    this.secondaryPillars.update(current => this.toggleArrayValue(current, value, checked));
  }

  toggleSelectedService(value: string, checked: boolean): void {
    this.selectedServices.update(current => this.toggleArrayValue(current, value, checked));
  }

  saveDraft(): void {
    if (this.uiState() === 'saving' || this.uiState() === 'unauthenticated') return;

    this.validationMessage.set(null);
    const payload = this.buildPayload();
    const validationError = this.validateDraft(payload);
    if (validationError) {
      this.validationMessage.set(validationError);
      return;
    }

    this.uiState.set('saving');
    this.statusMessage.set('Guardando borrador de Alta EVAAS...');

    const request$ = this.hasExistingIntake()
      ? this.intakeService.updateMyIntake(payload)
      : this.intakeService.createMyIntake(payload);

    this.saveSub?.unsubscribe();
    this.saveSub = request$.subscribe({
      next: response => {
        this.applyIntake(response);
        this.hasExistingIntake.set(true);
        this.uiState.set('saved');
        this.statusMessage.set('Borrador guardado.');
      },
      error: () => {
        this.uiState.set('error');
        this.statusMessage.set('No pudimos guardar el borrador. Intenta nuevamente.');
      },
    });
  }

  private loadIntake(): void {
    this.uiState.set('loading');
    this.statusMessage.set('Cargando borrador de Alta EVAAS...');

    this.intakeSub = this.intakeService.getMyIntake().pipe(
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse && err.status === 404) {
          return of(null);
        }

        throw err;
      })
    ).subscribe({
      next: intake => {
        if (intake) {
          this.applyIntake(intake);
          this.hasExistingIntake.set(true);
          this.uiState.set('draft loaded');
          this.statusMessage.set('Borrador cargado.');
          return;
        }

        this.hasExistingIntake.set(false);
        this.uiState.set('empty/new intake');
        this.statusMessage.set('Aún no tienes un borrador. Puedes completar campos y guardar cuando quieras.');
      },
      error: () => {
        this.uiState.set('error');
        this.statusMessage.set('No pudimos cargar tu borrador de Alta EVAAS.');
      },
    });
  }

  private applyIntake(intake: AltaEvaasIntakeResponse): void {
    this.form.patchValue({
      phone: intake.phone ?? '',
      clientType: intake.clientType ?? '',
      clientRut: intake.clientRut ?? '',
      companyRut: intake.companyRut ?? '',
      companyName: intake.companyName ?? '',
      legalStage: intake.legalStage ?? '',
      hasCompany: intake.hasCompany === true,
      needsCompanyConstitution: intake.needsCompanyConstitution === true,
      projectName: intake.projectName ?? '',
      currentStage: intake.currentStage ?? '',
      websiteUrl: intake.websiteUrl ?? '',
      hasWebsite: intake.hasWebsite === true,
      hasDomain: intake.hasDomain === true,
      hasPayments: intake.hasPayments === true,
      primaryPillar: intake.primaryPillar ?? '',
      organizationArchetype: intake.organizationArchetype ?? '',
      mainNeed: intake.mainNeed ?? '',
      urgency: intake.urgency ?? '',
      budgetRange: intake.budgetRange ?? '',
      message: intake.message ?? '',
      acceptsDataUseForDiagnosis: intake.acceptsDataUseForDiagnosis === true,
      acceptsContact: intake.acceptsContact === true,
      wantsHumanReview: intake.wantsHumanReview !== false,
    });
    this.secondaryPillars.set(Array.isArray(intake.secondaryPillars) ? intake.secondaryPillars : []);
    this.selectedServices.set(Array.isArray(intake.selectedServices) ? intake.selectedServices : []);
  }

  private buildPayload(): AltaEvaasIntakePayload {
    const raw = this.form.getRawValue();

    return {
      phone: this.optionalString(raw.phone),
      clientType: this.optionalString(raw.clientType),
      clientRut: this.optionalString(raw.clientRut),
      companyRut: this.optionalString(raw.companyRut),
      companyName: this.optionalString(raw.companyName),
      legalStage: this.optionalString(raw.legalStage),
      hasCompany: Boolean(raw.hasCompany),
      needsCompanyConstitution: Boolean(raw.needsCompanyConstitution),
      projectName: this.optionalString(raw.projectName),
      currentStage: this.optionalString(raw.currentStage),
      websiteUrl: this.optionalString(raw.websiteUrl),
      hasWebsite: Boolean(raw.hasWebsite),
      hasDomain: Boolean(raw.hasDomain),
      hasPayments: Boolean(raw.hasPayments),
      primaryPillar: this.optionalString(raw.primaryPillar),
      secondaryPillars: [...this.secondaryPillars()],
      organizationArchetype: this.optionalString(raw.organizationArchetype),
      mainNeed: this.optionalString(raw.mainNeed),
      selectedServices: [...this.selectedServices()],
      urgency: this.optionalString(raw.urgency),
      budgetRange: this.optionalString(raw.budgetRange),
      message: this.optionalString(raw.message),
      acceptsDataUseForDiagnosis: Boolean(raw.acceptsDataUseForDiagnosis),
      acceptsContact: Boolean(raw.acceptsContact),
      wantsHumanReview: Boolean(raw.wantsHumanReview),
    };
  }

  private validateDraft(payload: AltaEvaasIntakePayload): string | null {
    if (payload.websiteUrl && !this.looksLikeUrl(payload.websiteUrl)) {
      return 'websiteUrl debe parecer URL si existe.';
    }

    if (!Array.isArray(payload.selectedServices)) {
      return 'selectedServices debe ser array.';
    }

    if (!Array.isArray(payload.secondaryPillars)) {
      return 'secondaryPillars debe ser array.';
    }

    const booleans = [
      payload.hasCompany,
      payload.needsCompanyConstitution,
      payload.hasWebsite,
      payload.hasDomain,
      payload.hasPayments,
      payload.acceptsDataUseForDiagnosis,
      payload.acceptsContact,
      payload.wantsHumanReview,
    ];

    if (booleans.some(value => typeof value !== 'boolean')) {
      return 'Los campos booleanos deben ser booleanos.';
    }

    return null;
  }

  private looksLikeUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private optionalString(value: string): string | undefined {
    const normalized = value.trim();
    return normalized ? normalized : undefined;
  }

  private toggleArrayValue(current: string[], value: string, checked: boolean): string[] {
    if (checked) {
      return current.includes(value) ? current : [...current, value];
    }

    return current.filter(item => item !== value);
  }
}
