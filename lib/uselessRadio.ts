// @ts-nocheck
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseClient    = typeof window !== 'undefined'
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

function setupExistingWindows() {
    // Setup media player windows
    setupMediaPlayerWindow('video');
    setupMediaPlayerWindow('Videos');
    
    // Regular window controls
    document.querySelectorAll('.window-btn.close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const window = e.target.closest('.window');
            if (window) {
                const appName = window.id.replace('window-', '');
                closeWindow(appName);
            }
        });
    });

    document.querySelectorAll('.window-btn.minimize').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const window = e.target.closest('.window');
            if (window) {
                const appName = window.id.replace('window-', '');
                minimizeWindow(appName);
            }
        });
    });

    // Make windows draggable and resizable (desktop only)
    document.querySelectorAll('.window, .media-player-window').forEach(win => {
        if (!IS_MOBILE_DEVICE) {
            makeWindowDraggable(win);
            makeWindowResizable(win);
        }
    });
}

function setupMediaPlayerWindow(playerType) {
    const window = document.getElementById(`window-${playerType}`);
    const taskbarBtn = document.getElementById(`taskbar-${playerType}`);

    if (!window) return;

    // Use the correct button selectors based on window type
    let closeBtn, minimizeBtn;
    
    closeBtn = window.querySelector('.media-btn.close');
    minimizeBtn = window.querySelector('.media-btn.minimize');

    if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        // Pause the appropriate video player before closing
        if (playerType === 'video' && mainPlayer && mainPlayer.pauseVideo) {
            mainPlayer.pauseVideo();
        } else if (playerType === 'Videos' && VideosPlayer && VideosPlayer.pauseVideo) {
            VideosPlayer.pauseVideo();
        }
        
        window.style.display = 'none';
        if (taskbarBtn && taskbarBtn.parentNode) {
            taskbarBtn.remove();
        }
    });
}

    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => {
            window.style.display = 'none';
            if (taskbarBtn) taskbarBtn.classList.remove('active');
        });
    }

    if (taskbarBtn) {
        taskbarBtn.addEventListener('click', () => {
            if (window.style.display === 'none') {
                window.style.display = 'block';
                window.style.zIndex = ++zIndex;
                taskbarBtn.classList.add('active');
            } else {
                window.style.zIndex = ++zIndex;
            }
        });
    }
}

// Window management
let zIndex = 1000;
const taskbarApps = document.getElementById('taskbarApps');

function openWindow(appName) {
    // iOS app: openStore handler is registered in WKWebView (ViewController.swift) but not in mobile Safari.
    // Swift handler calls UIApplication.shared.open directly — no WKWebView navigation triggered.
    if (appName === 'store' && globalThis.webkit?.messageHandlers?.openStore) {
        globalThis.webkit.messageHandlers.openStore.postMessage(null);
        return;
    }

    // Mobile Safari (website): fall through to embedded Windows98 window below (full-screen sizing).

    // Capture before the local 'let window = ...' shadows the global window object.
    const isMobile = IS_MOBILE_DEVICE;

    const windowId = `window-${appName}`;
    let window = document.getElementById(windowId);

    if (!window) {
        createWindow(appName);
        window = document.getElementById(windowId);
    }

    if (window) {
        // FIXED: Mobile-specific positioning and sizing
        if (isMobile) {
            // Mobile: centered positioning that covers icons
            window.style.position = 'fixed';
            window.style.top = '10px';
            window.style.left = '10px';
            window.style.width = 'calc(100vw - 20px)';
            window.style.height = 'calc(100vh - 64px)';
            window.style.maxWidth = 'calc(100vw - 20px)';
            window.style.maxHeight = 'calc(100vh - 64px)';
            window.style.minWidth = 'unset';
            window.style.minHeight = 'unset';
            window.style.transform = 'none';
        } else {
            // Desktop: Random positioning and sizing (except video)
            if (appName !== 'video') {
                let randomWidth, randomHeight;
                
                // Personal bio windows get tall and lean format
                if (['Swampfoot', 'Owen-Givens', 'Mannisupreme', 'Jordan-walker'].includes(appName)) {
                    randomWidth = Math.floor(Math.random() * 150) + 450; // 450-600px (narrower)
                    randomHeight = Math.floor(Math.random() * 200) + 650; // 650-850px (taller)
                } else if (appName === 'store') {
                    // Store: fixed large size, centered
                    const vw = document.documentElement.clientWidth;
                    const vh = document.documentElement.clientHeight;
                    window.style.width = '850px';
                    window.style.height = '650px';
                    window.style.left = Math.max(20, (vw - 850) / 2) + 'px';
                    window.style.top = Math.max(20, (vh - 650) / 4) + 'px';
                } else {
                    // Other windows use regular random sizing
                    randomWidth = Math.floor(Math.random() * 400) + 400; // 400-800px
                    randomHeight = Math.floor(Math.random() * 300) + 300; // 300-600px
                }
                
                if (randomWidth !== undefined) {
                    const randomX = Math.floor(Math.random() * (globalThis.innerWidth - randomWidth - 50));
                    const randomY = Math.floor(Math.random() * (globalThis.innerHeight - randomHeight - 100));

                    window.style.width = randomWidth + 'px';
                    window.style.height = randomHeight + 'px';
                    window.style.left = randomX + 'px';
                    window.style.top = randomY + 'px';
                }
            }
        }
        
        window.style.display = 'block';
        window.style.zIndex = ++zIndex;
        addToTaskbar(appName);

    } else {
        console.error('Failed to create/find window for:', appName);
    }
    
    const startMenu = document.getElementById('startMenu');
    const startBtn = document.getElementById('startBtn');
    if (startMenu) startMenu.style.display = 'none';
    if (startBtn) startBtn.classList.remove('active');
}

function addToTaskbar(appName) {
        // Skip adding taskbar apps on mobile
    if (window.IS_MOBILE_DEVICE) return;
    
    if (document.getElementById(`taskbar-${appName}`)) return;
    
    const taskbarBtn = document.createElement('button');
    taskbarBtn.className = 'taskbar-app';
    taskbarBtn.id = `taskbar-${appName}`;
    taskbarBtn.textContent = appName.charAt(0).toUpperCase() + appName.slice(1).replace('-', ' ');
    taskbarBtn.addEventListener('click', () => {
        const window = document.getElementById(`window-${appName}`);
        if (window.style.display === 'none') {
            window.style.display = 'block';
            window.style.zIndex = ++zIndex;
            taskbarBtn.classList.add('active');
        } else {
            window.style.zIndex = ++zIndex;
        }
    });
    
    if (taskbarApps) {
        taskbarApps.appendChild(taskbarBtn);
        taskbarBtn.classList.add('active');
    }
}

function closeWindow(appName) {
    const window = document.getElementById(`window-${appName}`);
    const taskbarBtn = document.getElementById(`taskbar-${appName}`);
    
    if (window) {
        window.style.display = 'none';
        // Special handling for Videos window
        if (appName === 'Videos') {
            window.classList.add('hidden-window');
        }
    }
    if (taskbarBtn) taskbarBtn.remove();
}

function minimizeWindow(appName) {
    const window = document.getElementById(`window-${appName}`);
    const taskbarBtn = document.getElementById(`taskbar-${appName}`);
    
    if (window) window.style.display = 'none';
    if (taskbarBtn) taskbarBtn.classList.remove('active');
}

function createWindow(appName) {
    if (document.getElementById(`window-${appName}`)) return;
    
    const windowDiv = document.createElement('div');
    windowDiv.className = 'window draggable resizable';
    windowDiv.id = `window-${appName}`;
    
    const icons = {
        'Videos': '📹', 'forum': '💬', 'store': '🛒', 'tracks': '💿', 
        'lounge': '🎵', 'contact': '📞', 'about': 'ℹ️',
        'Swampfoot': '👑', 'Owen-Givens': '🎸', 'Mannisupreme': '🔥', 'Jordan-walker': '🎤'
    };
    const icon = icons[appName] || '📁';
    
    const displayName = appName.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    // Check if this app should load a website in iframe
    if (WEBSITE_URLS[appName] && !EXTERNAL_APPS.includes(appName) && appName !== 'Videos') {
        windowDiv.innerHTML = `
            <div class="window-header">
                <div class="window-title">${icon} ${displayName}</div>
                <div class="window-controls">
                    <button class="window-btn minimize">_</button>
                    <button class="window-btn maximize">□</button>
                    <button class="window-btn close">×</button>
                </div>
            </div>
            <div class="window-content">
                <iframe class="web-iframe" src="${WEBSITE_URLS[appName]}" title="${appName} Website" frameborder="0" allowfullscreen></iframe>
            </div>
        `;
    } else if (appName === 'lounge') {
    windowDiv.className = 'media-player-window draggable resizable';
    windowDiv.innerHTML = `
        <div class="media-player-header">
            <div class="media-player-title">🎵 Music Lounge - Live Streams</div>
            <div class="media-player-controls">
                <button class="media-btn minimize">_</button>
                <button class="media-btn maximize">□</button>
                <button class="media-btn close">×</button>
            </div>
        </div>
        <div class="media-player-content">
            <!-- Toggle Buttons -->
            <div style="display: flex; gap: 5px; padding: 8px; background: #c0c0c0; border-bottom: 2px solid #808080;">
                <button id="showYouTubeBtn" onclick="switchLoungeEmbed('youtube')" style="flex: 1; padding: 8px; background: #ff0000; color: white; border: 2px outset #ff0000; cursor: pointer; font-weight: bold; font-size: 11px;">
                    ▶️ YouTube View
                </button>
                <button id="showTwitchBtn" onclick="switchLoungeEmbed('twitch')" style="flex: 1; padding: 8px; background: #808080; color: white; border: 2px inset #808080; cursor: pointer; font-weight: bold; font-size: 11px;">
                    📺 Twitch View
                </button>
            </div>
            
            <!-- YouTube Embed (visible by default) -->
            <div id="loungeYouTubeEmbed" class="video-display">
                <div id="loungeVideoPlayer" class="media-iframe"></div>
            </div>
            
            <!-- Twitch Embed (hidden by default) -->
            <div id="loungeTwitchEmbed" class="video-display" style="display: none;">
                <iframe 
                    id="loungeTwitchPlayer"
                    src="https://player.twitch.tv/?channel=uselessradio&parent=uselessradio.com&parent=www.uselessradio.com&parent=127.0.0.1&parent=localhost&autoplay=false&muted=true"
                    class="media-iframe"
                    style="width: 100%; height: 100%; border: none;"
                    allowfullscreen>
                </iframe>
            </div>
            
            <div class="media-controls">
                <div class="control-buttons">
                    <button class="control-btn" id="loungePlayPauseBtn">▶</button>
                    <button class="control-btn" id="loungeStopBtn">⏹</button>
                </div>
                <div class="progress-section">
                    <span class="time-display">--:--</span>
                    <div class="progress-bar-container">
                        <div class="progress-bar"></div>
                        <input type="range" class="progress-slider" min="0" max="100" value="0" disabled>
                    </div>
                    <span class="time-display">--:--</span>
                </div>
                <div class="volume-section">
                    <button class="control-btn" id="loungeMuteBtn">🔇</button>
                </div>
            </div>
            <div class="media-info" style="flex-direction: column; align-items: stretch; padding: 12px; gap: 10px; height: auto; border-top: 2px solid #c0c0c0;">
                <div class="now-playing" id="loungeNowPlaying" style="text-align: center; margin-bottom: 8px; font-weight: bold;">🎵 YouTube Player Ready</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <button onclick="window.open('https://www.youtube.com/@uselessradio/streams', '_blank')" style="padding: 12px 20px; background: #ff0000; color: white; border: 2px outset #ff0000; cursor: pointer; font-weight: bold; font-size: 12px;">
                        ▶️ YouTube Live
                    </button>
                    <button onclick="window.open('https://www.twitch.tv/uselessradio', '_blank')" style="padding: 12px 20px; background: #9146ff; color: white; border: 2px outset #9146ff; cursor: pointer; font-weight: bold; font-size: 12px;">
                        📺 Twitch
                    </button>
                </div>
                <div class="media-status" style="text-align: center; margin-top: 8px; font-size: 10px;">Toggle between YouTube/Twitch or click buttons for live streams</div>
            </div>
        </div>
    `;

    // Add to desktop FIRST
    const desktop = document.querySelector('.desktop');
    if (desktop) {
        desktop.appendChild(windowDiv);
    }

    // NOW setup YouTube player and controls AFTER window exists in DOM
    setTimeout(() => {
        if (document.getElementById('loungeVideoPlayer') && !loungePlayer) {
            loungePlayer = new YT.Player('loungeVideoPlayer', {
                videoId: 'OzjqHjUvPUw',
                playerVars: {
                    autoplay: 0,
                    mute: 1,
                    controls: 1,
                    modestbranding: 1,
                    rel: 0
                },
                events: {
                    onReady: function(event) {
                        event.target.mute();
                        mediaPlayerStates.lounge = { playing: false, volume: 100, muted: true };
                        
                        // Setup controls AFTER player is ready
                        const playPauseBtn = document.getElementById('loungePlayPauseBtn');
                        const stopBtn = document.getElementById('loungeStopBtn');
                        const muteBtn = document.getElementById('loungeMuteBtn');
                        
                        if (playPauseBtn) {
                            playPauseBtn.addEventListener('click', () => {
                                try {
                                    const playerState = loungePlayer.getPlayerState();
                                    if (playerState === YT.PlayerState.PLAYING) {
                                        loungePlayer.pauseVideo();
                                        playPauseBtn.textContent = '▶';
                                    } else {
                                        loungePlayer.playVideo();
                                        playPauseBtn.textContent = '⏸';
                                    }
                                } catch (e) {
                                    console.error('Lounge play/pause error:', e);
                                }
                            });
                        }
                        
                        if (stopBtn) {
                            stopBtn.addEventListener('click', () => {
                                try {
                                    loungePlayer.stopVideo();
                                    if (playPauseBtn) playPauseBtn.textContent = '▶';
                                } catch (e) {
                                    console.error('Lounge stop error:', e);
                                }
                            });
                        }
                        
                        if (muteBtn) {
                            muteBtn.addEventListener('click', () => {
                                try {
                                    if (loungePlayer.isMuted()) {
                                        loungePlayer.unMute();
                                        loungePlayer.setVolume(100);
                                        muteBtn.textContent = '🔊';
                                    } else {
                                        loungePlayer.mute();
                                        muteBtn.textContent = '🔇';
                                    }
                                } catch (e) {
                                    console.error('Lounge mute error:', e);
                                }
                            });
                        }
                    },
                    
                    
                    onError: function(event) {
                        console.error('YouTube lounge error:', event.data);
                    },
                    onStateChange: function(event) {
                        const playPauseBtn = document.getElementById('loungePlayPauseBtn');
                        if (event.data === YT.PlayerState.PLAYING) {
                            if (playPauseBtn) playPauseBtn.textContent = '⏸';
                        } else if (event.data === YT.PlayerState.PAUSED) {
                            if (playPauseBtn) playPauseBtn.textContent = '▶';
                        }
                    }
                }
            });
        }
        
        // Add progress bar tracking for lounge
        const progressSlider = document.querySelector('#window-lounge .progress-slider');
        const progressBar = document.querySelector('#window-lounge .progress-bar');
        const timeDisplays = document.querySelectorAll('#window-lounge .time-display');
        let isDragging = false;

        if (progressSlider) {
            progressSlider.disabled = false;
            progressSlider.style.opacity = '0';
            
            progressSlider.addEventListener('mousedown', () => { isDragging = true; });
            progressSlider.addEventListener('mouseup', () => { isDragging = false; });
            document.addEventListener('mouseup', () => { isDragging = false; });
            
            progressSlider.addEventListener('input', (e) => {
                if (loungePlayer && loungePlayer.getDuration) {
                    const duration = loungePlayer.getDuration();
                    const seekTime = (e.target.value / 100) * duration;
                    loungePlayer.seekTo(seekTime, true);
                    if (progressBar) progressBar.style.width = e.target.value + '%';
                }
            });
        }

        // Update progress regularly
        setInterval(() => {
            if (loungePlayer && loungePlayer.getCurrentTime && loungePlayer.getDuration && !isDragging) {
                try {
                    const currentTime = loungePlayer.getCurrentTime();
                    const duration = loungePlayer.getDuration();
                    
                    if (duration > 0) {
                        const progressPercent = (currentTime / duration) * 100;
                        if (progressBar) progressBar.style.width = progressPercent + '%';
                        if (progressSlider) progressSlider.value = progressPercent;
                        
                        if (timeDisplays.length >= 2) {
                            timeDisplays[0].textContent = formatTime(currentTime);
                            timeDisplays[1].textContent = formatTime(duration);
                        }
                    }
                } catch (e) {}
            }
        }, 100)
        // Setup window close/minimize buttons
        const loungeWindow = document.getElementById('window-lounge');
        if (loungeWindow) {
            const closeBtn = loungeWindow.querySelector('.media-btn.close');
            const minimizeBtn = loungeWindow.querySelector('.media-btn.minimize');
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    if (loungePlayer && loungePlayer.pauseVideo) {
                        loungePlayer.pauseVideo();
                    }
                    loungeWindow.style.display = 'none';
                    const taskbarBtn = document.getElementById('taskbar-lounge');
                    if (taskbarBtn) taskbarBtn.remove();
                });
            }
            
            if (minimizeBtn) {
                minimizeBtn.addEventListener('click', () => {
                    loungeWindow.style.display = 'none';
                    const taskbarBtn = document.getElementById('taskbar-lounge');
                    if (taskbarBtn) taskbarBtn.classList.remove('active');
                });
            }
        }
    }, 1000);
    
    // Don't process the rest of createWindow - return early
    return;
    } else if (appName === 'forum') {
        windowDiv.innerHTML = `
            <div class="window-header">
                <div class="window-title">&#128172; Forum</div>
                <div class="window-controls">
                    <button class="window-btn minimize">_</button>
                    <button class="window-btn maximize">&#9633;</button>
                    <button class="window-btn close">&#215;</button>
                </div>
            </div>
            <div class="forum-container">
                <div class="forum-messages" id="forumMessages">
                    <div class="forum-loading">Loading messages...</div>
                </div>
                <div class="forum-toolbar">
                    <div class="forum-emoji-row">
                        <!-- CUSTOM EMOJI 1: replace emoji text with <img src="emoji1.png" class="forum-emoji-img" alt="emoji"> for a custom icon -->
                        <button class="forum-emoji-btn" onclick="forumAddEmoji('&#127925;')" title="Music Note">&#127925;</button>
                        <!-- CUSTOM EMOJI 2 -->
                        <button class="forum-emoji-btn" onclick="forumAddEmoji('&#128293;')" title="Fire">&#128293;</button>
                        <!-- CUSTOM EMOJI 3 -->
                        <button class="forum-emoji-btn" onclick="forumAddEmoji('&#128128;')" title="Skull">&#128128;</button>
                        <!-- CUSTOM EMOJI 4 -->
                        <button class="forum-emoji-btn" onclick="forumAddEmoji('&#128126;')" title="Alien">&#128126;</button>
                        <!-- CUSTOM EMOJI 5 -->
                        <button class="forum-emoji-btn" onclick="forumAddEmoji('&#127928;')" title="Guitar">&#127928;</button>
                        <!-- CUSTOM EMOJI 6 -->
                        <button class="forum-emoji-btn" onclick="forumAddEmoji('&#129304;')" title="Rock On">&#129304;</button>
                        <!-- CUSTOM EMOJI 7 -->
                        <button class="forum-emoji-btn" onclick="forumAddEmoji('&#128191;')" title="CD">&#128191;</button>
                        <!-- CUSTOM EMOJI 8 -->
                        <button class="forum-emoji-btn" onclick="forumAddEmoji('&#128251;')" title="Radio">&#128251;</button>
                    </div>
                    <div class="forum-input-row">
                        <textarea class="forum-input" id="forumInput"
                            placeholder="Sign in as a member to post..."
                            disabled rows="2"
                            onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();forumSubmitPost();}"></textarea>
                        <!-- SEND ARROW: swap for custom icon — <img src="send.png" style="width:16px;height:16px;"> -->
                        <button class="forum-action-icon-btn" id="forumSendBtn"
                                onclick="forumSubmitPost()" disabled title="Send (Enter)">&#9658;</button>
                        <!-- UPLOAD: swap for custom icon — <img src="upload.png" style="width:16px;height:16px;"> -->
                        <button class="forum-action-icon-btn" id="forumUploadBtn"
                                title="Attach image (coming soon)" disabled>&#128206;</button>
                        <!-- TRASH / CLEAR: swap for custom icon — <img src="trash.png" style="width:16px;height:16px;"> -->
                        <button class="forum-action-icon-btn"
                                onclick="forumClearInput()" title="Clear message">&#128465;</button>
                    </div>
                    <div class="forum-status-bar">
                        <span id="forumStatusText">Not signed in &#8212; members only</span>
                    </div>
                </div>
            </div>
        `;
    } else if (appName === 'about') {
        // ABOUT SECTION WITH CUSTOM CONTENT
        windowDiv.innerHTML = `
            <div class="window-header">
                <div class="window-title">${icon} About Useless Radio</div>
                <div class="window-controls">
                    <button class="window-btn minimize">_</button>
                    <button class="window-btn maximize">□</button>
                    <button class="window-btn close">×</button>
                </div>
            </div>
            <div class="window-content" style="padding: 20px; line-height: 1.6;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #000080; font-size: 24px; margin-bottom: 10px;">Welcome to Useless Radio</h2>
                    <div style="width: 60px; height: 3px; background: #000080; margin: 0 auto;"></div>
                </div>
                
                <div style="background: #f0f0f0; border: 1px inset #c0c0c0; padding: 20px; margin-bottom: 25px;">
                    <h3 style="color: #000080; margin-bottom: 15px; font-size: 16px;">🎵 Our Mission</h3>
                    <p style="margin-bottom: 15px;">[useless radio] is a collection of creatives—web designers, producers, musicians, filmmakers, and more—who grew up watching weird sh*t (except for Manni).</p>
                    <p> Our mission is to bring a fresh take on rap music and create a space that feels like home—through sounds and aesthetics.</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                    <div style="background: white; border: 1px inset #c0c0c0; padding: 15px;">
                        <h4 style="color: #000080; margin-bottom: 10px;">🎤 What We Do</h4>
                        <ul style="margin-left: 15px; color: #333;">
                            <li>Live radio shows and podcasts</li>
                            <li>Music video production</li>
                            <li>Artist interviews & features</li>
                            <li>Community events & showcases</li>
                        </ul>
                    </div>
                    <div style="background: white; border: 1px inset #c0c0c0; padding: 15px;">
                        <h4 style="color: #000080; margin-bottom: 10px;">🌟 Our Values</h4>
                        <ul style="margin-left: 15px; color: #333;">
                            <li>Authentic</li>
                            <li>Timeless</li>
                            <li>Energetic</li>
                            <li>Bold</li>
                        </ul>
                    </div>
                </div>

                <div style="background: #e6f3ff; border: 1px inset #c0c0c0; padding: 20px; margin-bottom: 20px;">
                    <h3 style="color: #000080; margin-bottom: 15px; font-size: 16px;">📻 The Useless Radio Experience</h3>
                    <p style="margin-bottom: 10px;">
                        If you're here you just stumbled upon Atlanta's newest platform for obscure media.
                        Expect to see a fusion of Atlanta's underground rap meshing with an eclectic group of
                        filmmakers.</p>
                    <p><strong>You already know who we are.</strong></p>
                </div>

                <div style="text-align: center; background: #c0c0c0; border: 1px inset #c0c0c0; padding: 15px;">
                    <p style="font-style: italic; color: #666; margin-bottom: 10px;">""You're here because you got nothing better to do""</p>
                    <p style="font-size: 12px; color: #000080; font-weight: bold;">- [useless radio]</p>
                </div>
            </div>
        `;
    } else if (appName === 'Camera Roll') {
        windowDiv.innerHTML = `
            <div class="window-header">
                <div class="window-title">📷 Camera Roll</div>
                <div class="window-controls">
                    <button class="window-btn minimize">_</button>
                    <button class="window-btn maximize">□</button>
                    <button class="window-btn close">×</button>
                </div>
            </div>
            <div class="window-content" style="padding: 0; overflow: hidden;">
                <div class="camera-toolbar" style="background: #c0c0c0; border-bottom: 2px groove #808080; padding: 4px; display: flex; gap: 4px; flex-wrap: wrap;">
                    <button class="camera-tool-btn" onclick="cameraRoll.prevPhoto()" title="Previous">◄</button>
                    <button class="camera-tool-btn" onclick="cameraRoll.nextPhoto()" title="Next">►</button>
                    <span style="padding: 4px 8px; border: 1px inset #c0c0c0; font-size: 11px;" id="photoCounter">1 / 1</span>
                    <div style="width: 1px; height: 24px; background: #808080; margin: 0 4px;"></div>
                    <button class="camera-tool-btn" onclick="cameraRoll.setTool('pen')" id="toolPen" title="Pen">✏️</button>
                    <button class="camera-tool-btn" onclick="cameraRoll.setTool('eraser')" id="toolEraser" title="Eraser">🧹</button>
                    <button class="camera-tool-btn" onclick="cameraRoll.setTool('line')" id="toolLine" title="Line">📏</button>
                    <button class="camera-tool-btn" onclick="cameraRoll.setTool('rect')" id="toolRect" title="Rectangle">▭</button>
                    <button class="camera-tool-btn" onclick="cameraRoll.setTool('circle')" id="toolCircle" title="Circle">○</button>
                    <div style="width: 1px; height: 24px; background: #808080; margin: 0 4px;"></div>
                    <input type="color" id="drawColor" value="#000000" style="width: 32px; height: 24px; border: 1px inset #c0c0c0; cursor: pointer;" onchange="cameraRoll.setColor(this.value)">
                    <input type="range" id="brushSize" min="1" max="20" value="2" style="width: 80px;" oninput="cameraRoll.setBrushSize(this.value)">
                    <span style="font-size: 10px; padding: 4px;">Size: <span id="brushSizeDisplay">2</span>px</span>
                    <div style="width: 1px; height: 24px; background: #808080; margin: 0 4px;"></div>
                    <button class="camera-tool-btn" onclick="cameraRoll.clearDrawing()" title="Clear Drawing">🗑️</button>
                    <button class="camera-tool-btn" onclick="cameraRoll.saveImage()" title="Save Image">💾</button>
                </div>
                <div class="camera-view" style="position: relative; width: 100%; height: calc(100% - 40px); overflow: auto; background: #808080;">
                    <canvas id="cameraCanvas" style="display: block; margin: auto; cursor: crosshair; max-width: 100%; max-height: 100%;"></canvas>
                </div>
            </div>
        `;
    } else if (appName === 'tracks') {
    windowDiv.innerHTML = `
        <div class="window-header">
            <div class="window-title">💿 Tracks</div>
            <div class="window-controls">
                <button class="window-btn minimize">_</button>
                <button class="window-btn maximize">□</button>
                <button class="window-btn close">×</button>
            </div>
        </div>
        <div class="window-content" style="padding:0;display:flex;flex-direction:column;overflow:hidden;">
            <div style="display:flex;gap:5px;padding:8px;background:#c0c0c0;border-bottom:2px solid #808080;flex-shrink:0;">
                <button id="tracksSpotifyBtn" onclick="switchTracksPlatform('spotify')" style="flex:1;padding:8px;background:#1DB954;color:white;border:2px outset #1DB954;cursor:pointer;font-weight:bold;font-size:11px;font-family:inherit;">🎵 Spotify</button>
                <button id="tracksAppleBtn"    onclick="switchTracksPlatform('apple')"     style="flex:1;padding:8px;background:#808080;color:white;border:2px inset #808080;cursor:pointer;font-weight:bold;font-size:11px;font-family:inherit;">🍎 Apple Music</button>
                <button id="tracksSoundcloudBtn" onclick="switchTracksPlatform('soundcloud')" style="flex:1;padding:8px;background:#808080;color:white;border:2px inset #808080;cursor:pointer;font-weight:bold;font-size:11px;font-family:inherit;">🔊 SoundCloud</button>
            </div>
            <div id="tracksGrid" style="flex:1;overflow-y:auto;padding:15px;">
                <div style="color:#888;font-size:11px;font-style:italic;text-align:center;padding:20px;">Loading tracks...</div>
            </div>
        </div>
    `;
    } else if (appName === 'contact') {
        windowDiv.innerHTML = `
            <div class="window-header">
                <div class="window-title">${icon} Contact</div>
                <div class="window-controls">
                    <button class="window-btn minimize">_</button>
                    <button class="window-btn maximize">□</button>
                    <button class="window-btn close">×</button>
                </div>
            </div>
            <div class="window-content" style="padding: 20px;">
                <h3>Get In Touch</h3>
                <p style="margin-bottom: 20px;">Ready to connect with the Useless Radio collective? We'd love to hear from you!</p>
                
                <div style="background: white; border: 1px inset #c0c0c0; padding: 20px; margin-bottom: 20px;">
                    <h4 style="color: #000080; margin-bottom: 15px;">📧 Contact Information</h4>
                    <div style="margin-bottom: 10px;"><strong>Email:</strong> hellouselessradio@gmail.com</div>
                    <div style="margin-bottom: 10px;"><strong>Instagram:</strong> @useless.radio</div>
                    <div style="margin-bottom: 10px;"> </div>
                    <div style="margin-bottom: 14px;"><strong>CREDITS</strong></div>
                    <div style="margin-bottom: 10px;"><strong>Web-design:</strong> ethanfountain03@gmail.com</div>
                    <div style="margin-bottom: 10px;"><strong>Artist Graphics:</strong> hellocinzanol@gmail.com</div>
                </div>

                <div style="background: #f0f0f0; border: 1px inset #c0c0c0; padding: 20px;">
                    <h4 style="color: #000080; margin-bottom: 15px;">🤝 Collaborate With Us</h4>
                    <p style="margin-bottom: 10px;">Whether you're an artist looking for a platform, a creative wanting to collaborate, or just a fan who wants to say hello - we're always open to new connections.</p>
                    <p><strong>Follow us on our social platforms and join the community!</strong></p>
                </div>
            </div>
        `;
    
    } else {
        // Personal icons and other generic windows
        let personalContent = '';
        
        if (['Swampfoot', 'Owen-Givens', 'Mannisupreme', 'Jordan-walker'].includes(appName)) {
            const memberInfo = {
                'Swampfoot': {
                    role: 'Producer/Musician',
                    bio: 'Master of beats and the sonic architect of our sound. Hey guys, I\'m Swamp. Go listen to my music nigga I have nothing else to say to you.',
                    skills: 'I can make beats, I can do a backflip, I can spontaneously combust in flames on command.',
                    image: 'z.Swampfootpic.jpg',
                    imageSize: '400px'
                },
                'Owen-Givens': {
                    role: 'Creative',
                    bio: 'Born out of a test tube straight from the labs of Warner Robins GA. IT is speculated the father\'s donated specimen was that of Justin Timberlake\'s, which is what many believe to be the reason why Owen has such an angelic singing voice.',
                    skills: 'Singing, Fencing, Dog-Whispering',
                    image: 'z.owenhead.png',
                    imageSize: '400px'
                },
                'Mannisupreme': {
                    role: 'Host/Co-creator',
                    bio: 'The youngest radio personality in america with a full time radio slot who is aiming to make radio great again',
                    skills: 'Black Belt, Bicycle enthusiast, can eat three icecream cones and not get brain freeze',
                    image: 'z.manni2.png',
                    imageSize: '400px'
                },
                'Jordan-walker': {
                    role: 'Creative Director/CO-Creator',
                    bio: 'I hate bios, I\'m going to use this opportunity to plug my other ventures that you can find on cinzanol.xyz!',
                    skills: 'Debate, Ride a bike with no hands, Skribbling',
                    image: 'z.jordan2.png',
                    imageSize: '400px'
                }
            };
            
            const info = memberInfo[appName];
            if (info) {
                // Get custom size from IMAGE_SIZES config
                const bioSize = IMAGE_SIZES.bio[appName] || { width: 200, height: 200 };
                
                personalContent = `
                    <div style="text-align: center; padding: 20px;">
                        <div style="margin-bottom: 20px;">
                            <img src="${info.image}" alt="${displayName}" style="width: ${bioSize.width}px; height: ${bioSize.height}px; object-fit: cover; border-radius: 8px; border: 2px solid #000080; box-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                        </div>
                        <h2 style="margin-bottom: 10px; font-size: 18px; color: #000080;">${displayName}</h2>
                        <h3 style="margin-bottom: 15px; font-size: 14px; color: #666; font-style: italic;">${info.role}</h3>
                        <p style="margin-bottom: 20px; line-height: 1.4; color: #333; white-space: pre-line;">${info.bio}</p>
                        <div style="border: 1px inset #c0c0c0; padding: 15px; background: #f0f0f0; text-align: left;">
                            <strong>Skills:</strong><br>
                            <span style="color: #666;">${info.skills}</span>
                        </div>
                    </div>
                `;
            } else {
                personalContent = `
                    <p>Welcome to ${displayName}!</p>
                    <p>The ${appName} section is coming soon. Please check back regularly.</p>
                `;
            }
        } else {
            personalContent = `
                <p>Welcome to ${displayName}!</p>
                <p>The ${appName} section is coming soon. Please check back regularly.</p>
            `;
        }
        
        windowDiv.innerHTML = `
            <div class="window-header">
                <div class="window-title">${icon} ${displayName}</div>
                <div class="window-controls">
                    <button class="window-btn minimize">_</button>
                    <button class="window-btn maximize">□</button>
                    <button class="window-btn close">×</button>
                </div>
            </div>
            <div class="window-content">
                ${personalContent}
            </div>
        `;
    }
    
    const desktop = document.querySelector('.desktop');
    if (desktop) {
        desktop.appendChild(windowDiv);
        
        const closeBtn = windowDiv.querySelector('.window-btn.close');
        const minimizeBtn = windowDiv.querySelector('.window-btn.minimize');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeWindow(appName));
        }
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => minimizeWindow(appName));
        }
        
        // Only make draggable/resizable on desktop
        if (!window.IS_MOBILE_DEVICE) {
            makeWindowDraggable(windowDiv);
            makeWindowResizable(windowDiv);
            
        }
        if (appName === 'Camera Roll') {
            setTimeout(() => initCameraRoll(), 100);
        }
        if (appName === 'forum') {
            setTimeout(() => initForum(), 200);
        }
        if (appName === 'tracks') {
            setTimeout(() => loadTracksFromDB(), 50);
        }

}}

