import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ArrowLeft, Palette, Save, RotateCcw } from 'lucide-react';
import { ChildProfile, TeamSettings } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { ImageUploader } from './ImageUploader';
import { toast } from 'sonner@2.0.3';

interface TeamSettingsProps {
  profile: ChildProfile;
  onBackToMenu: () => void;
}

const DEFAULT_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
];

const DEFAULT_AVATARS = [
  '⚽', '🏀', '🏐', '🎾', '⚾', '🏈', '🏓', '🏸', '🥊', '🏆',
  '🔥', '⚡', '💫', '⭐', '💎', '🚀', '🎯', '🏅', '👑', '🦅'
];

export const TeamSettings: React.FC<TeamSettingsProps> = ({ profile, onBackToMenu }) => {
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState<TeamSettings>(() => 
    profile.teamSettings || {
      myTeam: { name: 'Mi Equipo', color: '#3B82F6' },
      rivalTeam: { name: 'Equipo Rival', color: '#EF4444' }
    }
  );
  const [editingTeam, setEditingTeam] = useState<'myTeam' | 'rivalTeam' | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handleSave = () => {
    const updatedProfile: ChildProfile = {
      ...profile,
      teamSettings: settings
    };

    const updatedChildren = user!.children.map(child => 
      child.id === profile.id ? updatedProfile : child
    );

    updateUser({ ...user!, children: updatedChildren });
    toast.success('Configuración guardada correctamente');
  };

  const handleTeamChange = (team: 'myTeam' | 'rivalTeam', field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [team]: {
        ...prev[team],
        [field]: value
      }
    }));
  };

  const handleImageChange = (team: 'myTeam' | 'rivalTeam', imageUrl: string | undefined) => {
    setSettings(prev => ({
      ...prev,
      [team]: {
        ...prev[team],
        imageUrl: imageUrl,
        // Si se añade una imagen, limpiar el avatar de texto
        avatar: imageUrl ? undefined : prev[team].avatar
      }
    }));
  };

  const handleAvatarSelect = (avatar: string) => {
    if (editingTeam) {
      setSettings(prev => ({
        ...prev,
        [editingTeam]: {
          ...prev[editingTeam],
          avatar: avatar,
          // Si se selecciona un avatar, limpiar la imagen personalizada
          imageUrl: undefined
        }
      }));
    }
    setShowAvatarPicker(false);
    setEditingTeam(null);
  };

  const handleColorSelect = (color: string) => {
    if (editingTeam) {
      setSettings(prev => ({
        ...prev,
        [editingTeam]: {
          ...prev[editingTeam],
          color: color
        }
      }));
    }
    setShowColorPicker(false);
    setEditingTeam(null);
  };

  const resetToDefaults = () => {
    setSettings({
      myTeam: { name: 'Mi Equipo', color: '#3B82F6' },
      rivalTeam: { name: 'Equipo Rival', color: '#EF4444' }
    });
    toast.success('Configuración restablecida');
  };

  const renderTeamCard = (team: 'myTeam' | 'rivalTeam', title: string) => {
    const teamData = settings[team];
    
    return (
      <Card key={team}>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nombre del equipo */}
          <div className="space-y-2">
            <Label>Nombre del equipo</Label>
            <Input
              value={teamData.name}
              onChange={(e) => handleTeamChange(team, 'name', e.target.value)}
              placeholder="Nombre del equipo"
            />
          </div>

          {/* Avatar/Logo */}
          <div className="space-y-2">
            <Label>Logo del equipo</Label>
            
            {/* Preview actual */}
            <div className="flex items-center gap-4 mb-3">
              <Avatar className="w-16 h-16 border-2" style={{ borderColor: teamData.color }}>
                {teamData.imageUrl ? (
                  <AvatarImage src={teamData.imageUrl} className="object-cover" />
                ) : teamData.avatar ? (
                  <AvatarFallback className="text-2xl text-white" style={{ backgroundColor: teamData.color }}>
                    {teamData.avatar}
                  </AvatarFallback>
                ) : (
                  <AvatarFallback className="text-white" style={{ backgroundColor: teamData.color }}>
                    {teamData.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="text-sm text-gray-600">
                {teamData.imageUrl ? 'Imagen personalizada' : 
                 teamData.avatar ? `Avatar: ${teamData.avatar}` : 
                 'Primera letra del nombre'}
              </div>
            </div>

            {/* Subida de imagen personalizada */}
            <ImageUploader
              currentImageUrl={teamData.imageUrl}
              onImageChange={(imageUrl) => handleImageChange(team, imageUrl)}
              type="team"
              label="Imagen personalizada"
              showPreview={false}
              size="sm"
            />

            {/* Selector de avatar */}
            <div className="pt-2">
              <Button
                onClick={() => {
                  setEditingTeam(team);
                  setShowAvatarPicker(true);
                }}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Elegir avatar predefinido
              </Button>
            </div>
          </div>

          {/* Color del equipo */}
          <div className="space-y-2">
            <Label>Color del equipo</Label>
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded border border-gray-300"
                style={{ backgroundColor: teamData.color }}
              />
              <Input
                type="color"
                value={teamData.color}
                onChange={(e) => handleTeamChange(team, 'color', e.target.value)}
                className="w-20 h-8 p-0 border-0"
              />
              <Button
                onClick={() => {
                  setEditingTeam(team);
                  setShowColorPicker(true);
                }}
                variant="outline"
                size="sm"
              >
                <Palette className="w-4 h-4 mr-1" />
                Colores
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button 
                onClick={onBackToMenu} 
                variant="ghost" 
                size="sm"
                className="p-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Menú
              </Button>
              <h1 className="text-xl font-medium">Configurar Equipos</h1>
              <div className="w-16" /> {/* Spacer */}
            </div>
            <div className="text-center mt-2">
              <p className="text-gray-600">{profile.name} - {profile.sport}</p>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de equipos */}
        <div className="grid gap-6">
          {renderTeamCard('myTeam', 'Mi Equipo')}
          {renderTeamCard('rivalTeam', 'Equipo Rival')}
        </div>

        {/* Botones de acción */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <Button onClick={handleSave} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Guardar configuración
            </Button>
            <Button onClick={resetToDefaults} variant="outline" className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Restablecer valores por defecto
            </Button>
          </CardContent>
        </Card>

        {/* Dialog selector de colores */}
        <Dialog open={showColorPicker} onOpenChange={setShowColorPicker}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Seleccionar color</DialogTitle>
              <DialogDescription>
                Elige un color para el equipo
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-5 gap-2 p-4">
              {DEFAULT_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className="w-12 h-12 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog selector de avatares */}
        <Dialog open={showAvatarPicker} onOpenChange={setShowAvatarPicker}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Seleccionar avatar</DialogTitle>
              <DialogDescription>
                Elige un emoji como avatar para el equipo
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-5 gap-2 p-4">
              {DEFAULT_AVATARS.map(avatar => (
                <button
                  key={avatar}
                  onClick={() => handleAvatarSelect(avatar)}
                  className="w-12 h-12 rounded border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center text-2xl"
                >
                  {avatar}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};