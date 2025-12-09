import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Package, Repeat, FileText, Building2, Users, Ticket, BarChart3 } from 'lucide-react';
import PreOrdersManager from './PreOrdersManager';
import TradeInManager from './TradeInManager';
import QuotesManager from './QuotesManager';
import B2BManager from './B2BManager';
import AffiliatesManager from './AffiliatesManager';
import TicketsManager from './TicketsManager';
import AnalyticsDashboard from './AnalyticsDashboard';

interface AdvancedFeaturesAdminProps {
  accessToken?: string;
}

export default function AdvancedFeaturesAdmin({ accessToken }: AdvancedFeaturesAdminProps) {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Funcionalidades Avançadas</h2>
        <p className="text-sm sm:text-base text-gray-600">Gerencie todos os recursos avançados da KZSTORE</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-7 gap-1 sm:gap-2 bg-white p-1.5 sm:p-2 rounded-lg mb-4 sm:mb-6 border">
          <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden lg:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="pre-orders" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden lg:inline">Pré-vendas</span>
          </TabsTrigger>
          <TabsTrigger value="trade-in" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <Repeat className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden lg:inline">Trade-In</span>
          </TabsTrigger>
          <TabsTrigger value="quotes" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden lg:inline">Orçamentos</span>
          </TabsTrigger>
          <TabsTrigger value="b2b" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden lg:inline">B2B</span>
          </TabsTrigger>
          <TabsTrigger value="affiliates" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden lg:inline">Afiliados</span>
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <Ticket className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden lg:inline">Tickets</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="pre-orders">
          <PreOrdersManager accessToken={accessToken} />
        </TabsContent>

        <TabsContent value="trade-in">
          <TradeInManager accessToken={accessToken} />
        </TabsContent>

        <TabsContent value="quotes">
          <QuotesManager accessToken={accessToken} />
        </TabsContent>

        <TabsContent value="b2b">
          <B2BManager accessToken={accessToken} />
        </TabsContent>

        <TabsContent value="affiliates">
          <AffiliatesManager accessToken={accessToken} />
        </TabsContent>

        <TabsContent value="tickets">
          <TicketsManager accessToken={accessToken} />
        </TabsContent>
      </Tabs>
    </div>
  );
}