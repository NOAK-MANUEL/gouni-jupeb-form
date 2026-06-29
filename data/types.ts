export interface Student {
  id: string;
  name: string;
  email: string;
  faculty: string;
  programme: string;
  submittedAt: string;
  status: "complete" | "incomplete";
  paid: boolean;
  paymentRef: string;
}

export type Step = "subjects"|"personal"|"education"|"declaration";
