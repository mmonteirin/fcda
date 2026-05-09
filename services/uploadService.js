const IMGBB_API_KEY = "16bf8901689afb7a9a2b390275817e88";

export const uploadImagem = async (uri, _userId, onProgress) => {
	try {
		if (!uri) {
			throw new Error("Imagem não selecionada");
		}

		if (onProgress) onProgress(0.1);

		// 🔥 pega blob da imagem
		const response = await fetch(uri);

		const blob = await response.blob();

		if (onProgress) onProgress(0.4);

		// 🔥 converte blob -> base64
		const base64 = await new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onloadend = () => {
				const dataUrl = reader.result;

				// remove "data:image/png;base64,"
				const base64String = dataUrl.split(",")[1];

				resolve(base64String);
			};

			reader.onerror = reject;

			reader.readAsDataURL(blob);
		});

		if (onProgress) onProgress(0.6);

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

		// 🔥 URL pública REAL
		return data.data.url;

	} catch (error) {
		console.log("Erro upload:", error);
		throw error;
	}
};