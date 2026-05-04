import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const storage = getStorage();

/* UPLOAD COM PROGRESSO + PADRÃO PROFISSIONAL */
export const uploadImagem = async (uri, userId, onProgress) => {
  try {
    // converter imagem
    const response = await fetch(uri);
    const blob = await response.blob();

    // nome organizado + extensão
    const filename = `posts/${userId}/${Date.now()}.jpg`;

    const storageRef = ref(storage, filename);

    // upload com progresso
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return await new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            snapshot.bytesTransferred / snapshot.totalBytes;

          // callback de progresso (opcional)
          if (onProgress) onProgress(progress);
        },
        (error) => {
          console.log("Erro upload:", error);
          reject(error);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });
  } catch (error) {
    console.log("Erro geral upload:", error);
    throw error;
  }
};
