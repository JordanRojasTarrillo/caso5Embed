// Generador de código embed con código inline para las plantillas de YouTube

/**
 * Genera el código embed para la plantilla seleccionada
 * @param {string} templateId - ID de la plantilla seleccionada
 * @param {Object} data - Datos para la plantilla (videoId, channelId, username)
 * @returns {string} - Código HTML para embeber
 */
function generateEmbedCode(templateId, data) {
    // Generar un ID único para el embed
    const uniqueId = 'yt-embed-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    
    // Crear el objeto de configuración
    const config = {
        templateId: templateId,
        apiKey: YOUTUBE_API_KEY,
        ...data
    };
    
    // Convertir la configuración a JSON
    const configJSON = JSON.stringify(config);
    
    // Crear el código embed con script inline
    let embedCode = '';
    
    switch(templateId) {
        case '3': // Single Video
            embedCode = `<!-- YouTube Single Video Embed -->
<div id="${uniqueId}" style="max-width: 700px; margin: 0 auto;"></div>
<script>
(function() {
    // Configuración
    var config = ${configJSON};
    var container = document.getElementById("${uniqueId}");
    
    // Función para formatear números
    function formatNumber(num) {
        if (!num) return '0';
        var number = parseInt(num);
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
        var match = duration.match(/PT(?:(\\d+)H)?(?:(\\d+)M)?(?:(\\d+)S)?/);
        if (!match) return '';
        var hours = match[1] ? match[1] : '0';
        var minutes = match[2] ? match[2].padStart(2, '0') : '00';
        var seconds = match[3] ? match[3].padStart(2, '0') : '00';
        return hours !== '0' ? hours + ':' + minutes + ':' + seconds : minutes + ':' + seconds;
    }
    
    // Función para mostrar modal con video
    function showModal(videoId, title) {
        // Eliminar modal existente si hay uno
        var existingModal = document.querySelector('.youtube-modal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }
        
        // Crear el modal
        var modal = document.createElement('div');
        modal.className = 'youtube-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        modal.style.zIndex = '9999';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        
        // Crear el contenido del modal
        var modalContent = document.createElement('div');
        modalContent.style.backgroundColor = 'white';
        modalContent.style.borderRadius = '8px';
        modalContent.style.width = '90%';
        modalContent.style.maxWidth = '800px';
        modalContent.style.maxHeight = '90vh';
        modalContent.style.overflow = 'auto';
        modalContent.style.position = 'relative';
        
        // Crear el botón de cierre
        var closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '15px';
        closeButton.style.fontSize = '24px';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.cursor = 'pointer';
        closeButton.style.zIndex = '10';
        
        // Crear el contenedor del video
        var videoContainer = document.createElement('div');
        videoContainer.style.position = 'relative';
        videoContainer.style.paddingBottom = '56.25%';
        videoContainer.style.height = '0';
        videoContainer.style.overflow = 'hidden';
        
        // Crear el iframe para el video
        var iframe = document.createElement('iframe');
        iframe.src = 'https://www.youtube.com/embed/' + videoId;
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.setAttribute('allowfullscreen', '');
        
        // Crear el contenedor para los detalles del video
        var videoDetails = document.createElement('div');
        videoDetails.style.padding = '20px';
        
        // Crear el título del video
        var videoTitle = document.createElement('h3');
        videoTitle.textContent = title || 'Cargando...';
        videoTitle.style.margin = '0 0 10px 0';
        
        // Crear el contenedor para la información del video
        var videoInfo = document.createElement('div');
        videoInfo.textContent = 'Cargando detalles del video...';
        
        // Ensamblar el modal
        videoContainer.appendChild(iframe);
        videoDetails.appendChild(videoTitle);
        videoDetails.appendChild(videoInfo);
        
        modalContent.appendChild(closeButton);
        modalContent.appendChild(videoContainer);
        modalContent.appendChild(videoDetails);
        
        modal.appendChild(modalContent);
        
        // Añadir el modal al body
        document.body.appendChild(modal);
        
        // Configurar eventos de cierre
        closeButton.addEventListener('click', function() {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    // Verificar que tenemos un ID de video
    if (!config.videoId) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: red;"><h3>Error</h3><p>No se proporcionó un ID de video válido</p></div>';
        return;
    }
    
    // Cargar información del video
    fetch('https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=' + config.videoId + '&key=' + config.apiKey)
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data.items && data.items.length > 0) {
                var video = data.items[0];
                
                // Formatear fecha de publicación
                var publishedDate = new Date(video.snippet.publishedAt);
                var formattedDate = publishedDate.toLocaleDateString();
                
                // Obtener una descripción corta (2 líneas)
                var shortDescription = video.snippet.description.split('\\n').slice(0, 2).join('\\n');
                
                // Crear HTML para la plantilla de video único
                container.innerHTML = 
                    '<div style="position: relative; width: 100%; height: 400px; border-radius: 8px; overflow: hidden; cursor: pointer; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" data-video-id="' + config.videoId + '" data-title="' + video.snippet.title + '">' +
                    '<img src="' + (video.snippet.thumbnails.maxres ? video.snippet.thumbnails.maxres.url : video.snippet.thumbnails.high.url) + '" alt="' + video.snippet.title + '" style="width: 100%; height: 100%; object-fit: cover;">' +
                    '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 68px; height: 68px; background-color: rgba(0,0,0,0.7); border-radius: 50%; display: flex; align-items: center; justify-content: center;">' +
                    '<svg viewBox="0 0 24 24" width="40" height="40"><path d="M8,5.14V19.14L19,12.14L8,5.14Z" fill="white"></path></svg>' +
                    '</div>' +
                    '<div style="position: absolute; bottom: 10px; right: 10px; background-color: rgba(0,0,0,0.7); color: white; padding: 3px 8px; border-radius: 3px; font-size: 14px; font-weight: 500;">' + 
                    formatDuration(video.contentDetails.duration) + 
                    '</div>' +
                    '</div>' +
                    
                    '<div style="padding: 15px 0;">' +
                    '<h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">' + video.snippet.title + '</h2>' +
                    '<div style="color: #606060; font-size: 14px; margin-bottom: 10px;">' + formattedDate + '</div>' +
                    '<p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">' +
                    shortDescription +
                    '</p>' +
                    '<div style="display: flex; color: #606060; font-size: 14px;">' +
                    '<div style="margin-right: 15px;">' + formatNumber(video.statistics.viewCount) + ' Views</div>' +
                    '<div style="margin-right: 15px;">' + formatNumber(video.statistics.likeCount) + ' Likes</div>' +
                    '<div>' + formatNumber(video.statistics.commentCount) + ' Comments</div>' +
                    '</div>' +
                    '</div>';
                
                // Añadir event listener para reproducir el video
                var thumbnailContainer = container.querySelector('[data-video-id]');
                thumbnailContainer.addEventListener('click', function() {
                    var videoId = this.getAttribute('data-video-id');
                    var title = this.getAttribute('data-title');
                    showModal(videoId, title);
                });
            } else {
                container.innerHTML = '<div style="text-align: center; padding: 20px; color: red;"><h3>Error al cargar el video</h3><p>Video no encontrado</p></div>';
            }
        })
        .catch(function(error) {
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: red;"><h3>Error al cargar el video</h3><p>' + error.message + '</p></div>';
        });
})();
</script>`;
            break;
            
        case '4': // YouTube Subscribe
            embedCode = `<!-- YouTube Subscribe Button Embed -->
<div id="${uniqueId}" style="max-width: 400px; margin: 0 auto;"></div>
<script>
(function() {
    // Configuración
    var config = ${configJSON};
    var container = document.getElementById("${uniqueId}");
    
    // Función para formatear números
    function formatNumber(num) {
        if (!num) return '0';
        var number = parseInt(num);
        if (number >= 1000000) {
            return (number / 1000000).toFixed(1) + 'M';
        } else if (number >= 1000) {
            return (number / 1000).toFixed(1) + 'K';
        } else {
            return number.toString();
        }
    }
    
    // Mostrar mensaje de carga
    container.innerHTML = '<div style="text-align: center; padding: 20px; color: #606060;">Cargando información del canal...</div>';
    
    // Determinar qué ID usar para cargar el canal
    var channelIdOrUsername = config.channelId || config.username || config.videoId;
    
    // Si tenemos un ID de video, primero obtenemos el canal
    if (config.videoId && !config.channelId && !config.username) {
        fetch('https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + config.videoId + '&key=' + config.apiKey)
            .then(function(response) { return response.json(); })
            .then(function(data) {
                if (data.items && data.items.length > 0) {
                    var channelId = data.items[0].snippet.channelId;
                    loadSubscribeButton(channelId);
                } else {
                    container.innerHTML = '<div style="text-align: center; padding: 20px; color: red;"><h3>Error</h3><p>No se pudo obtener información del canal a partir del video</p></div>';
                }
            })
            .catch(function(error) {
                container.innerHTML = '<div style="text-align: center; padding: 20px; color: red;"><h3>Error</h3><p>' + error.message + '</p></div>';
            });
    } else {
        loadSubscribeButton(channelIdOrUsername);
    }
    
    function loadSubscribeButton(channelIdOrUsername) {
        // Determinar si es un ID de canal o un nombre de usuario
        var isChannelId = channelIdOrUsername.startsWith('UC');
        var apiUrl = isChannelId 
            ? 'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=' + channelIdOrUsername + '&key=' + config.apiKey
            : 'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forUsername=' + channelIdOrUsername.replace('@', '') + '&key=' + config.apiKey;
        
        fetch(apiUrl)
            .then(function(response) { return response.json(); })
            .then(function(data) {
                if (data.items && data.items.length > 0) {
                    var channel = data.items[0];
                    
                    // Crear HTML para el botón de suscripción
                    container.innerHTML = 
                        '<div style="display: flex; align-items: center; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">' +
                        '<div style="width: 50px; height: 50px; border-radius: 50%; overflow: hidden; margin-right: 15px; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">' +
                        '<img src="' + channel.snippet.thumbnails.default.url + '" alt="' + channel.snippet.title + '" style="width: 100%; height: 100%; object-fit: cover;">' +
                        '</div>' +
                        '<div style="flex-grow: 1;">' +
                        '<h3 style="margin: 0 0 5px 0; font-size: 16px; font-weight: 500; color: #0a0a0a;">' + channel.snippet.title + '</h3>' +
                        '<p style="margin: 0; color: #606060; font-size: 14px;">' + formatNumber(channel.statistics.subscriberCount) + ' suscriptores</p>' +
                        '</div>' +
                        '<button class="subscribe-btn" style="background-color: #cc0000; color: white; border: none; border-radius: 2px; padding: 10px 16px; font-size: 14px; font-weight: 500; cursor: pointer;">Suscribirse</button>' +
                        '</div>';
                    
                    // Añadir event listener para el botón de suscripción
                    var subscribeBtn = container.querySelector('.subscribe-btn');
                    subscribeBtn.addEventListener('click', function() {
                        window.open('https://www.youtube.com/channel/' + channel.id + '?sub_confirmation=1', '_blank');
                        
                        // Cambiar el aspecto del botón (solo visual, no afecta la suscripción real)
                        this.style.backgroundColor = '#f1f1f1';
                        this.style.color = '#606060';
                        this.textContent = 'Suscrito';
                    });
                } else {
                    container.innerHTML = '<div style="text-align: center; padding: 20px; color: red;"><h3>Error</h3><p>No se encontró el canal</p></div>';
                }
            })
            .catch(function(error) {
                container.innerHTML = '<div style="text-align: center; padding: 20px; color: red;"><h3>Error</h3><p>' + error.message + '</p></div>';
            });
    }
})();
</script>`;
            break;
            
        // Añadir más casos para otras plantillas
        default:
            embedCode = `<!-- YouTube Template Embed - Plantilla #${templateId} -->
<div id="${uniqueId}" style="text-align: center; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 600px; margin: 0 auto;">
    <h3>Plantilla #${templateId}</h3>
    <p>Esta plantilla está en desarrollo.</p>
</div>`;
    }
    
    return embedCode;
}

