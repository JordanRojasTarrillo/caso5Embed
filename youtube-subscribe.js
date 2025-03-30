// Funcionalidad para la plantilla YouTube Subscribe

async function loadYouTubeSubscribe(channelIdOrUsername) {
    try {
        const templatePreview = document.getElementById('template-preview');
        templatePreview.innerHTML = '<div class="loading">Cargando información del canal...</div>';
        
        // Determinar si es un ID de canal o un nombre de usuario
        let channelId = channelIdOrUsername;
        
        // Si parece ser un ID de video (11 caracteres), obtenemos el canal asociado
        if (channelIdOrUsername && channelIdOrUsername.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(channelIdOrUsername)) {
            const videoResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${channelIdOrUsername}&key=${YOUTUBE_API_KEY}`);
            const videoData = await videoResponse.json();
            
            if (videoData.items && videoData.items.length > 0) {
                channelId = videoData.items[0].snippet.channelId;
            } else {
                throw new Error('No se pudo encontrar el canal asociado a este video.');
            }
        }
        // Si es un nombre de usuario (con @), intentamos obtener el canal
        else if (channelIdOrUsername && channelIdOrUsername.startsWith('@')) {
            // La API no permite buscar directamente por @username, así que usamos search
            const searchResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(channelIdOrUsername)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`);
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
        
        // Obtener información del canal
        const channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${YOUTUBE_API_KEY}`);
        const channelData = await channelResponse.json();
        
        if (!channelData.items || channelData.items.length === 0) {
            throw new Error('No se encontró información del canal');
        }
        
        const channel = channelData.items[0];
        
        // Obtener videos recientes del canal (pedimos 10 para tener suficientes para la navegación)
        const videosResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=10&order=date&type=video&key=${YOUTUBE_API_KEY}`);
        const videosData = await videosResponse.json();
        
        if (!videosData.items || videosData.items.length === 0) {
            throw new Error('No se encontraron videos para este canal');
        }
        
        // Crear HTML para la plantilla de suscripción
        templatePreview.innerHTML = `
            <div class="subscribe-container">
                <!-- Banner y perfil del canal -->
                <div class="subscribe-header">
                    <div class="channel-banner">
                        ${channel.brandingSettings.image && channel.brandingSettings.image.bannerExternalUrl ? 
                          `<img src="${channel.brandingSettings.image.bannerExternalUrl}" alt="Banner de ${channel.snippet.title}">` : 
                          '<div class="default-banner"></div>'}
                    </div>
                    
                    <div class="channel-profile">
                        <div class="profile-info">
                            <div class="profile-avatar">
                                <img src="${channel.snippet.thumbnails.high.url}" alt="${channel.snippet.title}">
                            </div>
                            <div class="profile-details">
                                <h3>${channel.snippet.title}</h3>
                                <p class="subscriber-count">${formatNumber(channel.statistics.subscriberCount)} suscriptores</p>
                            </div>
                        </div>
                        <div class="subscribe-action">
                            <button class="subscribe-btn">
                                <svg viewBox="0 0 24 24" width="16" height="16" class="subscribe-icon">
                                    <path d="M10,18v-6l5,3L10,18z M17,3H7v1h10V3z M20,6H4v1h16V6z M22,9H2v12h20V9z M3,10h18v10H3V10z" fill="currentColor"></path>
                                </svg>
                                Suscribirse
                            </button>
                            <button class="notification-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Videos del canal con navegación -->
                <div class="subscribe-videos">
                    <div class="videos-header">
                        <h4>Videos recientes</h4>
                        <div class="navigation-controls">
                            <span class="video-counter">1-2 de ${videosData.items.length}</span>
                            <button class="nav-btn prev-btn" disabled>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                            </button>
                            <button class="nav-btn next-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <div class="videos-container" data-page="0" data-total-pages="${Math.ceil(videosData.items.length / 2)}">
                        <div class="videos-grid">
                            ${videosData.items.slice(0, 2).map(video => `
                                <div class="video-card" data-video-id="${video.id.videoId}">
                                    <div class="video-thumbnail">
                                        <img src="${video.snippet.thumbnails.high.url}" alt="${video.snippet.title}">
                                        <div class="play-overlay">
                                            <svg viewBox="0 0 24 24" width="48" height="48">
                                                <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,0.5)"></circle>
                                                <path d="M10,8l6,4l-6,4V8z" fill="white"></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="video-info">
                                        <h5>${video.snippet.title}</h5>
                                        <p class="video-date">${new Date(video.snippet.publishedAt).toLocaleDateString()}</p>
                                        <p class="video-description">${video.snippet.description.substring(0, 80)}${video.snippet.description.length > 80 ? '...' : ''}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <!-- Pie de página con información adicional -->
                <div class="subscribe-footer">
                    <div class="channel-links">
                        <a href="https://www.youtube.com/channel/${channelId}" target="_blank" class="channel-link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                            Ver canal completo
                        </a>
                        <a href="#" class="share-link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="18" cy="5" r="3"></circle>
                                <circle cx="6" cy="12" r="3"></circle>
                                <circle cx="18" cy="19" r="3"></circle>
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                            </svg>
                            Compartir
                        </a>
                    </div>
                    <div class="powered-by">
                        <span>Powered by YouTube API</span>
                    </div>
                </div>
            </div>
        `;
        
        // Almacenar todos los videos para la navegación
        const allVideos = videosData.items;
        
        // Añadir event listeners a los videos
        const addVideoListeners = () => {
            const videoCards = document.querySelectorAll('.video-card');
            videoCards.forEach(card => {
                card.addEventListener('click', () => {
                    const videoId = card.getAttribute('data-video-id');
                    const title = card.querySelector('h5').textContent;
                    showModal(videoId, title);
                });
            });
        };
        
        // Inicializar los listeners de videos
        addVideoListeners();
        
        // Event listener para el botón de suscripción
        const subscribeBtn = document.querySelector('.subscribe-btn');
        if (subscribeBtn) {
            subscribeBtn.addEventListener('click', () => {
                if (subscribeBtn.classList.contains('subscribed')) {
                    subscribeBtn.classList.remove('subscribed');
                    subscribeBtn.innerHTML = `
                        <svg viewBox="0 0 24 24" width="16" height="16" class="subscribe-icon">
                            <path d="M10,18v-6l5,3L10,18z M17,3H7v1h10V3z M20,6H4v1h16V6z M22,9H2v12h20V9z M3,10h18v10H3V10z" fill="currentColor"></path>
                        </svg>
                        Suscribirse
                    `;
                } else {
                    subscribeBtn.classList.add('subscribed');
                    subscribeBtn.innerHTML = `
                        <svg viewBox="0 0 24 24" width="16" height="16" class="subscribe-icon">
                            <path d="M10,18v-6l5,3L10,18z M17,3H7v1h10V3z M20,6H4v1h16V6z M22,9H2v12h20V9z M3,10h18v10H3V10z" fill="currentColor"></path>
                        </svg>
                        Suscrito
                    `;
                }
            });
        }
        
        // Event listeners para los botones de navegación
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const videosContainer = document.querySelector('.videos-container');
        const videoCounter = document.querySelector('.video-counter');
        
        // Función para actualizar la navegación
        const updateNavigation = () => {
            const currentPage = parseInt(videosContainer.getAttribute('data-page'));
            const totalPages = parseInt(videosContainer.getAttribute('data-total-pages'));
            
            prevBtn.disabled = currentPage === 0;
            nextBtn.disabled = currentPage === totalPages - 1;
            
            const startIndex = currentPage * 2 + 1;
            const endIndex = Math.min(startIndex + 1, allVideos.length);
            videoCounter.textContent = `${startIndex}-${endIndex} de ${allVideos.length}`;
        };
        
        // Función para cargar la página de videos
        const loadVideoPage = (page) => {
            const startIndex = page * 2;
            const endIndex = startIndex + 2;
            const pageVideos = allVideos.slice(startIndex, endIndex);
            
            const videosGrid = document.querySelector('.videos-grid');
            videosGrid.innerHTML = pageVideos.map(video => `
                <div class="video-card" data-video-id="${video.id.videoId}">
                    <div class="video-thumbnail">
                        <img src="${video.snippet.thumbnails.high.url}" alt="${video.snippet.title}">
                        <div class="play-overlay">
                            <svg viewBox="0 0 24 24" width="48" height="48">
                                <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,0.5)"></circle>
                                <path d="M10,8l6,4l-6,4V8z" fill="white"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="video-info">
                        <h5>${video.snippet.title}</h5>
                        <p class="video-date">${new Date(video.snippet.publishedAt).toLocaleDateString()}</p>
                        <p class="video-description">${video.snippet.description.substring(0, 80)}${video.snippet.description.length > 80 ? '...' : ''}</p>
                    </div>
                </div>
            `).join('');
            
            videosContainer.setAttribute('data-page', page);
            updateNavigation();
            addVideoListeners();
        };
        
        // Event listeners para los botones de navegación
        prevBtn.addEventListener('click', () => {
            const currentPage = parseInt(videosContainer.getAttribute('data-page'));
            if (currentPage > 0) {
                loadVideoPage(currentPage - 1);
            }
        });
        
        nextBtn.addEventListener('click', () => {
            const currentPage = parseInt(videosContainer.getAttribute('data-page'));
            const totalPages = parseInt(videosContainer.getAttribute('data-total-pages'));
            if (currentPage < totalPages - 1) {
                loadVideoPage(currentPage + 1);
            }
        });
        
    } catch (error) {
        handleLoadError(error, 'template-preview', 'Error al cargar la plantilla de suscripción');
    }
}