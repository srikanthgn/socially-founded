// Network Visualization
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    const canvas = document.getElementById('network-canvas');
    console.log('Canvas element:', canvas);
    
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const nodes = [];
    const connections = [];
    
    // Set canvas dimensions
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        console.log('Canvas resized to:', canvas.width, 'x', canvas.height);
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Node class
    class Node {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.radius = 3 + Math.random() * 3;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.color = '#003554';
            this.alpha = 0.7 + Math.random() * 0.3;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            // Bounce off walls
            if (this.x < this.radius || this.x > canvas.width - this.radius) {
                this.vx *= -1;
            }
            
            if (this.y < this.radius || this.y > canvas.height - this.radius) {
                this.vy *= -1;
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.alpha;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }
    
    // Create initial nodes
    function createNodes(count) {
        for (let i = 0; i < count; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            nodes.push(new Node(x, y));
        }
        console.log('Created', count, 'nodes');
    }
    
    // Create connections between nodes
    function createConnections() {
        connections.length = 0;
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    connections.push({
                        from: nodes[i],
                        to: nodes[j],
                        alpha: 1 - distance / 100
                    });
                }
            }
        }
    }
    
    // Draw connections
    function drawConnections() {
        for (const connection of connections) {
            ctx.beginPath();
            ctx.moveTo(connection.from.x, connection.from.y);
            ctx.lineTo(connection.to.x, connection.to.y);
            ctx.strokeStyle = '#003554';
            ctx.globalAlpha = connection.alpha * 0.2;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (const node of nodes) {
            node.update();
        }
        
        createConnections();
        drawConnections();
        
        for (const node of nodes) {
            node.draw();
        }
        
        requestAnimationFrame(animate);
    }
    
    // Initialize
    console.log('Initializing network');
    createNodes(30);
    animate();
    console.log('Animation started');
    
    // Form submission
    const form = document.getElementById('join-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const captchaInput = document.getElementById('captcha');
            const captchaText = document.getElementById('captcha-text');
            
            if (nameInput.value && emailInput.value) {
                // Check captcha
                if (captchaInput && captchaText && captchaInput.value !== captchaText.textContent) {
                    alert('Captcha does not match. Please try again.');
                    captchaInput.value = '';
                    return;
                }
                
                // Add a new node with animation
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const newNode = new Node(x, y);
                newNode.radius = 6; // Slightly larger
                newNode.alpha = 1;
                nodes.push(newNode);
                
                // Submit the form
                form.submit();
            }
        });
    }
});

// Captcha functionality
function generateCaptcha() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return captcha;
}

// Initialize captcha when page loads
document.addEventListener('DOMContentLoaded', function() {
    const captchaText = document.getElementById('captcha-text');
    if (captchaText) {
        captchaText.textContent = generateCaptcha();
    }
});

// Social authentication handling
function socialAuth(provider) {
    console.log(`Authenticating with ${provider}`);
    alert(`${provider} authentication will be implemented soon!`);
    // In the future, this will connect to your authentication system
}

//
// Phone number formatting
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Get input value and remove non-digits
            let input = this.value.replace(/\D/g, '');
            
            // Format the number as user types
            if (input.length <= 3) {
                // Do nothing yet
            } else if (input.length <= 6) {
                this.value = input.substring(0, 3) + '-' + input.substring(3);
            } else {
                this.value = input.substring(0, 3) + '-' + input.substring(3, 6) + '-' + input.substring(6, 10);
            }
        });
    }
});

// Add this to script.js
document.addEventListener('DOMContentLoaded', function() {
    const countrySelect = document.getElementById('country-code');
    const customCodeInput = document.getElementById('custom-code');
    
    if (countrySelect && customCodeInput) {
        countrySelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                customCodeInput.style.display = 'block';
                countrySelect.style.display = 'none';
            }
        });
        
        customCodeInput.addEventListener('blur', function() {
            if (!this.value.trim()) {
                customCodeInput.style.display = 'none';
                countrySelect.style.display = 'block';
                countrySelect.value = '+1'; // Default back to US
            }
        });
    }
});

// Phone number formatting
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Get input value and remove non-digits
            let input = this.value.replace(/\D/g, '');
            
            // Format the number as user types
            if (input.length <= 3) {
                this.value = input;
            } else if (input.length <= 6) {
                this.value = input.substring(0, 3) + '-' + input.substring(3);
            } else {
                this.value = input.substring(0, 3) + '-' + input.substring(3, 6) + '-' + input.substring(6, 10);
            }
        });
    }
    
    // Update form submission handling to check honeypot
    const form = document.getElementById('join-form');
    if (form) {
        const originalSubmitHandler = form.onsubmit;
        
        form.addEventListener('submit', function(e) {
            // Check if honeypot field was filled (indicates a bot)
            if (document.getElementById('website') && document.getElementById('website').value !== '') {
                e.preventDefault(); // Stop the form submission
                return false;
            }
            
            // Continue with normal form processing
        });
    }
});

