// Función para generar el código embed corto
function generateEmbedCode(templateId, config) {
    // Convertir el objeto de configuración a JSON y escapar comillas
    const configStr = JSON.stringify(config).replace(/"/g, '&quot;');
    
    // Generar el código HTML con la URL de GitHub Pages
    return `<!-- YouTube Embed - Plantilla #${templateId} -->
<script src="https://jordanrojastarrillo.github.io/caso5Embed/youtube-embed.js" async></script>
<div class="youtube-embed" data-template="${templateId}" data-config="${configStr}"></div>`;
}

// Función para mostrar el código embed al usuario
function showEmbedCodeModal(embedCode) {
    // Eliminar modal existente si hay uno
    const existingModal = document.querySelector('.embed-modal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    
    // Crear el modal
    const modal = document.createElement('div');
    modal.className = 'embed-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
    modal.style.zIndex = '9999';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    
    // Crear el contenido del modal
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.borderRadius = '8px';
    modalContent.style.width = '90%';
    modalContent.style.maxWidth = '600px';
    modalContent.style.padding = '20px';
    modalContent.style.position = 'relative';
    
    // Crear el botón de cierre
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '15px';
    closeButton.style.fontSize = '24px';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.cursor = 'pointer';
    
    // Crear el título
    const title = document.createElement('h3');
    title.textContent = 'Código Embed';
    title.style.marginTop = '0';
    
    // Crear el área de texto con el código
    const codeArea = document.createElement('textarea');
    codeArea.value = embedCode;
    codeArea.style.width = '100%';
    codeArea.style.height = '120px';
    codeArea.style.padding = '10px';
    codeArea.style.marginBottom = '15px';
    codeArea.style.fontFamily = 'monospace';
    codeArea.style.fontSize = '14px';
    codeArea.style.border = '1px solid #ddd';
    codeArea.style.borderRadius = '4px';
    codeArea.readOnly = true;
    
    // Crear el botón de copiar
    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copiar Código';
    copyButton.style.backgroundColor = '#4285f4';
    copyButton.style.color = 'white';
    copyButton.style.border = 'none';
    copyButton.style.padding = '10px 15px';
    copyButton.style.borderRadius = '4px';
    copyButton.style.cursor = 'pointer';
    
    // Añadir event listener para copiar el código
    copyButton.addEventListener('click', function() {
        codeArea.select();
        document.execCommand('copy');
        this.textContent = '¡Copiado!';
        setTimeout(() => {
            this.textContent = 'Copiar Código';
        }, 2000);
    });
    
    // Ensamblar el modal
    modalContent.appendChild(closeButton);
    modalContent.appendChild(title);
    modalContent.appendChild(codeArea);
    modalContent.appendChild(copyButton);
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

// Modificar el event listener del botón de generar código embed
document.getElementById('embed-btn').addEventListener('click', function() {
    // Obtener la plantilla seleccionada
    const selectedTemplate = document.querySelector('.template-option.selected');
    if (!selectedTemplate) {
        alert('Por favor, selecciona una plantilla primero.');
        return;
    }
    
    const templateId = selectedTemplate.getAttribute('data-template');
    
    // Obtener los datos necesarios según la plantilla
    const videoUrlInput = document.getElementById('video-url');
    if (!videoUrlInput || !videoUrlInput.value) {
        alert('Por favor, ingresa una URL de YouTube.');
        return;
    }
    
    const url = videoUrlInput.value.trim();
    const { videoId, channelId, username } = extractYouTubeInfo(url);
    
    // Crear el objeto de configuración según la plantilla
    let config = {
        apiKey: YOUTUBE_API_KEY
    };
    
    if (videoId) config.videoId = videoId;
    if (channelId) config.channelId = channelId;
    if (username) config.username = username;
    
    // Generar el código embed
    const embedCode = generateEmbedCode(templateId, config);
    
    // Mostrar el código embed al usuario
    showEmbedCodeModal(embedCode);
});