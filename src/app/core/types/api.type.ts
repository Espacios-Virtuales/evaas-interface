// Tipo interno (solo en este archivo)
export type ApiProvisionResponse = {
  statusCode: number;
  status: string;
  details?: Array<{ id: string }>;
  message?: string;
};
