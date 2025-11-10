document.addEventListener('DOMContentLoaded', () => {
    const appRoot = document.getElementById('app-root');
    const homeLink = document.getElementById('home-link');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');

    const routes = {
        '/': 'home-page',
        '/login': 'login-page',
        '/register': 'register-page',
    };

    async function renderCaravanList() {
        const caravanListContainer = document.getElementById('caravan-list');
        if (!caravanListContainer) return;

        try {
            const response = await fetch('/api/v1/caravans');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const caravans = await response.json();

            caravanListContainer.innerHTML = '';
            caravans.forEach(caravan => {
                const caravanItem = document.createElement('div');
                caravanItem.className = 'caravan-item';
                caravanItem.innerHTML = `
                    <img src="${caravan.image}" alt="${caravan.name}">
                    <div class="caravan-item-info">
                        <h3>${caravan.name}</h3>
                        <p>${caravan.location}</p>
                        <p>₩${caravan.price.toLocaleString()} / 박</p>
                    </div>
                `;
                caravanListContainer.appendChild(caravanItem);
            });
        } catch (error) {
            console.error('Error fetching caravans:', error);
            caravanListContainer.innerHTML = '<p>카라반 목록을 불러오는 데 실패했습니다.</p>';
        }
    }

    function renderTemplate(templateId) {
        const template = document.getElementById(templateId);
        if (template) {
            appRoot.innerHTML = ''; // Clear existing content
            appRoot.appendChild(template.content.cloneNode(true));
        }
    }

    function router(event) {
        const path = window.location.hash.slice(1) || '/';
        const templateId = routes[path];
        
        if (templateId) {
            renderTemplate(templateId);
            if (path === '/') {
                renderCaravanList();
            }
        } else {
            // 404 Not Found
            appRoot.innerHTML = '<h2>페이지를 찾을 수 없습니다.</h2>';
        }
    }

    // Event Listeners
    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '#/';
    });

    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '#/login';
    });

    registerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '#/register';
    });

    window.addEventListener('hashchange', router);
    
    // Initial load
    router();
});
