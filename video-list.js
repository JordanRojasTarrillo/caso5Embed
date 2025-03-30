// Funcionalidad para la plantilla Video List

async function loadVideoList(channelIdOrVideoId) {
    try {
        const templatePreview = document.getElementById('template-preview');
        templatePreview.innerHTML = '<div class="loading">Cargando lista de videos...</div>';
        
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
        
        const maxResults = 10; // Mostrar 10 videos en la lista
        
        // Obtener videos del canal
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&order=date&type=video&key=${YOUTUBE_API_KEY}`);
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
            throw new Error('No se encontraron videos para este canal');
        }
        
        // Obtener estadísticas de los videos (vistas, duración, etc.)
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
        
        // Crear HTML para la plantilla de lista de videos
        templatePreview.innerHTML = `
            <div class="video-list-container">
                <div class="list-header">
                    <h3>Lista de Videos</h3>
                    <div class="list-controls">
                        <div class="search-box">
                            <input type="text" id="video-search" placeholder="Buscar videos...">
                            <button class="search-btn">
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </button>
                        </div>
                        <div class="sort-options">
                            <select id="sort-videos">
                                <option value="date-desc">Más recientes</option>
                                <option value="date-asc">Más antiguos</option>
                                <option value="views">Más vistos</option>
                                <option value="title">Alfabético</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="video-list">
                    <div class="list-column-headers">
                        <div class="column-header thumbnail-col">#</div>
                        <div class="column-header title-col">Título</div>
                        <div class="column-header date-col">Fecha</div>
                        <div class="column-header views-col">Vistas</div>
                        <div class="column-header duration-col">Duración</div>
                    </div>
                    
                    <div class="list-items">
                        ${videosWithStats.map((video, index) => `
                            <div class="list-item" data-video-id="${video.id.videoId}">
                                <div class="item-thumbnail">
                                    <span class="item-number">${index + 1}</span>
                                    <div class="thumbnail-wrapper">
                                        <img src="${video.snippet.thumbnails.default.url}" alt="${video.snippet.title}">
                                        <div class="play-icon">
                                            <svg viewBox="0 0 24 24" width="24" height="24">
                                                <path d="M8,5.14V19.14L19,12.14L8,5.14Z" fill="currentColor"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div class="item-title">
                                    <h4>${video.snippet.title}</h4>
                                    <p class="item-channel">${video.snippet.channelTitle}</p>
                                </div>
                                <div class="item-date">${new Date(video.snippet.publishedAt).toLocaleDateString()}</div>
                                <div class="item-views">
                                    <svg viewBox="0 0 24 24" width="14" height="14">
                                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"></path>
                                    </svg>
                                    ${video.statistics ? formatNumber(video.statistics.viewCount) : 'N/A'}
                                </div>
                                <div class="item-duration">
                                    <svg viewBox="0 0 24 24" width="14" height="14">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"></circle>
                                        <polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2" fill="none"></polyline>
                                    </svg>
                                    ${video.contentDetails ? formatDuration(video.contentDetails.duration) : 'N/A'}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="list-pagination">
                    <div class="pagination-info">
                        Mostrando <span class="current-range">1-${Math.min(maxResults, videosWithStats.length)}</span> de <span class="total-count">${videosWithStats.length}</span> videos
                    </div>
                    <div class="pagination-controls">
                        <button class="pagination-btn" disabled>
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                            Anterior
                        </button>
                        <div class="page-numbers">
                            <span class="page-number active">1</span>
                        </div>
                        <button class="pagination-btn" disabled>
                            Siguiente
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Almacenar todos los videos para búsqueda y ordenamiento
        const allVideos = [...videosWithStats];
        
        // Función para actualizar la lista de videos
        const updateVideoList = (videos) => {
            const listItems = document.querySelector('.list-items');
            listItems.innerHTML = videos.map((video, index) => `
                <div class="list-item" data-video-id="${video.id.videoId}">
                    <div class="item-thumbnail">
                        <span class="item-number">${index + 1}</span>
                        <div class="thumbnail-wrapper">
                            <img src="${video.snippet.thumbnails.default.url}" alt="${video.snippet.title}">
                            <div class="play-icon">
                                <svg viewBox="0 0 24 24" width="24" height="24">
                                    <path d="M8,5.14V19.14L19,12.14L8,5.14Z" fill="currentColor"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="item-title">
                        <h4>${video.snippet.title}</h4>
                        <p class="item-channel">${video.snippet.channelTitle}</p>
                    </div>
                    <div class="item-date">${new Date(video.snippet.publishedAt).toLocaleDateString()}</div>
                    <div class="item-views">
                        <svg viewBox="0 0 24 24" width="14" height="14">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"></path>
                        </svg>
                        ${video.statistics ? formatNumber(video.statistics.viewCount) : 'N/A'}
                    </div>
                    <div class="item-duration">
                        <svg viewBox="0 0 24 24" width="14" height="14">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"></circle>
                            <polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2" fill="none"></polyline>
                        </svg>
                        ${video.contentDetails ? formatDuration(video.contentDetails.duration) : 'N/A'}
                    </div>
                </div>
            `).join('');
            
            // Actualizar el rango mostrado
            const currentRange = document.querySelector('.current-range');
            currentRange.textContent = `1-${Math.min(maxResults, videos.length)}`;
            
            // Actualizar el total
            const totalCount = document.querySelector('.total-count');
            totalCount.textContent = videos.length;
            
            // Añadir event listeners a los videos
            addVideoListeners();
        };
        
        // Añadir event listeners a los videos
        const addVideoListeners = () => {
            const listItems = document.querySelectorAll('.list-item');
            listItems.forEach(item => {
                item.addEventListener('click', () => {
                    const videoId = item.getAttribute('data-video-id');
                    const title = item.querySelector('h4').textContent;
                    showModal(videoId, title);
                });
            });
        };
        
        // Inicializar los listeners de videos
        addVideoListeners();
        
        // Event listener para el campo de búsqueda
        const searchInput = document.getElementById('video-search');
        const searchBtn = document.querySelector('.search-btn');
        
        const performSearch = () => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            if (searchTerm === '') {
                updateVideoList(allVideos);
                return;
            }
            
            const filteredVideos = allVideos.filter(video => 
                video.snippet.title.toLowerCase().includes(searchTerm) || 
                video.snippet.description.toLowerCase().includes(searchTerm)
            );
            
            updateVideoList(filteredVideos);
        };
        
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        searchBtn.addEventListener('click', performSearch);
        
        // Event listener para el selector de ordenamiento
        const sortSelect = document.getElementById('sort-videos');
        sortSelect.addEventListener('change', () => {
            const sortBy = sortSelect.value;
            let sortedVideos = [...allVideos];
            
            switch (sortBy) {
                case 'date-desc':
                    sortedVideos.sort((a, b) => new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt));
                    break;
                case 'date-asc':
                    sortedVideos.sort((a, b) => new Date(a.snippet.publishedAt) - new Date(b.snippet.publishedAt));
                    break;
                case 'views':
                    sortedVideos.sort((a, b) => {
                        const viewsA = a.statistics ? parseInt(a.statistics.viewCount) : 0;
                        const viewsB = b.statistics ? parseInt(b.statistics.viewCount) : 0;
                        return viewsB - viewsA;
                    });
                    break;
                case 'title':
                    sortedVideos.sort((a, b) => a.snippet.title.localeCompare(b.snippet.title));
                    break;
            }
            
            updateVideoList(sortedVideos);
        });
        
    } catch (error) {
        handleLoadError(error, 'template-preview', 'Error al cargar la lista de videos');
    }
}