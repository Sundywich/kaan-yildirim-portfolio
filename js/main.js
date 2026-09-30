/**
 * KAAN YILDIRIM // TECHNICAL GAME DESIGNER PORTFOLIO
 * MAIN APPLICATION LOGIC, AUDIO SYNTHESIS, MODALS & INTERACTIONS
 * Works 100% locally via file:// protocol
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. PROCEDURAL NOIR AUDIO ENGINE (WEB AUDIO API)
    // ==========================================
    let audioCtx = null;
    let isAudioEnabled = false;

    function initAudio() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playTactileClick(freq = 1200, type = 'sine', duration = 0.04, gainVal = 0.04) {
        if (!isAudioEnabled || !audioCtx) return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(180, audioCtx.currentTime + duration);

            gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            // Graceful fallback
        }
    }

    function playSubtleHover() {
        if (!isAudioEnabled || !audioCtx) return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(850, audioCtx.currentTime);

            gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 0.03);
        } catch (e) {}
    }

    // Audio Toggle Button
    const audioBtn = document.getElementById('audioToggleBtn');
    if (audioBtn) {
        audioBtn.addEventListener('click', () => {
            initAudio();
            isAudioEnabled = !isAudioEnabled;
            audioBtn.classList.toggle('active', isAudioEnabled);
            audioBtn.setAttribute('aria-pressed', isAudioEnabled);
            const icon = audioBtn.querySelector('.audio-icon');
            if (icon) {
                icon.textContent = isAudioEnabled ? '🔊' : '🔇';
            }
            showToast(isAudioEnabled ? 'Tactile Sound: ENABLED' : 'Tactile Sound: MUTED');
            if (isAudioEnabled) playTactileClick(1400, 'triangle', 0.08, 0.08);
        });
    }

    // Attach sound triggers to interactive elements
    document.querySelectorAll('.btn-noir, .nav-link, .filter-tab-btn, .lab-tab-btn, .profile-link-btn').forEach(elem => {
        elem.addEventListener('mouseenter', playSubtleHover);
        elem.addEventListener('click', () => playTactileClick(1100, 'sine', 0.05, 0.05));
    });

    // ==========================================
    // 2. SCROLL SPY & NAVIGATION HIGHLIGHTING
    // ==========================================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function onScrollSpy() {
        const scrollPos = window.scrollY + 140;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    window.addEventListener('scroll', onScrollSpy);

    // Mobile Navigation Toggle
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');
    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener('click', () => {
            mainNav.classList.toggle('mobile-expanded');
        });

        // Close on link click
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('mobile-expanded');
            });
        });
    }

    // ==========================================
    // 3. PROJECT FILTERING SYSTEM
    // ==========================================
    const filterButtons = document.querySelectorAll('.filter-tab-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filter = button.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category') || '';
                if (filter === 'all' || category.includes(filter)) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 20);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 200);
                }
            });
        });
    });

    // ==========================================
    // 4. PROJECT DEEP-DIVE CASE STUDY MODAL
    // ==========================================
    const caseStudiesData = {
        'shadow-protocol': {
            title: 'Shadow Protocol // Stealth Action Systems',
            subtitle: 'Unreal Engine 5 • C++ & Blueprints • Dynamic AI Perception',
            tags: ['AI State Machine', 'CQC Frame Data', 'Dynamic Vision Cones', 'Environment Traversal'],
            overview: 'A hardboiled tactical stealth action prototype engineered to explore multi-layered AI perception, line-of-sight raycasting, and high-impact physical close-quarters combat takedowns.',
            architecture: [
                'Perception Component: Custom C++ raycaster calculating lighting exposure and distance attenuation.',
                'State Machine: 5-stage AI response (Patrol, Suspicious, Searching, Hunt, Combat Alert) with squad coordination tokens.',
                'Player Character Controller: Physics-blended mantle and ledge traversal with dynamic camera occlusion solver.'
            ],
            metrics: 'Delivered 60 FPS on mid-tier hardware with 24 concurrent active AI units utilizing hierarchical state evaluation.',
            docSnippet: `// Perception Update Logic (Excerpt)
void UStealthPerceptionComponent::EvaluateTargetVisibility(AActor* Target) {
    float Distance = FVector::Dist(GetOwner()->GetActorLocation(), Target->GetActorLocation());
    if (Distance > MaxVisionDistance) return;
    
    float LightFactor = CalculateLightIntensityAtLocation(Target->GetActorLocation());
    float DetectionRate = BaseDetectionSpeed * LightFactor * (1.0f - (Distance / MaxVisionDistance));
    CurrentDetectionMeter = FMath::Clamp(CurrentDetectionMeter + DetectionRate * DeltaTime, 0.0f, 100.0f);
}`
        },
        'chronoblade': {
            title: 'ChronoBlade // Frame-Exact Melee Combat Engine',
            subtitle: 'Unity C# • High Responsiveness • Hitbox & Hurtbox Pipeline',
            tags: ['Combat Design', 'Animation Cancels', 'Hitstop & Screenshake', 'Input Buffering'],
            overview: 'A technical melee combat system prototype focused on tactile game feel ("juice"), deterministic animation cancel windows, and precise frame-data management.',
            architecture: [
                'Input Buffer Queue: 8-frame FIFO buffer allowing seamless combos and buffered parry windows.',
                'Hitbox Subsystem: ScriptableObject-driven weapon frame data containing active frames, damage values, poise damage, and vector pushbacks.',
                'Hitstop Orchestrator: Micro-freeze frame engine scaling hitstop duration based on critical hits and parries.'
            ],
            metrics: 'Zero input latency feel with consistent 120Hz physics evaluation and customizable frame-data inspector editor tools.',
            docSnippet: `// Frame Data Trigger Event
public struct AttackFrameData {
    public int startupFrames;
    public int activeHitFrames;
    public int recoveryFrames;
    public int cancelWindowStart;
    public float hitstopDuration;
    public Vector3 launchVector;
}`
        },
        'project-aethelgard': {
            title: 'Project Aethelgard // Procedural Dungeon Architecture',
            subtitle: 'Unreal Engine 5 • Procedural Generation • Economy Balancing',
            tags: ['Procedural Generation', 'Economy Design', 'Loot Math', 'Modular Level Design'],
            overview: 'A dark gothic dungeon crawler built on an extensible room-graph generation algorithm with dynamic loot scaling and risk/reward encounter balancing.',
            architecture: [
                'Room Graph Generator: Delaunay triangulation + Minimum Spanning Tree (MST) dungeon room layout builder.',
                'Loot & Economy Formula: Mathematical drop curves tied to player equipment tier and dungeon depth coefficients.',
                'Dynamic Lighting Optimizer: Runtime light culling for performance optimization in complex cavern geometry.'
            ],
            metrics: 'Generates 50-room dungeon ecosystems in under 120ms with 100% path traversability guarantee and zero deadlocks.',
            docSnippet: `// Graph MST Solver for Procedural Pathing
void UDungeonGraphGenerator::GenerateMSTCorridors() {
    TArray<FDungeonEdge> SpanningTree = KruskalAlgorithm(AllPotentialEdges);
    AddCycleLoops(SpanningTree, 0.15f); // 15% cyclical loops for non-linear exploration
    SpawnModularCorridorActors(SpanningTree);
}`
        },
        'neon-syndicate': {
            title: 'Neon Syndicate // Graph Deduction Detective Engine',
            subtitle: 'Unity C# • Emergent Clues • Dynamic Dialogue State Tree',
            tags: ['Narrative Systems', 'Graph Theory', 'Evidence System', 'Logic Deductions'],
            overview: 'A cyber-noir detective investigation system where players connect clues on an interactive pinboard to form logical deduction hypotheses that influence NPC interrogation dialogues.',
            architecture: [
                'Evidence Node Graph: Nodes represent evidence pieces; edges represent logical correlations and contradictions.',
                'Dialogue Injection Engine: Nodes unlocked by player dynamically inject questioning branches into dialogue trees.',
                'Dynamic Clue Verification: Validates complex hypothesis queries without hardcoded story flags.'
            ],
            metrics: 'Supports 200+ interconnected clues with sub-millisecond graph validation and zero narrative desync.',
            docSnippet: `// Deduction Node Graph Validation
public bool ValidateHypothesis(ClueNode suspect, ClueNode motive, ClueNode weapon) {
    return EvidenceGraph.HasValidPath(suspect, motive) && 
           EvidenceGraph.HasValidPath(motive, weapon) &&
           !EvidenceGraph.HasContradiction(suspect, weapon);
}`
        },
        'void-walker': {
            title: 'Void Walker // Gravity Inversion Physics Platformer',
            subtitle: 'Global Game Jam Winner • 48-Hour Rapid Prototype',
            tags: ['Physics Controller', 'Rapid Prototyping', 'Level Design', 'Jam Winner'],
            overview: 'Developed in 48 hours for Global Game Jam. Features an inverted gravity vector mechanic with tight, responsive momentum conservation and modular hazard scripting.',
            architecture: [
                'Custom Gravity Vector Controller: Decoupled character physics allowing dynamic 360-degree surface reorientation.',
                'Momentum Transfer Pipeline: Velocity conservation across gravity shifts creating emergent speedrun routes.',
                'Visual Scripting Integration: Rapidly authored 18 distinct challenge chambers within 24 hours.'
            ],
            metrics: 'Awarded "Best Gameplay Mechanics" and "Community Choice" out of 80+ participating jam teams.',
            docSnippet: `// Dynamic Gravity Vector Shift
void ApplyGravityInversion(FVector NewGravityDirection) {
    CharacterMovement->GravityDirection = NewGravityDirection;
    FQuat TargetRotation = FRotationMatrix::MakeFromZX(-NewGravityDirection, GetActorForwardVector()).ToQuat();
    SetActorRotation(TargetRotation);
}`
        },
        'echoes-abyss': {
            title: 'Echoes of the Abyss // Deep Sea Spatial Audio & AI',
            subtitle: 'Unreal Engine 5 • Underwater Physics • Flocking AI',
            tags: ['Flocking Systems', 'Audio Propagation', 'Volumetric VFX', 'Environmental Storytelling'],
            overview: 'Atmospheric sci-fi thriller prototype exploring realistic underwater hydrodynamics, Boids flocking algorithms for deep-sea fauna, and distance-attenuated acoustic sonars.',
            architecture: [
                'Boids Flocking System: GPU/CPU hybrid calculation for 500+ emergent sea creature schools with predator avoidance.',
                'Acoustic Sonar Ping: Real-time soundwave sphere expanding and pinging hidden geometry and hostile entities.'
            ],
            metrics: 'Stable 90 FPS in VR mode with realistic volumetric caustic lighting and 3D spatialized binaural audio.',
            docSnippet: `// Boids Separation & Cohesion Vector
FVector CalculateBoidSteering(const TArray<ABoidAgent*>& Neighbors) {
    FVector Separation = ComputeSeparation(Neighbors);
    FVector Alignment = ComputeAlignment(Neighbors);
    FVector Cohesion = ComputeCohesion(Neighbors);
    return (Separation * 1.5f) + (Alignment * 1.0f) + (Cohesion * 0.8f);
}`
        }
    };

    const modalBackdrop = document.getElementById('caseStudyModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const modalTags = document.getElementById('modalTags');
    const modalOverview = document.getElementById('modalOverview');
    const modalArchitecture = document.getElementById('modalArchitecture');
    const modalMetrics = document.getElementById('modalMetrics');
    const modalCodeSnippet = document.getElementById('modalCodeSnippet');

    function openModal(projectId) {
        const data = caseStudiesData[projectId];
        if (!data) return;

        if (modalTitle) modalTitle.textContent = data.title;
        if (modalSubtitle) modalSubtitle.textContent = data.subtitle;
        if (modalOverview) modalOverview.textContent = data.overview;
        if (modalMetrics) modalMetrics.textContent = data.metrics;
        if (modalCodeSnippet) modalCodeSnippet.textContent = data.docSnippet;

        if (modalTags) {
            modalTags.innerHTML = data.tags.map(t => `<span class="badge-pill badge-tag">${t}</span>`).join('');
        }

        if (modalArchitecture) {
            modalArchitecture.innerHTML = data.architecture.map(a => `<li>${a}</li>`).join('');
        }

        modalBackdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        if (modalBackdrop) {
            modalBackdrop.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    // Attach open triggers to case study buttons
    document.querySelectorAll('.open-case-study-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const projectId = btn.getAttribute('data-project');
            openModal(projectId);
        });
    });

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) {
                closeModal();
            }
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalBackdrop && modalBackdrop.classList.contains('open')) {
            closeModal();
        }
    });

    // ==========================================
    // 5. TOAST NOTIFICATIONS & EMAIL COPY
    // ==========================================
    const toastElem = document.getElementById('noirToast');
    let toastTimeout = null;

    function showToast(message) {
        if (!toastElem) return;
        toastElem.textContent = message;
        toastElem.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toastElem.classList.remove('show');
        }, 3200);
    }

    const copyEmailBtn = document.getElementById('copyEmailBtn');
    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', () => {
            const email = 'kaan.yildirim.gamedev@example.com';
            navigator.clipboard.writeText(email).then(() => {
                showToast('✓ Email address copied to clipboard');
            }).catch(() => {
                showToast('Email: kaan.yildirim.gamedev@example.com');
            });
        });
    }

    // Contact Form handling (Mailto Generator / Friendly feedback)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('formName')?.value || 'Inquirer';
            const email = document.getElementById('formEmail')?.value || '';
            const subject = document.getElementById('formSubject')?.value || 'Technical Game Design Inquiry';
            const message = document.getElementById('formMessage')?.value || '';

            const mailtoUrl = `mailto:kaan.yildirim.gamedev@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;
            window.location.href = mailtoUrl;

            showToast('✓ Opening mail client to send message...');
            contactForm.reset();
        });
    }

    // Smooth anchor scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;
            const targetElem = document.querySelector(targetId);
            if (targetElem) {
                e.preventDefault();
                targetElem.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
