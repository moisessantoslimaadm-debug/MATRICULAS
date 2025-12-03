import React, { useState } from 'react';
import { useSearchParams, Link } from '../App';
import { CheckCircle, FileText, Search, UserCheck, AlertCircle, Bus, GraduationCap } from 'lucide-react';
import { MOCK_STUDENT_REGISTRY } from '../constants';
import { RegistryStudent } from '../types';

export const Status: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';
  const [activeTab, setActiveTab] = useState<'protocol' | 'student'>('protocol');
  
  // Protocol Search State
  const [protocolInput, setProtocolInput] = useState('');
  
  // Student Registry Search State
  const [studentInput, setStudentInput] = useState('');
  const [searchResult, setSearchResult] = useState<RegistryStudent | null | 'not-found'>(null);

  const handleStudentSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentInput.trim()) return;

    const term = studentInput.toLowerCase().trim();
    // Remove punctuation from input for flexible CPF search
    const cleanTerm = term.replace(/[^\w\s]/gi, '');

    const found = MOCK_STUDENT_REGISTRY.find(s => {
      const cleanCpf = s.cpf.replace(/[^\w\s]/gi, '');
      return s.name.toLowerCase().includes(term) || cleanCpf.includes(cleanTerm);
    });

    setSearchResult(found || 'not-found');
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Solicitação Enviada!</h2>
          <p className="text-slate-600 mb-6">
            Os dados foram recebidos com sucesso. O número do seu protocolo é:
          </p>
          <div className="bg-slate-100 py-3 px-6 rounded-lg mb-8 border border-dashed border-slate-300">
            <span className="text-xl font-mono font-bold text-slate-800">MAT-{Math.floor(Math.random() * 100000)}</span>
          </div>
          <p className="text-sm text-slate-500 mb-8">
            Você receberá atualizações sobre o status da matrícula no email cadastrado e via WhatsApp.
          </p>
          <div className="space-y-3">
             <button onClick={() => window.print()} className="w-full py-2.5 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition">
              Imprimir Comprovante
            </button>
            <Link to="/" className="block w-full py-2.5 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200">
              Voltar ao Início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">Consultas</h1>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('protocol')}
              className={`flex-1 py-4 text-sm font-medium text-center transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'protocol' 
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileText className="h-4 w-4" />
              Protocolo de Inscrição
            </button>
            <button
              onClick={() => setActiveTab('student')}
              className={`flex-1 py-4 text-sm font-medium text-center transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'student' 
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              Buscar Aluno (Base)
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'protocol' ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">CPF do Responsável</label>
                   <input type="text" placeholder="000.000.000-00" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Número do Protocolo</label>
                   <input 
                    type="text" 
                    placeholder="MAT-00000" 
                    value={protocolInput}
                    onChange={(e) => setProtocolInput(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                   />
                </div>
                <button className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 mt-4 transition">
                  Consultar Protocolo
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <form onSubmit={handleStudentSearch} className="space-y-4">
                   <div className="relative">
                     <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Aluno ou CPF</label>
                     <input 
                      type="text" 
                      placeholder="Digite para buscar..." 
                      value={studentInput}
                      onChange={(e) => setStudentInput(e.target.value)}
                      className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                     />
                     <Search className="absolute left-3 top-9 h-5 w-5 text-slate-400" />
                   </div>
                   <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                    Buscar na Rede
                  </button>
                </form>

                {searchResult === 'not-found' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-800">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Aluno não encontrado</p>
                      <p className="text-sm mt-1">Verifique os dados ou realize uma nova matrícula.</p>
                    </div>
                  </div>
                )}

                {searchResult && searchResult !== 'not-found' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4 animate-in fade-in zoom-in-95">
                     <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">{searchResult.name}</h3>
                          <p className="text-sm text-slate-500">ID: {searchResult.id}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                          searchResult.status === 'Matriculado' ? 'bg-green-100 text-green-700' :
                          searchResult.status === 'Pendente' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {searchResult.status}
                        </span>
                     </div>

                     <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="block text-slate-500 text-xs">CPF</span>
                          <span className="font-medium text-slate-800">{searchResult.cpf}</span>
                        </div>
                        <div>
                          <span className="block text-slate-500 text-xs">Nascimento</span>
                          <span className="font-medium text-slate-800">{searchResult.birthDate}</span>
                        </div>
                     </div>

                     {/* Enhanced Details extracted from PDF Logic */}
                     <div className="pt-4 border-t border-blue-200 space-y-3">
                        {searchResult.grade && (
                           <div className="flex items-center gap-2 text-sm text-slate-700">
                              <GraduationCap className="h-4 w-4 text-blue-600" />
                              <span>Etapa: <span className="font-medium">{searchResult.grade}</span></span>
                           </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                           <Bus className={`h-4 w-4 ${searchResult.transportRequest ? 'text-green-600' : 'text-slate-400'}`} />
                           <span>
                              Transporte Escolar: 
                              <span className={`font-medium ml-1 ${searchResult.transportRequest ? 'text-green-700' : 'text-slate-500'}`}>
                                 {searchResult.transportRequest ? 'Solicitado/Deferido' : 'Não Solicitado'}
                              </span>
                           </span>
                        </div>

                        {searchResult.school && (
                          <div className="mt-2">
                             <span className="block text-slate-500 text-xs">Escola Alocada</span>
                             <span className="font-medium text-slate-800">{searchResult.school}</span>
                             {searchResult.shift && <span className="text-slate-500 text-xs ml-2">({searchResult.shift})</span>}
                          </div>
                        )}
                     </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};