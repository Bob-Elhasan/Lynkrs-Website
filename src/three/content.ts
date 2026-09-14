import type { Slide } from './textures';
import { caseStudies } from '@/content/portfolio';
import { services } from '@/content/services';
import { siteConfig } from '@/content/site';
import { method } from '@/content/method';
import { positioning, principles, problem, together } from '@/content/journey';

/** One door in a corridor, and the room behind it. */
export type DoorContent = {
  label: string;
  roomCode: string;
  kicker: string;
  title: string;
  /** Projected in sequence inside the room; scrolled through one at a time. */
  slides: Slide[];
  /** Optional deep link out to the matching DOM page. */
  cta?: { label: string; to: string };
};

/** Splits a body and a bullet list into readable projector slides. */
function toSlides(kicker: string, title: string, body: string, bullets: string[]): Slide[] {
  const slides: Slide[] = [{ kicker, title, body }];
  // Bullets land three to a slide: more than that and the projection gets
  // dense enough that you stop reading it.
  for (let i = 0; i < bullets.length; i += 3) {
    slides.push({ kicker, title: i === 0 ? 'What it covers' : 'Continued', bullets: bullets.slice(i, i + 3) });
  }
  return slides;
}

export type FloorContent = {
  id: 'journey' | 'services' | 'clients' | 'contact';
  buttonLabel: string;
  floorNumber: string;
  signage: string;
  /** Shown on the corridor's end wall, past the last door. */
  closing: string;
  doors: DoorContent[];
};

const service = (slug: string) => services.find((s) => s.slug === slug)!;

const serviceDoor = (slug: string, label: string, roomCode: string): DoorContent => {
  const s = service(slug);
  return {
    label,
    roomCode,
    kicker: s.code,
    title: s.name,
    slides: [
      { kicker: s.code, title: s.name, body: s.emphasis },
      { kicker: s.code, title: 'The work', body: s.detail.intro },
      ...toSlides(s.code, 'Deliverables', '', s.deliverables.map((d) => d.title)).slice(1),
      { kicker: s.code, title: 'This is for you if', bullets: s.detail.forYouIf },
      { kicker: s.code, title: '', statement: s.detail.outcome },
    ],
    cta: { label: `Open ${label}`, to: `/services/${slug}` },
  };
};

export const journeyFloor: FloorContent = {
  id: 'journey',
  buttonLabel: 'Our Journey',
  floorNumber: '01',
  signage: 'FLOOR 01 · OUR JOURNEY',
  closing: 'Growth is designed, not guessed.',
  doors: [
    {
      label: 'The Problem',
      roomCode: '101',
      kicker: problem.number,
      title: problem.title,
      slides: toSlides(problem.number, problem.title, `${problem.lede} ${problem.body}`, problem.costs.map((c) => c.title)),
    },
    {
      label: 'Positioning',
      roomCode: '102',
      kicker: positioning.number,
      title: positioning.title,
      slides: toSlides(positioning.number, positioning.title, `${positioning.lede} ${positioning.body}`, [positioning.stamp]),
    },
    {
      label: 'How We Think',
      roomCode: '103',
      kicker: principles.number,
      title: principles.title,
      slides: toSlides(principles.number, principles.title, 'Four principles decide what we build, what we cut, and what we report.', principles.items.map((p) => p.title)),
    },
    {
      label: 'How We Work',
      roomCode: '104',
      kicker: method.number,
      title: method.title,
      slides: toSlides(method.number, method.title, `${method.lede} ${method.body}`, method.steps.map((s) => s.title)),
    },
    {
      label: 'Together',
      roomCode: '105',
      kicker: together.number,
      title: together.title,
      slides: toSlides(together.number, together.title, `${together.lede} ${together.body}`, together.steps.map((s) => s.title)),
    },
  ],
};

export const servicesFloor: FloorContent = {
  id: 'services',
  buttonLabel: 'Our Services',
  floorNumber: '02',
  signage: 'FLOOR 02 · OUR SERVICES',
  closing: 'Three modules, one system.',
  doors: [
    serviceDoor('content', 'Content', '201'),
    serviceDoor('performance', 'Media Buying', '202'),
    serviceDoor('seo', 'SEO', '203'),
    serviceDoor('consultancy', 'Consultancy', '204'),
  ],
};

export const clientsFloor: FloorContent = {
  id: 'clients',
  buttonLabel: 'Our Clients',
  floorNumber: '03',
  signage: 'FLOOR 03 · OUR CLIENTS',
  closing: 'The work speaks in numbers.',
  doors: caseStudies.slice(0, 4).map((study, i) => ({
    label: study.client.replace('PLACEHOLDER — ', ''),
    roomCode: `30${i + 1}`,
    kicker: study.sector.replace('PLACEHOLDER — ', ''),
    title: study.title.replace('PLACEHOLDER — ', ''),
    slides: toSlides(study.sector.replace('PLACEHOLDER — ', ''), study.title.replace('PLACEHOLDER — ', ''), `${study.summary} ${study.result}`, study.metrics.map((m) => `${m.value} ${m.label.replace('PLACEHOLDER — ', '')}`)),
    cta: { label: 'Read the case study', to: `/portfolio/${study.slug}` },
  })),
};

export const contactFloor: FloorContent = {
  id: 'contact',
  buttonLabel: 'Contact Us',
  floorNumber: '04',
  signage: 'FLOOR 04 · CONTACT US',
  closing: 'Tell us what you are aiming at.',
  doors: [
    {
      label: 'Start a Conversation',
      roomCode: '401',
      kicker: 'Get in touch',
      title: 'Ready when you are',
      slides: toSlides('Get in touch', 'Ready when you are', 'Tell us what is happening now and we will tell you what it takes. Bring the messy version, the half-built plan, the number that will not move.', [siteConfig.email, siteConfig.address, 'Clear next steps within one working day']),
      cta: { label: 'Open the contact form', to: '/contact' },
    },
    {
      label: 'Growth Suite',
      roomCode: '402',
      kicker: '05',
      title: 'Start where you are',
      slides: toSlides('05', 'Start where you are', 'Four integrated products for different stages of growth, each handing over cleanly to the next.', ['Growth Diagnostics', 'Growth Launchpad', 'Growth Accelerate', 'Growth Scale']),
      cta: { label: 'See the Growth Suite', to: '/bundles' },
    },
  ],
};

export const floors: FloorContent[] = [journeyFloor, servicesFloor, clientsFloor, contactFloor];
