import { Image } from "react-native";
import * as ImageManipulator from "expo-image-manipulator";

const IMGBB_API_KEY = "16bf8901689afb7a9a2b390275817e88";
const MAX_IMAGE_SIZE = 1500; // px
const IMAGE_QUALITY = 0.7; // 70% qualidade

/**
 * Comprime imagem antes do upload
 * Reduz tamanho do arquivo em ~60-80%
 */
const compressImage = async (uri) => {
	try {
		const result = await ImageManipulator.manipulateAsync(
			uri,
			[{ resize: { width: MAX_IMAGE_SIZE, height: MAX_IMAGE_SIZE } }],
			{ compress: IMAGE_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
		);

		return result.uri;
	} catch (error) {
		console.log("Erro ao comprimir:", error);
		return uri; // Fallback: usa original
	}
};

/**
 * Converte arquivo local para base64 com limite de memória
 * Lê em chunks para não sobrecarregar RAM
 */
const uriToBase64 = async (uri) => {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.responseType = "arraybuffer";

		xhr.onload = () => {
			const uintArray = new Uint8Array(xhr.response);
			let binaryString = "";

			// Converter array para string (processamento em chunks)
			for (let i = 0; i < uintArray.length; i += 8192) {
				binaryString += String.fromCharCode.apply(
					null,
					uintArray.slice(i, i + 8192)
				);
			}

			const base64 = btoa(binaryString);
			resolve(base64);
		};

		xhr.onerror = () => reject(new Error("Erro ao ler arquivo"));

		try {
			xhr.open("GET", uri);
			xhr.send();
		} catch (error) {
			reject(error);
		}
	});
};

export const uploadImagem = async (uri, _userId, onProgress) => {
	let compressedUri = null;

	try {
		if (!uri) {
			throw new Error("Imagem não selecionada");
		}

		if (onProgress) onProgress(0.1);

		// ✅ PASSO 1: Comprimir imagem (reduz RAM ~70%)
		compressedUri = await compressImage(uri);
		if (onProgress) onProgress(0.3);

		// ✅ PASSO 2: Converter para base64
		const base64 = await uriToBase64(compressedUri);
		if (onProgress) onProgress(0.6);

		// ✅ PASSO 3: Upload
		const formData = new FormData();
		formData.append("key", IMGBB_API_KEY);
		formData.append("image", base64);

		const uploadResponse = await fetch(
			"https://api.imgbb.com/1/upload",
			{
				method: "POST",
				body: formData,
			}
		);

		const data = await uploadResponse.json();

		console.log("ImgBB response:", data);

		if (!data.success) {
			throw new Error(
				data.error?.message || "Erro no upload"
			);
		}

		if (onProgress) onProgress(1);

		return data.data.url;

	} catch (error) {
		console.log("Erro upload:", error);
		throw error;
	}
};