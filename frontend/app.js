document.addEventListener('DOMContentLoaded', () => {
    const appRoot = document.getElementById('app-root');
    const authSection = document.getElementById('auth-section');
    const userSection = document.getElementById('user-section');
    const logoutBtn = document.getElementById('logout-btn');
    const userNameSpan = document.getElementById('user-name');
    const roleSpecificLinks = document.getElementById('role-specific-links');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');

    const routes = {
        '/': 'home-page',
        '/login': 'login-page',
        '/register': 'register-page',
        '/cart': 'cart-page',
        '/seller': 'seller-page',
    };

    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Invalid token:", e);
            return null;
        }
    }

    function checkAuth() {
        const token = localStorage.getItem('accessToken');
        roleSpecificLinks.innerHTML = ''; // Clear old links
        if (token) {
            const payload = parseJwt(token);
            if (payload && payload.name) {
                authSection.style.display = 'none';
                userSection.style.display = 'flex';
                userNameSpan.textContent = `${payload.name}님, 환영합니다!`;
                
                if (payload.role === 'guest') {
                    roleSpecificLinks.innerHTML = '<a href="#/cart">내 장바구니</a>';
                } else if (payload.role === 'host') {
                    roleSpecificLinks.innerHTML = '<a href="#/seller">판매자 페이지</a>';
                }

            } else {
                localStorage.removeItem('accessToken');
                authSection.style.display = 'flex';
                userSection.style.display = 'none';
            }
        } else {
            authSection.style.display = 'flex';
            userSection.style.display = 'none';
        }
    }

    async function showCaravanDetailModal(caravanId) {
        modalContent.innerHTML = '<p>Loading...</p>';
        modalOverlay.classList.remove('hidden');
        try {
            const response = await fetch(`/api/v1/caravans/${caravanId}`);
            if (!response.ok) throw new Error('Failed to fetch caravan details.');
            
            const caravan = await response.json();

            modalContent.innerHTML = `
                <button class="modal-close-btn">&times;</button>
                <img src="${caravan.image}" alt="${caravan.name}">
                <h2>${caravan.name}</h2>
                <p>${caravan.description || '상세 설명이 없습니다.'}</p>
                <p><strong>위치:</strong> ${caravan.location}</p>
                <p><strong>가격:</strong> ₩${caravan.price.toLocaleString()} / 박</p>
                <button id="add-to-cart-btn" data-id="${caravan.id}">장바구니에 담기</button>
            `;
        } catch (error) {
            console.error('Error showing modal:', error);
            modalContent.innerHTML = `<p>${error.message}</p><button class="modal-close-btn">&times;</button>`;
        }
    }

    async function renderCaravanList() {
        const caravanListContainer = document.getElementById('caravan-list');
        if (!caravanListContainer) return;
        caravanListContainer.innerHTML = '<p>Loading caravans...</p>';

        try {
            const response = await fetch('/api/v1/caravans');
            if (!response.ok) {
                const errorBody = await response.text();
                console.error('Error fetching caravans:', response.status, errorBody);
                throw new Error('Network response was not ok');
            }
            
            const caravans = await response.json();
            caravanListContainer.innerHTML = '';
            caravans.forEach(caravan => {
                const caravanItem = document.createElement('div');
                caravanItem.className = 'caravan-item';
                caravanItem.setAttribute('data-id', caravan.id);
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

    async function renderCartPage() {
        const cartItemsContainer = document.getElementById('cart-items');
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '<p>Loading cart...</p>';

        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('로그인이 필요합니다.');
            window.location.hash = '#/login';
            return;
        }

        try {
            const response = await fetch('/api/v1/cart', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorBody = await response.text();
                console.error('Error fetching cart:', response.status, errorBody);
                throw new Error('Failed to fetch cart items.');
            }

            const items = await response.json();
            if (items.length === 0) {
                cartItemsContainer.innerHTML = '<p>장바구니가 비어있습니다.</p>';
                return;
            }

            cartItemsContainer.innerHTML = items.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <span>${item.caravan.name}</span>
                    <span>₩${item.caravan.price.toLocaleString()}</span>
                    <button class="remove-from-cart-btn">삭제</button>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error rendering cart:', error);
            cartItemsContainer.innerHTML = '<p>장바구니를 불러오는 데 실패했습니다.</p>';
        }
    }

    async function renderSellerPage() {
        const sellerContent = document.getElementById('seller-content');
        if (!sellerContent) return;
        sellerContent.innerHTML = '<p>Loading seller data...</p>';

        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('로그인이 필요합니다.');
            window.location.hash = '#/login';
            return;
        }

        sellerContent.innerHTML = `
            <h3>내 카라반 목록</h3>
            <div id="host-caravan-list"></div>
            <hr>
            <h3>새 카라반 등록</h3>
            <form id="add-caravan-form">
                <input type="text" name="name" placeholder="카라반 이름" required>
                <input type="text" name="location" placeholder="위치" required>
                <input type="number" name="price" placeholder="가격" required>
                <input type="text" name="image" placeholder="이미지 URL" required>
                <textarea name="description" placeholder="상세설명"></textarea>
                <button type="submit">등록하기</button>
            </form>
        `;

        const hostCaravanList = document.getElementById('host-caravan-list');
        const addCaravanForm = document.getElementById('add-caravan-form');

        async function fetchAndRenderHostCaravans() {
            hostCaravanList.innerHTML = '<p>Loading caravans...</p>';
            try {
                const response = await fetch('/api/v1/host/caravans', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    const errorBody = await response.text();
                    console.error('Error fetching host caravans:', response.status, errorBody);
                    throw new Error('Failed to fetch host caravans.');
                }
                const caravans = await response.json();
                hostCaravanList.innerHTML = caravans.map(c => `<div>${c.name} - ${c.location}</div>`).join('');
            } catch (error) {
                console.error('Error fetching host caravans:', error);
                hostCaravanList.innerHTML = '<p>카라반 목록을 불러오지 못했습니다.</p>';
            }
        }

        addCaravanForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const caravanData = Object.fromEntries(formData.entries());
            caravanData.price = parseInt(caravanData.price, 10);

            try {
                const response = await fetch('/api/v1/host/caravans', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(caravanData)
                });
                if (!response.ok) {
                     const errorData = await response.json();
                    throw new Error(errorData.detail || 'Failed to add caravan.');
                }
                e.target.reset();
                fetchAndRenderHostCaravans();
            } catch (error) {
                console.error('Error adding caravan:', error);
                alert(`카라반 등록 실패: ${error.message}`);
            }
        });

        fetchAndRenderHostCaravans();
    }

    function handleAuthForms() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = e.target.email.value;
                const password = e.target.password.value;
                
                try {
                    const response = await fetch('/api/v1/users/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({ username: email, password: password }),
                    });
                    if (!response.ok) throw new Error('Login failed');
                    
                    const data = await response.json();
                    localStorage.setItem('accessToken', data.access_token);
                    checkAuth();
                    window.location.hash = '#/';
                } catch (error) {
                    console.error('Login error:', error);
                    alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
                }
            });
        }

        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = e.target.name.value;
                const email = e.target.email.value;
                const password = e.target.password.value;
                const role = e.target['user-type'].value;

                try {
                    const response = await fetch('/api/v1/users/signup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, email, password, role }),
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.detail || 'Signup failed');
                    }
                    alert('회원가입 성공! 로그인 페이지로 이동합니다.');
                    window.location.hash = '#/login';
                } catch (error) {
                    console.error('Signup error:', error);
                    alert(`회원가입 실패: ${error.message}`);
                }
            });
        }
    }

    function renderTemplate(templateId) {
        const template = document.getElementById(templateId);
        if (template) {
            appRoot.innerHTML = '';
            appRoot.appendChild(template.content.cloneNode(true));
            handleAuthForms();
        }
    }

    function router() {
        const path = window.location.hash.slice(1) || '/';
        const templateId = routes[path] || 'home-page';
        
        renderTemplate(templateId);

        if (path === '/') {
            renderCaravanList();
        } else if (path === '/cart') {
            renderCartPage();
        } else if (path === '/seller') {
            renderSellerPage();
        }
    }

    document.body.addEventListener('click', async (e) => {
        if (e.target.matches('#home-link')) { e.preventDefault(); window.location.hash = '#/'; }
        if (e.target.matches('#login-btn')) { e.preventDefault(); window.location.hash = '#/login'; }
        if (e.target.matches('#register-btn')) { e.preventDefault(); window.location.hash = '#/register'; }
        
        if (e.target.matches('#cart-btn')) { 
            e.preventDefault();
            const token = localStorage.getItem('accessToken');
            if (!token) {
                alert('로그인이 필요합니다.');
                window.location.hash = '#/login';
            } else {
                window.location.hash = '#/cart';
            }
        }

        if (e.target.matches('#logout-btn')) {
            localStorage.removeItem('accessToken');
            checkAuth();
            window.location.hash = '#/';
        }

        if (e.target.matches('.modal-close-btn') || e.target === modalOverlay) {
            modalOverlay.classList.add('hidden');
        }

        const caravanItem = e.target.closest('.caravan-item');
        if (caravanItem) {
            const caravanId = caravanItem.dataset.id;
            if (caravanId) {
                showCaravanDetailModal(caravanId);
            }
        }

        if (e.target.matches('#add-to-cart-btn')) {
            const caravanId = e.target.dataset.id;
            const token = localStorage.getItem('accessToken');
            if (!token) {
                alert('로그인이 필요합니다.');
                window.location.hash = '#/login';
                return;
            }
            try {
                const response = await fetch('/api/v1/cart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ caravan_id: caravanId })
                });
                if (!response.ok) throw new Error('Failed to add to cart.');
                alert('장바구니에 추가되었습니다.');
                modalOverlay.classList.add('hidden');
            } catch (error) {
                console.error('Add to cart error:', error);
                alert(error.message);
            }
        }

        if (e.target.matches('.remove-from-cart-btn')) {
            const cartItemDiv = e.target.closest('.cart-item');
            const itemId = cartItemDiv.dataset.id;
            const token = localStorage.getItem('accessToken');
            try {
                const response = await fetch(`/api/v1/cart/${itemId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to remove item.');
                renderCartPage(); // Refresh cart
            } catch (error) {
                console.error('Remove from cart error:', error);
                alert(error.message);
            }
        }
    });

    window.addEventListener('hashchange', router);
    
    checkAuth();
    router();
});
