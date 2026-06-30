export interface Student {
  id: string;
  name: string;
  email: string;
  faculty: string;
  programme: string;
  submittedAt: string;
  status: "complete" |"incomplete"| "failed" | "success";
  paid: boolean;
  paymentRef: string;
  intent?: string;
  message?: string;
}

export type Step = "subjects"|"personal"|"education"|"declaration";
