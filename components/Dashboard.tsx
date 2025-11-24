import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, UserPlus, DollarSign, Building2, Eye, Filter, UserX, Briefcase } from 'lucide-react';
import { Employee, EmployeeStatus } from '../types';
import { DEPARTMENTS, POSITIONS, STATUS_OPTIONS } from '../constants';

interface DashboardProps { employees: Employee[]; onViewEmployee: (employee: Employee) => void; }
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const Dashboard: React.FC<DashboardProps> = ({ employees, onViewEmployee }) => {
  const [activeTab, setActiveTab] = useState<'working' | 'resigned'>('working');
  const [filterDept, setFilterDept] = useState('');
  const [filterPos, setFilterPos] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const { stats, filteredList } = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(e => e.status === EmployeeStatus.ACTIVE).length;
    const totalSalary = employees.reduce((sum, e) => e.status !== EmployeeStatus.RESIGNED ? sum + e.salary : sum, 0);
    let list = employees.filter(e => activeTab === 'working' ? e.status !== EmployeeStatus.RESIGNED : e.status === EmployeeStatus.RESIGNED);
    if (filterDept) list = list.filter(e => e.department === filterDept);
    if (filterPos) list = list.filter(e => e.position === filterPos);
    if (filterStatus) list = list.filter(e => e.status === filterStatus);

    const working = employees.filter(e => e.status !== EmployeeStatus.RESIGNED);
    const deptData = Array.from(working.reduce((m, e) => m.set(e.department, (m.get(e.department) || 0) + 1), new Map())).map(([name, value]) => ({ name, value }));
    const genderData = Array.from(working.reduce((m, e) => m.set(e.gender, (m.get(e.gender) || 0) + 1), new Map())).map(([name, value]) => ({ name, value }));

    return { stats: { total, active, totalSalary, deptData, genderData }, filteredList: list };
  }, [employees, activeTab, filterDept, filterPos, filterStatus]);

  const deptOptions = typeof DEPARTMENTS[0] === 'string' ? DEPARTMENTS as string[] : (DEPARTMENTS as any[]).map(d => d.name);
  const posOptions = typeof POSITIONS[0] === 'string' ? POSITIONS as string[] : (POSITIONS as any[]).map(p => p.name);

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow border-l-4 border-red-600">
            <div className="flex justify-between"><h3 className="text-gray-500 font-bold text-sm">NHÂN SỰ ACTIVE</h3><Users className="text-red-600"/></div>
            <p className="text-2xl font-bold mt-2">{stats.active}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-gray-500">
            <div className="flex justify-between"><h3 className="text-gray-500 font-bold text-sm">ĐÃ NGHỈ VIỆC</h3><UserX className="text-gray-500"/></div>
            <p className="text-2xl font-bold mt-2">{employees.filter(e => e.status === EmployeeStatus.RESIGNED).length}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-yellow-500">
            <div className="flex justify-between"><h3 className="text-gray-500 font-bold text-sm">QUỸ LƯƠNG</h3><DollarSign className="text-yellow-500"/></div>
            <p className="text-2xl font-bold mt-2">{(stats.totalSalary / 1000000).toFixed(1)} M</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded shadow h-[300px]">
            <h3 className="font-bold mb-4">Nhân sự theo phòng ban</h3>
            <ResponsiveContainer width="100%" height="100%"><BarChart data={stats.deptData} layout="vertical"><XAxis type="number" hide/><YAxis dataKey="name" type="category" width={120} style={{fontSize:'10px'}}/><Bar dataKey="value" fill="#e11b22" barSize={20}/><Tooltip/></BarChart></ResponsiveContainer>
        </div>
        <div className="bg-white p-5 rounded shadow h-[300px]">
            <h3 className="font-bold mb-4">Cơ cấu giới tính</h3>
            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={stats.genderData} dataKey="value" outerRadius={80} label>{stats.genderData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Legend/></PieChart></ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white rounded shadow overflow-hidden">
         <div className="flex border-b">
            <button onClick={()=>setActiveTab('working')} className={`px-6 py-4 font-bold border-b-2 ${activeTab==='working'?'border-red-600 text-red-600':'border-transparent'}`}>Đang làm việc</button>
            <button onClick={()=>setActiveTab('resigned')} className={`px-6 py-4 font-bold border-b-2 ${activeTab==='resigned'?'border-gray-600 text-gray-600':'border-transparent'}`}>Đã nghỉ việc</button>
         </div>
         <div className="p-4 bg-gray-50 flex gap-3">
             <Filter size={16} className="text-gray-500"/>
             <select value={filterDept} onChange={e=>setFilterDept(e.target.value)} className="border rounded px-2 py-1 text-sm"><option value="">Tất cả phòng ban</option>{deptOptions.map(d=><option key={d} value={d}>{d}</option>)}</select>
             <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="border rounded px-2 py-1 text-sm"><option value="">Tất cả trạng thái</option>{STATUS_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}</select>
         </div>
         <table className="w-full text-sm text-left">
             <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-bold"><tr><th className="px-6 py-3">Mã</th><th className="px-6 py-3">Tên</th><th className="px-6 py-3">Phòng</th><th className="px-6 py-3">Trạng thái</th><th className="px-6 py-3 text-right">Hành động</th></tr></thead>
             <tbody className="divide-y">{filteredList.map(e => (
                 <tr key={e.id} className="hover:bg-gray-50">
                     <td className="px-6 py-3">{e.employeeCode}</td>
                     <td className="px-6 py-3 font-bold text-red-600">{e.fullName}</td>
                     <td className="px-6 py-3">{e.department}</td>
                     <td className="px-6 py-3"><span className={`px-2 py-1 rounded text-xs font-bold ${e.status===EmployeeStatus.ACTIVE?'bg-green-100 text-green-700':e.status===EmployeeStatus.RESIGNED?'bg-gray-100 text-gray-600':'bg-yellow-100 text-yellow-700'}`}>{e.status}</span></td>
                     <td className="px-6 py-3 text-right"><button onClick={()=>onViewEmployee(e)} className="text-gray-400 hover:text-red-600"><Eye size={18}/></button></td>
                 </tr>
             ))}</tbody>
         </table>
      </div>
    </div>
  );
};