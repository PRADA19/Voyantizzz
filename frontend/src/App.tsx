import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DemoBanner } from './components/DemoBanner';
import { StepProgressModal, PIPELINE_STEPS } from './components/StepProgressModal';

import { DashboardPage } from './pages/DashboardPage';
import { CargoRequestPage } from './pages/CargoRequestPage';
import { FreightForecastPage } from './pages/FreightForecastPage';
import { VesselsPage } from './pages/VesselsPage';
import { PortsMapPage } from './pages/PortsMapPage';
import { CostPage } from './pages/CostPage';
import { RiskAlertsPage } from './pages/RiskAlertsPage';
import { ContractsPage } from './pages/ContractsPage';
import { WhatIfPage } from './pages/WhatIfPage';
import { RecommendationPage } from './pages/RecommendationPage';
import { DataCenterPage } from './pages/DataCenterPage';
import { ModelPerformancePage } from './pages/ModelPerformancePage';

import type { CargoRequest, FinalRecommendationOutput, AlertItem } from './types';
import { DEFAULT_DEMO_CARGO, runAnalysisPipeline, fetchAlerts, generateFallbackAnalysis } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [analysisData, setAnalysisData] = useState<FinalRecommendationOutput>(() => generateFallbackAnalysis(DEFAULT_DEMO_CARGO));
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [stepModalOpen, setStepModalOpen] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  useEffect(() => {
    fetchAlerts().then(setAlerts);
    runAnalysisPipeline(DEFAULT_DEMO_CARGO).then(setAnalysisData);
  }, []);

  const handleDismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const executePipelineWithProgress = async (cargoReq: CargoRequest) => {
    setIsAnalyzing(true);
    setStepModalOpen(true);
    setCurrentStepIndex(0);

    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      setCurrentStepIndex(i);
      await new Promise(res => setTimeout(res, 220));
    }

    try {
      const result = await runAnalysisPipeline(cargoReq);
      setAnalysisData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
      setStepModalOpen(false);
      setActiveTab('recommendation');
    }
  };

  const handleRunFullDemo = () => {
    executePipelineWithProgress(DEFAULT_DEMO_CARGO);
  };

  return (
    <div className="min-h-screen bg-[#f0f7fb] text-slate-800 flex flex-col font-sans">
      <Header
        onRunFullDemo={handleRunFullDemo}
        isAnalyzing={isAnalyzing}
        activeAlertCount={alerts.length}
      />

      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          <DemoBanner />

          {activeTab === 'dashboard' && <DashboardPage data={analysisData} onNavigate={setActiveTab} />}
          {activeTab === 'cargo' && <CargoRequestPage onAnalyze={executePipelineWithProgress} isAnalyzing={isAnalyzing} />}
          {activeTab === 'forecast' && <FreightForecastPage data={analysisData} />}
          {activeTab === 'vessels' && <VesselsPage data={analysisData} />}
          {activeTab === 'ports' && <PortsMapPage data={analysisData} />}
          {activeTab === 'cost' && <CostPage data={analysisData} />}
          {activeTab === 'risk' && <RiskAlertsPage data={analysisData} alerts={alerts} onDismissAlert={handleDismissAlert} />}
          {activeTab === 'contracts' && <ContractsPage data={analysisData} />}
          {activeTab === 'whatif' && <WhatIfPage data={analysisData} />}
          {activeTab === 'recommendation' && <RecommendationPage data={analysisData} />}
          {activeTab === 'datacenter' && <DataCenterPage />}
          {activeTab === 'modelperformance' && <ModelPerformancePage data={analysisData} />}
        </main>
      </div>

      <StepProgressModal isOpen={stepModalOpen} currentStep={currentStepIndex} />
    </div>
  );
};

export default App;
