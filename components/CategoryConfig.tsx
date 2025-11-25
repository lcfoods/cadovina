import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Map,
  Briefcase,
  Network,
  Edit,
  X,
  Save,
  FolderTree,
  CornerDownRight,
} from 'lucide-react';
import { LocationItem, Department, Position } from '../types';

interface CategoryConfigProps {
  provinces: LocationItem[];
  onUpdateProvinces: (i: LocationItem[]) => void;
  districts: LocationItem[];
  onUpdateDistricts: (i: LocationItem[]) => void;
  wards: LocationItem[];
  onUpdateWards: (i: LocationItem[]) => void;
  departments: Department[];
  onUpdateDepartments: (i: Department[]) => void;
  positions: Position[];
  onUpdatePositions: (i: Position[]) => void;
}

export const CategoryConfig: React.FC<CategoryConfigProps> = ({
  provinces,
  onUpdateProvinces,
  districts,
  onUpdateDistricts,
  wards,
  onUpdateWards,
  departments,
  onUpdateDepartments,
  positions,
  onUpdatePositions,
}) => {
  const [activeTab, setActiveTab] = useState<'location' | 'department' | 'position'>('location');

  // Location
  const [locTab, setLocTab] = useState<'province' | 'district' | 'ward'>('province');
  const [locParentId, setLocParentId] = useState('');

  // Inputs
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState(''); // Mã chức vụ
  const [deptParentId, setDeptParentId] = useState('');

  // Editing
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- Auto-select parent for location when đổi tab ---
  useEffect(() => {
    if (editingId) return;

    if (activeTab === 'location') {
      if (locTab === 'province') {
        setLocParentId('');
      } else if (locTab === 'district') {
        const validProvince = provinces.some((p) => p.id === locParentId);
        if (!validProvince && provinces.length > 0) {
          setLocParentId(provinces[0].id);
        }
      } else if (locTab === 'ward') {
        const validDistrict = districts.some((d) => d.id === locParentId);
        if (!validDistrict && districts.length > 0) {
          setLocParentId(districts[0].id);
        }
      }
    }
  }, [locTab, activeTab, provinces, districts, editingId, locParentId]);

  const resetForm = () => {
    setNewName('');
    setNewCode('');
    setDeptParentId('');
    setEditingId(null);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setNewName(item.name || '');

    if (activeTab === 'position') {
      setNewCode(item.code || '');
    }

    if (activeTab === 'location') {
      if (item.parentId) setLocParentId(item.parentId);
    } else if (activeTab === 'department') {
      setDeptParentId(item.parentId || '');
    }
  };

  const handleSave = () => {
    if (!newName.trim()) {
      alert('Vui lòng nhập tên!');
      return;
    }

    // Chuẩn hóa mã chức vụ
    const normalizedCode = newCode.trim().toUpperCase();

    if (activeTab === 'position') {
      if (!normalizedCode) {
        alert('Vui lòng nhập mã chức vụ!');
        return;
      }

      // Check trùng mã
      const isDuplicate = positions.some(
        (p) =>
          p.code.toUpperCase() === normalizedCode &&
          p.id !== editingId,
      );
      if (isDuplicate) {
        alert(`Mã chức vụ '${normalizedCode}' đã tồn tại! Vui lòng chọn mã khác.`);
        return;
      }
    }

    if (editingId) {
      // UPDATE
      if (activeTab === 'location') {
        if (locTab === 'province') {
          onUpdateProvinces(
            provinces.map((x) =>
              x.id === editingId ? { ...x, name: newName.trim() } : x,
            ),
          );
        } else if (locTab === 'district') {
          onUpdateDistricts(
            districts.map((x) =>
              x.id === editingId
                ? { ...x, name: newName.trim(), parentId: locParentId }
                : x,
            ),
          );
        } else {
          onUpdateWards(
            wards.map((x) =>
              x.id === editingId
                ? { ...x, name: newName.trim(), parentId: locParentId }
                : x,
            ),
          );
        }
      } else if (activeTab === 'department') {
        if (deptParentId === editingId) {
          alert('Lỗi: Đơn vị cha không thể là chính nó!');
          return;
        }
        onUpdateDepartments(
          departments.map((x) =>
            x.id === editingId
              ? { ...x, name: newName.trim(), parentId: deptParentId || undefined }
              : x,
          ),
        );
      } else {
        // position
        onUpdatePositions(
          positions.map((x) =>
            x.id === editingId
              ? { ...x, name: newName.trim(), code: normalizedCode }
              : x,
          ),
        );
      }
    } else {
      // CREATE
      const id = Date.now().toString();

      if (activeTab === 'location') {
        if (locTab === 'province') {
          onUpdateProvinces([...provinces, { id, name: newName.trim() }]);
        } else if (locTab === 'district') {
          onUpdateDistricts([
            ...districts,
            { id, name: newName.trim(), parentId: locParentId },
          ]);
        } else {
          onUpdateWards([
            ...wards,
            { id, name: newName.trim(), parentId: locParentId },
          ]);
        }
      } else if (activeTab === 'department') {
        onUpdateDepartments([
          ...departments,
          { id, name: newName.trim(), parentId: deptParentId || undefined },
        ]);
      } else {
        onUpdatePositions([
          ...positions,
          { id, name: newName.trim(), code: normalizedCode },
        ]);
      }
    }

    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Xóa mục này?')) return;

    if (activeTab === 'location') {
      if (locTab === 'province') {
        onUpdateProvinces(provinces.filter((x) => x.id !== id));
      } else if (locTab === 'district') {
        onUpdateDistricts(districts.filter((x) => x.id !== id));
      } else {
        onUpdateWards(wards.filter((x) => x.id !== id));
      }
    } else if (activeTab === 'department') {
      onUpdateDepartments(departments.filter((x) => x.id !== id));
    } else {
      onUpdatePositions(positions.filter((x) => x.id !== id));
    }

    if (editingId === id) resetForm();
  };

  const renderDeptTree = (parentId?: string, level = 0): React.ReactNode => {
    const items = departments.filter((d) =>
      parentId ? d.parentId === parentId : !d.parentId,
    );
    if (items.length === 0) return null;

    return items.map((d) => (
      <div key={d.id}>
        <div
          className="flex justify-between items-center p-3 border-b border-gray-100 hover:bg-gray-50 group bg-white"
          style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
          <div className="flex items-center gap-3">
            {level > 0 && (
              <CornerDownRight size={14} className="text-gray-300" />
            )}
            <span
              className={`flex items-center gap-2 text-sm ${
                level === 0 ? 'font-bold text-gray-800' : 'text-gray-700'
              }`}
            >
              {level === 0 ? (
                <Network size={16} className="text-cadovina-600" />
              ) : (
                <FolderTree size={14} className="text-gray-400" />
              )}
              {d.name}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleEdit(d)}
              className="text-blue-500 p-1.5 hover:bg-blue-50 rounded"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={() => handleDelete(d.id)}
              className="text-red-500 p-1.5 hover:bg-red-50 rounded"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <div className="ml-4 border-l border-gray-200 border-dashed">
          {renderDeptTree(d.id, level + 1)}
        </div>
      </div>
    ));
  };

  const currentLocList =
    locTab === 'province'
      ? provinces
      : locTab === 'district'
      ? districts.filter((d) => d.parentId === locParentId)
      : wards.filter((w) => w.parentId === locParentId);

  const nameInputColClass =
    activeTab === 'position'
      ? '' // không dùng
      : (activeTab === 'location' && locTab !== 'province') || activeTab === 'department'
      ? 'md:col-span-6'
      : 'md:col-span-9';

  return (
    <div className="p-6 h-full bg-gray-50 flex flex-col min-h-0">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b bg-gray-50 flex-none overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('location');
              resetForm();
            }}
            className={`px-6 py-3 font-bold text-sm flex items-center gap-2 ${
              activeTab === 'location'
                ? 'bg-white border-t-2 border-cadovina-600 text-cadovina-600'
                : 'text-gray-500'
            }`}
          >
            <Map size={16} /> Địa Chính
          </button>
          <button
            onClick={() => {
              setActiveTab('department');
              resetForm();
            }}
            className={`px-6 py-3 font-bold text-sm flex items-center gap-2 ${
              activeTab === 'department'
                ? 'bg-white border-t-2 border-cadovina-600 text-cadovina-600'
                : 'text-gray-500'
            }`}
          >
            <Network size={16} /> Phòng Ban
          </button>
          <button
            onClick={() => {
              setActiveTab('position');
              resetForm();
            }}
            className={`px-6 py-3 font-bold text-sm flex items-center gap-2 ${
              activeTab === 'position'
                ? 'bg-white border-t-2 border-cadovina-600 text-cadovina-600'
                : 'text-gray-500'
            }`}
          >
            <Briefcase size={16} /> Chức Vụ
          </button>
        </div>

        {/* Form bar */}
        <div
          className={`p-4 border-b grid grid-cols-1 md:grid-cols-12 gap-4 items-end flex-none z-20 shadow-sm transition-colors ${
            editingId ? 'bg-blue-50/50' : 'bg-white'
          }`}
        >
          {/* Parent selector cho Location */}
          {activeTab === 'location' && locTab !== 'province' && (
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">
                {locTab === 'district' ? 'Thuộc Tỉnh' : 'Thuộc Quận'}
              </label>
              <select
                value={locParentId}
                onChange={(e) => setLocParentId(e.target.value)}
                className="w-full border p-2.5 rounded text-sm"
              >
                <option value="">-- Chọn --</option>
                {(locTab === 'district' ? provinces : districts).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Parent selector cho Department */}
          {activeTab === 'department' && (
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">
                Cấp Cha
              </label>
              <select
                value={deptParentId}
                onChange={(e) => setDeptParentId(e.target.value)}
                className="w-full border p-2.5 rounded text-sm"
              >
                <option value="">-- Cấp cao nhất --</option>
                {departments
                  .filter((d) => d.id !== editingId)
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* INPUT cho tab Chức vụ: MÃ + TÊN */}
          {activeTab === 'position' ? (
            <>
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">
                  Mã chức vụ <span className="text-red-500">*</span>
                </label>
                <input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="w-full border p-2.5 rounded text-sm font-mono uppercase"
                  placeholder="VD: GĐ"
                />
              </div>
              <div className="md:col-span-6">
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">
                  Tên chức vụ <span className="text-red-500">*</span>
                </label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border p-2.5 rounded text-sm"
                  placeholder="Nhập tên chức vụ..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>
            </>
          ) : (
            // INPUT cho các tab khác
            <div className={nameInputColClass}>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">
                {editingId ? 'Sửa tên' : 'Tên hiển thị'}
              </label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border p-2.5 rounded text-sm"
                placeholder="Nhập tên..."
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
          )}

          {/* Buttons */}
          <div className="md:col-span-3 flex gap-2">
            {editingId ? (
              <>
                <button
                  onClick={resetForm}
                  className="w-1/3 bg-white border rounded flex items-center justify-center"
                >
                  <X size={18} />
                </button>
                <button
                  onClick={handleSave}
                  className="w-2/3 bg-blue-600 text-white py-2.5 rounded font-bold flex items-center justify-center gap-2 text-sm"
                >
                  <Save size={18} /> Lưu
                </button>
              </>
            ) : (
              <button
                onClick={handleSave}
                className="w-full bg-cadovina-600 text-white py-2.5 rounded font-bold flex items-center justify-center gap-2 text-sm"
              >
                <Plus size={18} /> Thêm Mới
              </button>
            )}
          </div>
        </div>

        {/* Sub-tabs cho Địa chính */}
        {activeTab === 'location' && (
          <div className="flex border-b bg-gray-100 px-4 gap-2 flex-none">
            <button
              onClick={() => {
                setLocTab('province');
                resetForm();
              }}
              className={`py-3 px-4 text-xs font-bold border-b-2 ${
                locTab === 'province'
                  ? 'border-cadovina-600 text-cadovina-600'
                  : 'border-transparent'
              }`}
            >
              Tỉnh / Thành
            </button>
            <button
              onClick={() => {
                setLocTab('district');
                resetForm();
              }}
              className={`py-3 px-4 text-xs font-bold border-b-2 ${
                locTab === 'district'
                  ? 'border-cadovina-600 text-cadovina-600'
                  : 'border-transparent'
              }`}
            >
              Quận / Huyện
            </button>
            <button
              onClick={() => {
                setLocTab('ward');
                resetForm();
              }}
              className={`py-3 px-4 text-xs font-bold border-b-2 ${
                locTab === 'ward'
                  ? 'border-cadovina-600 text-cadovina-600'
                  : 'border-transparent'
              }`}
            >
              Phường / Xã
            </button>
          </div>
        )}

        {/* BODY */}
        <div className="flex-1 overflow-auto bg-white">
          {activeTab === 'department' ? (
            <div className="border-b border-gray-100">{renderDeptTree()}</div>
          ) : activeTab === 'position' ? (
            // BẢNG CHỨC VỤ
            <div className="w-full">
              <div className="flex bg-gray-50 border-b border-gray-200 font-bold text-xs text-gray-600 uppercase">
                <div className="px-4 py-3 w-32">Mã</div>
                <div className="px-4 py-3 flex-1">Tên chức vụ</div>
                <div className="px-4 py-3 w-24 text-right">Thao tác</div>
              </div>
              <div className="divide-y divide-gray-100">
                {positions.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center hover:bg-gray-50 group"
                  >
                    <div className="px-4 py-3 w-32 font-mono text-sm text-cadovina-600 font-bold">
                      {p.code}
                    </div>
                    <div className="px-4 py-3 flex-1 text-sm text-gray-900 font-semibold">
                      {p.name}
                    </div>
                    <div className="px-4 py-3 w-24 flex justify-end gap-1">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-blue-500 p-1.5 hover:bg-blue-50 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-500 p-1.5 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // BẢNG ĐỊA CHÍNH
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-xs sticky top-0">
                <tr>
                  <th className="px-6 py-3 border-b">Tên Đơn Vị</th>
                  {locTab !== 'province' && (
                    <th className="px-6 py-3 border-b">Trực Thuộc</th>
                  )}
                  <th className="px-6 py-3 border-b text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentLocList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-6 py-3 font-semibold text-gray-900">
                      {item.name}
                    </td>
                    {locTab !== 'province' && (
                      <td className="px-6 py-3 text-gray-500">
                        {locTab === 'district'
                          ? provinces.find((p) => p.id === item.parentId)?.name
                          : districts.find((d) => d.id === item.parentId)?.name}
                      </td>
                    )}
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-500 p-1.5 hover:bg-blue-50 rounded"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 p-1.5 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
