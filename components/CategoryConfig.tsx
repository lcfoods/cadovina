import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Map, Briefcase, Network, FolderTree, ChevronRight } from 'lucide-react';
import { LocationItem, Department, Position } from '../types';

interface CategoryConfigProps {
  provinces: LocationItem[]; onUpdateProvinces: (i: LocationItem[]) => void;
  districts: LocationItem[]; onUpdateDistricts: (i: LocationItem[]) => void;
  wards: LocationItem[]; onUpdateWards: (i: LocationItem[]) => void;
  departments: Department[]; onUpdateDepartments: (i: Department[]) => void;
  positions: Position[]; onUpdatePositions: (i: Position[]) => void;
}

export const CategoryConfig: React.FC<CategoryConfigProps> = ({ provinces, onUpdateProvinces, districts, onUpdateDistricts, wards, onUpdateWards, departments, onUpdateDepartments, positions, onUpdatePositions }) => {
  const [activeTab, setActiveTab] = useState<'location' | 'department' | 'position'>('location');
  
  // Location States
  const [locTab, setLocTab] = useState<'province' | 'district' | 'ward'>('province');
  const [locParentId, setLocParentId] = useState('');

  // Input States
  const [newName, setNewName] = useState('');
  const [deptParentId, setDeptParentId] = useState('');

  // Auto-select parent when switching location tabs
  useEffect(() => {
    if (activeTab === 'location') {
        if (locTab === 'district') {
            // Khi qua tab Quận/Huyện, tự động chọn Tỉnh đầu tiên nếu chưa chọn
            if (!locParentId && provinces.length > 0) setLocParentId(provinces[0].id);
        } else if (locTab === 'ward') {
             // Khi qua tab Phường/Xã, tự động chọn Quận đầu tiên nếu chưa chọn
            if (!locParentId && districts.length > 0) setLocParentId(districts[0].id);
        } else {
            setLocParentId('');
        }
    }
  }, [locTab, activeTab, provinces, districts]);

  const handleAdd = () => {
      if (!newName.trim()) return alert("Vui lòng nhập tên!");
      const id = Date.now().toString();

      if (activeTab === 'location') {
          if (locTab === 'province') {
              onUpdateProvinces([...provinces, { id, name: newName }]);
          } else if (locTab === 'district') {
              if (!locParentId) return alert("Vui lòng chọn Tỉnh/Thành phố trực thuộc!");
              onUpdateDistricts([...districts, { id, name: newName, parentId: locParentId }]);
          } else {
              if (!locParentId) return alert("Vui lòng chọn Quận/Huyện trực thuộc!");
              onUpdateWards([...wards, { id, name: newName, parentId: locParentId }]);
          }
      } else if (activeTab === 'department') {
          onUpdateDepartments([...departments, { id, name: newName, parentId: deptParentId || undefined }]);
      } else {
          onUpdatePositions([...positions, { id, name: newName }]);
      }
      setNewName('');
  };

  const handleDelete = (id: string) => {
      if (!window.confirm("Bạn chắc chắn muốn xóa?")) return;
      if (activeTab === 'location') {
          if (locTab === 'province') onUpdateProvinces(provinces.filter(x => x.id !== id));
          else if (locTab === 'district') onUpdateDistricts(districts.filter(x => x.id !== id));
          else onUpdateWards(wards.filter(x => x.id !== id));
      } else if (activeTab === 'department') onUpdateDepartments(departments.filter(x => x.id !== id));
      else onUpdatePositions(positions.filter(x => x.id !== id));
  };

  // Helper render tree
  const renderDeptTree = (parentId?: string, level = 0) => {
      const items = departments.filter(d => d.parentId === parentId);
      return items.map(d => (
          <React.Fragment key={d.id}>
              <div className="flex justify-between items-center p-2 border-b hover:bg-gray-50">
                  <span style={{ paddingLeft: level * 20 + 'px' }} className="flex items-center gap-2">
                      {level > 0 && <ChevronRight size={14} className="text-gray-400"/>}
                      {d.name}
                  </span>
                  <button onClick={() => handleDelete(d.id)} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
              </div>
              {renderDeptTree(d.id, level + 1)}
          </React.Fragment>
      ));
  };

  return (
      <div className="p-6 h-full bg-gray-50 flex flex-col">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
              {/* Main Tabs */}
              <div className="flex border-b bg-gray-50">
                  <button onClick={() => setActiveTab('location')} className={`px-6 py-3 font-bold text-sm flex items-center gap-2 ${activeTab === 'location' ? 'bg-white border-t-2 border-cadovina-600 text-cadovina-600' : 'text-gray-500 hover:text-gray-700'}`}><Map size={16}/> Địa Chính</button>
                  <button onClick={() => setActiveTab('department')} className={`px-6 py-3 font-bold text-sm flex items-center gap-2 ${activeTab === 'department' ? 'bg-white border-t-2 border-cadovina-600 text-cadovina-600' : 'text-gray-500 hover:text-gray-700'}`}><Network size={16}/> Phòng Ban</button>
                  <button onClick={() => setActiveTab('position')} className={`px-6 py-3 font-bold text-sm flex items-center gap-2 ${activeTab === 'position' ? 'bg-white border-t-2 border-cadovina-600 text-cadovina-600' : 'text-gray-500 hover:text-gray-700'}`}><Briefcase size={16}/> Chức Vụ</button>
              </div>

              {/* Controls Area */}
              <div className="p-4 border-b bg-white grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  {/* Parent Select for Location */}
                  {activeTab === 'location' && locTab !== 'province' && (
                      <div className="md:col-span-3">
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                              {locTab === 'district' ? 'Thuộc Tỉnh/Thành' : 'Thuộc Quận/Huyện'}
                          </label>
                          <select value={locParentId} onChange={e => setLocParentId(e.target.value)} className="w-full border p-2 rounded text-sm bg-gray-50">
                              <option value="">-- Chọn --</option>
                              {(locTab === 'district' ? provinces : districts).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                      </div>
                  )}

                  {/* Parent Select for Department */}
                  {activeTab === 'department' && (
                      <div className="md:col-span-3">
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Cấp Cha</label>
                          <select value={deptParentId} onChange={e => setDeptParentId(e.target.value)} className="w-full border p-2 rounded text-sm bg-gray-50">
                              <option value="">-- Cấp cao nhất --</option>
                              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                      </div>
                  )}

                  {/* Name Input */}
                  <div className={`md:col-span-${(activeTab === 'location' && locTab !== 'province') || activeTab === 'department' ? '6' : '9'}`}>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tên hiển thị</label>
                      <input 
                        value={newName} 
                        onChange={e => setNewName(e.target.value)} 
                        placeholder="Nhập tên danh mục..." 
                        className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-cadovina-600 focus:outline-none"
                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                      />
                  </div>
                  
                  <div className="md:col-span-3">
                      <button onClick={handleAdd} className="w-full bg-cadovina-600 text-white px-4 py-2 rounded font-bold hover:bg-cadovina-700 flex items-center justify-center gap-2 text-sm"><Plus size={16}/> Thêm Mới</button>
                  </div>
              </div>

              {/* Sub-tabs for Location */}
              {activeTab === 'location' && (
                  <div className="flex border-b bg-gray-100 px-4 gap-2">
                      <button onClick={() => setLocTab('province')} className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors ${locTab === 'province' ? 'border-cadovina-600 text-cadovina-600' : 'border-transparent text-gray-500'}`}>Tỉnh / Thành</button>
                      <button onClick={() => setLocTab('district')} className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors ${locTab === 'district' ? 'border-cadovina-600 text-cadovina-600' : 'border-transparent text-gray-500'}`}>Quận / Huyện</button>
                      <button onClick={() => setLocTab('ward')} className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors ${locTab === 'ward' ? 'border-cadovina-600 text-cadovina-600' : 'border-transparent text-gray-500'}`}>Phường / Xã</button>
                  </div>
              )}

              {/* List Content */}
              <div className="flex-1 overflow-auto p-0 bg-white">
                  {activeTab === 'department' ? (
                      <div className="divide-y">{renderDeptTree(undefined)}</div>
                  ) : activeTab === 'position' ? (
                      <div className="divide-y">
                          {positions.map(p => (
                              <div key={p.id} className="flex justify-between items-center p-3 hover:bg-gray-50">
                                  <span className="font-medium text-sm">{p.name}</span>
                                  <button onClick={() => handleDelete(p.id)} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 size={14}/></button>
                              </div>
                          ))}
                      </div>
                  ) : (
                      // Location List
                      <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs sticky top-0">
                              <tr>
                                  <th className="px-6 py-3">Tên Đơn Vị</th>
                                  {locTab !== 'province' && <th className="px-6 py-3">Trực Thuộc</th>}
                                  <th className="px-6 py-3 text-right">Xóa</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y">
                              {(locTab === 'province' ? provinces : 
                                locTab === 'district' ? districts.filter(d => d.parentId === locParentId) : 
                                wards.filter(w => w.parentId === locParentId)
                              ).map(item => (
                                  <tr key={item.id} className="hover:bg-blue-50">
                                      <td className="px-6 py-3 font-medium">{item.name}</td>
                                      {locTab !== 'province' && (
                                          <td className="px-6 py-3 text-gray-500">
                                              {locTab === 'district' 
                                                  ? provinces.find(p => p.id === item.parentId)?.name 
                                                  : districts.find(d => d.id === item.parentId)?.name}
                                          </td>
                                      )}
                                      <td className="px-6 py-3 text-right">
                                          <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16}/></button>
                                      </td>
                                  </tr>
                              ))}
                              {/* Empty State */}
                              {(
                                  (locTab === 'province' && provinces.length === 0) ||
                                  (locTab === 'district' && !locParentId) ||
                                  (locTab === 'ward' && !locParentId)
                              ) && (
                                  <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic">Chưa có dữ liệu hoặc chưa chọn cấp cha.</td></tr>
                              )}
                          </tbody>
                      </table>
                  )}
              </div>
          </div>
      </div>
  );
};