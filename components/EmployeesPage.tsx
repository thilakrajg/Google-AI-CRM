
import React, { useState, useRef } from 'react';
import { Employee, UserRole, Region } from '../types';
import { REGIONS } from '../constants';
import { Plus, X, Users, Mail, UserPlus, Edit3, Trash2, Globe, Download, Upload, FileSpreadsheet, CheckSquare, Square, Check } from 'lucide-react';

interface Props {
  employees: Employee[];
  onSubmit: (employee: Employee) => void;
  onBulkSubmit: (employees: Employee[]) => void;
  onDelete: (id: string) => void;
}

const ROLES: UserRole[] = [
  'Super Admin', 'Admin/Founder', 'Presales Consultant', 'Presales Lead', 
  'Presales Manager', 'Sales Head', 'Delivery Manager'
];

const EmployeesPage: React.FC<Props> = ({ employees, onSubmit, onBulkSubmit, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({
    status: 'Active',
    role: 'Sales Head',
    regions: ['North America']
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === employees.length && employees.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(employees.map(e => e.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleAddNew = () => {
    setEditingEmployee(null);
    setFormData({ 
      status: 'Active', 
      role: 'Sales Head', 
      regions: ['North America'],
      name: '',
      email: ''
    });
    setShowModal(true);
  };

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData(emp);
    setShowModal(true);
  };

  const handleRegionToggle = (r: Region) => {
    const currentRegions = formData.regions || [];
    if (currentRegions.includes(r)) {
      setFormData({ ...formData, regions: currentRegions.filter(item => item !== r) });
    } else {
      setFormData({ ...formData, regions: [...currentRegions, r] });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.regions || formData.regions.length === 0) {
      alert("Please select at least one region.");
      return;
    }
    const employee: Employee = {
      ...formData as Employee,
      id: editingEmployee ? editingEmployee.id : `EMP-${Date.now()}`
    };
    onSubmit(employee);
    setShowModal(false);
  };

  const downloadTemplate = () => {
    const headers = ['Employee Name', 'Email', 'Role', 'Status', 'Regions (Comma Separated)'];
    const csvContent = headers.join(',') + '\n' + 
      `"Sarah Jenkins","sarah@sightspectrum.com","Sales Head","Active","North America,Europe"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'employees_template.csv';
    link.click();
  };

  const exportToCSV = () => {
    if (selectedIds.length === 0) return;
    const selectedEmps = employees.filter(e => selectedIds.includes(e.id));
    const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Regions'];
    const csvRows = selectedEmps.map(e => [
      e.id, e.name, e.email, e.role, e.status, e.regions.join(';')
    ].map(v => `"${v || ''}"`).join(','));
    
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `employees_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n');
      if (lines.length < 1) return;
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const importedEmps: Employee[] = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const obj: any = {};
        headers.forEach((header, idx) => {
          const mapping: Record<string, string> = {
            'Employee Name': 'name',
            'Email': 'email',
            'Role': 'role',
            'Status': 'status',
            'Regions (Comma Separated)': 'regions'
          };
          const key = mapping[header] || header.toLowerCase();
          if (key === 'regions') {
            obj[key] = values[idx] ? values[idx].split(';').map(r => r.trim()) as Region[] : [];
          } else {
            obj[key] = values[idx];
          }
        });
        
        return {
          ...obj,
          id: `EMP-IMP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        } as Employee;
      });
      onBulkSubmit(importedEmps);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Employee Directory</h3>
          <p className="text-xs text-slate-400 font-medium">Global access control and region assignments</p>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadTemplate} title="Template" className="p-2 text-slate-500 border border-slate-200 rounded-lg"><FileSpreadsheet size={18} /></button>
          <button onClick={() => fileInputRef.current?.click()} title="Import" className="p-2 text-slate-500 border border-slate-200 rounded-lg">
            <Upload size={18} />
            <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleImport} />
          </button>
          <button onClick={exportToCSV} disabled={selectedIds.length === 0} title="Export" className={`p-2 border rounded-lg ${selectedIds.length > 0 ? 'text-indigo-600 border-indigo-200' : 'text-slate-200 border-slate-100'}`}><Download size={18} /></button>
          <button 
            onClick={handleAddNew}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg"
          >
            <UserPlus size={18} />
            <span className="font-bold text-xs uppercase tracking-widest">Add Employee</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-widest font-black">
            <tr>
              <th className="px-6 py-4 w-10">
                <button onClick={toggleSelectAll} className="text-slate-400 hover:text-blue-600">
                  {selectedIds.length === employees.length && employees.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
              </th>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Regions</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-700">
            {employees.map(emp => (
              <tr key={emp.id} className={`hover:bg-slate-50/50 transition-colors group ${selectedIds.includes(emp.id) ? 'bg-indigo-50/30' : ''}`}>
                <td className="px-6 py-4">
                  <button onClick={() => toggleSelectRow(emp.id)} className={`${selectedIds.includes(emp.id) ? 'text-indigo-600' : 'text-slate-300 hover:text-indigo-400'}`}>
                    {selectedIds.includes(emp.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-xs">
                      {emp.name ? emp.name[0] : '?'}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{emp.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{emp.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-tighter">
                    {emp.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {emp.regions && emp.regions.map(r => (
                      <span key={r} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded border border-slate-200">
                        {r}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                    emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'
                  }`}>
                    {emp.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => handleEdit(emp)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit3 size={16} /></button>
                  <button onClick={() => onDelete(emp.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-400 uppercase text-xs font-bold tracking-widest italic">No registered employees</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><UserPlus size={20} /></div>
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">{editingEmployee ? 'Edit Member' : 'Register Member'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-8 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Full Name</label>
                  <input required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Email Address</label>
                  <input type="email" required value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="john@sightspectrum.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Access Role</label>
                    <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold bg-white outline-none focus:ring-2 focus:ring-indigo-100 transition-all">
                      {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Status</label>
                    <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold bg-white outline-none focus:ring-2 focus:ring-indigo-100 transition-all">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* RESTORED: Region Selection Section */}
                <div className="border-t border-slate-100 pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Region Assignment</label>
                    <span className="text-[9px] font-bold text-indigo-500 uppercase">Required: Min 1</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {REGIONS.map(region => {
                      const isActive = formData.regions?.includes(region);
                      return (
                        <button
                          key={region}
                          type="button"
                          onClick={() => handleRegionToggle(region)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                            isActive 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' 
                            : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          {isActive && <Check size={12} />}
                          {region}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-4 mt-auto">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[11px] shadow-xl transition-all active:scale-95">
                  {editingEmployee ? 'Update Member' : 'Register Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