// Social authentication handling
function socialAuth(provider) {
    console.log(`Authenticating with ${provider}`);
    alert(`${provider} authentication will be implemented soon!`);
    // In the future, this will connect to your authentication system
}

// Cookie Consent Management
document.addEventListener('DOMContentLoaded', function() {
    const cookieBanner = document.getElementById('cookie-consent');
    const settingsPanel = document.getElementById('cookie-settings-panel');
    const acceptAllBtn = document.getElementById('cookie-accept-all');
    const necessaryBtn = document.getElementById('cookie-accept-necessary');
    const settingsBtn = document.getElementById('cookie-settings');
    const savePreferencesBtn = document.getElementById('save-preferences');
    
    // Check if consent was already given
    if (!localStorage.getItem('cookieConsent')) {
        // Show cookie banner after slight delay
        setTimeout(() => {
            cookieBanner.style.display = 'block';
        }, 2000);
    }
    
    // Accept all cookies
    acceptAllBtn.addEventListener('click', function() {
        setConsent({
            necessary: true,
            analytics: true,
            marketing: true
        });
        cookieBanner.style.display = 'none';
    });
    
    // Accept only necessary cookies
    necessaryBtn.addEventListener('click', function() {
        setConsent({
            necessary: true,
            analytics: false,
            marketing: false
        });
        cookieBanner.style.display = 'none';
    });
    
    // Show cookie settings
    settingsBtn.addEventListener('click', function() {
        settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
    });
    
    // Save cookie preferences
    savePreferencesBtn.addEventListener('click', function() {
        const analyticsConsent = document.getElementById('analytics-cookies').checked;
        const marketingConsent = document.getElementById('marketing-cookies').checked;
        
        setConsent({
            necessary: true,
            analytics: analyticsConsent,
            marketing: marketingConsent
        });
        
        settingsPanel.style.display = 'none';
        cookieBanner.style.display = 'none';
    });
    
    // Set cookie consent in localStorage
    function setConsent(preferences) {
        localStorage.setItem('cookieConsent', JSON.stringify({
            preferences: preferences,
            timestamp: new Date().toISOString()
        }));
        
        // Load appropriate scripts based on preferences
        if (preferences.analytics) {
            // Load analytics scripts here
            console.log('Loading analytics scripts...');
        }
        
        if (preferences.marketing) {
            // Load marketing scripts here
            console.log('Loading marketing scripts...');
        }
    }
    
    // For the cookie policy link
    document.getElementById('cookie-policy-link').addEventListener('click', function(e) {
        e.preventDefault();
        // In the future, link to your cookie policy page
        alert('Cookie Policy page will be available soon.');
    });
});

// Cookie Consent Banner
document.addEventListener('DOMContentLoaded', function() {
    const cookieBanner = document.getElementById('cookie-consent');
    const acceptAllBtn = document.getElementById('cookie-accept-all');
    const necessaryBtn = document.getElementById('cookie-accept-necessary');
    
    // Show banner if no consent given yet
    if (!localStorage.getItem('cookieConsent')) {
        setTimeout(() => {
            cookieBanner.style.display = 'block';
        }, 2000);
    }
    
    // Accept all cookies
    acceptAllBtn.addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'all');
        cookieBanner.style.display = 'none';
    });
    
    // Accept only necessary cookies
    necessaryBtn.addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'necessary');
        cookieBanner.style.display = 'none';
    });
    
    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            let input = this.value.replace(/\D/g, '');
            let formatted = '';
            
            if (input.length > 0) {
                if (input.length <= 3) {
                    formatted = input;
                } else if (input.length <= 6) {
                    formatted = input.substring(0, 3) + '-' + input.substring(3);
                } else {
                    formatted = input.substring(0, 3) + '-' + input.substring(3, 6) + '-' + input.substring(6, 10);
                }
                
                this.value = formatted;
            }
        });
    }
});

// Add this to your script.js
document.addEventListener('DOMContentLoaded', function() {
    // Find the actual phone input that's visible on the page
    const phoneInputs = document.querySelectorAll('input[placeholder*="phone"]');
    
    if (phoneInputs.length > 0) {
        // Use the last phone input if there are multiple
        const phoneInput = phoneInputs[phoneInputs.length - 1];
        
        phoneInput.addEventListener('input', function() {
            let input = this.value.replace(/\D/g, '');
            let formatted = '';
            
            if (input.length > 0) {
                if (input.length <= 3) {
                    formatted = input;
                } else if (input.length <= 6) {
                    formatted = input.substring(0, 3) + '-' + input.substring(3);
                } else {
                    formatted = input.substring(0, 3) + '-' + input.substring(3, 6) + '-' + input.substring(6, 10);
                }
                
                this.value = formatted;
            }
        });
    }
});




