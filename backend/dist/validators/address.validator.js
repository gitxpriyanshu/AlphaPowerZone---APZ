import { z } from 'zod';
export const createAddressSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        phone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number'),
        line1: z.string().min(5),
        line2: z.string().optional(),
        city: z.string().min(2),
        state: z.string().min(2),
        pincode: z.string().regex(/^[0-9]{6}$/, 'Invalid PIN code'),
        isDefault: z.boolean().optional(),
    }),
});
