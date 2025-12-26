
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Sale, Lead, Opportunity, ActionItem, UserRole } from '../types';
import { DollarSign, Users, Briefcase, CheckCircle, Package } from 'lucide-react';

interface Props {
  sales: Sale[];
  leads: Lead[];
  opportunities: Opportunity[];
  actions: ActionItem[];
  role: UserRole;
}

const Dashboard: React.FC<Props> = ({ sales, leads, opportunities, actions, role }) => {
  const isDelivery = role === 'Delivery Manager';
  const isPresales = role.includes('Presales');
  const isSales = role === 'Sales Head';

  const stats = [
    { label: 'Pipeline Value', value: `$${opportunities.reduce((a, o) => a + o.value, 0).toLocaleString()}`, icon: <DollarSign className="text-blue-600" />, color: 'bg-blue-50' },
    { label: 'Active Leads', value: leads.length, icon: <Users className="text-purple-600" />, color: 'bg-purple-50' },
    { label: 'SOWs in Progress', value: opportunities.filter(o => o.stage.includes('SOW')).length, icon: <Briefcase className="text-orange-600" />, color: 'bg-orange-50' },
    { label: 'My Action Items', value: actions.length, icon: <CheckCircle className="text-green-600" />, color: 'bg-green-50' },
  ];

  const pipelineData = [
    { name: 'Sales', count: sales.length },
    { name: 'Leads', count: leads.length },
    { name: 'Opp', count: opportunities.length },
    { name: 'Kickoff', count: opportunities.filter(o => o.stage === 'Project Kickoff').length },
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`p-4 rounded-xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
            <Package size={16} /> Workflow Funnel
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip 
                   cursor={{fill: '#f1f5f9'}}
                   contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6">Recent Status Changes</h3>
          <div className="space-y-4">
            {opportunities.slice(0, 4).map((opp, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${opp.stage.includes('SOW') ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                  <span className="text-sm font-bold text-slate-800">{opp.name}</span>
                </div>
                <span className="text-[10px] font-black uppercase text-slate-400">{opp.stage}</span>
              </div>
            ))}
            {opportunities.length === 0 && (
               <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Briefcase size={32} className="mb-2 opacity-20" />
                  <p className="text-xs">No active opportunities in funnel</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
