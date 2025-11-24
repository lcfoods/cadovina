import React, { useState, useMemo } from 'react';
import { LayoutDashboard, UserPlus, Settings, Menu, Search, Bell, UserCheck } from 'lucide-react';
import { EmployeeForm } from './components/EmployeeForm';
import { Dashboard } from './components/Dashboard';
import { CategoryConfig } from './components/CategoryConfig';
import { RecruitmentManager } from './components/RecruitmentManager';
import { INITIAL_EMPLOYEES, INITIAL_PROVINCES, INITIAL_DISTRICTS, INITIAL_WARDS, INITIAL_DEPARTMENTS, INITIAL_POSITIONS, INITIAL_CANDIDATES } from './constants';
import { Employee, LocationItem, Department, Position, EmployeeStatus, Candidate, RecruitmentStatus } from './types';

function App() {
  const [view, setView] = useState('dashboard');
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [provinces, setProvinces] = useState(INITIAL_PROVINCES);
  const [districts, setDistricts] = useState(INITIAL_DISTRICTS);
  const [wards, setWards] = useState(INITIAL_WARDS);
  const [depts, setDepts] = useState(INITIAL_DEPARTMENTS);
  const [positions, setPositions] = useState(INITIAL_POSITIONS);
  const [selectedEmp, setSelectedEmp] = useState<Employee|null>(null);

  const handleSaveEmp = (emp: Employee) => {
      setEmployees(prev => { const idx = prev.findIndex(e=>e.id===emp.id); if(idx>=0) { const n=[...prev];n[idx]=emp;return n; } return [...prev, emp]; });
      setView('dashboard'); setSelectedEmp(null);
  };
  const handlePromote = (c: Candidate, d: Partial<Employee>) => {
      const newEmp = { ...d, fullName: c.fullName, id: Date.now().toString(), status: EmployeeStatus.PROBATION } as Employee;
      setEmployees([...employees, newEmp]);
      setCandidates(candidates.map(x=>x.id===c.id?{...x,status:RecruitmentStatus.CONVERTED}:x));
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800 font-sans overflow-hidden">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="h-16 flex items-center justify-center border-b border-slate-700 bg-cadovina-600 font-bold text-xl uppercase">Cadovina HRM</div>
        <nav className="flex-1 py-6 px-2 space-y-1">
           <button onClick={()=>setView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 border-l-4 ${view==='dashboard'?'bg-slate-800 border-red-500':'border-transparent hover:bg-slate-800'}`}><LayoutDashboard size={20}/> Tổng quan</button>
           <button onClick={()=>{setSelectedEmp(null);setView('employee')}} className={`w-full flex items-center gap-3 px-4 py-3 border-l-4 ${view==='employee'?'bg-slate-800 border-red-500':'border-transparent hover:bg-slate-800'}`}><UserPlus size={20}/> Nhân viên</button>
           <button onClick={()=>setView('recruitment')} className={`w-full flex items-center gap-3 px-4 py-3 border-l-4 ${view==='recruitment'?'bg-slate-800 border-red-500':'border-transparent hover:bg-slate-800'}`}><UserCheck size={20}/> Tuyển dụng</button>
           <button onClick={()=>setView('config')} className={`w-full flex items-center gap-3 px-4 py-3 border-l-4 ${view==='config'?'bg-slate-800 border-red-500':'border-transparent hover:bg-slate-800'}`}><Settings size={20}/> Cấu hình</button>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white shadow-sm border-b flex items-center justify-between px-6">
            <div className="flex items-center gap-4"><Menu size={24} className="text-gray-500"/></div>
            <div className="flex items-center gap-4"><Bell size={22} className="text-gray-500"/></div>
        </header>
        <div className="flex-1 overflow-hidden">
             {view === 'dashboard' && <Dashboard employees={employees} onViewEmployee={(e)=>{setSelectedEmp(e);setView('employee')}} />}
             {view === 'employee' && <div className="h-full p-6"><EmployeeForm onSave={handleSaveEmp} onCancel={()=>setView('dashboard')} initialData={selectedEmp} provinces={provinces} districts={districts} wards={wards} departments={depts} positions={positions} existingEmployees={employees} /></div>}
             {view === 'recruitment' && <RecruitmentManager candidates={candidates} onUpdateCandidates={setCandidates} onPromoteToEmployee={handlePromote} departments={depts} positions={positions} existingEmployees={employees} />}
             {view === 'config' && <CategoryConfig provinces={provinces} onUpdateProvinces={setProvinces} districts={districts} onUpdateDistricts={setDistricts} wards={wards} onUpdateWards={setWards} departments={depts} onUpdateDepartments={setDepts} positions={positions} onUpdatePositions={setPositions} />}
        </div>
      </main>
    </div>
  );
}

export default App;