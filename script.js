document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const templateOptions = document.querySelectorAll('.template-option');
    const selectBtn = document.getElementById('select-btn');
    const searchContainer = document.getElementById('search-container');
    const videoUrlInput = document.getElementById('video-url');
    const searchBtn = document.getElementById('search-btn');
    const templatePreview = document.getElementById('template-preview');
    const embedBtn = document.getElementById('embed-btn');
    
    // Variables de estado
    let selectedTemplate = null;
    let currentVideoId = null;
    let currentChannelId = null;
    let currentUsername = null;
    
    // Añadir event listeners a las opciones de plantilla
    templateOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Quitar la clase 'selected' de todas las opciones
            templateOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Añadir la clase 'selected' a la opción clickeada
            this.classList.add('selected');
            
            // Guardar la plantilla seleccionada
            selectedTemplate = this.getAttribute('data-template');
            
            console.log('Plantilla seleccionada:', selectedTemplate);
        });
    });
    
    // Event listener para el botón de selección
    selectBtn.addEventListener('click', function() {
        if (!selectedTemplate) {
            alert('Por favor, selecciona una plantilla primero.');
            return;
        }
        
        // Mostrar el contenedor de búsqueda
        searchContainer.style.display = 'block';
        
        // Actualizar el placeholder según la plantilla seleccionada
        switch(selectedTemplate) {
            case '1': // YouTube Channel
                videoUrlInput.placeholder = 'Ingresa URL del canal o @username...';
                break;
            case '2': // Video Grid
                videoUrlInput.placeholder = 'Ingresa URL del canal o playlist...';
                break;
            case '3': // Single Video
                videoUrlInput.placeholder = 'Ingresa URL del video...';
                break;
            case '4': // YouTube Subscribe
                videoUrlInput.placeholder = 'Ingresa URL del canal...';
                break;
            case '5': // Video Gallery
                videoUrlInput.placeholder = 'Ingresa URL del canal o playlist...';
                break;
            case '7': // Video List
                videoUrlInput.placeholder = 'Ingresa URL del canal o playlist...';
                break;
        }
    });
    
    // Event listener para el botón de búsqueda
    searchBtn.addEventListener('click', function() {
        const url = videoUrlInput.value.trim();
        
        if (!url) {
            alert('Por favor, ingresa una URL válida.');
            return;
        }
        
        // Extraer información de la URL
        const { videoId, channelId, username } = extractYouTubeInfo(url);
        
        // Guardar la información extraída
        currentVideoId = videoId;
        currentChannelId = channelId;
        currentUsername = username;
        
        // Cargar la plantilla seleccionada con la información extraída
        loadSelectedTemplate(selectedTemplate, { videoId, channelId, username, url });
        
        // Mostrar el botón de generar código embed
        embedBtn.style.display = 'block';
    });
    
    // Event listener para la tecla Enter en el input de URL
    videoUrlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
    
    // Función para extraer informaci��n de una URL de YouTube
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
        
        console.log('Extracted info:', { videoId, channelId, username });
        return { videoId, channelId, username };
    }
    
    // Función para cargar la plantilla seleccionada
    function loadSelectedTemplate(templateId, { videoId, channelId, username, url }) {
        console.log('Loading template:', templateId, 'with data:', { videoId, channelId, username, url });
        
        switch(templateId) {
            case '1': // YouTube Channel
                if (channelId) {
                    loadYouTubeChannel(channelId);
                } else if (username) {
                    loadYouTubeChannel(username);
                } else if (videoId) {
                    // Si solo tenemos un ID de video, intentamos obtener el canal a partir de él
                    loadYouTubeChannel(videoId);
                } else {
                    alert('No se pudo determinar el canal. Por favor, ingresa una URL de canal válida.');
                }
                break;
                
            case '2': // Video Grid
                if (channelId) {
                    loadVideoGrid(channelId);
                } else if (username) {
                    loadVideoGrid(username);
                } else if (videoId) {
                    // Si solo tenemos un ID de video, intentamos obtener el canal a partir de él
                    loadVideoGrid(videoId);
                } else {
                    alert('No se pudo determinar el canal o playlist. Por favor, ingresa una URL válida.');
                }
                break;
                
            case '3': // Single Video
                if (videoId) {
                    loadSingleVideo(videoId);
                } else {
                    alert('No se pudo determinar el ID del video. Por favor, ingresa una URL de video válida.');
                }
                break;
                
            case '4': // YouTube Subscribe
                if (channelId) {
                    loadYouTubeSubscribe(channelId);
                } else if (username) {
                    loadYouTubeSubscribe(username);
                } else if (videoId) {
                    // Si solo tenemos un ID de video, intentamos obtener el canal a partir de él
                    loadYouTubeSubscribe(videoId);
                } else {
                    alert('No se pudo determinar el canal. Por favor, ingresa una URL de canal válida.');
                }
                break;
                
            case '5': // Video Gallery
                if (channelId) {
                    loadVideoGallery(channelId);
                } else if (username) {
                    loadVideoGallery(username);
                } else if (videoId) {
                    // Si solo tenemos un ID de video, intentamos obtener el canal a partir de él
                    loadVideoGallery(videoId);
                } else {
                    alert('No se pudo determinar el canal o playlist. Por favor, ingresa una URL válida.');
                }
                break;
                
            case '7': // Video List
                if (channelId) {
                    loadVideoList(channelId);
                } else if (username) {
                    loadVideoList(username);
                } else if (videoId) {
                    // Si solo tenemos un ID de video, intentamos obtener el canal a partir de él
                    loadVideoList(videoId);
                } else {
                    alert('No se pudo determinar el canal o playlist. Por favor, ingresa una URL válida.');
                }
                break;
                
            default:
                alert('Plantilla no implementada.');
        }
    }
    
    // Event listener para el botón de generar código embed
    embedBtn.addEventListener('click', function() {
        if (!selectedTemplate) {
            alert('Por favor, selecciona una plantilla primero.');
            return;
        }
        
        // Generar el código embed
        const embedCode = generateEmbedCode(selectedTemplate, {
            videoId: currentVideoId,
            channelId: currentChannelId,
            username: currentUsername
        });
        
        // Mostrar el código embed
        const embedModal = document.createElement('div');
        embedModal.className = 'embed-modal';
        embedModal.innerHTML = `
            <div class="embed-modal-content">
                <span class="embed-modal-close">&times;</span>
                <h3>Código Embed</h3>
                <p>Copia y pega este código en tu sitio web:</p>
                <textarea readonly>${embedCode}</textarea>
                <button class="copy-btn">Copiar Código</button>
            </div>
        `;
        
        document.body.appendChild(embedModal);
        
        // Event listener para cerrar el modal
        const closeBtn = embedModal.querySelector('.embed-modal-close');
        closeBtn.addEventListener('click', function() {
            document.body.removeChild(embedModal);
        });
        
        // Event listener para copiar el código
        const copyBtn = embedModal.querySelector('.copy-btn');
        const textarea = embedModal.querySelector('textarea');
        
        copyBtn.addEventListener('click', function() {
            textarea.select();
            document.execCommand('copy');
            copyBtn.textContent = '¡Copiado!';
            setTimeout(() => {
                copyBtn.textContent = 'Copiar Código';
            }, 2000);
        });
    });
});