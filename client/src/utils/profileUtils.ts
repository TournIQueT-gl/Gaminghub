export function calculateProfileCompleteness(user: any): number {
  if (!user) return 0;

  const checks = [
    { field: 'profileImageUrl', weight: 15 },
    { field: 'username', weight: 20 },
    { field: 'bio', weight: 15, condition: (val: string) => val && val.length > 10 },
    { field: 'location', weight: 10 },
    { field: 'website', weight: 10 },
    { field: 'favoriteGames', weight: 15, condition: (val: string[]) => val && val.length >= 3 },
    { field: 'socialLinks', weight: 15, condition: (val: any[]) => val && val.length > 0 },
  ];

  let totalWeight = 0;
  let earnedWeight = 0;

  checks.forEach(check => {
    totalWeight += check.weight;
    const value = user[check.field];
    
    if (check.condition) {
      if (check.condition(value)) {
        earnedWeight += check.weight;
      }
    } else if (value) {
      earnedWeight += check.weight;
    }
  });

  return Math.round((earnedWeight / totalWeight) * 100);
}

export function getProfileLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function getXPForLevel(level: number): number {
  return (level - 1) * 100;
}

export function getNextLevelXP(level: number): number {
  return level * 100;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function generateProfileSlug(username: string, id: string): string {
  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${cleanUsername}-${id.slice(-6)}`;
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please select a valid image file (JPEG, PNG, or WebP)' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 2MB' };
  }

  return { valid: true };
}

export function compressImage(file: File, maxWidth = 400, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxWidth) {
          width = (width * maxWidth) / height;
          height = maxWidth;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}