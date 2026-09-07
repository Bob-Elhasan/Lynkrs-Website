import { useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

import { Seo } from '@/components/seo';
import { Section } from '@/components/sections/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { siteConfig } from '@/lib/site';

type Status = 'idle' | 'submitting' | 'sent' | 'error';

export default function ContactPage() {
  const [status, setStatus] = useState<Status>('idle');

  /**
   * There is no backend yet. This posts to whatever endpoint you point
   * VITE_CONTACT_ENDPOINT at (Formspree, a worker, your own API) and falls back
   * to a mailto handoff when that variable is unset, so the form is never a
   * dead end in production.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT;

    if (!endpoint) {
      const subject = encodeURIComponent(`Walkthrough request — ${data.get('name')}`);
      const body = encodeURIComponent(
        `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nCompany: ${data.get('company')}\n\n${data.get('message')}`,
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
      <Seo
        title="Contact"
        path="/contact"
        description="Book a walkthrough. Bring one brand or the whole house and we will map the spine on the call."
      />

      <Section className="pt-16 sm:pt-20">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
              Contact
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Let us map your spine
            </h1>
            <p className="text-muted-foreground mt-5 text-lg leading-relaxed text-pretty">
              Thirty minutes. Bring your current plan and your last month of numbers. You will leave
              with a clear read on where the two disagree, whether or not you work with us.
            </p>
            <a
              href={`mailto:${siteConfig.email}`}
              className="text-muted-foreground hover:text-foreground mt-6 inline-block text-sm underline underline-offset-4 transition-colors"
            >
              {siteConfig.email}
            </a>
          </div>

          <div className="bg-card rounded-2xl border p-7 sm:p-8">
            {status === 'sent' ? (
              <div className="flex flex-col items-start gap-3 py-10">
                <CheckCircle2 className="text-primary size-8" />
                <h2 className="text-xl font-semibold tracking-tight">Got it</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We will come back to you within one business day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required autoComplete="name" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Work email</Label>
                  <Input id="email" name="email" type="email" required autoComplete="email" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" name="company" autoComplete="organization" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="message">What are you trying to connect?</Label>
                  <Textarea id="message" name="message" rows={5} required />
                </div>

                {status === 'error' ? (
                  <p className="text-destructive text-sm" role="alert">
                    That did not go through. Try again, or email us directly.
                  </p>
                ) : null}

                <Button
                  type="submit"
                  size="lg"
                  className="h-11 w-full text-[0.95rem]"
                  disabled={status === 'submitting'}
                >
                  {status === 'submitting' ? 'Sending…' : 'Book a walkthrough'}
                  {status === 'submitting' ? null : <ArrowRight />}
                </Button>
              </form>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
