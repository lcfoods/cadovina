
import React, { useState, useMemo, useEffect } from 'react';
import { 
    Search, FileSpreadsheet, Plus, Filter, 
    Edit, Trash2, Phone, Mail, Building2 
} from 'lucide-react';
import { Employee, EmployeeStatus } from '../types';
import { DEPARTMENTS, POSITIONS, STATUS_OPTIONS } from '../constants';

interface EmployeeListProps {
    employees: Employee[];
    onEdit: (employee: Employee) => void;
    onAddNew: () => void;
    onDelete: (id: string) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onEdit, onAddNew, onDelete }) => {
    // Debounce State
    const [inputValue, setInputValue] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    
    const [filterDept, setFilterDept] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // Debounce Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(inputValue);
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [inputValue]);

    // Reset status filter when department changes to prevent invalid states
    useEffect(() => {
        setFilterStatus('');
    }, [filterDept]);

    const handleExportExcel = () => {
        const headers = ["Mã NV", "Họ Tên", "Giới Tính", "Ngày Sinh", "SĐT", "Email", "CCCD/CMND", "Phòng Ban", "Chức Vụ", "Ngày Vào Làm", "Lương Cơ Bản", "Trạng Thái", "Địa Chỉ Chi Tiết"];
        
        // Tạo nội dung HTML cho Excel
        const tableHTML = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="UTF-8">
                <style>
                    table { border-collapse: collapse; width: 100%; }
                    th { background-color: #f2f2f2; border: 1px solid #000; font-weight: bold; text-align: center; padding: 10px; height: 40px; vertical-align: middle; }
                    td { border: 1px solid #000; padding: 5px; vertical-align: middle; }
                    .text-mode { mso-number-format:"\\@"; } /* Giữ số 0 ở đầu */
                    .center { text-align: center; }
                </style>
            </head>
            <body>
                <table>
                    <thead>
                        <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                    </thead>
                    <tbody>
                        ${employees.map(e => `
                            <tr>
                                <td class="text-mode">${e.employeeCode}</td>
                                <td>${e.fullName}</td>
                                <td class="center">${e.gender}</td>
                                <td class="center">${e.dob}</td>
                                <td class="text-mode">${e.phone}</td>
                                <td>${e.email}</td>
                                <td class="text-mode">${e.identityCard}</td>
                                <td>${e.department}</td>
                                <td>${e.position}</td>
                                <td class="center">${e.startDate}</td>
                                <td>${e.salary}</td>
                                <td>${e.status}</td>
                                <td>${e.street ? e.street + ', ' : ''}${e.ward}, ${e.district}, ${e.province}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `DS_NhanVien_Cadovina_${new Date().toISOString().split('T')[0]}.xls`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Calculate available statuses based on selected department
    const availableStatuses = useMemo(() => {
        if (!filterDept) return STATUS_OPTIONS;
        
        const statusesInDept = new Set(
            employees
                .filter(e => e.department === filterDept)
                .map(e => e.status)
        );
        
        // Filter the original constants to preserve order, but only include existing ones
        return STATUS_OPTIONS.filter(status => statusesInDept.has(status));
    }, [employees, filterDept]);

    // Logic lọc dữ liệu (Uses debouncedSearchTerm)
    const filteredEmployees = useMemo(() => {
        return employees.filter(e => {
            const matchesSearch = 
                e.fullName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
                e.employeeCode.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                e.phone.includes(debouncedSearchTerm);
            const matchesDept = filterDept ? e.department === filterDept : true;
            const matchesStatus = filterStatus ? e.status === filterStatus : true;
            return matchesSearch && matchesDept && matchesStatus;
        });
    }, [employees, debouncedSearchTerm, filterDept, filterStatus]);

    const deptOptions = typeof DEPARTMENTS[0] === 'string' ? DEPARTMENTS as string[] : (DEPARTMENTS as any[]).map(d => d.name);

    return (
        <div className="h-full flex flex-col bg-gray-50 p-6">
            {/* PHẦN HEADER MÀ BẠN ĐANG TÌM */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Building2 className="text-cadovina-600" />
                        Danh Sách Nhân Viên
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{filteredEmployees.length}</span>
                    </h2>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleExportExcel}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium text-sm shadow-sm transition-all"
                        >
                            <FileSpreadsheet size={16} /> Xuất Excel
                        </button>
                        <button 
                            onClick={onAddNew}
                            className="flex items-center gap-2 px-4 py-2 bg-cadovina-600 text-white rounded hover:bg-cadovina-700 font-bold text-sm shadow-sm transition-all active:translate-y-0.5"
                        >
                            <Plus size={16} /> Thêm Mới
                        </button>
                    </div>
                </div>

                {/* PHẦN BỘ LỌC */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            placeholder="Tìm kiếm theo tên, mã NV, SĐT..." 
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-cadovina-500 focus:outline-none"
                        />
                    </div>
                    <div className="md:col-span-3">
                        <select 
                            value={filterDept} 
                            onChange={e => setFilterDept(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-cadovina-500 bg-white"
                        >
                            <option value="">-- Tất cả phòng ban --</option>
                            {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-3">
                        <select 
                            value={filterStatus} 
                            onChange={e => setFilterStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-cadovina-500 bg-white"
                            disabled={availableStatuses.length === 0}
                        >
                            <option value="">-- Tất cả trạng thái --</option>
                            {availableStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <button 
                            onClick={() => {setInputValue(''); setDebouncedSearchTerm(''); setFilterDept(''); setFilterStatus('');}}
                            className="w-full h-full px-3 py-2 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200 flex items-center justify-center gap-1"
                        >
                            <Filter size={14} /> Xóa lọc
                        </button>
                    </div>
                </div>
            </div>

            {/* PHẦN BẢNG DỮ LIỆU */}
            <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="overflow-auto flex-1">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-xs sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 border-b">Mã NV</th>
                                <th className="px-6 py-3 border-b">Họ và Tên</th>
                                <th className="px-6 py-3 border-b">Liên Hệ</th>
                                <th className="px-6 py-3 border-b">Vị Trí / Phòng Ban</th>
                                <th className="px-6 py-3 border-b">Trạng Thái</th>
                                <th className="px-6 py-3 border-b text-right">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredEmployees.map(emp => (
                                <tr key={emp.id} className="hover:bg-blue-50 transition-colors group">
                                    <td className="px-6 py-3 text-gray-900 font-medium">{emp.employeeCode}</td>
                                    <td className="px-6 py-3">
                                        <div className="font-bold text-gray-900">{emp.fullName}</div>
                                        <div className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                                            {emp.gender} • {emp.dob}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-2 text-gray-700 text-xs mb-1">
                                            <Phone size={12} className="text-gray-400" /> {emp.phone}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700 text-xs">
                                            <Mail size={12} className="text-gray-400" /> {emp.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="font-medium text-gray-800">{emp.position}</div>
                                        <div className="text-gray-500 text-xs">{emp.department}</div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                            emp.status === EmployeeStatus.ACTIVE ? 'bg-green-50 text-green-700 border-green-200' :
                                            emp.status === EmployeeStatus.RESIGNED ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                            emp.status === EmployeeStatus.PROBATION ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                            'bg-blue-50 text-blue-700 border-blue-200'
                                        }`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => onEdit(emp)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                                                title="Sửa"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => { if(window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) onDelete(emp.id); }}
                                                className="p-1.5 text-red-500 hover:bg-red-100 rounded"
                                                title="Xóa"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredEmployees.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                                        Không tìm thấy nhân viên nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 border-t bg-gray-50 text-xs text-gray-500 flex justify-between">
                    <span>Hiển thị {filteredEmployees.length} nhân viên</span>
                    <span>Hệ thống quản lý nhân sự Cadovina</span>
                </div>
            </div>
        </div>
    );
};