function makeWindowDraggable(windowElement) {
    const header = windowElement.querySelector('.window-header, .media-player-header');
    if (!header) return;
    
    let isDragging = false;
    let currentX, currentY, initialX, initialY;
    
    header.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('window-btn') || e.target.classList.contains('media-btn')) return;
        isDragging = true;
        windowElement.style.zIndex = ++zIndex;
        initialX = e.clientX - windowElement.offsetLeft;
        initialY = e.clientY - windowElement.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            
            const maxX = window.innerWidth - windowElement.offsetWidth;
            const maxY = window.innerHeight - windowElement.offsetHeight - 36;
            
            currentX = Math.max(0, Math.min(currentX, maxX));
            currentY = Math.max(0, Math.min(currentY, maxY));
            
            windowElement.style.left = currentX + 'px';
            windowElement.style.top = currentY + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

function makeWindowResizable(windowElement) {
    let isResizing = false;
    let currentX, currentY, initialX, initialY, initialWidth, initialHeight;
    
    // Create resize handle if it doesn't exist
    let resizeHandle = windowElement.querySelector('.resize-handle');
    if (!resizeHandle) {
        resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        resizeHandle.style.cssText = `
            position: absolute;
            bottom: 0;
            right: 0;
            width: 20px;
            height: 20px;
            cursor: se-resize;
            z-index: 10;
            background: linear-gradient(-45deg, transparent 0%, transparent 40%, #808080 40%, #808080 60%, transparent 60%, transparent 100%);
        `;
        windowElement.appendChild(resizeHandle);
    }
    
    resizeHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        initialX = e.clientX;
        initialY = e.clientY;
        initialWidth = parseInt(window.getComputedStyle(windowElement).width, 10);
        initialHeight = parseInt(window.getComputedStyle(windowElement).height, 10);
        windowElement.style.zIndex = ++zIndex;
    });

    document.addEventListener('mousemove', (e) => {
        if (isResizing) {
            e.preventDefault();
            const deltaX = e.clientX - initialX;
            const deltaY = e.clientY - initialY;
            
            const newWidth = Math.max(300, initialWidth + deltaX);
            const newHeight = Math.max(200, initialHeight + deltaY);
            
            windowElement.style.width = newWidth + 'px';
            windowElement.style.height = newHeight + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
    });
}

// Make global functions accessible
window.closeMannivirusPopup = closeMannivirusPopup;
window.closeEventPromoPopup = closeEventPromoPopup;// IMPROVED DESKTOP DETECTION - Replace the code at the top of your script.js
// This fixes the window minimizing issues and startup video problems

// SIMPLE MOBILE DETECTION - Replace the code at the top of your script.js
// This fixes window issues with a minimal approach

(function() {
    // Simple mobile detection
    function isTrueMobileDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent);
    }

    // Treat portfolio embeds as mobile — ?embed=1 is passed by the portfolio iframe src
    function isEmbedParam() {
        return new URLSearchParams(window.location.search).has('embed');
    }

    // Set global flag and CSS class
    window.IS_MOBILE_DEVICE = isTrueMobileDevice() || isEmbedParam();

    if (window.IS_MOBILE_DEVICE) {
        document.body.classList.add('mobile-device');
    } else {
        document.body.classList.add('desktop-device');

        // Force minimum width for desktop
        document.body.style.minWidth = '1024px';

        // Set viewport for desktop
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            viewport.content = 'width=1024';
            document.head.appendChild(viewport);
        } else {
            viewport.setAttribute('content', 'width=1024');
        }
    }
})();
// ⚡ WEBSITE CONFIGURATION - CHANGE YOUR URLS HERE ⚡
const WEBSITE_URLS = {
    'videos': [
        'https://www.youtube.com/embed/Burqi3TxQN4',
        'https://www.youtube.com/embed/_eZm9cpJtC0', // Updated LILSCRRT Interview video
        'https://www.youtube.com/embed/QMLRuMPrYF0',
        'https://www.youtube.com/embed/CPw1wHqulxg',
        'https://www.youtube.com/embed/dqHhRDJyIjc',
        'https://www.youtube.com/watch?v=g0qgA97NegU'
    ],
    'store': 'https://uselessradio.com/store/',
    'lounge': null,
    'tracks': null,
    // Personal icons
    'Swampfoot': null,
    'Owen-Givens': null,
    'Mannisupreme': null,
    'Jordan-walker': null
};

// ⚡ ALBUM PROMO POPUP CONFIGURATION ⚡
const EVENT_PROMO = {
    eventTitle: "[useless] Listening Party",
    eventDate: "October 31, 2025",
    eventLocation: "RSVP for Location",
    eventUrl: "",
    flyerImage: "z.eventflyer1.jpg", // Your event flyer image
    delayAfterStartup: 3000
};

// ⚡ IMAGE SIZE CONFIGURATION ⚡
const IMAGE_SIZES = {
    // Personal bio image sizes (width x height in pixels)
    bio: {
        'Swampfoot': { width: 300, height: 300 },
        'Owen-Givens': { width: 220, height: 220 },
        'Mannisupreme': { width: 250, height: 250 }, // Adjust z.manni2.png size here
        'Jordan-walker': { width: 225, height: 225 }
    },
    // Taskbar icon sizes (width x height in pixels)
    taskbar: {
        'Swampfoot': { width: 36, height: 36 }, // Desktop size
        'Owen-Givens': { width: 36, height: 36 }, // Desktop size
        'Mannisupreme': { width: 36, height: 36 }, // Desktop size
        'Jordan-walker': { width: 36, height: 36 } // Desktop size (perfect reference)
    },
    // Mobile taskbar icon sizes
    taskbarMobile: {
        'Swampfoot': { width: 44, height: 44 }, // Mobile size
        'Owen-Givens': { width: 44, height: 44 }, // Mobile size
        'Mannisupreme': { width: 44, height: 44 }, // Mobile size
        'Jordan-walker': { width: 44, height: 44 } // Mobile size
    }
};

// Videos playlist — loaded from Supabase at runtime, sorted by sort_order.
// Each entry: { id, title, youtube_id, sort_order }
let videosList = [];

// Tracks list — loaded from Supabase `tracks` table; falls back to TRACKS_ITEMS.
// Each entry: { id, title, image_url, spotify_url, apple_music_url, soundcloud_url, sort_order }
let tracksList = [];
let currentTracksPlatform = 'spotify';

const MAIN_VIDEO_ID = '7VxjjCIMK3w';

// Camera Roll Photos - Add your image paths here
const CAMERA_ROLL_PHOTOS = [
    'Lookbook/Lookbook39.JPEG',
    'Lookbook/WhiteTee2.png',
    'Lookbook/Lookbook18.jpeg',
    'Lookbook/Lookbook19.jpeg',
    'Lookbook/Lookbook40.jpg',
    'Lookbook/Lookbook29.PNG',
    'Lookbook/Lookbook5.JPEG',
    'Lookbook/Lookbook9.jpg',
    'Lookbook/Lookbook38.JPG',
    'Lookbook/Lookbook2.JPEG',
    'Lookbook/Lookbook1.JPEG',
    'Lookbook/Lookbook8.jpg',
    'Lookbook/Lookbook37.JPG',
    'MLookbook/Lookbook10.jpg',
    'Lookbook/Lookbook12.jpeg',
    'Lookbook/Lookbook14.jpeg',
    'Lookbook/Lookbook36.jpg',
    'Lookbook/Lookbook22.jpeg',
    'Lookbook/Lookbook16.JPG',
    'Lookbook/Lookbook35.PNG',
    'Lookbook/Lookbook4.JPEG',
    'Lookbook/Lookbook3.JPEG',
    'Lookbook/Lookbook11.jpg'
    
];

// (Videos_TITLES removed — titles now come from videosList loaded from Supabase)

