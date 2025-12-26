
export type Region = 'Atlantic' | 'Asia Pacific' | 'Europe' | 'North America' | 'South America' | 'Middle East' | 'Africa' | 'Oceania';
export type Priority = 'Low' | 'Medium' | 'High';
export type Currency = 'USD' | 'INR' | 'AED' | 'CAD';
export type LeadType = 'RFP' | 'RFI' | 'RFQ' | 'PoC' | 'Demo';

export type UserRole = 
  | 'Super Admin' 
  | 'Admin/Founder' 
  | 'Presales Consultant' 
  | 'Presales Lead' 
  | 'Presales Manager' 
  | 'Sales Head' 
  | 'Delivery Manager';

export type SaleSource = 
  | 'Advertisement' | 'Cold Call' | 'Employee Referral' | 'External Referral' | 'Online Store'
  | 'Partner' | 'Public Relations' | 'Sales Email Alias' | 'Seminar Partner' | 'Internal Seminar'
  | 'Trade Show' | 'Web Download' | 'Web Research' | 'Chat';

export type SaleStatus = 
  | 'Attempted to Contact' | 'Contact in Future' | 'Contacted' | 'Junk Lead' 
  | 'Lost Lead' | 'Not Contacted' | 'Pre Qualified' | 'Not Qualified' | 'Qualified'
  | 'In Feasibility Study';

export type LeadStatus = 
  | 'Attempted to Contact' 
  | 'Contact in Future' 
  | 'Contacted' 
  | 'Junk Lead' 
  | 'Lost Lead' 
  | 'Not Contacted' 
  | 'Pre Qualified' 
  | 'Not Qualified' 
  | 'Qualified'
  | 'In Feasibility Study';

export type OppStage = 
  | 'Qualification' | 'Needs Analysis' | 'Value Proposition' | 'Identify Decision Makers' 
  | 'Proposal/Price Quote' | 'Negotiation/Review' | 'Closed Won' | 'Closed Lost'
  | 'SOW Creation' | 'SOW Accepted' | 'Project Kickoff';

export type ActionStatus = 
  | 'Not Started' | 'Deferred' | 'In Progress' | 'Completed' | 'Waiting for input';

export interface RemarkEntry {
  text: string;
  timestamp: string;
  author: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  regions: Region[];
}

export interface Sale {
  id: string;
  owner: string;
  assignee: string;
  date: string;
  clientName: string;
  contactName: string;
  contactNumber: string;
  region: Region;
  country: string;
  priority: Priority;
  nextStep: string;
  source: SaleSource;
  status: SaleStatus;
  remarks: string;
}

export interface Lead {
  id: string;
  owner: string;
  assignee: string;
  name: string;
  notes: string;
  companyName: string;
  contactName: string;
  contactNumber: string;
  region: Region;
  country: string;
  type: LeadType;
  priority: Priority;
  nextStep: string;
  source: SaleSource;
  status: LeadStatus;
  remarksHistory: RemarkEntry[];
  startDate: string;
  closingDate: string;
  currency: Currency;
  value: number;
  expectedRevenue: number;
  techFeasibility: 'Pending' | 'Feasible' | 'Not Feasible';
  implementationFeasibility: 'Pending' | 'Feasible' | 'Not Feasible';
  salesFeasibility: 'Pending' | 'Feasible' | 'Not Feasible';
}

export interface Opportunity {
  id: string; // OpsID
  owner: string; // Ops Owner
  name: string; // Ops Name
  accountName: string;
  contactName: string;
  contactNumber: string;
  region: Region;
  country: string;
  type: LeadType;
  source: SaleSource;
  nextStep: string;
  currency: Currency;
  value: number;
  expectedClosingDate: string;
  stage: OppStage;
  remarksHistory: RemarkEntry[];
  probability: number;
  feasibilityStatus: 'Pending' | 'Feasible' | 'Not Feasible';
  presalesRecommendation: 'Proceed' | 'Hold' | 'Drop';
  risks: string;
  expectedRevenue: number;
  campaignSource: string;
  salesOwner: string;
  technicalPoC: string;
  presalesPoC: string;
  partnerOrg: boolean;
  partnerOrgName?: string;
  partnerContactName?: string;
  partnerContactNumber?: string;
  description: string;
}

export interface ActionItem {
  id: string;
  owner: string;
  assignee: string;
  subject: string;
  dueDate: string;
  actionType: 'Lead' | 'Opportunity';
  linkedRecordId: string;
  region: Region;
  priority: Priority;
  status: ActionStatus;
  remarks: string;
  description: string;
}
