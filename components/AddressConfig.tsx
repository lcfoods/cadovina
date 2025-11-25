import React, { useState } from 'react';
import { Plus, Trash2, Map } from 'lucide-react';
import { LocationItem } from '../types';

interface AddressConfigProps {
  provinces: LocationItem[];
  districts: LocationItem[];
  wards: LocationItem[];
  onUpdateProvinces: (items: LocationItem[]) => void;
  onUpdateDistricts: (items: LocationItem[]) => void;
  onUpdateWards: (items: LocationItem[]) => void;
}

export const AddressConfig: React.FC<AddressConfigProps> = ({
  provinces, districts, wards,
  onUpdateProvinces, onUpdateDistricts, onUpdateWards
}) => {
  const [activeTab, setActiveTab] = useState<'province' | 'district' | 'ward'>('province');
  const [newName, setNewName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    const id = Math.floor(Math.random() * 100000).toString();

    if (activeTab === 'province') {
      onUpdateProvinces([...provinces, { id, name: newName }]);
    } else if (activeTab === 'district') {
      if (!selectedParentId) { alert("Vui lòng chọn Tỉnh/Thành phố trực thuộc"); return; }
      onUpdateDistricts([...districts, { id, name: newName, parentId: selectedParentId }]);
    } else {
      if (!selectedParentId) { alert("Vui lòng chọn Quận/Huyện trực thuộc"); return; }
      onUpdateWards([...wards, { id, name: newName, parentId: selectedParentId }]);
    }
    setNewName('');
  };

  const handleDelete = (id: string, type: 'province' | 'district' | 'ward') => {
    if (!window.confirm("Bạn có chắc muốn xóa? Dữ liệu liên quan có thể bị ảnh hưởng.")) return;
    
    if (type === 'province') {
      onUpdateProvinces(provinces.filter(p => p.id !== id));
    } else if (type === 'district') {
      onUpdateDistricts(districts.filter(d => d.id !== id));
    } else {
      onUpdateWards(wards.filter(w => w.id !== id));
    }
  };

  return (
    <div className="p-6 h-full flex flex-col bg-gray-50">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Map className="text-cadovina-600" />
            Danh Mục Địa Chính
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
          <button 
            onClick={() => { setActiveTab('province'); setSelectedParentId(''); }}
            className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'province' ? 'border-b-2 border-cadovina-600 text-cadovina-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Tỉnh / Thành Phố
          </button>
          <button 
            onClick={() => { setActiveTab('district'); setSelectedParentId(provinces[0]?.id || ''); }}
            className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'district' ? 'border-b-2 border-cadovina-600 text-cadovina-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Quận / Huyện
          </button>
          <button 
            onClick={() => { setActiveTab('ward'); setSelectedParentId(districts[0]?.id || ''); }}
            className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'ward' ? 'border-b-2 border-cadovina-600 text-cadovina-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Phường / Xã
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          
          {/* Parent Selector (for District/Ward) */}
          {activeTab !== 'province' && (
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {activeTab === 'district' ? 'Thuộc Tỉnh/Thành:' : 'Thuộc Quận/Huyện:'}
              </label>
              <select 
                value={selectedParentId} 
                onChange={(e) => setSelectedParentId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:ring-2 focus:ring-cadovina-500 focus:outline-none"
              >
                <option value="">-- Chọn --</option>
                {activeTab === 'district' 
                  ? provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                  : districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)
                }
              </select>
            </div>
          )}

          {/* Name Input */}
          <div className={`${activeTab === 'province' ? 'md:col-span-9' : 'md:col-span-6'}`}>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tên đơn vị hành chính:</label>
            <input 
              type="text" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={`Nhập tên ${activeTab === 'province' ? 'Tỉnh/TP' : activeTab === 'district' ? 'Quận/Huyện' : 'Phường/Xã'}...`}
              className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:ring-2 focus:ring-cadovina-500 focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>

          <div className="md:col-span-3">
            <button 
              onClick={handleAdd}
              className="w-full py-2 px-4 bg-cadovina-600 text-white rounded hover:bg-cadovina-700 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            >
              <Plus size={16} /> Thêm Mới
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-0">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs text-gray-600 uppercase bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 w-24 border-b border-gray-200">ID</th>
                <th className="px-6 py-3 border-b border-gray-200">Tên Đơn Vị</th>
                {activeTab !== 'province' && <th className="px-6 py-3 border-b border-gray-200">Trực Thuộc</th>}
                <th className="px-6 py-3 text-right border-b border-gray-200">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {(activeTab === 'province' ? provinces : 
                activeTab === 'district' ? districts.filter(d => !selectedParentId || d.parentId === selectedParentId) :
                wards.filter(w => !selectedParentId || w.parentId === selectedParentId)
              ).map((item) => (
                <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-3 text-gray-500 font-mono text-xs">{item.id}</td>
                  {/* Explicit text-gray-900 to fix white text issue */}
                  <td className="px-6 py-3 font-semibold text-gray-900">{item.name}</td>
                  {activeTab !== 'province' && (
                    <td className="px-6 py-3 text-gray-600">
                      {activeTab === 'district' 
                        ? provinces.find(p => p.id === item.parentId)?.name 
                        : districts.find(d => d.id === item.parentId)?.name}
                    </td>
                  )}
                  <td className="px-6 py-3 text-right">
                    <button 
                      onClick={() => handleDelete(item.id, activeTab)}
                      className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {/* Empty state */}
              {((activeTab === 'province' && provinces.length === 0) || 
                (activeTab === 'district' && districts.filter(d => !selectedParentId || d.parentId === selectedParentId).length === 0) ||
                (activeTab === 'ward' && wards.filter(w => !selectedParentId || w.parentId === selectedParentId).length === 0)) && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                    Không có dữ liệu hiển thị
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