// Tracks configuration — fallback data used when the Supabase `tracks` table is empty or unavailable.
// Add spotify_url / apple_music_url / soundcloud_url once those are live.
const TRACKS_ITEMS = [
    {
        title: "Die Good Vol.1",
        image: "z.DIE GOOD ALBUM COVER.png",
        spotify_url: "",
        apple_music_url: "",
        soundcloud_url: "https://soundcloud.com/uselessradio/sets/die-good-vol-1",
        type: "album"
    },
    {
        title: "Die Good Vol.2",
        image: "z.DieGoodVol2AlbumCover.jpg",
        spotify_url: "",
        apple_music_url: "https://distrokid.com/hyperfollow/uselessradio/die-good-vol-2-foundin-fathers-2/",
        soundcloud_url: "",
        type: "album"
    }
];

// Apps that should open in new tabs instead of iframes
const EXTERNAL_APPS = [];

// Startup sequence variables
let startupComplete = false;

// Mannivirus system
let mannivirusTriggered = false;
let popupCount = 0;
let popupZIndex = 15000;

// Media Player State
let currentVideosIndex = 0;
let mediaPlayerStates = {
    main: { playing: true, volume: 100, muted: true },
    Videos: { playing: false, volume: 100, muted: true },
    startup: { playing: false, volume: 33, muted: true },
    lounge: { playing: false, volume: 100, muted: true }
};

// YouTube Players
let mainPlayer = null;
let VideosPlayer = null;
let loungePlayer = null;
let youTubeAPIReady = false;

// ⚡ COUNTDOWN TIMER CONFIGURATION ⚡
// Set your target drop date here (YYYY-MM-DD format)
const DROP_DATE_CONFIG = {
    enabled: false, // Set to true when you have a drop date, false for TBA
    date: new Date('2025-09-26T00:00:00'), // Your drop date when enabled
    tbaText: '[TBA]' // Text to show when no drop is scheduled
};

// Load YouTube API
function loadYouTubeAPI() {
    if (window.YT) {
        youTubeAPIReady = true;
        return;
    }
    
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// YouTube API Ready Callback
window.onYouTubeIframeAPIReady = function() {
    youTubeAPIReady = true;
    initializeYouTubePlayers();
};

function initializeYouTubePlayers() {
    // Initialize main video player
    if (document.getElementById('mainVideoPlayer')) {
        mainPlayer = new YT.Player('mainVideoPlayer', {
            videoId: MAIN_VIDEO_ID,
            playerVars: {
                autoplay: 1,
                mute: 1,
                loop: 1,
                playlist: MAIN_VIDEO_ID,
                controls: 0,
                modestbranding: 1,
                rel: 0
            },
            events: {
                onReady: function(event) {
                    event.target.setVolume(0); // Start muted
                    event.target.mute(); // Ensure muted
                    updateMediaStatus('main', 'Playing (Muted)');
                },
                onStateChange: function(event) {
                    const playPauseBtn = document.getElementById('mainPlayPauseBtn');
                    if (event.data === YT.PlayerState.PLAYING) {
                        if (playPauseBtn) playPauseBtn.textContent = '⏸';
                        mediaPlayerStates.main.playing = true;
                        updateMediaStatus('main', mediaPlayerStates.main.muted ? 'Playing (Muted)' : 'Playing');
                    } else if (event.data === YT.PlayerState.PAUSED) {
                        if (playPauseBtn) playPauseBtn.textContent = '▶';
                        mediaPlayerStates.main.playing = false;
                        updateMediaStatus('main', 'Paused');
                    }
                }
            }

        });
    }


    // Initialize Videos player
    if (document.getElementById('VideosVideoPlayer')) {
        VideosPlayer = new YT.Player('VideosVideoPlayer', {
            videoId: videosList[0]?.youtube_id || MAIN_VIDEO_ID,
            playerVars: {
                controls: 0,
                modestbranding: 1,
                rel: 0,
                mute: 1 // Start muted
            },
            events: {
                onReady: function(event) {
                    event.target.mute(); // Ensure muted
                    updateMediaStatus('Videos', 'Ready (Muted)');
                },
                onStateChange: function(event) {
                    const playPauseBtn = document.getElementById('VideosPlayPauseBtn');
                    if (event.data === YT.PlayerState.PLAYING) {
                        if (playPauseBtn) playPauseBtn.textContent = '⏸';
                        mediaPlayerStates.Videos.playing = true;
                        updateMediaStatus('Videos', mediaPlayerStates.Videos.muted ? 'Playing (Muted)' : 'Playing');
                    } else if (event.data === YT.PlayerState.PAUSED) {
                        if (playPauseBtn) playPauseBtn.textContent = '▶';
                        mediaPlayerStates.Videos.playing = false;
                        updateMediaStatus('Videos', 'Paused');
                    }
                }
            }
        });
    }

}

// initApp — called from React component's useEffect (replaces DOMContentLoaded)
export function initApp() {
    if (!IS_MOBILE_DEVICE) loadYouTubeAPI();
    SiteSettings.load();
    initializeStartup();
    ProfileModal.init();
    Auth.init();
}

// Startup sequence
function initializeStartup() {
    const startupScreen = document.getElementById('startupScreen');
    const mainDesktop = document.getElementById('mainDesktop');
    const loadingBar = document.getElementById('loadingBar');
    const startupSound = document.getElementById('startupSound');

    mainDesktop.style.display = 'none';

    // Try to play startup sound
    if (startupSound) {
        document.addEventListener('click', () => {
            startupSound.play().catch(() => {});
        }, { once: true });

        startupSound.play().catch(() => {});
    }
    
    // Animate loading bar
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 25 + 5;
        if (progress > 100) progress = 100;

        loadingBar.style.width = progress + '%';

        if (progress >= 100) {
            clearInterval(loadingInterval);
            setTimeout(() => {
                finishStartup();
            }, 400);
        }
    }, 150);
    
    // Backup timeout
    setTimeout(() => {
        if (!startupComplete) {
            finishStartup();
        }
    }, 8000);
}

function finishStartup() {
    if (startupComplete) return;
    startupComplete = true;
    
    const startupScreen = document.getElementById('startupScreen');
    const mainDesktop = document.getElementById('mainDesktop');
    
    // Instantly swap - no transitions
    startupScreen.style.display = 'none';
    mainDesktop.style.display = 'block';

    // Fire the startup video immediately if settings are already loaded (pre-fetched at
    // DOMContentLoaded). If not ready yet, initializeDesktop() will call it once they load.
    try { launchStartupVideo(); } catch(e) {}

    // Initialize desktop immediately
    try { initializeDesktop(); } catch(e) { console.error('initializeDesktop error:', e); }
}

// ========== STARTUP VIDEO POPUP (self-contained) ==========
function launchStartupVideo() {
    // Prevent duplicate popups
    if (document.getElementById('sv-popup')) return;
    var settingsActive = SiteSettings?.data?.startup_video_active;
    var settingsId     = SiteSettings?.data?.startup_video_id;
    // Only show if admin explicitly enabled it AND provided a video ID — no hardcoded fallback
    if (!settingsActive || !settingsId) return;
    var VIDEO_ID = settingsId;
    var isMobile = window.IS_MOBILE_DEVICE;

    // Inject scoped styles
    var style = document.createElement('style');
    style.textContent = '#sv-popup{position:fixed;z-index:99999;background:#c0c0c0;border:2px outset #dfdfdf;box-shadow:3px 3px 8px rgba(0,0,0,.5);font-family:Tahoma,sans-serif;font-size:11px}#sv-popup.sv-desktop{top:60px;right:30px;width:560px;height:420px}#sv-popup.sv-mobile{top:90px;left:4px;width:calc(100vw - 8px);height:55vh}#sv-header{display:flex;justify-content:space-between;align-items:center;background:#c0c0c0;border-bottom:1px solid #808080;color:#000;padding:2px 4px;cursor:default;user-select:none;-webkit-user-select:none}#sv-header span{font-weight:bold;font-size:11px}#sv-btns button{background:#c0c0c0;border:2px outset #dfdfdf;width:18px;height:16px;font-size:10px;line-height:1;cursor:pointer;margin-left:2px;padding:0}#sv-btns button:active{border-style:inset}#sv-body{background:#000;width:100%;height:calc(100% - 22px)}#sv-body iframe{width:100%;height:100%;border:none}';
    document.head.appendChild(style);

    // Build popup
    var popup = document.createElement('div');
    popup.id = 'sv-popup';
    popup.className = isMobile ? 'sv-mobile' : 'sv-desktop';

    var header = document.createElement('div');
    header.id = 'sv-header';

    var title = document.createElement('span');
    title.textContent = 'Windows Media Player';

    var btns = document.createElement('div');
    btns.id = 'sv-btns';

    var minBtn = document.createElement('button');
    minBtn.textContent = '_';
    minBtn.title = 'Minimize';

    var closeBtn = document.createElement('button');
    closeBtn.textContent = 'x';
    closeBtn.title = 'Close';

    btns.appendChild(minBtn);
    btns.appendChild(closeBtn);
    header.appendChild(title);
    header.appendChild(btns);

    var body = document.createElement('div');
    body.id = 'sv-body';

    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/' + VIDEO_ID + '?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1';
    iframe.allow = 'autoplay; encrypted-media';
    iframe.allowFullscreen = true;
    body.appendChild(iframe);

    popup.appendChild(header);
    popup.appendChild(body);
    document.body.appendChild(popup);

    closeBtn.onclick = function() { popup.remove(); style.remove(); };
    minBtn.onclick = function() { popup.style.display = 'none'; };

    // Draggable on desktop
    if (!isMobile) {
        var dragging = false, dx = 0, dy = 0;
        header.onmousedown = function(e) {
            if (e.target.tagName === 'BUTTON') return;
            dragging = true;
            dx = e.clientX - popup.offsetLeft;
            dy = e.clientY - popup.offsetTop;
            popup.style.left = popup.offsetLeft + 'px';
            popup.style.right = 'auto';
        };
        document.addEventListener('mousemove', function(e) {
            if (!dragging) return;
            popup.style.left = Math.max(0, Math.min(e.clientX - dx, window.innerWidth - popup.offsetWidth)) + 'px';
            popup.style.top = Math.max(0, Math.min(e.clientY - dy, window.innerHeight - popup.offsetHeight)) + 'px';
        });
        document.addEventListener('mouseup', function() { dragging = false; });
    }
}
// ========== END STARTUP VIDEO POPUP ==========

function initializeDesktop() {
    updateClock();
    setInterval(updateClock, 1000);
    createMannivirusPixels();
    setupEventListeners();
    setupMediaPlayers();
    setupVideoAdminControls();
    loadVideosFromDB();
    loadTracksFromDB();
    applyTaskbarIconSizes();
    // Apply site settings once loaded — use the data already fetched at DOMContentLoaded
    // if it's ready; otherwise wait for the fetch to complete.
    const _applySettings = () => {
        // Startup video fires immediately when the desktop appears — no delay.
        try { launchStartupVideo(); } catch(e) { console.error('launchStartupVideo error:', e); }
        // Other popups (ticket, announcement, popup video, etc.) use the 1-second delay in applyToPage.
        try { SiteSettings.applyToPage(); } catch(e) { console.error('applyToPage error:', e); }
    };
    if (SiteSettings.data) {
        _applySettings();
    } else {
        SiteSettings.load().then(_applySettings);
    }
}

// Apply custom sizes to taskbar icons
function applyTaskbarIconSizes() {
    const isMobile = window.IS_MOBILE_DEVICE;
    document.querySelectorAll('.personal-icon').forEach(icon => {
        const appName = icon.dataset.app;
        const img = icon.querySelector('.personal-icon-img');
        // Use mobile sizes if on mobile device, otherwise use desktop sizes
        const sizeSource = isMobile ? IMAGE_SIZES.taskbarMobile : IMAGE_SIZES.taskbar;
        if (img && sizeSource && sizeSource[appName]) {
            const size = sizeSource[appName];
            img.style.width = size.width + 'px';
            img.style.height = size.height + 'px';
        }
    });
}

function setupMediaPlayers() {
    setupMainVideoPlayer();
    setupVideosPlayer();
    setupLoungeVideoPlayer();
}

function setupMainVideoPlayer() {
    const playPauseBtn = document.getElementById('mainPlayPauseBtn');
    const stopBtn = document.getElementById('mainStopBtn');
    const muteBtn = document.getElementById('mainMuteBtn');
    const progressSlider = document.querySelector('#window-video .progress-slider');
    const progressBar = document.querySelector('#window-video .progress-bar');
    const timeDisplays = document.querySelectorAll('#window-video .time-display');
    
    let isDragging = false;
    
    if (muteBtn) {
        muteBtn.textContent = '🔇'; // Start with muted icon
    }
    
    // Enable and setup progress slider
    if (progressSlider) {
        progressSlider.disabled = false;
        progressSlider.style.opacity = '0'; // Keep invisible but functional
        
        progressSlider.addEventListener('mousedown', () => { isDragging = true; });
        progressSlider.addEventListener('mouseup', () => { isDragging = false; });
        document.addEventListener('mouseup', () => { isDragging = false; });
        
        progressSlider.addEventListener('input', (e) => {
            if (mainPlayer && mainPlayer.getDuration) {
                const duration = mainPlayer.getDuration();
                const seekTime = (e.target.value / 100) * duration;
                mainPlayer.seekTo(seekTime, true);
                if (progressBar) progressBar.style.width = e.target.value + '%';
            }
        });
    }
    
    // Update progress regularly
    const mainProgressInterval = setInterval(() => {
        if (mainPlayer && mainPlayer.getCurrentTime && mainPlayer.getDuration && !isDragging) {
            try {
                const currentTime = mainPlayer.getCurrentTime();
                const duration = mainPlayer.getDuration();
                
                if (duration > 0) {
                    const progressPercent = (currentTime / duration) * 100;
                    if (progressBar) progressBar.style.width = progressPercent + '%';
                    if (progressSlider) progressSlider.value = progressPercent;
                    
                    if (timeDisplays.length >= 2) {
                        timeDisplays[0].textContent = formatTime(currentTime);
                        timeDisplays[1].textContent = formatTime(duration);
                    }
                }
            } catch (e) {
                // Ignore errors when player isn't ready
            }
        }
    }, 100); // Faster update for smoother slider
    
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (!mainPlayer) return;  // ← FIXED!
            
            if (mediaPlayerStates.main.playing) {
                mainPlayer.pauseVideo();
            } else {
                mainPlayer.playVideo();
            }
        });
    }
        
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            if (!mainPlayer) return;
            mainPlayer.stopVideo();
            playPauseBtn.textContent = '▶';
            mediaPlayerStates.main.playing = false;
            updateMediaStatus('main', 'Stopped');
        });
    }
    
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            if (!mainPlayer) return;
            
            if (mediaPlayerStates.main.muted) {
                mainPlayer.unMute();
                muteBtn.textContent = '🔊';
                mediaPlayerStates.main.muted = false;
                mainPlayer.setVolume(mediaPlayerStates.main.volume);
                updateMediaStatus('main', 'Playing');
            } else {
                mainPlayer.mute();
                muteBtn.textContent = '🔇';
                mediaPlayerStates.main.muted = true;
                updateMediaStatus('main', 'Playing (Muted)');
            }
        });
    }
}

function setupVideosPlayer() {
    const videoselector = document.getElementById('videoselector');
    const prevVideoBtn = document.getElementById('prevVideoBtn');
    const nextVideoBtn = document.getElementById('nextVideoBtn');
    const playlistCounter = document.getElementById('playlistCounter');
    const playPauseBtn = document.getElementById('VideosPlayPauseBtn');
    const stopBtn = document.getElementById('VideosStopBtn');
    const prevBtn = document.getElementById('VideosPrevBtn');
    const nextBtn = document.getElementById('VideosNextBtn');
    const muteBtn = document.getElementById('VideosMuteBtn');
    const nowPlaying = document.getElementById('VideosNowPlaying');
    const progressSlider = document.querySelector('#window-Videos .progress-slider');
    const progressBar = document.querySelector('#window-Videos .progress-bar');
    const timeDisplays = document.querySelectorAll('#window-Videos .time-display');
    
    let isDragging = false;
    
    if (muteBtn) {
        muteBtn.textContent = '🔇'; // Start with muted icon
    }
    
    // Enable and setup progress slider
    if (progressSlider) {
        progressSlider.disabled = false;
        progressSlider.style.opacity = '0'; // Keep invisible but functional
        
        progressSlider.addEventListener('mousedown', () => { isDragging = true; });
        progressSlider.addEventListener('mouseup', () => { isDragging = false; });
        document.addEventListener('mouseup', () => { isDragging = false; });
        
        progressSlider.addEventListener('input', (e) => {
            if (VideosPlayer && VideosPlayer.getDuration) {
                const duration = VideosPlayer.getDuration();
                const seekTime = (e.target.value / 100) * duration;
                VideosPlayer.seekTo(seekTime, true);
                if (progressBar) progressBar.style.width = e.target.value + '%';
            }
        });
    }
    
    // Update progress regularly
    const VideosProgressInterval = setInterval(() => {
        if (VideosPlayer && VideosPlayer.getCurrentTime && VideosPlayer.getDuration && !isDragging) {
            try {
                const currentTime = VideosPlayer.getCurrentTime();
                const duration = VideosPlayer.getDuration();
                
                if (duration > 0) {
                    const progressPercent = (currentTime / duration) * 100;
                    if (progressBar) progressBar.style.width = progressPercent + '%';
                    if (progressSlider) progressSlider.value = progressPercent;
                    
                    if (timeDisplays.length >= 2) {
                        timeDisplays[0].textContent = formatTime(currentTime);
                        timeDisplays[1].textContent = formatTime(duration);
                    }
                }
            } catch (e) {
                // Ignore errors when player isn't ready
            }
        }
    }, 100); // Faster update for smoother slider
    
    // Populate video selector dropdown from videosList
    if (videoselector) {
        videoselector.innerHTML = '';
        if (videosList.length === 0) {
            const opt = document.createElement('option');
            opt.textContent = 'No videos yet';
            videoselector.appendChild(opt);
        } else {
            videosList.forEach((v, index) => {
                const option = document.createElement('option');
                option.value = index.toString();
                option.textContent = `Video ${index + 1} - ${v.title}`;
                videoselector.appendChild(option);
            });
            videoselector.value = '0';
        }
    }
    
    updatePlaylistDisplay();
    
    if (videoselector) {
        videoselector.addEventListener('change', (e) => {
            const newIndex = parseInt(e.target.value);
            const video = videosList[newIndex];
            currentVideosIndex = newIndex;
            if (VideosPlayer && video?.youtube_id) {
                VideosPlayer.loadVideoById(video.youtube_id);
                const nowPlaying = document.getElementById('VideosNowPlaying');
                if (nowPlaying) {
                    nowPlaying.textContent = `Now Playing: ${video.title}`;
                }
                updatePlaylistDisplay();
                const playPauseBtn = document.getElementById('VideosPlayPauseBtn');
                if (playPauseBtn) {
                    playPauseBtn.textContent = '⏸';
                    mediaPlayerStates.Videos.playing = true;
                    updateMediaStatus('Videos', mediaPlayerStates.Videos.muted ? 'Playing (Muted)' : 'Playing');
                }
            }
        });
    }


    
    if (prevVideoBtn) {
        prevVideoBtn.addEventListener('click', () => {
            if (currentVideosIndex > 0) {
                switchToVideos(currentVideosIndex - 1);
            }
        });
    }

    if (nextVideoBtn) {
        nextVideoBtn.addEventListener('click', () => {
            if (currentVideosIndex < videosList.length - 1) {
                switchToVideos(currentVideosIndex + 1);
            }
        });
    }
    
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (!VideosPlayer) return;
            
            if (mediaPlayerStates.Videos.playing) {
                VideosPlayer.pauseVideo();
            } else {
                VideosPlayer.playVideo();
            }
        });
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            if (!VideosPlayer) return;
            VideosPlayer.stopVideo();
            playPauseBtn.textContent = '▶';
            mediaPlayerStates.Videos.playing = false;
            updateMediaStatus('Videos', 'Stopped');
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentVideosIndex > 0) {
                switchToVideos(currentVideosIndex - 1);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentVideosIndex < videosList.length - 1) {
                switchToVideos(currentVideosIndex + 1);
            }
        });
    }
    
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            if (!VideosPlayer) return;
            
            if (mediaPlayerStates.Videos.muted) {
                VideosPlayer.unMute();
                muteBtn.textContent = '🔊';
                mediaPlayerStates.Videos.muted = false;
                VideosPlayer.setVolume(mediaPlayerStates.Videos.volume);
                updateMediaStatus('Videos', 'Playing');
            } else {
                VideosPlayer.mute();
                muteBtn.textContent = '🔇';
                mediaPlayerStates.Videos.muted = true;
                updateMediaStatus('Videos', 'Playing (Muted)');
            }
        });
    }
}
function switchToVideos(index) {
    const video = videosList[index];
    if (!VideosPlayer || !video?.youtube_id) {
        console.error('Cannot switch to Videos:', index);
        return;
    }

    currentVideosIndex = index;
    VideosPlayer.loadVideoById(video.youtube_id);

    const videoselector = document.getElementById('videoselector');
    if (videoselector) videoselector.value = index.toString();

    const nowPlaying = document.getElementById('VideosNowPlaying');
    if (nowPlaying) nowPlaying.textContent = `Now Playing: ${video.title}`;

    updatePlaylistDisplay();

    const playPauseBtn = document.getElementById('VideosPlayPauseBtn');
    if (playPauseBtn) {
        playPauseBtn.textContent = '⏸';
        mediaPlayerStates.Videos.playing = true;
        updateMediaStatus('Videos', mediaPlayerStates.Videos.muted ? 'Playing (Muted)' : 'Playing');
    }
}

