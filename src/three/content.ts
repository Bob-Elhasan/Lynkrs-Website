import { caseStudies } from '@/content/portfolio';
import { services } from '@/content/services';
import { siteConfig } from '@/content/site';
import { method } from '@/content/method';
import { positioning, principles, problem, together } from '@/content/journey';

/** One door in a corridor, and the room behind it. */
export type DoorContent = {
  label: string;
  roomCode: string;
  /** Board on the room's facing wall. */
  kicker: string;
  title: string;
  body: string;
  bullets: string[];
  /** Optional deep link out to the matching DOM page. */
  cta?: { label: string; to: string };
};

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
    body: `${s.emphasis} ${s.detail.intro}`,
    bullets: s.deliverables.slice(0, 4).map((d) => d.title),
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
      body: `${problem.lede} ${problem.body}`,
      bullets: problem.costs.map((c) => c.title),
    },
    {
      label: 'Positioning',
      roomCode: '102',
      kicker: positioning.number,
      title: positioning.title,
      body: `${positioning.lede} ${positioning.body}`,
      bullets: [positioning.stamp],
    },
    {
      label: 'How We Think',
      roomCode: '103',
      kicker: principles.number,
      title: principles.title,
      body: 'Four principles decide what we build, what we cut, and what we report.',
      bullets: principles.items.map((p) => p.title),
    },
    {
      label: 'How We Work',
      roomCode: '104',
      kicker: method.number,
      title: method.title,
      body: `${method.lede} ${method.body}`,
      bullets: method.steps.map((s) => s.title),
    },
    {
      label: 'Together',
      roomCode: '105',
      kicker: together.number,
      title: together.title,
      body: `${together.lede} ${together.body}`,
      bullets: together.steps.map((s) => s.title),
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
    body: `${study.summary} ${study.result}`,
    bullets: study.metrics.map((m) => `${m.value} ${m.label.replace('PLACEHOLDER — ', '')}`),
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
      body: 'Tell us what is happening now and we will tell you what it takes. Bring the messy version, the half-built plan, the number that will not move.',
      bullets: [siteConfig.email, siteConfig.address, 'Clear next steps within one working day'],
      cta: { label: 'Open the contact form', to: '/contact' },
    },
    {
      label: 'Growth Suite',
      roomCode: '402',
      kicker: '05',
      title: 'Start where you are',
      body: 'Four integrated products for different stages of growth, each handing over cleanly to the next.',
      bullets: ['Growth Diagnostics', 'Growth Launchpad', 'Growth Accelerate', 'Growth Scale'],
      cta: { label: 'See the Growth Suite', to: '/bundles' },
    },
  ],
};

export const floors: FloorContent[] = [journeyFloor, servicesFloor, clientsFloor, contactFloor];
