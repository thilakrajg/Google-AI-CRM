
import React, { useState, useRef } from 'react';
import { Lead, Region, SaleSource, Priority, LeadType, Currency, LeadStatus, UserRole, RemarkEntry, Employee } from '../types';
import { REGIONS, SALE_SOURCES, PRIORITIES, COUNTRIES, LEAD_TYPES, CURRENCIES, LEAD_STATUSES } from '../constants';
import { Plus, X, Search, FileText, CheckCircle2, History, MessageSquare, Edit3, UserCheck, Paperclip, Activity, Download, Upload, FileSpreadsheet, CheckSquare, Square } from 'lucide-react';

interface Props {
  leads: Lead[];
  employees: Employee[];
  user: string;
  role: UserRole;
  onSubmit: (lead: Lead) => void;
  onBulkSubmit: (leads: Lead[]) => void;
}

const LeadsPage: React.FC<Props> = ({ leads, employees, user, role, onSubmit, onBulkSubmit }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [newRemark, setNewRemark] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<Lead>>({});

  const toggleSelectAll = () => {
    if (selectedIds.length === leads.length && leads.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map(l => l.id));
    }
  };

  const toggleSelectRow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleRowClick = (lead: Lead) => {
    setEditingLead(lead);
    setFormData(lead);
    setShowModal(true);
    setNewRemark('');
  };

  const handleAddNew = () => {
    setEditingLead(null);
    setFormData({ 
      owner: user, 
      assignee: 'Unassigned',
      region: 'North America', 
      status: 'Not Contacted', 
      type: 'RFP', 
      source: 'Advertisement',
      currency: 'USD',
      startDate: new Date().toISOString().split('T')[0],
      remarksHistory: [],
      value: 0,
      expectedRevenue: 0,
      techFeasibility: 'Pending', 
      implementationFeasibility: 'Pending', 
      salesFeasibility: 'Pending' 
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
    const leadToSubmit: Lead = {
      ...formData as Lead,
      id: formData.id || `LD-${Date.now()}`,
      remarksHistory: updatedHistory,
    };
    onSubmit(leadToSubmit);
    setShowModal(false);
    setEditingLead(null);
    setFormData({});
  };

  const downloadTemplate = () => {
    const headers = ['Lead Assignee', 'Lead Name', 'Notes', 'Company Name', 'Contact Name', 'Contact Number', 'Region', 'Country', 'Type', 'Priority', 'Next Step', 'Lead Source', 'Lead Status', 'Remarks', 'Start Date', 'Closing Date', 'Currency', 'Value', 'Expected Revenue'];
    const csvContent = headers.join(',') + '\n' + 
      `"${user}","Global Expansion","Interested in cloud services","Acme Global","Jane Smith","555-0122","Europe","Germany","RFP","Medium","Schedule PoC","Online Store","Qualified","Converted from Sales","2023-10-01","2023-12-31","USD","50000","45000"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'leads_import_template.csv';
    link.click();
  };

  const exportToCSV = () => {
    if (selectedIds.length === 0) return;
    const selectedLeads = leads.filter(l => selectedIds.includes(l.id));
    const headers = ['Lead ID', 'Lead Owner', 'Lead Assignee', 'Lead Name', 'Company Name', 'Contact Name', 'Contact Number', 'Region', 'Country', 'Type', 'Priority', 'Next Step', 'Lead Source', 'Lead Status', 'Start Date', 'Closing Date', 'Value'];
    const csvRows = selectedLeads.map(l => [
      l.id, l.owner, l.assignee, l.name, l.companyName, l.contactName, l.contactNumber, l.region, l.country, l.type, l.priority, l.nextStep, l.source, l.status, l.startDate, l.closingDate, l.value
    ].map(v => `"${v || ''}"`).join(','));
    
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
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
      
      const importedLeads: Lead[] = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const obj: any = {};
        headers.forEach((header, idx) => {
          const mapping: Record<string, keyof Lead> = {
            'Lead Assignee': 'assignee',
            'Lead Name': 'name',
            'Notes': 'notes',
            'Company Name': 'companyName',
            'Contact Name': 'contactName',
            'Contact Number': 'contactNumber',
            'Region': 'region',
            'Country': 'country',
            'Type': 'type',
            'Priority': 'priority',
            'Next Step': 'nextStep',
            'Lead Source': 'source',
            'Lead Status': 'status',
            'Start Date': 'startDate',
            'Closing Date': 'closingDate',
            'Currency': 'currency',
            'Value': 'value',
            'Expected Revenue': 'expectedRevenue'
          };
          const key = mapping[header] || header.toLowerCase();
          obj[key] = values[idx];
        });
        
        return {
          ...obj,
          id: `LD-IMP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          owner: user,
          remarksHistory: obj.remarks ? [{
            text: obj.remarks,
            timestamp: new Date().toLocaleString(),
            author: user
          }] : [],
          techFeasibility: 'Pending',
          implementationFeasibility: 'Pending',
          salesFeasibility: 'Pending'
        } as Lead;
      });
      onBulkSubmit(importedLeads);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Leads Portfolio</h3>
          <p className="text-xs text-gray-400 font-medium">Conversion management and feasibility analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={downloadTemplate} title="Download Template" className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200">
            <FileSpreadsheet size={18} />
          </button>
          <button onClick={() => fileInputRef.current?.click()} title="Import CSV" className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-slate-200">
            <Upload size={18} />
            <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleImport} />
          </button>
          <button onClick={exportToCSV} disabled={selectedIds.length === 0} title="Export Selected" className={`p-2 rounded-lg transition-colors border ${selectedIds.length > 0 ? 'text-indigo-600 border-indigo-200 hover:bg-indigo-50' : 'text-slate-300 border-slate-100 cursor-not-allowed'}`}>
            <Download size={18} />
          </button>
          {role !== 'Delivery Manager' && (
            <button 
              onClick={handleAddNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-blue-200"
            >
              <Plus size={18} />
              <span className="font-bold text-xs uppercase">New Lead</span>
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
                  {selectedIds.length === leads.length && leads.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
              </th>
              <th className="px-6 py-4">Lead ID</th>
              <th className="px-6 py-4">Lead Name</th>
              <th className="px-6 py-4">Lead Owner</th>
              <th className="px-6 py-4">Region</th>
              <th className="px-6 py-4">Lead Type</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-700">
            {leads.map(l => (
              <tr 
                key={l.id} 
                onClick={() => handleRowClick(l)}
                className={`hover:bg-blue-50/50 cursor-pointer transition-colors group ${selectedIds.includes(l.id) ? 'bg-indigo-50/30' : ''}`}
              >
                <td className="px-6 py-4">
                  <button onClick={(e) => toggleSelectRow(e, l.id)} className={`${selectedIds.includes(l.id) ? 'text-indigo-600' : 'text-slate-300 hover:text-indigo-400'}`}>
                    {selectedIds.includes(l.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-gray-400 flex items-center gap-2">
                  <Edit3 size={12} className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
                  {l.id}
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-slate-800">{l.name}</span>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-slate-600">
                  {l.owner}
                </td>
                <td className="px-6 py-4 text-xs font-black uppercase tracking-tighter text-slate-500">
                  {l.region}
                </td>
                <td className="px-6 py-4 text-xs font-medium text-slate-600">
                  {l.type}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${
                    l.status === 'Qualified' ? 'bg-green-100 text-green-700' : 
                    l.status === 'Junk Lead' || l.status === 'Lost Lead' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {l.status}
                  </span>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-20 text-center text-gray-400 uppercase text-xs tracking-widest font-bold">Awaiting new lead generation</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 max-h-[95vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
              <div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{editingLead ? 'Manage Lead Portfolio' : 'Ingest New Lead'}</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">SightSpectrum Intelligence Unit</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-8 grid grid-cols-12 gap-x-8 gap-y-6">
              {/* Existing form inputs... */}
              <div className="col-span-12 md:col-span-4 space-y-6">
                <section>
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <UserCheck size={14} /> Identification
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Lead Owner</label>
                      <input readOnly value={formData.owner || user} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-500 text-sm font-bold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Lead Assignee</label>
                      <select required value={formData.assignee || ''} onChange={e => setFormData({...formData, assignee: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold bg-white">
                        <option value="">Select Assignee</option>
                        {employees.filter(e => e.status === 'Active').map(e => (
                          <option key={e.id} value={e.name}>{e.name} ({e.role})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Lead Name</label>
                      <input required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Project or Opportunity Title" />
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Search size={14} /> CRM Lookup
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Company / Customer</label>
                      <input required value={formData.companyName || ''} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Organization DB Lookup" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Contact Person</label>
                      <input required value={formData.contactName || ''} onChange={e => setFormData({...formData, contactName: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Contact DB Lookup" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Contact Number</label>
                      <input type="number" required value={formData.contactNumber || ''} onChange={e => setFormData({...formData, contactNumber: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none" placeholder="+X-XXX-XXX-XXXX" />
                    </div>
                  </div>
                </section>
              </div>

              <div className="col-span-12 md:col-span-4 space-y-6">
                <section>
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Activity size={14} /> Classification
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Region</label>
                      <select value={formData.region} onChange={e => setFormData({...formData, region: e.target.value as Region})} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none">
                        {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Country</label>
                      <select value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none">
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Lead Type</label>
                      <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as LeadType})} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none">
                        {LEAD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Priority</label>
                      <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as Priority})} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none">
                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Lead Source</label>
                      <select value={formData.source} onChange={e => setFormData({...formData, source: e.target.value as SaleSource})} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none">
                        {SALE_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </section>
                <section>
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <FileText size={14} /> Finance & Dates
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Currency</label>
                      <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value as Currency})} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none">
                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Deal Value</label>
                      <input type="number" required value={formData.value || 0} onChange={e => setFormData({...formData, value: Number(e.target.value)})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black text-blue-600 focus:ring-2 focus:ring-blue-100 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Start Date</label>
                      <input type="date" required value={formData.startDate || ''} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Closing Date</label>
                      <input type="date" required value={formData.closingDate || ''} onChange={e => setFormData({...formData, closingDate: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                    </div>
                  </div>
                </section>
              </div>

              <div className="col-span-12 md:col-span-4 space-y-6">
                <section>
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <History size={14} /> Pipeline Strategy
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Lead Status</label>
                      <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as LeadStatus})} className="w-full border-2 border-blue-100 rounded-xl px-3 py-2.5 text-xs font-black text-blue-700 outline-none bg-blue-50/30">
                        {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Next Step</label>
                      <input value={formData.nextStep || ''} onChange={e => setFormData({...formData, nextStep: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Required Action Item" />
                    </div>
                  </div>
                </section>

                <section className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <MessageSquare size={14} /> Remarks Log
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">New Remark (Submit to Log)</label>
                      <textarea rows={2} value={newRemark} onChange={e => setNewRemark(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none resize-none" placeholder="Type notes to add to history..." />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                      {formData.remarksHistory && formData.remarksHistory.length > 0 ? (
                        [...formData.remarksHistory].reverse().map((entry, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                            <p className="text-xs text-slate-800 leading-relaxed font-medium">{entry.text}</p>
                            <div className="flex justify-between items-center mt-2 border-t pt-2 border-slate-50">
                              <span className="text-[9px] font-black text-blue-500 uppercase">{entry.author}</span>
                              <span className="text-[9px] font-bold text-slate-400">{entry.timestamp}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-slate-400 text-center py-4 uppercase font-bold tracking-widest italic">No historical remarks</p>
                      )}
                    </div>
                  </div>
                </section>
              </div>

              <div className="col-span-12 mt-4 pt-6 border-t border-slate-100 flex justify-between items-center">
                <div className="flex gap-4 ml-auto">
                  <button type="button" onClick={() => setShowModal(false)} className="px-8 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-widest transition-colors">Abort</button>
                  <button type="submit" className="px-10 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-95">
                    {editingLead ? 'Execute Update' : 'Initialize Lead'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsPage;
