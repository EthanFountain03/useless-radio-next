'use client';

import { useEffect } from 'react';

export default function UselessRadioApp() {
  useEffect(() => {
    import('../lib/uselessRadio').then(({ initApp }) => {
      initApp();
    });
  }, []);

  return (
    <>
      {/* Startup Screen */}
      <div className="startup-screen" id="startupScreen">
        <div className="startup-content">
          <img src="/z.uselessradiologoblack.png" alt="Loading..." className="startup-logo" id="startupLogo" />
          <div className="loading-bar-container">
            <div className="loading-bar" id="loadingBar"></div>
          </div>
          <div className="startup-text">Starting Useless.Radio...</div>
        </div>
        <audio id="startupSound" preload="auto">
          <source src="/startup-sound.mp3" type="audio/mpeg" />
          <source src="/startup-sound.wav" type="audio/wav" />
        </audio>
      </div>

      <div className="desktop" id="mainDesktop" style={{ display: 'none' }}>
        {/* Animated GIF decorations */}
        <div className="animated-gifs">
          <img src="/z.logogif.gif" alt="" className="desktop-gif desktop-gif-right" />
          <img src="/z.logogif.gif" alt="" className="mobile-gif mobile-gif-left" />
          <img src="/z.logogif.gif" alt="" className="mobile-gif mobile-gif-right" />
        </div>

        {/* Desktop Icons */}
        <div className="desktop-icons">
          <div className="icon" data-app="Videos">
            <div className="icon-image">
              <img src="/z.3dgifmaker92253.gif" alt="Videos" className="icon-img" />
            </div>
            <div className="icon-label">Videos</div>
          </div>
          <div className="icon" data-app="Camera Roll">
            <div className="icon-image">
              <img src="/z.3dgifmaker06848.gif" alt="Camera Roll" className="icon-img" />
            </div>
            <div className="icon-label">Camera Roll</div>
          </div>
          <div className="icon" data-app="store">
            <div className="icon-image">
              <img src="/z.3dgifmaker20342.gif" alt="Store" className="icon-img" />
            </div>
            <div className="icon-label">Store</div>
          </div>
          <div className="icon" data-app="tracks">
            <div className="icon-image">
              <img src="/z.tracks.gif" alt="Tracks" className="icon-img" />
            </div>
            <div className="icon-label">Tracks</div>
          </div>
          <div className="icon" data-app="lounge">
            <div className="icon-image">
              <img src="/z.windowsloungeicon.png" alt="Lounge" className="icon-img" />
            </div>
            <div className="icon-label">Lounge</div>
          </div>
          <div className="icon" data-app="contact">
            <div className="icon-image">
              <img src="/z.3dgifmaker45616.gif" alt="Contact" className="icon-img" />
            </div>
            <div className="icon-label">Contact</div>
          </div>
          <div className="icon" data-app="forum">
            <div className="icon-image">
              {/* Forum icon — SVG inline as data URI */}
              <img
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23c0c0c0'/%3E%3Crect x='4' y='8' width='42' height='30' rx='3' fill='%23808080'/%3E%3Crect x='5' y='9' width='40' height='28' fill='%23ffffff' stroke='%23ffffff'/%3E%3Crect x='4' y='8' width='42' height='2' fill='%23dfdfdf'/%3E%3Crect x='4' y='8' width='2' height='30' fill='%23dfdfdf'/%3E%3Crect x='9' y='16' width='28' height='3' rx='1' fill='%23000080'/%3E%3Crect x='9' y='22' width='22' height='3' rx='1' fill='%23000080'/%3E%3Crect x='9' y='28' width='18' height='3' rx='1' fill='%23808080'/%3E%3Cpolygon points='10,38 6,52 22,38' fill='%23808080'/%3E%3Cpolygon points='10,38 6,50 20,38' fill='%23ffffff'/%3E%3Crect x='22' y='26' width='36' height='26' rx='3' fill='%23808080'/%3E%3Crect x='23' y='27' width='34' height='24' fill='%23c0c0c0'/%3E%3Crect x='22' y='26' width='36' height='2' fill='%23dfdfdf'/%3E%3Crect x='22' y='26' width='2' height='26' fill='%23dfdfdf'/%3E%3Crect x='27' y='33' width='22' height='2' rx='1' fill='%23000080'/%3E%3Crect x='27' y='38' width='16' height='2' rx='1' fill='%23000080'/%3E%3Cpolygon points='46,52 52,62 36,52' fill='%23808080'/%3E%3Cpolygon points='46,52 51,60 38,52' fill='%23c0c0c0'/%3E%3C/svg%3E"
                alt="Forum"
                className="icon-img"
              />
            </div>
            <div className="icon-label">Forum</div>
          </div>
          <div className="icon" data-app="about">
            <div className="icon-image">
              <img src="/z.windowsabouticon.png" alt="About" className="icon-img" />
            </div>
            <div className="icon-label">About</div>
          </div>
        </div>

        {/* Mannivirus pixels */}
        <div className="mannivirus-pixels"></div>

        {/* Media Player Window for Video - COMPLETELY HIDDEN INITIALLY */}
        <div className="media-player-window hidden-window draggable resizable" id="window-video" style={{ display: 'none', visibility: 'hidden', opacity: 0, top: '20px', right: '20px' }}>
          <div className="media-player-header">
            <div className="media-player-title">📺 Windows Media Player - Music Video</div>
            <div className="media-player-controls">
              <button className="media-btn minimize">_</button>
              <button className="media-btn maximize">□</button>
              <button className="media-btn close">×</button>
            </div>
          </div>
          <div className="media-player-content">
            <div className="video-display">
              <div id="mainVideoPlayer" className="media-iframe"></div>
            </div>
            <div className="media-controls">
              <div className="control-buttons">
                <button className="control-btn" id="mainPlayPauseBtn">⏸</button>
                <button className="control-btn" id="mainStopBtn">⏹</button>
                <button className="control-btn" id="mainPrevBtn">⏮</button>
                <button className="control-btn" id="mainNextBtn">⏭</button>
              </div>
              <div className="progress-section">
                <span className="time-display">--:--</span>
                <div className="progress-bar-container">
                  <div className="progress-bar"></div>
                  <input type="range" className="progress-slider" min="0" max="100" defaultValue="0" disabled />
                </div>
                <span className="time-display">--:--</span>
              </div>
              <div className="volume-section">
                <button className="control-btn" id="mainMuteBtn">🔇</button>
              </div>
            </div>
            <div className="media-info">
              <div className="now-playing">Now Playing: Music Video</div>
              <div className="media-status">Ready</div>
            </div>
          </div>
        </div>

        {/* Videos Media Player Window */}
        <div className="media-player-window draggable resizable" id="window-Videos" style={{ display: 'none' }}>
          <div className="media-player-header">
            <div className="media-player-title">📹 Windows Media Player - Videos</div>
            <div className="media-player-controls">
              <button className="media-btn minimize">_</button>
              <button className="media-btn maximize">□</button>
              <button className="media-btn close">×</button>
            </div>
          </div>
          <div className="media-player-content">
            <div className="playlist-section">
              <div className="playlist-header">Playlist</div>
              <div className="playlist-controls">
                <button className="playlist-btn" id="prevVideoBtn">◀ Previous</button>
                <span className="playlist-counter" id="playlistCounter">1 / 0</span>
                <button className="playlist-btn" id="nextVideoBtn">Next ▶</button>
              </div>
              <select className="video-selector" id="videoselector">
                <option value="">Loading videos...</option>
              </select>
            </div>
            <div className="video-display">
              <div id="VideosVideoPlayer" className="media-iframe"></div>
            </div>
            <div className="media-controls">
              <div className="control-buttons">
                <button className="control-btn" id="VideosPlayPauseBtn">▶</button>
                <button className="control-btn" id="VideosStopBtn">⏹</button>
                <button className="control-btn" id="VideosPrevBtn">⏮</button>
                <button className="control-btn" id="VideosNextBtn">⏭</button>
              </div>
              <div className="progress-section">
                <span className="time-display">--:--</span>
                <div className="progress-bar-container">
                  <div className="progress-bar"></div>
                  <input type="range" className="progress-slider" min="0" max="100" defaultValue="0" disabled />
                </div>
                <span className="time-display">--:--</span>
              </div>
              <div className="volume-section">
                <button className="control-btn" id="VideosMuteBtn">🔇</button>
              </div>
            </div>
            <div className="media-info">
              <div className="now-playing" id="VideosNowPlaying">Now Playing: —</div>
              <div className="media-status">Ready</div>
            </div>
            {/* Admin Video Controls — only visible to admins */}
            <div id="videoAdminPanel" style={{ display: 'none' }}>
              <div className="video-admin-header">⚙ Video Admin</div>
              <div className="video-admin-list" id="videoAdminList"></div>
              <div className="video-admin-add">
                <input type="text" id="videoAdminTitle" className="video-admin-input" placeholder="Video title" />
                <input type="text" id="videoAdminYtId" className="video-admin-input" placeholder="YouTube ID or URL" />
                <button className="video-admin-btn" id="videoAdminAddBtn">+ Add Video</button>
                <div className="video-admin-status" id="videoAdminStatus"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Taskbar */}
        <div className="taskbar">
          <div className="taskbar-left">
            <button className="start-button" id="startBtn">
              <img
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000'%3E%3Cpath d='M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z'/%3E%3C/svg%3E"
                alt="Start"
                className="start-icon"
              />
              Start
            </button>
            {/* Personal Icons */}
            <div className="personal-icons">
              <div className="personal-icon" data-app="Swampfoot" data-tooltip="Swampfoot">
                <img src="/z.swampfoot.png" alt="Swampfoot" className="personal-icon-img" />
              </div>
              <div className="personal-icon" data-app="Owen-Givens" data-tooltip="Owen-Givens">
                <img src="/z.owen2.png" alt="Owen-Givens" className="personal-icon-img" />
              </div>
              <div className="personal-icon" data-app="Mannisupreme" data-tooltip="ManniSupreme">
                <img src="/z.manihead.png" alt="ManniSupreme" className="personal-icon-img" />
              </div>
              <div className="personal-icon" data-app="Jordan-walker" data-tooltip="Jordan Walker">
                <img src="/z.jordan head.png" alt="Jordan Walker" className="personal-icon-img" />
              </div>
            </div>
            <div className="taskbar-apps" id="taskbarApps"></div>
          </div>
          <div className="taskbar-right">
            <button className="auth-taskbar-btn" id="authTaskbarBtn" title="Sign In">👤</button>
            <div className="system-tray">
              <div className="tray-icons">🔊 📶 🔋</div>
              <div className="clock" id="clock">12:00 PM</div>
            </div>
            <div className="next-drop">
              <div className="next-label">Next Drop</div>
              <div className="next-date" id="nextDate">9.26.2025</div>
            </div>
          </div>
        </div>

        {/* Start Menu */}
        <div className="start-menu" id="startMenu" style={{ display: 'none' }}>
          <div className="start-menu-header">
            <div className="start-menu-user">
              <div className="user-icon">👤</div>
              <div className="user-name">User</div>
            </div>
          </div>
          <div className="start-menu-items">
            <div className="start-menu-item" data-app="Videos">
              <div className="menu-icon">📹</div>
              <span>Videos</span>
            </div>
            <div className="start-menu-item" data-app="forum">
              <div className="menu-icon">💬</div>
              <span>Forum</span>
            </div>
            <div className="start-menu-item" data-app="store">
              <div className="menu-icon">🛒</div>
              <span>Store</span>
            </div>
            <div className="start-menu-item" data-app="tracks">
              <div className="menu-icon">💿</div>
              <span>Tracks</span>
            </div>
            <div className="start-menu-item" data-app="lounge">
              <div className="menu-icon">🎵</div>
              <span>Lounge</span>
            </div>
            <hr className="menu-separator" />
            <div className="start-menu-item" id="startMenuAuthBtn">
              <div className="menu-icon">👤</div>
              <span id="startMenuAuthText">Sign In</span>
            </div>
            <div className="start-menu-item" id="settingsMenuBtn">
              <div className="menu-icon">⚙️</div>
              <span>Settings</span>
            </div>
            <div className="start-menu-item">
              <div className="menu-icon">🔌</div>
              <span>Shut Down...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile / Settings Modal */}
      <div className="auth-modal-overlay" id="profileModal" style={{ display: 'none' }}>
        <div className="auth-modal">
          <div className="auth-modal-header">
            <span className="auth-modal-title">⚙️ Settings</span>
            <button className="auth-modal-close" id="profileModalClose">✕</button>
          </div>
          <div className="auth-modal-body" id="profileModalBody"></div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#000080', color: '#c0c0c0', textAlign: 'center', padding: '8px', fontSize: '11px', fontFamily: "'MS Sans Serif','Tahoma',sans-serif", borderTop: '2px solid #0000ff' }}>
        © 2026 Useless Radio &nbsp;—&nbsp;
        <a href="/privacy-policy" style={{ color: '#ffff00', textDecoration: 'none' }}>Privacy Policy</a>
      </div>
    </>
  );
}
