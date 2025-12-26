
import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, UserPlus, Target, ListChecks, Search, Bell, User, ShieldCheck, Users, Globe } from 'lucide-react';
import { Sale, Lead, Opportunity, ActionItem, UserRole, Employee, Region } from './types';
import SalesPage from './components/SalesPage';
import LeadsPage from './components/LeadsPage';
import OpportunitiesPage from './components/OpportunitiesPage';
import ActionItemsPage from './components/ActionItemsPage';
import EmployeesPage from './components/EmployeesPage';

const Logo = () => (
  <div className="flex items-center justify-center w-10 h-10 overflow-hidden rounded-lg bg-white/10 p-1">
    <img 
      src="./logo.png" 
      alt="SightSpectrum Logo" 
      className="w-full h-full object-contain"
      onError={(e) => {
        // Fallback if logo.png is missing: simple stylized S placeholder
        (e.target as HTMLImageElement).style.display = 'none';
        const parent = (e.target as HTMLImageElement).parentElement;
        if (parent) {
          parent.classList.add('bg-gradient-to-br', 'from-purple-500', 'to-blue-500', 'flex', 'items-center', 'justify-center');
          const span = document.createElement('span');
          span.innerText = 'S';
          span.className = 'text-white font-black text-xl';
          parent.appendChild(span);
        }
      }}
    />
  </div>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'leads' | 'opportunities' | 'actions' | 'employees'>('sales');
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('crm_user_role');
    return (saved as UserRole) || 'Super Admin';
  });

  const [searchQuery, setSearchQuery] = useState('');

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('crm_sales');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('crm_leads');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    const saved = localStorage.getItem('crm_opportunities');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [actionItems, setActionItems] = useState<ActionItem[]>(() => {
    const saved = localStorage.getItem('crm_actions');
    return saved ? JSON.parse(saved) : [];
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('crm_employees');
    return saved ? JSON.parse(saved) : [
      { id: 'EMP-1', name: 'Thilakraj', email: 'thilakraj@sightspectrum.com', role: 'Super Admin', status: 'Active', regions: ['North America', 'Europe'] },
      { id: 'EMP-2', name: 'Seranjivi', email: 'seranjivi@sightspectrum.com', role: 'Sales Head', status: 'Active', regions: ['Asia Pacific'] },
      { id: 'EMP-3', name: 'Yashwanth', email: 'yashwanth@sightspectrum.com', role: 'Presales Consultant', status: 'Active', regions: ['Europe', 'Middle East'] },
      { id: 'EMP-4', name: 'Prem', email: 'prem@sightspectrum.com', role: 'Delivery Manager', status: 'Active', regions: ['Asia Pacific', 'Oceania'] }
    ];
  });

  // Dynamically derive the "Logged In User" based on the simulated role
  const currentUserProfile = useMemo(() => {
    return employees.find(e => e.role === userRole) || employees[0];
  }, [employees, userRole]);

  const activeUserName = currentUserProfile?.name || "System User";

  // Data Filtering Logic with Multi-Region support and Search
  const filteredSales = useMemo(() => {
    let result = sales;
    if (userRole !== 'Super Admin' && userRole !== 'Admin/Founder') {
      const userRegions = currentUserProfile?.regions || [];
      result = result.filter(s => userRegions.includes(s.region));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.clientName.toLowerCase().includes(q) || 
        s.contactName.toLowerCase().includes(q) || 
        s.id.toLowerCase().includes(q)
      );
    }
    return result;
  }, [sales, userRole, currentUserProfile, searchQuery]);

  const filteredLeads = useMemo(() => {
    let result = leads;
    if (userRole !== 'Super Admin' && userRole !== 'Admin/Founder') {
      const userRegions = currentUserProfile?.regions || [];
      result = result.filter(l => userRegions.includes(l.region));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l => 
        l.name.toLowerCase().includes(q) || 
        l.companyName.toLowerCase().includes(q) || 
        l.contactName.toLowerCase().includes(q) || 
        l.id.toLowerCase().includes(q)
      );
    }
    return result;
  }, [leads, userRole, currentUserProfile, searchQuery]);

  const filteredOpportunities = useMemo(() => {
    let result = opportunities;
    if (userRole !== 'Super Admin' && userRole !== 'Admin/Founder') {
      const userRegions = currentUserProfile?.regions || [];
      result = result.filter(o => userRegions.includes(o.region));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.name.toLowerCase().includes(q) || 
        o.accountName.toLowerCase().includes(q) || 
        o.contactName.toLowerCase().includes(q) || 
        o.id.toLowerCase().includes(q)
      );
    }
    return result;
  }, [opportunities, userRole, currentUserProfile, searchQuery]);

  const filteredActionItems = useMemo(() => {
    let result = actionItems;
    if (userRole !== 'Super Admin' && userRole !== 'Admin/Founder') {
      const userRegions = currentUserProfile?.regions || [];
      result = result.filter(a => userRegions.includes(a.region));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.subject.toLowerCase().includes(q) || 
        a.description.toLowerCase().includes(q) || 
        a.assignee.toLowerCase().includes(q) || 
        a.id.toLowerCase().includes(q)
      );
    }
    return result;
  }, [actionItems, userRole, currentUserProfile, searchQuery]);

  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return employees;
    const q = searchQuery.toLowerCase();
    return employees.filter(e => 
      e.name.toLowerCase().includes(q) || 
      e.email.toLowerCase().includes(q) || 
      e.role.toLowerCase().includes(q)
    );
  }, [employees, searchQuery]);

  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('crm_user_role', userRole);
    localStorage.setItem('crm_sales', JSON.stringify(sales));
    localStorage.setItem('crm_leads', JSON.stringify(leads));
    localStorage.setItem('crm_opportunities', JSON.stringify(opportunities));
    localStorage.setItem('crm_actions', JSON.stringify(actionItems));
    localStorage.setItem('crm_employees', JSON.stringify(employees));
  }, [userRole, sales, leads, opportunities, actionItems, employees]);

  const addNotification = (msg: string) => {
    setNotifications(prev => [msg, ...prev].slice(0, 5));
  };

  const handleSaleSubmit = (sale: Sale) => {
    const isNew = !sales.find(s => s.id === sale.id);
    if (isNew) {
      setSales(prev => [...prev, sale]);
    } else {
      setSales(prev => prev.map(s => s.id === sale.id ? sale : s));
    }

    if (sale.status === 'Qualified') {
      // Logic for moving to lead is handled here only if it's qualified status
      qualifySaleToLead(sale);
    }
  };

  const qualifySaleToLead = (sale: Sale) => {
    const newLead: Lead = {
      id: `LD-${Date.now()}`,
      owner: activeUserName,
      assignee: 'Presales Team',
      name: `Lead for ${sale.clientName}`,
      notes: sale.remarks,
      companyName: sale.clientName,
      contactName: sale.contactName,
      contactNumber: sale.contactNumber,
      region: sale.region,
      country: sale.country,
      type: 'RFP',
      priority: sale.priority,
      nextStep: 'Awaiting Feasibility Check',
      source: sale.source,
      status: 'In Feasibility Study',
      remarksHistory: [{
        text: sale.remarks,
        timestamp: new Date().toLocaleString(),
        author: activeUserName
      }],
      startDate: new Date().toISOString().split('T')[0],
      closingDate: '',
      currency: 'USD',
      value: 0,
      expectedRevenue: 0,
      techFeasibility: 'Pending',
      implementationFeasibility: 'Pending',
      salesFeasibility: 'Pending'
    };
    setLeads(prev => [...prev, newLead]);
    addNotification(`Sale qualified. Shared with Presales Team for Feasibility Study.`);
  };

  const handleLeadSubmit = (lead: Lead) => {
    setLeads(prev => {
      const exists = prev.find(l => l.id === lead.id);
      if (exists) {
        return prev.map(l => l.id === lead.id ? lead : l);
      }
      return [...prev, lead];
    });

    if (lead.status === 'Qualified') {
      qualifyLeadToOpp(lead);
    }
  };

  const qualifyLeadToOpp = (lead: Lead) => {
    const newOpp: Opportunity = {
      id: lead.id,
      owner: activeUserName,
      name: lead.name,
      accountName: lead.companyName,
      contactName: lead.contactName,
      contactNumber: lead.contactNumber,
      region: lead.region,
      country: lead.country,
      type: lead.type,
      source: lead.source,
      nextStep: lead.nextStep || 'Execute SOW',
      currency: lead.currency,
      value: lead.value,
      expectedClosingDate: lead.closingDate || new Date().toISOString().split('T')[0],
      stage: 'Qualification',
      remarksHistory: lead.remarksHistory,
      probability: 10,
      feasibilityStatus: lead.techFeasibility,
      presalesRecommendation: 'Proceed',
      risks: '',
      expectedRevenue: lead.expectedRevenue,
      campaignSource: '',
      salesOwner: activeUserName,
      technicalPoC: '',
      presalesPoC: '',
      partnerOrg: false,
      description: lead.notes
    };
    setOpportunities(prev => [...prev, newOpp]);
    addNotification(`Lead Qualified for Opportunity. Lead ID ${lead.id} promoted.`);
  };

  const handleOppSubmit = (opp: Opportunity) => {
    setOpportunities(prev => {
      const exists = prev.find(o => o.id === opp.id);
      if (exists) {
        return prev.map(o => o.id === opp.id ? opp : o);
      }
      return [...prev, opp];
    });

    if (opp.stage === 'Closed Won') {
      const newAction: ActionItem = {
        id: `ACT-${Date.now()}`,
        owner: activeUserName,
        assignee: 'Delivery Managers',
        subject: `Implementation Kickoff for ${opp.accountName}`,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actionType: 'Opportunity',
        linkedRecordId: opp.id,
        region: opp.region,
        priority: 'High',
        status: 'Not Started',
        remarks: 'Opportunity Closed Won. Initialize delivery resources.',
        description: `Kickoff implementation and resource planning for ${opp.name}`
      };
      setActionItems(prev => [...prev, newAction]);
      addNotification(`Opportunity Closed Won. Project kickoff task assigned to Delivery Managers.`);
    }
  };

  const handleActionSubmit = (action: ActionItem) => {
    setActionItems(prev => {
      const exists = prev.find(a => a.id === action.id);
      if (exists) {
        return prev.map(a => a.id === action.id ? action : a);
      }
      return [...prev, action];
    });
    addNotification(`Task update sent to ${action.assignee}`);
  };

  const handleEmployeeSubmit = (emp: Employee) => {
    setEmployees(prev => {
      const exists = prev.find(e => e.id === emp.id);
      if (exists) return prev.map(e => e.id === emp.id ? emp : e);
      return [...prev, emp];
    });
    addNotification(`System access granted/updated for ${emp.name}`);
  };

  const handleBulkSalesSubmit = (newSales: Sale[]) => {
    setSales(prev => [...prev, ...newSales]);
    addNotification(`Imported ${newSales.length} sales activities.`);
  };

  const handleBulkLeadsSubmit = (newLeads: Lead[]) => {
    setLeads(prev => [...prev, ...newLeads]);
    addNotification(`Imported ${newLeads.length} leads.`);
  };

  const handleBulkOppsSubmit = (newOpps: Opportunity[]) => {
    setOpportunities(prev => [...prev, ...newOpps]);
    addNotification(`Imported ${newOpps.length} opportunities.`);
  };

  const handleBulkActionsSubmit = (newActions: ActionItem[]) => {
    setActionItems(prev => [...prev, ...newActions]);
    addNotification(`Imported ${newActions.length} action items.`);
  };

  const handleBulkEmployeesSubmit = (newEmps: Employee[]) => {
    setEmployees(prev => [...prev, ...newEmps]);
    addNotification(`Imported ${newEmps.length} employee records.`);
  };

  const handleEmployeeDelete = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    addNotification(`Employee access revoked`);
  };

  // Visibility Logic based on role
  const hasAccess = (tab: string) => {
    if (userRole === 'Super Admin') return true;
    if (userRole === 'Admin/Founder') return tab !== 'employees';
    
    switch (tab) {
      case 'sales': return userRole === 'Sales Head';
      case 'leads': return userRole.includes('Presales') || userRole === 'Sales Head';
      case 'opportunities': return userRole.includes('Presales') || userRole === 'Sales Head';
      case 'actions': return true;
      case 'employees': return false;
      default: return false;
    }
  };

  const sidebarItems = [
    { id: 'sales', icon: <ShoppingCart size={20} />, label: 'Sales Activity' },
    { id: 'leads', icon: <UserPlus size={20} />, label: 'Leads' },
    { id: 'opportunities', icon: <Target size={20} />, label: 'Opportunities' },
    { id: 'actions', icon: <ListChecks size={20} />, label: 'Action Items' },
    { id: 'employees', icon: <Users size={20} />, label: 'User Management' },
  ] as const;

  const filteredSidebar = sidebarItems.filter(item => hasAccess(item.id));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-20">
        <div className="p-6 flex items-center gap-3">
          <Logo />
          <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent uppercase">SightSpectrum</span>
        </div>
        
        <div className="px-6 mb-4">
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Active Role (Simulated)</label>
            <select 
              value={userRole} 
              onChange={(e) => {
                const newRole = e.target.value as UserRole;
                setUserRole(newRole);
                
                // Navigation fallback if tab is no longer accessible
                const dummyAccess = (tab: string, role: UserRole) => {
                   if (role === 'Super Admin') return true;
                   if (role === 'Admin/Founder') return tab !== 'employees';
                   if (tab === 'sales') return role === 'Sales Head';
                   if (tab === 'leads' || tab === 'opportunities') return role.includes('Presales') || role === 'Sales Head';
                   if (tab === 'actions') return true;
                   return false;
                };
                if (!dummyAccess(activeTab, newRole)) {
                  const firstTab = sidebarItems.find(item => dummyAccess(item.id, newRole))?.id || 'actions';
                  setActiveTab(firstTab as any);
                }
              }}
              className="bg-transparent text-xs font-semibold w-full outline-none text-blue-400 cursor-pointer"
            >
              <option value="Super Admin">Super Admin</option>
              <option value="Admin/Founder">Admin/Founder</option>
              <option value="Presales Consultant">Presales Consultant</option>
              <option value="Presales Lead">Presales Lead</option>
              <option value="Presales Manager">Presales Manager</option>
              <option value="Sales Head">Sales Head</option>
              <option value="Delivery Manager">Delivery Manager</option>
            </select>
          </div>
          {currentUserProfile && (
            <div className="mt-2 flex flex-col gap-1 px-1">
              <div className="flex items-center gap-2">
                <Globe size={12} className="text-blue-400 shrink-0" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                  {currentUserProfile.regions.length > 1 ? 'Multiple Regions' : `Region: ${currentUserProfile.regions[0]}`}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {currentUserProfile.regions.map(r => (
                  <span key={r} className="text-[8px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {filteredSidebar.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-2 text-slate-400">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
              {activeUserName[0]}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-white truncate">{activeUserName}</span>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">{userRole}</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="text-blue-500" size={16} />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{userRole} View</span>
              {userRole !== 'Super Admin' && userRole !== 'Admin/Founder' && (
                <span className="text-[10px] font-black text-indigo-400 uppercase ml-2 px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-full">
                  Filtered by Assigned Regions
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tight">
              {sidebarItems.find(i => i.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Global search..." 
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-64 text-sm"
              />
            </div>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
        </header>

        <section className="animate-in fade-in duration-500">
          {activeTab === 'sales' && <SalesPage sales={filteredSales} employees={employees} user={activeUserName} onSubmit={handleSaleSubmit} onBulkSubmit={handleBulkSalesSubmit} role={userRole} />}
          {activeTab === 'leads' && <LeadsPage leads={filteredLeads} employees={employees} user={activeUserName} onSubmit={handleLeadSubmit} onBulkSubmit={handleBulkLeadsSubmit} role={userRole} />}
          {activeTab === 'opportunities' && <OpportunitiesPage opportunities={filteredOpportunities} employees={employees} user={activeUserName} onSubmit={handleOppSubmit} onBulkSubmit={handleBulkOppsSubmit} role={userRole} />}
          {activeTab === 'actions' && <ActionItemsPage items={filteredActionItems} employees={employees} user={activeUserName} onSubmit={handleActionSubmit} onBulkSubmit={handleBulkActionsSubmit} leads={leads} opportunities={opportunities} role={userRole} />}
          {activeTab === 'employees' && userRole === 'Super Admin' && <EmployeesPage employees={filteredEmployees} onSubmit={handleEmployeeSubmit} onBulkSubmit={handleBulkEmployeesSubmit} onDelete={handleEmployeeDelete} />}
        </section>
      </main>
    </div>
  );
};

export default App;