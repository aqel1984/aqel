'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { ContactFormData, ContactFormResponse } from '@/types/contact';
import { useForm } from '@/hooks/useForm';
import { useApi } from '@/hooks/useApi';
import { ValidationRule, PhoneNumber, ValidationResult } from '@/types/utils';

const contactValidationRules: Record<keyof ContactFormData, ValidationRule<any>> = {
  name: {
    validate: (value: string): ValidationResult => ({
      valid: Boolean(value.length >= 2),
      message: value.length < 2 ? 'Name must be at least 2 characters' : '',
    }),
    message: 'Please enter your name',
  },
  email: {
    validate: (value: string): ValidationResult => ({
      valid: Boolean(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)),
      message: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email address' : '',
    }),
    message: 'Please enter a valid email address',
  },
  message: {
    validate: (value: string): ValidationResult => ({
      valid: Boolean(value.length >= 10),
      message: value.length < 10 ? 'Message must be at least 10 characters' : '',
    }),
    message: 'Please enter your message',
  },
  phone: {
    validate: (value?: PhoneNumber): ValidationResult => ({
      valid: Boolean(!value || (value.countryCode && value.number && /^\+?[1-9]\d{1,14}$/.test(value.number))),
      message: value && (!value.countryCode || !value.number || !/^\+?[1-9]\d{1,14}$/.test(value.number))
        ? 'Invalid phone number format'
        : '',
    }),
    message: 'Please enter a valid phone number',
  },
  subject: {
    validate: (): ValidationResult => ({ valid: true, message: '' }),
    message: '',
  },
  address: {
    validate: (): ValidationResult => ({ valid: true, message: '' }),
    message: '',
  },
  company: {
    validate: (): ValidationResult => ({ valid: true, message: '' }),
    message: '',
  },
  preferredContact: {
    validate: (): ValidationResult => ({ valid: true, message: '' }),
    message: '',
  },
  attachments: {
    validate: (): ValidationResult => ({ valid: true, message: '' }),
    message: '',
  },
  metadata: {
    validate: (): ValidationResult => ({ valid: true, message: '' }),
    message: '',
  },
};

const INITIAL_VALUES: ContactFormData = {
  name: '',
  email: '',
  message: '',
  phone: { countryCode: '', number: '' },
  preferredContact: 'email',
};

export default function ContactForm() {
  const { toast } = useToast();
  const api = useApi<ContactFormResponse>('/api');

  const {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  } = useForm<ContactFormData>({
    initialValues: INITIAL_VALUES,
    validationRules: contactValidationRules,
    onSubmit: async (formData) => {
      try {
        const response = await api.post('/contact', formData);
        if (response.success) {
          toast({
            title: 'Success!',
            description: 'Your message has been sent. We will get back to you soon.',
          });
          resetForm();
        } else {
          throw new Error(response.error?.message || 'Failed to send message');
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to send message',
          variant: 'destructive',
        });
      }
    },
  });

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Contact Us</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit} aria-label="Contact form">
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.name && errors.name ? 'border-destructive' : ''}
              aria-invalid={touched.name && errors.name ? 'true' : 'false'}
              aria-describedby={errors.name ? 'name-error' : undefined}
              required
            />
            {touched.name && errors.name && (
              <p id="name-error" className="text-sm text-destructive" role="alert">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.email && errors.email ? 'border-destructive' : ''}
              aria-invalid={touched.email && errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
              required
            />
            {touched.email && errors.email && (
              <p id="email-error" className="text-sm text-destructive" role="alert">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone-country">Phone (optional)</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                id="phone-country"
                name="phone.countryCode"
                type="text"
                placeholder="+1"
                value={values.phone?.countryCode || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.phone && errors.phone ? 'border-destructive' : ''}
                aria-label="Country code"
              />
              <Input
                id="phone-number"
                name="phone.number"
                type="tel"
                placeholder="123-456-7890"
                value={values.phone?.number || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`col-span-2 ${touched.phone && errors.phone ? 'border-destructive' : ''}`}
                aria-invalid={touched.phone && errors.phone ? 'true' : 'false'}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
              />
            </div>
            {touched.phone && errors.phone && (
              <p id="phone-error" className="text-sm text-destructive" role="alert">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label id="contact-method-label">Preferred Contact Method</Label>
            <RadioGroup
              value={values.preferredContact || 'email'}
              onValueChange={(value: 'email' | 'phone' | 'chat') => {
                handleChange({
                  target: {
                    name: 'preferredContact',
                    value,
                  },
                } as React.ChangeEvent<HTMLInputElement>);
              }}
              aria-labelledby="contact-method-label"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email-contact" />
                <Label htmlFor="email-contact">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="phone-contact" />
                <Label htmlFor="phone-contact">Phone</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              name="message"
              value={values.message}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                touched.message && errors.message ? 'border-destructive' : 'border-input'
              }`}
              rows={4}
              aria-invalid={touched.message && errors.message ? 'true' : 'false'}
              aria-describedby={errors.message ? 'message-error' : undefined}
              required
            />
            {touched.message && errors.message && (
              <p id="message-error" className="text-sm text-destructive" role="alert">{errors.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full"
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" aria-hidden="true" />
                Sending...
              </>
            ) : (
              'Send Message'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