/**
 * Muestra un modal con el código embed generado
 * @param {string} embedCode - Código HTML para embeber
 */
function showEmbedCodeModal(embedCode) {
    // Crear el modal
    const modal = document.createElement('div');
    modal.className = 'embed-code-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.style.zIndex = '9999';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    
    // Crear el contenido del modal
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#fff';
    modalContent.style.borderRadius = '8px';
    modalContent.style.padding = '20px';
    modalContent.style.width = '80%';
    modalContent.style.maxWidth = '600px';
    modalContent.style.maxHeight = '80vh';
    modalContent.style.overflow = 'auto';
    
    // Crear el título
    const title = document.createElement('h3');
    title.textContent = 'Código Embed';
    title.style.marginTop = '0';
    
    // Crear la descripción
    const description = document.createElement('p');
    description.textContent = 'Copia y pega este código en el lugar deseado de tu sitio web (editor HTML, plantilla, tema, etc.).';
    
    // Crear el área de texto con el código
    const textarea = document.createElement('textarea');
    textarea.value = embedCode;
    textarea.style.width = '100%';
    textarea.style.height = '150px';
    textarea.style.padding = '10px';
    textarea.style.marginBottom = '15px';
    textarea.style.fontFamily = 'monospace';
    textarea.style.fontSize = '12px';
    textarea.style.border = '1px solid #ddd';
    textarea.style.borderRadius = '4px';
    textarea.readOnly = true;
    
    // Crear el botón de copiar
    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copiar Código';
    copyButton.style.padding = '10px 15px';
    copyButton.style.backgroundColor = '#4285f4';
    copyButton.style.color = 'white';
    copyButton.style.border = 'none';
    copyButton.style.borderRadius = '4px';
    copyButton.style.cursor = 'pointer';
    
    // Crear el botón de cerrar
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cerrar';
    closeButton.style.padding = '10px 15px';
    closeButton.style.backgroundColor = '#f44336';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.marginLeft = '10px';
    
    // Añadir event listener para copiar el código
    copyButton.addEventListener('click', function() {
        textarea.select();
        document.execCommand('copy');
        copyButton.textContent = '¡Copiado!';
        setTimeout(() => {
            copyButton.textContent = 'Copiar Código';
        }, 2000);
    });
    
    // Añadir event listener para cerrar el modal
    closeButton.addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Ensamblar el modal
    modalContent.appendChild(title);
    modalContent.appendChild(description);
    modalContent.appendChild(textarea);
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'flex-start';
    
    buttonContainer.appendChild(copyButton);
    buttonContainer.appendChild(closeButton);
    
    modalContent.appendChild(buttonContainer);
    modal.appendChild(modalContent);
    
    // Añadir el modal al body
    document.body.appendChild(modal);
    
    // Seleccionar automáticamente el código para facilitar la copia
    textarea.select();
}

