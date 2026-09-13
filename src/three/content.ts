import { caseStudies } from '@/content/portfolio';
import { services } from '@/content/services';
import { siteConfig } from '@/content/site';
import { positioning, principles, problem, together } from '@/content/journey';

export type DoorContent = {
  label: string;
  roomCode: string;
  title: string;
  body: string;
  accent: string;
  cta?: { label: string; to: string };
};

export type FloorContent = {
  id: 'journey' | 'services' | 'clients' | 'contact';
  buttonLabel: string;
  floorNumber: string;
  signage: string;
  doors: DoorContent[];
};

const ACCENTS = ['#c8a85c', '#7db9ff', '#d8f24d', '#cc9cff'];

const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug)!;

export const journeyFloor: FloorContent = {
  id: 'journey',
  buttonLabel: 'Our Journey',
  floorNumber: '01',
  signage: 'L — 01 · OUR JOURNEY',
  doors: [
    {
      label: 'The Problem',
      roomCode: '101',
      title: 'The problem',
      body: `${problem.lede} ${problem.body} ${problem.resolution}`,
      accent: ACCENTS[0],
    },
    {
      label: 'Our Positioning',
      roomCode: '102',
      title: 'Our positioning',
      body: `${positioning.lede} ${positioning.body} ${positioning.stamp}`,
      accent: ACCENTS[1],
    },
    {
      label: 'How We Think',
      roomCode: '103',
      title: 'How we think',
      body: principles.items.map((item) => `${item.title}.`).join(' '),
      accent: ACCENTS[2],
    },
    {
      label: 'How We Work',
      roomCode: '104',
      title: 'How we work together',
      body: `${together.lede} ${together.body} ${together.stamp}`,
      accent: ACCENTS[3],
    },
  ],
};

export const servicesFloor: FloorContent = {
  id: 'services',
  buttonLabel: 'Our Services',
  floorNumber: '02',
  signage: 'L — 02 · OUR SERVICES',
  doors: [
    {
      label: 'Content',
      roomCode: '201',
      title: serviceBySlug('content').name,
      body: `${serviceBySlug('content').emphasis} ${serviceBySlug('content').detail.intro}`,
      accent: ACCENTS[0],
      cta: { label: 'Explore content & brand', to: '/services/content' },
    },
    {
      label: 'Media Buying',
      roomCode: '202',
      title: serviceBySlug('performance').name,
      body: `${serviceBySlug('performance').emphasis} ${serviceBySlug('performance').detail.intro}`,
      accent: ACCENTS[1],
      cta: { label: 'Explore performance & media', to: '/services/performance' },
    },
    {
      label: 'SEO',
      roomCode: '203',
      title: serviceBySlug('seo').name,
      body: `${serviceBySlug('seo').emphasis} ${serviceBySlug('seo').detail.intro}`,
      accent: ACCENTS[2],
      cta: { label: 'Explore the SEO system', to: '/services/seo' },
    },
    {
      label: 'Consultancy',
      roomCode: '204',
      title: serviceBySlug('consultancy').name,
      body: `${serviceBySlug('consultancy').emphasis} ${serviceBySlug('consultancy').detail.intro}`,
      accent: ACCENTS[3],
      cta: { label: 'Explore consultancy', to: '/services/consultancy' },
    },
  ],
};

export const clientsFloor: FloorContent = {
  id: 'clients',
  buttonLabel: 'Our Clients',
  floorNumber: '03',
  signage: 'L — 03 · OUR CLIENTS',
  doors: caseStudies.slice(0, 4).map((study, i) => ({
    label: study.client.replace('PLACEHOLDER — ', ''),
    roomCode: `30${i + 1}`,
    title: study.title,
    body: `${study.summary} ${study.result}`,
    accent: ACCENTS[i % ACCENTS.length],
    cta: { label: 'Read the case study', to: `/portfolio/${study.slug}` },
  })),
};

export const contactFloor: FloorContent = {
  id: 'contact',
  buttonLabel: 'Contact Us',
  floorNumber: '04',
  signage: 'L — 04 · CONTACT US',
  doors: [
    {
      label: 'Start a Conversation',
      roomCode: '401',
      title: 'Ready to talk?',
      body: `Tell us what is happening now and we will help you see the next right move. ${siteConfig.email} — ${siteConfig.address}.`,
      accent: ACCENTS[0],
      cta: { label: 'Open the contact form', to: '/contact' },
    },
  ],
};

export const floors: FloorContent[] = [journeyFloor, servicesFloor, clientsFloor, contactFloor];
