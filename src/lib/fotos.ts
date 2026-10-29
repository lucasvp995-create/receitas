const LADO_MAXIMO = 1600;

// Fotos de celular têm vários MB: reduzimos no aparelho antes de enviar.
// Com "quadrada", corta o centro (para avatares).
export async function reduzirFoto(arquivo: File, lado = LADO_MAXIMO, quadrada = false): Promise<Blob> {
  const bitmap = await createImageBitmap(arquivo);
  const recorte = quadrada ? Math.min(bitmap.width, bitmap.height) : null;
  const largura = recorte ?? bitmap.width;
  const altura = recorte ?? bitmap.height;
  const escala = Math.min(1, lado / Math.max(largura, altura));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(largura * escala);
  canvas.height = Math.round(altura * escala);
  canvas
    .getContext("2d")!
    .drawImage(bitmap, (bitmap.width - largura) / 2, (bitmap.height - altura) / 2, largura, altura, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("foto"))), "image/jpeg", 0.85),
  );
}

export async function emBase64(blob: Blob): Promise<string> {
  const url = await new Promise<string>((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(String(leitor.result));
    leitor.onerror = reject;
    leitor.readAsDataURL(blob);
  });
  return url.slice(url.indexOf(",") + 1);
}
