document.addEventListener("DOMContentLoaded", () => {
    
    // ---------------------------------------------------------
    // 1. DOM Elements & Variables
    // ---------------------------------------------------------
    const coverScreen = document.getElementById('cover-screen');
    const mainContent = document.getElementById('main-content');
    const openBtn = document.getElementById('open-btn'); // The wax seal
    const envelope = document.getElementById('envelope');
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    const musicIcon = document.getElementById('music-icon');
    let isPlaying = false;

    // ---------------------------------------------------------
    // 2. Cover Screen, Envelope & Audio Logic
    // ---------------------------------------------------------
    openBtn.addEventListener('click', () => {
        // Step 1: Open the envelope flap
        envelope.classList.add('open');

        // Play music immediately on click
        bgMusic.play().catch(e => console.log("Audio play failed: ", e));
        isPlaying = true;

        // Step 2: Wait for letter to slide up, then fade out the whole cover screen
        setTimeout(() => {
            coverScreen.style.transform = 'translateY(-100%)';
            coverScreen.style.opacity = '0';
        }, 1500); // Wait 1.5 seconds after click

        // Step 3: Hide the cover screen completely, show main content, show music toggle
        setTimeout(() => {
            coverScreen.style.display = 'none';
            mainContent.classList.remove('hidden');
            
            if(musicToggle) {
                musicToggle.classList.remove('hidden');
            }
        }, 2500); // 1.5s delay + 1s fade out time
    });

    // Handle mute/unmute clicks
    if (musicToggle) {
        musicToggle.addEventListener('click', () => {
            if (isPlaying) {
                bgMusic.pause();
                musicIcon.textContent = '🔇';
            } else {
                bgMusic.play();
                musicIcon.textContent = '🎵';
            }
            isPlaying = !isPlaying;
        });
    }

    // ---------------------------------------------------------
    // 3. Scroll Fade-in Animation Observer
    // ---------------------------------------------------------
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // ---------------------------------------------------------
    // 4. Countdown Timer Logic (Target: Aug 08, 2027)
    // ---------------------------------------------------------
    const targetDate = new Date("Aug 08, 2027 11:00:00").getTime();
    
    const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            clearInterval(interval);
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("days").innerText = days.toString().padStart(2, '0');
        document.getElementById("hours").innerText = hours.toString().padStart(2, '0');
        document.getElementById("mins").innerText = mins.toString().padStart(2, '0');
        document.getElementById("secs").innerText = secs.toString().padStart(2, '0');
    }, 1000);

    // ---------------------------------------------------------
    // 5. Scratch to Reveal (Three separate boxes)
    // ---------------------------------------------------------
    const scratchIds = ['scratch-day', 'scratch-month', 'scratch-year'];
    let fullyRevealedCount = 0;

    scratchIds.forEach(id => {
        const canvas = document.getElementById(id);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        canvas.width = 90;
        canvas.height = 90;
        
        // Draw metallic gradient
        const gradient = ctx.createLinearGradient(0, 0, 90, 90);
        gradient.addColorStop(0, '#e8d090');
        gradient.addColorStop(0.5, '#b38745');
        gradient.addColorStop(1, '#e8d090');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 90, 90);

        let isDrawing = false;
        let scratchedPixels = 0;
        let isRevealed = false;

        const getMousePos = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return { x: clientX - rect.left, y: clientY - rect.top };
        };

        const scratch = (e) => {
            if (!isDrawing || isRevealed) return;
            e.preventDefault(); // Prevents screen scrolling on mobile while scratching
            const { x, y } = getMousePos(e);
            
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2, false);
            ctx.fill();

            scratchedPixels++;
            
            // Reveal this box if scratched enough
            if (scratchedPixels > 25 && !isRevealed) {
                isRevealed = true;
                canvas.style.opacity = '0';
                setTimeout(() => { canvas.style.display = 'none'; }, 500);
                
                fullyRevealedCount++;
                // Drop petals only when all three are revealed
                if (fullyRevealedCount === 3) {
                    triggerPetals();
                }
            }
        };

        canvas.addEventListener('mousedown', () => { isDrawing = true; });
        canvas.addEventListener('mousemove', scratch);
        canvas.addEventListener('mouseup', () => { isDrawing = false; });
        
        // Touch support for mobile devices
        canvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); }, { passive: false });
        canvas.addEventListener('touchmove', scratch, { passive: false });
        canvas.addEventListener('touchend', () => { isDrawing = false; });
    });

    // ---------------------------------------------------------
    // 6. Falling Petal Effect
    // ---------------------------------------------------------
    function triggerPetals() {
        const container = document.getElementById('petal-container');
        if (!container) return;
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const petal = document.createElement('div');
                petal.classList.add('petal');
                petal.style.left = Math.random() * 100 + 'vw';
                petal.style.top = '-20px';
                petal.style.width = Math.random() * 10 + 5 + 'px';
                petal.style.height = Math.random() * 10 + 5 + 'px';
                petal.style.animationDuration = Math.random() * 3 + 2 + 's';
                container.appendChild(petal);
                
                // Cleanup petals
                setTimeout(() => { petal.remove(); }, 5000);
            }, i * 150); // Stagger the petals falling
        }
    }

    // ---------------------------------------------------------
    // 7. Custom Mouse Hover Trail Effect
    // ---------------------------------------------------------
    let lastTrailTime = 0;
    
    // The SVG icon for the trail
    const trailIconSVG = `
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="#C5A059" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.8 4.6a5.5 5.5 0 00-7.7 0l-1.1 1-1.1-1a5.5 5.5 0 00-7.8 7.8l1.1 1.1L12 21.3l7.8-7.8 1.1-1.1a5.5 5.5 0 000-7.8z"/>
        </svg>
    `;

    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        // Throttle the spawn rate to 1 particle every 40ms to keep it smooth
        if (now - lastTrailTime < 40) return; 
        lastTrailTime = now;

        const particle = document.createElement('div');
        particle.classList.add('mouse-trail-particle');
        
        particle.style.left = e.clientX + 'px';
        particle.style.top = e.clientY + 'px';
        
        particle.innerHTML = trailIconSVG;
        document.body.appendChild(particle);

        // Cleanup particle
        setTimeout(() => {
            particle.remove();
        }, 800);
    });

});