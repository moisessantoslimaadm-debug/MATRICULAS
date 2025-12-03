
import React from 'react';
import { Upload, Download, FileSpreadsheet, Database, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { School, SchoolType } from '../types';

export const AdminData: React.FC = () => {
  const { schools, students, updateSchools, updateStudents, resetData } = useData();
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState('');

  // Função simples para converter CSV em Objeto (assumindo estrutura simples)
  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const obj: any = {};
      const currentline = lines[i].split(',');

      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j]?.trim();
      }
      result.push(obj);
    }
    return result;
  };

  const processSchoolImport = (data: any[]) => {
    const newSchools: School[] = data.map((item: any, index: number) => ({
      id: item.id || `imported_${Date.now()}_${index}`,
      inep: item.inep || '',
      name: item.name || 'Escola Importada Sem Nome',
      address: item.address || 'Endereço não informado',
      types: item.types ? item.types.split(';') as SchoolType[] : [SchoolType.INFANTIL], // Ex: "Infantil;Fundamental I" no CSV
      image: item.image || 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&q=80',
      rating: parseFloat(item.rating) || 4.5,
      availableSlots: parseInt(item.availableSlots) || 0,
      lat: parseFloat(item.lat) || -23.550520, // Default fallback
      lng: parseFloat(item.lng) || -46.633308
    }));
    
    if (newSchools.length > 0) {
      updateSchools(newSchools);
      return true;
    }
    return false;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let success = false;

        if (file.name.endsWith('.json')) {
            // Importação de Backup Completo (Escolas e Alunos)
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
                // Tenta adivinhar se é lista de escolas ou alunos baseado nos campos
                if (parsed.length > 0 && 'availableSlots' in parsed[0]) {
                    updateSchools(parsed);
                    success = true;
                } else if (parsed.length > 0 && 'cpf' in parsed[0]) {
                    updateStudents(parsed);
                    success = true;
                }
            }
        } else if (file.name.endsWith('.csv')) {
            // Importação simples de Escolas via CSV
            // Formato esperado: name,address,inep,rating,availableSlots,lat,lng
            const parsedData = parseCSV(content);
            success = processSchoolImport(parsedData);
        } else {
            throw new Error("Formato não suportado. Use .json ou .csv");
        }

        if (success) {
          setUploadStatus('success');
        } else {
            setUploadStatus('error');
            setErrorMessage('Não foi possível identificar dados válidos no arquivo.');
        }
      } catch (error) {
        console.error("Import error:", error);
        setUploadStatus('error');
        setErrorMessage('Erro ao ler o arquivo. Verifique o formato.');
      } finally {
        setIsUploading(false);
        setTimeout(() => setUploadStatus('idle'), 5000);
      }
    };

    reader.readAsText(file);
  };

  const handleBackup = () => {
    // Faz backup apenas dos alunos por padrão, ou pode fazer um objeto combinado
    const backupData = students; 
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `backup_educamunicipio_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Gestão de Dados e Backup</h1>
          <p className="text-slate-600 mt-2">
            Central de controle para importação de planilhas de matrícula e backup de segurança.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card Retroalimentação */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Importar Dados (Escolas)</h2>
            </div>
            <p className="text-slate-600 text-sm mb-6">
              Importe planilhas (.csv) com novas escolas ou arquivos de backup (.json) para atualizar o sistema.
              <br/>
              <span className="text-xs text-slate-400">Campos CSV: name, address, inep, rating, availableSlots, lat, lng</span>
            </p>
            
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition relative ${
                uploadStatus === 'error' ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:bg-slate-50'
            }`}>
              <input 
                type="file" 
                accept=".json,.csv" 
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={isUploading}
              />
              {isUploading ? (
                <div className="flex flex-col items-center text-blue-600">
                  <RefreshCw className="h-8 w-8 animate-spin mb-2" />
                  <span className="font-medium">Processando dados...</span>
                </div>
              ) : uploadStatus === 'success' ? (
                <div className="flex flex-col items-center text-green-600">
                  <Check className="h-8 w-8 mb-2" />
                  <span className="font-medium">Dados importados com sucesso!</span>
                </div>
              ) : uploadStatus === 'error' ? (
                 <div className="flex flex-col items-center text-red-600">
                  <AlertTriangle className="h-8 w-8 mb-2" />
                  <span className="font-medium">Erro na importação</span>
                  <span className="text-xs mt-1">{errorMessage}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-slate-500">
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="font-medium text-slate-700">Clique para enviar</span>
                  <span className="text-xs mt-1">JSON ou CSV</span>
                </div>
              )}
            </div>
          </div>

          {/* Card Backup */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                <Database className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Backup e Status</h2>
            </div>
            <p className="text-slate-600 text-sm mb-6">
              Resumo dos dados atuais no sistema e opção de download.
            </p>

            <div className="space-y-4 mb-6">
               <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center">
                 <span className="text-sm font-medium text-slate-600">Total de Alunos</span>
                 <span className="text-lg font-bold text-slate-900">{students.length}</span>
               </div>
               <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center">
                 <span className="text-sm font-medium text-slate-600">Total de Escolas</span>
                 <span className="text-lg font-bold text-slate-900">{schools.length}</span>
               </div>
            </div>

            <div className="flex flex-col gap-3">
                <button 
                onClick={handleBackup}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition shadow-lg shadow-indigo-200"
                >
                <Download className="h-5 w-5" />
                Baixar Backup (Alunos)
                </button>
                
                <button 
                  onClick={resetData}
                  className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 py-2 rounded-lg font-medium transition text-sm"
                >
                  Restaurar Padrão (Limpar Dados)
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
