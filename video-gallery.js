// Funcionalidad para la plantilla Video Gallery

async function loadVideoGallery(channelIdOrVideoId) {
    try {
        const templatePreview = document.getElementById('template-preview');
        templatePreview.innerHTML = '<div class="loading">Cargando galería de videos...</div>';
        
        // Determinar si es un ID de canal o un ID de video
        let channelId = channelIdOrVideoId;
        
        // Si parece ser un ID de video (11 caracteres), obtenemos el canal asociado
        if (channelIdOrVideoId && channelIdOrVideoId.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(channelIdOrVideoId)) {
            const videoResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${channelIdOrVideoId}&key=${YOUTUBE_API_KEY}`);
            const videoData = await videoResponse.json();
            
            if (videoData.items && videoData.items.length > 0) {
                channelId = videoData.items[0].snippet.channelId;
            } else {
                throw new Error('No se pudo encontrar el canal asociado a este video.');
            }
        }
        // Si es un nombre de usuario (con @), intentamos obtener el canal
        else if (channelIdOrVideoId && channelIdOrVideoId.startsWith('@')) {
            // La API no permite buscar directamente por @username, así que usamos search
            const searchResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(channelIdOrVideoId)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`);
            const searchData = await searchResponse.json();
            
            if (searchData.items && searchData.items.length > 0) {
                channelId = searchData.items[0].id.channelId;
            } else {
                throw new Error('No se pudo encontrar el canal con ese nombre de usuario.');
            }
        }
        // Si no se proporciona un ID, usar uno predeterminado
        else if (!channelId) {
            channelId = 'UC_x5XG1OV2P6uZZ5FSM9Ttw'; // Google Developers channel como ejemplo
        }
        
        const maxResults = 8; // 4 columnas x 2 filas = 8 videos
        
        // Obtener videos del canal
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&order=viewCount&type=video&key=${YOUTUBE_API_KEY}`);
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
            throw new Error('No se encontraron videos para este canal');
        }
        
        // Obtener estadísticas de los videos (vistas, likes, etc.)
        const videoIds = data.items.map(item => item.id.videoId).join(',');
        const statsResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`);
        const statsData = await statsResponse.json();
        
        // Combinar datos de videos con sus estadísticas
        const videosWithStats = data.items.map(video => {
            const stats = statsData.items.find(item => item.id === video.id.videoId);
            return {
                ...video,
                statistics: stats ? stats.statistics : null,
                contentDetails: stats ? stats.contentDetails : null
            };
        });
        
        // Crear HTML para la plantilla de galería de videos
        templatePreview.innerHTML = `
            <div class="video-gallery-container">
                <div class="gallery-header">
                    <h3>Galería de Videos</h3>
                    <div class="gallery-filters">
                        <select class="filter-select">
                            <option value="popular">Más populares</option>
                            <option value="recent">Más recientes</option>
                            <option value="oldest">Más antiguos</option>
                        </select>
                        <div class="view-toggle">
                            <button class="view-btn grid-view active" title="Vista de cuadrícula">
                                <svg viewBox="0 0 24 24" width="18" height="18">
                                    <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                                    <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                                    <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                                    <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                                </svg>
                            </button>
                            <button class="view-btn list-view" title="Vista de lista">
                                <svg viewBox="0 0 24 24" width="18" height="18">
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <line x1="3" y1="12" x2="21" y2="12"></line>
                                    <line x1="3" y1="18" x2="21" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="video-gallery grid-view-active">
                    ${videosWithStats.map(video => `
                        <div class="gallery-item" data-video-id="${video.id.videoId}">
                            <div class="gallery-thumbnail">
                                <img src="${video.snippet.thumbnails.high.url}" alt="${video.snippet.title}">
                                <div class="thumbnail-overlay">
                                    <div class="play-button">
                                        <svg viewBox="0 0 24 24" width="48" height="48">
                                            <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,0.5)"></circle>
                                            <path d="M10,8l6,4l-6,4V8z" fill="white"></path>
                                        </svg>
                                    </div>
                                    ${video.contentDetails ? `
                                        <span class="video-duration">${formatDuration(video.contentDetails.duration)}</span>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="gallery-info">
                                <h4 class="video-title">${video.snippet.title}</h4>
                                <div class="video-meta">
                                    <span class="video-date">${new Date(video.snippet.publishedAt).toLocaleDateString()}</span>
                                    ${video.statistics ? `
                                        <div class="video-stats">
                                            <span class="views-count" title="Vistas">
                                                <svg viewBox="0 0 24 24" width="14" height="14">
                                                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"></path>
                                                </svg>
                                                ${formatNumber(video.statistics.viewCount)}
                                            </span>
                                            <span class="likes-count" title="Me gusta">
                                                <svg viewBox="0 0 24 24" width="14" height="14">
                                                    <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z" fill="currentColor"></path>
                                                </svg>
                                                ${formatNumber(video.statistics.likeCount)}
                                            </span>
                                        </div>
                                    ` : ''}
                                </div>
                                <p class="video-description">${video.snippet.description.substring(0, 100)}${video.snippet.description.length > 100 ? '...' : ''}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="gallery-pagination">
                    <button class="pagination-btn" disabled>
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                        Anterior
                    </button>
                    <div class="page-indicator">
                        <span class="current-page">1</span> de <span class="total-pages">1</span>
                    </div>
                    <button class="pagination-btn" disabled>
                        Siguiente
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        // Almacenar todos los videos para filtrado
        const allVideos = [...videosWithStats];
        
        // Añadir event listeners a los videos
        const addVideoListeners = () => {
            const galleryItems = document.querySelectorAll('.gallery-item');
            galleryItems.forEach(item => {
                item.addEventListener('click', () => {
                    const videoId = item.getAttribute('data-video-id');
                    const title = item.querySelector('.video-title').textContent;
                    showModal(videoId, title);
                });
            });
        };
        
        // Inicializar los listeners de videos
        addVideoListeners();
        
        // Event listeners para los botones de vista
        const gridViewBtn = document.querySelector('.grid-view');
        const listViewBtn = document.querySelector('.list-view');
        const videoGallery = document.querySelector('.video-gallery');
        
        gridViewBtn.addEventListener('click', () => {
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
            videoGallery.classList.add('grid-view-active');
            videoGallery.classList.remove('list-view-active');
        });
        
        listViewBtn.addEventListener('click', () => {
            listViewBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
            videoGallery.classList.remove('grid-view-active');
            videoGallery.classList.add('list-view-active');
        });
        
        // Event listener para el selector de filtro
        const filterSelect = document.querySelector('.filter-select');
        filterSelect.addEventListener('change', () => {
            const sortBy = filterSelect.value;
            let sortedVideos = [...allVideos];
            
            if (sortBy === 'popular') {
                sortedVideos.sort((a, b) => {
                    const viewsA = a.statistics ? parseInt(a.statistics.viewCount) : 0;
                    const viewsB = b.statistics ? parseInt(b.statistics.viewCount) : 0;
                    return viewsB - viewsA;
                });
            } else if (sortBy === 'recent') {
                sortedVideos.sort((a, b) => {
                    return new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt);
                });
            } else if (sortBy === 'oldest') {
                sortedVideos.sort((a, b) => {
                    return new Date(a.snippet.publishedAt) - new Date(b.snippet.publishedAt);
                });
            }
            
            // Actualizar la galería con los videos ordenados
            const videoGallery = document.querySelector('.video-gallery');
            videoGallery.innerHTML = sortedVideos.map(video => `
                <div class="gallery-item" data-video-id="${video.id.videoId}">
                    <div class="gallery-thumbnail">
                        <img src="${video.snippet.thumbnails.high.url}" alt="${video.snippet.title}">
                        <div class="thumbnail-overlay">
                            <div class="play-button">
                                <svg viewBox="0 0 24 24" width="48" height="48">
                                    <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,0.5)"></circle>
                                    <path d="M10,8l6,4l-6,4V8z" fill="white"></path>
                                </svg>
                            </div>
                            ${video.contentDetails ? `
                                <span class="video-duration">${formatDuration(video.contentDetails.duration)}</span>
                            ` : ''}
                        </div>
                    </div>
                    <div class="gallery-info">
                        <h4 class="video-title">${video.snippet.title}</h4>
                        <div class="video-meta">
                            <span class="video-date">${new Date(video.snippet.publishedAt).toLocaleDateString()}</span>
                            ${video.statistics ? `
                                <div class="video-stats">
                                    <span class="views-count" title="Vistas">
                                        <svg viewBox="0 0 24 24" width="14" height="14">
                                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"></path>
                                        </svg>
                                        ${formatNumber(video.statistics.viewCount)}
                                    </span>
                                    <span class="likes-count" title="Me gusta">
                                        <svg viewBox="0 0 24 24" width="14" height="14">
                                            <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z" fill="currentColor"></path>
                                        </svg>
                                        ${formatNumber(video.statistics.likeCount)}
                                    </span>
                                </div>
                            ` : ''}
                        </div>
                        <p class="video-description">${video.snippet.description.substring(0, 100)}${video.snippet.description.length > 100 ? '...' : ''}</p>
                    </div>
                </div>
            `).join('');
            
            // Volver a añadir event listeners a los videos
            addVideoListeners();
        });
        
    } catch (error) {
        handleLoadError(error, 'template-preview', 'Error al cargar la galería de videos');
    }
}