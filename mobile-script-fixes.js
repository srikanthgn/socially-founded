// Mobile Navigation Script Fixes
// Add this to your existing script.js file or create a new file and include it in your HTML

document.addEventListener('DOMContentLoaded', function() {
    const openMobileNav = document.getElementById('open-mobile-nav');
    const closeMobileNav = document.getElementById('close-mobile-nav');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileJoinLink = document.getElementById('mobile-join-link');
    const desktopLinks = document.getElementById('desktop-links');
    
    // Toggle body scroll when mobile nav is open/closed
    function toggleBodyScroll(shouldDisable) {
        if (shouldDisable) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
    }
    
    // Update navigation based on screen size
    function updateNavigation() {
        if (window.innerWidth >= 768) {
            if (desktopLinks) desktopLinks.style.display = 'flex';
            if (openMobileNav) openMobileNav.style.display = 'none';
            if (mobileNav) mobileNav.style.display = 'none';
            // Ensure body scrolling is enabled on desktop
            document.body.classList.remove('no-scroll');
        } else {
            if (desktopLinks) desktopLinks.style.display = 'none';
            if (openMobileNav) openMobileNav.style.display = 'block';
        }
    }
    
    // Initial navigation setup
    updateNavigation();
    
    // Update navigation on window resize
    window.addEventListener('resize', updateNavigation);
    
    // Open mobile navigation
    if (openMobileNav) {
        openMobileNav.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            mobileNav.style.display = 'block';
            toggleBodyScroll(true); // Disable scrolling
        });
    }
    
    // Close mobile navigation
    if (closeMobileNav) {
        closeMobileNav.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            mobileNav.style.display = 'none';
            toggleBodyScroll(false); // Enable scrolling
        });
    }
    
    // Close mobile nav when clicking outside
    if (mobileNav) {
        mobileNav.addEventListener('click', function(e) {
            if (e.target === mobileNav) {
                mobileNav.style.display = 'none';
                toggleBodyScroll(false); // Enable scrolling
            }
        });
    }
    
    // Close mobile nav when clicking join link
    if (mobileJoinLink) {
        mobileJoinLink.addEventListener('click', function(e) {
            mobileNav.style.display = 'none';
            toggleBodyScroll(false); // Enable scrolling
            
            // Allow a moment for the nav to close
            setTimeout(() => {
                const formElement = document.getElementById('join-form');
                if (formElement) {
                    formElement.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        });
    }
    
    // Ensure menu button is always visible on mobile
    function ensureMenuButtonVisibility() {
        if (window.innerWidth < 768 && openMobileNav) {
            // Force the styles inline to override any other CSS
            openMobileNav.style.position = 'fixed';
            openMobileNav.style.top = '20px';
            openMobileNav.style.right = '20px';
            openMobileNav.style.zIndex = '1000';
            openMobileNav.style.display = 'block';
        }
    }
    
    // Run on load and scroll
    ensureMenuButtonVisibility();
    window.addEventListener('scroll', ensureMenuButtonVisibility);
    window.addEventListener('resize', ensureMenuButtonVisibility);
});
