
import React, { useState, useRef } from 'react';
import { Sale, Region, SaleSource, SaleStatus, Priority, UserRole, Employee } from '../types';
import { REGIONS, SALE_SOURCES, STATUSES, PRIORITIES, COUNTRIES } from '../constants';
import { Plus, X, Edit3, Download, Upload, FileSpreadsheet, CheckSquare, Square } from 'lucide-react';

interface Props {
  sales: Sale[];
  employees: Employee[];
  user: string;
  role: UserRole;
  onSubmit: (sale: Sale) => void;
  onBulkSubmit: (sales: Sale[]) => void;
}

const SalesPage: React.FC<Props> = ({ sales, employees, user, role, onSubmit, onBulkSubmit }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<Sale>>({
    owner: user,
    date: new Date().toISOString().split('T')[0],
    priority: 'Medium',
    status: 'Not Contacted',
    source: 'Advertisement',
    region: 'North America'
  });

  const handleRowClick = (sale: Sale) => {
    setEditingSale(sale);
    setFormData(sale);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingSale(null);
    setFormData({
      owner: user,
      date: new Date().toISOString().split('T')[0],
      priority: 'Medium',
      status: 'Not Contacted',
      source: 'Advertisement',
      region: 'North America'
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const saleToSubmit: Sale = {
      ...formData as Sale,
      id: editingSale ? editingSale.id : `SALE-${Date.now()}`
    };
    onSubmit(saleToSubmit);
    setShowModal(false);
    setEditingSale(null);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === sales.length && sales.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sales.map(s => s.id));
    }
  };

  const toggleSelectRow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const downloadTemplate = () => {
    const headers = ['Sale Owner', 'Sale Assignee', 'Sale Date', 'Client Name', 'Contact Name', 'Contact Number', 'Region', 'Country', 'Priority', 'Next Step', 'Sale Source', 'Sale Status', 'Remarks'];
    const csvContent = headers.join(',') + '\n' + 
      `"${user}","${user}","${new Date().toISOString().split('T')[0]}","Acme Corp","John Doe","555-0199","North America","United States","High","Draft Proposal","Advertisement","Not Contacted","Initial Outreach"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sales_import_template.csv';
    link.click();
  };

  const exportToCSV = () => {
    if (selectedIds.length === 0) return;
    const selectedSales = sales.filter(s => selectedIds.includes(s.id));
    const headers = ['Sale ID', 'Sale Owner', 'Sale Assignee', 'Sale Date', 'Client Name', 'Contact Name', 'Contact Number', 'Region', 'Country', 'Priority', 'Next Step', 'Sale Source', 'Sale Status', 'Remarks'];
    const csvRows = selectedSales.map(s => [
      s.id, s.owner, s.assignee, s.date, s.clientName, s.contactName, s.contactNumber, s.region, s.country, s.priority, s.nextStep, s.source, s.status, s.remarks
    ].map(v => `"${v || ''}"`).join(','));
    
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sales_export_${new Date().toISOString().split('T')[0]}.csv`;
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
      
      const importedSales: Sale[] = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const obj: any = {};
        headers.forEach((header, idx) => {
          const mapping: Record<string, keyof Sale> = {
            'Sale Owner': 'owner',
            'Sale Assignee': 'assignee',
            'Sale Date': 'date',
            'Client Name': 'clientName',
            'Contact Name': 'contactName',
            'Contact Number': 'contactNumber',
            'Region': 'region',
            'Country': 'country',
            'Priority': 'priority',
            'Next Step': 'nextStep',
            'Sale Source': 'source',
            'Sale Status': 'status',
            'Remarks': 'remarks'
          };
          const key = mapping[header] || header.toLowerCase();
          obj[key] = values[idx];
        });
        return {
          ...obj,
          id: `SALE-IMP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        } as Sale;
      });
      onBulkSubmit(importedSales);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Sales Activity</h3>
          <p className="text-xs text-gray-400 font-medium">Manage and track your primary sales reach-outs</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={downloadTemplate}
            title="Download CSV Template"
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
          >
            <FileSpreadsheet size={18} />
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            title="Import from CSV"
            className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-slate-200"
          >
            <Upload size={18} />
            <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleImport} />
          </button>
          <button 
            onClick={exportToCSV}
            disabled={selectedIds.length === 0}
            title="Export Selected to CSV"
            className={`p-2 rounded-lg transition-colors border ${selectedIds.length > 0 ? 'text-indigo-600 border-indigo-200 hover:bg-indigo-50' : 'text-slate-300 border-slate-100 cursor-not-allowed'}`}
          >
            <Download size={18} />
          </button>
          <button 
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-blue-200"
          >
            <Plus size={18} />
            <span className="font-bold text-xs uppercase">New Activity</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-widest font-black">
            <tr>
              <th className="px-6 py-4 w-10">
                <button onClick={toggleSelectAll} className="text-slate-400 hover:text-blue-600">
                  {selectedIds.length === sales.length && sales.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
              </th>
              <th className="px-6 py-4">Sale ID</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Region</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Next Step</th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-700">
            {sales.map(s => (
              <tr 
                key={s.id} 
                onClick={() => handleRowClick(s)}
                className={`hover:bg-blue-50/50 cursor-pointer transition-colors group ${selectedIds.includes(s.id) ? 'bg-indigo-50/30' : ''}`}
              >
                <td className="px-6 py-4">
                  <button onClick={(e) => toggleSelectRow(e, s.id)} className={`${selectedIds.includes(s.id) ? 'text-indigo-600' : 'text-slate-300 hover:text-indigo-400'}`}>
                    {selectedIds.includes(s.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-gray-400 flex items-center gap-2">
                  <Edit3 size={12} className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
                  {s.id}
                </td>
                <td className="px-6 py-4 font-bold text-slate-800">{s.clientName}</td>
                <td className="px-6 py-4">
                   <div className="flex flex-col">
                     <span className="font-medium">{s.contactName}</span>
                     <span className="text-[10px] text-gray-400 font-bold">{s.contactNumber}</span>
                   </div>
                </td>
                <td className="px-6 py-4 text-xs font-bold uppercase tracking-tighter text-slate-500">{s.region}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    s.status === 'Qualified' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-slate-500">{s.nextStep}</td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400 uppercase text-xs font-bold tracking-widest">No active sales records</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{editingSale ? 'Edit Sales Activity' : 'Create New Activity'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-2 gap-x-6 gap-y-5">
              <div className="col-span-1">
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Sale Owner</label>
                <input readOnly value={formData.owner || user} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-500 text-xs font-bold" />
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Sale Assignee</label>
                <select required value={formData.assignee || ''} onChange={e => setFormData({...formData, assignee: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-blue-100">
                  <option value="">Select Assignee</option>
                  {employees.filter(e => e.status === 'Active').map(e => (
                    <option key={e.id} value={e.name}>{e.name} ({e.role})</option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Client / Account Name*</label>
                <input required value={formData.clientName || ''} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Sale Date</label>
                <input type="date" required value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Contact Name</label>
                <input required value={formData.contactName || ''} onChange={e => setFormData({...formData, contactName: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Contact Number</label>
                <input required value={formData.contactNumber || ''} onChange={e => setFormData({...formData, contactNumber: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Region</label>
                <select value={formData.region} onChange={e => setFormData({...formData, region: e.target.value as Region})} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold bg-white">
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Country</label>
                <select value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold bg-white">
                   <option value="">Select Country</option>
                   {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Priority</label>
                <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as Priority})} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold bg-white">
                   {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Sale Source</label>
                <select value={formData.source} onChange={e => setFormData({...formData, source: e.target.value as SaleSource})} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold bg-white">
                   {SALE_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Sale Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as SaleStatus})} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-blue-600 bg-blue-50/50">
                   {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Next Step</label>
                <input value={formData.nextStep || ''} onChange={e => setFormData({...formData, nextStep: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" placeholder="Required Action Item" />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Remarks Log</label>
                <textarea rows={3} value={formData.remarks || ''} onChange={e => setFormData({...formData, remarks: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-100" placeholder="Sales narrative and background context..." />
              </div>
              <div className="col-span-2 flex justify-end gap-3 mt-4 border-t pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-widest transition-colors">Discard</button>
                <button type="submit" className="px-10 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-95">
                  {editingSale ? 'Execute Update' : 'Initialize Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPage;
