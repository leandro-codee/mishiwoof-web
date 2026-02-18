// Enterprise Invoice DTOs

export interface EnterpriseInvoice {
  id: string;
  enterpriseId: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  subtotalClp: number;
  taxClp: number;
  totalClp: number;
  status: string;
  issuedAt?: string;
  dueDate?: string;
  paidAt?: string;
  pdfUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnterpriseInvoiceLine {
  id: string;
  invoiceId: string;
  memberId: string;
  subscriptionId: string;
  petName?: string;
  planName?: string;
  amountClp: number;
  description?: string;
  createdAt: string;
}

export interface CreateEnterpriseInvoiceRequest {
  enterpriseId: string;
  periodStart: string;
  periodEnd: string;
  notes?: string;
}

export interface UpdateEnterpriseInvoiceRequest {
  status?: string;
  issuedAt?: string;
  dueDate?: string;
  paidAt?: string;
  pdfUrl?: string;
  notes?: string;
}
