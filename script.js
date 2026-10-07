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
    let isRevealed = false;

    // Fade out the cover and show the main website (runs only once)
    const revealInvitation = () => {
        if (isRevealed) return;
        isRevealed = true;

        if (coverScreen) coverScreen.style.opacity = '0';

        setTimeout(() => {
            if (coverScreen) coverScreen.style.display = 'none';
            if (mainContent) mainContent.classList.remove('hidden');
            if (musicToggle) musicToggle.classList.remove('hidden');
        }, 1000); // Wait for the 1s CSS fade out to finish
    };

    const setMusicState = (playing) => {
        isPlaying = playing;
        if (musicIcon) musicIcon.textContent = playing ? '🎵' : '🔇';
        if (musicToggle) musicToggle.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
    };

    if (openBtn && envelopeVideo) {
        openBtn.addEventListener('click', () => {
            // Hide the tap button immediately
            openBtn.style.display = 'none';

            // Show the invitation when the video finishes, or if it can't play at all
            envelopeVideo.addEventListener('ended', revealInvitation);
            envelopeVideo.addEventListener('error', revealInvitation);

            // Safety net: if the video stops making progress for 6s (slow network, stall),
            // show the invitation anyway so no guest is stuck on the cover
            let watchdog = setTimeout(revealInvitation, 6000);
            envelopeVideo.addEventListener('timeupdate', () => {
                clearTimeout(watchdog);
                watchdog = setTimeout(revealInvitation, 6000);
            });

            // Play the 3D envelope video
            envelopeVideo.play().catch(e => {
                console.log("Video play failed: ", e);
                revealInvitation();
            });

            // Start the background music simultaneously
            if (bgMusic) {
                setMusicState(true);
                bgMusic.play().catch(e => {
                    console.log("Audio play failed: ", e);
                    setMusicState(false);
                });
            }
        });
    } else {
        revealInvitation();
    }

    // ---------------------------------------------------------
    // 3. Audio Toggle Logic
    // ---------------------------------------------------------
    if (musicToggle && bgMusic && musicIcon) {
        musicToggle.addEventListener('click', () => {
            if (isPlaying) {
                bgMusic.pause();
                setMusicState(false);
            } else {
                setMusicState(true);
                bgMusic.play().catch(() => setMusicState(false));
            }
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
    // 5. Countdown Timers (all times are India time, IST +05:30)
    // ---------------------------------------------------------
    // prefix '' uses #days/#hours/#mins/#secs
    function startCountdown(targetISO, prefix, doneId) {
        const targetDate = new Date(targetISO).getTime();

        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                clearInterval(interval);
                const doneEl = document.getElementById(doneId);
                if (doneEl) doneEl.classList.remove('hidden');
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((distance % (1000 * 60)) / 1000);

            const daysEl = document.getElementById(prefix + "days");
            const hoursEl = document.getElementById(prefix + "hours");
            const minsEl = document.getElementById(prefix + "mins");
            const secsEl = document.getElementById(prefix + "secs");

            if(daysEl) daysEl.innerText = days.toString().padStart(2, '0');
            if(hoursEl) hoursEl.innerText = hours.toString().padStart(2, '0');
            if(minsEl) minsEl.innerText = mins.toString().padStart(2, '0');
            if(secsEl) secsEl.innerText = secs.toString().padStart(2, '0');
        };

        const interval = setInterval(updateCountdown, 1000);
        updateCountdown();
    }

    // Nikah: Aug 08, 2027, 11:00 AM
    startCountdown("2027-08-08T11:00:00+05:30", "", "countdown-done");

    // ---------------------------------------------------------
    // 6. Scratch to Reveal (groups of three boxes)
    // ---------------------------------------------------------
    setupScratchGroup(['scratch-day', 'scratch-month', 'scratch-year'], triggerPetals);

    function setupScratchGroup(scratchIds, onAllRevealed) {
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
                    if (fullyRevealedCount === scratchIds.length) {
                        onAllRevealed();
                    }
                }
            };

            scratchCanvas.addEventListener('mousedown', () => { isDrawing = true; });
            scratchCanvas.addEventListener('mousemove', scratch);
            window.addEventListener('mouseup', () => { isDrawing = false; });
        
            scratchCanvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); }, { passive: false });
            scratchCanvas.addEventListener('touchmove', scratch, { passive: false });
            scratchCanvas.addEventListener('touchend', () => { isDrawing = false; });
        });
    }

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