// YouTube Embed Handler
document.addEventListener('DOMContentLoaded', function() {
    // Procesar todos los embeds en la página
    const embeds = document.querySelectorAll('.youtube-template-embed');
    
    embeds.forEach(function(embed) {
        // Obtener datos de configuración
        const templateType = embed.getAttribute('data-template');
        const configData = JSON.parse(decodeURIComponent(embed.getAttribute('data-config')));
        
        // Mostrar mensaje de carga
        embed.innerHTML = '<p>Cargando contenido de YouTube...</p>';
        
        // Cargar el contenido según el tipo de plantilla
        switch(templateType) {
            case '1': // YouTube Channel
                loadYouTubeChannel(embed, configData);
                break;
            case '2': // Video Grid
                loadVideoGrid(embed, configData);
                break;
            case '3': // Single Video
                loadSingleVideo(embed, configData);
                break;
            case '4': // YouTube Subscribe
                loadYouTubeSubscribe(embed, configData);
                break;
            case '5': // Video Gallery
                loadVideoGallery(embed, configData);
                break;
            case '7': // Video List
                loadVideoList(embed, configData);
                break;
            default:
                embed.innerHTML = '<p>Tipo de plantilla no reconocido</p>';
        }
    });
    
    // Funciones para cargar cada tipo de plantilla
    async function loadYouTubeChannel(container, config) {
        try {
            // Determinar cómo buscar el canal
            let apiUrl;
            if (config.channelId) {
                apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${config.channelId}&key=${YOUTUBE_API_KEY}`;
            } else if (config.username) {
                apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&forUsername=${config.username}&key=${YOUTUBE_API_KEY}`;
            } else {
                container.innerHTML = '<p>No se proporcionó un ID de canal válido</p>';
                return;
            }
            
            // Obtener información del canal
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (!data.items || data.items.length === 0) {
                container.innerHTML = '<p>Canal no encontrado</p>';
                return;
            }
            
            const channel = data.items[0];
            
            // Obtener videos recientes
            const videosResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channel.id}&order=date&type=video&maxResults=6&key=${YOUTUBE_API_KEY}`);
            const videosData = await videosResponse.json();
            
            // Crear HTML del canal
            let html = `
                <div class="yt-channel">
                    <div class="yt-channel-header">
                        <img src="${channel.snippet.thumbnails.default.url}" alt="${channel.snippet.title}">
                        <div>
                            <h3>${channel.snippet.title}</h3>
                            <p>${formatNumber(channel.statistics.subscriberCount)} suscriptores</p>
                        </div>
                    </div>
                    <div class="yt-channel-videos">
            `;
            
            // Añadir videos
            if (videosData.items && videosData.items.length > 0) {
                videosData.items.forEach(item => {
                    html += `
                        <div class="yt-video-item" onclick="showModal('${item.id.videoId}', '${item.snippet.title}')">
                            <img src="${item.snippet.thumbnails.medium.url}" alt="${item.snippet.title}">
                            <h4>${item.snippet.title}</h4>
                        </div>
                    `;
                });
            } else {
                html += '<p>No se encontraron videos recientes</p>';
            }
            
            html += '</div></div>';
            
            // Añadir estilos básicos
            html += `
                <style>
                    .yt-channel { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; }
                    .yt-channel-header { display: flex; align-items: center; margin-bottom: 20px; }
                    .yt-channel-header img { width: 50px; height: 50px; border-radius: 50%; margin-right: 15px; }
                    .yt-channel-videos { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
                    .yt-video-item { cursor: pointer; transition: transform 0.2s; }
                    .yt-video-item:hover { transform: translateY(-5px); }
                    .yt-video-item img { width: 100%; border-radius: 8px; }
                    .yt-video-item h4 { margin: 5px 0; font-size: 14px; }
                </style>
            `;
            
            container.innerHTML = html;
        } catch (error) {
            container.innerHTML = `<p>Error al cargar el canal: ${error.message}</p>`;
        }
    }
    
    // Función para mostrar el modal con el video
    function showModal(videoId, title) {
        if (!videoId) {
            console.error('Video ID is required to show the modal.');
            return;
        }

        // Eliminar modal existente si hay uno
        const existingModal = document.querySelector('.modal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }
        
        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'modal-title');
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" role="button" aria-label="Close">&times;</span>
                <iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
                <h3 id="modal-title">${title}</h3>
            </div>
        `;
        document.body.appendChild(modal);

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

        modal.style.display = 'block';
    }
    
    // Funciones de utilidad
    function formatNumber(num) {
        if (num === null || num === undefined) return '0';
        
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        } else {
            return num.toString();
        }
    }
});
