export const SITE_TITLE = 'OriginX AI Blog';
export const SITE_DESCRIPTION = 'AI Voice Agents & Automation for Enterprise';
export const SITE_URL = 'https://blog.originxai.com';
export const AUTHOR = 'Fahad Rahman';
export const AUTHOR_URL = 'https://www.linkedin.com/in/fahadrahman9/';

export const SOCIAL = {
  instagram: 'https://www.instagram.com/fahadibnakilur/',
  linkedin: 'https://www.linkedin.com/in/fahadrahman9/',
  twitter: 'https://x.com/aiorigine',
  youtube: 'https://www.youtube.com/@Fahad-j2j',
};

export const CATEGORIES = [
  'AI Voice Agents',
  'AI Automation',
  'Industry Playbooks',
  'AI Tools & Reviews',
  'AI Strategy',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CTA = {
  text: 'Book a Free Discovery Call',
  url: 'https://calendly.com/fahad-originxai/ai-agent-discovery',
};
