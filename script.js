/* ============================================
   HAMZA OMER — PORTFOLIO SCRIPTS
   Animations, interactions, and effects
   ============================================ */

// ---- Wait for DOM ----
document.addEventListener('DOMContentLoaded', () => {
    initCustomCursor();
    initParticles();
    initNavbar();
    initMobileMenu();
    initTypingAnimation();
    initTerminalAnimation();
    initScrollReveal();
    initSkillBars();
    initCountUp();
    initSmoothScroll();
    initContactForm();
});

// ============================================
// CUSTOM CURSOR
// ============================================
function initCustomCursor() {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');

    if (!dot || !ring || window.innerWidth < 769) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX - 3 + 'px';
        dot.style.top = mouseY - 3 + 'px';
    });

    function animateRing() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
        requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover effect on interactive elements
    const hoverTargets = document.querySelectorAll('a, button, .cert-card, .skill-category-card, .project-card, .contact-method');
    hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('hover'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
}

// ============================================
// PARTICLE BACKGROUND
// ============================================
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height, particles;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.4 + 0.1;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > width) this.speedX *= -1;
            if (this.y < 0 || this.y > height) this.speedY *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(108, 99, 255, ${this.opacity})`;
            ctx.fill();
        }
    }

    const particleCount = Math.min(80, Math.floor(width * height / 15000));
    particles = Array.from({ length: particleCount }, () => new Particle());

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(108, 99, 255, ${0.06 * (1 - dist / 150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        connectParticles();
        requestAnimationFrame(animate);
    }
    animate();
}

// ============================================
// NAVBAR
// ============================================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        // Scrolled state
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active section
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// ============================================
// TYPING ANIMATION
// ============================================
function initTypingAnimation() {
    const roles = [
        'scalable infrastructure.',
        'Kubernetes clusters.',
        'CI/CD pipelines.',
        'network architectures.',
        'automated systems.',
        'AI-powered solutions.'
    ];

    const typedText = document.getElementById('typedText');
    if (!typedText) return;

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 60;

    function type() {
        const currentRole = roles[roleIndex];

        if (isDeleting) {
            typedText.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 30;
        } else {
            typedText.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 60;
        }

        if (!isDeleting && charIndex === currentRole.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 400;
        }

        setTimeout(type, typeSpeed);
    }

    setTimeout(type, 1000);
}

// ============================================
// TERMINAL ANIMATION
// ============================================
function initTerminalAnimation() {
    const body = document.getElementById('terminalBody');
    if (!body) return;

    const commands = [
        {
            cmd: 'cat profile.yaml',
            output: [
                '<span class="highlight">name:</span> Hamza Omer',
                '<span class="highlight">role:</span> DevOps Engineer',
                '<span class="highlight">certs:</span> RHCSA, RHCE, CKA, CCNP',
                '<span class="highlight">status:</span> <span class="success">● Active</span>'
            ]
        },
        {
            cmd: 'kubectl get nodes',
            output: [
                '<span class="warn">NAME    STATUS   ROLES    AGE</span>',
                'node1   <span class="success">Ready</span>    master   120d',
                'node2   <span class="success">Ready</span>    worker   120d',
                'node3   <span class="success">Ready</span>    worker   120d'
            ]
        },
        {
            cmd: 'ansible-playbook deploy.yml',
            output: [
                '<span class="success">PLAY [Deploy Application] ***</span>',
                '<span class="success">TASK [Gathering Facts] *** ok</span>',
                '<span class="success">TASK [Deploy Containers] *** changed</span>',
                '<span class="success">PLAY RECAP: ok=3 changed=1 failed=0</span>'
            ]
        }
    ];

    let cmdIndex = 0;

    function typeCommand(cmd, element, callback) {
        let i = 0;
        function typeChar() {
            if (i < cmd.length) {
                element.textContent += cmd[i];
                i++;
                setTimeout(typeChar, Math.random() * 40 + 20);
            } else {
                callback();
            }
        }
        typeChar();
    }

    function showOutput(outputs, container, callback) {
        let i = 0;
        function showLine() {
            if (i < outputs.length) {
                const line = document.createElement('div');
                line.className = 'output';
                line.innerHTML = outputs[i];
                container.appendChild(line);
                i++;
                setTimeout(showLine, 200);
            } else {
                callback();
            }
        }
        showLine();
    }

    function runCommand() {
        if (cmdIndex >= commands.length) {
            // Clear and restart
            setTimeout(() => {
                body.innerHTML = '<div class="terminal-line"><span class="prompt">$</span><span class="command" id="terminalCmd"></span></div>';
                cmdIndex = 0;
                runCommand();
            }, 3000);
            return;
        }

        const { cmd, output } = commands[cmdIndex];
        const cmdSpan = body.querySelector('.terminal-line:last-child .command');

        typeCommand(cmd, cmdSpan, () => {
            setTimeout(() => {
                showOutput(output, body, () => {
                    // Add new prompt line
                    const newLine = document.createElement('div');
                    newLine.className = 'terminal-line';
                    newLine.innerHTML = '<span class="prompt">$</span><span class="command"></span>';
                    body.appendChild(newLine);
                    cmdIndex++;
                    setTimeout(runCommand, 1000);
                });
            }, 500);
        });
    }

    setTimeout(runCommand, 1500);
}

// ============================================
// SCROLL REVEAL
// ============================================
function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.cert-category, .skill-category-card, .project-card, .timeline-item, .contact-method, .about-text, .about-visual, .cert-summary-card'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => observer.observe(el));
}

// ============================================
// SKILL BARS ANIMATION
// ============================================
function initSkillBars() {
    const skillFills = document.querySelectorAll('.skill-fill');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target;
                const targetWidth = fill.getAttribute('data-width');
                fill.style.width = targetWidth + '%';
                observer.unobserve(fill);
            }
        });
    }, { threshold: 0.3 });

    skillFills.forEach(fill => observer.observe(fill));
}

// ============================================
// COUNT UP ANIMATION
// ============================================
function initCountUp() {
    const counters = document.querySelectorAll('.stat-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-count'));
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;

                function updateCounter() {
                    current += step;
                    if (current < target) {
                        counter.textContent = Math.floor(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                }
                updateCounter();
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

// ============================================
// SMOOTH SCROLLING
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 72; // nav height
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
}

// ============================================
// CONTACT FORM
// ============================================
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = form.querySelector('button[type="submit"]');
        const originalHTML = btn.innerHTML;

        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        btn.disabled = true;

        // Simulate sending (replace with actual API call)
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
            btn.style.background = 'linear-gradient(135deg, #00e676, #00bfa5)';

            form.reset();

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.disabled = false;
            }, 3000);
        }, 1500);
    });
}

// ============================================
// PARALLAX ON MOUSE MOVE (subtle)
// ============================================
document.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.005;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.005;

    const terminal = document.querySelector('.terminal-window');
    if (terminal) {
        terminal.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }
});
