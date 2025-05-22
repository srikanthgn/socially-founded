// Fixed script.js for SociallyFounded
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
    
    // Form submission - Check if form exists first
    const form = document.getElementById('legacy-join-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            // Let the form submit normally to FormSubmit
            console.log('Form submitted');
        });
    }
});

// Cookie Consent Banner
document.addEventListener('DOMContentLoaded', function() {
    const cookieBanner = document.getElementById('cookie-consent');
    const acceptAllBtn = document.getElementById('cookie-accept-all');
    const necessaryBtn = document.getElementById('cookie-accept-necessary');
    
    // Show banner if no consent given yet
    if (!localStorage.getItem('cookieConsent')) {
        setTimeout(() => {
            if (cookieBanner) {
                cookieBanner.style.display = 'block';
            }
        }, 2000);
    }
    
    // Accept all cookies
    if (acceptAllBtn) {
        acceptAllBtn.addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'all');
            if (cookieBanner) {
                cookieBanner.style.display = 'none';
            }
        });
    }
    
    // Accept only necessary cookies
    if (necessaryBtn) {
        necessaryBtn.addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'necessary');
            if (cookieBanner) {
                cookieBanner.style.display = 'none';
            }
        });
    }
    
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

// Custom dropdown for country codes with flags
document.addEventListener('DOMContentLoaded', function() {
    const customSelect = document.getElementById('custom-country-select');
    const dropdown = document.getElementById('country-dropdown');
    const selectedCode = document.getElementById('selected-code');
    const selectedFlag = document.getElementById('selected-flag');
    const hiddenInput = document.getElementById('country-code-input');
    const options = document.querySelectorAll('.custom-option');
    
    // Toggle dropdown when clicking the select
    if (customSelect && dropdown) {
        customSelect.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // If already visible, hide it and return
            if (dropdown.style.display === 'block') {
                dropdown.style.display = 'none';
                dropdown.classList.remove('dropdown-up');
                return;
            }
            
            // Check available space below
            const selectRect = customSelect.getBoundingClientRect();
            const spaceBelow = window.innerHeight - selectRect.bottom;
            const dropdownHeight = 300; // Max height of dropdown
            
            // If not enough space below, position above
            if (spaceBelow < dropdownHeight && selectRect.top > dropdownHeight) {
                dropdown.classList.add('dropdown-up');
            } else {
                dropdown.classList.remove('dropdown-up');
            }
            
            // Display dropdown
            dropdown.style.display = 'block';
        });
    }
    
    // Handle option selection
    options.forEach(option => {
        option.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            const country = this.getAttribute('data-country');
            
            // Update hidden input value
            if (hiddenInput) hiddenInput.value = value;
            
            // Update displayed value
            if (selectedCode) selectedCode.textContent = value;
            
            // Update flag
            if (selectedFlag) {
                selectedFlag.src = `https://flagcdn.com/w40/${country}.png`;
                selectedFlag.alt = `Flag of ${country.toUpperCase()}`;
            }
            
            // Update selected state
            options.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            
            // Close dropdown
            if (dropdown) dropdown.style.display = 'none';
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        if (dropdown) dropdown.style.display = 'none';
    });
    
    // Prevent dropdown from closing when clicking inside it
    if (dropdown) {
        dropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
});
