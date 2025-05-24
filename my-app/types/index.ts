import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

//social type
export type socialType = 'telegram' | 'website' | 'twitter' | 'tiktok' | 'instagram';

// Medals type
export type MedalType = 'bonding' | '100k' | '250k' | '500k' | '1M' | '10M' | '50M' | '100M' | '250M' | '500M' | '1B';