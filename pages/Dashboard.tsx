
import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { 
  Users, School, AlertTriangle, Bus, TrendingUp, PieChart, 
  BarChart2, Activity, CheckCircle, Clock, Baby, GraduationCap 
} from 'lucide-react';
import { SchoolType } from '../types';

// Simple Donut Chart Component
const SimpleDonutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8 justify-center">
      <div className="relative w-48 h-48 shrink-0">
        <svg viewBox="-1 -1 2 2" className="transform -rotate-90 w-full h-full">
          {data.map((slice, i) => {
            const startPercent = cumulativePercent;
            const slicePercent = slice.value / total;
            cumulativePercent += slicePercent;
            
            const [startX, startY] = getCoordinatesForPercent(startPercent);
            const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
            const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

            // Handle 100% case
            if (slicePercent === 1) {
              return <circle key={i} cx="0" cy="0" r="1" fill={slice.color} />;
            }

            const pathData = `
              M 0 0
              L ${startX} ${startY}
              A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}
              Z
            `;

            return <path key={i} d={pathData} fill={slice.color} stroke="white" strokeWidth="0.02" />;
          })}
          <circle cx="0" cy="0" r="0.6" fill="white" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-3xl font-bold text-slate-800">{total}</span>
          <span className="text-xs text-slate-500 uppercase font-semibold">Total</span>
        </div>
      </div>
      <div className="space-y-3 w-full sm:w-auto">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-6 w-full">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">{item.value}</span>
                <span className="text-xs text-slate-500">({((item.value / total) * 100).toFixed(1)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple Bar Chart Component using HTML/CSS
const SimpleBarChart: React.FC<{ data: { label: string; value: number }[]; colorClass: string }> = ({ data, colorClass }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-xs font-medium text-slate-600">
            <span>{item.label}</span>
            <span>{item.value}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className={`h-2.5 rounded-full ${colorClass}`} 
              style={{ width: `${(item.value / maxValue) * 100}%`, transition: 'width 1s ease-in-out' }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { students, schools } = useData();

  // --- Calculations ---

  const totalStudents = students.length;
  const totalSchools = schools.length;
  
  // Metric: Unallocated Students (Status Analysis)
  const statusStats = useMemo(() => {
    return {
      matriculado: students.filter(s => s.status === 'Matriculado').length,
      pendente: students.filter(s => s.status === 'Pendente').length,
      analise: students.filter(s => s.status === 'Em Análise').length,
    };
  }, [students]);

  // Metric: School Types
  const schoolTypeStats = useMemo(() => {
    const counts: Record<string, number> = {
      [SchoolType.INFANTIL]: 0,
      [SchoolType.FUNDAMENTAL_1]: 0,
      [SchoolType.FUNDAMENTAL_2]: 0,
      [SchoolType.EJA]: 0,
    };

    schools.forEach(s => {
      s.types.forEach(t => {
        if (counts[t] !== undefined) counts[t]++;
      });
    });

    return [
      { label: 'Infantil (Creche/Pré)', value: counts[SchoolType.INFANTIL] },
      { label: 'Fundamental I', value: counts[SchoolType.FUNDAMENTAL_1] },
      { label: 'Fundamental II', value: counts[SchoolType.FUNDAMENTAL_2] },
      { label: 'EJA', value: counts[SchoolType.EJA] },
    ].filter(i => i.value > 0);
  }, [schools]);

  // Metric: Special Needs
  const specialNeedsCount = useMemo(() => students.filter(s => s.specialNeeds).length, [students]);
  
  // Metric: Transport
  const transportCount = useMemo(() => students.filter(s => s.transportRequest).length, [students]);

  // Metric: Top Schools by Allocation
  const topSchools = useMemo(() => {
    const schoolCounts: Record<string, number> = {};
    students.forEach(s => {
      if (s.school && s.school !== 'Não alocada') {
        schoolCounts[s.school] = (schoolCounts[s.school] || 0) + 1;
      }
    });

    return Object.entries(schoolCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [students]);

  // Metric: Total Capacity Estimate (Sum of availableSlots from school list)
  const totalCapacity = useMemo(() => schools.reduce((acc, s) => acc + (s.availableSlots || 0), 0), [schools]);
  
  // Calculate Occupancy Rate (Global)
  // Note: Since real data might have students > slots if slots aren't updated, we handle > 100% logic purely visually.
  const occupancyRate = totalCapacity > 0 ? (totalStudents / totalCapacity) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard Gerencial</h1>
            <p className="text-slate-600 mt-1">Visão geral dos indicadores da rede municipal de ensino.</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-500 shadow-sm">
            <Clock className="h-4 w-4" />
            Atualizado em: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${occupancyRate > 90 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {occupancyRate.toFixed(1)}% Ocupação
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-800">{totalStudents}</h3>
            <p className="text-sm text-slate-500">Alunos Matriculados</p>
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(occupancyRate, 100)}%` }}></div>
            </div>
             <p className="text-xs text-slate-400 mt-1">Capacidade Total Estimada: {totalCapacity}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 rounded-xl">
                <School className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-800">{totalSchools}</h3>
            <p className="text-sm text-slate-500">Unidades Escolares</p>
            <p className="text-xs text-slate-400 mt-4 flex items-center gap-1">
               <Activity className="h-3 w-3" />
               Ativas no sistema
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-yellow-50 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              {statusStats.pendente > 0 && (
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 animate-pulse">
                    Ação Necessária
                </span>
              )}
            </div>
            <h3 className="text-3xl font-bold text-slate-800">{statusStats.pendente + statusStats.analise}</h3>
            <p className="text-sm text-slate-500">Pendências / Em Análise</p>
            <p className="text-xs text-slate-400 mt-4">
                Solicitações aguardando deferimento
            </p>
          </div>

           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <Bus className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-800">{transportCount}</h3>
            <p className="text-sm text-slate-500">Solicitações de Transporte</p>
             <p className="text-xs text-slate-400 mt-4">
                {((transportCount / totalStudents) * 100 || 0).toFixed(1)}% do total de alunos
            </p>
          </div>

        </div>

        {/* Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            
            {/* Status Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-blue-600" />
                        Situação das Matrículas
                    </h2>
                </div>
                
                <SimpleDonutChart 
                    data={[
                        { label: 'Matriculados', value: statusStats.matriculado, color: '#16a34a' }, // green-600
                        { label: 'Em Análise', value: statusStats.analise, color: '#3b82f6' }, // blue-500
                        { label: 'Pendentes', value: statusStats.pendente, color: '#eab308' }, // yellow-500
                    ].filter(d => d.value > 0)}
                />
            </div>

            {/* School Types Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-indigo-600" />
                        Modalidades
                    </h2>
                </div>
                <SimpleBarChart 
                    data={schoolTypeStats}
                    colorClass="bg-indigo-500"
                />
            </div>
        </div>

        {/* Detailed Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Top Schools */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Escolas com Maior Demanda
                </h2>
                <div className="space-y-4">
                    {topSchools.map((school, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                            <div className="flex items-center gap-3">
                                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${idx < 3 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {idx + 1}
                                </span>
                                <span className="font-medium text-slate-700 text-sm">{school.name}</span>
                            </div>
                            <span className="font-bold text-slate-900">{school.count} <span className="text-xs font-normal text-slate-500">alunos</span></span>
                        </div>
                    ))}
                    {topSchools.length === 0 && <p className="text-slate-500 text-sm">Nenhum dado de alocação disponível.</p>}
                </div>
            </div>

            {/* Inclusion Stats */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                    <Baby className="h-5 w-5 text-pink-500" />
                    Indicadores de Inclusão
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                    <div className="bg-pink-50 rounded-xl p-5 border border-pink-100 flex flex-col justify-center items-center text-center">
                        <div className="p-3 bg-white rounded-full mb-3 shadow-sm">
                            <Activity className="h-6 w-6 text-pink-500" />
                        </div>
                        <span className="text-4xl font-bold text-pink-700 mb-1">{specialNeedsCount}</span>
                        <span className="text-sm font-medium text-pink-900">Alunos com Deficiência (AEE)</span>
                        <span className="text-xs text-pink-600 mt-2">
                             {((specialNeedsCount / totalStudents) * 100 || 0).toFixed(1)}% da rede
                        </span>
                    </div>

                     <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100 flex flex-col justify-center items-center text-center">
                        <div className="p-3 bg-white rounded-full mb-3 shadow-sm">
                            <CheckCircle className="h-6 w-6 text-emerald-500" />
                        </div>
                        <span className="text-4xl font-bold text-emerald-700 mb-1">{statusStats.matriculado}</span>
                        <span className="text-sm font-medium text-emerald-900">Matrículas Efetivadas</span>
                        <span className="text-xs text-emerald-600 mt-2">
                            Processo concluído com sucesso
                        </span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
