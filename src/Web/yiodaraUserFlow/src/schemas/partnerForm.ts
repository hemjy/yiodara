import * as z from 'zod';

export const partnerFormSchemas = {
  company: z.object({
    companyName: z.string()
      .min(1, 'Company name is required')
      .max(100, 'Company name must be less than 100 characters'),
    websiteUrl: z.string()
      .min(1, 'Website URL is required')
      .max(255, 'Website URL must be less than 255 characters')
      .refine((url) => {
        // Allow URLs with or without protocol
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
        return urlPattern.test(url);
      }, {
        message: 'Please enter a valid website URL (e.g., example.com or https://example.com)'
      })
      .transform((url) => {
        // Add https:// if no protocol is provided
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          return `https://${url}`;
        }
        return url;
      }),
    industry: z.string()
      .min(1, 'Please select an industry'),
    companySize: z.string()
      .min(1, 'Please select company size')
  }),

  contact: z.object({
    fullName: z.string()
      .min(1, 'Full name is required')
      .max(100, 'Full name must be less than 100 characters')
      .regex(/^[a-zA-Z\s]*$/, 'Name should only contain letters and spaces'),
    jobTitle: z.string()
      .min(1, 'Job title is required')
      .max(100, 'Job title must be less than 100 characters'),
    email: z.string()
      .email('Please enter a valid email')
      .min(1, 'Email is required')
      .max(100, 'Email must be less than 100 characters'),
    phoneNumber: z.string()
      .min(1, 'Phone number is required')
      .max(20, 'Phone number must be less than 20 characters')
  }),

  collaboration: z.object({
    campaign: z.string().min(1, 'Please select a campaign'),
    
    supportTypes: z.array(z.string())
      .min(1, 'Please select at least one type of support'),
    
    contribution: z.string()
      .min(1, 'Contribution details are required')
      .max(500, 'Contribution description cannot be longer than 500 characters'),
    
    impact: z.string()
      .min(1, 'Impact description is required')
      .max(500, 'Impact description cannot be longer than 500 characters'),
    
    comments: z.string().optional(),
    
    agreement: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to share information' }),
    })
  })
};