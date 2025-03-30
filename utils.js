// Funciones utilitarias para todas las plantillas

// Formatear números para mostrar K, M, etc.
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

// Formatear duración del video (de ISO 8601 a formato legible)
function formatDuration(duration) {
    if (!duration) return '';
    
    // Convertir PT1H2M3S a formato legible (1:02:03)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '';
    
    const hours = match[1] ? match[1] : '0';
    const minutes = match[2] ? match[2].padStart(2, '0') : '00';
    const seconds = match[3] ? match[3].padStart(2, '0') : '00';
    
    return hours !== '0' ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
        return 'Hoy';
    } else if (diffDays === 1) {
        return 'Ayer';
    } else if (diffDays < 7) {
        return `Hace ${diffDays} días`;
    } else if (diffDays < 30) {
        return `Hace ${Math.floor(diffDays / 7)} semanas`;
    } else if (diffDays < 365) {
        return `Hace ${Math.floor(diffDays / 30)} meses`;
    } else {
        return `Hace ${Math.floor(diffDays / 365)} años`;
    }
}

// Mostrar modal con video y detalles
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
    
    // Crear el modal básico con el iframe que ya funciona
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'modal-title');
    
    // Estructura inicial del modal con el iframe que ya sabemos que funciona
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" role="button" aria-label="Close">&times;</span>
            <div class="video-container">
                <iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
            <div class="video-details">
                <h3 id="modal-title">${title || 'Cargando...'}</h3>
                <div id="video-info">
                    <div class="loading-spinner"></div>
                    <p>Cargando detalles del video...</p>
                </div>
            </div>
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
    
    // Añadir estilos para el modal si no existen
    addModalStyles();
    
    // Cargar los detalles del video
    fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                const video = data.items[0];
                const snippet = video.snippet;
                const statistics = video.statistics;
                const publishedAt = formatDate(snippet.publishedAt);
                
                // Actualizar el título si no se proporcionó uno
                if (!title) {
                    const modalTitle = document.getElementById('modal-title');
                    if (modalTitle) {
                        modalTitle.textContent = snippet.title;
                    }
                }
                
                // Actualizar la información del video
                const videoInfo = document.getElementById('video-info');
                if (videoInfo) {
                    videoInfo.innerHTML = `
                        <div class="video-header">
                            <div class="video-title-container">
                                <h3 class="video-title">${snippet.title}</h3>
                            </div>
                            <div class="video-meta">
                                <div class="video-stats">
                                    <span class="views">${formatNumber(statistics.viewCount)} visualizaciones</span>
                                    <span class="date">${publishedAt}</span>
                                </div>
                                <div class="video-actions">
                                    <button class="action-btn like-btn">
                                        <svg viewBox="0 0 24 24" width="24" height="24">
                                            <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z" fill="currentColor"></path>
                                        </svg>
                                        <span>${formatNumber(statistics.likeCount)}</span>
                                    </button>
                                    <button class="action-btn dislike-btn">
                                        <svg viewBox="0 0 24 24" width="24" height="24">
                                            <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" fill="currentColor"></path>
                                        </svg>
                                    </button>
                                    <button class="action-btn share-btn">
                                        <svg viewBox="0 0 24 24" width="24" height="24">
                                            <path d="M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z" fill="currentColor"></path>
                                        </svg>
                                        <span>Compartir</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="channel-info">
                            <div class="channel-avatar">
                                <img src="https://yt3.googleusercontent.com/ytc/${snippet.channelId}" alt="${snippet.channelTitle}" onerror="this.src='https://via.placeholder.com/48'">
                            </div>
                            <div class="channel-details">
                                <h4 class="channel-name">${snippet.channelTitle}</h4>
                            </div>
                            <button class="subscribe-btn">SUSCRIBIRSE</button>
                        </div>
                        
                        <div class="video-description">
                            <div class="description-text">
                                <p>${snippet.description.replace(/\n/g, '<br>')}</p>
                            </div>
                        </div>
                    `;
                }
                
                // Cargar comentarios
                fetch(`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=10&key=${YOUTUBE_API_KEY}`)
                    .then(response => response.json())
                    .then(commentsData => {
                        if (commentsData.items && commentsData.items.length > 0) {
                            const videoInfo = document.getElementById('video-info');
                            let commentsHtml = `
                                <div class="comments-section">
                                    <div class="comments-header">
                                        <h4>${formatNumber(statistics.commentCount)} comentarios</h4>
                                        <div class="comments-sort">
                                            <svg viewBox="0 0 24 24" width="24" height="24">
                                                <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" fill="currentColor"></path>
                                            </svg>
                                            <span>ORDENAR POR</span>
                                        </div>
                                    </div>
                                    
                                    <div class="add-comment">
                                        <div class="user-avatar">
                                            <img src="https://via.placeholder.com/40" alt="Usuario">
                                        </div>
                                        <div class="comment-input">
                                            <input type="text" placeholder="Añadir un comentario público...">
                                        </div>
                                    </div>
                                    
                                    <div class="comments-list">
                            `;
                            
                            commentsData.items.forEach(item => {
                                const comment = item.snippet.topLevelComment.snippet;
                                const commentDate = formatDate(comment.publishedAt);
                                
                                commentsHtml += `
                                    <div class="comment">
                                        <div class="comment-avatar">
                                            <img src="${comment.authorProfileImageUrl}" alt="${comment.authorDisplayName}">
                                        </div>
                                        <div class="comment-content">
                                            <div class="comment-header">
                                                <span class="comment-author">${comment.authorDisplayName}</span>
                                                <span class="comment-date">${commentDate}</span>
                                            </div>
                                            <div class="comment-text">${comment.textDisplay}</div>
                                            <div class="comment-actions">
                                                <button class="comment-like">
                                                    <svg viewBox="0 0 24 24" width="16" height="16">
                                                        <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z" fill="currentColor"></path>
                                                    </svg>
                                                    <span>${formatNumber(comment.likeCount)}</span>
                                                </button>
                                                <button class="comment-dislike">
                                                    <svg viewBox="0 0 24 24" width="16" height="16">
                                                        <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" fill="currentColor"></path>
                                                    </svg>
                                                </button>
                                                <button class="comment-reply">RESPONDER</button>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            });
                            
                            commentsHtml += `
                                    </div>
                                </div>
                            `;
                            
                            videoInfo.insertAdjacentHTML('beforeend', commentsHtml);
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching comments:', error);
                        const videoInfo = document.getElementById('video-info');
                        if (videoInfo) {
                            videoInfo.insertAdjacentHTML('beforeend', `
                                <div class="comments-section">
                                    <div class="comments-header">
                                        <h4>Comentarios</h4>
                                    </div>
                                    <p class="error-message">No se pudieron cargar los comentarios: ${error.message}</p>
                                </div>
                            `);
                        }
                    });
            } else {
                const videoInfo = document.getElementById('video-info');
                if (videoInfo) {
                    videoInfo.innerHTML = '<p class="error-message">No se pudieron cargar los detalles del video.</p>';
                }
            }
        })
        .catch(error => {
            console.error('Error fetching video details:', error);
            const videoInfo = document.getElementById('video-info');
            if (videoInfo) {
                videoInfo.innerHTML = `<p class="error-message">Error al cargar los detalles: ${error.message}</p>`;
            }
        });
}

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
            background-color: rgba(0,0,0,0.85);
            animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .modal-content {
            background-color: #ffffff;
            margin: 2% auto;
            padding: 0;
            width: 90%;
            max-width: 850px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 8px 20px rgba(0,0,0,0.3);
            animation: slideDown 0.4s ease;
        }
        @keyframes slideDown {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .close {
            color: #ffffff;
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            position: absolute;
            right: 20px;
            top: 15px;
            z-index: 10;
            background: rgba(0,0,0,0.5);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 0;
            transition: all 0.2s ease;
        }
        .close:hover {
            background: rgba(255,0,0,0.7);
            transform: scale(1.1);
        }
        .video-container {
            position: relative;
            padding-bottom: 56.25%; /* 16:9 aspect ratio */
            height: 0;
            overflow: hidden;
            background-color: #000;
        }
        .video-container iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
        }
        .video-details {
            padding: 24px;
            font-family: 'Roboto', Arial, sans-serif;
            color: #333;
        }
        .video-header {
            margin-bottom: 20px;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 20px;
        }
        .video-title {
            font-size: 20px;
            font-weight: 600;
            margin: 0 0 12px 0;
            color: #111;
            line-height: 1.4;
        }
        .video-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            margin-top: 12px;
        }
        .video-stats {
            color: #606060;
            font-size: 14px;
            display: flex;
            align-items: center;
        }
        .video-stats .views {
            font-weight: 500;
            margin-right: 8px;
            color: #333;
        }
        .video-stats .date::before {
            content: "•";
            margin: 0 8px;
            color: #999;
        }
        .video-actions {
            display: flex;
            align-items: center;
            margin-top: 10px;
        }
        .action-btn {
            background: #f5f5f5;
            border: none;
            padding: 8px 16px;
            margin-right: 10px;
            border-radius: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            color: #333;
            font-size: 14px;
            font-weight: 500;
            transition: background-color 0.2s ease;
        }
        .action-btn:last-child {
            margin-right: 0;
        }
        .action-btn svg {
            margin-right: 8px;
            width: 18px;
            height: 18px;
        }
        .action-btn:hover {
            background-color: #e0e0e0;
        }
        .like-btn {
            color: #065fd4;
        }
        .channel-info {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #e0e0e0;
        }
        .channel-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            overflow: hidden;
            margin-right: 16px;
            border: 2px solid #f0f0f0;
        }
        .channel-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        .channel-avatar:hover img {
            transform: scale(1.05);
        }
        .channel-details {
            flex-grow: 1;
        }
        .channel-name {
            margin: 0 0 4px 0;
            font-size: 16px;
            font-weight: 600;
            color: #111;
        }
        .channel-subscribers {
            font-size: 13px;
            color: #606060;
        }
        .subscribe-btn {
            background-color: #cc0000;
            color: white;
            border: none;
            padding: 10px 18px;
            border-radius: 3px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            text-transform: uppercase;
        }
        .subscribe-btn:hover {
            background-color: #b00000;
            transform: translateY(-2px);
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .video-description {
            margin-bottom: 24px;
            color: #333;
            font-size: 14px;
            line-height: 1.5;
            background-color: #f9f9f9;
            padding: 16px;
            border-radius: 8px;
        }
        .description-text {
            max-height: 120px;
            overflow: hidden;
            position: relative;
            transition: max-height 0.3s ease;
        }
        .description-text.expanded {
            max-height: none;
        }
        .description-text p {
            margin: 0 0 10px 0;
        }
        .show-more-btn {
            color: #065fd4;
            background: none;
            border: none;
            padding: 8px 0;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            display: block;
            margin-top: 8px;
        }
        .show-more-btn:hover {
            text-decoration: underline;
        }
        .comments-section {
            margin-top: 24px;
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
        }
        .comments-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }
        .comments-header h4 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #111;
        }
        .comments-sort {
            display: flex;
            align-items: center;
            color: #606060;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            padding: 6px 12px;
            border-radius: 16px;
            transition: background-color 0.2s ease;
        }
        .comments-sort:hover {
            background-color: #e0e0e0;
        }
        .comments-sort svg {
            margin-right: 8px;
        }
        .add-comment {
            display: flex;
            margin-bottom: 32px;
            align-items: flex-start;
        }
        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
            margin-right: 16px;
            border: 1px solid #e0e0e0;
        }
        .user-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .comment-input {
            flex-grow: 1;
        }
        .comment-input input {
            width: 100%;
            padding: 10px 0;
            border: none;
            border-bottom: 1px solid #e0e0e0;
            font-size: 14px;
            outline: none;
            background-color: transparent;
            transition: border-color 0.2s ease;
        }
        .comment-input input:focus {
            border-bottom-color: #065fd4;
        }
        .comments-list {
            max-height: 500px;
            overflow-y: auto;
            padding-right: 10px;
        }
        .comments-list::-webkit-scrollbar {
            width: 6px;
        }
        .comments-list::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
        }
        .comments-list::-webkit-scrollbar-thumb {
            background: #c0c0c0;
            border-radius: 10px;
        }
        .comments-list::-webkit-scrollbar-thumb:hover {
            background: #a0a0a0;
        }
        .comment {
            display: flex;
            margin-bottom: 24px;
            animation: fadeIn 0.5s ease;
        }
        .comment-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
            margin-right: 16px;
            border: 1px solid #e0e0e0;
            flex-shrink: 0;
        }
        .comment-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .comment-content {
            flex-grow: 1;
        }
        .comment-header {
            margin-bottom: 4px;
        }
        .comment-author {
            font-size: 14px;
            font-weight: 600;
            color: #111;
            margin-right: 8px;
        }
        .comment-date {
            font-size: 13px;
            color: #606060;
        }
        .comment-text {
            font-size: 14px;
            line-height: 1.5;
            color: #333;
            margin-bottom: 8px;
            word-break: break-word;
        }
        .comment-actions {
            display: flex;
            align-items: center;
        }
        .comment-like, .comment-dislike {
            background: none;
            border: none;
            padding: 6px 10px 6px 0;
            cursor: pointer;
            display: flex;
            align-items: center;
            color: #606060;
            font-size: 13px;
            transition: color 0.2s ease;
        }
        .comment-like:hover, .comment-dislike:hover {
            color: #111;
        }
        .comment-like svg, .comment-dislike svg {
            margin-right: 6px;
            width: 16px;
            height: 16px;
        }
        .comment-reply {
            background: none;
            border: none;
            padding: 6px 10px;
            margin-left: 8px;
            cursor: pointer;
            color: #606060;
            font-size: 13px;
            font-weight: 500;
            transition: color 0.2s ease;
        }
        .comment-reply:hover {
            color: #111;
        }
        .loading-spinner {
            width: 30px;
            height: 30px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #065fd4;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .error-message {
            color: #cc0000;
            text-align: center;
            padding: 20px;
            font-size: 14px;
            background-color: #ffebee;
            border-radius: 8px;
            margin-top: 20px;
        }
        
        /* Responsive styles */
        @media (max-width: 768px) {
            .modal-content {
                width: 95%;
                margin: 5% auto;
            }
            .video-meta {
                flex-direction: column;
                align-items: flex-start;
            }
            .video-actions {
                margin-top: 15px;
                width: 100%;
                justify-content: space-between;
            }
            .action-btn {
                padding: 6px 12px;
                margin-right: 5px;
            }
            .action-btn svg {
                margin-right: 4px;
            }
            .channel-info {
                flex-wrap: wrap;
            }
            .subscribe-btn {
                margin-top: 10px;
                width: 100%;
            }
            .comments-header {
                flex-direction: column;
                align-items: flex-start;
            }
            .comments-sort {
                margin-top: 10px;
            }
        }
        
        @media (max-width: 480px) {
            .video-details {
                padding: 16px;
            }
            .video-title {
                font-size: 18px;
            }
            .action-btn {
                font-size: 12px;
                padding: 6px 10px;
            }
            .action-btn svg {
                width: 16px;
                height: 16px;
            }
            .channel-avatar {
                width: 40px;
                height: 40px;
            }
            .comments-section {
                padding: 15px;
            }
        }
    `;
    document.head.appendChild(styleElement);
}