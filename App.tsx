import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Settings,
  Menu,
  Search,
  Bell,
  UserCheck,
  Users,
  ChevronRight,
} from 'lucide-react';

import { EmployeeForm } from './components/EmployeeForm';
import { EmployeeList } from './components/EmployeeList';
import { Dashboard } from './components/Dashboard';
import { CategoryConfig } from './components/CategoryConfig';
import { RecruitmentManager } from './components/RecruitmentManager';

import {
  INITIAL_EMPLOYEES,
  INITIAL_PROVINCES,
  INITIAL_DISTRICTS,
  INITIAL_WARDS,
  INITIAL_DEPARTMENTS,
  INITIAL_POSITIONS,
  INITIAL_CANDIDATES,
} from './constants';

import {
  Employee,
  LocationItem,
  Department,
  Position,
  EmployeeStatus,
  Candidate,
  RecruitmentStatus,
} from './types';

import { saveToGoogleSheet } from './services/googleSheetService';

type View =
  | 'dashboard'
  | 'employee-list'
  | 'employee-form'
  | 'recruitment'
  | 'config';

function App() {
  const [view, setView] = useState<View>('dashboard');

  // Main Data States
  const [employees, setEmployees] = useState<Employee[]>(
    INITIAL_EMPLOYEES as Employee[],
  );
  const [candidates, setCandidates] = useState<Candidate[]>(
    INITIAL_CANDIDATES as Candidate[],
  );
  const [provinces, setProvinces] = useState<LocationItem[]>(
    INITIAL_PROVINCES as LocationItem[],
  );
  const [districts, setDistricts] = useState<LocationItem[]>(
    INITIAL_DISTRICTS as LocationItem[],
  );
  const [wards, setWards] = useState<LocationItem[]>(
    INITIAL_WARDS as LocationItem[],
  );

  // Phòng ban & Chức vụ
  const [depts, setDepts] = useState<Department[]>(
    INITIAL_DEPARTMENTS as Department[],
  );
  const [positions, setPositions] = useState<Position[]>(
    INITIAL_POSITIONS as Position[],
  );

  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

   // --- Helper: Cập nhật State và Gửi Sheet ---
  function updateAndSync<T>(
    key: string,
    newData: T,
    setter: React.Dispatch<React.SetStateAction<T>>,
  ) {
    setter(newData);
    saveToGoogleSheet(key, newData);
  }


  // --- Handlers ---
  const handleSaveEmp = (emp: Employee) => {
    let newEmployees: Employee[];
    const idx = employees.findIndex((e) => e.id === emp.id);

    if (idx >= 0) {
      newEmployees = [...employees];
      newEmployees[idx] = emp;
    } else {
      newEmployees = [...employees, emp];
    }

    updateAndSync('EMPLOYEES', newEmployees, setEmployees);

    // Sau khi lưu xong: quay về danh sách nhân viên
    setView('employee-list');
    setSelectedEmp(null);
  };

  const handlePromote = (c: Candidate, d: Partial<Employee>) => {
    const newEmp: Employee = {
      ...d,
      fullName: c.fullName,
      id: Date.now().toString(),
      status: EmployeeStatus.PROBATION,
    } as Employee;

    const newEmpList = [...employees, newEmp];
    updateAndSync('EMPLOYEES', newEmpList, setEmployees);

    const newCandidateList = candidates.map((x) =>
      x.id === c.id ? { ...x, status: RecruitmentStatus.CONVERTED } : x,
    );
    updateAndSync('CANDIDATES', newCandidateList, setCandidates);

    alert('Đã chuyển hồ sơ thành công!');
  };

  const handleDeleteEmployee = (id: string) => {
    const newList = employees.filter((e) => e.id !== id);
    updateAndSync('EMPLOYEES', newList, setEmployees);
  };

  // --- Meta cho Breadcrumb & Header ---
  const pageMeta = useMemo(() => {
    switch (view) {
      case 'dashboard':
        return {
          section: 'Tổng quan',
          title: 'Bảng điều khiển',
          breadcrumb: ['Tổng quan'],
        };
      case 'employee-list':
        return {
          section: 'Nhân sự',
          title: 'Danh sách nhân viên',
          breadcrumb: ['Nhân sự', 'Nhân viên', 'Danh sách'],
        };
      case 'employee-form':
        return {
          section: 'Nhân sự',
          title: selectedEmp ? 'Cập nhật nhân viên' : 'Thêm mới nhân viên',
          breadcrumb: [
            'Nhân sự',
            'Nhân viên',
            selectedEmp ? 'Cập nhật' : 'Thêm mới',
          ],
        };
      case 'recruitment':
        return {
          section: 'Tuyển dụng',
          title: 'Quản lý tuyển dụng',
          breadcrumb: ['Nhân sự', 'Tuyển dụng'],
        };
      case 'config':
        return {
          section: 'Cấu hình',
          title: 'Danh mục & cấu hình hệ thống',
          breadcrumb: ['Hệ thống', 'Cấu hình'],
        };
      default:
        return {
          section: '',
          title: '',
          breadcrumb: [] as string[],
        };
    }
  }, [view, selectedEmp]);

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="h-16 flex items-center justify-center border-b border-slate-700 bg-cadovina-600 font-bold text-xl uppercase tracking-wider shadow-md">
          Cadovina HRM
        </div>

        <nav className="flex-1 py-6 px-2 space-y-1">
          <button
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 border-l-4 transition-all ${
              view === 'dashboard'
                ? 'bg-slate-800 border-red-500 text-white'
                : 'border-transparent text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard size={20} /> Tổng quan
          </button>

          <button
            onClick={() => setView('employee-list')}
            className={`w-full flex items-center gap-3 px-4 py-3 border-l-4 transition-all ${
              view === 'employee-list' || view === 'employee-form'
                ? 'bg-slate-800 border-red-500 text-white'
                : 'border-transparent text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users size={20} /> Nhân viên
          </button>

          <button
            onClick={() => setView('recruitment')}
            className={`w-full flex items-center gap-3 px-4 py-3 border-l-4 transition-all ${
              view === 'recruitment'
                ? 'bg-slate-800 border-red-500 text-white'
                : 'border-transparent text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <UserCheck size={20} /> Tuyển dụng
          </button>

          <button
            onClick={() => setView('config')}
            className={`w-full flex items-center gap-3 px-4 py-3 border-l-4 transition-all ${
              view === 'config'
                ? 'bg-slate-800 border-red-500 text-white'
                : 'border-transparent text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings size={20} /> Cấu hình
          </button>
        </nav>

        <div className="p-4 bg-slate-800 text-xs text-slate-400 text-center">
          v1.0.5 (Sheet Sync)
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50">
        {/* Top bar */}
        <header className="h-16 bg-white shadow-sm border-b flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-gray-700">
              <Menu size={24} />
            </button>
            <div className="relative hidden md:block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-full text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-cadovina-500 outline-none w-64 transition-all"
                placeholder="Tìm kiếm nhanh..."
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer">
              <Bell
                size={22}
                className="text-gray-500 hover:text-cadovina-600 transition-colors"
              />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-cadovina-100 text-cadovina-600 rounded-full flex items-center justify-center font-bold border border-cadovina-200">
                A
              </div>
              <div className="hidden md:block text-sm font-medium text-gray-700">
                Admin
              </div>
            </div>
          </div>
        </header>

        {/* Header Section: breadcrumb + title */}
        <section className="border-b bg-gray-50 px-6 py-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              {pageMeta.section || 'Hệ thống nhân sự'}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              {pageMeta.breadcrumb.map((item, idx) => (
                <React.Fragment key={item + idx}>
                  {idx > 0 && (
                    <ChevronRight size={12} className="text-gray-400" />
                  )}
                  <span
                    className={
                      idx === pageMeta.breadcrumb.length - 1
                        ? 'font-semibold text-gray-700'
                        : ''
                    }
                  >
                    {item}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="text-base md:text-lg font-semibold text-gray-800">
            {pageMeta.title}
          </div>
        </section>

        {/* Main view container – mỗi lần chỉ render 1 màn */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4 md:p-6">
          {view === 'dashboard' && (
            <Dashboard
              employees={employees}
              onViewEmployee={(e) => {
                setSelectedEmp(e);
                setView('employee-form');
              }}
            />
          )}

          {view === 'employee-list' && (
            <EmployeeList
              employees={employees}
              onAddNew={() => {
                setSelectedEmp(null);
                setView('employee-form');
              }}
              onEdit={(e) => {
                setSelectedEmp(e);
                setView('employee-form');
              }}
              onDelete={handleDeleteEmployee}
            />
          )}

          {view === 'employee-form' && (
            <div className="h-full">
              <EmployeeForm
                onSave={handleSaveEmp}
                onCancel={() => setView('employee-list')}
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
              onUpdateCandidates={(d) =>
                updateAndSync('CANDIDATES', d, setCandidates)
              }
              onPromoteToEmployee={handlePromote}
              departments={depts}
              positions={positions}
              existingEmployees={employees}
            />
          )}

          {view === 'config' && (
            <CategoryConfig
              provinces={provinces}
              onUpdateProvinces={(d) =>
                updateAndSync('PROVINCES', d, setProvinces)
              }
              districts={districts}
              onUpdateDistricts={(d) =>
                updateAndSync('DISTRICTS', d, setDistricts)
              }
              wards={wards}
              onUpdateWards={(d) => updateAndSync('WARDS', d, setWards)}
              departments={depts}
              onUpdateDepartments={(d) =>
                updateAndSync('DEPARTMENTS', d, setDepts)
              }
              positions={positions}
              onUpdatePositions={(d) =>
                updateAndSync('Chức vụ', d, setPositions)
              }
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
