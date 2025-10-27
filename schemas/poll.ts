import z from 'zod';

export const PollSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  description: z.string().optional(),
  options: z
    .array(z.object({ value: z.string().min(1, 'Option cannot be empty') }))
    .min(2, 'At least two options are required')
});
