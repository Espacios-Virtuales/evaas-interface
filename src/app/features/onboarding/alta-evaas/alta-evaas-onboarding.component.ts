import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

interface WizardStep {
  title: string;
  description: string;
}

interface ArchetypePillar {
  label: string;
  value: string;
}

@Component({
  selector: 'app-alta-evaas-onboarding',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alta-evaas-onboarding.component.html',
  styleUrls: ['./alta-evaas-onboarding.component.scss'],
})
export class AltaEvaasOnboardingComponent {
  readonly steps: WizardStep[] = [
    {
      title: 'Identidad',
      description: 'Datos base para reconocer a la persona que inicia el abordaje.',
    },
    {
      title: 'Empresa / Formalizacion',
      description: 'Estado formal del proyecto y necesidades previas a la activacion digital.',
    },
    {
      title: 'Proyecto',
      description: 'Lectura inicial de nombre, etapa y presencia digital actual.',
    },
    {
      title: 'Arquetipo EVAAS',
      description: 'Marco de trabajo posible para ordenar el acompanamiento.',
    },
    {
      title: 'Necesidades',
      description: 'Servicios que podrian formar parte de la continuidad operacional.',
    },
    {
      title: 'Consentimiento etico',
      description: 'Permisos y criterios de uso responsable de la informacion.',
    },
  ];

  readonly identityFields = ['phone', 'clientType', 'clientRut'];

  readonly companyFields = [
    'companyRut',
    'companyName',
    'legalStage',
    'hasCompany',
    'needsCompanyConstitution',
  ];

  readonly projectFields = [
    'projectName',
    'currentStage',
    'websiteUrl',
    'hasWebsite',
    'hasDomain',
    'hasPayments',
  ];

  readonly archetypePillars: ArchetypePillar[] = [
    { label: 'Activación Digital', value: 'ACTIVACION_DIGITAL' },
    { label: 'Sistema Operativo', value: 'SISTEMA_OPERATIVO' },
    { label: 'Flujo y Escalabilidad', value: 'FLUJO_ESCALABILIDAD' },
    { label: 'Formación y Experiencia', value: 'FORMACION_EXPERIENCIA' },
  ];

  readonly services = [
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

  readonly consentFields = [
    'acceptsDataUseForDiagnosis',
    'acceptsContact',
    'wantsHumanReview',
  ];

  readonly activeStepIndex = signal(0);
  readonly activeStep = computed(() => this.steps[this.activeStepIndex()]);

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
}
