document.addEventListener('DOMContentLoaded', () => {
    // Screen Elements
    const screen1 = document.getElementById('screen1');
    const screen2 = document.getElementById('screen2');
    const screen3 = document.getElementById('screen3');

    // Buttons
    const startBtn = document.getElementById('startBtn');
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');

    // Make "No" button un-tabable to prevent keyboard selection
    noBtn.setAttribute('tabindex', '-1');

    // Background floating hearts
    const floatingHeartsContainer = document.getElementById('floatingHearts');
    const emojis = ['💖', '❤️', '🌸', '✨', '💕', '💘'];

    function createFloatingHeart() {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        heart.style.left = Math.random() * 100 + 'vw';
        
        // Random size and duration
        const duration = Math.random() * 3 + 4; // 4 to 7 seconds
        const scale = Math.random() * 0.6 + 0.7; // 0.7 to 1.3
        
        heart.style.animationDuration = `${duration}s`;
        heart.style.transform = `scale(${scale})`;
        
        floatingHeartsContainer.appendChild(heart);

        // Remove element after animation finishes
        setTimeout(() => {
            heart.remove();
        }, duration * 1000);
    }

    // Spawn initial background hearts and continue periodically
    for (let i = 0; i < 15; i++) {
        setTimeout(createFloatingHeart, Math.random() * 4000);
    }
    setInterval(createFloatingHeart, 600);

    let isEvasionArmed = false;

    // Screen transitions
    function transitionScreen(fromScreen, toScreen) {
        fromScreen.style.transform = 'scale(0.9)';
        fromScreen.style.opacity = '0';
        
        setTimeout(() => {
            fromScreen.classList.remove('active');
            toScreen.classList.add('active');
            // Allow render before starting transition in
            setTimeout(() => {
                toScreen.style.transform = 'scale(1)';
                toScreen.style.opacity = '1';
            }, 50);
        }, 300);
    }

    startBtn.addEventListener('click', () => {
        transitionScreen(screen1, screen2);
        // Arm the evasion mechanism after 1 second so the buttons are seen together first
        setTimeout(() => {
            isEvasionArmed = true;
        }, 1000);
    });

    // Yes button action
    yesBtn.addEventListener('click', () => {
        transitionScreen(screen2, screen3);
        triggerConfettiCelebration();
    });

    // Evasive No Button Logic
    function moveNoButton() {
        if (!isEvasionArmed) return;

        if (!noBtn.classList.contains('escaped')) {
            noBtn.classList.add('escaped');
        }

        const padding = 60; // Keep inside screen margins
        const btnWidth = noBtn.offsetWidth;
        const btnHeight = noBtn.offsetHeight;

        const maxX = window.innerWidth - btnWidth - padding;
        const maxY = window.innerHeight - btnHeight - padding;

        let randomX = Math.max(padding, Math.floor(Math.random() * maxX));
        let randomY = Math.max(padding, Math.floor(Math.random() * maxY));

        // Make sure it doesn't jump directly under the cursor
        // (Just in case the random coords align with current mouse pos)
        noBtn.style.left = `${randomX}px`;
        noBtn.style.top = `${randomY}px`;
    }

    // Trigger evasion on mouseover / mouseenter / touchstart
    noBtn.addEventListener('mouseover', moveNoButton);
    noBtn.addEventListener('mouseenter', moveNoButton);
    noBtn.addEventListener('touchstart', (e) => {
        if (!isEvasionArmed) return;
        e.preventDefault(); // Prevent click trigger on mobile
        moveNoButton();
    });

    // Just in case they bypass hover via fast mouse movements, teleport on click/focus too!
    noBtn.addEventListener('click', (e) => {
        if (isEvasionArmed) {
            e.preventDefault();
            moveNoButton();
        }
    });
    noBtn.addEventListener('focus', () => {
        moveNoButton();
    });

    // Advanced: Check cursor distance and run away if it gets too close (proactive evasion)
    document.addEventListener('mousemove', (e) => {
        if (!screen2.classList.contains('active') || !isEvasionArmed) return;
        
        const rect = noBtn.getBoundingClientRect();
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;

        const distance = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);

        // Run away if cursor gets within 85 pixels
        if (distance < 85) {
            moveNoButton();
        }
    });

    // Confetti Celebration
    function triggerConfettiCelebration() {
        const duration = 10 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // since particles fall down, animate a bit higher than random
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    }
});
