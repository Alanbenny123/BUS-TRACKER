import { email, type InferOutput, maxValue, minLength, minValue, number, object, pipe, regex, string } from "valibot";

export const currentYear = new Date().getFullYear();

export const registerSchema = object({
    name: pipe(string(), minLength(2, 'Name must be at least 2 characters')),
    email: pipe(string(), email('Please enter a valid email address')),
    password: pipe(string(), minLength(6, 'Password must be at least 6 characters')),
    phoneNumber: pipe(
      string(),
      regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number')
    ),
    courseStream: pipe(string(), minLength(2, 'Please enter your course stream')),
    passoutYear: pipe(
      number(),
      minValue(currentYear, 'Passout year cannot be in the past'),
      maxValue(currentYear + 5, 'Passout year cannot be more than 5 years in the future')
    ),
  });

  export type RegisterFormData = InferOutput<typeof registerSchema>;