function updatePlaylistDisplay() {
    const playlistCounter = document.getElementById('playlistCounter');
    const prevVideoBtn = document.getElementById('prevVideoBtn');
    const nextVideoBtn = document.getElementById('nextVideoBtn');
    const total = videosList.length;

    if (playlistCounter) {
        playlistCounter.textContent = total > 0 ? `${currentVideosIndex + 1} / ${total}` : '0 / 0';
    }
    if (prevVideoBtn) {
        prevVideoBtn.disabled = currentVideosIndex === 0;
        prevVideoBtn.style.opacity = currentVideosIndex === 0 ? '0.5' : '1';
    }
    if (nextVideoBtn) {
        nextVideoBtn.disabled = currentVideosIndex >= total - 1;
        nextVideoBtn.style.opacity = currentVideosIndex >= total - 1 ? '0.5' : '1';
    }
}

function updateMediaStatus(player, status) {
    const statusElement = document.querySelector(`#window-${player === 'main' ? 'video' : player} .media-status`);
    if (statusElement) {
        statusElement.textContent = status;
    }
}

// =============================================
// VIDEOS — SUPABASE LOADING & ADMIN PANEL
// =============================================

// Extract YouTube ID from a full URL or bare ID string
function extractYouTubeId(input) {
    input = input.trim();
    // Handle youtu.be/ID and youtube.com/watch?v=ID and youtube.com/shorts/ID
    const match = input.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([A-Za-z0-9_-]{11})/);
    if (match) return match[1];
    // Bare 11-char ID
    if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;
    return null;
}

// Load videos from Supabase and refresh the player UI
async function loadVideosFromDB() {
    const { data, error } = await supabaseClient
        .from('videos')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Failed to load videos:', error);
        return;
    }

    videosList = data || [];
    currentVideosIndex = 0;
    refreshVideosUI();
}

// Rebuild the dropdown and reset the player to the first video
function refreshVideosUI() {
    const videoselector = document.getElementById('videoselector');
    if (videoselector) {
        videoselector.innerHTML = '';
        if (videosList.length === 0) {
            const opt = document.createElement('option');
            opt.textContent = 'No videos yet';
            videoselector.appendChild(opt);
        } else {
            videosList.forEach((v, i) => {
                const opt = document.createElement('option');
                opt.value = i.toString();
                opt.textContent = `Video ${i + 1} - ${v.title}`;
                videoselector.appendChild(opt);
            });
            videoselector.value = '0';
        }
    }

    const nowPlaying = document.getElementById('VideosNowPlaying');
    if (nowPlaying) {
        nowPlaying.textContent = videosList[0] ? `Now Playing: ${videosList[0].title}` : 'Now Playing: —';
    }

    if (VideosPlayer && videosList[0]?.youtube_id) {
        VideosPlayer.cueVideoById(videosList[0].youtube_id);
    }

    updatePlaylistDisplay();
}

// Show/hide the admin panel based on role, and render the list
function updateVideoAdminPanel() {
    const panel = document.getElementById('videoAdminPanel');
    if (!panel) return;
    const isAdmin = Auth.currentProfile?.role === 'admin';
    panel.style.display = isAdmin ? 'block' : 'none';
    if (isAdmin) renderVideoAdminList();
}

// Render the current video list in the admin panel
function renderVideoAdminList() {
    const list = document.getElementById('videoAdminList');
    if (!list) return;
    list.innerHTML = '';

    if (videosList.length === 0) {
        list.innerHTML = '<div class="video-admin-empty">No videos added yet.</div>';
        return;
    }

    videosList.forEach((v, i) => {
        const row = document.createElement('div');
        row.className = 'video-admin-row';
        row.innerHTML = `
            <span class="video-admin-num">${i + 1}</span>
            <span class="video-admin-title" title="${v.youtube_id}">${v.title}</span>
            <div class="video-admin-row-btns">
                <button class="video-admin-sm-btn" data-action="up" data-id="${v.id}" ${i === 0 ? 'disabled' : ''}>▲</button>
                <button class="video-admin-sm-btn" data-action="down" data-id="${v.id}" ${i === videosList.length - 1 ? 'disabled' : ''}>▼</button>
                <button class="video-admin-sm-btn danger" data-action="delete" data-id="${v.id}">✕</button>
            </div>`;
        list.appendChild(row);
    });

    list.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const action = btn.dataset.action;
            const id = btn.dataset.id;
            const idx = videosList.findIndex(v => v.id === id);
            if (action === 'delete') {
                await videoAdminDelete(id);
            } else if (action === 'up' && idx > 0) {
                await videoAdminSwap(idx, idx - 1);
            } else if (action === 'down' && idx < videosList.length - 1) {
                await videoAdminSwap(idx, idx + 1);
            }
        });
    });
}

async function videoAdminDelete(id) {
    const { error } = await supabaseClient.from('videos').delete().eq('id', id);
    if (error) {
        videoAdminSetStatus('Error: ' + error.message, true);
        return;
    }
    await loadVideosFromDB();
    renderVideoAdminList();
}

async function videoAdminSwap(indexA, indexB) {
    const a = videosList[indexA];
    const b = videosList[indexB];
    // Swap sort_order values
    const { error: e1 } = await supabaseClient.from('videos').update({ sort_order: b.sort_order }).eq('id', a.id);
    const { error: e2 } = await supabaseClient.from('videos').update({ sort_order: a.sort_order }).eq('id', b.id);
    if (e1 || e2) {
        videoAdminSetStatus('Error reordering: ' + (e1?.message || e2?.message), true);
        return;
    }
    await loadVideosFromDB();
    renderVideoAdminList();
}

function videoAdminSetStatus(msg, isError) {
    const el = document.getElementById('videoAdminStatus');
    if (!el) return;
    el.textContent = msg;
    el.style.color = isError ? '#cc0000' : '#006600';
    if (!isError) setTimeout(() => { el.textContent = ''; }, 3000);
}

// Wire up the Add Video button
function setupVideoAdminControls() {
    const addBtn = document.getElementById('videoAdminAddBtn');
    if (!addBtn) return;

    addBtn.addEventListener('click', async () => {
        const titleInput = document.getElementById('videoAdminTitle');
        const ytInput = document.getElementById('videoAdminYtId');
        const title = titleInput?.value.trim();
        const rawYt = ytInput?.value.trim();

        if (!title) { videoAdminSetStatus('Enter a title.', true); return; }
        const youtubeId = extractYouTubeId(rawYt);
        if (!youtubeId) { videoAdminSetStatus('Enter a valid YouTube ID or URL.', true); return; }

        addBtn.disabled = true;
        videoAdminSetStatus('Saving...');

        const nextOrder = videosList.length > 0
            ? Math.max(...videosList.map(v => v.sort_order)) + 1
            : 1;

        const { error } = await supabaseClient.from('videos').insert({
            title,
            youtube_id: youtubeId,
            sort_order: nextOrder
        });

        addBtn.disabled = false;
        if (error) {
            videoAdminSetStatus('Error: ' + error.message, true);
            return;
        }

        if (titleInput) titleInput.value = '';
        if (ytInput) ytInput.value = '';

        await loadVideosFromDB();
        renderVideoAdminList();

        // Notify all app users about the new video
        videoAdminSetStatus('Video added! Notifying...');
        const notifResult = await sendPushNotification('New Video', `"${title}" just dropped on Useless Radio`);
        videoAdminSetStatus(notifResult.error ? 'Added (notify failed)' : `Added & sent to ${notifResult.sent} device(s)`);
    });
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// =============================================
// TRACKS — SUPABASE LOADING, PLATFORM TOGGLE, ADMIN
// =============================================

async function loadTracksFromDB() {
    const toLocal = (item, i) => ({
        id: null,
        title: item.title,
        image_url: item.image || '',
        spotify_url: item.spotify_url || '',
        apple_music_url: item.apple_music_url || '',
        soundcloud_url: item.soundcloud_url || '',
        sort_order: i
    });

    try {
        const { data, error } = await supabaseClient
            .from('tracks')
            .select('*')
            .order('sort_order', { ascending: true });

        if (!error && data) {
            // Supabase table exists — use its data (even if empty)
            tracksList = data;
        } else {
            tracksList = TRACKS_ITEMS.map(toLocal);
        }
    } catch (e) {
        tracksList = TRACKS_ITEMS.map(toLocal);
    }

    if (document.getElementById('tracksGrid')) renderTracksGrid();
}

function switchTracksPlatform(platform) {
    currentTracksPlatform = platform;

    const cfg = {
        spotify:    { id: 'tracksSpotifyBtn',    color: '#1DB954' },
        apple:      { id: 'tracksAppleBtn',       color: '#fc3c44' },
        soundcloud: { id: 'tracksSoundcloudBtn',  color: '#ff5500' }
    };

    Object.entries(cfg).forEach(([p, c]) => {
        const btn = document.getElementById(c.id);
        if (!btn) return;
        if (p === platform) {
            btn.style.background   = c.color;
            btn.style.borderStyle  = 'outset';
            btn.style.borderColor  = c.color;
        } else {
            btn.style.background   = '#808080';
            btn.style.borderStyle  = 'inset';
            btn.style.borderColor  = '#808080';
        }
    });

    renderTracksGrid();
}

function renderTracksGrid() {
    const grid = document.getElementById('tracksGrid');
    if (!grid) return;
    if (document.getElementById('tracksAddForm')) return;

    const isAdmin = Auth.currentProfile?.role === 'admin';
    const urlKey  = currentTracksPlatform === 'spotify'    ? 'spotify_url'
                  : currentTracksPlatform === 'apple'       ? 'apple_music_url'
                  :                                           'soundcloud_url';

    const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' font-size='10' fill='%23999'%3EAlbum%3C/text%3E%3C/svg%3E";

    let itemsHTML = '';

    if (tracksList.length === 0 && !isAdmin) {
        itemsHTML = `<div style="color:#888;font-size:11px;font-style:italic;text-align:center;padding:20px;grid-column:1/-1;">No tracks yet.</div>`;
    } else {
        tracksList.forEach(item => {
            const url     = item[urlKey] || '';
            const hasLink = !!url;
            const imgSrc  = item.image_url || item.image || PLACEHOLDER_IMG;

            itemsHTML += `
                <div class="track-item"
                     style="cursor:${hasLink ? 'pointer' : 'default'};"
                     ${hasLink ? `onclick="window.open('${url}','_blank')"` : ''}
                     title="${hasLink ? item.title : item.title + ' — no ' + currentTracksPlatform + ' link yet'}">
                    <div class="track-cover">
                        <img src="${imgSrc}" alt="${item.title}"
                             onerror="this.src='${PLACEHOLDER_IMG}'"
                             style="width:100%;height:100%;object-fit:cover;">
                    </div>
                    <div class="track-title">${item.title}</div>
                </div>`;
        });
    }

    // Admin "+" add card — styled identically to album cards, just blank cover with a "+"
    const addCard = isAdmin ? `
        <div class="track-item track-add-card" onclick="tracksAdminAddOpen()" title="Add new album">
            <div class="track-cover" style="background:#e8e8e8;display:flex;align-items:center;justify-content:center;">
                <span style="font-size:42px;color:#a0a0a0;line-height:1;user-select:none;">+</span>
            </div>
            <div class="track-title" style="color:#999;font-weight:normal;font-style:italic;">Add Album</div>
        </div>` : '';

    grid.innerHTML = `
        <h4 style="color:#000080;margin:0 0 12px;font-size:12px;">📀 Albums</h4>
        <div class="tracks-grid">${itemsHTML}${addCard}</div>`;
}

function tracksAdminAddOpen() {
    if (document.getElementById('tracksAddForm')) return;
    const grid = document.getElementById('tracksGrid');
    if (!grid) return;

    const form = document.createElement('div');
    form.id = 'tracksAddForm';
    form.style.cssText = 'background:#d4d0c8;border:2px inset #808080;padding:10px;margin-bottom:15px;';
    form.innerHTML = `
        <div class="video-admin-header">+ Add New Album</div>
        <div class="video-admin-add">
            <input type="text" id="tracksAddTitle" class="video-admin-input" placeholder="Album title *">
            <div style="margin:3px 0;">
                <div style="font-size:10px;color:#555;margin-bottom:3px;">Album Cover</div>
                <div style="display:flex;align-items:center;gap:8px;">
                    <img id="tracksAddImgPreview" style="width:48px;height:48px;object-fit:cover;border:2px inset #c0c0c0;flex-shrink:0;display:none;">
                    <div id="tracksAddImgEmpty" style="width:48px;height:48px;border:2px inset #c0c0c0;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">💿</div>
                    <div>
                        <label for="tracksAddImageFile" class="video-admin-btn" style="cursor:pointer;display:inline-block;">Browse...</label>
                        <input type="file" id="tracksAddImageFile" accept="image/*" style="display:none;">
                    </div>
                </div>
            </div>
            <input type="text" id="tracksAddSpotify"    class="video-admin-input" placeholder="Spotify URL">
            <input type="text" id="tracksAddApple"      class="video-admin-input" placeholder="Apple Music URL">
            <input type="text" id="tracksAddSoundcloud" class="video-admin-input" placeholder="SoundCloud URL">
            <div style="display:flex;gap:6px;margin-top:2px;">
                <button class="video-admin-btn" id="tracksAddSaveBtn" onclick="tracksAdminSave()">+ Add Album</button>
                <button class="video-admin-btn" onclick="renderTracksGrid()">Cancel</button>
            </div>
            <div class="video-admin-status" id="tracksAddStatus"></div>
        </div>`;
    grid.prepend(form);

    document.getElementById('tracksAddImageFile')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const preview = document.getElementById('tracksAddImgPreview');
        const empty   = document.getElementById('tracksAddImgEmpty');
        if (preview) { preview.src = URL.createObjectURL(file); preview.style.display = 'block'; }
        if (empty)   empty.style.display = 'none';
    });
}

async function tracksAdminSave() {
    const title      = document.getElementById('tracksAddTitle')?.value.trim();
    const spotify    = document.getElementById('tracksAddSpotify')?.value.trim();
    const apple      = document.getElementById('tracksAddApple')?.value.trim();
    const soundcloud = document.getElementById('tracksAddSoundcloud')?.value.trim();
    const imageFile  = document.getElementById('tracksAddImageFile')?.files?.[0];
    const statusEl   = document.getElementById('tracksAddStatus');
    const saveBtn    = document.getElementById('tracksAddSaveBtn');

    if (!title) {
        if (statusEl) { statusEl.textContent = 'Album title is required.'; statusEl.style.color = '#cc0000'; }
        return;
    }

    if (saveBtn) saveBtn.disabled = true;
    if (statusEl) { statusEl.textContent = 'Saving...'; statusEl.style.color = '#555'; }

    let image_url = '';
    if (imageFile) {
        if (statusEl) statusEl.textContent = 'Uploading cover...';
        const ext  = imageFile.name.split('.').pop().toLowerCase();
        const path = `tracks/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabaseClient.storage
            .from('popup-assets')
            .upload(path, imageFile, { upsert: true, contentType: imageFile.type });
        if (uploadErr) {
            if (saveBtn) saveBtn.disabled = false;
            if (statusEl) { statusEl.textContent = 'Upload failed: ' + uploadErr.message; statusEl.style.color = '#cc0000'; }
            return;
        }
        const { data: urlData } = supabaseClient.storage.from('popup-assets').getPublicUrl(path);
        image_url = urlData.publicUrl;
        if (statusEl) statusEl.textContent = 'Saving...';
    }

    const nextOrder = tracksList.length > 0
        ? Math.max(...tracksList.map(v => v.sort_order || 0)) + 1
        : 1;

    const { error } = await supabaseClient.from('tracks').insert({
        title,
        image_url,
        spotify_url:     spotify     || '',
        apple_music_url: apple       || '',
        soundcloud_url:  soundcloud  || '',
        sort_order:      nextOrder
    });

    if (saveBtn) saveBtn.disabled = false;

    if (error) {
        if (statusEl) { statusEl.textContent = 'Error: ' + error.message; statusEl.style.color = '#cc0000'; }
        return;
    }

    document.getElementById('tracksAddForm')?.remove();
    await loadTracksFromDB();
}

async function tracksAdminDelete(id) {
    if (!confirm('Remove this album?')) return;
    const { error } = await supabaseClient.from('tracks').delete().eq('id', id);
    if (error) { alert('Error removing album: ' + error.message); return; }
    await loadTracksFromDB();
}

function updateTracksAdminPanel() {
    if (document.getElementById('tracksGrid')) renderTracksGrid();
}

// Album Promo Popup Functions
function createEventPromoPopup() {
    const popup = document.createElement('div');
    popup.className = 'album-promo-popup';
    popup.id = 'eventPromoPopup';
    
    if (window.IS_MOBILE_DEVICE) {
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
    } else {
        const x = Math.random() * (window.innerWidth - 500) + 50;
        const y = Math.random() * (window.innerHeight - 400) + 50;
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
    }
    
    popup.style.zIndex = '15000';
    popup.style.width = '300px';
    popup.style.height = '450px';
    
    popup.innerHTML = `
        <div class="album-popup-header">
            <div class="album-popup-title">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23ff0000'%3E%3Cpath d='M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zM7 4h2v5H7V4zM7 11h2v2H7v-2z'/%3E%3C/svg%3E" class="error-icon" alt="Event">
                🎉 Upcoming Event Alert!
            </div>
            <button class="album-popup-close" onclick="closeEventPromoPopup()">×</button>
        </div>
        <div class="album-popup-content">
            <div class="event-flyer-container" onclick="window.open('${EVENT_PROMO.eventUrl}', '_blank')" style="cursor: pointer;">
                <img src="${EVENT_PROMO.flyerImage}" alt="${EVENT_PROMO.eventTitle}" style="width: 100%; height: auto; border: 2px inset #c0c0c0;">
            </div>
            <div class="event-details" style="margin-top: 10px; text-align: center;">
                <h3 style="color: #000080; margin-bottom: 5px;">${EVENT_PROMO.eventTitle}</h3>
                <p style="margin-bottom: 3px;"><strong>Date:</strong> ${EVENT_PROMO.eventDate}</p>
                <p style="margin-bottom: 10px;"><strong>Location:</strong> ${EVENT_PROMO.eventLocation}</p>
                <button onclick="window.open('${EVENT_PROMO.eventUrl}', '_blank')" style="padding: 8px 16px; background: #c0c0c0; border: 2px outset #c0c0c0; cursor: pointer; font-weight: bold;">
                    Get Tickets / More Info
                </button>
            </div>
            <div class="album-popup-footer">
                <p style="font-size: 10px; color: #666; margin-top: 15px;">
                    Click anywhere on the flyer for details. Auto-close in 30 seconds.
                </p>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    makeAlbumPopupDraggable(popup);
    
    setTimeout(() => {
        closeEventPromoPopup();
    }, 30000);
    
    return popup;
}

// Close album promo popup function
function closeEventPromoPopup() {
    const popup = document.getElementById('eventPromoPopup');
    if (popup) {
        popup.remove();
    }
}

// Make album popup draggable
function makeAlbumPopupDraggable(popup) {
    const header = popup.querySelector('.album-popup-header');
    let isDragging = false;
    let currentX, currentY, initialX, initialY;
    
    header.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('album-popup-close')) return;
        isDragging = true;
        popup.style.zIndex = '15001';
        initialX = e.clientX - popup.offsetLeft;
        initialY = e.clientY - popup.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            
            const maxX = window.innerWidth - popup.offsetWidth;
            const maxY = window.innerHeight - popup.offsetHeight - 36;
            
            currentX = Math.max(0, Math.min(currentX, maxX));
            currentY = Math.max(0, Math.min(currentY, maxY));
            
            popup.style.left = currentX + 'px';
            popup.style.top = currentY + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

// Enhanced clock and countdown functionality
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const clockElement = document.getElementById('clock');
    if (clockElement) {
        clockElement.textContent = timeString;
    }
    
    // Update countdown
    updateCountdown();
}

