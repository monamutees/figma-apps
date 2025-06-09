import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ChildProfile, NavigationSection } from '../types';

interface DebugInfoProps {
  selectedProfile: ChildProfile | null;
  activeSection: NavigationSection;
  profiles: ChildProfile[];
}

export const DebugInfo: React.FC<DebugInfoProps> = ({ 
  selectedProfile, 
  activeSection, 
  profiles 
}) => {
  // Solo mostrar en development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Card className="m-4 border-yellow-500 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-sm text-yellow-800">Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div><strong>Active Section:</strong> {activeSection}</div>
        <div><strong>Selected Profile:</strong> {selectedProfile ? selectedProfile.name : 'None'}</div>
        <div><strong>Profile ID:</strong> {selectedProfile?.id || 'None'}</div>
        <div><strong>Total Profiles:</strong> {profiles.length}</div>
        <div><strong>Window Hash:</strong> {window.location.hash}</div>
        <div><strong>Profiles:</strong> {profiles.map(p => p.name).join(', ')}</div>
      </CardContent>
    </Card>
  );
};