import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Plus, Edit2, Trash2, MoreVertical, ArrowLeft, User } from 'lucide-react';
import { ChildProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { SportSelector } from './SportIcon';
import { ImageUploader } from './ImageUploader';
import { getSportEmoji } from '../utils/sportIcons';
import { getCategoriesForSport, getDefaultCategory, getCategoryById } from '../utils/sportCategories';
import { toast } from 'sonner@2.0.3';

interface ProfileManagerProps {
  onBackToMain: () => void;
  onSelectProfile: (profile: ChildProfile) => void;
  editingProfile?: ChildProfile | null;
}

const AVAILABLE_SPORTS = [
  'Voleibol', 'Baloncesto', 'Fútbol', 'Tenis', 'Béisbol', 
  'Natación', 'Atletismo', 'Otro'
];

export const ProfileManager: React.FC<ProfileManagerProps> = ({ 
  onBackToMain, 
  onSelectProfile, 
  editingProfile 
}) => {
  const { user, updateUser } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [currentEditingProfile, setCurrentEditingProfile] = useState<ChildProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sport: 'Voleibol',
    category: '',
    photoUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profiles = user?.children || [];

  // Handle editing profile from MainApp
  useEffect(() => {
    if (editingProfile) {
      setCurrentEditingProfile(editingProfile);
      setShowCreateDialog(true);
    }
  }, [editingProfile]);

  useEffect(() => {
    if (currentEditingProfile) {
      const defaultCategory = currentEditingProfile.category || getDefaultCategory(currentEditingProfile.sport).id;
      setFormData({
        name: currentEditingProfile.name,
        sport: currentEditingProfile.sport,
        category: defaultCategory,
        photoUrl: currentEditingProfile.photoUrl || ''
      });
    }
  }, [currentEditingProfile]);

  const resetForm = () => {
    const defaultCategory = getDefaultCategory('Voleibol').id;
    setFormData({
      name: '',
      sport: 'Voleibol',
      category: defaultCategory,
      photoUrl: ''
    });
    setCurrentEditingProfile(null);
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent double submission
    
    if (!formData.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    if (!user) {
      toast.error('Error: usuario no encontrado');
      return;
    }

    setIsSubmitting(true);

    try {
      if (currentEditingProfile) {
        // Editar perfil existente
        const updatedProfile: ChildProfile = {
          ...currentEditingProfile,
          name: formData.name.trim(),
          sport: formData.sport,
          category: formData.category,
          photoUrl: formData.photoUrl || undefined
        };

        const updatedChildren = profiles.map(profile => 
          profile.id === currentEditingProfile.id ? updatedProfile : profile
        );

        const updatedUser = { ...user, children: updatedChildren };
        updateUser(updatedUser);
        toast.success('Perfil actualizado correctamente');
      } else {
        // Crear nuevo perfil
        const newProfile: ChildProfile = {
          id: Date.now().toString(),
          name: formData.name.trim(),
          sport: formData.sport,
          category: formData.category,
          photoUrl: formData.photoUrl || undefined,
          createdAt: new Date().toISOString()
        };

        const updatedUser = { ...user, children: [...profiles, newProfile] };
        updateUser(updatedUser);
        toast.success('Perfil creado correctamente');
      }

      resetForm();
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Error al guardar el perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (profileId: string) => {
    if (!user) return;
    
    const updatedChildren = profiles.filter(profile => profile.id !== profileId);
    const updatedUser = { ...user, children: updatedChildren };
    updateUser(updatedUser);
    toast.success('Perfil eliminado correctamente');
  };

  const handleEdit = (profile: ChildProfile) => {
    setCurrentEditingProfile(profile);
    setShowCreateDialog(true);
  };

  const handleImageChange = (imageUrl: string | undefined) => {
    setFormData(prev => ({ ...prev, photoUrl: imageUrl || '' }));
  };

  const handleSportChange = (sport: string) => {
    const defaultCategory = getDefaultCategory(sport).id;
    setFormData(prev => ({ 
      ...prev, 
      sport,
      category: defaultCategory
    }));
  };

  const availableCategories = getCategoriesForSport(formData.sport);

  const renderProfileCard = (profile: ChildProfile) => {
    const category = profile.category ? getCategoryById(profile.sport, profile.category) : null;
    
    return (
      <Card key={profile.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Foto de perfil o avatar por defecto */}
              <Avatar className="w-12 h-12">
                {profile.photoUrl ? (
                  <AvatarImage src={profile.photoUrl} className="object-cover" />
                ) : (
                  <AvatarFallback>
                    <User className="w-6 h-6" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h3 className="font-medium">{profile.name}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <span>{getSportEmoji(profile.sport)}</span>
                  <span>{profile.sport}</span>
                </div>
                {category && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    {category.name}
                  </Badge>
                )}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSelectProfile(profile)}>
                  Usar perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEdit(profile)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDelete(profile.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <Button 
            onClick={() => onSelectProfile(profile)} 
            className="w-full"
            size="sm"
          >
            Usar este perfil
          </Button>
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
              <div className="flex items-center gap-2">
                <Button 
                  onClick={onBackToMain} 
                  variant="ghost" 
                  size="sm"
                  className="p-0"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Inicio
                </Button>
              </div>
              <h1 className="text-xl font-medium">Perfiles</h1>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de perfiles */}
        <div className="space-y-4">
          {profiles.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No hay perfiles</h3>
                <p className="text-gray-600 mb-4">
                  Crea tu primer perfil para empezar a llevar el marcador de tus partidos.
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear primer perfil
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {profiles.map(renderProfileCard)}
            </div>
          )}
        </div>

        {/* Dialog para crear/editar perfil */}
        <Dialog open={showCreateDialog} onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) {
            resetForm();
          } else if (!currentEditingProfile) {
            // Reset form when opening for new profile
            const defaultCategory = getDefaultCategory('Voleibol').id;
            setFormData({
              name: '',
              sport: 'Voleibol',
              category: defaultCategory,
              photoUrl: ''
            });
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {currentEditingProfile ? 'Editar perfil' : 'Crear nuevo perfil'}
              </DialogTitle>
              <DialogDescription>
                {currentEditingProfile 
                  ? 'Modifica los datos del perfil'
                  : 'Completa los datos para crear un nuevo perfil'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Foto de perfil */}
              <div className="space-y-2">
                <Label>Foto de perfil (opcional)</Label>
                <ImageUploader
                  currentImageUrl={formData.photoUrl}
                  onImageChange={handleImageChange}
                  type="profile"
                  showPreview={true}
                  size="lg"
                />
              </div>

              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre del niño/a"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Deporte */}
              <div className="space-y-2">
                <Label>Deporte *</Label>
                <div className="p-3 border rounded-lg bg-gray-50/50">
                  <div className="text-sm text-gray-600 mb-3">
                    Seleccionado: <span className="font-medium text-blue-600">{formData.sport}</span>
                  </div>
                  <SportSelector
                    sports={AVAILABLE_SPORTS}
                    selectedSport={formData.sport}
                    onSportChange={handleSportChange}
                    showIcons={true}
                  />
                </div>
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex flex-col">
                          <span>{category.name}</span>
                          <span className="text-xs text-gray-500">{category.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Botones */}
              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={isSubmitting || !formData.name.trim()}
                >
                  {isSubmitting ? 'Guardando...' : (currentEditingProfile ? 'Actualizar perfil' : 'Crear perfil')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};