
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MicIcon, MapPinIcon, ActivityIcon } from 'lucide-react';
import { EcoLogo } from '@/components/EcoLogo';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 bg-gradient-to-b from-green-50 to-blue-50">
      <div className="w-full max-w-md flex flex-col items-center mt-12">
        <EcoLogo className="w-24 h-24 mb-6" />
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">EcoLocate</h1>
        <p className="text-center text-gray-600 mb-12">
          Monitor and report environmental issues in your community
        </p>

        <div className="grid gap-8 w-full">
          <Button 
            onClick={() => navigate('/scan')} 
            className="h-20 text-xl font-semibold rounded-xl bg-eco-green hover:bg-green-600 shadow-lg transition-all hover:shadow-xl"
          >
            <MicIcon className="mr-2 h-6 w-6" /> Scan Environment
          </Button>
          
          <Button 
            onClick={() => navigate('/map')} 
            variant="outline"
            className="h-16 text-lg font-medium rounded-xl border-2 border-eco-blue text-eco-blue hover:bg-blue-50"
          >
            <MapPinIcon className="mr-2 h-5 w-5" /> View Reports Map
          </Button>
        </div>
      </div>

      <div className="w-full max-w-md mt-12 mb-6 px-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md">
          <h3 className="flex items-center text-gray-800 font-medium mb-3">
            <ActivityIcon className="mr-2 h-5 w-5 text-eco-yellow" /> Recent Activity
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">• High noise levels reported near Downtown</p>
            <p className="text-sm text-gray-600">• 3 new garbage reports in Riverside Park</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
