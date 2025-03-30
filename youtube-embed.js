// YouTube Embed Handler - Script centralizado
// Este script detecta y procesa todos los embeds de YouTube en la página

(function() {
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initYouTubeEmbeds);
    } else {
        initYouTubeEmbeds();
    }

    function initYouTubeEmbeds() {
        // Buscar todos los elementos de embed de YouTube
        const embeds = document.querySelectorAll('.youtube-embed');
        
        // Procesar cada embed
        embeds.forEach(function(embed) {
            const config = getConfigFromElement(embed);
            renderTemplate(embed, config);
        });
    }

    // Extraer la configuración del elemento
    function getConfigFromElement(element) {
        try {
            // Obtener datos del atributo data-config (base64 o JSON)
            let configStr = element.getAttribute('data-config');
            if (!configStr) return {};
            
            // Intentar decodificar si es base64
            try {
                configStr = atob(configStr);
            } catch (e) {
                // Si no es base64, usar el string tal como está
            }
            
            // Parsear el JSON
            const config = JSON.parse(configStr);
            
            // Obtener el ID de la plantilla
            config.templateId = element.getAttribute('data-template') || config.templateId || '3';
            
            return config;
        } catch (e) {
            console.error('Error parsing YouTube embed configuration:', e);
            return { error: e.message };
        }
    }

    // Renderizar la plantilla según la configuración
    function renderTemplate(container, config) {
        // Asignar un ID único si no tiene uno
        if (!container.id) {
            container.id = 'yt-embed-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        }
        
        // Mostrar mensaje de carga
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #606060;">Cargando contenido de YouTube...</div>';
        
        // Verificar si hay un error en la configuración
        if (config.error) {
            container.innerHTML = `<div style="text-align: center; padding: 20px; color: red;"><h3>Error</h3><p>${config.error}</p></div>`;
            return;
        }
        
        // Renderizar la plantilla según el ID
        switch(config.templateId) {
            case '1':
                renderYouTubeChannel(container, config);
                break;
            case '2':
                renderVideoGrid(container, config);
                break;
            case '3':
                renderSingleVideo(container, config);
                break;
            case '4':
                renderYouTubeSubscribe(container, config);
                break;
            case '5':
                renderVideoGallery(container, config);
                break;
            case '7':
                renderVideoList(container, config);
                break;
            default:
                container.innerHTML = `<div style="text-align: center; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h3>Plantilla #${config.templateId}</h3>
                    <p>Esta plantilla está en desarrollo.</p>
                </div>`;
        }
    }
    
    // Función para formatear números
    function formatNumber(num) {
        if (!num) return '0';
        const number = parseInt(num);
        if (number >= 1000000) {
            return (number / 1000000).toFixed(1) + 'M';
        } else if (number >= 1000) {
            return (number / 1000).toFixed(1) + 'K';
        } else {
            return number.toString();
        }
    }
    
    // Función para formatear duración
    function formatDuration(duration) {
        if (!duration) return '';
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return '';
        const hours = match[1] ? match[1] : '0';
        const minutes = match[2] ? match[2].padStart(2, '0') : '00';
        const seconds = match[3] ? match[3].padStart(2, '0') : '00';
        return hours !== '0' ? hours + ':' + minutes + ':' + seconds : minutes + ':' + seconds;
    }
    
    // Función para mostrar modal con video
    function showModal(videoId, title, apiKey) {
        // Eliminar modal existente si hay uno
        const existingModal = document.querySelector('.modal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }
        
        // Crear el modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'modal-title');
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" role="button" aria-label="Close">&times;</span>
                <iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                <h3 id="modal-title">${title || ''}</h3>
                <div id="video-info">Cargando detalles del video...</div>
            </div>
        `;
        
        document.body.appendChild(modal);

        // Configurar eventos de cierre
        const closeModal = modal.querySelector('.close');
        closeModal.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Cerrar modal al hacer clic fuera del contenido
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        // Mostrar el modal
        modal.style.display = 'block';
        
        // Añadir estilos para el modal
        addModalStyles();
        
        // Cargar los detalles del video si tenemos una API key
        if (apiKey) {
            fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`)
                .then(response => response.json())
                .then(data => {
                    if (data.items && data.items.length > 0) {
                        const video = data.items[0];
                        
                        // Actualizar el título si no se proporcionó uno
                        if (!title) {
                            const modalTitle = document.getElementById('modal-title');
                            if (modalTitle) {
                                modalTitle.textContent = video.snippet.title;
                            }
                        }
                        
                        // Actualizar la información del video
                        const videoInfo = document.getElementById('video-info');
                        if (videoInfo) {
                            videoInfo.innerHTML = `
                                <div class="video-stats">
                                    <span>${formatNumber(video.statistics.viewCount)} vistas</span>
                                    <span>${formatNumber(video.statistics.likeCount)} me gusta</span>
                                </div>
                                <div class="video-description">
                                    <p>${video.snippet.description.replace(/\n/g, '<br>')}</p>
                                </div>
                            `;
                        }
                        
                        // Cargar comentarios
                        fetch(`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=5&key=${apiKey}`)
                            .then(response => response.json())
                            .then(commentsData => {
                                if (commentsData.items && commentsData.items.length > 0) {
                                    let commentsHtml = '<div class="video-comments"><h4>Comentarios</h4>';
                                    
                                    commentsData.items.forEach(item => {
                                        const comment = item.snippet.topLevelComment.snippet;
                                        commentsHtml += `
                                            <div class="comment">
                                                <img src="${comment.authorProfileImageUrl}" alt="${comment.authorDisplayName}">
                                                <div>
                                                    <strong>${comment.authorDisplayName}</strong>
                                                    <p>${comment.textDisplay}</p>
                                                </div>
                                            </div>
                                        `;
                                    });
                                    
                                    commentsHtml += '</div>';
                                    videoInfo.insertAdjacentHTML('beforeend', commentsHtml);
                                }
                            })
                            .catch(error => {
                                console.error('Error fetching comments:', error);
                            });
                    } else {
                        const videoInfo = document.getElementById('video-info');
                        if (videoInfo) {
                            videoInfo.innerHTML = '<p>No se pudieron cargar los detalles del video.</p>';
                        }
                    }
                })
                .catch(error => {
                    console.error('Error fetching video details:', error);
                    const videoInfo = document.getElementById('video-info');
                    if (videoInfo) {
                        videoInfo.innerHTML = `<p>Error al cargar los detalles: ${error.message}</p>`;
                    }
                });
        }
    }
    
    // Función para a��adir estilos al modal
    function addModalStyles() {
        // Verificar si los estilos ya existen
        if (document.getElementById('modal-styles')) return;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'modal-styles';
        styleElement.textContent = `
            .modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: rgba(0,0,0,0.8);
            }
            .modal-content {
                background-color: #fefefe;
                margin: 5% auto;
                padding: 20px;
                border: 1px solid #888;
                width: 80%;
                max-width: 800px;
                border-radius: 8px;
            }
            .close {
                color: #aaa;
                float: right;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
            }
            .close:hover {
                color: black;
            }
            .video-container {
                position: relative;
                padding-bottom: 56.25%; /* 16:9 aspect ratio */
                height: 0;
                overflow: hidden;
                margin-bottom: 15px;
            }
            .video-container iframe {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }
            .video-details {
                margin-top: 15px;
            }
            .video-stats {
                color: #606060;
                margin-bottom: 10px;
            }
            .video-stats span {
                margin-right: 15px;
            }
            .video-description {
                margin-bottom: 20px;
                max-height: 200px;
                overflow-y: auto;
            }
            .video-comments h4 {
                margin-bottom: 10px;
            }
            .comment {
                display: flex;
                margin-bottom: 15px;
            }
            .comment img {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                margin-right: 10px;
            }
        `;
        document.head.appendChild(styleElement);
    }
    
    // Implementación de las plantillas
    
    // Plantilla 3: Single Video
    function renderSingleVideo(container, config) {
        // Verificar que tenemos un ID de video
        if (!config.videoId) {
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: red;"><h3>Error</h3><p>No se proporcionó un ID de video válido</p></div>';
            return;
        }
        
        // Cargar información del video
        fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${config.videoId}&key=${config.apiKey}`)
            .then(response => response.json())
            .then(data => {
                if (data.items && data.items.length > 0) {
                    const video = data.items[0];
                    
                    // Formatear fecha de publicación
                    const publishedDate = new Date(video.snippet.publishedAt);
                    const formattedDate = publishedDate.toLocaleDateString();
                    
                    // Obtener una descripci��n corta (2 líneas)
                    const shortDescription = video.snippet.description.split('\n').slice(0, 2).join('\n');
                    
                    // Crear HTML para la plantilla de video único
                    container.innerHTML = `
                        <div style="max-width: 700px; margin: 0 auto;">
                            <div style="position: relative; width: 100%; height: 400px; border-radius: 8px; overflow: hidden; cursor: pointer; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" data-video-id="${config.videoId}" data-title="${video.snippet.title}">
                                <img src="${video.snippet.thumbnails.maxres ? video.snippet.thumbnails.maxres.url : video.snippet.thumbnails.high.url}" alt="${video.snippet.title}" style="width: 100%; height: 100%; object-fit: cover;">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 68px; height: 68px; background-color: rgba(0,0,0,0.7); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                    <svg viewBox="0 0 24 24" width="40" height="40"><path d="M8,5.14V19.14L19,12.14L8,5.14Z" fill="white"></path></svg>
                                </div>
                                <div style="position: absolute; bottom: 10px; right: 10px; background-color: rgba(0,0,0,0.7); color: white; padding: 3px 8px; border-radius: 3px; font-size: 14px; font-weight: 500;">
                                    ${formatDuration(video.contentDetails.duration)}
                                </div>
                            </div>
                            
                            <div style="padding: 15px 0;">
                                <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">${video.snippet.title}</h2>
                                <div style="color: #606060; font-size: 14px; margin-bottom: 10px;">${formattedDate}</div>
                                <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">
                                    ${shortDescription}
                                </p>
                                <div style="display: flex; color: #606060; font-size: 14px;">
                                    <div style="margin-right: 15px;">${formatNumber(video.statistics.viewCount)} Views</div>
                                    <div style="margin-right: 15px;">${formatNumber(video.statistics.likeCount)} Likes</div>
                                    <div>${formatNumber(video.statistics.commentCount)} Comments</div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    // Añadir event listener para reproducir el video
                    const thumbnailContainer = container.querySelector('[data-video-id]');
                    thumbnailContainer.addEventListener('click', function() {
                        const videoId = this.getAttribute('data-video-id');
                        const title = this.getAttribute('data-title');
                        showModal(videoId, title, config.apiKey);
                    });
                } else {
                    container.innerHTML = '<div style="text-align: center; padding: 20px; color: red;"><h3>Error al cargar el video</h3><p>Video no encontrado</p></div>';
                }
            })
            .catch(error => {
                container.innerHTML = `<div style="text-align: center; padding: 20px; color: red;"><h3>Error al cargar el video</h3><p>${error.message}</p></div>`;
            });
    }
    
    // Plantilla 4: YouTube Subscribe
    function renderYouTubeSubscribe(container, config) {
        // Mostrar mensaje de carga
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #606060;">Cargando información del canal...</div>';
        
        // Determinar qué ID usar para cargar el canal
        const channelIdOrUsername = config.channelId || config.username || config.videoId;
        
        // Si tenemos un ID de video, primero obtenemos el canal
        if (config.videoId && !config.channelId && !config.username) {
            fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${config.videoId}&key=${config.apiKey}`)
                .then(response => response.json())
                .then(data => {
                    if (data.items && data.items.length > 0) {
                        const channelId = data.items[0].snippet.channelId;
                        loadSubscribeButton(channelId);
                    } else {
                        container.innerHTML = '<div style="text-align: center; padding: 20px; color: red;"><h3>Error</h3><p>No se pudo obtener información del canal a partir del video</p></div>';
                    }
                })
                .catch(error => {
                    container.innerHTML = `<div style="text-align: center; padding: 20px; color: red;"><h3>Error</h3><p>${error.message}</p></div>`;
                });
        } else {
            loadSubscribeButton(channelIdOrUsername);
        }
        
        function loadSubscribeButton(channelIdOrUsername) {
            // Determinar si es un ID de canal o un nombre de usuario
            const isChannelId = channelIdOrUsername.startsWith('UC');
            const apiUrl = isChannelId 
                ? `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelIdOrUsername}&key=${config.apiKey}`
                : `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forUsername=${channelIdOrUsername.replace('@', '')}&key=${config.apiKey}`;
            
            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.items && data.items.length > 0) {
                        const channel = data.items[0];
                        
                        // Crear HTML para el botón de suscripción
                        container.innerHTML = `
                            <div style="max-width: 400px; margin: 0 auto;">
                                <div style="display: flex; align-items: center; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                                    <div style="width: 50px; height: 50px; border-radius: 50%; overflow: hidden; margin-right: 15px; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                        <img src="${channel.snippet.thumbnails.default.url}" alt="${channel.snippet.title}" style="width: 100%; height: 100%; object-fit: cover;">
                                    </div>
                                    <div style="flex-grow: 1;">
                                        <h3 style="margin: 0 0 5px 0; font-size: 16px; font-weight: 500; color: #0a0a0a;">${channel.snippet.title}</h3>
                                        <p style="margin: 0; color: #606060; font-size: 14px;">${formatNumber(channel.statistics.subscriberCount)} suscriptores</p>
                                    </div>
                                    <button class="subscribe-btn" style="background-color: #cc0000; color: white; border: none; border-radius: 2px; padding: 10px 16px; font-size: 14px; font-weight: 500; cursor: pointer;">Suscribirse</button>
                                </div>
                            </div>
                        `;
                        
                        // Añadir event listener para el botón de suscripción
                        const subscribeBtn = container.querySelector('.subscribe-btn');
                        subscribeBtn.addEventListener('click', function() {
                            window.open(`https://www.youtube.com/channel/${channel.id}?sub_confirmation=1`, '_blank');
                            
                            // Cambiar el aspecto del botón (solo visual, no afecta la suscripción real)
                            this.style.backgroundColor = '#f1f1f1';
                            this.style.color = '#606060';
                            this.textContent = 'Suscrito';
                        });
                    } else {
                        container.innerHTML = '<div style="text-align: center; padding: 20px; color: red;"><h3>Error</h3><p>No se encontró el canal</p></div>';
                    }
                })
                .catch(error => {
                    container.innerHTML = `<div style="text-align: center; padding: 20px; color: red;"><h3>Error</h3><p>${error.message}</p></div>`;
                });
        }
    }
    
    // Plantillas pendientes de implementar
    function renderYouTubeChannel(container, config) {
        container.innerHTML = '<div style="text-align: center; padding: 20px;"><p>Plantilla de YouTube Channel en desarrollo</p></div>';
    }
    
    function renderVideoGrid(container, config) {
        container.innerHTML = '<div style="text-align: center; padding: 20px;"><p>Plantilla de Video Grid en desarrollo</p></div>';
    }
    
    function renderVideoGallery(container, config) {
        container.innerHTML = '<div style="text-align: center; padding: 20px;"><p>Plantilla de Video Gallery en desarrollo</p></div>';
    }
    
    function renderVideoList(container, config) {
        container.innerHTML = '<div style="text-align: center; padding: 20px;"><p>Plantilla de Video List en desarrollo</p></div>';
    }
})();