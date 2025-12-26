
import React, { useState, useRef } from 'react';
import { ActionItem, Region, ActionStatus, Priority, Lead, Opportunity, UserRole, Employee } from '../types';
import { REGIONS, PRIORITIES, ACTION_STATUSES } from '../constants';
import { Plus, X, Calendar, AlertCircle, Clock, ShieldAlert, Edit3, User, Globe, Tag, MessageSquare, ClipboardList, Download, Upload, FileSpreadsheet, CheckSquare, Square } from 'lucide-react';

interface Props {
  items: ActionItem[];
  employees: Employee[];
  user: string;
  role: UserRole;
  leads: Lead[];
  opportunities: Opportunity[];
  onSubmit: (action: ActionItem) => void;
  onBulkSubmit: (actions: ActionItem[]) => void;
}

const ActionItemsPage: React.FC<Props> = ({ items, employees, user, role, leads, opportunities, onSubmit, onBulkSubmit }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ActionItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<ActionItem>>({
    owner: user,
    status: 'Not Started',
    priority: 'Medium',
    region: 'North America',
    actionType: 'Lead',
    remarks: '',
    description: ''
  });

  const filteredItems = items.filter(item => {
    if (role === 'Super Admin' || role === 'Admin/Founder') return true;
    if (role === 'Delivery Manager') return item.assignee === 'Delivery Managers' || item.assignee === user || item.owner === user;
    if (role.includes('Presales')) return item.assignee.includes('Presales') || item.owner === user || item.assignee === user;
    if (role === 'Sales Head') return true;
    return false;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(i => i.id));
    }
  };

  const toggleSelectRow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleCardClick = (item: ActionItem) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      owner: user, status: 'Not Started', priority: 'Medium', region: 'North America', actionType: 'Lead', remarks: '', description: '', assignee: '', subject: '', dueDate: new Date().toISOString().split('T')[0], linkedRecordId: ''
    });
    setShowModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const action: ActionItem = { ...formData as ActionItem, id: editingItem ? editingItem.id : `ACT-${Date.now()}` };
    onSubmit(action);
    setShowModal(false);
  };

  const downloadTemplate = () => {
    const headers = ['Action Item Assignee', 'Subject', 'Due Date', 'Action Type', 'Linked Record ID', 'Region', 'Priority', 'Status', 'Remarks', 'Description'];
    const csvContent = headers.join(',') + '\n' + 
      `"Delivery Managers","Initialize Kickoff","2024-04-10","Opportunity","OPP-123","Asia Pacific","High","Not Started","Immediate attention needed","Project plan and resource grid"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'action_items_template.csv';
    link.click();
  };

  const exportToCSV = () => {
    if (selectedIds.length === 0) return;
    const selectedItems = items.filter(i => selectedIds.includes(i.id));
    const headers = ['ID', 'Owner', 'Assignee', 'Subject', 'Due Date', 'Type', 'LinkedID', 'Region', 'Priority', 'Status'];
    const csvRows = selectedItems.map(i => [
      i.id, i.owner, i.assignee, i.subject, i.dueDate, i.actionType, i.linkedRecordId, i.region, i.priority, i.status
    ].map(v => `"${v || ''}"`).join(','));
    
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tasks_export_${new Date().toISOString().split('T')[0]}.csv`;
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
      
      const importedActions: ActionItem[] = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const obj: any = {};
        headers.forEach((header, idx) => {
          const mapping: Record<string, keyof ActionItem> = {
            'Action Item Assignee': 'assignee',
            'Subject': 'subject',
            'Due Date': 'dueDate',
            'Action Type': 'actionType',
            'Linked Record ID': 'linkedRecordId',
            'Region': 'region',
            'Priority': 'priority',
            'Status': 'status',
            'Remarks': 'remarks',
            'Description': 'description'
          };
          const key = mapping[header] || header.toLowerCase();
          obj[key] = values[idx];
        });
        
        return {
          ...obj,
          id: `ACT-IMP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          owner: user
        } as ActionItem;
      });
      onBulkSubmit(importedActions);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
           <div className="bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm flex items-center gap-2">
              <ShieldAlert className="text-blue-500" size={16} />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Permissions: {role}</span>
           </div>
           {filteredItems.length > 0 && (
             <button onClick={toggleSelectAll} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 transition-colors">
               {selectedIds.length === filteredItems.length ? <CheckSquare size={14} /> : <Square size={14} />}
               {selectedIds.length === filteredItems.length ? 'Deselect All' : 'Select All'}
             </button>
           )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={downloadTemplate} title="Template" className="p-2.5 text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50"><FileSpreadsheet size={18} /></button>
          <button onClick={() => fileInputRef.current?.click()} title="Import" className="p-2.5 text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50">
            <Upload size={18} />
            <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleImport} />
          </button>
          <button onClick={exportToCSV} disabled={selectedIds.length === 0} title="Export" className={`p-2.5 rounded-xl border ${selectedIds.length > 0 ? 'text-indigo-600 border-indigo-200' : 'text-slate-200 border-slate-100'}`}><Download size={18} /></button>
          {role !== 'Delivery Manager' && (
            <button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg">
              <Plus size={18} />
              <span className="font-bold text-xs uppercase tracking-widest">New Action Item</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} onClick={() => handleCardClick(item)} className={`bg-white rounded-2xl border ${selectedIds.includes(item.id) ? 'ring-2 ring-indigo-500 border-indigo-200 shadow-indigo-50 shadow-xl' : 'border-gray-100'} shadow-sm p-6 hover:shadow-md cursor-pointer transition-all flex flex-col group relative overflow-hidden`}>
             <div className="absolute top-2 right-2 z-10">
                <button onClick={(e) => toggleSelectRow(e, item.id)} className={`${selectedIds.includes(item.id) ? 'text-indigo-600' : 'text-slate-200 hover:text-indigo-300'}`}>
                   {selectedIds.includes(item.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                </button>
             </div>
             {/* Content of the task card... */}
             <div className="flex justify-between items-start mb-4 pr-6">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${item.priority === 'High' ? 'bg-red-50 text-red-600' : item.priority === 'Medium' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'}`}>
                   {item.priority} Priority
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${item.status === 'Completed' ? 'bg-green-100 text-green-700' : item.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                   {item.status}
                </span>
             </div>
             <h4 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                <Edit3 size={14} className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
                {item.subject}
             </h4>
             <p className="text-xs text-slate-500 flex-1 line-clamp-2 mb-4 leading-relaxed">{item.description}</p>
             <div className="space-y-3 pt-4 border-t border-slate-50 mt-auto">
                <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase">
                   <div className="flex items-center gap-1.5"><Calendar size={12} /><span>Due: {item.dueDate}</span></div>
                   <div className="flex items-center gap-1.5"><Globe size={12} /><span>{item.region}</span></div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[10px] font-black text-white">{item.assignee ? item.assignee[0] : '?'}</div>
                   <span className="text-xs font-bold text-slate-700 truncate">{item.assignee || 'Unassigned'}</span>
                </div>
             </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[95vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><ClipboardList size={20} /></div>
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">{editingItem ? 'Edit Action Item' : 'New Action Item'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-8 overflow-y-auto grid grid-cols-2 gap-x-6 gap-y-5">
              <div className="col-span-1">
                <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Assignee</label>
                <select required value={formData.assignee || ''} onChange={e => setFormData({...formData, assignee: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold bg-white">
                  <option value="">Select Assignee</option>
                  <option value="Delivery Managers">Delivery Managers (Group)</option>
                  <option value="Presales Team">Presales Team (Group)</option>
                  {employees.filter(e => e.status === 'Active').map(e => (
                    <option key={e.id} value={e.name}>{e.name} ({e.role})</option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Due Date</label>
                <input type="date" required value={formData.dueDate || ''} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold" />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Subject</label>
                <input required value={formData.subject || ''} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Description</label>
                <textarea rows={3} required value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none" />
              </div>
              <div className="col-span-2 flex justify-end gap-4 mt-4 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-2.5 rounded-xl text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-10 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionItemsPage;
