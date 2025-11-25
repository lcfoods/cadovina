
import React, { useState, useMemo } from 'react';
import { LayoutDashboard, UserPlus, Settings, Menu, Search, Bell, UserCheck, Users } from 'lucide-react';
import { EmployeeForm } from './components/EmployeeForm';
import { EmployeeList } from './components/EmployeeList';
import { Dashboard } from './components/Dashboard';
import { CategoryConfig } from './components/CategoryConfig';
import { RecruitmentManager } from './components/RecruitmentManager';
import { INITIAL_EMPLOYEES, INITIAL_PROVINCES, INITIAL_DISTRICTS, INITIAL_WARDS, INITIAL_DEPARTMENTS, INITIAL_POSITIONS, INITIAL_CANDIDATES } from './constants';
import { Employee, LocationItem, Department, Position, EmployeeStatus, Candidate, RecruitmentStatus } from './types';
import { saveToGoogleSheet } from './services/googleSheetService';

function App() {
  const [view, setView] = useState<'dashboard' | 'employee-list' | 'employee-form' | 'recruitment' | 'config'>('dashboard');
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [provinces, setProvinces] = useState(INITIAL_PROVINCES);
  const [districts, setDistricts] = useState(INITIAL_DISTRICTS);
  const [wards, setWards] = useState(INITIAL_WARDS);
  const [depts, setDepts] = useState(INITIAL_DEPARTMENTS);
  const [positions, setPositions] = useState(INITIAL_POSITIONS);
  const [selectedEmp, setSelectedEmp] = useState<Employee|null>(null);

  // Hàm helper để cập nhật State + Gửi Sheet
  const updateAndSync = (type: string, data: any, setter: React.Dispatch<React.SetStateAction<any>>) => {
      setter(data);
      saveToGoogleSheet(type, data);
  };

  const handleSaveEmp = (emp: Employee) => {
      let newEmployees = [];
      const idx = employees.findIndex(e => e.id === emp.id);
      if (idx >= 0) {
          newEmployees = [...employees];
          newEmployees[idx] = emp;
      } else {
          newEmployees = [...employees, emp];
      }
      
      // Cập nhật và đồng bộ
      updateAndSync('EMPLOYEES', newEmployees, setEmployees);
      
      // Return to List view after saving
      setView('employee-list'); 
      setSelectedEmp(null);
  };

  const handlePromote = (c: Candidate, d: Partial<Employee>) => {
      const newEmp = { ...d, fullName: c.fullName, id: Date.now().toString(), status: EmployeeStatus.PROBATION } as Employee;
      const newEmpList = [...employees, newEmp];
      updateAndSync('EMPLOYEES', newEmpList, setEmployees);

      const newCandidateList = candidates.map(x => x.id === c.id ? { ...x, status: RecruitmentStatus.CONVERTED } : x);
      updateAndSync('CANDIDATES', newCandidateList, setCandidates);
      
      alert("Đã chuyển hồ sơ thành công!");
  };

  const handleDeleteEmployee = (id: string) => {
      const newList = employees.filter(e => e.id !== id);
      updateAndSync('EMPLOYEES', newList, setEmployees);
  };

  const handleUpdateCandidates = (newCandidates: Candidate[]) => {
      updateAndSync('CANDIDATES', newCandidates, setCandidates);
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800 font-sans overflow-hidden">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="h-16 flex items-center justify-center border-b border-slate-700 bg-cadovina-600 font-bold text-xl uppercase tracking-wider shadow-md">
            Cadovina HRM
        </div>
        <nav className="flex-1 py-6 px-2 space-y-1">
           <button 
                onClick={()=>setView('dashboard')} 
                className={`w-full flex items-center gap-3 px-4 py-3 border-l-4 transition-all ${view==='dashboard'?'bg-slate-800 border-red-500 text-white':'border-transparent text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
                <LayoutDashboard size={20}/> Tổng quan
            </button>
           <button 
                onClick={()=>{ setView('employee-list'); }} 
                className={`w-full flex items-center gap-3 px-4 py-3 border-l-4 transition-all ${view.startsWith('employee')?'bg-slate-800 border-red-500 text-white':'border-transparent text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
                <Users size={20}/> Nhân viên
            </button>
           <button 
                onClick={()=>setView('recruitment')} 
                className={`w-full flex items-center gap-3 px-4 py-3 border-l-4 transition-all ${view==='recruitment'?'bg-slate-800 border-red-500 text-white':'border-transparent text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
                <UserCheck size={20}/> Tuyển dụng
            </button>
           <button 
                onClick={()=>setView('config')} 
                className={`w-full flex items-center gap-3 px-4 py-3 border-l-4 transition-all ${view==='config'?'bg-slate-800 border-red-500 text-white':'border-transparent text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
                <Settings size={20}/> Cấu hình
            </button>
        </nav>
        <div className="p-4 bg-slate-800 text-xs text-slate-400 text-center">
            v1.0.3 (Cloud Sync) © 2024 LCFoods
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50">
        <header className="h-16 bg-white shadow-sm border-b flex items-center justify-between px-6 z-10">
            <div className="flex items-center gap-4">
                <button className="text-gray-500 hover:text-gray-700"><Menu size={24}/></button>
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                    <input className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-full text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-cadovina-500 outline-none w-64 transition-all" placeholder="Tìm kiếm nhanh..." />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="relative cursor-pointer">
                    <Bell size={22} className="text-gray-500 hover:text-cadovina-600 transition-colors"/>
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </div>
                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-cadovina-100 text-cadovina-600 rounded-full flex items-center justify-center font-bold border border-cadovina-200">A</div>
                    <div className="hidden md:block text-sm font-medium text-gray-700">Admin User</div>
                </div>
            </div>
        </header>
        
        <div className="flex-1 overflow-hidden relative">
             {view === 'dashboard' && (
                <Dashboard 
                    employees={employees} 
                    onViewEmployee={(e)=>{setSelectedEmp(e); setView('employee-form')}} 
                />
             )}
             
             {view === 'employee-list' && (
                <EmployeeList 
                    employees={employees}
                    onAddNew={() => { setSelectedEmp(null); setView('employee-form'); }}
                    onEdit={(e) => { setSelectedEmp(e); setView('employee-form'); }}
                    onDelete={handleDeleteEmployee}
                />
             )}

             {view === 'employee-form' && (
                <div className="h-full p-6">
                    <EmployeeForm 
                        onSave={handleSaveEmp} 
                        onCancel={()=>setView('employee-list')} 
                        initialData={selectedEmp} 
                        provinces={provinces} 
                        districts={districts} 
                        wards={wards} 
                        departments={depts} 
                        positions={positions} 
                        existingEmployees={employees} 
                    />
                </div>
             )}
             
             {view === 'recruitment' && (
                <RecruitmentManager 
                    candidates={candidates} 
                    onUpdateCandidates={handleUpdateCandidates} 
                    onPromoteToEmployee={handlePromote} 
                    departments={depts} 
                    positions={positions} 
                    existingEmployees={employees} 
                />
             )}
             
             {view === 'config' && (
                <CategoryConfig 
                    provinces={provinces} onUpdateProvinces={(d) => updateAndSync('PROVINCES', d, setProvinces)}
                    districts={districts} onUpdateDistricts={(d) => updateAndSync('DISTRICTS', d, setDistricts)}
                    wards={wards} onUpdateWards={(d) => updateAndSync('WARDS', d, setWards)}
                    departments={depts} onUpdateDepartments={(d) => updateAndSync('DEPARTMENTS', d, setDepts)}
                    positions={positions} onUpdatePositions={(d) => updateAndSync('POSITIONS', d, setPositions)}
                />
             )}
        </div>
      </main>
    </div>
  );
}

export default App;
