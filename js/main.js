document.addEventListener("DOMContentLoaded", () => {
    // 1. Injetar o CSS Responsivo (Botão Hamburger, Overlay e Menu Superior Deslizante Corrigido)
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
        
        /* Overlay escuro quando o menu do Discord abre no telemóvel */
        .sidebar-overlay {
            display: none;
            position: fixed;
            top: 85px;
            left: 0;
            width: 100vw;
            height: calc(100vh - 85px);
            background: rgba(0, 0, 0, 0.6);
            z-index: 99;
        }

        /* Menu Superior Responsivo (Vitrine / Index) para Telemóvel */
        @media (max-width: 900px) {
            header.global-header {
                padding: 0 1rem !important;
                justify-content: flex-start !important;
                gap: 1rem !important;
            }
            header.global-header nav {
                position: static !important;
                transform: none !important;
                flex: 1 !important;
                overflow-x: auto !important;
                white-space: nowrap !important;
                margin: 0 !important;
                -webkit-overflow-scrolling: touch;
            }
            header.global-header nav::-webkit-scrollbar {
                display: none; /* Esconde a barra de rolagem */
            }
            header.global-header nav ul {
                gap: 1.2rem !important;
            }
            header.global-header .header-spacer {
                display: none !important;
            }
            .logo-container {
                flex-shrink: 0;
            }
        }

        /* Layout Estilo Discord no Telemóvel */
        @media (max-width: 768px) {
            .mobile-menu-btn {
                display: flex !important;
            }
            .sidebar-channels {
                position: fixed !important;
                left: -260px;
                top: 85px;
                height: calc(100vh - 85px);
                z-index: 100;
                transition: left 0.3s ease;
                box-shadow: 5px 0 15px rgba(0,0,0,0.5);
            }
            .sidebar-channels.mobile-open {
                left: 0 !important;
            }
            .sidebar-overlay.active {
                display: block;
            }
            .chat-content {
                padding: 1.5rem 1rem !important;
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

    // 3. Sistema de Memória das Categorias (localStorage)
    const categoryHeaders = document.querySelectorAll('.category-header');
    
    categoryHeaders.forEach((header) => {
        const catName = 'cat_' + header.textContent.trim().replace(/\s+/g, '_');
        header.setAttribute('data-category', catName);

        const content = header.nextElementSibling;
        const arrow = header.querySelector('.category-arrow');
        const savedState = localStorage.getItem('sidebar_cat_' + catName);

        if (savedState === 'true') {
            if (content) content.classList.add('collapsed');
            if (arrow) arrow.style.transform = 'rotate(-90deg)';
        }

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
