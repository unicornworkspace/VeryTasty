import { z } from 'zod';

// Auth schemas
export const OtpRequestSchema = z.object({
  phone: z.string().min(10, 'Введите корректный номер телефона').max(16),
});

export const OtpVerifySchema = z.object({
  phone: z.string().min(10, 'Введите корректный номер телефона').max(16),
  otp_code: z.string().length(6, 'Код должен состоять из 6 цифр').regex(/^\d{6}$/, 'Код должен содержать только цифры'),
});

// Contact form schema
export const ContactFormSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(200),
  phone: z.string().min(10, 'Введите корректный номер телефона').max(16),
  comment: z.string().optional().default(''),
});

// Checkout form schema
export const CheckoutFormSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(200),
  phone: z.string().min(10, 'Введите корректный номер телефона').max(16),
  comment: z.string().optional().default(''),
});

// Feedback form schema
export const FeedbackFormSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(200),
  phone: z.string().min(10, 'Введите корректный номер телефона').max(16),
  message: z.string().min(10, 'Сообщение должно содержать минимум 10 символов').max(1000),
});

// Promotion creation schema (admin)
export const PromotionFormSchema = z.object({
  title: z.string().min(2, 'Название должно содержать минимум 2 символа').max(200),
  description: z.string().optional().default(''),
  promotion_type: z.enum(['percent', 'fixed', 'code']),
  discount_value: z.string().min(1, 'Укажите значение скидки'),
  start_at: z.string().min(1, 'Укажите дату начала'),
  end_at: z.string().min(1, 'Укажите дату окончания'),
  audience_type: z.enum(['guest', 'new', 'all']).default('all'),
});

// Type helpers
export type OtpRequestData = z.infer<typeof OtpRequestSchema>;
export type OtpVerifyData = z.infer<typeof OtpVerifySchema>;
export type ContactFormData = z.infer<typeof ContactFormSchema>;
export type CheckoutFormData = z.infer<typeof CheckoutFormSchema>;
export type FeedbackFormData = z.infer<typeof FeedbackFormSchema>;
export type PromotionFormData = z.infer<typeof PromotionFormSchema>;
