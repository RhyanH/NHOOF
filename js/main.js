document.addEventListener("DOMContentLoaded", () => {
    // 1. Injetar o CSS Responsivo Completo para Telemóveis e Desktops
    const style = document.createElement('style');
    style.innerHTML = `
        .mobile-menu-btn {
            display: none;
            background: none;
            border: none;
            color: #dbdee1;
            font-size: 1.5rem;
            cursor: pointer;
            margin-right: 12px;
            align-items: center;
            justify-content: center;
        }
        
        /* Overlay escuro quando o menu lateral abre no telemóvel */
        .sidebar-overlay {
            display: none;
            position: fixed;
            top: 125px;
            left: 0;
            width: 100vw;
            height: calc(100vh - 125px);
            background: rgba(0, 0, 0, 0.7);
            z-index: 99;
        }

        /* Adaptações para ecrãs de telemóvel (<= 900px) */
        @media (max-width: 900px) {
            body, html {
                overflow-x: hidden !important;
                width: 100% !important;
                max-width: 100% !important;
            }
            header, header.global-header {
                height: auto !important;
                flex-direction: column !important;
                padding: 0.8rem 1rem !important;
                gap: 0.5rem !important;
                justify-content: center !important;
                background: #000000 !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                z-index: 101 !important;
            }
            .logo-container {
                display: flex;
                justify-content: center;
                width: 100%;
            }
            header nav, header.global-header nav {
                position: static !important;
                transform: none !important;
                width: 100% !important;
                overflow-x: auto !important;
                white-space: nowrap !important;
                -webkit-overflow-scrolling: touch;
                padding: 0.2rem 0;
            }
            header nav::-webkit-scrollbar, header.global-header nav::-webkit-scrollbar {
                display: none;
            }
            header nav ul, header.global-header nav ul {
                display: inline-flex !important;
                gap: 1.5rem !important;
                justify-content: flex-start;
                padding: 0 0.5rem;
            }
            header .header-spacer, header.global-header .header-spacer {
                display: none !important;
            }

            .discord-app {
                margin-top: 125px !important;
                height: calc(100vh - 125px) !important;
                width: 100vw !important;
                position: relative;
                overflow-x: hidden !important;
            }
            .sidebar-channels {
                position: fixed !important;
                left: -280px;
                top: 125px !important;
                height: calc(100vh - 125px) !important;
                z-index: 100;
                transition: left 0.3s ease;
                box-shadow: 5px 0 15px rgba(0,0,0,0.5);
                background-color: #212128 !important;
                width: 280px !important;
            }
            .sidebar-channels.mobile-open {
                left: 0 !important;
            }
            .sidebar-overlay.active {
                display: block;
            }
            
            .main-chat {
                width: 100% !important;
                max-width: 100% !important;
                flex: 1 !important;
                overflow-x: hidden !important;
            }
            .chat-content {
                padding: 1rem 0.8rem !important;
                width: 100% !important;
                max-width: 100% !important;
                box-sizing: border-box !important;
                overflow-x: hidden !important;
            }
            .setup-grid {
                display: flex !important;
                flex-direction: column !important;
                width: 100% !important;
                max-width: 100% !important;
                gap: 1rem !important;
            }
            .setup-card, .alert-box, .profile-box {
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                box-sizing: border-box !important;
                margin-left: 0 !important;
                margin-right: 0 !important;
            }
            .setup-card ul li {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 4px !important;
                width: 100% !important;
            }
            .setup-card ul li strong {
                text-align: left !important;
                word-break: break-word !important;
                width: 100% !important;
            }
        }

        @media (max-width: 768px) {
            .mobile-menu-btn {
                display: flex !important;
            }
        }
    `;
    document.head.appendChild(style);

    // 2. Criar o Botão Hamburger e o Overlay no HTML automaticamente (se houver chat-header)
    const chatHeader = document.querySelector('.chat-header');
    if (chatHeader) {
        const menuBtn = document.createElement('button');
        menuBtn.className = 'mobile-menu-btn';
        menuBtn.innerHTML = '☰';
        chatHeader.insertBefore(menuBtn, chatHeader.firstChild);

        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);

        const sidebar = document.querySelector('.sidebar-channels');

        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
            overlay.classList.toggle('active');
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('active');
        });
    }

    // 3. Sistema de Memória das Categorias (localStorage) com proteção para o chat ativo
    const categoryHeaders = document.querySelectorAll('.category-header');
    
    categoryHeaders.forEach((header) => {
        const catName = 'cat_' + header.textContent.trim().replace(/\s+/g, '_');
        header.setAttribute('data-category', catName);

        const content = header.nextElementSibling;
        const arrow = header.querySelector('.category-arrow');
        const savedState = localStorage.getItem('sidebar_cat_' + catName);

        // Verificar se esta categoria contém o chat/canal ativo atual
        const hasActiveChild = content && content.querySelector('.channel-item.active');

        if (hasActiveChild) {
            // Se tem o chat ativo, força a categoria a ficar aberta para o utilizador ver onde está
            if (content) content.classList.remove('collapsed');
            if (arrow) arrow.style.transform = 'rotate(0deg)';
        } else if (savedState === 'true') {
            if (content) content.classList.add('collapsed');
            if (arrow) arrow.style.transform = 'rotate(-90deg)';
        }

        // Evento de clique para recolher/expandir
        header.addEventListener('click', () => {
            if (!content) return;
            content.classList.toggle('collapsed');
            const isCollapsed = content.classList.contains('collapsed');
            
            if (arrow) {
                arrow.style.transform = isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)';
            }
            localStorage.setItem('sidebar_cat_' + catName, isCollapsed);
        });
    });
});
