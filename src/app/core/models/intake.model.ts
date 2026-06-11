export interface AltaEvaasIntakePayload {
  phone?: string;
  clientType?: string;
  clientRut?: string;
  companyRut?: string;
  companyName?: string;
  legalStage?: string;
  hasCompany?: boolean;
  needsCompanyConstitution?: boolean;
  projectName?: string;
  currentStage?: string;
  websiteUrl?: string;
  hasWebsite?: boolean;
  hasDomain?: boolean;
  hasPayments?: boolean;
  primaryPillar?: string;
  secondaryPillars?: string[];
  organizationArchetype?: string;
  mainNeed?: string;
  selectedServices?: string[];
  urgency?: string;
  budgetRange?: string;
  message?: string;
  acceptsDataUseForDiagnosis?: boolean;
  acceptsContact?: boolean;
  wantsHumanReview?: boolean;
}

export interface AltaEvaasIntakeResponse extends AltaEvaasIntakePayload {
  id?: string | number;
  status?: string;
  submittedAt?: string | null;
}
