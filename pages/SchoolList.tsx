import React, { useState } from 'react';
import { MOCK_SCHOOLS } from '../constants';
import { MapPin, Star, Users, Search } from 'lucide-react';
import { SchoolType } from '../types';

export const SchoolList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('Todos');

  const filteredSchools = MOCK_SCHOOLS.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          school.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'Todos' || school.types.includes(filterType as SchoolType);
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Escolas da Rede Municipal</h1>
          <p className="text-slate-600">Explore as unidades de ensino disponíveis em São Futuro.</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou bairro..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
            {['Todos', ...Object.values(SchoolType)].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filterType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSchools.map((school) => (
            <div key={school.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition duration-300">
              <div className="relative h-48">
                <img src={school.image} alt={school.name} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-bold text-slate-800">{school.rating}</span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {school.types.map(t => (
                    <span key={t} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-blue-50 text-blue-700 rounded-sm">
                      {t}
                    </span>
                  ))}
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{school.name}</h3>
                
                <div className="flex items-start gap-2 text-slate-600 mb-4">
                  <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                  <span className="text-sm">{school.address}</span>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="h-4 w-4" />
                    <span className="text-sm"><span className="font-semibold text-slate-900">{school.availableSlots}</span> vagas</span>
                  </div>
                  <button className="text-blue-600 text-sm font-semibold hover:text-blue-800">
                    Ver detalhes
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredSchools.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-500 text-lg">Nenhuma escola encontrada com os filtros selecionados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};