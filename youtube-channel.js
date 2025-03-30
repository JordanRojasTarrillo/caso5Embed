// Funcionalidad para la plantilla YouTube Channel

async function loadYouTubeChannel(channelIdOrUsername) {
    try {
        const templatePreview = document.getElementById('template-preview');
        templatePreview.innerHTML = '<div class="loading">Cargando información del canal...</div>';
        
        console.log("Intentando cargar canal con:", channelIdOrUsername);
        
        // Verificar si la API está disponible
        try {
            const testResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=1&key=${YOUTUBE_API_KEY}`);
            const testData = await testResponse.json();
            
            if (testData.error) {
                throw new Error(`Error de API: ${testData.error.message}`);
            }
        } catch (err) {
            throw new Error(`No se pudo conectar con la API de YouTube: ${err.message}`);
        }
        
        // Determinar el tipo de entrada y obtener el ID del canal
        let channelId;
        
        // Si es un nombre de usuario con @, buscar el canal
        if (channelIdOrUsername.startsWith('@')) {
            const searchTerm = channelIdOrUsername.substring(1); // Quitar el @
            console.log("Buscando canal con término:", searchTerm);
            
            try {
                const searchResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`);
                const searchData = await searchResponse.json();
                
                if (searchData.error) {
                    throw new Error(`Error en búsqueda: ${searchData.error.message}`);
                }
                
                if (searchData.items && searchData.items.length > 0) {
                    channelId = searchData.items[0].id.channelId;
                    console.log("Canal encontrado por búsqueda:", channelId);
                } else {
                    throw new Error('No se encontraron canales con ese nombre.');
                }
            } catch (err) {
                throw new Error(`Error al buscar canal: ${err.message}`);
            }
        } 
        // Si parece ser un ID de canal (UC seguido de caracteres)
        else if (channelIdOrUsername.startsWith('UC')) {
            channelId = channelIdOrUsername;
            console.log("Usando ID de canal directo:", channelId);
        }
        // Si parece ser un ID de video (11 caracteres)
        else if (channelIdOrUsername.length === 11) {
            console.log("Parece ser un ID de video, obteniendo canal asociado");
            
            try {
                const videoResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${channelIdOrUsername}&key=${YOUTUBE_API_KEY}`);
                const videoData = await videoResponse.json();
                
                if (videoData.error) {
                    throw new Error(`Error al obtener video: ${videoData.error.message}`);
                }
                
                if (videoData.items && videoData.items.length > 0) {
                    channelId = videoData.items[0].snippet.channelId;
                    console.log("Canal encontrado a partir del video:", channelId);
                } else {
                    throw new Error('No se encontró el video especificado.');
                }
            } catch (err) {
                throw new Error(`Error al obtener canal desde video: ${err.message}`);
            }
        }
        // En cualquier otro caso, intentar como búsqueda general
        else {
            console.log("Intentando como búsqueda general:", channelIdOrUsername);
            
            try {
                const searchResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(channelIdOrUsername)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`);
                const searchData = await searchResponse.json();
                
                if (searchData.error) {
                    throw new Error(`Error en búsqueda: ${searchData.error.message}`);
                }
                
                if (searchData.items && searchData.items.length > 0) {
                    channelId = searchData.items[0].id.channelId;
                    console.log("Canal encontrado por búsqueda general:", channelId);
                } else {
                    throw new Error('No se encontraron canales con ese término de búsqueda.');
                }
            } catch (err) {
                throw new Error(`Error en búsqueda general: ${err.message}`);
            }
        }
        
        if (!channelId) {
            throw new Error('No se pudo determinar el ID del canal.');
        }
        
        // Obtener información del canal
        console.log("Obteniendo información del canal ID:", channelId);
        let channel;
        
        try {
            const channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${YOUTUBE_API_KEY}`);
            const channelData = await channelResponse.json();
            
            if (channelData.error) {
                throw new Error(`Error al obtener canal: ${channelData.error.message}`);
            }
            
            if (!channelData.items || channelData.items.length === 0) {
                throw new Error('No se encontró información del canal.');
            }
            
            channel = channelData.items[0];
            console.log("Información del canal obtenida:", channel.snippet.title);
        } catch (err) {
            throw new Error(`Error al obtener información del canal: ${err.message}`);
        }
        
        // Obtener videos del canal
        console.log("Obteniendo videos del canal");
        let videos;
        
        try {
            const videosResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=12&order=date&type=video&key=${YOUTUBE_API_KEY}`);
            const videosData = await videosResponse.json();
            
            if (videosData.error) {
                throw new Error(`Error al obtener videos: ${videosData.error.message}`);
            }
            
            if (!videosData.items || videosData.items.length === 0) {
                throw new Error('No se encontraron videos para este canal.');
            }
            
            videos = videosData.items;
            console.log(`Se encontraron ${videos.length} videos`);
        } catch (err) {
            throw new Error(`Error al obtener videos del canal: ${err.message}`);
        }
        
        // Crear HTML para la plantilla de canal
        templatePreview.innerHTML = `
            <div class="channel-container">
                <div class="channel-banner">
                    ${channel.brandingSettings && channel.brandingSettings.image && channel.brandingSettings.image.bannerExternalUrl ? 
                      `<img src="${channel.brandingSettings.image.bannerExternalUrl}" alt="Banner de ${channel.snippet.title}">` : 
                      '<div class="default-banner"></div>'}
                </div>
                
                <div class="channel-info">
                    <div class="channel-header">
                        <div class="channel-avatar">
                            <img src="${channel.snippet.thumbnails.high.url}" alt="${channel.snippet.title}">
                        </div>
                        <div class="channel-details">
                            <h3>${channel.snippet.title}</h3>
                            <div class="channel-stats">
                                <span>${formatNumber(channel.statistics.subscriberCount)} suscriptores</span>
                                <span>${formatNumber(channel.statistics.videoCount)} videos</span>
                                <span>${formatNumber(channel.statistics.viewCount)} vistas</span>
                            </div>
                            <p class="channel-description">${channel.snippet.description ? channel.snippet.description.substring(0, 150) + (channel.snippet.description.length > 150 ? '...' : '') : 'Sin descripción'}</p>
                        </div>
                    </div>
                    
                    <div class="channel-actions">
                        <button class="subscribe-btn">Suscribirse</button>
                        <button class="notification-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="channel-tabs">
                    <div class="tab active">Videos</div>
                    <div class="tab">Playlists</div>
                    <div class="tab">Comunidad</div>
                    <div class="tab">Canales</div>
                    <div class="tab">Acerca de</div>
                </div>
                
                <div class="channel-content">
                    <h4>Videos recientes</h4>
                    <div class="recent-videos-container">
                        <button class="slider-nav-btn prev" disabled>
                            <svg viewBox="0 0 24 24">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        
                        <div class="recent-videos" data-current-page="0" data-total-pages="${Math.ceil(videos.length / 4)}">
                            ${videos.map(video => `
                                <div class="video-item" data-video-id="${video.id.videoId}">
                                    <div class="thumbnail-container">
                                        <img src="${video.snippet.thumbnails.high.url}" alt="${video.snippet.title}">
                                        <div class="play-button"></div>
                                        <div class="hover-title">${video.snippet.title}</div>
                                    </div>
                                    <h5>${video.snippet.title}</h5>
                                    <p class="video-date">${new Date(video.snippet.publishedAt).toLocaleDateString()}</p>
                                </div>
                            `).join('')}
                        </div>
                        
                        <button class="slider-nav-btn next">
                            <svg viewBox="0 0 24 24">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="slider-pagination">
                        ${Array(Math.ceil(videos.length / 4)).fill().map((_, i) => 
                            `<div class="slider-dot ${i === 0 ? 'active' : ''}" data-page="${i}"></div>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
        
        console.log("HTML generado correctamente");
        
        // Añadir event listeners a los videos
        const videoItems = templatePreview.querySelectorAll('.video-item');
        videoItems.forEach(item => {
            item.addEventListener('click', () => {
                const videoId = item.getAttribute('data-video-id');
                const title = item.querySelector('h5').textContent;
                showModal(videoId, title);
            });
        });
        
        // Event listener para el botón de suscripción
        const subscribeBtn = templatePreview.querySelector('.subscribe-btn');
        if (subscribeBtn) {
            subscribeBtn.addEventListener('click', () => {
                if (subscribeBtn.classList.contains('subscribed')) {
                    subscribeBtn.classList.remove('subscribed');
                    subscribeBtn.textContent = 'Suscribirse';
                } else {
                    subscribeBtn.classList.add('subscribed');
                    subscribeBtn.textContent = 'Suscrito';
                }
            });
        }
        
        // Configurar la navegación del slider
        const recentVideos = templatePreview.querySelector('.recent-videos');
        const prevBtn = templatePreview.querySelector('.slider-nav-btn.prev');
        const nextBtn = templatePreview.querySelector('.slider-nav-btn.next');
        const sliderDots = templatePreview.querySelectorAll('.slider-dot');
        
        // Calcular el ancho de cada página del slider
        const videoWidth = 220; // Ancho aproximado de cada video con margen
        const videosPerPage = 4; // 4 videos por página
        const pageWidth = videoWidth * videosPerPage;
        
        // Función para navegar a una página específica
        const goToPage = (page) => {
            const totalPages = parseInt(recentVideos.getAttribute('data-total-pages'));
            
            // Validar que la página sea válida
            if (page < 0) page = 0;
            if (page >= totalPages) page = totalPages - 1;
            
            // Actualizar el atributo de página actual
            recentVideos.setAttribute('data-current-page', page);
            
            // Desplazar el slider
            recentVideos.scrollLeft = page * pageWidth;
            
            // Actualizar estado de los botones
            prevBtn.disabled = page === 0;
            nextBtn.disabled = page === totalPages - 1;
            
            // Actualizar los dots de paginación
            sliderDots.forEach((dot, i) => {
                dot.classList.toggle('active', i === page);
            });
        };
        
        // Event listeners para los botones de navegación
        prevBtn.addEventListener('click', () => {
            const currentPage = parseInt(recentVideos.getAttribute('data-current-page'));
            goToPage(currentPage - 1);
        });
        
        nextBtn.addEventListener('click', () => {
            const currentPage = parseInt(recentVideos.getAttribute('data-current-page'));
            goToPage(currentPage + 1);
        });
        
        // Event listeners para los dots de paginación
        sliderDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const page = parseInt(dot.getAttribute('data-page'));
                goToPage(page);
            });
        });
        
        console.log("Carga de canal completada con éxito");
        
    } catch (error) {
        console.error("Error en loadYouTubeChannel:", error);
        const templatePreview = document.getElementById('template-preview');
        templatePreview.innerHTML = `
            <div class="error-message">
                <h3>Error al cargar el canal</h3>
                <p>${error.message}</p>
                <p>Intenta con otra URL o ID de canal.</p>
                <div class="error-details">
                    <p>Detalles técnicos:</p>
                    <pre>${error.toString()}</pre>
                    <p>Si el problema persiste, verifica tu clave de API de YouTube.</p>
                </div>
            </div>
        `;
    }
}