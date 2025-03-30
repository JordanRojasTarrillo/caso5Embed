// Script para probar la clave API
const testApiKey = async () => {
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=1&key=${YOUTUBE_API_KEY}`);
        const data = await response.json();
        
        if (data.error) {
            console.error("Error de API:", data.error);
            return false;
        }
        
        if (data.items && data.items.length > 0) {
            console.log("API funcionando correctamente. Video encontrado:", data.items[0].snippet.title);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error("Error al probar la API:", error);
        return false;
    }
};

// Ejecutar la prueba cuando se cargue la página
document.addEventListener('DOMContentLoaded', async () => {
    const apiWorking = await testApiKey();
    console.log("¿API funcionando?", apiWorking);
});