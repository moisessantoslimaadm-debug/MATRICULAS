
import React, { useState } from 'react';
import { useSearchParams, Link } from '../App';
import { CheckCircle, FileText, Search, UserCheck, AlertCircle, Bus, GraduationCap, School, Clock, Hash } from 'lucide-react';
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
      return s.name.toLowerCase().includes(term) || (cleanCpf && cleanCpf.includes(cleanTerm));
    });

    setSearchResult(found || 'not-found');
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-in zoom-in-95 duration-300 border border-slate-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Solicitação Enviada!</h2>
          <p className="text-slate-600 mb-6">
            Os dados foram recebidos com sucesso. O número do seu protocolo é:
          </p>
          <div className="bg-blue-50 py-4 px-6 rounded-xl mb-8 border border-blue-100">
            <span className="text-2xl font-mono font-bold text-blue-700 tracking-wider">MAT-{Math.floor(Math.random() * 100000)}</span>
          </div>
          <p className="text-sm text-slate-500 mb-8">
            Você receberá atualizações sobre o status da matrícula no email cadastrado e via WhatsApp.
          </p>
          <div className="space-y-3">
             <button onClick={() => window.print()} className="w-full py-3 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition flex items-center justify-center gap-2">
              <FileText className="h-4 w-4" />
              Imprimir Comprovante
            </button>
            <Link to="/" className="block w-full py-3 bg-blue-600 rounded-xl text-white font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200/50">
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Consultas</h1>
          <p className="text-slate-600 mt-2">Verifique o andamento da matrícula ou a situação cadastral.</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/50">
            <button
              onClick={() => setActiveTab('protocol')}
              className={`flex-1 py-4 text-sm font-semibold text-center transition-all flex items-center justify-center gap-2 relative ${
                activeTab === 'protocol' 
                  ? 'text-blue-600' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <FileText className="h-4 w-4" />
              Protocolo
              {activeTab === 'protocol' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
            </button>
            <button
              onClick={() => setActiveTab('student')}
              className={`flex-1 py-4 text-sm font-semibold text-center transition-all flex items-center justify-center gap-2 relative ${
                activeTab === 'student' 
                  ? 'text-blue-600' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              Buscar Aluno
              {activeTab === 'student' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'protocol' ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">CPF do Responsável</label>
                   <input type="text" placeholder="000.000.000-00" className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
                </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Número do Protocolo</label>
                   <input 
                    type="text" 
                    placeholder="MAT-00000" 
                    value={protocolInput}
                    onChange={(e) => setProtocolInput(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
                   />
                </div>
                <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 mt-2 transition shadow-lg shadow-blue-200">
                  Consultar
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <form onSubmit={handleStudentSearch} className="space-y-4">
                   <div className="relative">
                     <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo ou CPF do Aluno</label>
                     <input 
                      type="text" 
                      placeholder="Digite para buscar..." 
                      value={studentInput}
                      onChange={(e) => setStudentInput(e.target.value)}
                      className="w-full px-4 py-3 pl-11 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
                     />
                     <Search className="absolute left-4 top-10 h-5 w-5 text-slate-400" />
                   </div>
                   <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                    Pesquisar na Rede
                  </button>
                </form>

                {searchResult === 'not-found' && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 text-red-800">
                    <div className="bg-white p-1.5 rounded-full shadow-sm">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Aluno não encontrado</p>
                      <p className="text-sm mt-1 text-red-600/80">Verifique se o nome ou CPF foram digitados corretamente.</p>
                    </div>
                  </div>
                )}

                {searchResult && searchResult !== 'not-found' && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-0 overflow-hidden shadow-sm animate-in fade-in zoom-in-95">
                     <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-slate-900 leading-tight">{searchResult.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">ID: {searchResult.id}</span>
                            {searchResult.enrollmentId && (
                               <span className="text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                                 <Hash className="h-3 w-3" /> {searchResult.enrollmentId}
                               </span>
                            )}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border whitespace-nowrap ${
                          searchResult.status === 'Matriculado' ? 'bg-green-50 text-green-700 border-green-200' :
                          searchResult.status === 'Pendente' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {searchResult.status}
                        </span>
                     </div>

                     <div className="p-6 space-y-5">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                              <span className="block text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">CPF</span>
                              <span className="font-medium text-slate-800">{searchResult.cpf || "Não informado"}</span>
                            </div>
                            <div>
                              <span className="block text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Nascimento</span>
                              <span className="font-medium text-slate-800">{searchResult.birthDate}</span>
                            </div>
                        </div>

                        <div className="h-px bg-slate-100 w-full"></div>

                        <div className="space-y-3">
                            {searchResult.grade && (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                                        <GraduationCap className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <span className="block text-xs text-slate-500">Etapa / Turma</span>
                                        <span className="text-sm font-medium text-slate-900 block">{searchResult.grade}</span>
                                        {searchResult.className && <span className="text-xs text-blue-600 font-medium mt-0.5 block">{searchResult.className}</span>}
                                    </div>
                                </div>
                            )}

                             {/* Transport Info */}
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg shrink-0 ${searchResult.transportRequest ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                                    <Bus className="h-4 w-4" />
                                </div>
                                <div>
                                    <span className="block text-xs text-slate-500">Transporte Escolar</span>
                                    <span className={`text-sm font-medium ${searchResult.transportRequest ? 'text-green-700' : 'text-slate-500'}`}>
                                        {searchResult.transportRequest ? 'Utiliza Transporte Oficial' : 'Não Solicitado'}
                                    </span>
                                    {searchResult.transportType && (
                                        <span className="text-xs text-slate-500 block mt-0.5 capitalize">{searchResult.transportType}</span>
                                    )}
                                </div>
                            </div>

                            {searchResult.school && (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                                        <School className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <span className="block text-xs text-slate-500">Unidade Escolar</span>
                                        <span className="text-sm font-medium text-slate-900 block">{searchResult.school}</span>
                                        {searchResult.shift && (
                                            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                                                <Clock className="h-3 w-3" />
                                                {searchResult.shift}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
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
