import React, { useState, useEffect, useMemo } from 'react';
import { Save, RotateCcw, Wand2, Loader2, MapPin, AlertTriangle, UploadCloud, FileText, CheckCircle2, X } from 'lucide-react';
import { FormInput } from './FormInput';
import { DEPARTMENTS, POSITIONS, STATUS_OPTIONS, GENDER_OPTIONS, INITIAL_PROVINCES, INITIAL_DISTRICTS, INITIAL_WARDS } from '../constants';
import { Employee, EmployeeStatus, Gender, LocationItem, Department, Position } from '../types';
import { extractEmployeeInfo } from '../services/geminiService';

interface EmployeeFormProps {
  onSave: (employee: Employee) => void;
  onCancel: () => void;
  provinces?: LocationItem[];
  districts?: LocationItem[];
  wards?: LocationItem[];
  initialData?: Employee | null;
  existingEmployees?: Employee[];
  departments?: Department[] | string[];
  positions?: Position[] | string[];
}

const INITIAL_STATE: Employee = {
  id: '', employeeCode: '', fullName: '', gender: Gender.MALE, dob: '', phone: '', email: '', identityCard: '', issuedDate: '', issuedPlace: '',
  street: '', province: '', district: '', ward: '', addressLevel: 3,
  department: '', position: '', startDate: new Date().toISOString().split('T')[0], resignationDate: '', salary: 0, status: EmployeeStatus.ACTIVE,
};

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ 
  onSave, onCancel, provinces = INITIAL_PROVINCES, districts = INITIAL_DISTRICTS, wards = INITIAL_WARDS, 
  initialData = null, existingEmployees = [], departments = DEPARTMENTS, positions = POSITIONS
}) => {
  const [formData, setFormData] = useState<Employee>(INITIAL_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof Employee, string>>>({});
  const [notification, setNotification] = useState<{type: 'success'|'error', message: string} | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => { if (notification) { const timer = setTimeout(() => setNotification(null), 3000); return () => clearTimeout(timer); } }, [notification]);

  const renderDeptOptions = () => {
    if (departments.length > 0 && typeof departments[0] === 'string') return (departments as string[]).map(d => <option key={d} value={d}>{d}</option>);
    const depts = departments as Department[];
    const renderNode = (dept: Department, level: number) => {
       const children = depts.filter(d => d.parentId === dept.id);
       return [<option key={dept.id} value={dept.name}>{"\u00A0\u00A0".repeat(level) + (level > 0 ? "└─ " : "") + dept.name}</option>, ...children.map(child => renderNode(child, level + 1))];
    };
    return depts.filter(d => !d.parentId).map(root => renderNode(root, 0));
  };

  const posOptions = useMemo(() => (positions.length && typeof positions[0] === 'string' ? positions as string[] : (positions as Position[]).map(p => p.name)), [positions]);

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else { const r = Math.floor(Math.random() * 10000).toString(); setFormData({ ...INITIAL_STATE, id: r, employeeCode: `NV${r.padStart(4, '0')}` }); }
  }, [initialData]);

  const isDuplicateIdentity = useMemo(() => (!formData.identityCard || formData.identityCard.length < 9) ? false : existingEmployees.some(e => e.identityCard === formData.identityCard && e.id !== formData.id), [formData.identityCard, existingEmployees, formData.id]);

  useEffect(() => {
    if (isDuplicateIdentity) setErrors(p => ({ ...p, identityCard: 'Số CCCD/CMND này đã tồn tại trên hệ thống!' }));
    else setErrors(p => { if (p.identityCard?.includes('tồn tại')) return { ...p, identityCard: undefined }; return p; });
  }, [isDuplicateIdentity]);

  const availableDistricts = useMemo(() => {
    const p = provinces.find(p => p.name === formData.province); return p ? districts.filter(d => d.parentId === p.id) : [];
  }, [formData.province, provinces, districts]);

  const availableWards = useMemo(() => {
    if (formData.addressLevel === 3) { const d = districts.find(d => d.name === formData.district); return d ? wards.filter(w => w.parentId === d.id) : []; }
    const p = provinces.find(p => p.name === formData.province); if (!p) return [];
    const dIds = districts.filter(d => d.parentId === p.id).map(d => d.id); return wards.filter(w => w.parentId && dIds.includes(w.parentId));
  }, [formData.district, formData.province, formData.addressLevel, districts, wards, provinces]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: name === 'salary' ? Number(value) : value };
      if (name === 'province') { newData.district = ''; newData.ward = ''; }
      if (name === 'district') { newData.ward = ''; }
      if (name === 'ward' && prev.addressLevel === 2) {
          const wObj = wards.find(w => w.name === value);
          if (wObj && wObj.parentId) { const dObj = districts.find(d => d.id === wObj.parentId); if (dObj) newData.district = dObj.name; }
      }
      return newData;
    });
    if (errors[name as keyof Employee] && name !== 'identityCard') setErrors(p => ({ ...p, [name]: undefined }));
  };

  const validate = (): boolean => {
    const err: Partial<Record<keyof Employee, string>> = {};
    if (!formData.fullName.trim()) err.fullName = 'Vui lòng nhập họ và tên';
    if (!formData.phone.trim()) err.phone = 'Vui lòng nhập số điện thoại';
    if (!formData.email.trim()) err.email = 'Vui lòng nhập email'; else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) err.email = 'Email không đúng định dạng';
    if (!formData.identityCard.trim()) err.identityCard = 'Vui lòng nhập CCCD'; else if (isDuplicateIdentity) err.identityCard = 'Số CCCD đã tồn tại!';
    if (!formData.department) err.department = 'Vui lòng chọn phòng ban';
    if (!formData.position) err.position = 'Vui lòng chọn chức vụ';
    if (!formData.province) err.province = 'Vui lòng chọn Tỉnh/Thành';
    if (formData.addressLevel === 3 && !formData.district) err.district = 'Vui lòng chọn Quận/Huyện';
    if (!formData.ward) err.ward = 'Vui lòng chọn Phường/Xã';
    
    // Validate Resignation Date vs Start Date
    if (formData.resignationDate && formData.startDate) {
        if (new Date(formData.resignationDate) < new Date(formData.startDate)) {
            err.resignationDate = 'Ngày nghỉ việc không được sớm hơn ngày vào làm';
        }
    }

    setErrors(err); return Object.keys(err).length === 0;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); const form = e.currentTarget.closest('form'); if (!form) return;
      const index = parseInt((e.target as HTMLElement).getAttribute('data-index') || '-1');
      let nextIndex = index + 1; if (formData.addressLevel === 2 && nextIndex === 9) nextIndex = 10;
      const next = form.querySelector(`[data-index="${nextIndex}"]`) as HTMLElement;
      if (next) next.focus(); else document.getElementById('btn-save')?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) { setIsSaving(true); await new Promise(r => setTimeout(r, 600)); onSave(formData); setIsSaving(false); }
    else { setNotification({ type: 'error', message: 'Vui lòng kiểm tra lại thông tin' }); document.getElementById('employee-form')?.scrollIntoView({ behavior: 'smooth' }); }
  };

  const handleAiExtract = async () => {
    if (!aiPrompt.trim() && !uploadedFile) return; setIsAiLoading(true);
    try {
        let b64, mime; if (uploadedFile) { const r = new FileReader(); r.readAsDataURL(uploadedFile); await new Promise(res => r.onload = res); b64 = (r.result as string).split(',')[1]; mime = uploadedFile.type; }
        const data = await extractEmployeeInfo(aiPrompt, b64, mime);
        if (data) {
            setFormData(p => ({ ...p, ...data, province: data.province || p.province, district: data.district || p.district, ward: data.ward || p.ward }));
            setShowAiModal(false); setNotification({ type: 'success', message: 'Trích xuất thành công!' });
        } else setNotification({ type: 'error', message: 'Không trích xuất được thông tin' });
    } catch { setNotification({ type: 'error', message: 'Lỗi AI' }); }
    setIsAiLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col h-full overflow-hidden relative">
      {notification && <div className={`absolute top-4 right-6 z-50 px-4 py-3 rounded shadow-lg flex items-center gap-2 animate-bounce-in ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}`}>{notification.type === 'success' ? <CheckCircle2 size={18}/> : <AlertTriangle size={18}/>}<span>{notification.message}</span></div>}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><span className="w-2 h-6 bg-cadovina-600 rounded-sm inline-block"></span>{initialData ? 'Hồ Sơ Nhân Viên' : 'Thêm Mới Nhân Viên'}</h2>
        <div className="flex gap-3">
           {!initialData && <button type="button" onClick={() => setShowAiModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 border border-indigo-200 text-sm font-medium"><Wand2 size={16} />AI Scan CV</button>}
           <button onClick={onCancel} className="px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-100 border border-gray-300 text-sm font-medium">Đóng</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
        <form id="employee-form" onSubmit={handleSubmit} className="max-w-6xl mx-auto">
            <div className="bg-white p-5 rounded-md shadow-sm border border-gray-200 mb-6">
                <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 uppercase flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">1</div>Thông tin chung</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormInput index={1} label="Mã Nhân Viên" name="employeeCode" value={formData.employeeCode} onChange={handleChange} onKeyDown={handleKeyDown} required disabled className="bg-gray-100" />
                    <FormInput index={2} label="Họ và Tên" name="fullName" value={formData.fullName} onChange={handleChange} onKeyDown={handleKeyDown} required error={errors.fullName} />
                    <FormInput index={3} label="Ngày Sinh" name="dob" type="date" value={formData.dob} onChange={handleChange} onKeyDown={handleKeyDown} />
                    <FormInput index={4} label="Giới Tính" name="gender" value={formData.gender} onChange={handleChange} onKeyDown={handleKeyDown} options={GENDER_OPTIONS} />
                </div>
            </div>
            <div className="bg-white p-5 rounded-md shadow-sm border border-gray-200 mb-6">
                <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 uppercase flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">2</div>Liên hệ & Địa chỉ</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <FormInput index={5} label="SĐT" name="phone" value={formData.phone} onChange={handleChange} onKeyDown={handleKeyDown} required error={errors.phone} />
                    <FormInput index={6} label="Email" name="email" type="email" value={formData.email} onChange={handleChange} onKeyDown={handleKeyDown} required error={errors.email} />
                    <FormInput index={7} label="CCCD" name="identityCard" value={formData.identityCard} onChange={handleChange} onKeyDown={handleKeyDown} required error={errors.identityCard} />
                </div>
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-2"><MapPin size={14} /> Địa chỉ thường trú</label>
                    <div className="flex items-center gap-2"><input type="checkbox" checked={formData.addressLevel === 2} onChange={(e) => setFormData(p => ({ ...p, addressLevel: e.target.checked ? 2 : 3, ward: '', district: '' }))} className="w-4 h-4" /><label className="text-sm text-gray-600 font-medium">Địa chỉ 2 cấp</label></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FormInput index={8} label="Tỉnh/Thành" name="province" value={formData.province} onChange={handleChange} onKeyDown={handleKeyDown} options={provinces.map(p => p.name)} error={errors.province} required />
                      <FormInput index={9} label={formData.addressLevel === 2 ? "Quận/Huyện (Auto)" : "Quận/Huyện"} name="district" value={formData.district} onChange={handleChange} onKeyDown={handleKeyDown} options={availableDistricts.map(d => d.name)} disabled={!formData.province || formData.addressLevel === 2} error={errors.district} required={formData.addressLevel === 3} className={formData.addressLevel === 2 ? "opacity-80" : ""} />
                      <FormInput index={10} label="Phường/Xã" name="ward" value={formData.ward} onChange={handleChange} onKeyDown={handleKeyDown} options={availableWards.map(w => w.name)} disabled={formData.addressLevel === 3 ? !formData.district : !formData.province} error={errors.ward} required />
                      <FormInput index={11} label="Số nhà, Đường" name="street" value={formData.street} onChange={handleChange} onKeyDown={handleKeyDown} />
                  </div>
                </div>
            </div>
            <div className="bg-white p-5 rounded-md shadow-sm border border-gray-200 mb-6">
                <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 uppercase flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">3</div>Công việc & Lương</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex flex-col">
                        <label className="mb-1 text-xs font-semibold text-gray-700 uppercase tracking-wider">Phòng Ban <span className="text-red-500">*</span></label>
                        <select name="department" value={formData.department} onChange={handleChange} className={`w-full px-3 py-2 bg-white border rounded-md text-sm shadow-sm focus:ring-2 focus:ring-cadovina-500 ${errors.department ? 'border-red-500' : 'border-gray-300'}`} data-index={12} onKeyDown={handleKeyDown}><option value="">-- Chọn --</option>{renderDeptOptions()}</select>
                        {errors.department && <span className="mt-1 text-xs text-red-500 italic">{errors.department}</span>}
                    </div>
                    <FormInput index={13} label="Chức Vụ" name="position" value={formData.position} onChange={handleChange} onKeyDown={handleKeyDown} required options={posOptions} error={errors.position} />
                    <FormInput index={14} label="Ngày Vào Làm" name="startDate" type="date" value={formData.startDate} onChange={handleChange} onKeyDown={handleKeyDown} />
                    <div className="relative">
                         <FormInput index={15} label="Ngày Nghỉ Việc" name="resignationDate" type="date" value={formData.resignationDate || ''} onChange={handleChange} onKeyDown={handleKeyDown} error={errors.resignationDate} />
                         {formData.resignationDate && new Date(formData.resignationDate) <= new Date() && (<div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800 flex items-start gap-2 animate-pulse"><AlertTriangle size={14} className="mt-0.5 shrink-0 text-orange-600" /><span><strong>Cảnh báo:</strong> Nhân viên sẽ chuyển sang trạng thái <span className="font-bold text-red-600">Đã nghỉ việc</span>.</span></div>)}
                    </div>
                    <FormInput index={16} label="Trạng Thái" name="status" value={formData.status} onChange={handleChange} onKeyDown={handleKeyDown} options={STATUS_OPTIONS} />
                    <FormInput index={17} label="Lương Cơ Bản" name="salary" type="number" value={formData.salary} onChange={handleChange} onKeyDown={handleKeyDown} error={errors.salary} />
                </div>
            </div>
        </form>
      </div>
      <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-3">
         <button type="button" onClick={onCancel} className="px-6 py-2 rounded-md text-gray-700 font-medium hover:bg-gray-100 border border-gray-300">Hủy bỏ</button>
         <button id="btn-save" onClick={handleSubmit} disabled={isSaving} className="flex items-center gap-2 px-6 py-2 rounded-md bg-cadovina-600 text-white font-medium hover:bg-cadovina-700 shadow-md">{isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}{isSaving ? 'Đang lưu...' : 'Cất & Lưu Trữ'}</button>
      </div>
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white"><h3 className="font-bold flex items-center gap-2"><Wand2 size={20} /> AI Scan CV</h3><button onClick={()=>setShowAiModal(false)}><X size={24} /></button></div>
            <div className="p-6 space-y-4">
                <input type="file" onChange={(e)=>setUploadedFile(e.target.files?.[0]||null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                <textarea className="w-full p-3 border rounded h-32" placeholder="Hoặc dán nội dung CV vào đây..." value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} />
                <button onClick={handleAiExtract} disabled={isAiLoading} className="w-full py-2 bg-indigo-600 text-white rounded font-bold flex justify-center items-center gap-2">{isAiLoading ? <Loader2 className="animate-spin"/> : 'Xử lý'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};