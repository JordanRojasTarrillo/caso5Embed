

async function loadVideoGrid(channelId) {
    try {
        const templatePreview = document.getElementById('template-preview');
        templatePreview.innerHTML = '<div class="loading">Cargando videos...</div>';
        
        // Primero verificamos si es un ID de canal o un ID de video
        let finalChannelId = channelId;
        
        // Si parece ser un ID de video (11 caracteres), obtenemos el canal asociado
        if (channelId.length === 11) {
            const videoResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`);
            const videoData = await videoResponse.json();
            
            if (videoData.items && videoData.items.length > 0) {
                finalChannelId = videoData.items[0].snippet.channelId;
            } else {
                throw new Error('No se pudo encontrar el canal asociado a este video.');
            }
        }
        
        // Obtener información del canal
        const channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${finalChannelId}&key=${YOUTUBE_API_KEY}`);
        const channelData = await channelResponse.json();
        
        if (!channelData.items || channelData.items.length === 0) {
            throw new Error('Canal no encontrado. Verifica el ID del canal.');
        }
        
        const channel = channelData.items[0];
        
        // Obtener videos del canal
        const maxResults = 16; // 4x4 grid
        const videosResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${finalChannelId}&maxResults=${maxResults}&order=date&type=video&key=${YOUTUBE_API_KEY}`);
        const videosData = await videosResponse.json();
        
        if (!videosData.items || videosData.items.length === 0) {
            throw new Error('No se encontraron videos para este canal.');
        }
        
        // Obtener duración de los videos
        const videoIds = videosData.items.map(item => item.id.videoId).join(',');
        const detailsResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`);
        const detailsData = await detailsResponse.json();
        
        // Combinar datos de videos con sus duraciones
        const videosWithDetails = videosData.items.map(video => {
            const details = detailsData.items.find(item => item.id === video.id.videoId);
            return {
                ...video,
                contentDetails: details ? details.contentDetails : null
            };
        });
        
        // Crear HTML para la cuadrícula de videos
        templatePreview.innerHTML = `
            <div class="video-grid-container">
                <div class="grid-header">
                    <div class="channel-info">
                        <img src="${channel.snippet.thumbnails.default.url}" alt="${channel.snippet.title}" class="channel-avatar">
                        <h3>${channel.snippet.title}</h3>
                    </div>
                    <div class="grid-controls">
                        <select class="grid-filter">
                            <option value="date">Más recientes</option>
                            <option value="title">Alfabético</option>
                        </select>
                    </div>
                </div>
                
                <div class="video-grid">
                    ${videosWithDetails.map(video => `
                        <div class="video-item" data-video-id="${video.id.videoId}">
                            <div class="thumbnail-container">
                                <img src="${video.snippet.thumbnails.high.url}" alt="${video.snippet.title}">
                                <div class="play-button"></div>
                                ${video.contentDetails ? `
                                    <div class="video-duration">${formatDuration(video.contentDetails.duration)}</div>
                                ` : ''}
                            </div>
                            <h5>${video.snippet.title}</h5>
                            <p class="video-date">${new Date(video.snippet.publishedAt).toLocaleDateString()}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Almacenar todos los videos para filtrado
        const allVideos = [...videosWithDetails];
        
        // Añadir event listeners a los videos
        const addVideoListeners = () => {
            const videoItems = document.querySelectorAll('.video-item');
            videoItems.forEach(item => {
                item.addEventListener('click', () => {
                    const videoId = item.getAttribute('data-video-id');
                    const title = item.querySelector('h5').textContent;
                    showModal(videoId, title);
                });
            });
        };
        
        // Inicializar los listeners de videos
        addVideoListeners();
        
        // Event listener para el filtro
        const gridFilter = document.querySelector('.grid-filter');
        gridFilter.addEventListener('change', () => {
            const filterValue = gridFilter.value;
            let filteredVideos = [...allVideos];
            
            if (filterValue === 'date') {
                filteredVideos.sort((a, b) => new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt));
            } else if (filterValue === 'title') {
                filteredVideos.sort((a, b) => a.snippet.title.localeCompare(b.snippet.title));
            }
            
            // Actualizar la cuadrícula con los videos filtrados
            const videoGrid = document.querySelector('.video-grid');
            videoGrid.innerHTML = filteredVideos.map(video => `
                <div class="video-item" data-video-id="${video.id.videoId}">
                    <div class="thumbnail-container">
                        <img src="${video.snippet.thumbnails.high.url}" alt="${video.snippet.title}">
                        <div class="play-button"></div>
                        ${video.contentDetails ? `
                            <div class="video-duration">${formatDuration(video.contentDetails.duration)}</div>
                        ` : ''}
                    </div>
                    <h5>${video.snippet.title}</h5>
                    <p class="video-date">${new Date(video.snippet.publishedAt).toLocaleDateString()}</p>
                </div>
            `).join('');
            
            // Volver a añadir event listeners
            addVideoListeners();
        });
        
    } catch (error) {
        handleLoadError(error, 'template-preview', 'Error al cargar la cuadrícula de videos');
    }
}