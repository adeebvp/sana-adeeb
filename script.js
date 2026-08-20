document.addEventListener("DOMContentLoaded", () => {
    
    // ---------------------------------------------------------
    // 1. DOM Elements & Variables
    // ---------------------------------------------------------
    const coverScreen = document.getElementById('cover-screen');
    const mainContent = document.getElementById('main-content');
    const openBtn = document.getElementById('open-btn'); 
    const envelopeVideo = document.getElementById('envelope-video');
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    const musicIcon = document.getElementById('music-icon');
    let isPlaying = false;

    // ---------------------------------------------------------
    // 2. Cinematic Video Reveal & Audio Logic
    // ---------------------------------------------------------
    if (openBtn && envelopeVideo) {
        openBtn.addEventListener('click', () => {
            // Hide the tap button instantly
            openBtn.style.opacity = '0';
            openBtn.style.pointerEvents = 'none';

            // Hide the tap button IMMEDIATELY with no fade delay
            openBtn.style.display = 'none';

            // Play the 3D envelope video
            envelopeVideo.play();

            // Start the background music simultaneously
            if (bgMusic) {
                bgMusic.play().catch(e => console.log("Audio play failed: ", e));
                isPlaying = true;
            }

            // Listen for the exact moment the video finishes
            envelopeVideo.addEventListener('ended', () => {
                // Fade out the video wrapper
                if (coverScreen) {
                    coverScreen.style.opacity = '0';
                }
                
                // Remove it from the DOM and show the main website
                setTimeout(() => {
                    if (coverScreen) coverScreen.style.display = 'none';
                    if (mainContent) mainContent.classList.remove('hidden');
                    if (musicToggle) musicToggle.classList.remove('hidden');
                }, 1000); // Wait for the 1s CSS fade out to finish
            });
        });
    }

    // ---------------------------------------------------------
    // 3. Audio Toggle Logic
    // ---------------------------------------------------------
    if (musicToggle && bgMusic && musicIcon) {
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
    // 4. Scroll Fade-in Animation Observer
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
    // 5. Countdown Timer Logic (Target: Aug 08, 2027)
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

        const daysEl = document.getElementById("days");
        const hoursEl = document.getElementById("hours");
        const minsEl = document.getElementById("mins");
        const secsEl = document.getElementById("secs");

        if(daysEl) daysEl.innerText = days.toString().padStart(2, '0');
        if(hoursEl) hoursEl.innerText = hours.toString().padStart(2, '0');
        if(minsEl) minsEl.innerText = mins.toString().padStart(2, '0');
        if(secsEl) secsEl.innerText = secs.toString().padStart(2, '0');
    }, 1000);

    // ---------------------------------------------------------
    // 6. Scratch to Reveal (Three separate boxes)
    // ---------------------------------------------------------
    const scratchIds = ['scratch-day', 'scratch-month', 'scratch-year'];
    let fullyRevealedCount = 0;

    scratchIds.forEach(id => {
        const scratchCanvas = document.getElementById(id);
        if (!scratchCanvas) return;
        const scratchCtx = scratchCanvas.getContext('2d');
        
        scratchCanvas.width = 90;
        scratchCanvas.height = 90;
        
        const gradient = scratchCtx.createLinearGradient(0, 0, 90, 90);
        gradient.addColorStop(0, '#e8d090');
        gradient.addColorStop(0.5, '#b38745');
        gradient.addColorStop(1, '#e8d090');
        
        scratchCtx.fillStyle = gradient;
        scratchCtx.fillRect(0, 0, 90, 90);

        let isDrawing = false;
        let scratchedPixels = 0;
        let isRevealed = false;

        const getMousePos = (e) => {
            const rect = scratchCanvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return { x: clientX - rect.left, y: clientY - rect.top };
        };

        const scratch = (e) => {
            if (!isDrawing || isRevealed) return;
            e.preventDefault(); 
            const { x, y } = getMousePos(e);
            
            scratchCtx.globalCompositeOperation = 'destination-out';
            scratchCtx.beginPath();
            scratchCtx.arc(x, y, 12, 0, Math.PI * 2, false);
            scratchCtx.fill();

            scratchedPixels++;
            
            if (scratchedPixels > 25 && !isRevealed) {
                isRevealed = true;
                scratchCanvas.style.opacity = '0';
                setTimeout(() => { scratchCanvas.style.display = 'none'; }, 500);
                
                fullyRevealedCount++;
                if (fullyRevealedCount === 3) {
                    triggerPetals();
                }
            }
        };

        scratchCanvas.addEventListener('mousedown', () => { isDrawing = true; });
        scratchCanvas.addEventListener('mousemove', scratch);
        scratchCanvas.addEventListener('mouseup', () => { isDrawing = false; });
        
        scratchCanvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); }, { passive: false });
        scratchCanvas.addEventListener('touchmove', scratch, { passive: false });
        scratchCanvas.addEventListener('touchend', () => { isDrawing = false; });
    });

    // ---------------------------------------------------------
    // 7. Falling Petal Effect
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
                
                setTimeout(() => { petal.remove(); }, 5000);
            }, i * 150);
        }
    }

    // ---------------------------------------------------------
    // 8. Custom Mouse Hover Trail Effect
    // ---------------------------------------------------------
    let lastTrailTime = 0;
    const trailIconSVG = `
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="#C5A059" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.8 4.6a5.5 5.5 0 00-7.7 0l-1.1 1-1.1-1a5.5 5.5 0 00-7.8 7.8l1.1 1.1L12 21.3l7.8-7.8 1.1-1.1a5.5 5.5 0 000-7.8z"/>
        </svg>
    `;

    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastTrailTime < 40) return; 
        lastTrailTime = now;

        const particle = document.createElement('div');
        particle.classList.add('mouse-trail-particle');
        
        particle.style.left = e.clientX + 'px';
        particle.style.top = e.clientY + 'px';
        
        particle.innerHTML = trailIconSVG;
        document.body.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 800);
    });

});