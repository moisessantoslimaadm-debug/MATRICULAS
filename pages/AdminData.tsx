import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { 
  FileSpreadsheet, Upload, RefreshCw, Check, AlertTriangle, Database, 
  Download, Users, Search, ChevronLeft, ChevronRight, Eye, Save, UserPlus, X 
} from 'lucide-react';
import { RegistryStudent, School, SchoolType } from '../types';

export const AdminData: React.FC = () => {
  const { schools, students, updateSchools, updateStudents, resetData } = useData();

  // Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isUploading, setIsUploading] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackDetails, setFeedbackDetails] = useState<string[]>([]);
  
  // Preview State
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [importType, setImportType] = useState<'schools' | 'students' | null>(null);
  const [educacensoSchool, setEducacensoSchool] = useState<School | null>(null);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [classFilter, setClassFilter] = useState('Todas');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Allocation State
  const [targetSchoolId, setTargetSchoolId] = useState('');
  const [allocationMessage, setAllocationMessage] = useState('');

  // Derived Data for Filters
  const schoolNames = useMemo(() => Array.from(new Set(schools.map(s => s.name))).sort(), [schools]);
  const classNames = useMemo(() => Array.from(new Set(students.map(s => s.className).filter(Boolean) as string[])).sort(), [students]);
  const unallocatedCount = useMemo(() => students.filter(s => !s.school || s.school === 'Não alocada').length, [students]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    setUploadStatus('idle');
    setUploadProgress(10);
    setProcessingStage('Lendo arquivo...');

    // Simulate reading file
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUploadProgress(40);
    setProcessingStage('Analisando estrutura...');

    try {
        const text = await file.text();
        // Basic detection logic (mocked)
        // If CSV contains "INEP" or "Endereço", it's schools.
        // If CSV contains "CPF" or "Nascimento", it's students.
        
        const isSchoolFile = text.toLowerCase().includes('inep') || text.toLowerCase().includes('endereço') || text.toLowerCase().includes('creche');
        const isStudentFile = text.toLowerCase().includes('cpf') || text.toLowerCase().includes('nascimento') || text.toLowerCase().includes('aluno');

        setUploadProgress(70);
        setProcessingStage('Processando registros...');
        await new Promise(resolve => setTimeout(resolve, 800));

        if (isSchoolFile) {
            setImportType('schools');
            // Mock parsing schools
            const mockParsedSchools: School[] = [
                {
                    id: Date.now().toString(),
                    name: 'ESCOLA MUNICIPAL NOVA ESPERANÇA',
                    address: 'Rua das Flores, 123',
                    types: [SchoolType.FUNDAMENTAL_1],
                    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80',
                    rating: 4.5,
                    availableSlots: 150,
                    lat: -12.52,
                    lng: -40.30
                }
            ];
            setPreviewData(mockParsedSchools);
            setEducacensoSchool(mockParsedSchools[0]);
        } else if (isStudentFile) {
            setImportType('students');
            // Mock parsing students
             const mockParsedStudents: RegistryStudent[] = [
                { id: Date.now().toString() + '1', name: 'NOVO ALUNO IMPORTADO 1', birthDate: '01/01/2020', cpf: '000.000.000-01', status: 'Pendente' },
                { id: Date.now().toString() + '2', name: 'NOVO ALUNO IMPORTADO 2', birthDate: '02/02/2020', cpf: '000.000.000-02', status: 'Pendente' },
            ];
            setPreviewData(mockParsedStudents);
        } else {
            throw new Error('Formato de arquivo não reconhecido.');
        }

        setUploadProgress(100);
        setProcessingStage('Concluído!');
        setIsUploading(false);
    } catch (err) {
        setIsUploading(false);
        setUploadStatus('error');
        setFeedbackMessage('Erro na importação');
        setFeedbackDetails(['Não foi possível ler o arquivo. Verifique o formato CSV/JSON.']);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const resetUpload = () => {
    setUploadStatus('idle');
    setPreviewData(null);
    setImportType(null);
    setFeedbackMessage('');
    setFeedbackDetails([]);
  };

  const cancelImport = () => {
      resetUpload();
  };

  const confirmImport = () => {
      if (!previewData) return;
      
      if (importType === 'schools') {
          updateSchools(previewData as School[]);
          setFeedbackMessage(`${previewData.length} escolas importadas com sucesso.`);
      } else {
          updateStudents(previewData as RegistryStudent[]);
          setFeedbackMessage(`${previewData.length} alunos importados com sucesso.`);
      }
      setUploadStatus('success');
      setPreviewData(null);
      setImportType(null);
  };

  const handleBackup = () => {
      const data = {
          schools,
          students,
          date: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-educacao-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleMassAllocation = () => {
      if (!targetSchoolId) return;
      const school = schools.find(s => s.id === targetSchoolId);
      if (!school) return;

      const unallocated = students.filter(s => !s.school || s.school === 'Não alocada');
      const updatedStudents = students.map(s => {
          if (!s.school || s.school === 'Não alocada') {
              return { ...s, school: school.name, status: 'Matriculado' as const };
          }
          return s;
      });
      
      // Let's create the payload correctly:
      const studentsToUpdate = unallocated.map(s => ({ ...s, school: school.name, status: 'Matriculado' as const }));
      updateStudents(studentsToUpdate);

      setAllocationMessage(`${unallocated.length} alunos foram alocados para ${school.name}.`);
      setTimeout(() => setAllocationMessage(''), 5000);
  };

  // --- Filter Logic ---
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const searchLower = searchTerm.toLowerCase().trim();
      const studentName = student.name.toLowerCase();
      const studentCpf = student.cpf ? student.cpf.replace(/\D/g, '') : '';
      const studentSchool = (student.school || '').toLowerCase();

      const matchesSearch = studentName.includes(searchLower) || 
                            studentCpf.includes(searchLower) ||
                            studentSchool.includes(searchLower);
                            
      const matchesSchool = schoolFilter === 'Todas' || student.school === schoolFilter;
      const matchesStatus = statusFilter === 'Todos' || student.status === statusFilter;
      const matchesClass = classFilter === 'Todas' || student.className === classFilter;

      return matchesSearch && matchesSchool && matchesStatus && matchesClass;
    });
  }, [students, searchTerm, schoolFilter, statusFilter, classFilter]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Gestão de Dados</h1>
          <p className="text-slate-600 mt-2">Importe dados oficiais para popular o sistema.</p>
        </div>

        {/* Preview Modal */}
        {previewData && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Eye className="h-5 w-5 text-blue-600" />
                            Revisão de Importação
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Foram encontrados <strong>{previewData.length}</strong> registros de <strong>{importType === 'schools' ? 'Escolas' : 'Alunos'}</strong>.
                        </p>
                        {educacensoSchool && (
                             <div className="mt-3 text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-100">
                                <strong>Nova Escola Detectada:</strong> {educacensoSchool.name}
                             </div>
                        )}
                    </div>
                    <div className="p-0 overflow-auto flex-1 bg-slate-50/30">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-100 text-xs uppercase text-slate-600 font-semibold sticky top-0">
                                <tr>
                                    <th className="px-4 py-3">#</th>
                                    {importType === 'schools' ? (
                                        <>
                                            <th className="px-4 py-3">Nome</th>
                                            <th className="px-4 py-3">Endereço</th>
                                            <th className="px-4 py-3">Vagas</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-4 py-3">Nome</th>
                                            <th className="px-4 py-3">CPF</th>
                                            <th className="px-4 py-3">Turma</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {previewData.slice(0, 8).map((item, idx) => (
                                    <tr key={idx} className="bg-white">
                                        <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{idx + 1}</td>
                                        {importType === 'schools' ? (
                                            <>
                                                <td className="px-4 py-2.5 font-medium">{item.name}</td>
                                                <td className="px-4 py-2.5 text-slate-500 truncate max-w-[200px]">{item.address}</td>
                                                <td className="px-4 py-2.5 text-slate-500">{item.availableSlots}</td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-4 py-2.5 font-medium">{item.name}</td>
                                                <td className="px-4 py-2.5 text-slate-500">{item.cpf}</td>
                                                <td className="px-4 py-2.5 text-slate-500">{item.className || '-'}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {previewData.length > 8 && (
                            <div className="p-4 text-center text-xs text-slate-400 italic border-t border-slate-100 bg-white">
                                ... e mais {previewData.length - 8} registros.
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
                        <button onClick={cancelImport} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition">Cancelar</button>
                        <button onClick={confirmImport} className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-green-200 transition">
                            <Save className="h-4 w-4" />
                            Confirmar Importação
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Upload Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Importar Dados</h2>
            </div>
            
            <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition relative flex-1 flex flex-col justify-center items-center min-h-[240px] ${
                    isDragging 
                        ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100 scale-[1.02]' 
                        : uploadStatus === 'error' 
                            ? 'border-red-300 bg-red-50' 
                            : uploadStatus === 'success'
                            ? 'border-green-300 bg-green-50'
                            : 'border-slate-300 hover:bg-slate-50 cursor-pointer'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
              {uploadStatus === 'idle' && !isUploading && (
                  <input 
                    type="file" 
                    accept=".json,.csv" 
                    onChange={handleInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
              )}

              {isUploading ? (
                <div className="w-full max-w-xs mx-auto">
                  <div className="relative mb-4">
                    <RefreshCw className="h-10 w-10 text-blue-600 animate-spin mx-auto" />
                  </div>
                  <p className="text-blue-700 font-medium mb-2">{processingStage}</p>
                  <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(37,99,235,0.5)]" 
                      style={{ width: `${Math.max(5, uploadProgress)}%` }}
                    >
                         <div className="w-full h-full bg-white/30 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2 text-right font-bold">{uploadProgress}%</p>
                </div>
              ) : uploadStatus === 'success' ? (
                <div className="flex flex-col items-center text-green-700 relative z-20 w-full">
                   <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300 shadow-sm">
                      <Check className="h-8 w-8 text-green-600" />
                   </div>
                  <span className="font-bold text-lg">{feedbackMessage}</span>
                  
                  {/* Details List */}
                  {feedbackDetails.length > 0 && (
                      <ul className="mt-3 text-sm text-green-800 bg-green-50/50 py-2 px-4 rounded-lg w-full text-left list-disc list-inside space-y-1">
                          {feedbackDetails.map((detail, i) => (
                              <li key={i}>{detail}</li>
                          ))}
                      </ul>
                  )}
                  
                  <button 
                    onClick={resetUpload}
                    className="mt-6 px-6 py-2.5 bg-white border border-green-200 text-green-700 rounded-lg text-sm font-bold hover:bg-green-50 transition shadow-sm hover:shadow-md"
                  >
                    Carregar Novo Arquivo
                  </button>
                </div>
              ) : uploadStatus === 'error' ? (
                 <div className="flex flex-col items-center text-red-700 relative z-20 w-full">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300 shadow-sm">
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                   </div>
                  <span className="font-bold text-lg mb-2">{feedbackMessage}</span>
                  
                   {/* Details List */}
                  {feedbackDetails.length > 0 && (
                      <div className="text-sm text-red-600 bg-red-50 py-3 px-4 rounded-lg w-full text-center border border-red-100">
                          {feedbackDetails.map((detail, i) => (
                              <p key={i}>{detail}</p>
                          ))}
                      </div>
                  )}

                  <button 
                    onClick={resetUpload}
                    className="mt-6 px-6 py-2.5 bg-white border border-red-200 text-red-700 rounded-lg text-sm font-bold hover:bg-red-50 transition shadow-sm hover:shadow-md"
                  >
                    Tentar Novamente
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-slate-500 pointer-events-none">
                  <div className={`p-4 rounded-full bg-slate-100 mb-4 ${isDragging ? 'scale-110 bg-blue-100 text-blue-600 shadow-md' : ''} transition-all duration-200`}>
                    <Upload className="h-8 w-8" />
                  </div>
                  <span className="font-medium text-slate-700 text-lg mb-1">{isDragging ? 'Solte para enviar' : 'Clique ou arraste aqui'}</span>
                  <span className="text-sm text-slate-400">Suporta .CSV e .JSON</span>
                </div>
              )}
            </div>
          </div>

          {/* Backup & Stats Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                <Database className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Backup e Status</h2>
            </div>
            
            <div className="space-y-4 flex-1">
               <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                   <span className="text-slate-600 font-medium">Alunos</span>
                   <span className="text-2xl font-bold text-slate-900">{students.length}</span>
               </div>
               <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                   <span className="text-slate-600 font-medium">Escolas</span>
                   <span className="text-2xl font-bold text-slate-900">{schools.length}</span>
               </div>
               
               {/* Mass Allocation Section */}
               {unallocatedCount > 0 && (
                   <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100 mt-4">
                       <div className="flex items-center gap-2 text-yellow-800 font-bold text-sm mb-2">
                           <AlertTriangle className="h-4 w-4" />
                           {unallocatedCount} Alunos sem escola
                       </div>
                       <p className="text-xs text-yellow-700 mb-3">Alunos pendentes de alocação.</p>
                       <div className="flex gap-2">
                            <select 
                                value={targetSchoolId}
                                onChange={(e) => setTargetSchoolId(e.target.value)}
                                className="flex-1 text-xs border border-yellow-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-yellow-500 outline-none"
                            >
                                <option value="">Selecione escola destino...</option>
                                {schools.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            <button 
                                onClick={handleMassAllocation}
                                disabled={!targetSchoolId}
                                className="bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-700 disabled:opacity-50 transition flex items-center gap-1"
                            >
                                <UserPlus className="h-3 w-3" /> Alocar
                            </button>
                       </div>
                       {allocationMessage && <p className="text-xs text-green-700 mt-2 font-medium">{allocationMessage}</p>}
                   </div>
               )}
            </div>

            <div className="flex flex-col gap-3 mt-6">
                <button onClick={handleBackup} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                    <Download className="h-4 w-4" /> Backup Completo
                </button>
                <button onClick={resetData} className="w-full py-2 text-red-600 hover:bg-red-50 rounded-xl text-sm transition">Zerar Dados</button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Users className="h-5 w-5" /> Alunos Cadastrados</h3>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar por nome, CPF ou escola..." 
                            value={searchTerm} 
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full sm:w-64 pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    
                    {/* Filter Group */}
                    <div className="flex gap-2">
                        <select 
                            value={schoolFilter} 
                            onChange={(e) => { setSchoolFilter(e.target.value); setCurrentPage(1); }}
                            className="pl-2 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                            <option value="Todas">Escolas: Todas</option>
                            {schoolNames.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        <select 
                            value={statusFilter} 
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            className="pl-2 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                            <option value="Todos">Status: Todos</option>
                            <option value="Matriculado">Matriculado</option>
                            <option value="Pendente">Pendente</option>
                            <option value="Em Análise">Em Análise</option>
                        </select>

                         <select 
                            value={classFilter} 
                            onChange={(e) => { setClassFilter(e.target.value); setCurrentPage(1); }}
                            className="pl-2 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                            <option value="Todas">Turmas: Todas</option>
                            {classNames.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="bg-slate-100 text-xs uppercase text-slate-700">
                        <tr>
                            <th className="px-6 py-3">Nome</th>
                            <th className="px-6 py-3">CPF</th>
                            <th className="px-6 py-3">Escola</th>
                            <th className="px-6 py-3">Turma</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {currentItems.map(s => (
                            <tr key={s.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{s.name}</td>
                                <td className="px-6 py-4">{s.cpf}</td>
                                <td className="px-6 py-4">{s.school || '-'}</td>
                                <td className="px-6 py-4">{s.className || '-'}</td>
                                <td className="px-6 py-4">
                                     <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                                        s.status === 'Matriculado' ? 'bg-green-50 text-green-700 border-green-200' :
                                        s.status === 'Pendente' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                        'bg-blue-50 text-blue-700 border-blue-200'
                                    }`}>
                                    {s.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {currentItems.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Nenhum registro encontrado.</td></tr>}
                    </tbody>
                </table>
            </div>
            {/* Pagination Controls */}
            {filteredStudents.length > itemsPerPage && (
                <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
                    <span className="text-xs text-slate-500">Página {currentPage} de {totalPages}</span>
                    <div className="flex gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border rounded hover:bg-white disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border rounded hover:bg-white disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};