function updateCountdown() {
    const nextDateElement = document.getElementById('nextDate');
    if (!nextDateElement) return;

    // Sync directly from SiteSettings on every tick so the countdown is correct
    // as soon as settings load — avoids any race with applyToPage timing.
    const raw = SiteSettings?.data?.drop_date || '';
    DROP_DATE_CONFIG.enabled = !!raw;
    if (raw) DROP_DATE_CONFIG.date = new Date(raw);

    // Check if countdown is disabled or no date is set
    if (!DROP_DATE_CONFIG.enabled || !DROP_DATE_CONFIG.date) {
        nextDateElement.textContent = DROP_DATE_CONFIG.tbaText;
        nextDateElement.style.color = "#0000ff";
        nextDateElement.style.fontWeight = "normal";
        nextDateElement.style.animation = "none";
        return;
    }
    
    const now = new Date();
    const timeLeft = DROP_DATE_CONFIG.date - now;
    
    if (timeLeft <= 0) {
        // Drop date has passed
        nextDateElement.textContent = "DROPPED!";
        nextDateElement.style.color = "#ff0000";
        nextDateElement.style.fontWeight = "bold";
        nextDateElement.style.animation = "flash 1s infinite";
        return;
    }
    
    // Calculate time units
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    // Format the countdown display
    let countdownText = "";
    
    if (days > 0) {
        countdownText = `${days}d ${hours}h`;
    } else if (hours > 0) {
        countdownText = `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        countdownText = `${minutes}m ${seconds}s`;
    } else {
        countdownText = `${seconds}s`;
    }
    
    nextDateElement.textContent = countdownText;
    
    // Add visual effects as we get closer
    if (minutes < 10 && days === 0 && hours === 0) {
        // Less than 10 minutes - RED AND FLASHING!
        nextDateElement.style.color = "#ff0000";
        nextDateElement.style.fontWeight = "bold";
        nextDateElement.style.animation = "flash 0.5s infinite";
    } else if (days === 0 && hours < 1) {
        // Less than 1 hour - make it red and bold (no flash yet)
        nextDateElement.style.color = "#ff0000";
        nextDateElement.style.fontWeight = "bold";
        nextDateElement.style.animation = "none";
    } else if (days === 0) {
        // Same day - make it orange
        nextDateElement.style.color = "#ff6600";
        nextDateElement.style.fontWeight = "bold";
        nextDateElement.style.animation = "none";
    } else if (days < 7) {
        // Less than a week - make it blue
        nextDateElement.style.color = "#0000ff";
        nextDateElement.style.fontWeight = "bold";
        nextDateElement.style.animation = "none";
    } else {
        // Normal styling
        nextDateElement.style.color = "black";
        nextDateElement.style.fontWeight = "normal";
        nextDateElement.style.animation = "none";
    }
}

// Optional: Function to programmatically enable/disable countdown
function setDropCountdown(enabled, dateString = null, customTbaText = null) {
    DROP_DATE_CONFIG.enabled = enabled;
    
    if (enabled && dateString) {
        DROP_DATE_CONFIG.date = new Date(dateString);
    }
    
    if (customTbaText) {
        DROP_DATE_CONFIG.tbaText = customTbaText;
    }
    
    // Immediately update display
    updateCountdown();
}

// Create mannivirus pixels
function createMannivirusPixels() {
    const pixelContainer = document.querySelector('.mannivirus-pixels');
    if (!pixelContainer) return;
    
    const numPixels = 8;
    
    for (let i = 0; i < numPixels; i++) {
        const pixel = document.createElement('div');
        pixel.className = 'mannivirus-pixel';
        
        const x = Math.random() * (window.innerWidth - 10);
        const y = Math.random() * (window.innerHeight - 50);
        
        pixel.style.left = x + 'px';
        pixel.style.top = y + 'px';
        
        pixel.addEventListener('click', triggerMannivirus);
        
        pixelContainer.appendChild(pixel);
    }
}

// Trigger the mannivirus
function triggerMannivirus() {
    if (mannivirusTriggered) return;
    mannivirusTriggered = true;
    
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const popupWidth = 320;
    const popupHeight = 240;
    
    const cols = Math.floor(screenWidth / popupWidth);
    const rows = Math.floor((screenHeight - 36) / popupHeight);
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            setTimeout(() => {
                createMannivirusPopup(col * popupWidth, row * popupHeight);
            }, (row * cols + col) * 50);
        }
    }
}

// Create a mannivirus popup
function createMannivirusPopup(x = null, y = null) {
    popupCount++;
    
    const popup = document.createElement('div');
    popup.className = 'popup-window';
    popup.id = `popup-${popupCount}`;
    popup.style.zIndex = popupZIndex++;
    
    if (x !== null && y !== null) {
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
    } else {
        popup.style.left = Math.random() * (window.innerWidth - 320) + 'px';
        popup.style.top = Math.random() * (window.innerHeight - 276) + 'px';
    }
    
    const errorMessages = [
        "SYSTEM ERROR: Memory overflow detected!",
        "WARNING: Mannivirus infection spreading...",
        "ERROR 404: Sanity not found",
        "CRITICAL: Desktop contamination in progress",
        "ALERT: Recursive popup syndrome activated",
        "VIRUS DETECTED: Please do not resist",
        "SYSTEM FAILURE: Too many windows open",
        "MANNIVIRUS.EXE has performed an illegal operation"
    ];
    
    const randomMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)];
    
    popup.innerHTML = `
        <div class="popup-header">
            <div class="popup-title">⚠️ System Error ${popupCount}</div>
            <button class="popup-close" onclick="closeMannivirusPopup('${popup.id}')">×</button>
        </div>
        <div class="popup-content">
            <h2>MANNIVIRUS DETECTED</h2>
            <p>${randomMessage}</p>
            <p>Error Code: 0x${Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0')}</p>
            <p style="font-size: 10px; color: #666; margin-top: 15px;">
                Closing this window will spawn another.<br>
                Refresh the page to stop the madness.
            </p>
        </div>
    `;
    
    document.body.appendChild(popup);
    makePopupDraggable(popup);
}

// Close popup and create new one
function closeMannivirusPopup(popupId) {
    const popup = document.getElementById(popupId);
    if (popup) {
        popup.remove();
        setTimeout(() => {
            createMannivirusPopup();
        }, 100);
    }
}

// Make popup draggable
function makePopupDraggable(popup) {
    const header = popup.querySelector('.popup-header');
    let isDragging = false;
    let currentX, currentY, initialX, initialY;
    
    header.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('popup-close')) return;
        isDragging = true;
        popup.style.zIndex = popupZIndex++;
        initialX = e.clientX - popup.offsetLeft;
        initialY = e.clientY - popup.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            
            const maxX = window.innerWidth - popup.offsetWidth;
            const maxY = window.innerHeight - popup.offsetHeight - 36;
            
            currentX = Math.max(0, Math.min(currentX, maxX));
            currentY = Math.max(0, Math.min(currentY, maxY));
            
            popup.style.left = currentX + 'px';
            popup.style.top = currentY + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}
// Toggle between YouTube and Twitch embeds in lounge
function switchLoungeEmbed(platform) {
    const youtubeEmbed = document.getElementById('loungeYouTubeEmbed');
    const twitchEmbed = document.getElementById('loungeTwitchEmbed');
    const youtubeBtn = document.getElementById('showYouTubeBtn');
    const twitchBtn = document.getElementById('showTwitchBtn');
    const nowPlaying = document.getElementById('loungeNowPlaying');
    
    if (platform === 'youtube') {
        // Show YouTube, hide Twitch
        youtubeEmbed.style.display = 'block';
        twitchEmbed.style.display = 'none';
        
        // Update button styles
        youtubeBtn.style.background = '#ff0000';
        youtubeBtn.style.border = '2px outset #ff0000';
        twitchBtn.style.background = '#808080';
        twitchBtn.style.border = '2px inset #808080';
        
        // Update text
        if (nowPlaying) nowPlaying.textContent = '🎵 YouTube Player Active';
        
        // Resume YouTube player if it exists
        if (loungePlayer && loungePlayer.playVideo) {
            loungePlayer.playVideo();
        }
    } else if (platform === 'twitch') {
        // Show Twitch, hide YouTube
        youtubeEmbed.style.display = 'none';
        twitchEmbed.style.display = 'block';
        
        // Update button styles
        twitchBtn.style.background = '#9146ff';
        twitchBtn.style.border = '2px outset #9146ff';
        youtubeBtn.style.background = '#808080';
        youtubeBtn.style.border = '2px inset #808080';
        
        // Update text
        if (nowPlaying) nowPlaying.textContent = '📺 Twitch Clip Active';
        
        // Pause YouTube player if it exists
        if (loungePlayer && loungePlayer.pauseVideo) {
            loungePlayer.pauseVideo();
        }
    }
}
function setupEventListeners() {
    // Start menu functionality
    const startBtn = document.getElementById('startBtn');
    const startMenu = document.getElementById('startMenu');

    if (startBtn && startMenu) {
        startBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            startMenu.style.display = startMenu.style.display === 'none' ? 'block' : 'none';
            startBtn.classList.toggle('active');
        });

        document.addEventListener('click', () => {
            startMenu.style.display = 'none';
            startBtn.classList.remove('active');
        });

        startMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // FIXED: Icon click handlers with proper mobile support
    document.querySelectorAll('.icon').forEach(icon => {
        // Mobile: single tap to open
        if (window.IS_MOBILE_DEVICE) {
            icon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const appName = icon.dataset.app;
                openWindow(appName);
            });
        } else {
            // Desktop: double-click to open, single-click to select
            icon.addEventListener('dblclick', () => {
                const appName = icon.dataset.app;
                openWindow(appName);
            });
            
            icon.addEventListener('click', () => {
                document.querySelectorAll('.icon').forEach(i => i.classList.remove('selected'));
                icon.classList.add('selected');
            });
        }
    });

    // FIXED: Personal icons click handlers with mobile support
    document.querySelectorAll('.personal-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const appName = icon.dataset.app;
            openWindow(appName);
        });
    });

    // Start menu item click handlers
    document.querySelectorAll('.start-menu-item[data-app]').forEach(item => {
        item.addEventListener('click', () => {
            const appName = item.dataset.app;
            openWindow(appName);
        });
    });

    // Setup existing window handlers
    setupExistingWindows();

    // Clear desktop selection when clicking on empty space (desktop only)
    if (!window.IS_MOBILE_DEVICE) {
        document.querySelector('.desktop').addEventListener('click', (e) => {
            if (e.target.classList.contains('desktop') || e.target.classList.contains('desktop-icons')) {
                document.querySelectorAll('.icon').forEach(icon => icon.classList.remove('selected'));
            }
        });
    }
}
// Camera Roll System
const cameraRoll = {
    currentIndex: 0,
    canvas: null,
    ctx: null,
    currentTool: 'pen',
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    color: '#000000',
    brushSize: 2,
    startX: 0,
    startY: 0,
    tempCanvas: null,
    
    init() {
        this.canvas = document.getElementById('cameraCanvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.tempCanvas = document.createElement('canvas');
        
        this.canvas.addEventListener('mousedown', (e) => this.startDraw(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDraw());
        this.canvas.addEventListener('mouseout', () => this.stopDraw());
        
        // Touch support
        this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this.startDraw(e.touches[0]); });
        this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); this.draw(e.touches[0]); });
        this.canvas.addEventListener('touchend', () => this.stopDraw());
        
        this.loadPhoto(0);
    },
    
    loadPhoto(index) {
        if (index < 0 || index >= CAMERA_ROLL_PHOTOS.length) return;
        this.currentIndex = index;
        
        const img = new Image();
        img.onload = () => {
            this.canvas.width = img.width;
            this.canvas.height = img.height;
            this.ctx.drawImage(img, 0, 0);
            
            this.tempCanvas.width = img.width;
            this.tempCanvas.height = img.height;
        };
        img.src = CAMERA_ROLL_PHOTOS[index];
        
        const counter = document.getElementById('photoCounter');
        if (counter) counter.textContent = `${index + 1} / ${CAMERA_ROLL_PHOTOS.length}`;
    },
    
    prevPhoto() {
        if (this.currentIndex > 0) this.loadPhoto(this.currentIndex - 1);
    },
    
    nextPhoto() {
        if (this.currentIndex < CAMERA_ROLL_PHOTOS.length - 1) this.loadPhoto(this.currentIndex + 1);
    },
    
    setTool(tool) {
        this.currentTool = tool;
        document.querySelectorAll('.camera-tool-btn').forEach(btn => btn.style.background = '#c0c0c0');
        const btn = document.getElementById('tool' + tool.charAt(0).toUpperCase() + tool.slice(1));
        if (btn) btn.style.background = '#808080';
    },
    
    setColor(color) {
        this.color = color;
    },
    
    setBrushSize(size) {
        this.brushSize = size;
        const display = document.getElementById('brushSizeDisplay');
        if (display) display.textContent = size;
    },
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    },
    
    startDraw(e) {
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        this.lastX = pos.x;
        this.lastY = pos.y;
        this.startX = pos.x;
        this.startY = pos.y;
        
        // Save current state for shape tools
        this.tempCanvas.getContext('2d').drawImage(this.canvas, 0, 0);
    },
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getMousePos(e);
        this.ctx.strokeStyle = this.color;
        this.ctx.fillStyle = this.color;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        
        if (this.currentTool === 'pen') {
            this.ctx.beginPath();
            this.ctx.moveTo(this.lastX, this.lastY);
            this.ctx.lineTo(pos.x, pos.y);
            this.ctx.stroke();
        } else if (this.currentTool === 'eraser') {
            this.ctx.clearRect(pos.x - this.brushSize/2, pos.y - this.brushSize/2, this.brushSize, this.brushSize);
        } else if (this.currentTool === 'line') {
            this.ctx.putImageData(this.tempCanvas.getContext('2d').getImageData(0, 0, this.canvas.width, this.canvas.height), 0, 0);
            this.ctx.beginPath();
            this.ctx.moveTo(this.startX, this.startY);
            this.ctx.lineTo(pos.x, pos.y);
            this.ctx.stroke();
        } else if (this.currentTool === 'rect') {
            this.ctx.putImageData(this.tempCanvas.getContext('2d').getImageData(0, 0, this.canvas.width, this.canvas.height), 0, 0);
            this.ctx.strokeRect(this.startX, this.startY, pos.x - this.startX, pos.y - this.startY);
        } else if (this.currentTool === 'circle') {
            this.ctx.putImageData(this.tempCanvas.getContext('2d').getImageData(0, 0, this.canvas.width, this.canvas.height), 0, 0);
            const radius = Math.sqrt(Math.pow(pos.x - this.startX, 2) + Math.pow(pos.y - this.startY, 2));
            this.ctx.beginPath();
            this.ctx.arc(this.startX, this.startY, radius, 0, 2 * Math.PI);
            this.ctx.stroke();
        }
        
        this.lastX = pos.x;
        this.lastY = pos.y;
    },
    
    stopDraw() {
        this.isDrawing = false;
    },
    
    clearDrawing() {
        this.loadPhoto(this.currentIndex);
    },
    
    saveImage() {
        const link = document.createElement('a');
        link.download = `edited-photo-${this.currentIndex + 1}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
    }
};

function initCameraRoll() {
    cameraRoll.init();
}

window.cameraRoll = cameraRoll;
window.switchLoungeEmbed = switchLoungeEmbed;
window.switchTracksPlatform = switchTracksPlatform;
window.renderTracksGrid     = renderTracksGrid;
window.tracksAdminAddOpen   = tracksAdminAddOpen;
window.tracksAdminSave      = tracksAdminSave;
window.tracksAdminDelete    = tracksAdminDelete;
// Forum tab switching function
function switchForumTab(tab) {
    const feedView = document.getElementById('feedView');
    const fullView = document.getElementById('fullView');
    const feedTab = document.getElementById('feedTab');
    const fullTab = document.getElementById('fullTab');
    
    if (!feedView || !fullView || !feedTab || !fullTab) return;
    
    if (tab === 'feed') {
        feedView.style.display = 'block';
        fullView.style.display = 'none';
        feedTab.style.background = '#fff';
        feedTab.style.borderStyle = 'inset';
        feedTab.style.fontWeight = 'bold';
        fullTab.style.background = '#c0c0c0';
        fullTab.style.borderStyle = 'outset';
        fullTab.style.fontWeight = 'normal';
    } else {
        feedView.style.display = 'none';
        fullView.style.display = 'block';
        feedTab.style.background = '#c0c0c0';
        feedTab.style.borderStyle = 'outset';
        feedTab.style.fontWeight = 'normal';
        fullTab.style.background = '#fff';
        fullTab.style.borderStyle = 'inset';
        fullTab.style.fontWeight = 'bold';
    }
}

window.switchForumTab = switchForumTab;

/* ============================================================
   FORUM — Members-only live chat backed by Supabase
   ============================================================ */

let _forumSub     = null;          // Realtime channel handle
let _forumInited  = false;         // Has the initial load run?
let _forumPostIds = new Set();     // Tracks IDs already rendered

/* Called when the forum window opens (or re-opens) */
async function initForum() {
    // Show terms on first forum access
    if (!forumTermsAccepted()) {
        const container = document.getElementById('forumMessages');
        if (container) {
            container.innerHTML = `
                <div class="forum-terms-gate">
                    <div class="forum-terms-title">Community Terms</div>
                    <ul class="forum-terms-list">
                        <li>Be respectful — no offensive, abusive, or harmful content.</li>
                        <li>You can flag posts that violate these terms.</li>
                        <li>You can block users whose posts you don't want to see.</li>
                        <li>Violations may result in removal of your account.</li>
                    </ul>
                    <div class="forum-terms-actions">
                        <button class="forum-terms-accept-btn" id="forumTermsAcceptBtn">I Agree — Enter Forum</button>
                    </div>
                </div>`;
            document.getElementById('forumTermsAcceptBtn')?.addEventListener('click', () => {
                localStorage.setItem(FORUM_TERMS_KEY, '1');
                _forumInited = false; // reset so full load runs
                initForum();
            });
        }
        return;
    }

    if (!_forumInited) {
        _forumInited = true;
        await _forumLoadAll();
        _forumSubscribeRealtime();
    }
    forumUpdateInputState();
}

/* Fetch all posts oldest → newest and render them */
async function _forumLoadAll() {
    const container = document.getElementById('forumMessages');
    if (!container) return;

    container.innerHTML = '<div class="forum-loading">Loading messages...</div>';
    _forumPostIds.clear();

    const { data, error } = await supabaseClient
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: true });

    container.innerHTML = '';

    if (error) {
        container.innerHTML = '<div class="forum-empty">Could not load messages. Try again later.</div>';
        console.error('Forum load error:', error);
        return;
    }

    if (!data || data.length === 0) {
        container.innerHTML = '<div class="forum-empty">No messages yet — be the first to post!</div>';
        return;
    }

    const blocked = forumGetBlocked();
    data.forEach(post => {
        if (blocked.includes(post.user_id)) return;
        container.appendChild(_forumBuildEl(post));
        _forumPostIds.add(post.id);
    });

    // Scroll to bottom so newest message is visible
    container.scrollTop = container.scrollHeight;
}

/* Subscribe to real-time INSERT / UPDATE / DELETE */
function _forumSubscribeRealtime() {
    if (_forumSub) supabaseClient.removeChannel(_forumSub);

    _forumSub = supabaseClient
        .channel('forum_posts_rt')
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'forum_posts' },
            payload => {
                const container = document.getElementById('forumMessages');
                if (!container) return;

                if (payload.eventType === 'INSERT') {
                    if (_forumPostIds.has(payload.new.id)) return;
                    if (forumGetBlocked().includes(payload.new.user_id)) return;
                    const empty = container.querySelector('.forum-empty');
                    if (empty) empty.remove();
                    container.appendChild(_forumBuildEl(payload.new));
                    _forumPostIds.add(payload.new.id);
                    // Auto-scroll only if the user is already near the bottom
                    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 80;
                    if (nearBottom) container.scrollTop = container.scrollHeight;

                } else if (payload.eventType === 'UPDATE') {
                    const textEl = document.getElementById('forum-text-' + payload.new.id);
                    if (textEl) textEl.textContent = payload.new.content;

                } else if (payload.eventType === 'DELETE') {
                    const el = container.querySelector('[data-forum-id="' + payload.old.id + '"]');
                    if (el) el.remove();
                    _forumPostIds.delete(payload.old.id);
                }
            })
        .subscribe();
}

/* Build a single message DOM element */
function _forumBuildEl(post) {
    const currentUserId = Auth.currentUser ? Auth.currentUser.id : null;
    const isOwn = !!currentUserId && post.user_id === currentUserId;

    const wrapper = document.createElement('div');
    wrapper.className = 'forum-msg' + (isOwn ? ' forum-own' : '');
    wrapper.dataset.forumId = post.id;

    // Timestamp
    const d = new Date(post.created_at);
    const timeStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Avatar
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'forum-avatar';
    if (post.avatar_url) {
        const img = document.createElement('img');
        img.src = post.avatar_url;
        img.alt = post.display_name || 'avatar';
        avatarDiv.appendChild(img);
    } else {
        avatarDiv.textContent = '\uD83D\uDC64'; // 👤
    }

    // Bubble wrap
    const bubbleWrap = document.createElement('div');
    bubbleWrap.className = 'forum-bubble-wrap';

    // Meta row (name + time)
    const metaRow = document.createElement('div');
    metaRow.className = 'forum-meta-row';
    const authorSpan = document.createElement('span');
    authorSpan.className = 'forum-author';
    authorSpan.textContent = post.display_name || 'Anonymous';
    const timeSpan = document.createElement('span');
    timeSpan.className = 'forum-time';
    timeSpan.textContent = timeStr;
    metaRow.appendChild(authorSpan);
    metaRow.appendChild(timeSpan);

    // Text bubble
    const bubble = document.createElement('div');
    bubble.className = 'forum-bubble';
    const textSpan = document.createElement('span');
    textSpan.className = 'forum-text';
    textSpan.id = 'forum-text-' + post.id;
    textSpan.textContent = post.content;
    bubble.appendChild(textSpan);

    bubbleWrap.appendChild(metaRow);
    bubbleWrap.appendChild(bubble);

    // Edit / Delete buttons (own messages) or Flag / Block (others)
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'forum-msg-actions';

    if (isOwn) {
        const editBtn = document.createElement('button');
        editBtn.className = 'forum-msg-act-btn';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', function() { forumEditPost(post.id); });

        const delBtn = document.createElement('button');
        delBtn.className = 'forum-msg-act-btn forum-del-btn';
        delBtn.textContent = 'Delete';
        delBtn.addEventListener('click', function() { forumDeletePost(post.id); });

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(delBtn);
    } else {
        const flagBtn = document.createElement('button');
        flagBtn.className = 'forum-msg-act-btn forum-flag-btn';
        flagBtn.textContent = '⚑ Report';
        flagBtn.addEventListener('click', function() { forumFlagPost(post.id, post.display_name); });

        const blockBtn = document.createElement('button');
        blockBtn.className = 'forum-msg-act-btn forum-block-btn';
        blockBtn.textContent = '⊘ Block';
        blockBtn.addEventListener('click', function() { forumBlockUser(post.user_id, post.display_name); });

        actionsDiv.appendChild(flagBtn);
        actionsDiv.appendChild(blockBtn);
    }

    bubbleWrap.appendChild(actionsDiv);

    // Tag element with user id for block removal
    wrapper.dataset.forumUserId = post.user_id;

    wrapper.appendChild(avatarDiv);
    wrapper.appendChild(bubbleWrap);
    return wrapper;
}

