/**
 * Handles image upload and processing
 */

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (updated to match ImageUploader)
export const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export interface ImageProcessingResult {
  success: boolean;
  dataUrl?: string;
  error?: string;
}

export interface ImageUploadResult {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  wasCompressed: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface BrowserSupport {
  supported: boolean;
  missing: string[];
}

/**
 * Validates an image file
 */
export const validateImageFile = (file: File): ValidationResult => {
  if (!file) {
    return { isValid: false, error: 'No se ha seleccionado ningún archivo' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Tipo de archivo no permitido. Usa JPG, PNG, WebP o GIF' 
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: 'El archivo es demasiado grande. Máximo 10MB' 
    };
  }

  return { isValid: true };
};

/**
 * Checks browser support for image processing features
 */
export const checkBrowserSupport = (): BrowserSupport => {
  const missing: string[] = [];

  if (typeof FileReader === 'undefined') {
    missing.push('FileReader');
  }

  if (typeof HTMLCanvasElement === 'undefined') {
    missing.push('Canvas');
  }

  if (typeof URL === 'undefined' || typeof URL.createObjectURL === 'undefined') {
    missing.push('URL.createObjectURL');
  }

  return {
    supported: missing.length === 0,
    missing
  };
};

/**
 * Creates a data URL from a file
 */
export const createDataURLFromFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        reject(new Error(validation.error));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const dataUrl = e.target?.result as string;
          if (dataUrl && dataUrl.startsWith('data:image/')) {
            resolve(dataUrl);
          } else {
            reject(new Error('Formato de imagen inválido'));
          }
        } catch (error) {
          reject(new Error('Error al procesar la imagen'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };

      reader.readAsDataURL(file);
    } catch (error) {
      reject(new Error('Error inesperado al procesar la imagen'));
    }
  });
};

/**
 * Resizes a profile photo to optimal dimensions
 */
export const resizeProfilePhoto = async (file: File): Promise<ImageUploadResult> => {
  const originalSize = file.size;
  
  try {
    const dataUrl = await createDataURLFromFile(file);
    const resizedDataUrl = await resizeImage(dataUrl, 200, 200, 0.85);
    
    if (!resizedDataUrl.success || !resizedDataUrl.dataUrl) {
      throw new Error(resizedDataUrl.error || 'Error al redimensionar');
    }

    // Calculate compressed size (approximate)
    const compressedSize = Math.round(resizedDataUrl.dataUrl.length * 0.75);
    
    return {
      dataUrl: resizedDataUrl.dataUrl,
      originalSize,
      compressedSize,
      wasCompressed: compressedSize < originalSize
    };
  } catch (error) {
    // Fallback to original if resize fails
    const dataUrl = await createDataURLFromFile(file);
    return {
      dataUrl,
      originalSize,
      compressedSize: originalSize,
      wasCompressed: false
    };
  }
};

/**
 * Resizes a team logo to optimal dimensions
 */
export const resizeTeamLogo = async (file: File): Promise<ImageUploadResult> => {
  const originalSize = file.size;
  
  try {
    const dataUrl = await createDataURLFromFile(file);
    const resizedDataUrl = await resizeImage(dataUrl, 150, 150, 0.85);
    
    if (!resizedDataUrl.success || !resizedDataUrl.dataUrl) {
      throw new Error(resizedDataUrl.error || 'Error al redimensionar');
    }

    // Calculate compressed size (approximate)
    const compressedSize = Math.round(resizedDataUrl.dataUrl.length * 0.75);
    
    return {
      dataUrl: resizedDataUrl.dataUrl,
      originalSize,
      compressedSize,
      wasCompressed: compressedSize < originalSize
    };
  } catch (error) {
    // Fallback to original if resize fails
    const dataUrl = await createDataURLFromFile(file);
    return {
      dataUrl,
      originalSize,
      compressedSize: originalSize,
      wasCompressed: false
    };
  }
};

/**
 * Cleans up object URLs to prevent memory leaks
 */
export const cleanupObjectURL = (url: string): void => {
  try {
    if (url && (url.startsWith('blob:') || url.startsWith('data:'))) {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
      // Data URLs don't need cleanup, but we handle them for consistency
    }
  } catch (error) {
    console.warn('Failed to cleanup URL:', error);
  }
};

