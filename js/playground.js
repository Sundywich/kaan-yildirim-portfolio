/**
 * KAAN YILDIRIM // TECHNICAL GAME DESIGNER PORTFOLIO
 * INTERACTIVE SYSTEMS LAB & MECHANICS PLAYGROUND
 * Self-contained, zero-dependency Canvas simulator
 */

(function () {
    const canvas = document.getElementById('labCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let currentMode = 'stealth'; // 'stealth' or 'combat'
    let animationFrameId = null;

    // Responsive Canvas Resizing
    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = Math.max(420, rect.height);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // ==========================================
    // 1. STEALTH AI VISION CONE & PERCEPTION SIM
    // ==========================================
    const stealthSim = {
        player: {
            x: 100,
            y: 200,
            radius: 12,
            speed: 3,
            isSneaking: false,
            isDragging: false,
            noiseRadius: 40
        },
        enemy: {
            x: 400,
            y: 200,
            radius: 14,
            angle: Math.PI,
            patrolRadius: 100,
            patrolSpeed: 0.015,
            patrolCenter: { x: 400, y: 200 },
            patrolTime: 0,
            fov: (70 * Math.PI) / 180,
            viewDistance: 220,
            state: 'PATROL', // 'PATROL', 'SUSPICIOUS', 'ALERT'
            detectionLevel: 0, // 0 to 100
            detectionRate: 1.2,
            decayRate: 0.6,
            lastKnownPlayerPos: null,
            investigateTimer: 0
        },
        obstacles: [
            { x: 240, y: 110, w: 40, h: 180 },
            { x: 380, y: 50, w: 120, h: 30 },
            { x: 380, y: 320, w: 120, h: 30 }
        ],
        keys: {}
    };

    // Keyboard controls for player
    window.addEventListener('keydown', (e) => {
        stealthSim.keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener('keyup', (e) => {
        stealthSim.keys[e.key.toLowerCase()] = false;
    });

    // Mouse drag support
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const dist = Math.hypot(mouseX - stealthSim.player.x, mouseY - stealthSim.player.y);
        if (dist < 30) {
            stealthSim.player.isDragging = true;
        } else {
            // Click to teleport player
            stealthSim.player.x = mouseX;
            stealthSim.player.y = mouseY;
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (stealthSim.player.isDragging) {
            const rect = canvas.getBoundingClientRect();
            stealthSim.player.x = Math.max(20, Math.min(canvas.width - 20, e.clientX - rect.left));
            stealthSim.player.y = Math.max(20, Math.min(canvas.height - 20, e.clientY - rect.top));
        }
    });

    window.addEventListener('mouseup', () => {
        stealthSim.player.isDragging = false;
    });

    // Line intersection helper for raycasting walls
    function lineIntersects(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        if (denom === 0) return false;
        const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
        const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
        return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
    }

    function isPointInWall(x, y) {
        return stealthSim.obstacles.some(
            (o) => x >= o.x && x <= o.x + o.w && y >= o.y && y <= o.y + o.h
        );
    }

    function checkLineOfSight(x1, y1, x2, y2) {
        for (const o of stealthSim.obstacles) {
            if (lineIntersects(x1, y1, x2, y2, o.x, o.y, o.x + o.w, o.y)) return false;
            if (lineIntersects(x1, y1, x2, y2, o.x + o.w, o.y, o.x + o.w, o.y + o.h)) return false;
            if (lineIntersects(x1, y1, x2, y2, o.x + o.w, o.y + o.h, o.x, o.y + o.h)) return false;
            if (lineIntersects(x1, y1, x2, y2, o.x, o.y + o.h, o.x, o.y)) return false;
        }
        return true;
    }

    function updateStealthSim() {
        const p = stealthSim.player;
        const e = stealthSim.enemy;

        // Player WASD movement
        let dx = 0;
        let dy = 0;
        if (stealthSim.keys['w'] || stealthSim.keys['arrowup']) dy -= 1;
        if (stealthSim.keys['s'] || stealthSim.keys['arrowdown']) dy += 1;
        if (stealthSim.keys['a'] || stealthSim.keys['arrowleft']) dx -= 1;
        if (stealthSim.keys['d'] || stealthSim.keys['arrowright']) dx += 1;

        if (dx !== 0 || dy !== 0) {
            const mag = Math.hypot(dx, dy);
            const speed = stealthSim.keys['shift'] ? p.speed * 1.8 : p.speed;
            p.noiseRadius = stealthSim.keys['shift'] ? 90 : 35;
            
            const nextX = p.x + (dx / mag) * speed;
            const nextY = p.y + (dy / mag) * speed;

            if (!isPointInWall(nextX, p.y)) p.x = Math.max(15, Math.min(canvas.width - 15, nextX));
            if (!isPointInWall(p.x, nextY)) p.y = Math.max(15, Math.min(canvas.height - 15, nextY));
        } else {
            p.noiseRadius = 15;
        }

        // Enemy AI State Machine
        const distToPlayer = Math.hypot(p.x - e.x, p.y - e.y);
        const angleToPlayer = Math.atan2(p.y - e.y, p.x - e.x);
        let angleDiff = Math.abs(angleToPlayer - e.angle);
        while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - Math.PI * 2);

        const inVisionCone = angleDiff < e.fov / 2 && distToPlayer <= e.viewDistance;
        const hasLOS = inVisionCone ? checkLineOfSight(e.x, e.y, p.x, p.y) : false;
        const heardNoise = distToPlayer <= p.noiseRadius + e.radius && distToPlayer < 160;

        if (hasLOS) {
            const proximityFactor = 1 + (1 - distToPlayer / e.viewDistance) * 1.5;
            e.detectionLevel = Math.min(100, e.detectionLevel + e.detectionRate * proximityFactor);
            e.lastKnownPlayerPos = { x: p.x, y: p.y };
        } else if (heardNoise) {
            e.detectionLevel = Math.min(100, e.detectionLevel + 0.8);
            e.lastKnownPlayerPos = { x: p.x, y: p.y };
        } else {
            e.detectionLevel = Math.max(0, e.detectionLevel - e.decayRate);
        }

        // State Transitions
        if (e.detectionLevel >= 85) {
            e.state = 'ALERT';
            // Turn and pursue
            e.angle = Math.atan2(p.y - e.y, p.x - e.x);
            const chaseDist = Math.hypot(p.x - e.x, p.y - e.y);
            if (chaseDist > 40) {
                e.x += Math.cos(e.angle) * 1.8;
                e.y += Math.sin(e.angle) * 1.8;
            }
        } else if (e.detectionLevel >= 30) {
            e.state = 'SUSPICIOUS';
            if (e.lastKnownPlayerPos) {
                const targetAngle = Math.atan2(e.lastKnownPlayerPos.y - e.y, e.lastKnownPlayerPos.x - e.x);
                e.angle += (targetAngle - e.angle) * 0.08;
            }
        } else {
            e.state = 'PATROL';
            e.patrolTime += e.patrolSpeed;
            e.x = e.patrolCenter.x + Math.cos(e.patrolTime) * e.patrolRadius;
            e.y = e.patrolCenter.y + Math.sin(e.patrolTime * 1.5) * (e.patrolRadius * 0.6);
            e.angle = e.patrolTime + Math.PI / 2;
        }

        // Update UI Readout
        updateReadouts(e.state, e.detectionLevel, distToPlayer);
    }

    function drawStealthSim() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Grid Background
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        const gridSize = 30;
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // 2. Obstacles
        ctx.fillStyle = '#1e2029';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        stealthSim.obstacles.forEach((o) => {
            ctx.fillRect(o.x, o.y, o.w, o.h);
            ctx.strokeRect(o.x, o.y, o.w, o.h);
            // Hatch pattern inside obstacle
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
            for (let i = 0; i < o.w + o.h; i += 10) {
                ctx.beginPath();
                ctx.moveTo(o.x + i, o.y);
                ctx.lineTo(o.x, o.y + i);
                ctx.stroke();
            }
        });

        const e = stealthSim.enemy;
        const p = stealthSim.player;

        // 3. Enemy Vision Cone
        let coneColor = 'rgba(16, 185, 129, 0.12)';
        let coneBorder = 'rgba(16, 185, 129, 0.4)';
        if (e.state === 'SUSPICIOUS') {
            coneColor = 'rgba(234, 179, 8, 0.18)';
            coneBorder = 'rgba(234, 179, 8, 0.6)';
        } else if (e.state === 'ALERT') {
            coneColor = 'rgba(239, 68, 68, 0.25)';
            coneBorder = 'rgba(239, 68, 68, 0.8)';
        }

        ctx.fillStyle = coneColor;
        ctx.strokeStyle = coneBorder;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        ctx.arc(e.x, e.y, e.viewDistance, e.angle - e.fov / 2, e.angle + e.fov / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 4. Player Noise Radius
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.noiseRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // 5. Enemy Entity
        ctx.fillStyle = e.state === 'ALERT' ? '#ef4444' : e.state === 'SUSPICIOUS' ? '#eab308' : '#e2e8f0';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Enemy Facing Indicator
        ctx.strokeStyle = '#08080a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(e.x + Math.cos(e.angle) * (e.radius + 8), e.y + Math.sin(e.angle) * (e.radius + 8));
        ctx.stroke();

        // 6. Player Entity
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.font = '10px JetBrains Mono';
        ctx.fillText('AGENT', p.x - 16, p.y - 18);
    }

    function updateReadouts(state, detection, dist) {
        const stateElem = document.getElementById('aiStateValue');
        const meterElem = document.getElementById('aiDetectionMeter');
        const distElem = document.getElementById('aiDistanceValue');

        if (stateElem) {
            stateElem.textContent = state;
            stateElem.className = 'state-alert-indicator ' + (
                state === 'ALERT' ? 'state-alert' :
                state === 'SUSPICIOUS' ? 'state-suspicious' : 'state-patrol'
            );
        }
        if (meterElem) {
            meterElem.textContent = Math.round(detection) + '%';
        }
        if (distElem) {
            distElem.textContent = Math.round(dist) + ' px';
        }
    }

    // ==========================================
    // 2. COMBAT FRAME DATA SIMULATOR
    // ==========================================
    const combatSim = {
        currentFrame: 0,
        totalFrames: 45,
        startup: 8,
        active: 6,
        recovery: 22,
        cancelWindow: 14,
        isPlaying: true,
        playSpeed: 1
    };

    function drawCombatSim() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = '#09090c';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const centerY = canvas.height / 2;
        const timelineWidth = Math.min(canvas.width - 80, 680);
        const startX = (canvas.width - timelineWidth) / 2;
        const barHeight = 40;

        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Space Grotesk';
        ctx.fillText('MELEE HEAVY SLASH // FRAME DATA ARCHITECTURE', startX, centerY - 80);

        // Frame Bar Track
        ctx.fillStyle = '#16171d';
        ctx.fillRect(startX, centerY - barHeight / 2, timelineWidth, barHeight);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.strokeRect(startX, centerY - barHeight / 2, timelineWidth, barHeight);

        const frameWidth = timelineWidth / combatSim.totalFrames;

        // Draw Frame Slices
        // Startup (Cyan)
        ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.fillRect(startX, centerY - barHeight / 2, combatSim.startup * frameWidth, barHeight);

        // Active Hitbox (Red)
        ctx.fillStyle = 'rgba(239, 68, 68, 0.65)';
        ctx.fillRect(
            startX + combatSim.startup * frameWidth,
            centerY - barHeight / 2,
            combatSim.active * frameWidth,
            barHeight
        );

        // Cancel Window (Green Marker)
        ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
        ctx.fillRect(
            startX + (combatSim.startup + combatSim.active) * frameWidth,
            centerY - barHeight / 2,
            combatSim.cancelWindow * frameWidth,
            barHeight
        );

        // Scrub Marker / Playhead
        const playheadX = startX + combatSim.currentFrame * frameWidth;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(playheadX, centerY - 35);
        ctx.lineTo(playheadX, centerY + 35);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(playheadX, centerY - 38, 6, 0, Math.PI * 2);
        ctx.fill();

        // Current Frame Readout
        ctx.font = '12px JetBrains Mono';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(
            `FRAME: ${Math.floor(combatSim.currentFrame)} / ${combatSim.totalFrames}`,
            startX,
            centerY + 55
        );

        let phaseText = 'STARTUP';
        let phaseColor = '#06b6d4';
        if (combatSim.currentFrame >= combatSim.startup && combatSim.currentFrame < combatSim.startup + combatSim.active) {
            phaseText = 'ACTIVE HITBOX (DAMAGE & HITSTOP)';
            phaseColor = '#ef4444';
        } else if (combatSim.currentFrame >= combatSim.startup + combatSim.active) {
            if (combatSim.currentFrame <= combatSim.startup + combatSim.active + combatSim.cancelWindow) {
                phaseText = 'RECOVERY [DODGE CANCEL WINDOW OPEN]';
                phaseColor = '#10b981';
            } else {
                phaseText = 'LATE RECOVERY (VULNERABLE)';
                phaseColor = '#eab308';
            }
        }

        ctx.fillStyle = phaseColor;
        ctx.fillText(`PHASE: ${phaseText}`, startX + 160, centerY + 55);

        // Loop animation
        if (combatSim.isPlaying) {
            combatSim.currentFrame += 0.5 * combatSim.playSpeed;
            if (combatSim.currentFrame > combatSim.totalFrames) {
                combatSim.currentFrame = 0;
            }
        }
    }

    // ==========================================
    // MAIN SIMULATION LOOP
    // ==========================================
    function mainLoop() {
        if (currentMode === 'stealth') {
            updateStealthSim();
            drawStealthSim();
        } else {
            drawCombatSim();
        }
        animationFrameId = requestAnimationFrame(mainLoop);
    }
    mainLoop();

    // ==========================================
    // UI CONTROLS & EVENT LISTENERS
    // ==========================================
    const tabStealth = document.getElementById('tabStealthAI');
    const tabCombat = document.getElementById('tabCombatData');
    const fovSlider = document.getElementById('fovSlider');
    const fovVal = document.getElementById('fovVal');
    const distSlider = document.getElementById('distSlider');
    const distVal = document.getElementById('distVal');

    if (tabStealth && tabCombat) {
        tabStealth.addEventListener('click', () => {
            currentMode = 'stealth';
            tabStealth.classList.add('active');
            tabCombat.classList.remove('active');
        });
        tabCombat.addEventListener('click', () => {
            currentMode = 'combat';
            tabCombat.classList.add('active');
            tabStealth.classList.remove('active');
        });
    }

    if (fovSlider && fovVal) {
        fovSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            stealthSim.enemy.fov = (val * Math.PI) / 180;
            fovVal.textContent = val + '°';
        });
    }

    if (distSlider && distVal) {
        distSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            stealthSim.enemy.viewDistance = val;
            distVal.textContent = val + 'px';
        });
    }
})();
