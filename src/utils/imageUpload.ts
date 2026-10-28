/**
 * Reads an uploaded image file and compresses/resizes it on the client side
 * so it can be reliably stored in state/localStorage and rendered crisply.
 */
export const compressProductImage = (
  file: File,
  maxDimension = 640,
  quality = 0.8
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
          resolve(dataUrl);
          return;
        }

        // Fill warm cream background for transparent PNGs
        ctx.fillStyle = '#FBF8F3';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
};