/**
 * Processes an image file and returns a data URL
 */
export const processImageFile = (file: File): Promise<ImageProcessingResult> => {
  return new Promise((resolve) => {
    try {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        resolve({ success: false, error: validation.error });
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const dataUrl = e.target?.result as string;
          if (dataUrl) {
            // Validate that the result is a proper data URL
            if (dataUrl.startsWith('data:image/')) {
              resolve({ success: true, dataUrl });
            } else {
              resolve({ success: false, error: 'Formato de imagen inválido' });
            }
          } else {
            resolve({ success: false, error: 'No se pudo leer el archivo' });
          }
        } catch (error) {
          console.error('Error processing image:', error);
          resolve({ success: false, error: 'Error al procesar la imagen' });
        }
      };

      reader.onerror = () => {
        resolve({ success: false, error: 'Error al leer el archivo' });
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error in processImageFile:', error);
      resolve({ success: false, error: 'Error inesperado al procesar la imagen' });
    }
  });
};

/**
 * Resizes an image to a maximum dimension while maintaining aspect ratio
 */
export const resizeImage = (
  dataUrl: string, 
  maxWidth: number = 300, 
  maxHeight: number = 300,
  quality: number = 0.8
): Promise<ImageProcessingResult> => {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve({ success: false, error: 'No se pudo crear el canvas' });
            return;
          }

          // Calculate new dimensions
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          const resizedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve({ success: true, dataUrl: resizedDataUrl });
        } catch (error) {
          console.error('Error resizing image:', error);
          resolve({ success: false, error: 'Error al redimensionar la imagen' });
        }
      };

      img.onerror = () => {
        resolve({ success: false, error: 'Error al cargar la imagen' });
      };

      img.src = dataUrl;
    } catch (error) {
      console.error('Error in resizeImage:', error);
      resolve({ success: false, error: 'Error inesperado al redimensionar' });
    }
  });
};

/**
 * Creates a placeholder image data URL
 */
export const createPlaceholderImage = (
  width: number = 150, 
  height: number = 150, 
  backgroundColor: string = '#f3f4f6',
  textColor: string = '#9ca3af',
  text: string = '?'
): string => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return getFallbackImageDataUrl();
    }

    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Text
    ctx.fillStyle = textColor;
    ctx.font = `${Math.floor(height / 3)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error creating placeholder:', error);
    return getFallbackImageDataUrl();
  }
};

/**
 * Gets a fallback image as data URL
 */
export const getFallbackImageDataUrl = (): string => {
  // Simple 1x1 transparent pixel
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
};

/**
 * Checks if a data URL is valid
 */
export const isValidImageDataUrl = (dataUrl: string): boolean => {
  try {
    return typeof dataUrl === 'string' && 
           dataUrl.startsWith('data:image/') && 
           dataUrl.includes('base64,') &&
           dataUrl.length > 50; // Minimum reasonable length
  } catch {
    return false;
  }
};

/**
 * Gets a safe image source (handles potential errors)
 */
export const getSafeImageSrc = (src: string | undefined | null, fallback?: string): string => {
  if (!src) {
    return fallback || getFallbackImageDataUrl();
  }

  // Check if it's a valid data URL
  if (src.startsWith('data:')) {
    return isValidImageDataUrl(src) ? src : (fallback || getFallbackImageDataUrl());
  }

  // For regular URLs, return as-is (let ImageWithFallback handle errors)
  return src;
};

/**
 * Preloads an image to check if it's valid
 */
export const preloadImage = (src: string): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    } catch {
      resolve(false);
    }
  });
};

/**
 * Generates avatar initials from a name
 */
export const getInitials = (name: string): string => {
  if (!name || typeof name !== 'string') {
    return '?';
  }

  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return words
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
};

/**
 * Generates a colored avatar placeholder
 */
export const generateAvatarPlaceholder = (name: string, size: number = 150): string => {
  const initials = getInitials(name);
  
  // Generate a color based on the name
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const color = colors[Math.abs(hash) % colors.length];
  
  return createPlaceholderImage(size, size, color, '#ffffff', initials);
};