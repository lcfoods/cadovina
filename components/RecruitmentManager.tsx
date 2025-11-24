import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Calendar, CheckCircle2, MoreHorizontal, Save, Briefcase, X, Loader2, Wand2, UploadCloud, User, Mail, Phone, MapPin, FileBadge, FileText, Trash2, RefreshCw } from 'lucide-react';
import { Candidate, RecruitmentStatus, Gender, Department, Position, Employee, EmployeeStatus } from '../types';
import { GENDER_OPTIONS } from '../constants';
import { extractEmployeeInfo } from '../services/geminiService';

interface RecruitmentManagerProps {
    candidates: Candidate[];
    onUpdateCandidates: (candidates: Candidate[]) => void;
    onPromoteToEmployee: (candidate: Candidate, employeeDetails: Partial<Employee>) => void;
    departments: Department[];
    positions: Position[];
    existingEmployees: Employee[];
}

const DRAFT_KEY = 'cadovina_recruitment_draft';

export const RecruitmentManager: React.FC<RecruitmentManagerProps> = ({ candidates, onUpdateCandidates, onPromoteToEmployee, departments, positions, existingEmployees }) => {
    const [view, setView] = useState<'list'|'form'>('list');
    const [editingId, setEditingId] = useState<string|null>(null);
    const [formData, setFormData] = useState<Partial<Candidate>>({});
    const [decisionModal, setDecisionModal] = useState(false);
    const [decisionData, setDecisionData] = useState<any>({});
    const [showAi, setShowAi] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [uploadedFile, setUploadedFile] = useState<File|null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState<Partial<Candidate>>({});
    
    // Draft State
    const [hasDraft, setHasDraft] = useState(false);

    useEffect(() => {
        const draft = localStorage.getItem(DRAFT_KEY);
        if (draft) setHasDraft(true);
    }, []);

    const handleSaveDraft = () => {
        const draftData = {
            formData,
            editingId,
            timestamp: new Date().toLocaleString()
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
        setHasDraft(true);
        alert('Đã lưu bản nháp thành công! Bạn có thể tiếp tục nhập liệu sau.');
    };

    const handleLoadDraft = () => {
        try {
            const draftStr = localStorage.getItem(DRAFT_KEY);
            if (draftStr) {
                const { formData: dForm, editingId: dId } = JSON.parse(draftStr);
                setFormData(dForm);
                setEditingId(dId);
                setView('form');
            }
        } catch (e) {
            console.error("Error loading draft", e);
        }
    };

    const handleDiscardDraft = () => {
        if (window.confirm('Bạn có chắc muốn xóa bản nháp này?')) {
            localStorage.removeItem(DRAFT_KEY);
            setHasDraft(false);
        }
    };

    const handleSave = (e: React.FormEvent) => { 
        e.preventDefault(); 
        const c = { ...formData, id: editingId || Date.now().toString() } as Candidate; 
        onUpdateCandidates(editingId ? candidates.map(x => x.id === editingId ? c : x) : [...candidates, c]); 
        
        // Clear draft on successful save
        localStorage.removeItem(DRAFT_KEY);
        setHasDraft(false);
        
        setView('list'); 
    };

    const handleExtract = async () => {
        let b64, mime; if(uploadedFile) { const r = new FileReader(); r.readAsDataURL(uploadedFile); await new Promise(res=>r.onload=res); b64=(r.result as string).split(',')[1]; mime=uploadedFile.type; }
        const d = await extractEmployeeInfo(aiPrompt, b64, mime);
        if(d) { setPreviewData({ ...d, appliedPosition: d.position } as any); setShowAi(false); setShowPreview(true); }
    };

    return (
        <div className="p-6 h-full bg-gray-100 overflow-hidden flex flex-col">
            {view === 'list' ? (
                <div className="flex flex-col h-full">
                    {hasDraft && (
                        <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 px-4 py-3 rounded-lg mb-4 flex items-center justify-between animate-pulse">
                            <div className="flex items-center gap-2">
                                <FileText size={18} />
                                <span className="font-medium">Tìm thấy bản nháp chưa lưu!</span>
                                <span className="text-sm opacity-75">Bạn có muốn tiếp tục nhập liệu không?</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleDiscardDraft} className="px-3 py-1 text-xs font-bold border border-indigo-200 rounded hover:bg-white text-indigo-600 flex items-center gap-1">
                                    <Trash2 size={12} /> Xóa
                                </button>
                                <button onClick={handleLoadDraft} className="px-3 py-1 text-xs font-bold bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-1 shadow-sm">
                                    <RefreshCw size={12} /> Tải bản nháp
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-between mb-4">
                        <input placeholder="Tìm ứng viên..." className="border p-2 rounded w-64 focus:ring-2 focus:ring-cadovina-600 focus:outline-none" />
                        <button onClick={()=>{setFormData({status:RecruitmentStatus.PENDING});setEditingId(null);setView('form');}} className="bg-red-600 text-white px-4 py-2 rounded flex gap-2 hover:bg-red-700 font-bold shadow-sm"><UserPlus size={18}/> Thêm Ứng Viên</button>
                    </div>
                    <div className="bg-white rounded shadow overflow-auto flex-1">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-xs sticky top-0">
                                <tr>
                                    <th className="p-4">Tên</th>
                                    <th className="p-4">Vị trí</th>
                                    <th className="p-4">SĐT</th>
                                    <th className="p-4">Trạng thái</th>
                                    <th className="p-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {candidates.map(c=>(
                                    <tr key={c.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-bold text-gray-800">{c.fullName}</td>
                                        <td className="p-4">{c.appliedPosition}</td>
                                        <td className="p-4">{c.phone}</td>
                                        <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${c.status === RecruitmentStatus.PASSED ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.status}</span></td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            {c.status===RecruitmentStatus.PASSED&&<button onClick={()=>{setDecisionData({employeeCode:'NV'+Date.now(), salary:0, status:EmployeeStatus.PROBATION}); setDecisionModal(true);}} className="text-green-600 hover:bg-green-50 p-1 rounded" title="Tiếp nhận nhân viên"><CheckCircle2/></button>}
                                            <button onClick={()=>{setFormData(c);setEditingId(c.id);setView('form');}} className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 p-1 rounded"><MoreHorizontal/></button>
                                        </td>
                                    </tr>
                                ))}
                                {candidates.length === 0 && <tr><td colSpan={5} className="text-center p-8 text-gray-400 italic">Chưa có dữ liệu ứng viên</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded shadow p-6 overflow-auto h-full max-w-4xl mx-auto w-full">
                   <div className="flex justify-between mb-6 border-b pb-4">
                       <h3 className="font-bold text-lg flex items-center gap-2">{editingId ? 'Cập nhật hồ sơ' : 'Thêm mới ứng viên'}</h3>
                       <button onClick={()=>setShowAi(true)} className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-full text-sm flex gap-1 font-bold items-center border border-indigo-200 transition-colors"><Wand2 size={14}/> AI Scan CV</button>
                   </div>
                   <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                           <label className="block text-xs font-bold text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                           <input value={formData.fullName || ''} onChange={e=>setFormData({...formData,fullName:e.target.value})} placeholder="Nguyễn Văn A" className="border p-2 rounded w-full focus:ring-2 focus:ring-cadovina-500 outline-none" required />
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                           <input value={formData.phone || ''} onChange={e=>setFormData({...formData,phone:e.target.value})} placeholder="090xxxxxxx" className="border p-2 rounded w-full focus:ring-2 focus:ring-cadovina-500 outline-none" required />
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                           <input value={formData.email || ''} onChange={e=>setFormData({...formData,email:e.target.value})} placeholder="email@example.com" className="border p-2 rounded w-full focus:ring-2 focus:ring-cadovina-500 outline-none" />
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-gray-700 mb-1">Vị trí ứng tuyển <span className="text-red-500">*</span></label>
                           <input value={formData.appliedPosition || ''} onChange={e=>setFormData({...formData,appliedPosition:e.target.value})} placeholder="VD: Kế toán" className="border p-2 rounded w-full focus:ring-2 focus:ring-cadovina-500 outline-none" required />
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-gray-700 mb-1">Trạng thái tuyển dụng</label>
                           <select value={formData.status} onChange={e=>setFormData({...formData,status:e.target.value as any})} className="border p-2 rounded w-full font-medium">
                               <option value={RecruitmentStatus.PENDING}>Chờ Phỏng Vấn</option>
                               <option value={RecruitmentStatus.INTERVIEWED}>Đã Phỏng Vấn</option>
                               <option value={RecruitmentStatus.PASSED}>Đạt (Pass)</option>
                               <option value={RecruitmentStatus.FAILED}>Không Đạt (Fail)</option>
                           </select>
                       </div>
                       <div className="md:col-span-2">
                           <label className="block text-xs font-bold text-gray-700 mb-1">Ghi chú / Đánh giá</label>
                           <textarea value={formData.note || ''} onChange={e=>setFormData({...formData,note:e.target.value})} rows={3} className="border p-2 rounded w-full focus:ring-2 focus:ring-cadovina-500 outline-none"></textarea>
                       </div>
                       
                       <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-6 pt-4 border-t">
                           <button type="button" onClick={handleSaveDraft} className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 font-medium flex items-center gap-2">
                               <FileText size={16} /> Lưu nháp
                           </button>
                           <button type="button" onClick={()=>setView('list')} className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 font-medium">
                               Hủy bỏ
                           </button>
                           <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 font-bold shadow-md flex items-center gap-2">
                               <Save size={18} /> Lưu Hồ Sơ
                           </button>
                       </div>
                   </form>
                </div>
            )}
            {showAi && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white p-6 rounded-lg shadow-xl w-96"><h3 className="font-bold mb-4 flex items-center gap-2"><Wand2 size={18}/> AI Scan CV</h3><input type="file" onChange={e=>setUploadedFile(e.target.files?.[0]||null)} className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/><button onClick={handleExtract} className="bg-indigo-600 text-white w-full py-2 rounded font-bold hover:bg-indigo-700">Trích xuất thông tin</button><button onClick={()=>setShowAi(false)} className="mt-2 w-full text-gray-500 hover:text-gray-700 text-sm">Đóng</button></div></div>}
            {showPreview && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white p-6 rounded-lg shadow-xl w-[600px]"><h3 className="font-bold mb-4 border-b pb-2">Kết quả trích xuất từ AI</h3><div className="grid grid-cols-2 gap-4 mb-6"><div className="space-y-1"><label className="text-xs font-bold">Họ tên</label><input value={previewData.fullName || ''} onChange={e=>setPreviewData({...previewData,fullName:e.target.value})} className="border p-2 rounded w-full"/></div><div className="space-y-1"><label className="text-xs font-bold">Email</label><input value={previewData.email || ''} onChange={e=>setPreviewData({...previewData,email:e.target.value})} className="border p-2 rounded w-full"/></div><div className="space-y-1"><label className="text-xs font-bold">SĐT</label><input value={previewData.phone || ''} onChange={e=>setPreviewData({...previewData,phone:e.target.value})} className="border p-2 rounded w-full"/></div><div className="space-y-1"><label className="text-xs font-bold">Vị trí</label><input value={previewData.appliedPosition || ''} onChange={e=>setPreviewData({...previewData,appliedPosition:e.target.value})} className="border p-2 rounded w-full"/></div></div><div className="flex justify-end gap-2"><button onClick={()=>setShowPreview(false)} className="px-4 py-2 border rounded">Hủy</button><button onClick={()=>{setFormData({...formData,...previewData});setShowPreview(false);}} className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700">Áp dụng</button></div></div></div>}
            {decisionModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white p-6 rounded-lg shadow-xl w-96"><h3 className="font-bold mb-4 text-lg">Quyết định tiếp nhận</h3><div className="space-y-3 mb-4"><input value={decisionData.employeeCode} onChange={e=>setDecisionData({...decisionData, employeeCode: e.target.value})} placeholder="Mã NV (VD: NV005)" className="border p-2 w-full rounded"/><input type="number" value={decisionData.salary} onChange={e=>setDecisionData({...decisionData, salary: Number(e.target.value)})} placeholder="Lương cơ bản" className="border p-2 w-full rounded"/></div><button onClick={()=>{onPromoteToEmployee(formData as Candidate, decisionData); setDecisionModal(false); setView('list');}} className="bg-green-600 text-white w-full py-2 rounded font-bold hover:bg-green-700">Xác nhận chuyển NV</button><button onClick={()=>setDecisionModal(false)} className="mt-2 w-full text-gray-500 hover:text-gray-700">Hủy bỏ</button></div></div>}
        </div>
    );
};