import React from 'react';
import { Upload, Download, FileSpreadsheet, Database, RefreshCw, Check } from 'lucide-react';
import { MOCK_STUDENT_REGISTRY } from '../constants';

export const AdminData: React.FC = () => {
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      // Simulate processing
      setTimeout(() => {
        setIsUploading(false);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }, 2000);
    }
  };

  const handleBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(MOCK_STUDENT_REGISTRY, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "backup_alunos_educamunicipio.json");
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
              <h2 className="text-xl font-bold text-slate-800">Retroalimentação</h2>
            </div>
            <p className="text-slate-600 text-sm mb-6">
              Importe a planilha oficial (.xlsx ou .csv) para atualizar a base de dados dos alunos, turmas e status de matrícula.
            </p>
            
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition relative">
              <input 
                type="file" 
                accept=".xlsx,.csv" 
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {isUploading ? (
                <div className="flex flex-col items-center text-blue-600">
                  <RefreshCw className="h-8 w-8 animate-spin mb-2" />
                  <span className="font-medium">Processando dados...</span>
                </div>
              ) : uploadSuccess ? (
                <div className="flex flex-col items-center text-green-600">
                  <Check className="h-8 w-8 mb-2" />
                  <span className="font-medium">Dados atualizados com sucesso!</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-slate-500">
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="font-medium text-slate-700">Clique para enviar</span>
                  <span className="text-xs mt-1">ou arraste o arquivo aqui</span>
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
              <h2 className="text-xl font-bold text-slate-800">Backup de Segurança</h2>
            </div>
            <p className="text-slate-600 text-sm mb-6">
              Gere uma cópia de segurança completa de todos os registros do sistema. Recomendado realizar semanalmente.
            </p>

            <div className="bg-slate-50 rounded-xl p-6 mb-6">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-sm font-medium text-slate-600">Total de Registros</span>
                 <span className="text-lg font-bold text-slate-900">{MOCK_STUDENT_REGISTRY.length}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-sm font-medium text-slate-600">Última atualização</span>
                 <span className="text-sm text-slate-900">Hoje, 10:42</span>
               </div>
            </div>

            <button 
              onClick={handleBackup}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition shadow-lg shadow-indigo-200"
            >
              <Download className="h-5 w-5" />
              Baixar Backup Completo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};