/* Enable / disable input based on current auth + role */
function forumUpdateInputState() {
    const input   = document.getElementById('forumInput');
    const sendBtn = document.getElementById('forumSendBtn');
    const uploadBtn = document.getElementById('forumUploadBtn');
    const status  = document.getElementById('forumStatusText');
    if (!input) return;

    const user     = Auth.currentUser;
    const profile  = Auth.currentProfile;
    const canPost = profile && (profile.role === 'member' || profile.role === 'admin');

    if (!user) {
        input.disabled    = true;
        input.placeholder = 'Sign in to post in the forum...';
        if (sendBtn)   sendBtn.disabled   = true;
        if (uploadBtn) uploadBtn.disabled = true;
        if (status)    status.textContent = 'Not signed in \u2014 members only';
    } else if (!canPost) {
        input.disabled    = true;
        input.placeholder = 'Only members can post \u2014 contact us to get member status';
        if (sendBtn)   sendBtn.disabled   = true;
        if (uploadBtn) uploadBtn.disabled = true;
        if (status)    status.textContent = 'Signed in as ' + (profile ? profile.display_name || user.email : user.email) + ' (groupie) \u2014 member status required to post';
    } else {
        input.disabled    = false;
        input.placeholder = 'Type a message\u2026 (Enter to send, Shift+Enter for new line)';
        if (sendBtn)   sendBtn.disabled   = false;
        if (uploadBtn) uploadBtn.disabled = false;
        if (status)    status.textContent = 'Posting as ' + (profile.display_name || user.email);
    }
}

/* Submit a new post */
async function forumSubmitPost() {
    const input = document.getElementById('forumInput');
    if (!input || input.disabled) return;

    const content = input.value.trim();
    if (!content) return;

    const user    = Auth.currentUser;
    const profile = Auth.currentProfile;
    if (!user || !profile || (profile.role !== 'member' && profile.role !== 'admin')) return;

    const sendBtn = document.getElementById('forumSendBtn');
    if (sendBtn) sendBtn.disabled = true;
    input.disabled = true;

    const { error } = await supabaseClient.from('forum_posts').insert({
        user_id:      user.id,
        display_name: profile.display_name || user.email,
        avatar_url:   profile.avatar_url   || null,
        content:      content
    });

    input.disabled = false;
    if (sendBtn) sendBtn.disabled = false;

    if (!error) {
        input.value = '';
        input.focus();
    } else {
        console.error('Forum post error:', error);
        const statusEl = document.getElementById('forumStatusText');
        if (statusEl) statusEl.textContent = 'Error sending \u2014 ' + error.message;
    }
}

/* Insert an emoji at the cursor position in the textarea */
function forumAddEmoji(emoji) {
    const input = document.getElementById('forumInput');
    if (!input || input.disabled) return;
    const start = input.selectionStart;
    const end   = input.selectionEnd;
    input.value = input.value.slice(0, start) + emoji + input.value.slice(end);
    input.selectionStart = input.selectionEnd = start + emoji.length;
    input.focus();
}

/* Clear the textarea (trash button) */
function forumClearInput() {
    const input = document.getElementById('forumInput');
    if (input) { input.value = ''; input.focus(); }
}

/* Enter edit mode on a post */
function forumEditPost(postId) {
    const msgEl  = document.querySelector('[data-forum-id="' + postId + '"]');
    const textEl = document.getElementById('forum-text-' + postId);
    if (!textEl || !msgEl) return;

    const original = textEl.textContent;
    msgEl.dataset.originalContent = original;

    const bubble = textEl.closest('.forum-bubble');
    if (!bubble) return;

    // Replace bubble contents with a textarea + Save/Cancel
    bubble.innerHTML = '';

    const ta = document.createElement('textarea');
    ta.className = 'forum-edit-ta';
    ta.id   = 'forum-edit-ta-' + postId;
    ta.rows = 2;
    ta.value = original;

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:2px;margin-top:3px;justify-content:flex-end;';

    const saveBtn = document.createElement('button');
    saveBtn.className   = 'forum-msg-act-btn';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', function() { forumSaveEdit(postId); });

    const cancelBtn = document.createElement('button');
    cancelBtn.className   = 'forum-msg-act-btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', function() { forumCancelEdit(postId); });

    btnRow.appendChild(saveBtn);
    btnRow.appendChild(cancelBtn);
    bubble.appendChild(ta);
    bubble.appendChild(btnRow);

    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);
}

/* Save an edited post */
async function forumSaveEdit(postId) {
    const ta = document.getElementById('forum-edit-ta-' + postId);
    if (!ta) return;
    const newContent = ta.value.trim();
    if (!newContent) return;

    const { error } = await supabaseClient
        .from('forum_posts')
        .update({ content: newContent, updated_at: new Date().toISOString() })
        .eq('id', postId);

    if (!error) {
        // Update DOM immediately (realtime will also fire but this is instant)
        const msgEl = document.querySelector('[data-forum-id="' + postId + '"]');
        const bubble = msgEl ? msgEl.querySelector('.forum-bubble') : null;
        if (bubble) {
            bubble.innerHTML = '';
            const span = document.createElement('span');
            span.className = 'forum-text';
            span.id        = 'forum-text-' + postId;
            span.textContent = newContent;
            bubble.appendChild(span);
        }
    } else {
        console.error('Forum edit error:', error);
        forumCancelEdit(postId); // restore original on failure
    }
}

/* Cancel edit — restore original text */
function forumCancelEdit(postId) {
    const msgEl = document.querySelector('[data-forum-id="' + postId + '"]');
    if (!msgEl) return;
    const original = msgEl.dataset.originalContent || '';
    const bubble   = msgEl.querySelector('.forum-bubble');
    if (!bubble) return;
    bubble.innerHTML = '';
    const span = document.createElement('span');
    span.className   = 'forum-text';
    span.id          = 'forum-text-' + postId;
    span.textContent = original;
    bubble.appendChild(span);
}

/* Delete a post (own posts only) */
async function forumDeletePost(postId) {
    if (!confirm('Delete this message?')) return;

    const { error } = await supabaseClient
        .from('forum_posts')
        .delete()
        .eq('id', postId);

    if (!error) {
        const el = document.querySelector('[data-forum-id="' + postId + '"]');
        if (el) el.remove();
        _forumPostIds.delete(postId);
    } else {
        console.error('Forum delete error:', error);
    }
}

// Expose to global scope (used by inline onclick handlers in the toolbar)
window.initForum           = initForum;
window.forumUpdateInputState = forumUpdateInputState;
window.forumSubmitPost     = forumSubmitPost;
window.forumAddEmoji       = forumAddEmoji;
window.forumClearInput     = forumClearInput;
window.forumEditPost       = forumEditPost;
window.forumSaveEdit       = forumSaveEdit;
window.forumCancelEdit     = forumCancelEdit;
window.forumDeletePost     = forumDeletePost;

// Ticket popup: creates a release-style popup with a square image and a "Get Tickets Here!" link.
function createTicketPopup(options = {}) {
    // Do not create if a similar popup already exists
    if (document.querySelector('.album-promo-popup') || document.getElementById('ticketPopup')) return;

    const imageSrc = options.image || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="%23f0f0f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="%23666">Add your image here</text></svg>';
    const ticketUrl = options.url || 'https://ticketmaster.com/super-duper-useless-show-atlanta-georgia-02-06-2026/event/0E006427C015711F?brid=g23Qt_2aWQwsu-rijvk7pA';

    const popup = document.createElement('div');
    popup.className = 'album-promo-popup';
    popup.id = 'ticketPopup';
    popup.style.left = '50%';
    popup.style.top = '80px';
    popup.style.transform = 'translateX(-50%)';

    popup.innerHTML = `
        <div class="album-popup-header">
            <div class="album-popup-title">🎟 Upcoming Drop</div>
            <button class="album-popup-close" id="ticketPopupClose">×</button>
        </div>
        <div class="album-popup-content" style="display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; text-align: center !important; padding: 20px;">
            <div class="ticket-inner" style="display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; gap: 15px !important; width: 100%;">
                <div class="ticket-image-frame" style="width: 200px !important; height: 200px !important; border: 2px inset #c0c0c0 !important; background: white !important; display: flex !important; align-items: center !important; justify-content: center !important; padding: 4px !important;">
                    <img id="ticketPopupImg" src="${imageSrc}" alt="Ticket Image" style="width: 100% !important; height: 100% !important; object-fit: cover !important; display: block !important;" />
                </div>
                <div class="ticket-text-area" style="display: flex !important; flex-direction: column !important; align-items: center !important; gap: 12px !important; width: 100% !important; text-align: center !important;">
                    <div class="ticket-desc" style="font-size: 14px !important; font-weight: bold !important; line-height: 1.4 !important; animation: flashRedWhite 1s infinite !important; -webkit-animation: flashRedWhite 1s infinite !important;">Come See B6 and BABY KIA Live at The SUPER DUPER USELESS SHOW! Friday February 06, Get Tickets Below!</div>
                    <a id="ticketPopupLink" href="${ticketUrl}" target="_blank" rel="noopener" class="ticket-btn" style="display: inline-block !important; padding: 8px 16px !important; background: #000080 !important; color: white !important; border: 2px outset #000080 !important; text-decoration: none !important; font-weight: bold !important; text-align: center !important; font-size: 12px !important; cursor: pointer !important;">Get Tickets Here!</a>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(popup);

    // Center vertically if possible (desktop), mobile CSS will override
    setTimeout(() => {
        if (popup.offsetWidth) {
            popup.style.left = `calc(50%)`;
            popup.style.transform = 'translateX(-50%)';
        }
    }, 50);

    // Flash text red and white
    const textDesc = popup.querySelector('.ticket-desc');
    if (textDesc) {
        let isRed = true;
        setInterval(() => {
            textDesc.style.color = isRed ? '#ff0000' : '#ffffff';
            isRed = !isRed;
        }, 500);
    }

    const closeBtn = document.getElementById('ticketPopupClose');
    function closePopup() {
        if (!popup) return;
        popup.remove();
    }

    if (closeBtn) closeBtn.addEventListener('click', closePopup);

    // Auto-close after 30 seconds
    setTimeout(() => {
        closePopup();
    }, 30000);
}

// Ticket popup auto-trigger — DISABLED (event passed). Uncomment and update for future ticket drops.
// document.addEventListener('DOMContentLoaded', () => {
//     if (!document.querySelector('.album-promo-popup') && !document.getElementById('ticketPopup')) {
//         createTicketPopup({
//             image: 'z.SuperDuperUselessPromo.png',
//             url: 'https://ticketmaker.com/your-event-url'
//         });
//     }
// });

/* ============================================================
   AUTH — Supabase Google Sign-In + Profile Modal
   Requires: supabase-config.js loaded before script.js
============================================================ */

const Auth = {
    currentUser: null,
    currentProfile: null,

    async init() {
        // Bind click handlers immediately — before any async calls
        // so buttons work even if Supabase is slow or throws
        this._bindHandlers();

        try {
            // Pick up existing session (also handles the OAuth redirect token exchange)
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (session) {
                this.currentUser = session.user;
                await this._loadProfile(session.user.id);
            }
            this._updateUI();

            // React to future sign-in / sign-out events
            supabaseClient.auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_IN' && session) {
                    this.currentUser = session.user;
                    await this._loadProfile(session.user.id);
                    this._updateUI();
                    // Clean OAuth tokens out of the URL bar after redirect
                    if (window.location.hash || window.location.search.includes('code=')) {
                        history.replaceState(null, '', window.location.pathname);
                    }
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                    this.currentProfile = null;
                    this._updateUI();
                }
            });
        } catch (e) {
            console.error('Auth init error:', e);
        }
    },

    async signInWithGoogle() {
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin + window.location.pathname }
        });
        if (error) console.error('Sign-in error:', error);
    },

    async signOut() {
        const { error } = await supabaseClient.auth.signOut();
        if (error) console.error('Sign-out error:', error);
    },

    async _loadProfile(userId) {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (!error && data) this.currentProfile = data;
    },

    _updateUI() {
        const isSignedIn = !!this.currentUser;
        const displayName = this.currentProfile?.display_name
            || this.currentUser?.user_metadata?.full_name
            || 'User';
        const role = this.currentProfile?.role || 'groupie';
        const isMember = role === 'member';
        // Members get their avatar; groupies always get the default icon
        const avatarUrl = isMember
            ? (this.currentProfile?.avatar_url || this.currentUser?.user_metadata?.avatar_url || null)
            : null;

        // Start menu header: user name
        const userNameEl = document.querySelector('.user-name');
        if (userNameEl) userNameEl.textContent = isSignedIn ? displayName : 'User';

        // Start menu header: avatar (members only) / icon
        const userIconEl = document.querySelector('.user-icon');
        if (userIconEl) {
            userIconEl.innerHTML = (isSignedIn && avatarUrl)
                ? `<img src="${avatarUrl}" alt="Profile" class="user-avatar-img">`
                : '👤';
        }

        // Taskbar auth button (desktop)
        const authBtn = document.getElementById('authTaskbarBtn');
        if (authBtn) {
            authBtn.classList.toggle('signed-in', isSignedIn);
            authBtn.title = isSignedIn ? `${displayName} — Settings` : 'Sign In';
        }

        // Start menu auth item text (mobile primary)
        const startMenuAuthText = document.getElementById('startMenuAuthText');
        if (startMenuAuthText) startMenuAuthText.textContent = isSignedIn ? displayName : 'Sign In';

        // Refresh forum input state if the forum window is open
        if (typeof forumUpdateInputState === 'function') forumUpdateInputState();

        // Show/hide video admin panel based on role
        if (typeof updateVideoAdminPanel === 'function') updateVideoAdminPanel();
        if (typeof updateTracksAdminPanel === 'function') updateTracksAdminPanel();
    },

    _closeStartMenu() {
        const menu = document.getElementById('startMenu');
        if (menu) menu.style.display = 'none';
        document.getElementById('startBtn')?.classList.remove('active');
    },

    _bindHandlers() {
        // Taskbar auth icon
        document.getElementById('authTaskbarBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            ProfileModal.open();
        });

        // Start menu auth item
        document.getElementById('startMenuAuthBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this._closeStartMenu();
            ProfileModal.open();
        });

        // Settings menu item — same modal
        document.getElementById('settingsMenuBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this._closeStartMenu();
            ProfileModal.open();
        });
    }
};

/* ---- Profile / Settings Modal ---- */

const ProfileModal = {
    modal: null,
    activeTab: 'profile',

    init() {
        this.modal = document.getElementById('profileModal');
        document.getElementById('profileModalClose')?.addEventListener('click', () => this.close());
        this.modal?.addEventListener('click', (e) => { if (e.target === this.modal) this.close(); });
    },

    async open() {
        if (!this.modal) return;
        // If signed in but profile not yet loaded, fetch it now before rendering
        if (Auth.currentUser && !Auth.currentProfile) {
            await Auth._loadProfile(Auth.currentUser.id);
        }
        const role = Auth.currentProfile?.role;
        if (role === 'member' || role === 'admin') {
            await SiteSettings.load();
        }
        this._render();
        this.modal.style.display = 'flex';
    },

    close() {
        if (!this.modal) return;
        this.modal.style.display = 'none';
        this.modal.querySelector('.auth-modal')?.classList.remove('tools-modal');
    },

    _render() {
        const body = document.getElementById('profileModalBody');
        if (!body) return;
        const role = Auth.currentProfile?.role;
        const isMemberOrAdmin = Auth.currentUser && (role === 'member' || role === 'admin');

        if (!Auth.currentUser) {
            this.modal?.querySelector('.auth-modal')?.classList.remove('tools-modal');
            body.style.padding = '';
            body.innerHTML = this._signInHTML();

            document.getElementById('appleSignInBtn')?.addEventListener('click', async () => {
                const btn = document.getElementById('appleSignInBtn');
                const errEl = document.getElementById('signInError');
                if (btn) { btn.disabled = true; btn.textContent = 'Redirecting...'; }
                if (errEl) errEl.textContent = '';
                try {
                    const { error } = await supabaseClient.auth.signInWithOAuth({
                        provider: 'apple',
                        options: { redirectTo: window.location.origin + window.location.pathname }
                    });
                    if (error) throw error;
                } catch (e) {
                    if (btn) { btn.disabled = false; btn.textContent = 'Sign in with Apple'; }
                    if (errEl) errEl.textContent = 'Error: ' + (e.message || e);
                }
            });

            document.getElementById('googleSignInBtn')?.addEventListener('click', async () => {
                const btn = document.getElementById('googleSignInBtn');
                const errEl = document.getElementById('signInError');
                if (btn) { btn.disabled = true; btn.textContent = 'Redirecting...'; }
                if (errEl) errEl.textContent = '';
                try {
                    const { error } = await supabaseClient.auth.signInWithOAuth({
                        provider: 'google',
                        options: { redirectTo: window.location.origin + window.location.pathname }
                    });
                    if (error) throw error;
                } catch (e) {
                    if (btn) { btn.disabled = false; btn.textContent = 'Sign in with Google'; }
                    if (errEl) errEl.textContent = 'Error: ' + (e.message || e);
                }
            });

        } else if (isMemberOrAdmin) {
            this.modal?.querySelector('.auth-modal')?.classList.add('tools-modal');
            body.style.padding = '0';
            body.innerHTML = `
                <div class="tools-tabs">
                    <button class="tools-tab${this.activeTab === 'profile' ? ' active' : ''}" data-tab="profile">👤 Profile</button>
                    <button class="tools-tab${this.activeTab === 'popups'  ? ' active' : ''}" data-tab="popups">📢 Popups</button>
                    <button class="tools-tab${this.activeTab === 'videos'  ? ' active' : ''}" data-tab="videos">🎬 Videos</button>
                    <button class="tools-tab${this.activeTab === 'results' ? ' active' : ''}" data-tab="results">📋 Results</button>
                </div>
                <div id="toolsTabContent" style="flex:1;min-height:0;display:flex;flex-direction:column;"></div>`;
            body.querySelectorAll('.tools-tab').forEach(t => {
                t.addEventListener('click', () => {
                    this.activeTab = t.dataset.tab;
                    body.querySelectorAll('.tools-tab').forEach(tb =>
                        tb.classList.toggle('active', tb.dataset.tab === this.activeTab));
                    ToolsPanel._renderContent();
                });
            });
            ToolsPanel._renderContent();

        } else {
            // Groupie — basic profile view
            this.modal?.querySelector('.auth-modal')?.classList.remove('tools-modal');
            body.style.padding = '';
            body.innerHTML = this._profileHTML();
            document.getElementById('saveProfileBtn')?.addEventListener('click', () => this._save());
            document.getElementById('signOutBtn')?.addEventListener('click', async () => { await Auth.signOut(); this.close(); });
            document.getElementById('cancelProfileBtn')?.addEventListener('click', () => this.close());
            document.getElementById('deleteAccountBtn')?.addEventListener('click', () => this._confirmDelete());
        }
    },

    _signInHTML() {
        return `
            <div class="auth-signin-panel">
                <p class="auth-signin-heading">👤 Sign In</p>
                <p class="auth-signin-sub">Sign in to set your display name<br>and personalize your experience.</p>
                <button class="auth-apple-btn" id="appleSignInBtn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.39-1.32 2.76-2.54 4zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    Sign in with Apple
                </button>
                <button class="auth-google-btn" id="googleSignInBtn">
                    <svg width="16" height="16" viewBox="0 0 24 24" style="flex-shrink:0">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                </button>
                <p id="signInError" style="color:#cc0000;font-size:11px;margin-top:10px;min-height:14px;"></p>
            </div>`;
    },

    _profileHTML() {
        const p = Auth.currentProfile;
        const u = Auth.currentUser;
        const e = _esc;
        return `
            <div class="auth-profile-panel">
                <label for="profileDisplayName">Display Name</label>
                <input type="text" id="profileDisplayName" class="auth-field"
                    value="${e(p?.display_name || u?.user_metadata?.full_name || '')}"
                    placeholder="Your name" maxlength="50">
                <label for="profileEmail">Email</label>
                <input type="email" id="profileEmail" class="auth-field"
                    value="${e(u?.email || '')}" disabled>
                <div class="auth-field-hint">Managed by your sign-in provider</div>
                <label for="profileBio">Bio</label>
                <textarea id="profileBio" class="auth-field" rows="3"
                    placeholder="Say something..." maxlength="200">${e(p?.bio || '')}</textarea>
                <div id="profileStatusMsg" class="auth-status-msg"></div>
                <div class="auth-profile-actions">
                    <button class="auth-btn auth-btn-danger" id="signOutBtn">Sign Out</button>
                    <button class="auth-btn" id="cancelProfileBtn">Cancel</button>
                    <button class="auth-btn auth-btn-primary" id="saveProfileBtn">Save</button>
                </div>
                <div class="auth-danger-zone">
                    <button class="auth-btn auth-delete-btn" id="deleteAccountBtn">Delete Account</button>
                </div>
            </div>`;
    },

    async _save() {
        const displayName = document.getElementById('profileDisplayName')?.value?.trim();
        const bio = document.getElementById('profileBio')?.value?.trim();
        const statusMsg = document.getElementById('profileStatusMsg');
        const saveBtn = document.getElementById('saveProfileBtn');
        if (!displayName) {
            if (statusMsg) { statusMsg.textContent = 'Display name cannot be empty.'; statusMsg.className = 'auth-status-msg error'; }
            return;
        }
        if (saveBtn) saveBtn.disabled = true;
        const { error } = await supabaseClient.from('profiles').upsert({
            id: Auth.currentUser.id,
            display_name: displayName,
            bio: bio || '',
            email: Auth.currentUser.email,
            updated_at: new Date().toISOString()
        });
        if (saveBtn) saveBtn.disabled = false;
        if (error) {
            if (statusMsg) { statusMsg.textContent = 'Error saving — please try again.'; statusMsg.className = 'auth-status-msg error'; }
        } else {
            await Auth._loadProfile(Auth.currentUser.id);
            Auth._updateUI();
            if (statusMsg) { statusMsg.textContent = 'Saved!'; statusMsg.className = 'auth-status-msg success'; }
            setTimeout(() => this.close(), 900);
        }
    },

    async _confirmDelete() {
        const answer = prompt('This will permanently delete your account and all your posts.\n\nType DELETE to confirm:');
        if (answer !== 'DELETE') return;
        const statusMsg = document.getElementById('profileStatusMsg');
        if (statusMsg) { statusMsg.textContent = 'Deleting...'; statusMsg.className = 'auth-status-msg'; }
        try {
            const uid = Auth.currentUser.id;
            await supabaseClient.from('forum_posts').delete().eq('user_id', uid);
            await supabaseClient.from('profiles').delete().eq('id', uid);
            await supabaseClient.auth.signOut();
            this.close();
        } catch (e) {
            if (statusMsg) { statusMsg.textContent = 'Error: ' + e.message; statusMsg.className = 'auth-status-msg error'; }
        }
    }
};

/* ============================================================
   SHARED ESCAPE HELPER
   ============================================================ */
function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ============================================================
   SITE SETTINGS  — single 'global' row in Supabase
   ============================================================ */
const SiteSettings = {
    data: null,

    async load() {
        try {
            const { data, error } = await supabaseClient
                .from('site_settings')
                .select('*')
                .eq('id', 'global')
                .single();
            if (!error && data) this.data = data;
        } catch (e) {
            console.warn('SiteSettings load error:', e);
        }
        return this.data;
    },

    async save(updates) {
        const payload = { ...updates, updated_at: new Date().toISOString(), updated_by: Auth.currentUser?.id };
        const { error } = await supabaseClient.from('site_settings').update(payload).eq('id', 'global');
        if (!error) this.data = { ...(this.data || {}), ...payload, id: 'global' };
        return error;
    },

    applyToPage() {
        if (!this.data) return;
        const d = this.data;

        const show = (type, title, bodyHTML) => {
            const id = 'sitePopup_' + type;
            if (document.getElementById(id)) return;
            const overlay = document.createElement('div');
            overlay.id = id;
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.45);z-index:100000;display:flex;align-items:center;justify-content:center;';
            overlay.innerHTML = `
                <div class="win98-popup-window">
                    <div class="win98-popup-header">
                        <span>${_esc(title)}</span>
                        <button class="win98-popup-close" onclick="document.getElementById('${id}').remove()">✕</button>
                    </div>
                    <div class="win98-popup-body">${bodyHTML}</div>
                </div>`;
            document.body.appendChild(overlay);
        };

        const _photo = (url, link) => url
            ? `<div class="win98-popup-photo-wrap">${link ? `<a href="${_esc(link)}" target="_blank"><img class="win98-popup-photo" src="${_esc(url)}" alt=""></a>` : `<img class="win98-popup-photo" src="${_esc(url)}" alt="">`}</div>`
            : '';

        // Apply the drop-date countdown immediately — the clock tick starts before the
        // 1-second popup delay, so this must run now or the taskbar shows TBA on refresh.
        if (d.drop_date) {
            setDropCountdown(true, d.drop_date);
        } else {
            setDropCountdown(false);
        }

        const _run = () => {

            if (d.popup_announcement_active) {
                show('announcement', (d.popup_announcement_title || 'Announcement') + '!',
                    _photo(d.popup_announcement_photo_url, d.popup_announcement_photo_link) +
                    (d.popup_announcement_text ? `<p>${_esc(d.popup_announcement_text)}</p>` : ''));
            }
            if (d.popup_ticket_active) {
                show('ticket', (d.popup_ticket_title || 'Get Tickets') + '!',
                    _photo(d.popup_ticket_photo_url, d.popup_ticket_photo_link) +
                    (d.popup_ticket_text ? `<p>${_esc(d.popup_ticket_text)}</p>` : '') +
                    (d.popup_ticket_url ? `<a class="win98-popup-btn" href="${_esc(d.popup_ticket_url)}" target="_blank">Get Tickets &#8594;</a>` : ''));
            }
            if (d.popup_album_active) {
                let musicBtns = '';
                if (d.popup_album_spotify_url)    musicBtns += `<a class="win98-popup-btn win98-popup-spotify" href="${_esc(d.popup_album_spotify_url)}" target="_blank">&#9654; Spotify</a>`;
                if (d.popup_album_soundcloud_url) musicBtns += `<a class="win98-popup-btn win98-popup-soundcloud" href="${_esc(d.popup_album_soundcloud_url)}" target="_blank">&#9654; SoundCloud</a>`;
                if (d.popup_album_link_active && d.popup_album_url) musicBtns += `<a class="win98-popup-btn" href="${_esc(d.popup_album_url)}" target="_blank">Listen &#8594;</a>`;
                show('album', (d.popup_album_title || 'New Drop') + '!',
                    _photo(d.popup_album_photo_url, d.popup_album_photo_link) +
                    (d.popup_album_text ? `<p>${_esc(d.popup_album_text)}</p>` : '') +
                    (musicBtns ? `<div class="win98-popup-music-btns">${musicBtns}</div>` : ''));
            }
            if (d.popup_video_active && d.popup_video_id) {
                show('video', (d.popup_video_title || 'Watch') + '!',
                    `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;">` +
                    `<iframe src="https://www.youtube.com/embed/${_esc(d.popup_video_id)}?autoplay=1" ` +
                    `style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allowfullscreen allow="autoplay"></iframe></div>`);
            }
            if (d.popup_poll_active && d.popup_poll_question) {
                const opts = Array.isArray(d.popup_poll_options) ? d.popup_poll_options : [];
                const optsHTML = opts.map((o, i) =>
                    `<label style="display:block;margin:5px 0;cursor:pointer;"><input type="radio" name="sitePoll" value="${i}" style="margin-right:6px;">${_esc(o)}</label>`
                ).join('');
                show('poll', d.popup_poll_question + '!',
                    `<div>${optsHTML}</div>` +
                    `<div id="pollSubmitStatus" style="font-size:10px;color:#666;min-height:14px;margin-top:6px;"></div>` +
                    `<button class="win98-popup-btn" onclick="submitPollVote()" style="margin-top:6px;">Submit</button>`);
            }
            if (d.popup_talent_active) {
                show('talent', (d.popup_talent_title || 'Talent Submission') + '!',
                    (d.popup_talent_text ? `<p style="margin-bottom:10px;">${_esc(d.popup_talent_text)}</p>` : '') +
                    `<input class="win98-popup-input" placeholder="Your name *" id="talentName">` +
                    `<input class="win98-popup-input" placeholder="Contact / social *" id="talentContact">` +
                    `<textarea class="win98-popup-input" placeholder="Tell us about yourself..." id="talentDesc" rows="3"></textarea>` +
                    `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">` +
                        `<label for="talentFile" class="win98-popup-btn" style="cursor:pointer;margin-top:0;">&#128206; Attach File</label>` +
                        `<input type="file" id="talentFile" accept="image/*,audio/*,video/*,.pdf,.doc,.docx" style="display:none;">` +
                        `<span id="talentFileName" style="font-size:10px;color:#666;"></span>` +
                    `</div>` +
                    `<div id="talentSubmitStatus" style="font-size:10px;color:#666;min-height:14px;margin-bottom:6px;"></div>` +
                    `<button class="win98-popup-btn" onclick="submitTalentForm()">Submit</button>`);
                setTimeout(() => {
                    document.getElementById('talentFile')?.addEventListener('change', (e) => {
                        const f = e.target.files[0];
                        const el = document.getElementById('talentFileName');
                        if (el) el.textContent = f ? f.name : '';
                    });
                }, 100);
            }
        };

        setTimeout(() => { try { _run(); } catch(e) { console.error('applyToPage _run error:', e); } }, 1000);
    }
};

