import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Map, Briefcase, Network, ChevronRight, Edit, X, Save, FolderTree, CornerDownRight } from 'lucide-react';
import { LocationItem, Department, Position } from '../types';

interface CategoryConfigProps {
  provinces: LocationItem[]; onUpdateProvinces: (i: LocationItem[]) => void;
  districts: LocationItem[]; onUpdateDistricts: (i: LocationItem[]) => void;
  wards: LocationItem[]; onUpdateWards: (i: LocationItem[]) => void;
  departments: Department[]; onUpdateDepartments: (i: Department[]) => void;
  positions: Position[]; onUpdatePositions: (i: Position[]) => void;
}

export const CategoryConfig: React.FC<CategoryConfigProps> = ({ 
  provinces, onUpdateProvinces, 
  districts, onUpdateDistricts, 
  wards, onUpdateWards, 
  departments, onUpdateDepartments, 
  positions, onUpdatePositions 
}) => {
  const [activeTab, setActiveTab] = useState<'location' | 'department' | 'position'>('location');
  
  // Location States
  const [locTab, setLocTab] = useState<'province' | 'district' | 'ward'>('province');
  const [locParentId, setLocParentId] = useState('');

  // Input States
  const [newName, setNewName] = useState('');
  const [deptParentId, setDeptParentId] = useState('');

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Auto-select parent when switching location tabs
  // We skip this logic if we are currently editing an item to prevent overwriting the parent ID of the item being edited.
  useEffect(() => {
    if (editingId) return; 

    if (activeTab === 'location') {
        if (locTab === 'province') {
            setLocParentId('');
        } else if (locTab === 'district') {
            const isValidProvince = provinces.some(p => p.id === locParentId);
            if (!isValidProvince) {
                setLocParentId(provinces.length > 0 ? provinces[0].id : '');
            }
        } else if (locTab === 'ward') {
            const isValidDistrict = districts.some(d => d.id === locParentId);
            if (!isValidDistrict) {
                setLocParentId(districts.length > 0 ? districts[0].id : '');
            }
        }
    }
  }, [locTab, activeTab, provinces, districts, editingId]);

  const resetForm = () => {
      setNewName('');
      setEditingId(null);
      // Optional: Reset parent ID to default logic after edit is done/cancelled
      if (activeTab === 'location' && locTab !== 'province') {
           // We keep the current locParentId or reset it? 
           // Keeping it allows continuing to add items to the same parent.
      }
  };

  const handleEdit = (item: any) => {
      setEditingId(item.id);
      setNewName(item.name);
      
      if (activeTab === 'location') {
          // Correctly populate parent selector
          if (item.parentId) {
              setLocParentId(item.parentId);
          } else {
              // For Province (no parent), ensure selector is cleared (though hidden)
              setLocParentId('');
          }
      } else if (activeTab === 'department') {
          if (item.parentId) setDeptParentId(item.parentId);
          else setDeptParentId('');
      }
  };

  const handleSave = () => {
      if (!newName.trim()) return alert("Vui lòng nhập tên!");
      
      // --- UPDATE LOGIC ---
      if (editingId) {
          if (activeTab === 'location') {
              if (locTab === 'province') {
                  onUpdateProvinces(provinces.map(x => x.id === editingId ? { ...x, name: newName } : x));
              } else if (locTab === 'district') {
                  if (!locParentId) return alert("Vui lòng chọn Tỉnh/Thành phố trực thuộc!");
                  onUpdateDistricts(districts.map(x => x.id === editingId ? { ...x, name: newName, parentId: locParentId } : x));
              } else {
                  if (!locParentId) return alert("Vui lòng chọn Quận/Huyện trực thuộc!");
                  onUpdateWards(wards.map(x => x.id === editingId ? { ...x, name: newName, parentId: locParentId } : x));
              }
          } else if (activeTab === 'department') {
              if (deptParentId === editingId) return alert("Không thể chọn chính mình làm cấp cha!");
              onUpdateDepartments(departments.map(x => x.id === editingId ? { ...x, name: newName, parentId: deptParentId || undefined } : x));
          } else {
              onUpdatePositions(positions.map(x => x.id === editingId ? { ...x, name: newName } : x));
          }
          resetForm();
          return;
      }

      // --- CREATE LOGIC ---
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
      resetForm();
  };

  const handleDelete = (id: string) => {
      if (!window.confirm("Bạn chắc chắn muốn xóa?")) return;
      if (activeTab === 'location') {
          if (locTab === 'province') onUpdateProvinces(provinces.filter(x => x.id !== id));
          else if (locTab === 'district') onUpdateDistricts(districts.filter(x => x.id !== id));
          else onUpdateWards(wards.filter(x => x.id !== id));
      } else if (activeTab === 'department') onUpdateDepartments(departments.filter(x => x.id !== id));
      else onUpdatePositions(positions.filter(x => x.id !== id));
      
      if (editingId === id) resetForm();
  };

  const renderDeptTree = (parentId?: string, level = 0) => {
      const items = departments.filter(d => parentId ? d.parentId === parentId : !d.parentId);
      if (items.length === 0) return null;

      return items.map(d => (
          <div key={d.id} className="relative">
              <div 
                className="flex justify-between items-center p-3 border-b border-gray-100 hover:bg-gray-50 group transition-colors bg-white relative z-10"
                style={{ paddingLeft: `${level * 24 + 12}px` }}
              >
                  <div className="flex items-center gap-3">
                      {level > 0 && <CornerDownRight size={14} className="text-gray-300" />}
                      <span className={`flex items-center gap-2 text-sm ${level === 0 ? 'font-bold text-gray-800' : 'text-gray-700'}`}>
                          {level === 0 ? <Network size={16} className="text-cadovina-600"/> : <FolderTree size={14} className="text-gray-400"/>}
                          {d.name}
                      </span>
                  </div>
                  <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(d)} className="text-blue-500 p-1.5 hover:bg-blue-50 rounded" title="Sửa"><Edit size={14}/></button>
                      <button onClick={() => handleDelete(d.id)} className="text-red-500 p-1.5 hover:bg-red-50 rounded" title="Xóa"><Trash2 size={14}/></button>
                  </div>
              </div>
              <div className="ml-4 border-l border-gray-200 border-dashed">
                  {renderDeptTree(d.id, level + 1)}
              </div>
          </div>
      ));
  };

  // Helper to get the list to display in the table.
  // When editing, we want to show the siblings of the item being edited (based on the parent ID in the form),
  // or the list filtered by the currently selected parent drop down.
  const getLocationList = () => {
    if (locTab === 'province') return provinces;
    if (locTab === 'district') return districts.filter(d => d.parentId === locParentId);
    return wards.filter(w => w.parentId === locParentId);
  };
  const currentLocList = getLocationList();

  return (
      <div className="p-6 h-full bg-gray-50 flex flex-col min-h-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
              
              {/* Header Tabs */}
              <div className="flex border-b bg-gray-50 flex-none overflow-x-auto">
                  <button onClick={() => { setActiveTab('location'); resetForm(); }} className={`whitespace-nowrap px-6 py-3 font-bold text-sm flex items-center gap-2 ${activeTab === 'location' ? 'bg-white border-t-2 border-cadovina-600 text-cadovina-600' : 'text-gray-500 hover:text-gray-700'}`}><Map size={16}/> Địa Chính</button>
                  <button onClick={() => { setActiveTab('department'); resetForm(); }} className={`whitespace-nowrap px-6 py-3 font-bold text-sm flex items-center gap-2 ${activeTab === 'department' ? 'bg-white border-t-2 border-cadovina-600 text-cadovina-600' : 'text-gray-500 hover:text-gray-700'}`}><Network size={16}/> Phòng Ban</button>
                  <button onClick={() => { setActiveTab('position'); resetForm(); }} className={`whitespace-nowrap px-6 py-3 font-bold text-sm flex items-center gap-2 ${activeTab === 'position' ? 'bg-white border-t-2 border-cadovina-600 text-cadovina-600' : 'text-gray-500 hover:text-gray-700'}`}><Briefcase size={16}/> Chức Vụ</button>
              </div>

              {/* Controls */}
              <div className={`p-4 border-b grid grid-cols-1 md:grid-cols-12 gap-4 items-end flex-none z-20 shadow-sm transition-colors ${editingId ? 'bg-blue-50/50' : 'bg-white'}`}>
                  {/* Parent Select for Location */}
                  {activeTab === 'location' && locTab !== 'province' && (
                      <div className="md:col-span-3">
                          <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">
                              {locTab === 'district' ? 'Thuộc Tỉnh/Thành' : 'Thuộc Quận/Huyện'}
                          </label>
                          <select value={locParentId} onChange={e => setLocParentId(e.target.value)} className="w-full border p-2.5 rounded text-sm bg-white text-gray-900 focus:ring-2 focus:ring-cadovina-600">
                              <option value="">-- Chọn --</option>
                              {(locTab === 'district' ? provinces : districts).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                      </div>
                  )}

                  {/* Parent Select for Department */}
                  {activeTab === 'department' && (
                      <div className="md:col-span-3">
                          <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Cấp Cha</label>
                          <select value={deptParentId} onChange={e => setDeptParentId(e.target.value)} className="w-full border p-2.5 rounded text-sm bg-white text-gray-900 focus:ring-2 focus:ring-cadovina-600">
                              <option value="">-- Cấp cao nhất --</option>
                              {departments.filter(d => d.id !== editingId).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                      </div>
                  )}

                  {/* Name Input */}
                  <div className={`md:col-span-${(activeTab === 'location' && locTab !== 'province') || activeTab === 'department' ? '6' : '9'}`}>
                      <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">
                          {editingId ? 'Sửa tên' : 'Tên hiển thị'}
                      </label>
                      <input 
                        value={newName} 
                        onChange={e => setNewName(e.target.value)} 
                        placeholder="Nhập tên danh mục..." 
                        className="w-full border border-gray-300 p-2.5 rounded text-sm text-gray-900 focus:ring-2 focus:ring-cadovina-600 focus:outline-none"
                        onKeyDown={e => e.key === 'Enter' && handleSave()}
                      />
                  </div>
                  
                  <div className="md:col-span-3 flex gap-2">
                      {editingId ? (
                        <>
                            <button onClick={resetForm} className="w-1/3 bg-white border border-gray-300 text-gray-600 rounded hover:bg-gray-100 flex items-center justify-center" title="Hủy"><X size={18}/></button>
                            <button onClick={handleSave} className="w-2/3 bg-blue-600 text-white py-2.5 rounded font-bold hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"><Save size={18}/> Lưu</button>
                        </>
                      ) : (
                        <button onClick={handleSave} className="w-full bg-cadovina-600 text-white py-2.5 rounded font-bold hover:bg-cadovina-700 flex items-center justify-center gap-2 text-sm active:translate-y-0.5"><Plus size={18}/> Thêm Mới</button>
                      )}
                  </div>
              </div>

              {/* Sub-tabs for Location */}
              {activeTab === 'location' && (
                  <div className="flex border-b bg-gray-100 px-4 gap-2 flex-none">
                      <button onClick={() => { setLocTab('province'); resetForm(); }} className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${locTab === 'province' ? 'border-cadovina-600 text-cadovina-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Tỉnh / Thành</button>
                      <button onClick={() => { setLocTab('district'); resetForm(); }} className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${locTab === 'district' ? 'border-cadovina-600 text-cadovina-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Quận / Huyện</button>
                      <button onClick={() => { setLocTab('ward'); resetForm(); }} className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${locTab === 'ward' ? 'border-cadovina-600 text-cadovina-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Phường / Xã</button>
                  </div>
              )}

              {/* Content List */}
              <div className="flex-1 overflow-auto bg-white relative">
                  {/* 1. Departments Tree View */}
                  {activeTab === 'department' && (
                      <div className="min-w-full inline-block align-middle">
                          {departments.length > 0 ? (
                            <div className="border-b border-gray-100">{renderDeptTree(undefined)}</div>
                          ) : (
                            <div className="p-12 text-center text-gray-400 italic">Chưa có phòng ban nào.</div>
                          )}
                      </div>
                  )}

                  {/* 2. Positions List */}
                  {activeTab === 'position' && (
                      <div className="min-w-full">
                          {positions.length > 0 ? positions.map(p => (
                              <div key={p.id} className="flex justify-between items-center p-3 border-b border-gray-100 hover:bg-gray-50 group">
                                  <span className="font-semibold text-sm text-gray-900 pl-2">{p.name}</span>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => handleEdit(p)} className="text-blue-500 p-1.5 hover:bg-blue-50 rounded" title="Sửa"><Edit size={16}/></button>
                                      <button onClick={() => handleDelete(p.id)} className="text-red-500 p-1.5 hover:bg-red-50 rounded" title="Xóa"><Trash2 size={16}/></button>
                                  </div>
                              </div>
                          )) : (
                            <div className="p-12 text-center text-gray-400 italic">Chưa có chức vụ nào.</div>
                          )}
                      </div>
                  )}

                  {/* 3. Location Table */}
                  {activeTab === 'location' && (
                      <table className="w-full text-sm text-left border-collapse table-auto">
                          <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-xs sticky top-0 z-10 shadow-sm">
                              <tr>
                                  <th className="px-6 py-3 border-b">Tên Đơn Vị</th>
                                  {locTab !== 'province' && <th className="px-6 py-3 border-b">Trực Thuộc</th>}
                                  <th className="px-6 py-3 border-b text-right">Thao Tác</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {currentLocList.length > 0 ? (
                                currentLocList.map(item => (
                                  <tr key={item.id} className="hover:bg-blue-50 transition-colors group">
                                      <td className="px-6 py-3 font-semibold text-gray-900">{item.name}</td>
                                      {locTab !== 'province' && (
                                          <td className="px-6 py-3 text-gray-500">
                                              {locTab === 'district' 
                                                  ? provinces.find(p => p.id === item.parentId)?.name 
                                                  : districts.find(d => d.id === item.parentId)?.name}
                                          </td>
                                      )}
                                      <td className="px-6 py-3 text-right">
                                          <div className="flex items-center justify-end gap-1">
                                              <button onClick={() => handleEdit(item)} className="text-blue-500 p-1.5 hover:bg-blue-50 rounded" title="Sửa"><Edit size={16}/></button>
                                              <button onClick={() => handleDelete(item.id)} className="text-red-500 p-1.5 hover:bg-red-50 rounded" title="Xóa"><Trash2 size={16}/></button>
                                          </div>
                                      </td>
                                  </tr>
                                ))
                              ) : (
                                  <tr>
                                      <td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic">
                                          {(locTab !== 'province' && !locParentId) 
                                            ? 'Vui lòng chọn đơn vị cấp trên (Tỉnh/Huyện) để xem dữ liệu.' 
                                            : 'Chưa có dữ liệu nào trong danh sách này.'}
                                      </td>
                                  </tr>
                              )}
                          </tbody>
                      </table>
                  )}
              </div>
          </div>
      </div>
  );
};