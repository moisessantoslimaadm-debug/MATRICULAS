
import React, { useState, useMemo } from 'react';
import { INITIAL_REGISTRATION_STATE, MOCK_SCHOOLS } from '../constants';
import { RegistrationFormState, School } from '../types';
import { Check, ChevronRight, ChevronLeft, Upload, School as SchoolIcon, Bus, FileText, ListChecks, MapPin, Navigation } from 'lucide-react';
import { useNavigate } from '../router';

export const Registration: React.FC = () => {
  const [formState, setFormState] = useState<RegistrationFormState>(INITIAL_REGISTRATION_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (section: 'student' | 'guardian' | 'address', field: string, value: any) => {
    setFormState(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Haversine formula to calculate distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const d = R * c; // Distance in km
    return d;
  };

  // Mock geocoding service (since we don't have a real API key for Maps in this context)
  // In a real app, this would call Google Maps Geocoding API based on the address string
  const simulateGeocoding = () => {
    // Returns a fixed coordinate in the middle of our mock schools for demonstration
    return { lat: -23.562000, lng: -46.645000 }; 
  };

  const nextStep = () => {
    if (formState.step === 3) {
      // Simulate getting coordinates from the address
      const coords = simulateGeocoding();
      setFormState(prev => ({
        ...prev,
        address: { ...prev.address, lat: coords.lat, lng: coords.lng },
        step: prev.step + 1
      }));
    } else {
      setFormState(prev => ({ ...prev, step: prev.step + 1 }));
    }
  };

  const prevStep = () => setFormState(prev => ({ ...prev, step: prev.step - 1 }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/status?success=true');
    }, 2000);
  };

  // Calculate and sort schools by distance when on Step 4
  const sortedSchools = useMemo(() => {
    if (formState.step !== 4 || !formState.address.lat || !formState.address.lng) return MOCK_SCHOOLS;

    const schoolsWithDistance = MOCK_SCHOOLS.map(school => ({
      ...school,
      distance: calculateDistance(
        formState.address.lat!, 
        formState.address.lng!, 
        school.lat, 
        school.lng
      )
    }));

    return schoolsWithDistance.sort((a, b) => a.distance - b.distance);
  }, [formState.step, formState.address.lat, formState.address.lng]);

  const StepIndicator = () => (
    <div className="flex justify-between mb-8 relative">
      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className={`flex flex-col items-center bg-slate-50 px-2`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
            formState.step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
          }`}>
            {s < formState.step ? <Check className="h-5 w-5" /> : s}
          </div>
          <span className="text-xs font-medium text-slate-500 mt-2 hidden sm:block">
            {s === 1 && 'Aluno'}
            {s === 2 && 'Responsável'}
            {s === 3 && 'Endereço'}
            {s === 4 && 'Escola'}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Ficha de Matrícula</h2>
          
          {/* Section: Documentação Necessária */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600 hidden sm:block">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <ListChecks className="h-5 w-5 sm:hidden" />
                  Documentação Necessária
                </h3>
                <p className="text-sm text-blue-700 mb-4">
                  Para efetivar a matrícula, tenha em mãos (originais e cópias) os seguintes documentos para apresentar na escola selecionada:
                </p>
                <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-blue-800 font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-500" /> Certidão de Nascimento ou RG do Aluno
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-500" /> CPF do Aluno (se houver)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-500" /> RG e CPF do Responsável
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-500" /> Comprovante de Residência Atualizado
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-500" /> Cartão de Vacinação Atualizado
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-500" /> Cartão do SUS
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-500" /> Número do NIS (se beneficiário)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-500" /> Laudo Médico (para alunos com deficiência)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <StepIndicator />

          <form onSubmit={handleSubmit}>
            {/* Step 1: Student Data */}
            {formState.step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Dados do Aluno</h3>
                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={formState.student.fullName}
                      onChange={(e) => handleInputChange('student', 'fullName', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Data de Nascimento</label>
                      <input
                        type="date"
                        required
                        value={formState.student.birthDate}
                        onChange={(e) => handleInputChange('student', 'birthDate', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">CPF (Opcional)</label>
                      <input
                        type="text"
                        placeholder="000.000.000-00"
                        value={formState.student.cpf}
                        onChange={(e) => handleInputChange('student', 'cpf', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="specialNeeds"
                        checked={formState.student.needsSpecialEducation}
                        onChange={(e) => handleInputChange('student', 'needsSpecialEducation', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="specialNeeds" className="text-sm font-medium text-slate-700">Aluno possui necessidade educacional especial?</label>
                    </div>
                    {formState.student.needsSpecialEducation && (
                      <div className="mt-3">
                         <label className="block text-sm font-medium text-slate-700 mb-1">Detalhes / CID</label>
                         <input
                          type="text"
                          value={formState.student.specialEducationDetails}
                          onChange={(e) => handleInputChange('student', 'specialEducationDetails', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Descreva a necessidade..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Guardian Data */}
            {formState.step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Dados do Responsável</h3>
                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={formState.guardian.fullName}
                      onChange={(e) => handleInputChange('guardian', 'fullName', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                      <input
                        type="text"
                        required
                        placeholder="000.000.000-00"
                        value={formState.guardian.cpf}
                        onChange={(e) => handleInputChange('guardian', 'cpf', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Parentesco</label>
                      <select
                        value={formState.guardian.relationship}
                        onChange={(e) => handleInputChange('guardian', 'relationship', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option>Mãe</option>
                        <option>Pai</option>
                        <option>Avô/Avó</option>
                        <option>Tio/Tia</option>
                        <option>Outro Responsável Legal</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={formState.guardian.email}
                        onChange={(e) => handleInputChange('guardian', 'email', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Celular / WhatsApp</label>
                      <input
                        type="tel"
                        required
                        value={formState.guardian.phone}
                        onChange={(e) => handleInputChange('guardian', 'phone', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Address */}
            {formState.step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Endereço Residencial</h3>
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">CEP</label>
                      <input
                        type="text"
                        required
                        value={formState.address.zipCode}
                        onChange={(e) => handleInputChange('address', 'zipCode', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                     <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                      <input
                        type="text"
                        disabled
                        value={formState.address.city}
                        className="w-full px-4 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rua / Logradouro</label>
                    <input
                      type="text"
                      required
                      value={formState.address.street}
                      onChange={(e) => handleInputChange('address', 'street', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Número</label>
                      <input
                        type="text"
                        required
                        value={formState.address.number}
                        onChange={(e) => handleInputChange('address', 'number', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-slate-700 mb-1">Bairro</label>
                      <input
                        type="text"
                        required
                        value={formState.address.neighborhood}
                        onChange={(e) => handleInputChange('address', 'neighborhood', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  
                  {/* Transport Request */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="transport"
                        checked={formState.student.needsTransport}
                        onChange={(e) => handleInputChange('student', 'needsTransport', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex items-center gap-2">
                        <Bus className="h-4 w-4 text-blue-700" />
                         <label htmlFor="transport" className="text-sm font-medium text-slate-700">Solicitar Transporte Escolar (Zona Rural/Difícil Acesso)</label>
                      </div>
                    </div>
                  </div>

                  {/* Document Upload Simulation */}
                   <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition">
                      <Upload className="h-8 w-8 text-slate-400 mb-2" />
                      <p className="text-sm font-medium text-slate-700">Anexar Comprovante de Residência</p>
                      <p className="text-xs text-slate-500">PNG, JPG ou PDF (Máx. 5MB)</p>
                   </div>
                </div>
              </div>
            )}

            {/* Step 4: School Selection */}
            {formState.step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Seleção de Preferência</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Com base no seu endereço, calculamos a distância para as unidades escolares.
                  Selecione a escola de sua preferência.
                </p>
                
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {sortedSchools.map((school, index) => {
                    const isNearest = index < 3 && school.distance !== undefined;
                    
                    return (
                      <div 
                        key={school.id}
                        onClick={() => setFormState(prev => ({ ...prev, selectedSchoolId: school.id }))}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition relative ${
                          formState.selectedSchoolId === school.id 
                            ? 'border-blue-600 bg-blue-50' 
                            : isNearest 
                              ? 'border-green-200 bg-green-50/30 hover:border-green-300 hover:bg-green-50'
                              : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                        }`}
                      >
                        {isNearest && (
                          <div className="absolute -top-2.5 right-4 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                             <Navigation className="h-3 w-3" /> Recomendada
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg border ${isNearest ? 'bg-white border-green-100' : 'bg-white border-slate-100'}`}>
                              <SchoolIcon className={`h-6 w-6 ${isNearest ? 'text-green-600' : 'text-blue-600'}`} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-900">{school.name}</h4>
                              <p className="text-sm text-slate-500 flex items-center gap-1">
                                {school.distance !== undefined && (
                                  <span className="font-medium text-slate-700 bg-slate-100 px-1.5 rounded flex items-center gap-0.5">
                                    <MapPin className="h-3 w-3" />
                                    {school.distance.toFixed(2)} km
                                  </span>
                                )}
                                <span className="truncate max-w-[180px]">{school.address}</span>
                              </p>
                              <div className="flex gap-1 mt-1">
                                {school.types.map(t => <span key={t} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">{t}</span>)}
                              </div>
                            </div>
                          </div>
                          {formState.selectedSchoolId === school.id && <Check className="h-6 w-6 text-blue-600" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={formState.step === 1 || isSubmitting}
                className={`flex items-center px-6 py-2 rounded-lg text-slate-700 font-medium hover:bg-slate-100 transition ${formState.step === 1 ? 'opacity-0 cursor-default' : ''}`}
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Voltar
              </button>
              
              {formState.step < 4 ? (
                 <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md shadow-blue-200 transition"
                >
                  Próximo
                  <ChevronRight className="h-5 w-5 ml-1" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!formState.selectedSchoolId || isSubmitting}
                  className="flex items-center px-8 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-md shadow-green-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Enviando...' : 'Confirmar Matrícula'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