/* ============================================================
   POLL VOTE + TALENT FORM — global so inline onclick can call them
   ============================================================ */
async function submitPollVote() {
    const statusEl = document.getElementById('pollSubmitStatus');
    const selected = document.querySelector('input[name="sitePoll"]:checked');
    if (!selected) {
        if (statusEl) { statusEl.textContent = 'Please select an option.'; statusEl.style.color = '#cc0000'; }
        return;
    }
    const opts = SiteSettings.data?.popup_poll_options || [];
    const idx  = parseInt(selected.value);
    const { error } = await supabaseClient.from('poll_votes').insert({
        poll_question: SiteSettings.data?.popup_poll_question || '',
        option_index: idx,
        option_text: opts[idx] || ''
    });
    if (error) {
        if (statusEl) { statusEl.textContent = 'Error: ' + error.message; statusEl.style.color = '#cc0000'; }
    } else {
        const popup = document.getElementById('sitePopup_poll');
        if (popup) {
            popup.querySelector('.win98-popup-body').innerHTML = '<p style="text-align:center;padding:16px 10px;">&#10003; Vote submitted!</p>';
            setTimeout(() => popup.remove(), 2500);
        }
    }
}

async function submitTalentForm() {
    const statusEl = document.getElementById('talentSubmitStatus');
    const btn      = document.querySelector('#sitePopup_talent .win98-popup-btn[onclick]');
    const name     = document.getElementById('talentName')?.value?.trim();
    const contact  = document.getElementById('talentContact')?.value?.trim();
    const desc     = document.getElementById('talentDesc')?.value?.trim();
    const file     = document.getElementById('talentFile')?.files?.[0];
    if (!name) {
        if (statusEl) { statusEl.textContent = 'Please enter your name.'; statusEl.style.color = '#cc0000'; }
        return;
    }
    if (btn) btn.disabled = true;
    if (statusEl) { statusEl.textContent = 'Submitting...'; statusEl.style.color = '#555'; }
    let file_url = '';
    if (file) {
        if (statusEl) statusEl.textContent = 'Uploading file...';
        const ext  = file.name.split('.').pop().toLowerCase();
        const path = Date.now() + '_' + Math.random().toString(36).slice(2) + '.' + ext;
        const { error: uploadErr } = await supabaseClient.storage
            .from('talent-uploads')
            .upload(path, file, { upsert: false, contentType: file.type });
        if (uploadErr) {
            if (statusEl) { statusEl.textContent = 'File upload failed: ' + uploadErr.message; statusEl.style.color = '#cc0000'; }
            if (btn) btn.disabled = false;
            return;
        }
        const { data: urlData } = supabaseClient.storage.from('talent-uploads').getPublicUrl(path);
        file_url = urlData.publicUrl;
    }
    const { error } = await supabaseClient.from('talent_submissions').insert({ name, contact: contact || '', description: desc || '', file_url });
    if (btn) btn.disabled = false;
    if (error) {
        if (statusEl) { statusEl.textContent = 'Submit failed: ' + error.message; statusEl.style.color = '#cc0000'; }
    } else {
        const popup = document.getElementById('sitePopup_talent');
        if (popup) {
            popup.querySelector('.win98-popup-body').innerHTML = '<p style="text-align:center;padding:20px 10px;">&#10003; Submission received!<br>We\'ll be in touch.</p>';
            setTimeout(() => popup.remove(), 3000);
        }
    }
}

/* ============================================================
   TOOLS PANEL  — tabbed admin/member settings
   ============================================================ */
