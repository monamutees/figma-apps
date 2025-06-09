import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Upload, X, RotateCcw, AlertTriangle, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import { ImageUploadResult } from '../types';
import { 
  validateImageFile, 
  resizeProfilePhoto, 
  resizeTeamLogo,
  cleanupObjectURL,
  checkBrowserSupport,
  createDataURLFromFile
} from '../utils/imageUtils';
import { toast } from 'sonner@2.0.3';

interface ImageUploaderProps {
  currentImageUrl?: string;
  onImageChange: (imageUrl: string | undefined) => void;
  type: 'profile' | 'team';
  label?: string;
  showPreview?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImageUrl,
  onImageChange,
  type,
  label,
  showPreview = true,
  size = 'md'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl);
  const [error, setError] = useState<string | undefined>();
  const [browserSupported, setBrowserSupported] = useState(true);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'optimized' | 'fallback'>('idle');
  const [imageLoadError, setImageLoadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  useEffect(() => {
    // Check browser support on mount
    const support = checkBrowserSupport();
    if (!support.supported) {
      setBrowserSupported(false);
      setError(`Navegador no compatible: ${support.missing.join(', ')}`);
    }
  }, []);

  useEffect(() => {
    // Update preview when currentImageUrl changes
    setPreviewUrl(currentImageUrl);
    setProcessingStatus('idle');
    setImageLoadError(false);
  }, [currentImageUrl]);

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn('Image failed to load:', event);
    setImageLoadError(true);
    
    // If the current image failed to load, try to clean it up
    if (previewUrl && previewUrl.startsWith('blob:')) {
      cleanupObjectURL(previewUrl);
    }
  };

  const handleImageLoad = () => {
    setImageLoadError(false);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clear previous state
    setError(undefined);
    setIsUploading(true);
    setProcessingStatus('processing');
    setImageLoadError(false);

    try {
      // Check browser support
      if (!browserSupported) {
        throw new Error('Tu navegador no soporta la carga de imágenes');
      }

      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setError(validation.error);
        setProcessingStatus('idle');
        return;
      }

      // Step 1: Try to get a basic URL from the file
      let basicUrl: string;
      try {
        basicUrl = await createDataURLFromFile(file);
        console.log('Successfully created basic URL for file');
      } catch (basicError) {
        console.error('Failed to create basic URL:', basicError);
        throw new Error('No se pudo leer el archivo seleccionado');
      }

      // Step 2: Try to optimize the image
      let finalUrl = basicUrl;
      let wasOptimized = false;

      try {
        let result: ImageUploadResult;
        if (type === 'profile') {
          result = await resizeProfilePhoto(file);
        } else {
          result = await resizeTeamLogo(file);
        }

        // If optimization was successful, use the optimized version
        finalUrl = result.dataUrl;
        wasOptimized = true;
        setProcessingStatus('optimized');
        console.log('Successfully optimized image');
      } catch (resizeError) {
        console.warn('Failed to optimize image, using original:', resizeError);
        setProcessingStatus('fallback');
        // Keep using basicUrl
      }

      // Clean up previous URL if it exists
      if (previewUrl && previewUrl.startsWith('blob:')) {
        cleanupObjectURL(previewUrl);
      }

      // Update with final image
      setPreviewUrl(finalUrl);
      onImageChange(finalUrl);
      
      if (wasOptimized) {
        toast.success('Imagen cargada y optimizada');
      } else {
        toast.success('Imagen cargada correctamente');
      }

    } catch (error) {
      console.error('Error al procesar imagen:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al procesar imagen';
      setError(errorMessage);
      setProcessingStatus('idle');
      toast.error('Error al cargar la imagen');
    } finally {
      setIsUploading(false);
      // Clear input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      cleanupObjectURL(previewUrl);
    }
    setPreviewUrl(undefined);
    onImageChange(undefined);
    setError(undefined);
    setProcessingStatus('idle');
    setImageLoadError(false);
    toast.success('Imagen eliminada');
  };

  const triggerFileInput = () => {
    if (!browserSupported) {
      toast.error('Tu navegador no soporta la carga de imágenes');
      return;
    }
    fileInputRef.current?.click();
  };

  const renderPreview = () => {
    if (!showPreview) return null;

    if (previewUrl && !imageLoadError) {
      return (
        <div className="relative inline-block">
          <Avatar className={sizeClasses[size]}>
            <AvatarImage 
              src={previewUrl} 
              className="object-cover" 
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
            <AvatarFallback>
              <Camera className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          
          {/* Status indicator */}
          {processingStatus === 'optimized' && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          )}
          
          <Button
            onClick={handleRemoveImage}
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
            disabled={isUploading}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      );
    }

    // Show error state or empty state
    return (
      <div 
        className={`${sizeClasses[size]} border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-gray-50 cursor-pointer hover:border-gray-400 transition-colors ${!browserSupported ? 'opacity-50 cursor-not-allowed' : ''} ${imageLoadError ? 'border-red-300 bg-red-50' : ''}`}
        onClick={triggerFileInput}
      >
        {imageLoadError ? (
          <AlertCircle className="w-4 h-4 text-red-400" />
        ) : (
          <Camera className="w-4 h-4 text-gray-400" />
        )}
      </div>
    );
  };

  const getStatusMessage = () => {
    switch (processingStatus) {
      case 'processing':
        return 'Procesando imagen...';
      case 'optimized':
        return 'Imagen optimizada correctamente';
      case 'fallback':
        return 'Imagen cargada (sin optimización)';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-3">
      {label && <Label className="text-sm">{label}</Label>}
      
      {/* Browser support warning */}
      {!browserSupported && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Tu navegador no soporta todas las funciones necesarias para cargar imágenes.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Preview de la imagen */}
      <div className="flex items-center gap-4">
        {renderPreview()}
        
        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={!browserSupported}
          />
          
          <div className="flex gap-2">
            <Button
              onClick={triggerFileInput}
              variant="outline"
              size="sm"
              disabled={isUploading || !browserSupported}
            >
              <Upload className="w-4 h-4 mr-1" />
              {previewUrl ? 'Cambiar' : 'Subir'} imagen
            </Button>
            
            {(previewUrl || imageLoadError) && (
              <Button
                onClick={handleRemoveImage}
                variant="outline"
                size="sm"
                disabled={isUploading}
              >
                <X className="w-4 h-4 mr-1" />
                Quitar
              </Button>
            )}
          </div>
          
          <div className="text-xs text-gray-500">
            {type === 'profile' ? 'Foto de perfil (recomendado: 200x200px)' : 'Logo del equipo (recomendado: 150x150px)'}
            <br />
            Formatos: JPG, PNG, WebP, GIF • Máx. 10MB
          </div>
        </div>
      </div>

      {/* Indicador de carga */}
      {isUploading && (
        <Alert>
          <RotateCcw className="h-4 w-4 animate-spin" />
          <AlertDescription>
            {getStatusMessage()}
          </AlertDescription>
        </Alert>
      )}

      {/* Status success message */}
      {!isUploading && processingStatus !== 'idle' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {getStatusMessage()}
          </AlertDescription>
        </Alert>
      )}

      {/* Image load error */}
      {imageLoadError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            La imagen no se pudo mostrar correctamente. Intenta subir otra imagen.
          </AlertDescription>
        </Alert>
      )}

      {/* Errores */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};