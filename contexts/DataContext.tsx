import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { School, RegistryStudent } from '../types';
import { MOCK_SCHOOLS, MOCK_STUDENT_REGISTRY } from '../constants';

interface DataContextType {
  schools: School[];
  students: RegistryStudent[];
  addSchool: (school: School) => void;
  addStudent: (student: RegistryStudent) => void;
  updateSchools: (newSchools: School[]) => void;
  updateStudents: (newStudents: RegistryStudent[]) => void;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children?: ReactNode }) => {
  // Inicializa com os dados do LocalStorage se existirem, senão usa os Mocks
  const [schools, setSchools] = useState<School[]>(() => {
    const saved = localStorage.getItem('educa_schools');
    return saved ? JSON.parse(saved) : MOCK_SCHOOLS;
  });

  const [students, setStudents] = useState<RegistryStudent[]>(() => {
    const saved = localStorage.getItem('educa_students');
    return saved ? JSON.parse(saved) : MOCK_STUDENT_REGISTRY;
  });

  // Salva no LocalStorage sempre que houver mudança
  useEffect(() => {
    localStorage.setItem('educa_schools', JSON.stringify(schools));
  }, [schools]);

  useEffect(() => {
    localStorage.setItem('educa_students', JSON.stringify(students));
  }, [students]);

  const addSchool = (school: School) => {
    setSchools(prev => [...prev, school]);
  };

  const addStudent = (student: RegistryStudent) => {
    setStudents(prev => [...prev, student]);
  };

  const updateSchools = (newSchools: School[]) => {
    // Mescla as novas escolas com as existentes ou substitui, dependendo da lógica desejada.
    // Aqui vamos concatenar filtrando duplicatas por ID
    setSchools(prev => {
      const existingIds = new Set(prev.map(s => s.id));
      const uniqueNewSchools = newSchools.filter(s => !existingIds.has(s.id));
      return [...prev, ...uniqueNewSchools];
    });
  };

  const updateStudents = (newStudents: RegistryStudent[]) => {
    setStudents(prev => {
      const existingIds = new Set(prev.map(s => s.id));
      const uniqueNewStudents = newStudents.filter(s => !existingIds.has(s.id));
      return [...prev, ...uniqueNewStudents];
    });
  };

  const resetData = () => {
    setSchools(MOCK_SCHOOLS);
    setStudents(MOCK_STUDENT_REGISTRY);
    localStorage.removeItem('educa_schools');
    localStorage.removeItem('educa_students');
  };

  return (
    <DataContext.Provider value={{ schools, students, addSchool, addStudent, updateSchools, updateStudents, resetData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};