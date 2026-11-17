import { MAX_PRODUCT_IMAGE_URL, MAX_STORE_LOGO_URL } from './validation';

/**
 * Reads an uploaded image file and compresses/resizes it on the client side
 * so it fits comfortably within Firestore document size limits (< 400KB string)
 * while rendering crisply on mobile, tablet, and desktop.
 */
export const compressProductImage = (
  file: File,
  maxDimension = 560,
  quality = 0.76
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selecione um arquivo de imagem válido (JPG, PNG ou WebP).'));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Não foi possível ler a imagem selecionada.'));
    };

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        reject(new Error('Imagem vazia ou inválida.'));
        return;
      }

      const img = new Image();
      img.onerror = () => {
        reject(new Error('Formato de imagem não suportado.'));
      };

      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl.slice(0, MAX_PRODUCT_IMAGE_URL));
          return;
        }

        ctx.fillStyle = '#FBF8F3';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        let compressed = canvas.toDataURL('image/jpeg', quality);
        let currentQuality = quality;
        while (compressed.length > MAX_PRODUCT_IMAGE_URL && currentQuality > 0.35) {
          currentQuality -= 0.12;
          compressed = canvas.toDataURL('image/jpeg', currentQuality);
        }

        if (compressed.length > MAX_PRODUCT_IMAGE_URL) {
          reject(new Error('A imagem é muito grande. Escolha uma foto mais leve.'));
          return;
        }

        resolve(compressed);
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Compresses a store brand logo / avatar image (max 360px) to fit cleanly
 * inside the Store document while keeping crisp quality (and transparency for PNG/WebP when compact).
 */
export const compressStoreLogo = (
  file: File,
  maxDimension = 360
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selecione uma imagem válida para a logo (JPG, PNG ou WebP).'));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Não foi possível ler o arquivo da logo.'));
    };

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        reject(new Error('Imagem vazia ou inválida.'));
        return;
      }

      const img = new Image();
      img.onerror = () => {
        reject(new Error('Formato de imagem não suportado.'));
      };

      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível processar a imagem.'));
          return;
        }

        const prefersTransparency =
          file.type === 'image/png' || file.type === 'image/webp';

        if (prefersTransparency) {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const pngResult = canvas.toDataURL('image/png');
          if (pngResult.length <= MAX_STORE_LOGO_URL) {
            resolve(pngResult);
            return;
          }
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.85;
        let compressed = canvas.toDataURL('image/jpeg', quality);
        while (compressed.length > MAX_STORE_LOGO_URL && quality > 0.35) {
          quality -= 0.12;
          compressed = canvas.toDataURL('image/jpeg', quality);
        }

        if (compressed.length > MAX_STORE_LOGO_URL) {
          reject(new Error('A logo é muito pesada. Escolha uma imagem menor.'));
          return;
        }

        resolve(compressed);
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
};
