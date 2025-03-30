// Funcionalidad para la plantilla Single Video

async function loadSingleVideo(videoId) {
    try {
        const templatePreview = document.getElementById('template-preview');
        templatePreview.innerHTML = '<div class="loading">Cargando video...</div>';
        
        // Si no se proporciona un ID de video, usar uno predeterminado
        if (!videoId) {
            videoId = 'nM0xDI5R50E'; // ID de video predeterminado
        }
        
        // Obtener información del video
        const videoResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`);
        const videoData = await videoResponse.json();
        
        if (!videoData.items || videoData.items.length === 0) {
            throw new Error('Video no encontrado. Verifica el ID del video.');
        }
        
        const video = videoData.items[0];
        
        // Formatear números para mostrar K, M, etc.
        const formatNumber = (num) => {
            if (!num) return '0';
            const number = parseInt(num);
            if (number >= 1000000) {
                return (number / 1000000).toFixed(1) + 'M';
            } else if (number >= 1000) {
                return (number / 1000).toFixed(1) + 'K';
            } else {
                return number.toString();
            }
        };
        
        // Formatear duración del video (de ISO 8601 a formato legible)
        const formatDuration = (duration) => {
            if (!duration) return '';
            
            // Convertir PT1H2M3S a formato legible (1:02:03)
            const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
            if (!match) return '';
            
            const hours = match[1] ? match[1] : '0';
            const minutes = match[2] ? match[2].padStart(2, '0') : '00';
            const seconds = match[3] ? match[3].padStart(2, '0') : '00';
            
            return hours !== '0' ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
        };
        
        // Formatear fecha de publicación
        const publishedDate = new Date(video.snippet.publishedAt);
        const formattedDate = publishedDate.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        });
        
        // Obtener una descripción corta (2 líneas)
        const shortDescription = video.snippet.description.split('\n').slice(0, 2).join('\n');
        
        // Crear HTML para la plantilla de video único simplificada
        templatePreview.innerHTML = `
            <div class="single-video-container" style="width: 700px; margin: 0 auto;">
                <div class="thumbnail-container" data-video-id="${videoId}" style="position: relative; width: 700px; height: 400px; cursor: pointer; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <img src="${video.snippet.thumbnails.maxres ? video.snippet.thumbnails.maxres.url : video.snippet.thumbnails.high.url}" alt="${video.snippet.title}" style="width: 100%; height: 100%; object-fit: cover;">
                    <div class="play-button" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 68px; height: 68px; background-color: rgba(0,0,0,0.7); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <svg viewBox="0 0 24 24" width="40" height="40">
                            <path d="M8,5.14V19.14L19,12.14L8,5.14Z" fill="white"></path>
                        </svg>
                    </div>
                    <div class="video-duration" style="position: absolute; bottom: 10px; right: 10px; background-color: rgba(0,0,0,0.7); color: white; padding: 3px 8px; border-radius: 3px; font-size: 14px; font-weight: 500;">
                        ${formatDuration(video.contentDetails.duration)}
                    </div>
                </div>
                
                <div class="video-info" style="padding: 15px 0;">
                    <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">${video.snippet.title}</h2>
                    <div style="color: #606060; font-size: 14px; margin-bottom: 10px;">${formattedDate}</div>
                    <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">
                        ${shortDescription}
                    </p>
                    <div class="video-stats" style="display: flex; color: #606060; font-size: 14px;">
                        <div style="margin-right: 15px;">${formatNumber(video.statistics.viewCount)} Views</div>
                        <div style="margin-right: 15px;">${formatNumber(video.statistics.likeCount)} Likes</div>
                        <div>${formatNumber(video.statistics.commentCount)} Comments</div>
                    </div>
                </div>
            </div>
        `;
        
        // Añadir event listener para reproducir el video
        const thumbnailContainer = templatePreview.querySelector('.thumbnail-container');
        thumbnailContainer.addEventListener('click', () => {
            showModal(videoId, video.snippet.title);
        });
        
    } catch (error) {
        templatePreview.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 20px; color: red;">
                <h3>Error al cargar el video</h3>
                <p>${error.message}</p>
            </div>
        `;
        console.error('Error en loadSingleVideo:', error);
    }
}