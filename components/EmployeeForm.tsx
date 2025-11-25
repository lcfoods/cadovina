import React, { useState, useEffect, useMemo } from 'react';
import {
  Save,
  Wand2,
  Loader2,
  MapPin,
  AlertTriangle,
  FileText,
  CheckCircle2,
  X,
  Building2,
  Calendar,
} from 'lucide-react';
import { FormInput } from './FormInput';
import {
  DEPARTMENTS,
  POSITIONS,
  STATUS_OPTIONS,
  GENDER_OPTIONS,
  INITIAL_PROVINCES,
  INITIAL_DISTRICTS,
  INITIAL_WARDS,
} from '../constants';
import {
  Employee,
  EmployeeStatus,
  Gender,
  LocationItem,
  Department,
  Position,
} from '../types';
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
  id: '',
  employeeCode: '',
  fullName: '',
  gender: Gender.MALE,
  dob: '',
  phone: '',
  email: '',
  identityCard: '',
  issuedDate: '',
  issuedPlace: '',
  street: '',
  province: '',
  district: '',
  ward: '',
  addressLevel: 3,
  department: '',
  position: '',
  startDate: new Date().toISOString().split('T')[0],
  resignationDate: '',
  salary: 0,
  status: EmployeeStatus.ACTIVE,
};

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  onSave,
  onCancel,
  provinces = INITIAL_PROVINCES,
  districts = INITIAL_DISTRICTS,
  wards = INITIAL_WARDS,
  initialData = null,
  existingEmployees = [],
  departments = DEPARTMENTS,
  positions = POSITIONS,
}) => {
  const [formData, setFormData] = useState<Employee>(INITIAL_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof Employee, string>>>(
    {}
  );
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Constants
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const renderDeptOptions = (): JSX.Element[] => {
    // Trường hợp departments là string[]
    if (departments.length > 0 && typeof departments[0] === 'string') {
      return (departments as string[]).map((d) => (
        <option key={d} value={d}>
          {d}
        </option>
      ));
    }

    const depts = departments as Department[];

    // Hàm đệ quy có type rõ ràng để tránh TS7023/TS7024
    const renderNode = (dept: Department, level: number): JSX.Element[] => {
      const children = depts.filter((d) => d.parentId === dept.id);

      const currentOption = (
        <option key={dept.id} value={dept.name}>
          {'\u00A0\u00A0'.repeat(level) +
            (level > 0 ? '└─ ' : '') +
            dept.name}
        </option>
      );

      let childOptions: JSX.Element[] = [];
      children.forEach((child) => {
        childOptions = childOptions.concat(renderNode(child, level + 1));
      });

      return [currentOption, ...childOptions];
    };

    // Gom tất cả root department + con cháu thành 1 mảng phẳng
    return depts
      .filter((d) => !d.parentId)
      .reduce<JSX.Element[]>(
        (acc, root) => acc.concat(renderNode(root, 0)),
        []
      );
  };

  const posOptions = useMemo(
    () =>
      positions.length && typeof positions[0] === 'string'
        ? (positions as string[])
        : (positions as Position[]).map((p) => p.name),
    [positions]
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const r = Math.floor(Math.random() * 10000).toString();
      setFormData({
        ...INITIAL_STATE,
        id: r,
        employeeCode: `NV${r.padStart(4, '0')}`,
      });
    }
  }, [initialData]);

  // Validate Duplicates
  const isDuplicateIdentity = useMemo(
    () =>
      !formData.identityCard || formData.identityCard.length < 9
        ? false
        : existingEmployees.some(
            (e) => e.identityCard === formData.identityCard && e.id !== formData.id
          ),
    [formData.identityCard, existingEmployees, formData.id]
  );

  const isDuplicateCode = useMemo(
    () =>
      !formData.employeeCode
        ? false
        : existingEmployees.some(
            (e) => e.employeeCode === formData.employeeCode && e.id !== formData.id
          ),
    [formData.employeeCode, existingEmployees, formData.id]
  );

  useEffect(() => {
    if (isDuplicateIdentity) {
      setErrors((p) => ({
        ...p,
        identityCard: 'Số CCCD/CMND này đã tồn tại!',
      }));
    } else {
      setErrors((p) => ({ ...p, identityCard: undefined }));
    }
  }, [isDuplicateIdentity]);

  useEffect(() => {
    if (isDuplicateCode) {
      setErrors((p) => ({ ...p, employeeCode: 'Mã nhân viên đã tồn tại!' }));
    } else {
      setErrors((p) => ({ ...p, employeeCode: undefined }));
    }
  }, [isDuplicateCode]);

  // Location logic
  const availableDistricts = useMemo(() => {
    const p = provinces.find((x) => x.name === formData.province);
    return p ? districts.filter((d) => d.parentId === p.id) : [];
  }, [formData.province, provinces, districts]);

  const availableWards = useMemo(() => {
    if (formData.addressLevel === 3) {
      const d = districts.find((x) => x.name === formData.district);
      return d ? wards.filter((w) => w.parentId === d.id) : [];
    }
    const p = provinces.find((x) => x.name === formData.province);
    if (!p) return [];
    const dIds = districts.filter((d) => d.parentId === p.id).map((d) => d.id);
    return wards.filter((w) => w.parentId && dIds.includes(w.parentId));
  }, [formData.district, formData.province, formData.addressLevel, districts, wards, provinces]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Chỉ cho phép số cho phone (vẫn cho xóa/backspace)
    if (name === 'phone' && !/^\d*$/.test(value)) return;

    setFormData((prev) => {
      const newData: Employee = {
        ...prev,
        [name]: name === 'salary' ? Number(value) : value,
      } as Employee;

      if (name === 'province') {
        newData.district = '';
        newData.ward = '';
      }
      if (name === 'district') {
        newData.ward = '';
      }
      if (name === 'ward' && prev.addressLevel === 2) {
        const wObj = wards.find((w) => w.name === value);
        if (wObj && wObj.parentId) {
          const dObj = districts.find((d) => d.id === wObj.parentId);
          if (dObj) newData.district = dObj.name;
        }
      }
      return newData;
    });

    if (
      errors[name as keyof Employee] &&
      name !== 'identityCard' &&
      name !== 'employeeCode'
    ) {
      setErrors((p) => ({ ...p, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const err: Partial<Record<keyof Employee, string>> = {};

    // --- Identity & Code Validation ---
    if (!formData.employeeCode.trim()) {
      err.employeeCode = 'Vui lòng nhập Mã NV';
    } else if (isDuplicateCode) {
      err.employeeCode = 'Mã nhân viên đã tồn tại';
    }

    if (!formData.fullName.trim()) {
      err.fullName = 'Vui lòng nhập họ và tên';
    }

    // STRICT PHONE CHECK
    if (!formData.phone.trim()) {
      err.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})\b/.test(formData.phone)) {
      err.phone = 'SĐT không hợp lệ (VD: 090...)';
    }

    // STRICT EMAIL CHECK
    if (!formData.email.trim()) {
      err.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      err.email = 'Email không đúng định dạng';
    }

    // --- Date Validation ---
    if (formData.dob) {
      if (formData.dob > today) {
        err.dob = 'Ngày sinh không được ở tương lai';
      }
    }

    if (!formData.identityCard.trim()) {
      err.identityCard = 'Vui lòng nhập CCCD';
    } else if (isDuplicateIdentity) {
      err.identityCard = 'Số CCCD đã tồn tại!';
    }

    if (!formData.issuedDate) {
      err.issuedDate = 'Vui lòng nhập ngày cấp';
    } else {
      if (formData.issuedDate > today) {
        err.issuedDate = 'Ngày cấp không được ở tương lai';
      }
      if (formData.dob && formData.issuedDate < formData.dob) {
        err.issuedDate = 'Ngày cấp không thể trước ngày sinh';
      }
    }

    if (!formData.issuedPlace.trim()) {
      err.issuedPlace = 'Vui lòng nhập nơi cấp';
    }

    // Start Date
    if (formData.startDate) {
      if (formData.dob && formData.startDate < formData.dob) {
        err.startDate = 'Ngày vào làm không được sớm hơn ngày sinh';
      }
    }

    // Resignation Date
    if (formData.resignationDate && formData.startDate) {
      if (formData.resignationDate < formData.startDate) {
        err.resignationDate =
          'Ngày nghỉ việc không được sớm hơn ngày vào làm';
      }
    }

    // --- Other Fields ---
    if (!formData.department) err.department = 'Vui lòng chọn phòng ban';
    if (!formData.position) err.position = 'Vui lòng chọn chức vụ';
    if (!formData.province) err.province = 'Vui lòng chọn Tỉnh/Thành';
    if (formData.addressLevel === 3 && !formData.district) {
      err.district = 'Vui lòng chọn Quận/Huyện';
    }
    if (!formData.ward) err.ward = 'Vui lòng chọn Phường/Xã';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      if (!form) return;
      const indexAttr = (e.target as HTMLElement).getAttribute('data-index');
      const index = parseInt(indexAttr || '-1', 10);
      let nextIndex = index + 1;

      // Bỏ qua district nếu addressLevel = 2
      if (formData.addressLevel === 2 && nextIndex === 11) nextIndex = 12;

      const next = form.querySelector(
        `[data-index="${nextIndex}"]`
      ) as HTMLElement | null;
      if (next) next.focus();
      else document.getElementById('btn-save')?.focus();
    }
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (validate()) {
      setShowConfirmModal(true);
    } else {
      setNotification({
        type: 'error',
        message: 'Vui lòng kiểm tra lại thông tin (các trường màu đỏ)',
      });
      document
        .getElementById('employee-form')
        ?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleConfirmSave = async () => {
    setShowConfirmModal(false);
    setIsSaving(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    onSave(formData);
    setIsSaving(false);
  };

  const handleAiExtract = async () => {
    if (!aiPrompt.trim() && !uploadedFile) return;
    setIsAiLoading(true);
    try {
      let b64: string | undefined;
      let mime: string | undefined;
      if (uploadedFile) {
        const r = new FileReader();
        r.readAsDataURL(uploadedFile);
        await new Promise<void>((resolve) => {
          r.onload = () => resolve();
        });
        b64 = (r.result as string).split(',')[1];
        mime = uploadedFile.type;
      }
      const data = await extractEmployeeInfo(aiPrompt, b64, mime);
      if (data) {
        setFormData((p) => ({
          ...p,
          ...data,
          province: data.province || p.province,
          district: data.district || p.district,
          ward: data.ward || p.ward,
        }));
        setShowAiModal(false);
        setNotification({
          type: 'success',
          message: 'Trích xuất thành công!',
        });
      } else {
        setNotification({
          type: 'error',
          message: 'Không trích xuất được thông tin',
        });
      }
    } catch {
      setNotification({ type: 'error', message: 'Lỗi AI' });
    }
    setIsAiLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col h-full overflow-hidden relative">
      {notification && (
        <div
          className={`absolute top-4 right-6 z-50 px-4 py-3 rounded shadow-lg flex items-center gap-2 animate-bounce-in ${
            notification.type === 's
