import { Employee, EmployeeStatus, Gender, LocationItem, Department, Position, Candidate, RecruitmentStatus } from "./types";

export const DEPARTMENTS = [
  "Ban Giám Đốc",
  "Phòng Kinh Doanh (Sales)",
  "Phòng Marketing",
  "Phòng Nhân Sự (HR)",
  "Phòng Kế Toán",
  "Phòng CNTT (IT)",
  "Kho Vận & Logistics",
  "Nhà Máy Sản Xuất",
];

export const POSITIONS = [
  "Giám Đốc",
  "Trưởng Phòng",
  "Phó Phòng",
  "Trưởng Nhóm",
  "Chuyên Viên",
  "Nhân Viên",
  "Thực Tập Sinh",
  "Công Nhân",
];

const [depts, setDepts] = useState<Department[]>(
  (INITIAL_DEPARTMENTS as Department[]) ?? []
);
const [positions, setPositions] = useState<Position[]>(
  (INITIAL_POSITIONS as Position[]) ?? []
);


export const STATUS_OPTIONS = [
  EmployeeStatus.ACTIVE,
  EmployeeStatus.PROBATION,
  EmployeeStatus.LEAVE,
  EmployeeStatus.RESIGNED,
];

export const GENDER_OPTIONS = [Gender.MALE, Gender.FEMALE, Gender.OTHER];

export const INITIAL_PROVINCES: LocationItem[] = [
  { id: '79', name: 'Hồ Chí Minh' },
  { id: '01', name: 'Hà Nội' },
  { id: '48', name: 'Đà Nẵng' },
];

export const INITIAL_DISTRICTS: LocationItem[] = [
  { id: '760', name: 'Quận 1', parentId: '79' },
  { id: '769', name: 'Thành phố Thủ Đức', parentId: '79' },
  { id: '778', name: 'Quận 7', parentId: '79' },
  { id: '001', name: 'Quận Ba Đình', parentId: '01' },
  { id: '005', name: 'Quận Cầu Giấy', parentId: '01' },
];

export const INITIAL_WARDS: LocationItem[] = [
  { id: '26734', name: 'Phường Bến Nghé', parentId: '760' },
  { id: '26740', name: 'Phường Đa Kao', parentId: '760' },
  { id: '26848', name: 'Phường Thảo Điền', parentId: '769' },
  { id: '27085', name: 'Phường Tân Phong', parentId: '778' },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: '1',
    employeeCode: 'NV001',
    fullName: 'Nguyễn Văn An',
    gender: Gender.MALE,
    dob: '1990-05-15',
    phone: '0901234567',
    email: 'an.nguyen@cadovina.com',
    identityCard: '001090000001',
    issuedDate: '2020-01-01',
    issuedPlace: 'Cục CS QLHC',
    street: '123 Lê Lợi',
    province: 'Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    addressLevel: 3,
    department: 'Phòng Kinh Doanh (Sales)',
    position: 'Trưởng Phòng',
    startDate: '2022-01-01',
    salary: 25000000,
    status: EmployeeStatus.ACTIVE,
  },
  {
    id: '2',
    employeeCode: 'NV002',
    fullName: 'Trần Thị Bích',
    gender: Gender.FEMALE,
    dob: '1995-08-20',
    phone: '0909888777',
    email: 'bich.tran@cadovina.com',
    identityCard: '079195000002',
    issuedDate: '2021-05-10',
    issuedPlace: 'Cục CS QLHC',
    street: '456 Nguyễn Văn Linh',
    province: 'Hồ Chí Minh',
    district: 'Quận 7',
    ward: 'Phường Tân Phong',
    addressLevel: 3,
    department: 'Phòng Kế Toán',
    position: 'Chuyên Viên',
    startDate: '2023-03-15',
    salary: 15000000,
    status: EmployeeStatus.PROBATION,
  },
];

export const INITIAL_CANDIDATES: Candidate[] = [
    {
        id: 'c1',
        fullName: 'Lê Văn Ứng Viên',
        gender: Gender.MALE,
        dob: '1998-12-12',
        phone: '0987654321',
        email: 'ungvien@gmail.com',
        identityCard: '0303938485',
        appliedPosition: 'Nhân Viên Kinh Doanh',
        interviewDate: '2023-11-20',
        status: RecruitmentStatus.PENDING,
        province: 'Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Phường Bến Nghé',
        note: 'Có kinh nghiệm 2 năm sale B2B'
    }
];
