// Mobile Navigation Fix
document.addEventListener('DOMContentLoaded', function() {
    // Create mobile menu button if doesn't exist
    const nav = document.querySelector('nav');
    const navContainer = nav.querySelector('.nav-container') || nav;
    
    // Check if mobile menu button exists
    let mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (!mobileMenuBtn) {
        mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.id = 'mobile-menu-btn';
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        mobileMenuBtn.style.cssText = `
            display: none;
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #003554;
            cursor: pointer;
            padding: 0.5rem;
            margin-left: auto;
        `;
        navContainer.appendChild(mobileMenuBtn);
    }
    
    // Create mobile menu overlay
    let mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenu) {
        mobileMenu = document.createElement('div');
        mobileMenu.id = 'mobile-menu';
        mobileMenu.className = 'mobile-menu';
        mobileMenu.style.cssText = `
            position: fixed;
            top: 0;
            right: -100%;
            width: 80%;
            max-width: 300px;
            height: 100vh;
            background: white;
            box-shadow: -2px 0 10px rgba(0,0,0,0.1);
            z-index: 1001;
            transition: right 0.3s ease;
            overflow-y: auto;
            padding: 2rem;
        `;
        document.body.appendChild(mobileMenu);
    }
    
    // Get current page
    const currentPath = window.location.pathname;
    
    // Standard navigation links
    const navLinks = [
        { href: '/', text: 'Home' },
        { href: '/about.html', text: 'About' },
        { href: '/ideas.html', text: 'Ideas' },
        { href: '/idea-journey.html', text: 'Idea Journey' },
        { href: '/venues.html', text: 'Venues' },
        { href: '/passport.html', text: 'My Passport' }
    ];
    
    // Build mobile menu content
    let menuHTML = '<div style="margin-bottom: 2rem;"><h3 style="color: #003554;">Menu</h3></div>';
    navLinks.forEach(link => {
        const isActive = currentPath === link.href || 
                        (currentPath === '/' && link.href === '/') ||
                        currentPath.includes(link.href.replace('.html', ''));
        menuHTML += `
            <a href="${link.href}" 
               style="display: block; padding: 1rem 0; text-decoration: none; color: ${isActive ? '#003554' : '#666'}; font-weight: ${isActive ? '600' : '500'}; border-bottom: 1px solid #eee;">
                ${link.text}
            </a>
        `;
    });
    
    // Add auth button/signout
    if (currentPath === '/passport.html' || currentPath === '/ideas.html') {
        menuHTML += `
            <button onclick="signOut()" 
                    style="background: #003554; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; width: 100%; margin-top: 2rem; font-weight: 600; cursor: pointer;">
                Sign Out
            </button>
        `;
    } else {
        menuHTML += `
            <a href="/auth.html" 
               style="display: block; background: #003554; color: white; text-align: center; padding: 0.75rem 1.5rem; border-radius: 8px; margin-top: 2rem; text-decoration: none; font-weight: 600;">
                Get Your Passport
            </a>
        `;
    }
    
    mobileMenu.innerHTML = menuHTML;
    
    // Toggle menu function
    mobileMenuBtn.addEventListener('click', function() {
        const isOpen = mobileMenu.style.right === '0px';
        mobileMenu.style.right = isOpen ? '-100%' : '0';
        this.innerHTML = isOpen ? '<i class="fas fa-bars"></i>' : '<i class="fas fa-times"></i>';
    });
    
    // Close menu on outside click
    document.addEventListener('click', function(e) {
        if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            mobileMenu.style.right = '-100%';
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
    
    // Show/hide mobile menu button based on screen size
    function checkMobileMenu() {
        const isMobile = window.innerWidth <= 768;
        mobileMenuBtn.style.display = isMobile ? 'block' : 'none';
        
        // Hide desktop nav links on mobile
        const desktopNavLinks = document.querySelector('.nav-links');
        if (desktopNavLinks) {
            desktopNavLinks.style.display = isMobile ? 'none' : 'flex';
        }
    }
    
    checkMobileMenu();
    window.addEventListener('resize', checkMobileMenu);
});
