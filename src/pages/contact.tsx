import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { Seo } from '@/components/seo';
import { siteConfig } from '@/content/site';
import { PageHero, PageSection, SectionIntro } from '@/components/site/spatial-page';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`Growth conversation — ${data.get('name') || 'new enquiry'}`);
    const body = encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\nCompany: ${data.get('company')}\n\nWhat is happening: ${data.get('message')}`);
    setSent(true);
    window.location.href = `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;
  }
  return <div className="spatial-page"><Seo title="Start a growth conversation" path="/contact" description="Talk with Lynkrs about turning marketing spend into sustainable growth." /><PageHero number="09" eyebrow="Start a conversation" title={<>Ready to turn spend<br />into <em>growth?</em></>} lede="Tell us what is happening now. We will help you see the shape of the next right move, without a sales theatre performance." /><PageSection tone="yellow"><div className="contact-grid"><div><SectionIntro eyebrow="A useful first step" title={<>Bring the<br /><em>messy version.</em></>} body="We work as a strategic extension of our partners’ teams. Start with the objective, the friction, and the number you need to move." /><ul className="check-list check-list--large"><li><Check size={15} /> <span>Senior, direct thinking</span></li><li><Check size={15} /> <span>One connected growth system</span></li><li><Check size={15} /> <span>Clear next steps within one working day</span></li></ul></div><form className="conversation-form" onSubmit={handleSubmit}><label>Your name<input name="name" required placeholder="Your name" /></label><label>Work email<input name="email" type="email" required placeholder="you@company.com" /></label><label>Company<input name="company" placeholder="Company name" /></label><label>What is happening? <textarea name="message" required rows={5} placeholder="Tell us what you are trying to fix or grow." /></label><button type="submit">{sent ? 'Opening your email…' : 'Start the conversation'} <ArrowUpRight size={18} /></button></form></div></PageSection><PageSection tone="light"><div className="contact-footnote"><span>Prefer email?</span><a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></div></PageSection></div>;
}
