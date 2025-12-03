export enum SchoolType {
  INFANTIL = 'Educação Infantil',
  FUNDAMENTAL_1 = 'Fundamental I',
  FUNDAMENTAL_2 = 'Fundamental II',
  MEDIO = 'Ensino Médio',
  EJA = 'EJA'
}

export interface School {
  id: string;
  name: string;
  address: string;
  types: SchoolType[];
  image: string;
  rating: number;
  availableSlots: number;
  lat: number;
  lng: number;
}

export interface StudentData {
  fullName: string;
  birthDate: string;
  cpf: string; // Optional for children, mandatory if exists
  needsSpecialEducation: boolean;
  specialEducationDetails?: string;
  needsTransport: boolean; // Added field
}

export interface GuardianData {
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  relationship: string;
}

export interface AddressData {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string; // Defaults to the municipality
  zipCode: string;
}

export interface RegistrationFormState {
  step: number;
  student: StudentData;
  guardian: GuardianData;
  address: AddressData;
  selectedSchoolId: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

// New interface for data extracted from PDF
export interface RegistryStudent {
  id: string;
  name: string;
  birthDate: string;
  cpf: string;
  status: 'Matriculado' | 'Pendente' | 'Em Análise';
  school?: string;
  shift?: string;
  transportRequest?: boolean; // Matches 'Transporte escolar' from PDF
  grade?: string; // Matches 'Etapa de ensino'
}