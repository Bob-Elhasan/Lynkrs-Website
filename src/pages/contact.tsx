import { useState, type FormEvent } from 'react';

import { MirrorSection, Prose } from '@/components/mirror/primitives';
import { MagneticCta } from '@/components/layout/magnetic-cta';
import { Seo } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { closing } from '@/content/journey';
import { siteConfig } from '@/content/site';

type Status = 'idle' | 'submitting' | 'sent' | 'error';

const OBJECTIVES = [
  'More qualified leads',
  'Lower cost per customer',
  'Grow organic revenue',
  'Fix the plan first',
  'Something else',
];

const BUDGETS = [
  'Under $5k / month',
  '$5k – $15k / month',
  '$15k – $50k / month',
  'Over $50k / month',
  'Not sure yet',
];

const CHANNELS = ['Paid media', 'SEO', 'Content and social', 'CRM and automation', 'None yet'];

/**
 * The lead capture form.
 *
 * Deliberately plain DOM rather than spatial UI: leads are the business
 * outcome, so capture must survive a failed WebGL context, work with password
 * managers and autofill, and be reachable by keyboard and screen reader.
 *
 * Validation uses native constraints plus a submit-time check, so the browser
 * does the heavy lifting and there is no form library to ship. Six fields do
 * not justify one; revisit if this grows past a dozen.
 */
export default function ContactPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // Honeypot: real people never fill a hidden field.
    if (data.get('company_website_confirm')) {
      setStatus('sent');
      return;
    }

    const nextErrors: Record<string, string> = {};
    if (!String(data.get('name') ?? '').trim()) nextErrors.name = 'Tell us your name.';
    const email = String(data.get('email') ?? '').trim();
    if (!email) nextErrors.email = 'We need an email to reply to.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      nextErrors.email = 'That email does not look right.';
    if (!String(data.get('message') ?? '').trim())
      nextErrors.message = 'A line or two about what you are aiming at.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT;

    // With no endpoint configured the form hands off to email rather than
    // silently dropping an enquiry.
    if (!endpoint) {
      const subject = encodeURIComponent(`Growth audit — ${data.get('name')}`);
      const body = encodeURIComponent(
        [
          `Name: ${data.get('name')}`,
          `Email: ${email}`,
          `Company: ${data.get('company')}`,
          `Website: ${data.get('website')}`,
          `Objective: ${data.get('objective')}`,
          `Budget: ${data.get('budget')}`,
          `Channels: ${data.getAll('channels').join(', ')}`,
          '',
          String(data.get('message')),
        ].join('\n'),
      );
      window.location.href = `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;
      return;
    }

    setStatus('submitting');
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });
      if (!response.ok) throw new Error(`Request failed with ${response.status}`);
      form.reset();
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      <Seo title="Start a conversation" path="/contact" description={closing.body} />

      <MirrorSection className="pt-24 pb-8">
        <p className="text-brand-gold text-xs font-semibold tracking-[0.22em] uppercase">
          {closing.eyebrow}
        </p>
        <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {closing.headline}
        </h1>
        <Prose>{closing.body}</Prose>
      </MirrorSection>

      <MirrorSection className="pt-0">
        {status === 'sent' ? (
          <div className="border-brand/40 bg-brand/10 rounded-xl border p-8">
            <h2 className="font-display text-2xl font-semibold tracking-tight">Got it.</h2>
            <p className="text-muted-foreground mt-2">
              We will come back to you within one working day.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="grid max-w-2xl gap-6">
            <Field id="name" label="Your name" error={errors.name}>
              <Input id="name" name="name" autoComplete="name" required
                aria-invalid={Boolean(errors.name)} />
            </Field>

            <Field id="email" label="Work email" error={errors.email}>
              <Input id="email" name="email" type="email" autoComplete="email" required
                aria-invalid={Boolean(errors.email)} />
            </Field>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field id="company" label="Company">
                <Input id="company" name="company" autoComplete="organization" />
              </Field>
              <Field id="website" label="Website">
                <Input id="website" name="website" inputMode="url" placeholder="lynkrs.com" />
              </Field>
            </div>

            <Field id="objective" label="What are you aiming at?">
              <select
                id="objective"
                name="objective"
                defaultValue={OBJECTIVES[0]}
                className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-lg border px-3 text-sm focus-visible:ring-3 focus-visible:outline-none"
              >
                {OBJECTIVES.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>

            <Field id="budget" label="Monthly marketing budget">
              <select
                id="budget"
                name="budget"
                defaultValue={BUDGETS[4]}
                className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-lg border px-3 text-sm focus-visible:ring-3 focus-visible:outline-none"
              >
                {BUDGETS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>

            <fieldset>
              <legend className="text-sm font-medium">What is running today?</legend>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                {CHANNELS.map((channel) => (
                  <label key={channel} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="channels"
                      value={channel}
                      className="accent-primary size-4"
                    />
                    {channel}
                  </label>
                ))}
              </div>
            </fieldset>

            <Field id="message" label="What are you trying to fix?" error={errors.message}>
              <Textarea id="message" name="message" rows={5} required
                aria-invalid={Boolean(errors.message)} />
            </Field>

            {/* Honeypot. Hidden from people, irresistible to bots. */}
            <div aria-hidden="true" className="absolute -left-[9999px]">
              <label htmlFor="company_website_confirm">Leave this empty</label>
              <input id="company_website_confirm" name="company_website_confirm" tabIndex={-1}
                autoComplete="off" />
            </div>

            {status === 'error' ? (
              <p role="alert" className="text-destructive text-sm">
                That did not go through. Try again, or email {siteConfig.email} directly.
              </p>
            ) : null}

            <MagneticCta className="w-full sm:w-auto">
              <Button type="submit" size="lg" className="h-11 w-full sm:w-auto sm:px-8"
                disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Sending…' : 'Book a growth audit'}
              </Button>
            </MagneticCta>
          </form>
        )}
      </MirrorSection>
    </>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}
