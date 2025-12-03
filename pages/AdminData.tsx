
import React, { useState, useMemo } from 'react';
import { Upload, Download, FileSpreadsheet, Database, RefreshCw, Check, AlertTriangle, FileText, X, Users, Search, ChevronLeft, ChevronRight, School as SchoolIcon, Filter } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { School, SchoolType, RegistryStudent } from '../types';

export const AdminData: React.FC = () => {
  const { schools, students, updateSchools, updateStudents, resetData } = useData();
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);

  // State for Data Inspection Table
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('Todas');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Extract unique school names from students for filter
  const schoolNames = useMemo(() => {
      const names = new Set(students.map(s => s.school).filter(Boolean));
      return Array.from(names).sort();
  }, [students]);

  // Normaliza strings para chaves de objeto (remove acentos, espaços, lowercase)
  const normalizeKey = (key: string) => {
    return key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  };

  // Função aprimorada para converter CSV em Objeto
  const parseCSV = (text: string): any[] => {
    const lines = text.split(/\r\n|\n/);
    if (lines.length === 0) return [];

    // Detectar separador (vírgula ou ponto e vírgula)
    const firstLine = lines[0];
    const separator = firstLine.includes(';') ? ';' : ',';

    // Cabeçalhos originais para referência, normalizados para mapeamento
    const headers = firstLine.split(separator).map(h => normalizeKey(h.trim()));
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const obj: any = {};
      const currentline = lines[i].split(separator);

      for (let j = 0; j < headers.length; j++) {
        const val = currentline[j] ? currentline[j].trim().replace(/^"|"$/g, '') : '';
        obj[headers[j]] = val;
      }
      // Apenas adiciona se tiver pelo menos um campo preenchido
      if (Object.keys(obj).some(k => obj[k])) {
        result.push(obj);
      }
    }
    return result;
  };

  // Helper para formatar data para DD/MM/AAAA
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    // Se já for DD/MM/AAAA
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) return dateStr;
    // Se for YYYY-MM-DD
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [y, m, d] = dateStr.split('-');
      return `${d}/${m}/${y}`;
    }
    return dateStr;
  };

  const processSchoolImport = (data: any[]) => {
    const newSchools: School[] = data.map((item: any, index: number) => {
      // Mapeamento flexível baseado nas chaves normalizadas
      
      // Processar Tipos de Escola
      let types: SchoolType[] = [];
      const rawType = (item.tipo || item.types || item.modalidade || '').toLowerCase();
      
      if (rawType.includes('infantil') || rawType.includes('creche') || rawType.includes('pre')) {
        types.push(SchoolType.INFANTIL);
      }
      if (rawType.includes('fundamental')) {
         if (rawType.includes('1') || rawType.includes('i') || rawType.includes('inicial')) types.push(SchoolType.FUNDAMENTAL_1);
         if (rawType.includes('2') || rawType.includes('ii') || rawType.includes('final')) types.push(SchoolType.FUNDAMENTAL_2);
         // Se genérico, adiciona o 1 por padrão
         if (!types.includes(SchoolType.FUNDAMENTAL_1) && !types.includes(SchoolType.FUNDAMENTAL_2)) types.push(SchoolType.FUNDAMENTAL_1);
      }
      if (rawType.includes('medio')) types.push(SchoolType.MEDIO);
      if (rawType.includes('eja')) types.push(SchoolType.EJA);
      
      // Default se não encontrar
      if (types.length === 0) types.push(SchoolType.INFANTIL);

      return {
        id: item.id || item.codigo || `school_${Date.now()}_${index}`,
        inep: item.inep || item.codigo || item.codinep || '',
        name: item.name || item.nome || item.escola || item.unidade || 'Escola Importada',
        address: item.address || item.endereco || item.localizacao || 'Endereço não informado',
        types: types,
        image: item.image || item.imagem || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80',
        rating: parseFloat(item.rating || item.nota || item.avaliacao) || 4.5,
        availableSlots: parseInt(item.availableslots || item.vagas || item.capacidade) || 0,
        lat: parseFloat(item.lat || item.latitude) || -23.550520,
        lng: parseFloat(item.lng || item.longitude) || -46.633308
      };
    });
    
    if (newSchools.length > 0) {
      updateSchools(newSchools);
      return newSchools.length;
    }
    return 0;
  };

  const processStudentImport = (data: any[]) => {
    const newStudents: RegistryStudent[] = data.map((item: any, index: number) => {
      // Mapeamento robusto de colunas
      const name = (item.name || item.nome || item.nomedoaluno || item.aluno || 'Aluno Sem Nome').toUpperCase();
      const cpfRaw = item.cpf || item.doc || item.documento || '';
      const cpf = cpfRaw.replace(/\D/g, ''); // Remove tudo que não é dígito
      
      const birthDateRaw = item.birthdate || item.nascimento || item.datadenascimento || item.dtnasc || '';
      
      // Tenta inferir status
      const statusRaw = item.status || item.situacao || 'Matriculado';
      let status: RegistryStudent['status'] = 'Matriculado';
      if (statusRaw.toLowerCase().includes('pendente')) status = 'Pendente';
      if (statusRaw.toLowerCase().includes('analise')) status = 'Em Análise';

      return {
        id: item.id || item.matricula || item.codigo || item.ra || `student_${Date.now()}_${index}`,
        enrollmentId: item.enrollmentid || item.protocolo || item.matricula || item.codigomatricula || '',
        name: name,
        birthDate: formatDate(birthDateRaw),
        cpf: cpf,
        status: status,
        school: item.school || item.escola || item.unidadeescolar || item.creche || '',
        grade: item.grade || item.etapa || item.serie || item.ano || '',
        shift: item.shift || item.turno || item.periodo || '',
        className: item.classname || item.turma || item.nometurma || '',
        classId: item.classid || item.codturma || item.codigoturma || '',
        transportRequest: (item.transport || item.transporte || item.utilizatransporte || '').toString().toLowerCase().includes('sim'), 
        transportType: item.transporttype || item.tipotransporte || item.veiculo || '',
        specialNeeds: (item.specialneeds || item.deficiencia || item.nee || item.aee || '').toString().toLowerCase().includes('sim')
      };
    });

    if (newStudents.length > 0) {
      updateStudents(newStudents);
      return newStudents.length;
    }
    return 0;
  };

  // Processador específico para o layout do Educacenso (Arquivo enviado pelo usuário)
  const processEducacenso = (text: string) => {
    const lines = text.split(/\r\n|\n/);
    let schoolName = "Escola Municipal";
    let schoolCode = "";
    let city = "Município";
    let schoolCreated = false;
    
    const newStudents: RegistryStudent[] = [];
    let isTableBody = false;

    // 1. Extrair Metadados da Escola (Cabeçalho do arquivo)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('Nome da escola:')) {
        const parts = line.split(';');
        const namePart = parts.find(p => p && p.trim() !== '' && !p.includes('Nome da escola'));
        if (namePart) schoolName = namePart.trim();
      }
      
      if (line.includes('Código da escola:')) {
         const parts = line.split(';');
         const codePart = parts.find(p => p && p.trim() !== '' && !p.includes('Código da escola'));
         if (codePart) schoolCode = codePart.trim();
      }

      if (line.includes('Município:')) {
         const parts = line.split(';');
         const cityPart = parts.find(p => p && p.trim() !== '' && !p.includes('Município'));
         if (cityPart) city = cityPart.trim();
      }

      if (line.includes('Identificação única') && line.includes('Nome') && line.includes('Data de nascimento')) {
        isTableBody = true;
        continue; 
      }

      if (isTableBody && line.trim() !== '') {
        const cols = line.split(';');
        const id = cols[2]?.trim();
        const name = cols[4]?.trim();
        
        if (id && name) {
            const birthDate = cols[7]?.trim();
            const cpf = cols[9]?.trim();
            const transport = cols[22]?.trim().toLowerCase() === 'sim';
            const enrollmentId = cols[26]?.trim();
            const classId = cols[27]?.trim();
            const className = cols[28]?.trim();
            const grade = cols[31]?.trim() || cols[30]?.trim(); 
            
            let shift = 'Integral';
            const schedule = cols[34] || '';
            if (schedule.toLowerCase().includes('13:00') || className?.includes('VESPERTINO')) shift = 'Vespertino';
            else if (schedule.toLowerCase().includes('08:00') && !schedule.toLowerCase().includes('17:00') || className?.includes('MATUTINO')) shift = 'Matutino';

            const specialNeedsRaw = cols[15]?.trim();
            const specialNeeds = specialNeedsRaw && specialNeedsRaw !== '--' && specialNeedsRaw !== '';

            newStudents.push({
              id: id,
              enrollmentId: enrollmentId,
              name: name.toUpperCase(),
              birthDate: birthDate,
              cpf: cpf,
              status: 'Matriculado',
              school: schoolName,
              grade: grade,
              className: className,
              classId: classId,
              shift: shift,
              transportRequest: transport,
              specialNeeds: !!specialNeeds,
              transportType: transport ? 'Vans/Kombis' : undefined
            });
        }
      }
    }

    if (newStudents.length > 0 || schoolName) {
       const schoolExists = schools.some(s => s.name === schoolName || s.inep === schoolCode);
       
       if (!schoolExists) {
         const newSchool: School = {
            id: schoolCode || Date.now().toString(),
            inep: schoolCode,
            name: schoolName,
            address: `${city} - BA`,
            types: [SchoolType.INFANTIL, SchoolType.FUNDAMENTAL_1],
            image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80',
            rating: 5.0,
            availableSlots: 0,
            lat: -12.5253,
            lng: -40.2917
         };
         updateSchools([newSchool]);
         schoolCreated = true;
       }
       
       updateStudents(newStudents);
       
       return {
         count: newStudents.length,
         school: schoolName,
         created: schoolCreated
       };
    }
    return null;
  };

  const processFile = (file: File) => {
    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');
    setSuccessMessage('');
    setUploadProgress(0);

    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    reader.onload = (event) => {
      setTimeout(() => {
        try {
          const content = event.target?.result as string;
          let count = 0;
          let type = '';

          if (file.name.endsWith('.json')) {
              const parsed = JSON.parse(content);
              if (Array.isArray(parsed)) {
                  if (parsed.length > 0 && ('availableSlots' in parsed[0] || 'lat' in parsed[0])) {
                      updateSchools(parsed);
                      count = parsed.length;
                      type = 'escolas';
                  } else if (parsed.length > 0 && ('cpf' in parsed[0] || 'name' in parsed[0] || 'nome' in parsed[0])) {
                      updateStudents(parsed);
                      count = parsed.length;
                      type = 'alunos';
                  }
              }
          } else if (file.name.endsWith('.csv') || content.includes('Ministério da Educação')) {
              // Tenta processar como Educacenso primeiro se tiver os marcadores
              if (content.includes('Ministério da Educação') || content.includes('Educacenso')) {
                  const result = processEducacenso(content);
                  if (result) {
                     setSuccessMessage(`${result.count} alunos importados para a escola "${result.school}"${result.created ? ' (Nova escola criada)' : ''}.`);
                     setUploadStatus('success');
                     return;
                  }
              }

              // Processamento Genérico de CSV
              const parsedData = parseCSV(content);
              
              if (parsedData.length > 0) {
                const firstRowKeys = Object.keys(parsedData[0]);
                
                // Detecção de Escolas vs Alunos
                const isSchoolData = firstRowKeys.some(k => 
                    ['lat', 'latitude', 'vagas', 'capacidade', 'endereco', 'address', 'tipo'].includes(k)
                );
                const isStudentData = firstRowKeys.some(k => 
                    ['nascimento', 'datadenascimento', 'cpf', 'turma', 'aluno', 'nome'].includes(k)
                );

                if (isSchoolData) {
                  count = processSchoolImport(parsedData);
                  type = 'escolas';
                } else if (isStudentData) {
                  count = processStudentImport(parsedData);
                  type = 'alunos';
                } else {
                   // Fallback: Se tem nome e não é escola, assume aluno
                   if (firstRowKeys.some(k => k.includes('nome') || k.includes('name'))) {
                      count = processStudentImport(parsedData);
                      type = 'alunos (detectado)';
                   }
                }
              }
          } else {
              throw new Error("Formato não suportado. Use .json ou .csv");
          }

          if (count > 0) {
            setSuccessMessage(`${count} registros de ${type} processados e cadastrados com sucesso!`);
            setUploadStatus('success');
          } else {
            setUploadStatus('error');
            setErrorMessage('Não foi possível identificar dados válidos no arquivo. Verifique o cabeçalho das colunas.');
          }
        } catch (error) {
          console.error("Import error:", error);
          setUploadStatus('error');
          setErrorMessage('Erro ao ler o arquivo. Verifique a formatação e tente novamente.');
        } finally {
          setIsUploading(false);
        }
      }, 600);
    };

    reader.onerror = () => {
      setUploadStatus('error');
      setErrorMessage('Erro na leitura do arquivo.');
      setIsUploading(false);
    };

    reader.readAsText(file, 'ISO-8859-1');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        processFile(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
        processFile(file);
    }
  };

  const handleBackup = () => {
    const backupData = {
      students,
      schools
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `backup_educamunicipio_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const resetUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadStatus('idle');
    setUploadProgress(0);
  };

  // --- Student List Logic ---
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const searchLower = searchTerm.toLowerCase().trim();
      const studentName = student.name.toLowerCase();
      const studentCpf = student.cpf.replace(/\D/g, '');
      
      const matchesSearch = studentName.includes(searchLower) || studentCpf.includes(searchLower);
      const matchesSchool = schoolFilter === 'Todas' || student.school === schoolFilter;

      return matchesSearch && matchesSchool;
    });
  }, [students, searchTerm, schoolFilter]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Gestão de Dados e Backup</h1>
          <p className="text-slate-600 mt-2">
            Importe planilhas (.csv) para cadastrar <strong>Alunos</strong> ou <strong>Escolas</strong> automaticamente.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Card Retroalimentação */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Importar Dados</h2>
            </div>
            <div className="text-slate-600 text-sm mb-6 space-y-2">
              <p>Arraste um arquivo .CSV ou .JSON para iniciar.</p>
              <div className="bg-slate-50 p-3 rounded border border-slate-100 text-xs space-y-2">
                <div>
                    <p className="font-semibold text-blue-700 mb-0.5">Para Escolas:</p>
                    <p className="text-slate-500">Colunas: nome, endereco, lat, lng, tipo, capacidade</p>
                </div>
                <div>
                    <p className="font-semibold text-green-700 mb-0.5">Para Alunos:</p>
                    <p className="text-slate-500">Colunas: nome, cpf, nascimento, escola, turma</p>
                </div>
                 <div>
                    <p className="font-semibold text-purple-700 mb-0.5">Educacenso:</p>
                    <p className="text-slate-500">Suporte nativo para arquivos de exportação do Inep.</p>
                </div>
              </div>
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
                  <p className="text-blue-700 font-medium mb-2">Lendo arquivo...</p>
                  <div className="w-full bg-blue-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 animate-pulse" 
                      style={{ width: `${Math.max(5, uploadProgress)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-blue-500 mt-2 text-right font-bold">{uploadProgress}%</p>
                </div>
              ) : uploadStatus === 'success' ? (
                <div className="flex flex-col items-center text-green-700 relative z-20">
                   <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
                      <Check className="h-8 w-8 text-green-600" />
                   </div>
                  <span className="font-bold text-lg">Sucesso!</span>
                  <span className="text-sm mt-1 text-center font-medium px-2">{successMessage}</span>
                  <button 
                    onClick={resetUpload}
                    className="mt-6 px-6 py-2.5 bg-white border border-green-200 text-green-700 rounded-lg text-sm font-bold hover:bg-green-50 transition shadow-sm hover:shadow-md"
                  >
                    Carregar Novo Arquivo
                  </button>
                </div>
              ) : uploadStatus === 'error' ? (
                 <div className="flex flex-col items-center text-red-700 relative z-20">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                   </div>
                  <span className="font-bold text-lg">Falha na Importação</span>
                  <span className="text-sm mt-1 text-center max-w-[250px]">{errorMessage}</span>
                  <button 
                    onClick={resetUpload}
                    className="mt-6 px-6 py-2.5 bg-white border border-red-200 text-red-700 rounded-lg text-sm font-bold hover:bg-red-50 transition shadow-sm hover:shadow-md"
                  >
                    Tentar Novamente
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-slate-500 pointer-events-none">
                  <div className={`p-4 rounded-full bg-slate-100 mb-4 ${isDragging ? 'scale-110 bg-blue-100 text-blue-600' : ''} transition-all duration-200`}>
                    <Upload className="h-8 w-8" />
                  </div>
                  <span className="font-medium text-slate-700 text-lg mb-1">{isDragging ? 'Solte para enviar' : 'Clique ou arraste aqui'}</span>
                  <span className="text-sm text-slate-400">Suporta .CSV e .JSON</span>
                </div>
              )}
            </div>
          </div>

          {/* Card Backup */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                <Database className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Backup e Status</h2>
            </div>
            <p className="text-slate-600 text-sm mb-6">
              Visão geral dos dados ativos no sistema.
            </p>

            <div className="space-y-4 mb-8 flex-1">
               <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex justify-between items-center transition hover:border-blue-200">
                 <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-sm font-medium text-slate-600 block">Alunos Cadastrados</span>
                        <span className="text-xs text-slate-400">Inclui importados e matrículas novas</span>
                    </div>
                 </div>
                 <span className="text-2xl font-bold text-slate-900">{students.length}</span>
               </div>
               <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex justify-between items-center transition hover:border-green-200">
                 <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg text-green-600">
                        <SchoolIcon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">Escolas Ativas</span>
                 </div>
                 <span className="text-2xl font-bold text-slate-900">{schools.length}</span>
               </div>
            </div>

            <div className="flex flex-col gap-3 mt-auto">
                <button 
                onClick={handleBackup}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-medium transition shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transform duration-200"
                >
                <Download className="h-5 w-5" />
                Baixar Backup Completo (JSON)
                </button>
                
                <button 
                  onClick={resetData}
                  className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-xl font-medium transition text-sm mt-2"
                >
                  <X className="h-4 w-4" />
                  Zerar Base de Dados
                </button>
            </div>
          </div>
        </div>

        {/* Lista de Alunos (Data Inspection) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <Users className="h-5 w-5 text-slate-500" />
               Lista de Alunos ({filteredStudents.length})
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Buscar por nome ou CPF..." 
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                </div>
                <div className="relative w-full sm:w-48">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select
                        value={schoolFilter}
                        onChange={(e) => { setSchoolFilter(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                    >
                        <option value="Todas">Todas as Escolas</option>
                        {schoolNames.map(school => (
                            <option key={school} value={school}>{school}</option>
                        ))}
                    </select>
                </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-700 uppercase bg-slate-100/50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">ID</th>
                  <th className="px-6 py-3 font-semibold">Nome</th>
                  <th className="px-6 py-3 font-semibold">CPF</th>
                  <th className="px-6 py-3 font-semibold">Escola / Turma</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((student) => (
                    <tr key={student.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-mono text-slate-500 text-xs">{student.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{student.name}</td>
                      <td className="px-6 py-4">{student.cpf || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-slate-900 font-medium">{student.school || 'Não alocada'}</span>
                          <span className="text-xs text-slate-500">{student.className || student.grade}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                          student.status === 'Matriculado' ? 'bg-green-50 text-green-700 border-green-200' :
                          student.status === 'Pendente' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      Nenhum aluno encontrado com os critérios de busca.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredStudents.length > itemsPerPage && (
            <div className="flex justify-between items-center p-4 border-t border-slate-200 bg-slate-50">
              <span className="text-xs text-slate-500">
                Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredStudents.length)} de {filteredStudents.length} resultados
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
