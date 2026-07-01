export interface Student {
  id:string;
  last_name: string;
  first_name: string;
  email: string;
  faculty: string;
  subjects: string;
  created_at: Date;
  status: "complete" |"incomplete"| "failed" | "success"|string;
  paid: boolean;
  gender?: string;
  ref_number: string;
   state_of_origin?: string,
  city? :string,
  country?: string,
  dob?: Date,
  intent?: string;
  message?: string;
}

export type Step = "subjects"|"personal"|"education"|"declaration";