// Conectar el botón de generar código embed con la función
document.addEventListener('DOMContentLoaded', function() {
    const embedBtn = document.getElementById('embed-btn');
    if (embedBtn) {
        embedBtn.addEventListener('click', function() {
            // Obtener la plantilla seleccionada
            const selectedTemplate = document.querySelector('.template-option.selected');
            if (!selectedTemplate) {
                alert('Por favor, selecciona una plantilla primero.');
                return;
            }
            
            const templateId = selectedTemplate.getAttribute('data-template');
            
            // Obtener los datos necesarios según la plantilla
            let data = {};
            
            // Obtener la URL ingresada
            const videoUrlInput = document.getElementById('video-url');
            if (videoUrlInput && videoUrlInput.value) {
                const url = videoUrlInput.value.trim();
                const { videoId, channelId, username } = extractYouTubeInfo(url);
                data = { videoId, channelId, username };
            }
            
            // Generar el código embed
            const embedCode = generateEmbedCode(templateId, data);
            
            // Mostrar el modal con el código
            showEmbedCodeModal(embedCode);
        });
    }
    
    // Función auxiliar para extraer información de una URL de YouTube
    function extractYouTubeInfo(url) {
        let videoId = null;
        let channelId = null;
        let username = null;
        
        // Intentar extraer ID de video
        const videoRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const videoMatch = url.match(videoRegex);
        
        if (videoMatch && videoMatch[1]) {
            videoId = videoMatch[1];
        }
        
        // Intentar extraer ID de canal o nombre de usuario
        if (url.includes('youtube.com/channel/')) {
            const channelRegex = /youtube\.com\/channel\/([^\/\?]+)/i;
            const channelMatch = url.match(channelRegex);
            
            if (channelMatch && channelMatch[1]) {
                channelId = channelMatch[1];
            }
        } else if (url.includes('youtube.com/c/') || url.includes('youtube.com/user/')) {
            const usernameRegex = /youtube\.com\/(?:c|user)\/([^\/\?]+)/i;
            const usernameMatch = url.match(usernameRegex);
            
            if (usernameMatch && usernameMatch[1]) {
                username = usernameMatch[1];
            }
        } else if (url.includes('youtube.com/@')) {
            const atUsernameRegex = /youtube\.com\/@([^\/\?]+)/i;
            const atUsernameMatch = url.match(atUsernameRegex);
            
            if (atUsernameMatch && atUsernameMatch[1]) {
                username = '@' + atUsernameMatch[1];
            }
        }
        
        return { videoId, channelId, username };
    }
});