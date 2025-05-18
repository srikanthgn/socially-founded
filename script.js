document.addEventListener('DOMContentLoaded', function() {
    console.log('Script loaded');
    
    const canvas = document.getElementById('network-canvas');
    console.log('Canvas element:', canvas);
    
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    console.log('Canvas context:', ctx);
    
    // Rest of your code...
});


//Part 1
// Network Visualization
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('network-canvas');
    const ctx = canvas.getContext('2d');
    const nodes = [];
    const connections = [];
    
    // Set canvas dimensions
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
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

    // Part 2

    // Create initial nodes
    function createNodes(count) {
        for (let i = 0; i < count; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            nodes.push(new Node(x, y));
        }
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


//

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
    createNodes(30);
    animate();
    
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
                    refreshCaptcha();
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


// part 4

// Captcha functionality
function generateCaptcha() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return captcha;
}

function refreshCaptcha() {
    const captchaText = document.getElementById('captcha-text');
    if (captchaText) {
        captchaText.textContent = generateCaptcha();
    }
}

// Initialize captcha when page loads
document.addEventListener('DOMContentLoaded', function() {
    const captchaText = document.getElementById('captcha-text');
    if (captchaText) {
        captchaText.textContent = generateCaptcha();
    }
});
// Just modify these parts of your script.js file

// Remove or comment out the refreshCaptcha function since we no longer have the button
// function refreshCaptcha() {
//     const captchaText = document.getElementById('captcha-text');
//     if (captchaText) {
//         captchaText.textContent = generateCaptcha();
//     }
// }

// In the form submission handler, replace the captcha refresh call
if (captchaInput && captchaText && captchaInput.value !== captchaText.textContent) {
    alert('Captcha does not match. Please try again.');
    // refreshCaptcha(); -- Remove this line
    captchaInput.value = '';
    return;
}
