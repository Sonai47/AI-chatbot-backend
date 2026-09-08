import { z } from "zod";

export const UserRequirementsSchema = z.object({
  purpose: z.string().nullable(),
  activity: z.string().nullable(),
  loan_amount: z.number().nullable(),
  project_cost: z.number().nullable(),
  course_fees: z.number().nullable(),
  annual_family_income: z.number().nullable(),
  is_sc: z.boolean().nullable()
});

export type UserRequirements = z.infer<typeof UserRequirementsSchema>;