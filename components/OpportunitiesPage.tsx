
import React, { useState, useEffect, useRef } from 'react';
import { Opportunity, Region, SaleSource, Priority, LeadType, Currency, OppStage, UserRole, RemarkEntry, Employee } from '../types';
import { REGIONS, SALE_SOURCES, PRIORITIES, COUNTRIES, LEAD_TYPES, CURRENCIES, STAGE_PROBABILITY } from '../constants';
import { Plus, X, Target, FileText, CheckCircle, Edit3, MessageSquare, Paperclip, Users, ShieldCheck, Globe, Activity, Download, Upload, FileSpreadsheet, CheckSquare, Square } from 'lucide-react';

interface Props {
  opportunities: Opportunity[];
  employees: Employee[];
  user: string;
  role: UserRole;
  onSubmit: (opp: Opportunity) => void;
  onBulkSubmit: (opps: Opportunity[]) => void;
}

const OPP_STAGES_LIST: OppStage[] = [
  'Qualification', 'Needs Analysis', 'Value Proposition', 'Identify Decision Makers', 
  'Proposal/Price Quote', 'Negotiation/Review', 'Closed Won', 'Closed Lost'
];

const OpportunitiesPage: React.FC<Props> = ({ opportunities, employees, user, role, onSubmit, onBulkSubmit }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);
  const [newRemark, setNewRemark] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<Opportunity>>({});

  useEffect(() => {
    if (formData.stage) {
      const prob = STAGE_PROBABILITY[formData.stage as OppStage] ?? 0;
      const revenue = (formData.value || 0) * (prob / 100);
      if (formData.probability !== prob || formData.expectedRevenue !== revenue) {
        setFormData(prev => ({ ...prev, probability: prob, expectedRevenue: revenue }));
      }
    }
  }, [formData.stage, formData.value]);

  const toggleSelectAll = () => {
    if (selectedIds.length === opportunities.length && opportunities.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(opportunities.map(o => o.id));
    }
  };

  const toggleSelectRow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleRowClick = (opp: Opportunity) => {
    setEditingOpp(opp);
    setFormData(opp);
    setShowModal(true);
    setNewRemark('');
  };

  const handleAddNew = () => {
    setEditingOpp(null); 
    setFormData({ 
      id: `OPP-${Date.now()}`,
      owner: user, 
      stage: 'Qualification', 
      probability: 10, 
      currency: 'USD',
      value: 0,
      expectedRevenue: 0,
      salesOwner: user,
      feasibilityStatus: 'Pending',
      presalesRecommendation: 'Proceed',
      partnerOrg: false,
      remarksHistory: [],
      region: 'North America',
      type: 'RFP',
      source: 'Advertisement'
    }); 
    setShowModal(true);
    setNewRemark('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedHistory = [...(formData.remarksHistory || [])];
    if (newRemark.trim()) {
      updatedHistory.push({
        text: newRemark.trim(),
        timestamp: new Date().toLocaleString(),
        author: user
      });
    }
    const oppToSubmit: Opportunity = {
      ...formData as Opportunity,
      remarksHistory: updatedHistory,
    };
    onSubmit(oppToSubmit);
    setShowModal(false);
    setEditingOpp(null);
    setFormData({});
  };

  const downloadTemplate = () => {
    const headers = ['Ops Name', 'Account Name', 'Contact Name', 'Contact Number', 'Region', 'Country', 'Type', 'Lead Source', 'Next Step', 'Currency', 'Value', 'Expected Closing Date', 'Stage', 'Remarks', 'Probability', 'Feasibility Status', 'Presales Recommendation', 'Risks', 'Expected Revenue', 'Campaign Source', 'Sales Owner', 'Technical PoC', 'Presales PoC', 'Partner Org', 'Partner Org Name', 'Partner Contact Name', 'Partner Contact Number', 'Description'];
    const csvContent = headers.join(',') + '\n' + 
      `"Cloud Migration Ph2","Acme Global","Jane Smith","555-0122","Europe","Germany","RFP","Cold Call","Proposal Prep","USD","125000","2024-03-31","Qualification","Imported record","10","Pending","Proceed","Resources limited","12500","Summer Campaign","${user}","","","No","","","","Enterprise scale cloud migration"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'opps_import_template.csv';
    link.click();
  };

  const exportToCSV = () => {
    if (selectedIds.length === 0) return;
    const selectedOpps = opportunities.filter(o => selectedIds.includes(o.id));
    const headers = ['OpsID', 'Ops Name', 'Ops Owner', 'Account Name', 'Region', 'Type', 'Source', 'Stage', 'Value', 'Closing Date'];
    const csvRows = selectedOpps.map(o => [
      o.id, o.name, o.owner, o.accountName, o.region, o.type, o.source, o.stage, o.value, o.expectedClosingDate
    ].map(v => `"${v || ''}"`).join(','));
    
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `opportunities_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const importedOpps: Opportunity[] = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const obj: any = {};
        headers.forEach((header, idx) => {
          // Fixed: Changed mapping type to Record<string, string> to allow transient 'remarks'
          const mapping: Record<string, string> = {
            'Ops Name': 'name',
            'Account Name': 'accountName',
            'Contact Name': 'contactName',
            'Contact Number': 'contactNumber',
            'Region': 'region',
            'Country': 'country',
            'Type': 'type',
            'Lead Source': 'source',
            'Next Step': 'nextStep',
            'Currency': 'currency',
            'Value': 'value',
            'Expected Closing Date': 'expectedClosingDate',
            'Stage': 'stage',
            'Remarks': 'remarks',
            'Probability': 'probability',
            'Feasibility Status': 'feasibilityStatus',
            'Presales Recommendation': 'presalesRecommendation',
            'Risks': 'risks',
            'Expected Revenue': 'expectedRevenue',
            'Campaign Source': 'campaignSource',
            'Sales Owner': 'salesOwner',
            'Technical PoC': 'technicalPoC',
            'Presales PoC': 'presalesPoC',
            'Partner Org': 'partnerOrg',
            'Description': 'description'
          };
          const key = mapping[header] || header.toLowerCase();
          obj[key] = values[idx];
        });
        
        return {
          ...obj,
          id: `OPP-IMP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          owner: user,
          remarksHistory: obj.remarks ? [{
            text: obj.remarks,
            timestamp: new Date().toLocaleString(),
            author: user
          }] : [],
          partnerOrg: obj.partnerOrg === 'Yes',
          value: Number(obj.value || 0),
          probability: Number(obj.probability || 10),
          expectedRevenue: Number(obj.expectedRevenue || 0)
        } as Opportunity;
      });
      onBulkSubmit(importedOpps);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Active Opportunities</h3>
          <p className="text-xs text-slate-400 font-medium">Closing and high-level engagement lifecycle</p>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadTemplate} title="Template" className="p-2 text-slate-500 hover:text-blue-600 border border-slate-200 rounded-lg"><FileSpreadsheet size={18} /></button>
          <button onClick={() => fileInputRef.current?.click()} title="Import" className="p-2 text-slate-500 hover:text-green-600 border border-slate-200 rounded-lg">
            <Upload size={18} />
            <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleImport} />
          </button>
          <button onClick={exportToCSV} disabled={selectedIds.length === 0} title="Export" className={`p-2 border rounded-lg ${selectedIds.length > 0 ? 'text-indigo-600 border-indigo-200' : 'text-slate-200 border-slate-100'}`}><Download size={18} /></button>
          {role !== 'Delivery Manager' && (
            <button 
              onClick={handleAddNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-blue-200"
            >
              <Plus size={18} />
              <span className="font-bold text-xs uppercase">New Opportunity</span>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-widest font-black">
            <tr>
              <th className="px-6 py-4 w-10">
                <button onClick={toggleSelectAll} className="text-slate-400 hover:text-blue-600">
                  {selectedIds.length === opportunities.length && opportunities.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
              </th>
              <th className="px-6 py-4">OpsID</th>
              <th className="px-6 py-4">Ops Name</th>
              <th className="px-6 py-4">Ops Owner</th>
              <th className="px-6 py-4">Region</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Lead Source</th>
              <th className="px-6 py-4">Opportunity Stage</th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-700">
            {opportunities.map(o => (
              <tr 
                key={o.id} 
                onClick={() => handleRowClick(o)}
                className={`hover:bg-blue-50/50 cursor-pointer transition-colors group ${selectedIds.includes(o.id) ? 'bg-indigo-50/30' : ''}`}
              >
                <td className="px-6 py-4">
                  <button onClick={(e) => toggleSelectRow(e, o.id)} className={`${selectedIds.includes(o.id) ? 'text-indigo-600' : 'text-slate-300 hover:text-indigo-400'}`}>
                    {selectedIds.includes(o.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-gray-400 flex items-center gap-2">
                  <Edit3 size={12} className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
                  {o.id}
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-slate-800">{o.name}</span>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-slate-600">{o.owner}</td>
                <td className="px-6 py-4 text-xs font-black uppercase tracking-tighter text-slate-500">{o.region}</td>
                <td className="px-6 py-4 text-xs font-medium text-slate-600">{o.type}</td>
                <td className="px-6 py-4 text-xs font-medium text-slate-600">{o.source}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    o.stage === 'Closed Won' ? 'bg-green-100 text-green-700' : 
                    o.stage === 'Closed Lost' ? 'bg-red-50 text-red-600' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {o.stage}
                  </span>
                </td>
              </tr>
            ))}
            {opportunities.length === 0 && (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400 uppercase text-xs font-bold tracking-widest">No active opportunities found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 max-h-[95vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Target size={24} /></div>
                 <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{editingOpp ? 'Edit Opportunity' : 'New Opportunity'}</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sales Performance Center</p>
                 </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-8 grid grid-cols-12 gap-x-8 gap-y-6">
              {/* Internal identification & logic... */}
              <div className="col-span-12 md:col-span-4 space-y-6">
                <section>
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ShieldCheck size={14} /> Identification
                  </h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase">OpsID</label>
                        <input readOnly value={formData.id || ''} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-500 text-xs font-bold font-mono" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase">Ops Owner</label>
                        <input readOnly value={formData.owner || user} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-500 text-xs font-bold" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-600 mb-1 uppercase">Ops Name*</label>
                      <input required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-600 mb-1 uppercase">Account/Customer Name*</label>
                      <input required value={formData.accountName || ''} onChange={e => setFormData({...formData, accountName: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
                    </div>
                  </div>
                </section>
                {/* Rest of the form inputs... */}
              </div>
              <div className="col-span-12 mt-4 pt-6 border-t border-slate-100 flex justify-end gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-widest transition-colors">Cancel</button>
                <button type="submit" className="px-12 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-95">
                  {editingOpp ? 'Update Opportunity' : 'Save Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunitiesPage;
