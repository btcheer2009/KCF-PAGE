/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Notice {
  id: string;
  category: 'competition' | 'education' | 'selection' | 'general' | 'admin';
  title: string;
  content: string;
  date: string;
  views: number;
  isImportant?: boolean;
}

export interface CheerTeam {
  id: string;
  name: string;
  category: string;
  region: string;
  memberCount: number;
  coach: string;
  established: string;
  description: string;
  contact: string;
}

export interface KCFEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  location: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  description: string;
}

export interface InquirySubmission {
  id: string;
  name: string;
  contact: string;
  email: string;
  type: 'competition' | 'coaching' | 'team_reg' | 'general';
  subject: string;
  message: string;
  date: string;
  status: 'received' | 'in_progress' | 'replied';
}

export interface SafetyRule {
  id: string;
  level: string; // Level 1 to 5
  category: 'stunt' | 'pyramid' | 'toss' | 'tumbling';
  title: string;
  rules: string[];
  tips: string;
  difficulty: 'low' | 'medium' | 'high' | 'expert';
}

export interface Athlete {
  id: string;
  name: string;
  regNumber: string;
  birthDate: string;
  gender: '남' | '여';
  teamName: string;
  category: string;
  level: string;
  registerDate: string;
  validUntil: string;
  status: '정상등록' | '갱신필요' | '정지';
  imageUrl?: string;
}

export interface AssociationInfo {
  officeName: string;
  address: string;
  phone: string;
  fax: string;
  email: string;
  permitNumber: string;
  businessNumber: string;
  representative: string;
}

export interface CompetitionPost {
  id: string;
  category: 'domestic' | 'international';
  title: string;
  content: string;
  date: string;
  views: number;
  imageUrl?: string;
  organizer?: string;
  location?: string;
  compDate?: string;
}

export interface DonationRecord {
  id: string;
  year: number;
  donationAmount: string;
  usedAmount: string;
  usageDetails: string;
  status: 'public' | 'pending' | 'private';
  docUrl?: string;
}

export interface RelatedLink {
  label: string;
  url: string;
  desc?: string;
}

export interface HomepageContent {
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  aboutText: string;
  donationDisclosure: string;
  relatedLinks: RelatedLink[];
  updatedAt?: string;
}




