
import { Region, SaleSource, SaleStatus, LeadType, Priority, Currency, OppStage, ActionStatus, LeadStatus } from './types';

export const REGIONS: Region[] = [
  'Atlantic', 'Asia Pacific', 'Europe', 'North America', 'South America', 'Middle East', 'Africa', 'Oceania'
];

export const SALE_SOURCES: SaleSource[] = [
  'Advertisement', 'Cold Call', 'Employee Referral', 'External Referral', 'Online Store',
  'Partner', 'Public Relations', 'Sales Email Alias', 'Seminar Partner', 'Internal Seminar',
  'Trade Show', 'Web Download', 'Web Research', 'Chat'
];

export const LEAD_STATUSES: LeadStatus[] = [
  'Attempted to Contact', 'Contact in Future', 'Contacted', 'Junk Lead', 
  'Lost Lead', 'Not Contacted', 'Pre Qualified', 'Not Qualified', 'Qualified',
  'In Feasibility Study'
];

export const STATUSES: SaleStatus[] = [
  'Attempted to Contact', 'Contact in Future', 'Contacted', 'Junk Lead', 
  'Lost Lead', 'Not Contacted', 'Pre Qualified', 'Not Qualified', 'Qualified',
  'In Feasibility Study'
];

export const LEAD_TYPES: LeadType[] = ['RFP', 'RFI', 'RFQ', 'PoC', 'Demo'];

export const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];

export const CURRENCIES: Currency[] = ['USD', 'INR', 'AED', 'CAD'];

export const OPP_STAGES: OppStage[] = [
  'Qualification', 'Needs Analysis', 'Value Proposition', 'Identify Decision Makers', 
  'Proposal/Price Quote', 'Negotiation/Review', 'Closed Won', 'Closed Lost',
  'SOW Creation', 'SOW Accepted', 'Project Kickoff'
];

export const ACTION_STATUSES: ActionStatus[] = [
  'Not Started', 'Deferred', 'In Progress', 'Completed', 'Waiting for input'
];

export const STAGE_PROBABILITY: Record<OppStage, number> = {
  'Qualification': 10,
  'Needs Analysis': 20,
  'Value Proposition': 40,
  'Identify Decision Makers': 60,
  'Proposal/Price Quote': 80,
  'Negotiation/Review': 90,
  'Closed Won': 100,
  'Closed Lost': 0,
  'SOW Creation': 95,
  'SOW Accepted': 100,
  'Project Kickoff': 100
};

export const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "India", "Germany", 
  "France", "United Arab Emirates", "Japan", "Singapore", "Brazil", "South Africa",
  "China", "South Korea", "Netherlands", "Switzerland", "Saudi Arabia", "Qatar"
];
