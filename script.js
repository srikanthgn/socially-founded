

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Canvas
    const canvas = document.getElementById('network-canvas');
    const ctx = canvas.getContext('2d');
    const nodes = [];
    const connections = [];
    
    // Set initial canvas size
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }
    
    // Node class
    class Node {
        constructor(x, y) {
            this.x = x || Math.random() * canvas.width;
            this.y = y || Math.random() * canvas.height;
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
            nodes.push(new Node());
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
    
    // Initialize canvas and animation
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    createNodes(30);
    animate();
    
    // Form submission handler
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
                const newNode = new Node(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height
                );
                newNode.radius = 6;
                newNode.alpha = 1;
                nodes.push(newNode);
                
                // Submit the form
                setTimeout(() => form.submit(), 1000);
            }
        });
    }
    
    // Captcha generation
    function generateCaptcha() {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let captcha = '';
        for (let i = 0; i < 6; i++) {
            captcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return captcha;
    }
    
    // Initialize captcha
    const captchaText = document.getElementById('captcha-text');
    if (captchaText) {
        captchaText.textContent = generateCaptcha();
    }
});

