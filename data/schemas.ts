import {z} from "zod";

export const subjectSchema = z.object({
  faculty: z.string().min(1, "Select a faculty"),
  programme: z.string().min(1, "Select a programme"),
});

export const personalSchema = z.object({
  firstName:   z.string().min(4, "Required"),
  lastName:    z.string().min(4, "Required"),
  otherNames:  z.string().optional(),
  gender:      z.enum(["Male","Female"], { message: "Select gender" }),
  maritalStatus: z.enum(["Married","Single"], { message: "Select status" }),
  email:       z.email("Valid email required"),
  phone:       z.string().min(8, "Valid phone required").max(15, "Valid phone required"),
//   nationality: z.string().min(2, "Required"),
  street:      z.string().min(3, "Required"),
  street2:     z.string().optional(),
  city:        z.string().min(1, "Required"),
  stateProvince: z.string().optional(),
  postalCode:  z.string().optional(),
  country:     z.string().min(1, "Required"),
  stateOfOrigin: z.string().min(1, "Required"),
  lga:         z.string().min(1, "Required"),
  dobMonth:    z.string().min(1, "Required"),
  dobDay:      z.string().min(1, "Required"),
  dobYear:     z.string().min(4, "Required"),
  hobbies:     z.string().min(2, "Required"),
  ref_number:     z.string().optional(),
});

export const educationRowSchema = z.object({
  institution: z.string().min(3, "Required"),
  location:    z.string().min(5, "Required"),
  dateFrom:    z.string().min(1, "Required"),
  dateTo:      z.string().min(1, "Required"),
  certificate: z.string().min(1, "Required"),
});

export const sponsorRowSchema = z.object({
  name:         z.string().min(4, "Required"),
  relationship: z.string().min(3, "Required"),
  address:      z.string().min(5, "Required"),
 phone:       z.string().min(8, "Valid phone required").max(15, "Valid phone required"),  email:        z.string().min(1, "Required"),
});

export const declarationSchema = z.object({
  heardFrom:   z.string().min(1, "Required"),
  heardOther:  z.string().optional(),
  declaration: z.boolean().refine((value) => value === true, {
  message: "You must accept the declaration",
}),
});

export const fullSchema = z.object({
  ...subjectSchema.shape,
  ...personalSchema.shape,
  education: z.array(educationRowSchema),
  sponsors: z.array(sponsorRowSchema),
  ...declarationSchema.shape,
});

export type FullForm = z.infer<typeof fullSchema>;