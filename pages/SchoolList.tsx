
import React, { useState } from 'react';
import { MOCK_SCHOOLS } from '../constants';
import { MapPin, Star, Users, Search, Map as MapIcon, List } from 'lucide-react';
import { SchoolType } from '../types';

export const SchoolList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('Todos');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const filteredSchools = MOCK_SCHOOLS.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          school.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'Todos' || school.types.includes(filterType as SchoolType);
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Escolas da Rede Municipal</h1>
            <p className="text-slate-600">Explore as {filteredSchools.length} unidades de ensino disponíveis em São Futuro.</p>
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

        {/* Filters */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between sticky top-20 z-30">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou bairro..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
            {filteredSchools.map((school) => (
              <div key={school.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-300 group flex flex-col h-full">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={school.image} 
                    alt={school.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60"></div>
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-slate-800">{school.rating}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg font-bold text-white leading-tight shadow-black drop-shadow-md">{school.name}</h3>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {school.types.map(t => (
                      <span key={t} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                        {t}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-start gap-2.5 text-slate-600 mb-6 flex-1">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-slate-400" />
                    <span className="text-sm leading-snug">{school.address}</span>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-slate-600" title="Vagas disponíveis">
                      <div className={`h-2.5 w-2.5 rounded-full ${school.availableSlots > 10 ? 'bg-green-500' : 'bg-red-500'} ring-4 ${school.availableSlots > 10 ? 'ring-green-100' : 'ring-red-100'}`}></div>
                      <span className="text-sm font-medium text-slate-700">{school.availableSlots} vagas</span>
                    </div>
                    <button className="text-blue-600 text-sm font-bold hover:text-blue-800 transition-colors flex items-center gap-1">
                      Ver detalhes
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredSchools.length === 0 && viewMode === 'list' && (
          <div className="col-span-full text-center py-16">
            <div className="inline-flex bg-slate-100 p-4 rounded-full mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Nenhuma escola encontrada</h3>
            <p className="text-slate-500 mt-1">Tente ajustar seus filtros de busca.</p>
          </div>
        )}
      </div>
    </div>
  );
};
