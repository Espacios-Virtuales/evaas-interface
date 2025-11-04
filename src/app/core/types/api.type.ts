// Tipo interno (solo en este archivo)
type ApiProvisionResponse = {
  statusCode: number;
  status: string;
  details?: Array<{ id: string }>;
  message?: string;
};