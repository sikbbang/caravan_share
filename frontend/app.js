document.addEventListener('DOMContentLoaded', () => {
    // Handle token from Google OAuth redirect
    if (window.location.hash.startsWith('#token=')) {
        const token = window.location.hash.substring(7); // Remove '#token='
        localStorage.setItem('accessToken', token);
        window.location.hash = ''; // Clean up the URL
    }

    // --- Main Elements ---
    const appRoot = document.getElementById('app-root');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');

    // --- Desktop Nav Elements ---
    const authSection = document.getElementById('auth-section');
    const userSection = document.getElementById('user-section');
    const logoutBtn = document.getElementById('logout-btn');
    const userNameSpan = document.getElementById('user-name');

    // --- Sidenav Elements ---
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidenav = document.getElementById('sidenav');
    const overlay = document.getElementById('overlay');
    const sidenavCloseBtn = document.getElementById('sidenav-close-btn');
    const sidenavAuthSection = document.getElementById('sidenav-auth-section');
    const sidenavUserSection = document.getElementById('sidenav-user-section');
    const sidenavUserNameSpan = document.getElementById('sidenav-user-name');
    const mobileNav = document.getElementById('mobile-nav');

    let currentUserRole = null;

    const routes = {
        '/': 'home-page',
        '/login': 'login-page',
        '/register': 'register-page',
        '/cart': 'cart-page',
        '/seller': 'seller-page',
    };

    // --- Sidenav Logic ---
    function openSidenav() {
        sidenav.classList.add('open');
        overlay.classList.add('visible');
    }

    function closeSidenav() {
        sidenav.classList.remove('open');
        overlay.classList.remove('visible');
    }

    hamburgerBtn.addEventListener('click', openSidenav);
    overlay.addEventListener('click', closeSidenav);
    sidenavCloseBtn.addEventListener('click', closeSidenav);
    mobileNav.addEventListener('click', (e) => {
        if (e.target.classList.contains('nav-link')) {
            // The router will handle the hash change
            closeSidenav();
        }
        if (e.target.matches('#sidenav-logout-btn')) {
            localStorage.removeItem('accessToken');
            checkAuth();
            closeSidenav();
            window.location.hash = '#/';
        }
    });

    // --- Auth and UI Update Logic ---
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
        
        // Clear previous dynamic buttons from desktop nav to prevent duplication
        document.querySelectorAll('#user-section .dynamic-nav-link').forEach(link => link.remove());

        if (token) {
            const payload = parseJwt(token);
            if (payload && payload.name) {
                currentUserRole = payload.role;
                // Show user sections, hide auth sections
                authSection.style.display = 'none';
                sidenavAuthSection.style.display = 'none';
                userSection.style.display = 'flex';
                sidenavUserSection.style.display = 'flex';
                
                // Update user names
                userNameSpan.textContent = `${payload.name}님, 환영합니다!`;
                sidenavUserNameSpan.textContent = `${payload.name}님, 환영합니다!`;

                // Create and insert dynamic buttons for desktop view
                const cartButton = document.createElement('button');
                cartButton.className = 'nav-button dynamic-nav-link';
                cartButton.textContent = '장바구니';
                cartButton.dataset.path = '#/cart';
                userSection.insertBefore(cartButton, logoutBtn);

                const sellerButton = document.createElement('button');
                sellerButton.className = 'nav-button dynamic-nav-link';
                sellerButton.textContent = '판매자 페이지';
                sellerButton.dataset.path = '#/seller';
                userSection.insertBefore(sellerButton, logoutBtn);

            } else {
                // Invalid token
                currentUserRole = null;
                localStorage.removeItem('accessToken');
                authSection.style.display = 'flex';
                sidenavAuthSection.style.display = 'flex';
                userSection.style.display = 'none';
                sidenavUserSection.style.display = 'none';
            }
        } else {
            // No token
            currentUserRole = null;
            authSection.style.display = 'flex';
            sidenavAuthSection.style.display = 'flex';
            userSection.style.display = 'none';
            sidenavUserSection.style.display = 'none';
        }
    }

    // --- Page Rendering Functions ---

    async function showCaravanDetailModal(caravanId, showAddToCartButton = true) {
        modalContent.innerHTML = '<p>Loading...</p>';
        modalOverlay.classList.remove('hidden');
        try {
            const response = await fetch(`/api/v1/caravans/${caravanId}`);
            if (!response.ok) throw new Error('Failed to fetch caravan details.');
            
            const caravan = await response.json();

            const addToCartBtnHtml = showAddToCartButton && currentUserRole !== 'host'
                ? `<button id="add-to-cart-btn" data-id="${caravan.id}">장바구니에 담기</button>`
                : '';

            modalContent.innerHTML = `
                <button class="modal-close-btn">&times;</button>
                <div class="modal-body">
                    <div class="modal-image-container">
                        <img src="${caravan.image}" alt="${caravan.name}">
                    </div>
                    <div class="modal-info-container">
                        <h2>${caravan.name}</h2>
                        <p>${caravan.description || '상세 설명이 없습니다.'}</p>
                        <p><strong>위치:</strong> ${caravan.location}</p>
                        <p><strong>가격:</strong> ₩${caravan.price.toLocaleString()} / 박</p>
                        ${addToCartBtnHtml}
                    </div>
                </div>
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
            if (!response.ok) throw new Error('Network response was not ok');
            
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
                        <div class="caravan-price-container">
                            <p>${caravan.price.toLocaleString()}원</p>
                        </div>
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
            if (response.status === 401) {
                // Token is invalid or expired
                localStorage.removeItem('accessToken');
                checkAuth(); // Update UI
                alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                window.location.hash = '#/login';
                return;
            }
            if (!response.ok) throw new Error('Failed to fetch cart items.');
            
            const items = await response.json();
            const cartSummary = document.getElementById('cart-summary');

            if (items.length === 0) {
                cartItemsContainer.innerHTML = '<p>장바구니가 비어있습니다.</p>';
                if(cartSummary) cartSummary.style.display = 'none';
                return;
            }
            
            if(cartSummary) cartSummary.style.display = 'block';

            cartItemsContainer.innerHTML = items.map(item => `
                <div class="cart-item" data-id="${item.id}" data-price="${item.caravan.price}" data-caravan-id="${item.caravan.id}">
                    <input type="checkbox" class="cart-item-checkbox" checked>
                    <img src="${item.caravan.image}" alt="${item.caravan.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h4>${item.caravan.name}</h4>
                        <p>${item.caravan.description || '설명이 없습니다.'}</p>
                    </div>
                    <span class="cart-item-price">₩${item.caravan.price.toLocaleString()}</span>
                    <button class="remove-from-cart-btn">삭제</button>
                </div>
            `).join('');
            
            updateTotalPrice();

        } catch (error) {
            console.error('Error rendering cart:', error);
            cartItemsContainer.innerHTML = '<p>장바구니를 불러오는 데 실패했습니다.</p>';
        }
    }

    function updateTotalPrice() {
        const totalPriceEl = document.getElementById('total-price');
        if (!totalPriceEl) return;

        let total = 0;
        document.querySelectorAll('.cart-item-checkbox:checked').forEach(checkbox => {
            const itemDiv = checkbox.closest('.cart-item');
            total += parseFloat(itemDiv.dataset.price);
        });

        totalPriceEl.textContent = `₩${total.toLocaleString()}`;
    }

    async function renderSellerPage() {
        const sellerContent = document.getElementById('seller-content');
        if (!sellerContent) return;
        
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('로그인이 필요합니다.');
            window.location.hash = '#/login';
            return;
        }

        const koreanAdministrativeDivisions = {
            "서울특별시": ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"],
            "부산광역시": ["강서구", "금정구", "남구", "동구", "동래구", "부산진구", "북구", "사상구", "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구", "기장군"],
            "경기도": ["수원시", "성남시", "고양시", "용인시", "부천시", "안산시", "안양시", "남양주시", "화성시", "평택시"],
            "강원도": ["춘천시", "원주시", "강릉시", "동해시", "태백시", "속초시", "삼척시"],
            "충청북도": ["청주시", "충주시", "제천시"],
            "충청남도": ["천안시", "공주시", "보령시", "아산시", "서산시", "논산시", "계룡시", "당진시"],
            "전라북도": ["전주시", "익산시", "군산시", "정읍시", "남원시", "김제시"],
            "전라남도": ["목포시", "여수시", "순천시", "나주시", "광양시"],
            "경상북도": ["포항시", "경주시", "김천시", "안동시", "구미시", "영주시", "영천시", "상주시", "문경시", "경산시"],
            "경상남도": ["창원시", "진주시", "통영시", "사천시", "김해시", "밀양시", "거제시", "양산시"],
            "제주특별자치도": ["제주시", "서귀포시"]
        };

        const provinceOptions = Object.keys(koreanAdministrativeDivisions).map(region => `<option value="${region}">${region}</option>`).join('');

        sellerContent.innerHTML = `
            <h3>내 카라반 목록</h3>
            <div id="host-caravan-list"></div>
            <hr>
            <button id="show-add-form-btn" class="nav-button">새 카라반 등록</button>
            <div id="add-caravan-container" style="display: none; margin-top: 1.5rem;">
                <h3>새 카라반 등록</h3>
                <form id="add-caravan-form">
                    <input type="text" name="name" placeholder="카라반 이름" required>
                    <textarea name="description" placeholder="상세설명"></textarea>
                    <input type="file" name="image" accept="image/*" required>
                    <div style="display: flex; gap: 1rem;">
                        <select id="location-province" required style="flex: 1;">
                            <option value="" disabled selected>도/광역시 선택</option>
                            ${provinceOptions}
                        </select>
                        <select id="location-city" required style="flex: 1;" disabled>
                            <option value="" disabled selected>시/군/구 선택</option>
                        </select>
                    </div>
                    <input type="hidden" name="location">
                    <div class="input-with-unit">
                        <input type="number" name="price" placeholder="가격" required>
                        <span>원</span>
                    </div>
                    <button type="submit">등록하기</button>
                </form>
            </div>
        `;

        const hostCaravanList = document.getElementById('host-caravan-list');
        const addCaravanContainer = document.getElementById('add-caravan-container');
        
        async function fetchAndRenderHostCaravans() {
            hostCaravanList.innerHTML = '<p>Loading caravans...</p>';
            try {
                const response = await fetch('/api/v1/host/caravans', { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error('Failed to fetch host caravans.');
                const caravans = await response.json();
                if (caravans.length === 0) {
                    hostCaravanList.innerHTML = "<p>등록된 카라반이 없습니다.</p>";
                    return;
                }
                hostCaravanList.innerHTML = caravans.map(caravan => `
                    <div class="cart-item" data-id="${caravan.id}">
                        <img src="${caravan.image}" alt="${caravan.name}" class="cart-item-image">
                        <div class="cart-item-details">
                            <h4>${caravan.name}</h4>
                            <p>${caravan.description || '설명이 없습니다.'}</p>
                        </div>
                        <span class="cart-item-price">₩${caravan.price.toLocaleString()}</span>
                        <button class="remove-hosted-caravan-btn" data-id="${caravan.id}">등록 취소</button>
                    </div>
                `).join('');
            } catch (error) {
                console.error('Error fetching host caravans:', error);
                hostCaravanList.innerHTML = '<p>카라반 목록을 불러오지 못했습니다.</p>';
            }
        }

        addCaravanContainer.addEventListener('change', (e) => {
            const provinceSelect = document.getElementById('location-province');
            const citySelect = document.getElementById('location-city');
            const hiddenLocationInput = document.querySelector('input[name="location"]');

            if (e.target === provinceSelect) {
                const selectedProvince = provinceSelect.value;
                const cities = koreanAdministrativeDivisions[selectedProvince] || [];
                
                citySelect.innerHTML = '<option value="" disabled selected>시/군/구 선택</option>';
                cities.forEach(city => {
                    citySelect.innerHTML += `<option value="${city}">${city}</option>`;
                });
                citySelect.disabled = false;
            }

            if (provinceSelect.value && citySelect.value) {
                hiddenLocationInput.value = `${provinceSelect.value} ${citySelect.value}`;
            } else {
                hiddenLocationInput.value = '';
            }
        });

        sellerContent.addEventListener('submit', async (e) => {
            if (e.target.matches('#add-caravan-form')) {
                e.preventDefault();
                const formData = new FormData(e.target);
                if (!formData.get('location')) {
                    alert('위치를 모두 선택해주세요.');
                    return;
                }
                try {
                    const response = await fetch('/api/v1/host/caravans', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: formData
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.detail || 'Failed to add caravan.');
                    }
                    e.target.reset();
                    document.getElementById('add-caravan-container').style.display = 'none';
                    fetchAndRenderHostCaravans();
                } catch (error) {
                    console.error('Error adding caravan:', error);
                    alert(`카라반 등록 실패: ${error.message}`);
                }
            }
        });

        sellerContent.addEventListener('click', async (e) => {
            if (e.target.matches('.remove-hosted-caravan-btn')) {
                const caravanId = e.target.dataset.id;
                if (confirm('정말로 이 카라반을 삭제하시겠습니까?')) {
                    try {
                        const response = await fetch(`/api/v1/host/caravans/${caravanId}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (!response.ok) throw new Error('Failed to delete caravan.');
                        fetchAndRenderHostCaravans();
                    } catch (error) {
                        console.error('Delete caravan error:', error);
                        alert(error.message);
                    }
                }
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
                const role = 'guest'; // Always register as guest

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

    document.body.addEventListener('change', (e) => {
        if (e.target.matches('.cart-item-checkbox')) {
            updateTotalPrice();
        }
    });

    document.body.addEventListener('click', async (e) => {
        if (e.target.matches('#home-link')) { e.preventDefault(); window.location.hash = '#/'; }
        
        // Desktop nav buttons
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

        // Google login
        if (e.target.matches('.google-btn')) {
            window.location.href = '/api/v1/users/google/login';
        }

        if (e.target.matches('.dynamic-nav-link')) {
            const path = e.target.dataset.path;
            if (path) {
                window.location.hash = path;
            }
        }

        // Modal
        if (e.target.matches('.modal-close-btn') || e.target === modalOverlay) {
            modalOverlay.classList.add('hidden');
        }

        // Caravan item click
        const caravanItem = e.target.closest('.caravan-item');
        if (caravanItem) {
            const caravanId = caravanItem.dataset.id;
            if (caravanId) {
                showCaravanDetailModal(caravanId);
            }
        }

        // Cart item click
        const cartItem = e.target.closest('.cart-item');
        if (cartItem && !e.target.matches('.remove-from-cart-btn, .cart-item-checkbox')) {
            const caravanId = cartItem.dataset.caravanId;
            if (caravanId) {
                showCaravanDetailModal(caravanId, false);
            }
        }

        // Add to cart button in modal
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

        // Remove from cart button
        if (e.target.matches('.remove-from-cart-btn')) {
            if (confirm('정말로 삭제하시겠습니까?')) {
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
        }

        // Purchase button
        if (e.target.matches('#purchase-btn')) {
            const checkedItems = document.querySelectorAll('.cart-item-checkbox:checked');
            if (checkedItems.length === 0) {
                alert('구매할 상품을 선택해주세요.');
                return;
            }
            alert(`${checkedItems.length}개의 상품을 구매합니다.`);
        }

        // Show add caravan form button
        if (e.target.matches('#show-add-form-btn')) {
            const formContainer = document.getElementById('add-caravan-container');
            if (formContainer) {
                const isVisible = formContainer.style.display === 'block';
                formContainer.style.display = isVisible ? 'none' : 'block';
            }
        }
    });

    window.addEventListener('hashchange', router);
    
    checkAuth();
    router();
});