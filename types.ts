export enum EmployeeStatus {
  ACTIVE = 'Đang làm việc',
  PROBATION = 'Thử việc',
  RESIGNED = 'Đã nghỉ việc',
  LEAVE = 'Nghỉ thai sản/ốm',
}
    
export enum Gender {
  MALE = 'Nam',
  FEMALE = 'Nữ',
  OTHER = 'Khác',
}

export enum RecruitmentStatus {
  PENDING = 'Chờ phỏng vấn',
  INTERVIEWED = 'Đã phỏng vấn',
  PASSED = 'Đạt',
  FAILED = 'Không đạt',
  CONVERTED = 'Đã chuyển nhân viên',
}

export interface Candidate {
  id: string;
  fullName: string;
  gender: Gender;
  dob: string;
  phone: string;
  email: string;
  identityCard: string;
  street?: string;
  province?: string;
  district?: string;
  ward?: string;
  appliedPosition: string;
  cvUrl?: string;
  interviewDate?: string;
  status: RecruitmentStatus;
  note?: string;
}

export interface Department {
  id: string;
  name: string;
  parentId?: string;
}

export interface Position {
  id: string;
  code: string; // Thêm mã chức vụ
  name: string;
}

export interface LocationItem {
  id: string;
  name: string;
  parentId?: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  gender: Gender;
  dob: string;
  phone: string;
  email: string;
  identityCard: string;
  issuedDate: string;
  issuedPlace: string;
  street: string;
  province: string;
  district: string;
  ward: string;
  addressLevel: 2 | 3;
  department: string;
  position: string;
  startDate: string;
  resignationDate?: string;
  salary: number;
  status: EmployeeStatus;
  avatarUrl?: string;
}
