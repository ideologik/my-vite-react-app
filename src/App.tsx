import { useEffect, useState } from "react";

function App() {
  const [audioBlob, setAudioBlob] = useState<Blob>();

  useEffect(() => {
    const getLogin = async () => {
      const login = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/auth/login`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await login.json();
      console.log("login", data.token);
    };
    getLogin();
  }, []);

  const handleTextToSpeech = () => {
    const requestData = {
      text: "hola ramon",
      voice_settings: {
        stability: 0.1,
        similarity_boost: 0.2,
        style: 0.1,
        use_speaker_boost: true,
      },
      idVoice: "21m00Tcm4TlvDq8ikWAM",
    };

    fetch(
      `${import.meta.env.VITE_API_URL}/api/v1/elevenlabs/generateAudioPreview`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",

        body: JSON.stringify(requestData),
      }
    )
      .then(async (response) => {
        // Clonar la respuesta para poder consumirla mÃºltiples veces
        const clonedResponse = response.clone();

        // Obtener el blob
        const blob = await clonedResponse.blob();
        // Guardar el blob en el estado
        setAudioBlob(blob);
      })
      .catch((error) => console.error("Error en la solicitud:", error));
  };
  console.log(audioBlob);
  const uploadS3 = () => {
    if (!audioBlob) {
      return;
    }
    const formData = new FormData();
    formData.append("audio", audioBlob, "audioBlob.mp3");
    formData.append("client", "pruebasApi2024");
    formData.append("simName", "prueba");
    formData.append("nameFile", "buenas");
    console.log(formData);
    fetch(
      `${
        import.meta.env.VITE_API_URL
      }/api/v1/elevenlabs/generateAudioAndUpload`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json(); // Asegúrate de que el servidor realmente envía una respuesta en formato JSON.
      })
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error en la solicitud:", error);
      });
  };

  return (
    <div>
      <button onClick={handleTextToSpeech}>Convertir texto a voz</button>
      {audioBlob && <audio controls src={URL.createObjectURL(audioBlob)} />}
      <button onClick={uploadS3}>subit al s3 </button>
    </div>
  );
}

export default App;
