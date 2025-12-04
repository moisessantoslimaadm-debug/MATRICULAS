
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { MapPin, Star, Users, Search, Map as MapIcon, List, X, GraduationCap, Calendar, Hash, School as SchoolIcon, Layout, Filter, ArrowUpDown } from 'lucide-react';
import { SchoolType, School, RegistryStudent } from '../types';

export const SchoolList: React.FC = () => {
  const { schools, students } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('Todos');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [sortOption, setSortOption] = useState<string>('name');
  
  // States for the selected school modal
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [modalActiveTab, setModalActiveTab] = useState<'students' | 'classes' | 'info'>('students');
  
  // Modal Filters
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [modalStatusFilter, setModalStatusFilter] = useState<string>('Todos');
  const [modalClassFilter, setModalClassFilter] = useState<string>('Todas');

  // Mock "User Location" (City Center) for distance calculation
  // In a real app, this would come from navigator.geolocation
  const userLocation = { lat: -12.5253, lng: -40.2917 };

  // Haversine formula to calculate distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const d = R * c; 
    return d;
  };

  // Process schools: Filter -> Calculate Distance -> Sort
  const processedSchools = useMemo(() => {
    // 1. Filter
    let result = schools.filter(school => {
      const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            school.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'Todos' || school.types.includes(filterType as SchoolType);
      return matchesSearch && matchesType;
    });

    // 2. Add Distance
    result = result.map(school => ({
      ...school,
      distance: calculateDistance(userLocation.lat, userLocation.lng, school.lat, school.lng)
    }));

    // 3. Sort
    return result.sort((a, b) => {
      if (sortOption === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortOption === 'rating') {
        return b.rating - a.rating;
      } else if (sortOption === 'distance') {
        return (a.distance || 0) - (b.distance || 0);
      }
      return 0;
    });
  }, [schools, searchTerm, filterType, sortOption]);

  // Logic for the Modal Data
  const schoolStudents = useMemo(() => {
    if (!selectedSchool) return [];
    return students.filter(student => {
      // Match strictly by normalized Name OR by ID (INEP code matching)
      const schoolNameMatch = student.school && student.school.trim().toUpperCase() === selectedSchool.name.trim().toUpperCase();
      // Fallback logic: sometimes classId in csv might map to school ID, or we rely on school name
      return schoolNameMatch; 
    });
  }, [selectedSchool, students]);

  // Extract unique classes for the filter dropdown
  const availableClasses = useMemo(() => {
    const classes = new Set(schoolStudents.map(s => s.className).filter(Boolean));
    return Array.from(classes).sort();
  }, [schoolStudents]);

  const filteredSchoolStudents = useMemo(() => {
    return schoolStudents.filter(s => {
      // Text Search
      const term = studentSearchTerm.toLowerCase();
      const matchesText = !term || 
        s.name.toLowerCase().includes(term) || 
        s.cpf.includes(term) ||
        s.enrollmentId?.includes(term);

      // Status Filter
      const matchesStatus = modalStatusFilter === 'Todos' || s.status === modalStatusFilter;

      // Class Filter
      const matchesClass = modalClassFilter === 'Todas' || s.className === modalClassFilter;

      return matchesText && matchesStatus && matchesClass;
    });
  }, [schoolStudents, studentSearchTerm, modalStatusFilter, modalClassFilter]);

  // Group students by Class (Turma) for Classes Tab
  const schoolClassesGrouped = useMemo(() => {
    const groups: Record<string, RegistryStudent[]> = {};
    schoolStudents.forEach(student => {
      const className = student.className || 'Sem Turma Definida';
      if (!groups[className]) groups[className] = [];
      groups[className].push(student);
    });
    return groups;
  }, [schoolStudents]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Escolas da Rede Municipal</h1>
            <p className="text-slate-600">Gerencie e visualize as {processedSchools.length} unidades de ensino.</p>
          </div>
          <div className="bg-white border border-slate-200 p-1 rounded-lg flex shadow-sm self-start md:self-auto">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition ${viewMode === 'list' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <List className="h-4 w-4" />
              Lista
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition ${viewMode === 'map' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <MapIcon className="h-4 w-4" />
              Mapa
            </button>
          </div>
        </div>

        {/* Filters & Sorting */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between sticky top-20 z-30">
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
            <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                type="text"
                placeholder="Buscar escola..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="relative w-full sm:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ArrowUpDown className="h-4 w-4 text-slate-400" />
                </div>
                <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full sm:w-48 pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm text-slate-700 cursor-pointer appearance-none"
                >
                    <option value="name">Ordem Alfabética</option>
                    <option value="rating">Melhor Avaliação</option>
                    <option value="distance">Menor Distância</option>
                </select>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto scrollbar-hide">
            {['Todos', ...Object.values(SchoolType)].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                  filterType === type
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {viewMode === 'map' ? (
          <div className="bg-slate-200 rounded-xl h-[600px] flex items-center justify-center border border-slate-300 shadow-inner">
            <div className="text-center">
              <MapIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 text-lg font-medium">Visualização de Mapa</p>
              <p className="text-slate-400 text-sm">(Funcionalidade em desenvolvimento)</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processedSchools.map((school) => (
              <div key={school.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-300 group flex flex-col h-full">
                <div className="relative h-40 overflow-hidden">
                  <img 
                    src={school.image} 
                    alt={school.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                  {school.inep && (
                     <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white text-[10px] font-mono px-2 py-0.5 rounded border border-white/20">
                       INEP: {school.inep}
                     </div>
                  )}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg font-bold text-white leading-tight shadow-black drop-shadow-md">{school.name}</h3>
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {school.types.map(t => (
                      <span key={t} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                        {t}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-start gap-2.5 text-slate-600 mb-6 flex-1">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-slate-400" />
                    <div className="flex flex-col">
                        <span className="text-sm leading-snug">{school.address}</span>
                        {school.distance !== undefined && (
                            <span className="text-xs text-blue-600 font-medium mt-1">
                                Aprox. {school.distance.toFixed(2)} km do Centro
                            </span>
                        )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-slate-600" title="Capacidade Total">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">{school.availableSlots > 0 ? `${school.availableSlots} Vagas` : 'Lotação não inf.'}</span>
                    </div>
                    <button 
                        onClick={() => {
                            setSelectedSchool(school);
                            setModalActiveTab('students');
                            setStudentSearchTerm('');
                            setModalStatusFilter('Todos');
                            setModalClassFilter('Todas');
                        }}
                        className="text-blue-600 text-sm font-bold hover:text-blue-800 transition-colors flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg"
                    >
                      Ver Detalhes
                      <Layout className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {processedSchools.length === 0 && viewMode === 'list' && (
          <div className="col-span-full text-center py-16">
            <div className="inline-flex bg-slate-100 p-4 rounded-full mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Nenhuma escola encontrada</h3>
            <p className="text-slate-500 mt-1">Tente ajustar seus filtros de busca ou importe dados na aba Gestão.</p>
          </div>
        )}
      </div>

      {/* Enhanced Details Modal */}
      {selectedSchool && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                onClick={() => setSelectedSchool(null)}
            ></div>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col relative animate-in zoom-in-95 duration-200 overflow-hidden">
                
                {/* Modal Header */}
                <div className="bg-slate-900 text-white p-6 shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/10 rounded-lg">
                                    <SchoolIcon className="h-6 w-6 text-blue-300" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold leading-none">{selectedSchool.name}</h2>
                                    {selectedSchool.inep && <span className="text-xs text-slate-400 font-mono">INEP: {selectedSchool.inep}</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300 text-sm">
                                <MapPin className="h-4 w-4" />
                                {selectedSchool.address}
                            </div>
                        </div>
                        <button 
                            onClick={() => setSelectedSchool(null)}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex gap-1 mt-6 border-b border-white/10">
                        <button
                            onClick={() => setModalActiveTab('students')}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg flex items-center gap-2 transition ${
                                modalActiveTab === 'students' 
                                ? 'bg-white text-slate-900' 
                                : 'text-slate-300 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <Users className="h-4 w-4" />
                            Alunos ({schoolStudents.length})
                        </button>
                        <button
                            onClick={() => setModalActiveTab('classes')}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg flex items-center gap-2 transition ${
                                modalActiveTab === 'classes' 
                                ? 'bg-white text-slate-900' 
                                : 'text-slate-300 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <Layout className="h-4 w-4" />
                            Turmas ({Object.keys(schoolClassesGrouped).length})
                        </button>
                         <button
                            onClick={() => setModalActiveTab('info')}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg flex items-center gap-2 transition ${
                                modalActiveTab === 'info' 
                                ? 'bg-white text-slate-900' 
                                : 'text-slate-300 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <SchoolIcon className="h-4 w-4" />
                            Informações
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-hidden bg-slate-50 flex flex-col">
                    
                    {/* Tab: Students */}
                    {modalActiveTab === 'students' && (
                        <div className="flex flex-col h-full">
                            {/* Search & Filters Bar */}
                            <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row gap-4 items-center">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Pesquisar aluno por nome, CPF ou matrícula..." 
                                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={studentSearchTerm}
                                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                                    />
                                </div>
                                
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <select 
                                        value={modalStatusFilter}
                                        onChange={(e) => setModalStatusFilter(e.target.value)}
                                        className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-auto"
                                    >
                                        <option value="Todos">Todos Status</option>
                                        <option value="Matriculado">Matriculado</option>
                                        <option value="Pendente">Pendente</option>
                                    </select>
                                    
                                    <select 
                                        value={modalClassFilter}
                                        onChange={(e) => setModalClassFilter(e.target.value)}
                                        className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-auto"
                                    >
                                        <option value="Todos">Todas Turmas</option>
                                        {availableClasses.map(cls => (
                                            <option key={cls} value={cls}>{cls}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4">
                                {filteredSchoolStudents.length > 0 ? (
                                    <div className="grid gap-3">
                                        {filteredSchoolStudents.map((student) => (
                                            <div key={student.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:border-blue-300 transition flex items-center justify-between group">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm uppercase ${
                                                        student.status === 'Matriculado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-sm">{student.name}</h4>
                                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                                            {student.enrollmentId && (
                                                                <span className="flex items-center gap-1 bg-slate-100 px-1.5 rounded"><Hash className="h-3 w-3" /> {student.enrollmentId}</span>
                                                            )}
                                                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {student.birthDate}</span>
                                                            {student.className && (
                                                                <span className="flex items-center gap-1 text-blue-600 font-medium"><Layout className="h-3 w-3" /> {student.className}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                     <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                                                        student.status === 'Matriculado' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                                                    }`}>
                                                        {student.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                        <Users className="h-12 w-12 mb-3 opacity-20" />
                                        <p>Nenhum aluno encontrado.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab: Classes */}
                    {modalActiveTab === 'classes' && (
                         <div className="p-6 overflow-y-auto">
                            {Object.entries(schoolClassesGrouped).length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {Object.entries(schoolClassesGrouped).map(([className, classStudents]: [string, RegistryStudent[]]) => (
                                        <div key={className} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                                            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                                                <div className="flex items-center gap-2">
                                                    <Layout className="h-5 w-5 text-blue-600" />
                                                    <h3 className="font-bold text-slate-800">{className}</h3>
                                                </div>
                                                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                                                    {classStudents.length} Alunos
                                                </span>
                                            </div>
                                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                                {classStudents.slice(0, 5).map(s => (
                                                    <div key={s.id} className="text-xs text-slate-600 py-1 border-b border-slate-50 last:border-0">
                                                        {s.name}
                                                    </div>
                                                ))}
                                                {classStudents.length > 5 && (
                                                    <div className="text-xs text-center text-blue-500 font-medium pt-1">
                                                        + {classStudents.length - 5} outros alunos
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-500">
                                    Nenhuma turma identificada.
                                </div>
                            )}
                         </div>
                    )}

                    {/* Tab: Info */}
                     {modalActiveTab === 'info' && (
                        <div className="p-8 overflow-y-auto">
                            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Detalhes da Unidade</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Endereço Completo</p>
                                        <p className="font-medium text-slate-800 flex items-start gap-2">
                                            <MapPin className="h-5 w-5 text-blue-500 shrink-0" />
                                            {selectedSchool.address}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Coordenadas</p>
                                        <p className="font-mono text-sm text-slate-700 bg-slate-100 p-2 rounded inline-block">
                                            Lat: {selectedSchool.lat}, Lng: {selectedSchool.lng}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Modalidades de Ensino</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedSchool.types.map(t => (
                                                <span key={t} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Avaliação Geral</p>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-5 w-5 ${i < Math.round(selectedSchool.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                                            ))}
                                            <span className="ml-2 font-bold text-slate-700">{selectedSchool.rating}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-6">
                                <h3 className="text-lg font-bold text-indigo-900 mb-4">Resumo de Vagas</h3>
                                <div className="flex gap-8">
                                    <div>
                                        <span className="block text-3xl font-bold text-indigo-700">{selectedSchool.availableSlots}</span>
                                        <span className="text-sm text-indigo-600">Vagas Disponíveis (Estimada)</span>
                                    </div>
                                    <div>
                                        <span className="block text-3xl font-bold text-blue-700">{schoolStudents.length}</span>
                                        <span className="text-sm text-blue-600">Alunos Ativos</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
                
                {/* Modal Footer */}
                <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3 shrink-0">
                    <button 
                        onClick={() => setSelectedSchool(null)}
                        className="px-6 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
