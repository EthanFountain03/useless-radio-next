export default function PrivacyPolicy() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Privacy Policy — Useless Radio</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'MS Sans Serif', 'Tahoma', sans-serif; background: #008080; color: #000; font-size: 13px; min-height: 100vh; }
          .taskbar { position: fixed; top: 0; left: 0; right: 0; height: 30px; background: linear-gradient(90deg, #000080, #0000ff); display: flex; align-items: center; padding: 0 12px; color: white; font-weight: bold; font-size: 13px; z-index: 100; }
          .taskbar a { color: #c0c0c0; text-decoration: none; margin-left: auto; font-size: 11px; }
          .window { max-width: 720px; margin: 50px auto 40px; border: 2px solid #c0c0c0; border-top-color: #dfdfdf; border-left-color: #dfdfdf; box-shadow: 3px 3px 8px rgba(0,0,0,0.5); background: #c0c0c0; }
          .title-bar { background: linear-gradient(90deg, #000080, #0000ff); color: white; padding: 4px 8px; font-weight: bold; font-size: 13px; display: flex; align-items: center; gap: 6px; }
          .content { padding: 20px; background: #f0f0f0; }
          h1 { font-size: 18px; margin-bottom: 16px; color: #000080; }
          h2 { font-size: 14px; margin: 16px 0 8px; color: #000080; border-bottom: 1px solid #c0c0c0; padding-bottom: 4px; }
          p { margin-bottom: 10px; line-height: 1.6; }
          ul { margin: 8px 0 10px 20px; }
          li { margin-bottom: 4px; line-height: 1.5; }
          a { color: #000080; }
          .updated { font-size: 11px; color: #666; margin-bottom: 16px; }
        `}</style>
      </head>
      <body>
        <div className="taskbar">
          🎵 Useless Radio
          <a href="/">← Back to site</a>
        </div>
        <div className="window">
          <div className="title-bar">🔒 Privacy Policy — Useless Radio</div>
          <div className="content">
            <h1>Privacy Policy</h1>
            <p className="updated">Last updated: January 2026</p>
            <p>Useless Radio (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the Useless Radio website and mobile application. This policy explains how we collect, use, and protect your information.</p>
            <h2>Information We Collect</h2>
            <ul>
              <li><strong>Account information:</strong> Email address and display name when you sign in with Google or Apple.</li>
              <li><strong>Profile data:</strong> Optional bio and profile photo you provide.</li>
              <li><strong>Forum posts:</strong> Messages you post in the community forum.</li>
              <li><strong>Device tokens:</strong> Push notification tokens from the iOS app for sending alerts.</li>
              <li><strong>Usage data:</strong> Standard web analytics (page views, session duration).</li>
            </ul>
            <h2>How We Use Your Information</h2>
            <ul>
              <li>To provide and operate the Useless Radio platform</li>
              <li>To display your posts and profile in the community forum</li>
              <li>To send push notifications about new content (iOS app only)</li>
              <li>To respond to support requests</li>
            </ul>
            <h2>Data Storage</h2>
            <p>Your data is stored securely using Supabase, a cloud database provider. We do not sell your personal information to third parties.</p>
            <h2>Account Deletion</h2>
            <p>You can delete your account at any time from the Settings panel within the app. This will permanently remove your profile and all forum posts.</p>
            <h2>Sign In with Apple</h2>
            <p>When you use Sign in with Apple, we only receive the information Apple provides: your name (if shared) and email address. Apple may provide a relay email address to protect your privacy.</p>
            <h2>Contact</h2>
            <p>Questions? Email us at <a href="mailto:hellouselessradio@gmail.com">hellouselessradio@gmail.com</a></p>
          </div>
        </div>
      </body>
    </html>
  );
}