const ToolsPanel = {

    _renderContent() {
        const body = document.getElementById('toolsTabContent');
        if (!body) return;
        const tab = ProfileModal.activeTab;
        if      (tab === 'popups')  body.innerHTML = this._popupsHTML();
        else if (tab === 'videos')  body.innerHTML = this._videosHTML();
        else if (tab === 'profile') body.innerHTML = this._profileHTML();
        else if (tab === 'results') { body.innerHTML = this._resultsHTML(); this._loadResults(); }
        this._bindHandlers();
    },

    _d(key) { return SiteSettings.data?.[key] ?? ''; },
    _chk(key) { return SiteSettings.data?.[key] ? 'checked' : ''; },

    _popupsHTML() {
        const d = SiteSettings.data || {};
        const pollOpts = Array.isArray(d.popup_poll_options) ? d.popup_poll_options.join('\n') : '';
        const rawDrop  = d.drop_date || '';
        const dropDateLocal = rawDrop ? rawDrop.slice(0, 16) : '';

        const photoUI = (key) => {
            const existing = d[`popup_${key}_photo_url`] || '';
            return `
                <div style="margin-top:6px;">
                    <div style="font-size:10px;color:#555;margin-bottom:3px;">Photo (browse to upload)</div>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <img id="pp_${key}_photo_preview" src="${_esc(existing)}"
                             style="width:48px;height:48px;object-fit:cover;border:2px inset #c0c0c0;flex-shrink:0;${existing?'':'display:none'}">
                        <div id="pp_${key}_photo_empty" style="width:48px;height:48px;border:2px inset #c0c0c0;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;${existing?'display:none':''}">🖼</div>
                        <div>
                            <label for="pp_${key}_photo_file" class="auth-btn auth-file-label">Browse...</label>
                            <input type="file" id="pp_${key}_photo_file" accept="image/*" style="display:none;">
                        </div>
                    </div>
                    <input class="tools-field" id="pp_${key}_photo_link" placeholder="Photo click link (optional)" value="${_esc(d[`popup_${key}_photo_link`]||'')}" style="margin-top:4px;">
                </div>`;
        };

        return `
            <div class="tools-panel-section">
                <p style="font-size:10px;color:#666;margin-bottom:10px;">Checked popups appear ~1 second after page load for every visitor.</p>
                <div class="popup-config-row" style="display:block;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #a0a0a0;">
                    <label class="popup-label">📅 Next Drop Date/Time</label>
                    <div style="font-size:10px;color:#555;margin-bottom:4px;">Sets the countdown in the taskbar. Leave blank to show TBA.</div>
                    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                        <input class="tools-field" type="datetime-local" id="pp_drop_date" value="${_esc(dropDateLocal)}" style="width:auto;">
                        <button class="auth-btn" id="pp_drop_date_clear" style="font-size:10px;">Clear (TBA)</button>
                    </div>
                </div>
                <div class="popup-config-row">
                    <input type="checkbox" id="pp_announcement_active" ${d.popup_announcement_active?'checked':''} style="margin-top:2px;">
                    <div class="popup-config-fields">
                        <label class="popup-label" for="pp_announcement_active">📣 Announcement!</label>
                        <input class="tools-field" id="pp_announcement_title" placeholder="Title" value="${_esc(d.popup_announcement_title||'')}">
                        <textarea class="tools-field" id="pp_announcement_text" rows="2" placeholder="Message text">${_esc(d.popup_announcement_text||'')}</textarea>
                        ${photoUI('announcement')}
                    </div>
                </div>
                <div class="popup-config-row">
                    <input type="checkbox" id="pp_ticket_active" ${d.popup_ticket_active?'checked':''} style="margin-top:2px;">
                    <div class="popup-config-fields">
                        <label class="popup-label" for="pp_ticket_active">🎟 Get Tickets!</label>
                        <input class="tools-field" id="pp_ticket_title" placeholder="Title" value="${_esc(d.popup_ticket_title||'')}">
                        <textarea class="tools-field" id="pp_ticket_text" rows="2" placeholder="Message text">${_esc(d.popup_ticket_text||'')}</textarea>
                        ${photoUI('ticket')}
                        <input class="tools-field" id="pp_ticket_url" placeholder="Ticket purchase link" value="${_esc(d.popup_ticket_url||'')}">
                    </div>
                </div>
                <div class="popup-config-row">
                    <input type="checkbox" id="pp_album_active" ${d.popup_album_active?'checked':''} style="margin-top:2px;">
                    <div class="popup-config-fields">
                        <label class="popup-label" for="pp_album_active">💿 New Drop!</label>
                        <input class="tools-field" id="pp_album_title" placeholder="Title" value="${_esc(d.popup_album_title||'')}">
                        <textarea class="tools-field" id="pp_album_text" rows="2" placeholder="Message text">${_esc(d.popup_album_text||'')}</textarea>
                        ${photoUI('album')}
                        <input class="tools-field" id="pp_album_spotify_url" placeholder="Spotify link (optional)" value="${_esc(d.popup_album_spotify_url||'')}">
                        <input class="tools-field" id="pp_album_soundcloud_url" placeholder="SoundCloud link (optional)" value="${_esc(d.popup_album_soundcloud_url||'')}">
                        <div style="display:flex;align-items:center;gap:6px;margin-top:2px;">
                            <input type="checkbox" id="pp_album_link_active" ${d.popup_album_link_active?'checked':''}>
                            <label for="pp_album_link_active" style="font-size:10px;white-space:nowrap;">Show link button</label>
                            <input class="tools-field" id="pp_album_url" placeholder="Link URL" value="${_esc(d.popup_album_url||'')}" style="flex:1;">
                        </div>
                    </div>
                </div>
                <div class="popup-config-row">
                    <input type="checkbox" id="pp_poll_active" ${d.popup_poll_active?'checked':''} style="margin-top:2px;">
                    <div class="popup-config-fields">
                        <label class="popup-label" for="pp_poll_active">📊 Poll!</label>
                        <input class="tools-field" id="pp_poll_question" placeholder="Poll question" value="${_esc(d.popup_poll_question||'')}">
                        <textarea class="tools-field" id="pp_poll_options" rows="3" placeholder="One option per line&#10;Option A&#10;Option B">${_esc(pollOpts)}</textarea>
                        <div class="tools-field-hint">One option per line</div>
                    </div>
                </div>
                <div class="popup-config-row">
                    <input type="checkbox" id="pp_talent_active" ${d.popup_talent_active?'checked':''} style="margin-top:2px;">
                    <div class="popup-config-fields">
                        <label class="popup-label" for="pp_talent_active">🎤 Talent Submission!</label>
                        <input class="tools-field" id="pp_talent_title" placeholder="Title" value="${_esc(d.popup_talent_title||'')}">
                        <textarea class="tools-field" id="pp_talent_text" rows="2" placeholder="What you're looking for...">${_esc(d.popup_talent_text||'')}</textarea>
                    </div>
                </div>
            </div>
            <div class="tools-save-bar">
                <span class="tools-status" id="popupStatus"></span>
                <label style="display:flex;align-items:center;gap:5px;font-size:10px;cursor:pointer;">
                    <input type="checkbox" id="pp_notify_users"> Notify app users
                </label>
                <button class="auth-btn auth-btn-primary" id="savePopupsBtn">Save Popups</button>
            </div>`;
    },

    _videosHTML() {
        return `
            <div class="tools-panel-section">
                <p style="font-size:10px;color:#666;margin-bottom:10px;">Paste the YouTube video ID (after <em>?v=</em>) or the full URL.</p>
                <div class="popup-config-row">
                    <input type="checkbox" id="vv_startup_active" ${this._chk('startup_video_active')} style="margin-top:2px;">
                    <div class="popup-config-fields">
                        <label class="popup-label" for="vv_startup_active">🎬 Startup Video (plays when site loads)</label>
                        <input class="tools-field" id="vv_startup_id" placeholder="e.g. 7VxjjCIMK3w" value="${_esc(this._d('startup_video_id'))}">
                    </div>
                </div>
                <div class="popup-config-row">
                    <input type="checkbox" id="vv_popup_active" ${this._chk('popup_video_active')} style="margin-top:2px;">
                    <div class="popup-config-fields">
                        <label class="popup-label" for="vv_popup_active">📺 Popup Video</label>
                        <input class="tools-field" id="vv_popup_title" placeholder="Window title" value="${_esc(this._d('popup_video_title'))}">
                        <input class="tools-field" id="vv_popup_id" placeholder="YouTube video ID or full URL" value="${_esc(this._d('popup_video_id'))}">
                    </div>
                </div>
            </div>
            <div class="tools-save-bar">
                <span class="tools-status" id="videosStatus"></span>
                <button class="auth-btn auth-btn-primary" id="saveVideosBtn">Save Videos</button>
            </div>
            <div class="tools-panel-section" style="margin-top:8px;border-top:1px solid #c0c0c0;padding-top:10px;">
                <label class="popup-label" style="font-weight:bold;">🔔 Send Push Notification</label>
                <p style="font-size:10px;color:#666;margin:4px 0 8px;">Send a custom alert to all app users.</p>
                <input class="tools-field" id="notif_title" placeholder="Title (required)" maxlength="60">
                <input class="tools-field" id="notif_body" placeholder="Body message (optional)" maxlength="120" style="margin-top:4px;">
                <div class="tools-save-bar" style="margin-top:6px;">
                    <span class="tools-status" id="notifStatus"></span>
                    <button class="auth-btn auth-btn-primary" id="sendNotifBtn">Send</button>
                </div>
            </div>`;
    },

    _profileHTML() {
        const p = Auth.currentProfile || {};
        const u = Auth.currentUser;
        const roleTag = p.role ? `<span style="font-size:10px;color:#666;font-weight:normal;"> (${p.role})</span>` : '';
        const avatarSrc = p.avatar_url || '';
        return `
            <div class="tools-panel-section">
                <div class="popup-config-row" style="display:block;">
                    <label class="popup-label">Display Name ${roleTag}</label>
                    <input class="tools-field" id="pf_display_name" placeholder="Your name" value="${_esc(p.display_name||u?.user_metadata?.full_name||'')}" maxlength="50">
                </div>
                <div class="popup-config-row" style="display:block;margin-top:8px;">
                    <label class="popup-label">Bio</label>
                    <textarea class="tools-field" id="pf_bio" rows="3" placeholder="Who are you? What do you do?" maxlength="300">${_esc(p.bio||'')}</textarea>
                </div>
                <div class="popup-config-row" style="display:block;margin-top:8px;">
                    <label class="popup-label">Profile Photo</label>
                    <div style="display:flex;align-items:center;gap:10px;margin-top:6px;">
                        <img id="toolsAvatarPreview" src="${_esc(avatarSrc)}" alt="avatar"
                             style="width:42px;height:42px;object-fit:cover;border:2px inset #c0c0c0;${avatarSrc?'':'display:none'}">
                        <div id="toolsAvatarEmpty" style="width:42px;height:42px;border:2px inset #c0c0c0;display:flex;align-items:center;justify-content:center;font-size:22px;${avatarSrc?'display:none':''}">👤</div>
                        <div>
                            <label for="toolsAvatarFile" class="auth-btn auth-file-label">Browse...</label>
                            <input type="file" id="toolsAvatarFile" accept="image/jpeg,image/png,image/gif,image/webp" style="display:none;">
                            <div class="tools-field-hint">JPG/PNG/GIF — max 2MB</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="tools-save-bar">
                <span class="tools-status" id="profileStatus"></span>
                <button class="auth-btn auth-btn-danger" id="toolsSignOutBtn">Sign Out</button>
                <button class="auth-btn auth-btn-primary" id="saveProfileBtn2">Save Profile</button>
            </div>`;
    },

    _resultsHTML() {
        return `
            <div class="tools-panel-section" id="resultsSection">
                <div style="font-size:10px;color:#666;margin-bottom:8px;">
                    Showing poll votes and talent submissions.
                    <button class="auth-btn" id="refreshResultsBtn" style="float:right;margin-top:-2px;">&#8635; Refresh</button>
                </div>
                <div id="resultsContent"><div class="results-empty">Loading...</div></div>
            </div>`;
    },

    _bindHandlers() {
        document.getElementById('savePopupsBtn')?.addEventListener('click', () => this._savePopups());
        document.getElementById('saveVideosBtn')?.addEventListener('click', () => this._saveVideos());
        document.getElementById('sendNotifBtn')?.addEventListener('click', () => this._sendNotif());
        document.getElementById('saveProfileBtn2')?.addEventListener('click', () => this._saveProfile());
        document.getElementById('toolsSignOutBtn')?.addEventListener('click', async () => { await Auth.signOut(); ProfileModal.close(); });
        document.getElementById('pp_drop_date_clear')?.addEventListener('click', () => {
            const el = document.getElementById('pp_drop_date');
            if (el) el.value = '';
        });
        document.getElementById('toolsAvatarFile')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const preview = document.getElementById('toolsAvatarPreview');
            const empty   = document.getElementById('toolsAvatarEmpty');
            if (preview) { preview.src = URL.createObjectURL(file); preview.style.display = 'block'; }
            if (empty)   empty.style.display = 'none';
        });
        ['ticket', 'announcement', 'album'].forEach(key => {
            document.getElementById(`pp_${key}_photo_file`)?.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const preview = document.getElementById(`pp_${key}_photo_preview`);
                const empty   = document.getElementById(`pp_${key}_photo_empty`);
                if (preview) { preview.src = URL.createObjectURL(file); preview.style.display = 'block'; }
                if (empty)   empty.style.display = 'none';
            });
        });
        if (ProfileModal.activeTab === 'results') {
            this._loadResults();
            document.getElementById('refreshResultsBtn')?.addEventListener('click', () => this._loadResults());
        }
    },

    _extractVideoId(input) {
        if (!input) return '';
        const m = input.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
        return m ? m[1] : input.trim();
    },

    async _uploadPopupPhoto(fileInputId, filename) {
        const fileInput = document.getElementById(fileInputId);
        const file = fileInput?.files?.[0];
        if (!file) return null;
        const ext  = file.name.split('.').pop().toLowerCase();
        const path = `${filename}.${ext}`;
        const { error } = await supabaseClient.storage.from('popup-assets').upload(path, file, { upsert: true, contentType: file.type });
        if (error) throw error;
        const { data } = supabaseClient.storage.from('popup-assets').getPublicUrl(path);
        return data.publicUrl;
    },

    async _savePopups() {
        const statusEl = document.getElementById('popupStatus');
        const btn = document.getElementById('savePopupsBtn');
        if (btn) btn.disabled = true;
        if (statusEl) { statusEl.textContent = 'Saving...'; statusEl.className = 'tools-status'; }
        const g = (id) => document.getElementById(id);
        const v = (id) => g(id)?.value?.trim() || '';
        const c = (id) => !!g(id)?.checked;
        const pollOptions = v('pp_poll_options').split('\n').map(s => s.trim()).filter(Boolean);
        const updates = {
            popup_announcement_active: c('pp_announcement_active'), popup_announcement_title: v('pp_announcement_title'), popup_announcement_text: v('pp_announcement_text'),
            popup_announcement_photo_url: SiteSettings.data?.popup_announcement_photo_url || '', popup_announcement_photo_link: v('pp_announcement_photo_link'),
            popup_ticket_active: c('pp_ticket_active'), popup_ticket_title: v('pp_ticket_title'), popup_ticket_text: v('pp_ticket_text'), popup_ticket_url: v('pp_ticket_url'),
            popup_ticket_photo_url: SiteSettings.data?.popup_ticket_photo_url || '', popup_ticket_photo_link: v('pp_ticket_photo_link'),
            popup_album_active: c('pp_album_active'), popup_album_title: v('pp_album_title'), popup_album_text: v('pp_album_text'), popup_album_url: v('pp_album_url'),
            popup_album_link_active: c('pp_album_link_active'), popup_album_spotify_url: v('pp_album_spotify_url'), popup_album_soundcloud_url: v('pp_album_soundcloud_url'),
            popup_album_photo_url: SiteSettings.data?.popup_album_photo_url || '', popup_album_photo_link: v('pp_album_photo_link'),
            popup_poll_active: c('pp_poll_active'), popup_poll_question: v('pp_poll_question'), popup_poll_options: pollOptions,
            popup_talent_active: c('pp_talent_active'), popup_talent_title: v('pp_talent_title'), popup_talent_text: v('pp_talent_text'),
            drop_date: (() => { const r = g('pp_drop_date')?.value || ''; return r ? new Date(r).toISOString() : ''; })(),
        };
        try {
            if (g('pp_announcement_photo_file')?.files?.[0] || g('pp_ticket_photo_file')?.files?.[0] || g('pp_album_photo_file')?.files?.[0]) {
                if (statusEl) statusEl.textContent = 'Uploading photos...';
            }
            const [annoPhoto, ticketPhoto, albumPhoto] = await Promise.all([
                this._uploadPopupPhoto('pp_announcement_photo_file', 'announcement'),
                this._uploadPopupPhoto('pp_ticket_photo_file', 'ticket'),
                this._uploadPopupPhoto('pp_album_photo_file', 'album'),
            ]);
            if (annoPhoto)   updates.popup_announcement_photo_url = annoPhoto;
            if (ticketPhoto) updates.popup_ticket_photo_url = ticketPhoto;
            if (albumPhoto)  updates.popup_album_photo_url  = albumPhoto;
        } catch (e) {
            if (btn) btn.disabled = false;
            if (statusEl) { statusEl.textContent = 'Photo upload failed: ' + e.message; statusEl.className = 'tools-status error'; }
            return;
        }
        const error = await SiteSettings.save(updates);
        if (btn) btn.disabled = false;
        if (error) {
            if (statusEl) { statusEl.textContent = 'Error: ' + error.message; statusEl.className = 'tools-status error'; }
        } else {
            // Re-apply popups immediately on the current page so the admin can see the effect
            // without needing a full page refresh.
            ['announcement','ticket','album','video','poll','talent'].forEach(t => {
                document.getElementById('sitePopup_' + t)?.remove();
            });
            SiteSettings.applyToPage();

            const shouldNotify = !!document.getElementById('pp_notify_users')?.checked;
            if (shouldNotify) {
                if (statusEl) statusEl.textContent = 'Saved! Notifying...';
                const notifTitle = updates.popup_announcement_active ? (updates.popup_announcement_title || 'Announcement')
                    : updates.popup_ticket_active ? (updates.popup_ticket_title || 'Get Tickets')
                    : updates.popup_album_active  ? (updates.popup_album_title  || 'New Drop')
                    : 'Check out Useless Radio';
                const nr = await sendPushNotification(notifTitle, 'New update on Useless Radio');
                if (statusEl) { statusEl.textContent = nr.error ? `Saved (notify failed: ${nr.error})` : `Saved & sent to ${nr.sent} device(s)`; statusEl.className = 'tools-status'; }
            } else {
                if (statusEl) { statusEl.textContent = 'Saved!'; statusEl.className = 'tools-status'; }
            }
            setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 3000);
        }
    },

    async _saveVideos() {
        const statusEl = document.getElementById('videosStatus');
        const btn = document.getElementById('saveVideosBtn');
        if (btn) btn.disabled = true;
        if (statusEl) { statusEl.textContent = 'Saving...'; statusEl.className = 'tools-status'; }
        const g = (id) => document.getElementById(id);
        const v = (id) => g(id)?.value?.trim() || '';
        const c = (id) => !!g(id)?.checked;
        const error = await SiteSettings.save({
            startup_video_active: c('vv_startup_active'),
            startup_video_id:     this._extractVideoId(v('vv_startup_id')),
            popup_video_active:   c('vv_popup_active'),
            popup_video_id:       this._extractVideoId(v('vv_popup_id')),
            popup_video_title:    v('vv_popup_title'),
        });
        if (btn) btn.disabled = false;
        if (error) {
            if (statusEl) { statusEl.textContent = 'Error: ' + error.message; statusEl.className = 'tools-status error'; }
        } else {
            // Re-apply video popup immediately so changes show without a reload
            document.getElementById('sitePopup_video')?.remove();
            SiteSettings.applyToPage();
            if (statusEl) { statusEl.textContent = 'Saved!'; statusEl.className = 'tools-status'; }
            setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 2500);
        }
    },

    async _saveProfile() {
        const statusEl = document.getElementById('profileStatus');
        const btn = document.getElementById('saveProfileBtn2');
        if (btn) btn.disabled = true;
        if (statusEl) { statusEl.textContent = 'Saving...'; statusEl.className = 'tools-status'; }
        const g = (id) => document.getElementById(id);
        const v = (id) => g(id)?.value?.trim() || '';
        const displayName = v('pf_display_name');
        if (!displayName) {
            if (statusEl) { statusEl.textContent = 'Display name required.'; statusEl.className = 'tools-status error'; }
            if (btn) btn.disabled = false;
            return;
        }
        const saveData = { id: Auth.currentUser.id, display_name: displayName, bio: v('pf_bio'), email: Auth.currentUser.email, updated_at: new Date().toISOString() };
        const file = g('toolsAvatarFile')?.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                if (statusEl) { statusEl.textContent = 'Image must be under 2MB.'; statusEl.className = 'tools-status error'; }
                if (btn) btn.disabled = false;
                return;
            }
            if (statusEl) statusEl.textContent = 'Uploading photo...';
            const ext  = file.name.split('.').pop().toLowerCase();
            const path = `${Auth.currentUser.id}/avatar.${ext}`;
            const { error: uploadErr } = await supabaseClient.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type });
            if (uploadErr) {
                if (statusEl) { statusEl.textContent = 'Upload failed: ' + uploadErr.message; statusEl.className = 'tools-status error'; }
                if (btn) btn.disabled = false;
                return;
            }
            const { data: urlData } = supabaseClient.storage.from('avatars').getPublicUrl(path);
            saveData.avatar_url = urlData.publicUrl;
        }
        const { error } = await supabaseClient.from('profiles').upsert(saveData);
        if (btn) btn.disabled = false;
        if (error) {
            if (statusEl) { statusEl.textContent = 'Error: ' + error.message; statusEl.className = 'tools-status error'; }
        } else {
            await Auth._loadProfile(Auth.currentUser.id);
            Auth._updateUI();
            if (statusEl) { statusEl.textContent = 'Saved!'; statusEl.className = 'tools-status'; }
            setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 2500);
        }
    },

    async _sendNotif() {
        const titleEl  = document.getElementById('notif_title');
        const bodyEl   = document.getElementById('notif_body');
        const statusEl = document.getElementById('notifStatus');
        const btn      = document.getElementById('sendNotifBtn');
        const title    = titleEl?.value.trim();
        if (!title) {
            if (statusEl) { statusEl.textContent = 'Title required.'; statusEl.className = 'tools-status error'; }
            return;
        }
        if (btn) btn.disabled = true;
        if (statusEl) { statusEl.textContent = 'Sending...'; statusEl.className = 'tools-status'; }
        const result = await sendPushNotification(title, bodyEl?.value.trim() || '');
        if (btn) btn.disabled = false;
        if (result.error) {
            if (statusEl) { statusEl.textContent = 'Error: ' + result.error; statusEl.className = 'tools-status error'; }
        } else {
            if (statusEl) { statusEl.textContent = `Sent to ${result.sent} device(s)`; statusEl.className = 'tools-status'; }
            if (titleEl) titleEl.value = '';
            if (bodyEl)  bodyEl.value  = '';
            setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 3000);
        }
    },

    async _loadResults() {
        const container = document.getElementById('resultsContent');
        if (!container) return;
        document.getElementById('refreshResultsBtn')?.addEventListener('click', () => this._loadResults());
        try {
            const [votesRes, subRes] = await Promise.all([
                supabaseClient.from('poll_votes').select('*').order('created_at', { ascending: false }),
                supabaseClient.from('talent_submissions').select('*').order('created_at', { ascending: false })
            ]);
            let html = `<div class="results-section-header"><span>📊 Poll Votes</span></div>`;
            if (votesRes.error) {
                html += `<div class="results-empty">Error: ${_esc(votesRes.error.message)}</div>`;
            } else if (!votesRes.data || votesRes.data.length === 0) {
                html += `<div class="results-empty">No votes yet.</div>`;
            } else {
                const byQ = {};
                votesRes.data.forEach(v => {
                    const q = v.poll_question || '(untitled)';
                    if (!byQ[q]) byQ[q] = {};
                    const key = v.option_text || `Option ${v.option_index}`;
                    byQ[q][key] = (byQ[q][key] || 0) + 1;
                });
                Object.entries(byQ).forEach(([q, counts]) => {
                    const total = Object.values(counts).reduce((a, b) => a + b, 0);
                    const barsHTML = Object.entries(counts).map(([opt, n]) => {
                        const pct = total > 0 ? Math.round((n / total) * 100) : 0;
                        return `<div class="results-bar-row"><span class="results-bar-label">${_esc(opt)}</span><div class="results-bar" style="width:${pct}px;max-width:120px;"></div><span class="results-bar-count">${n}</span></div>`;
                    }).join('');
                    html += `<div class="results-card"><strong>${_esc(q)}</strong><div style="font-size:10px;color:#666;margin-bottom:4px;">${total} vote${total !== 1?'s':''}</div><div class="results-bar-wrap">${barsHTML}</div></div>`;
                });
            }
            html += `<div class="results-section-header" style="margin-top:12px;"><span>🎤 Talent Submissions</span></div>`;
            if (subRes.error) {
                html += `<div class="results-empty">Error: ${_esc(subRes.error.message)}</div>`;
            } else if (!subRes.data || subRes.data.length === 0) {
                html += `<div class="results-empty">No submissions yet.</div>`;
            } else {
                subRes.data.forEach(s => {
                    const date = new Date(s.created_at).toLocaleDateString();
                    html += `<div class="results-card"><strong>${_esc(s.name)}</strong><span style="font-size:10px;color:#666;margin-left:8px;">${date}</span><br>${s.contact?`<span style="font-size:10px;">&#128222; ${_esc(s.contact)}</span><br>`:''} ${s.description?`<p style="margin:4px 0;font-size:11px;">${_esc(s.description)}</p>`:''} ${s.file_url?`<a href="${_esc(s.file_url)}" target="_blank" class="auth-btn" style="font-size:10px;margin-top:4px;display:inline-block;">&#128206; View File</a>`:''}</div>`;
                });
            }
            container.innerHTML = html;
        } catch (e) {
            container.innerHTML = `<div class="results-empty">Error: ${_esc(e.message)}</div>`;
        }
    }
};

/* ============================================================
   FORUM TERMS + FLAG/BLOCK (Guideline 1.2)
   ============================================================ */

const FORUM_TERMS_KEY  = 'uselessradio-forum-terms';
const FORUM_BLOCKED_KEY = 'uselessradio-blocked-users';

function forumTermsAccepted() {
    return localStorage.getItem(FORUM_TERMS_KEY) === '1';
}

function forumGetBlocked() {
    try { return JSON.parse(localStorage.getItem(FORUM_BLOCKED_KEY) || '[]'); } catch { return []; }
}

function forumBlockUser(userId, displayName) {
    if (!confirm(`Block ${displayName || 'this user'}? Their posts will be hidden.`)) return;
    const blocked = forumGetBlocked();
    if (!blocked.includes(userId)) {
        blocked.push(userId);
        localStorage.setItem(FORUM_BLOCKED_KEY, JSON.stringify(blocked));
    }
    // Remove their messages from DOM immediately
    document.querySelectorAll(`[data-forum-id]`).forEach(el => {
        if (el.dataset.forumUserId === userId) el.remove();
    });
    // Log report
    if (Auth.currentUser) {
        supabaseClient.from('forum_posts').insert({
            user_id: Auth.currentUser.id,
            display_name: '[SYSTEM]',
            content: `[BLOCK REPORT] ${Auth.currentUser.id} blocked user ${userId} (${displayName})`
        }).catch(() => {});
    }
}

function forumFlagPost(postId, authorName) {
    const reasons = ['Inappropriate or offensive', 'Spam or misleading', 'Harassment or bullying', 'Other'];
    const reasonList = reasons.map((r, i) => `${i + 1}. ${r}`).join('\n');
    const answer = prompt(`Report this post by ${authorName || 'user'}?\n\nChoose a reason:\n${reasonList}\n\nEnter number:`);
    const idx = parseInt(answer) - 1;
    if (isNaN(idx) || idx < 0 || idx >= reasons.length) return;
    const reason = reasons[idx];
    if (Auth.currentUser) {
        supabaseClient.from('forum_posts').insert({
            user_id: Auth.currentUser.id,
            display_name: '[SYSTEM]',
            content: `[FLAG] Post ${postId} by ${authorName} — ${reason}`
        }).catch(() => {});
    }
    alert('Thank you — report submitted.');
}

// APNs token bridge — native iOS app injects the device token via evaluateJavaScript
window.onNativeApnsToken = async function(token) {
    if (!token) return;
    await supabaseClient.from('push_tokens').upsert(
        { device_token: token, platform: 'ios', updated_at: new Date().toISOString() },
        { onConflict: 'device_token' }
    );
};

// Calls the send-push Edge Function; returns { sent, error }
async function sendPushNotification(title, body) {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) return { error: 'Not authenticated' };
        const resp = await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({ title, body: body || '' })
        });
        const result = await resp.json();
        if (!resp.ok) return { error: result.error || resp.statusText };
        return result;
    } catch (e) {
        return { error: e.message };
    }
}

// Auth boot is handled by initApp() called from React useEffect
