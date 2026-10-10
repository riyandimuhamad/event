"use client";

import React, { useState, type FormEvent } from "react";
import { Mail, Lock, User, Building, ArrowRight, X, Eye, EyeOff } from "lucide-react";

interface AuthSwitchProps {
  onSuccess?: (email: string) => void;
  onClose?: () => void;
}

export default function AuthSwitch({ onSuccess, onClose }: AuthSwitchProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("owner@eventops.local");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [showDemoList, setShowDemoList] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  const demoAccounts = [
    {
      name: "Bambang Riyandi",
      role: "Owner Organisasi (Ketua EO)",
      email: "owner@eventops.local",
      badge: "OWNER",
    },
    {
      name: "Siti Rahmawati",
      role: "Event Manager (Wakil)",
      email: "eventmanager@eventops.local",
      badge: "EVENT_MANAGER",
    },
    {
      name: "Dewi Lestari",
      role: "Head Divisi Logistik",
      email: "head.logistik@eventops.local",
      badge: "DIVISION_HEAD",
    },
    {
      name: "Anisa Putri",
      role: "Relawan Operasional",
      email: "volunteer@eventops.local",
      badge: "VOLUNTEER",
    },
  ];

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const targetEmail = email || "owner@eventops.local";
    document.cookie = `eventops_user_email=${targetEmail}; path=/; max-age=2592000`;
    if (typeof window !== "undefined") {
      localStorage.setItem("eventops_active_role_email", targetEmail);
    }
    if (onSuccess) {
      onSuccess(targetEmail);
    } else {
      window.location.href = "/nusantara-creative/events/697840e1-5ace-48fa-b866-f4825cc05c22/overview";
    }
  };

  return (
    <div className="auth-switch">
      <style>{`
        .auth-switch,
        .auth-switch * {
          box-sizing: border-box;
        }

        .auth-switch input,
        .auth-switch input:focus,
        .auth-switch input:focus-visible {
          outline: none !important;
          box-shadow: none !important;
          border: none !important;
        }

        .auth-switch {
          font-family: 'Inter Tight', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          min-height: 100vh;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          background: rgba(15, 7, 6, 0.85);
          backdrop-filter: blur(12px);
        }

        .auth-switch-card {
          position: relative;
          width: 100%;
          max-width: 940px;
          min-height: 600px;
          background: #1C1412;
          border-radius: 28px;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(122, 46, 51, 0.4);
          overflow: hidden;
          color: #EFE9DF;
        }

        .close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 10;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #EFE9DF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: rgba(122, 46, 51, 0.6);
          color: #FFC46B;
          transform: rotate(90deg);
        }

        .forms-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .signin-signup {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          left: 75%;
          width: 50%;
          transition: 0.9s 0.6s ease-in-out;
          display: grid;
          grid-template-columns: 1fr;
          z-index: 5;
        }

        .auth-form {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 2rem 3.5rem;
          transition: all 0.2s 0.6s;
          overflow: hidden;
          grid-column: 1 / 2;
          grid-row: 1 / 2;
        }

        .auth-form.sign-up-form {
          opacity: 0;
          z-index: 1;
        }

        .auth-form.sign-in-form {
          z-index: 2;
        }

        .auth-title {
          font-size: 2rem;
          color: #FFFFFF;
          margin-bottom: 6px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .auth-subtitle {
          font-size: 0.85rem;
          color: #A89F91;
          margin-bottom: 24px;
          text-align: center;
        }

        .input-field {
          max-width: 380px;
          width: 100%;
          background-color: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.12);
          margin: 8px 0;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          padding: 0 1rem;
          gap: 12px;
          position: relative;
          transition: 0.3s ease;
        }

        .input-field:focus-within {
          background-color: rgba(0, 0, 0, 0.6);
          border-color: #FFC46B;
          box-shadow: 0 0 0 2px rgba(255, 196, 107, 0.2);
        }

        .input-icon {
          color: #FFC46B;
          flex-shrink: 0;
        }

        .input-field input,
        .input-field input:focus,
        .input-field input:focus-visible {
          background: none !important;
          outline: none !important;
          box-shadow: none !important;
          border: none !important;
          line-height: 1;
          font-weight: 500;
          font-size: 0.9rem;
          color: #FFFFFF;
          width: 100%;
        }

        .input-field input::placeholder {
          color: #7A7066;
          font-weight: 400;
        }

        .toggle-password-btn {
          background: none !important;
          border: none !important;
          color: #A89F91;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: color 0.2s ease;
          flex-shrink: 0;
          outline: none !important;
        }

        .toggle-password-btn:hover {
          color: #FFC46B;
        }

        .btn-primary {
          width: 100%;
          max-width: 380px;
          background: linear-gradient(135deg, #7A2E33 0%, #5D1F23 100%);
          border: 1px solid rgba(255, 196, 107, 0.25);
          outline: none;
          height: 48px;
          border-radius: 14px;
          color: #FFFFFF;
          font-weight: 700;
          margin: 18px 0 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 10px 20px -5px rgba(122, 46, 51, 0.4);
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #8C343A 0%, #6E252A 100%);
          transform: translateY(-2px);
          box-shadow: 0 14px 28px -6px rgba(122, 46, 51, 0.6);
        }

        .panels-container {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }

        .panel {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-around;
          text-align: center;
          z-index: 6;
        }

        .left-panel {
          pointer-events: all;
          padding: 3rem 17% 2rem 12%;
        }

        .right-panel {
          pointer-events: none;
          padding: 3rem 12% 2rem 17%;
        }

        .panel .content {
          color: #EFE9DF;
          transition: transform 0.9s ease-in-out;
          transition-delay: 0.6s;
        }

        .panel h3 {
          font-weight: 800;
          line-height: 1.1;
          font-size: 1.8rem;
          margin-bottom: 12px;
          color: #FFFFFF;
        }

        .panel p {
          font-size: 0.9rem;
          padding: 0.5rem 0 1.2rem;
          color: #D4B2B5;
          line-height: 1.5;
        }

        .btn-transparent {
          margin: 0;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          min-width: 140px;
          height: 44px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
          color: #FFFFFF;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-transparent:hover {
          background: rgba(255, 196, 107, 0.2);
          border-color: #FFC46B;
          color: #FFC46B;
          transform: translateY(-2px);
        }

        .right-panel .content {
          transform: translateX(800px);
        }

        .auth-switch-card.sign-up-mode:before {
          transform: translate(100%, -50%);
          right: 52%;
        }

        .auth-switch-card.sign-up-mode .left-panel .content {
          transform: translateX(-800px);
        }

        .auth-switch-card.sign-up-mode .signin-signup {
          left: 25%;
        }

        .auth-switch-card.sign-up-mode .auth-form.sign-up-form {
          opacity: 1;
          z-index: 2;
        }

        .auth-switch-card.sign-up-mode .auth-form.sign-in-form {
          opacity: 0;
          z-index: 1;
        }

        .auth-switch-card.sign-up-mode .right-panel .content {
          transform: translateX(0%);
        }

        .auth-switch-card.sign-up-mode .left-panel {
          pointer-events: none;
        }

        .auth-switch-card.sign-up-mode .right-panel {
          pointer-events: all;
        }

        .auth-switch-card:before {
          content: "";
          position: absolute;
          height: 2000px;
          width: 2000px;
          top: -10%;
          right: 48%;
          transform: translateY(-50%);
          background: linear-gradient(-45deg, #7A2E33 0%, #2A1411 100%);
          transition: 1.8s ease-in-out;
          border-radius: 50%;
          z-index: 6;
          box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
        }

        .demo-cheat-sheet {
          width: 100%;
          max-width: 380px;
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .demo-toggle-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          font-weight: 600;
          color: #FFC46B;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 0;
        }

        .demo-list {
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .demo-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 11px;
        }

        .demo-item-info {
          display: flex;
          flex-direction: column;
        }

        .demo-item-name {
          font-weight: 700;
          color: #FFFFFF;
        }

        .demo-item-email {
          font-family: monospace;
          color: #A89F91;
          font-size: 10px;
        }

        .demo-fill-btn {
          padding: 3px 8px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #FFFFFF;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }

        .demo-fill-btn:hover {
          background: #7A2E33;
          border-color: #FFC46B;
          color: #FFC46B;
        }

        @media (max-width: 870px) {
          .auth-switch-card {
            min-height: 750px;
          }
          .signin-signup {
            width: 100%;
            top: 95%;
            transform: translate(-50%, -100%);
            transition: 1s 0.8s ease-in-out;
          }
          .signin-signup,
          .auth-switch-card.sign-up-mode .signin-signup {
            left: 50%;
          }
          .panels-container {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 2fr 1fr;
          }
          .panel {
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            padding: 2.5rem 8%;
            grid-column: 1 / 2;
          }
          .right-panel {
            grid-row: 3 / 4;
          }
          .left-panel {
            grid-row: 1 / 2;
          }
          .panel .content {
            padding-right: 15%;
            transition: transform 0.9s ease-in-out;
            transition-delay: 0.8s;
          }
          .panel h3 {
            font-size: 1.3rem;
          }
          .panel p {
            font-size: 0.75rem;
            padding: 0.5rem 0;
          }
          .btn-transparent {
            min-width: 110px;
            height: 38px;
            font-size: 0.75rem;
          }
          .auth-switch-card:before {
            width: 1500px;
            height: 1500px;
            transform: translateX(-50%);
            left: 30%;
            bottom: 68%;
            right: initial;
            top: initial;
            transition: 2s ease-in-out;
          }
          .auth-switch-card.sign-up-mode:before {
            transform: translate(-50%, 100%);
            bottom: 32%;
            right: initial;
          }
          .auth-switch-card.sign-up-mode .left-panel .content {
            transform: translateY(-300px);
          }
          .auth-switch-card.sign-up-mode .right-panel .content {
            transform: translateY(0px);
          }
          .right-panel .content {
            transform: translateY(300px);
          }
          .auth-switch-card.sign-up-mode .signin-signup {
            top: 5%;
            transform: translate(-50%, 0);
          }
        }

        @media (max-width: 570px) {
          .auth-form {
            padding: 1.5rem 1.5rem;
          }
          .panel .content {
            padding: 0.5rem 1rem;
          }
        }
      `}</style>

      <div className={isSignUp ? "auth-switch-card sign-up-mode" : "auth-switch-card"}>
        {onClose && (
          <button type="button" className="close-btn" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        )}

        <div className="forms-container">
          <div className="signin-signup">
            {/* SIGN IN FORM */}
            <form className="auth-form sign-in-form" onSubmit={onSubmit}>
              <h2 className="auth-title">Masuk System</h2>
              <p className="auth-subtitle">Platform Operasional Event Organizer Terpadu</p>

              <div className="input-field">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  required
                  placeholder="Email Organisasi / User"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="input-field">
                <Lock className="input-icon" size={18} />
                <input
                  type={showSignInPassword ? "text" : "password"}
                  required
                  placeholder="Kata Sandi (Password)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  className="toggle-password-btn"
                  aria-label={showSignInPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showSignInPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button type="submit" className="btn-primary">
                <span>Masuk ke Dashboard</span>
                <ArrowRight size={16} />
              </button>

              {/* DEMO CHEAT SHEET MANUAL GUIDE */}
              <div className="demo-cheat-sheet">
                <button
                  type="button"
                  className="demo-toggle-btn"
                  onClick={() => setShowDemoList(!showDemoList)}
                >
                  <span>🔑 Kredensial Akun Pengujian Demo (Manual)</span>
                  <span>{showDemoList ? "▲" : "▼"}</span>
                </button>

                {showDemoList && (
                  <div className="demo-list">
                    {demoAccounts.map((acc) => (
                      <div key={acc.email} className="demo-item">
                        <div className="demo-item-info">
                          <span className="demo-item-name">{acc.name} ({acc.badge})</span>
                          <span className="demo-item-email">{acc.email}</span>
                        </div>
                        <button
                          type="button"
                          className="demo-fill-btn"
                          onClick={() => {
                            setEmail(acc.email);
                            setPassword("password123");
                          }}
                        >
                          Isi
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>

            {/* SIGN UP FORM */}
            <form className="auth-form sign-up-form" onSubmit={onSubmit}>
              <h2 className="auth-title">Daftar Akun</h2>
              <p className="auth-subtitle">Mulai kelola event &amp; organisasi Anda dalam hitungan menit</p>

              <div className="input-field">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Penyelenggara"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="input-field">
                <Building className="input-icon" size={18} />
                <input
                  type="text"
                  required
                  placeholder="Nama Organisasi / EO"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>

              <div className="input-field">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  required
                  placeholder="Email Resmi Organisasi"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="input-field">
                <Lock className="input-icon" size={18} />
                <input
                  type={showSignUpPassword ? "text" : "password"}
                  required
                  placeholder="Kata Sandi (Min. 8 Karakter)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  className="toggle-password-btn"
                  aria-label={showSignUpPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showSignUpPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button type="submit" className="btn-primary">
                <span>Daftar &amp; Akses Dashboard</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* SLIDING PANELS */}
        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content">
              <h3>Belum Punya Akun?</h3>
              <p>
                Bergabunglah dengan ekosistem EventOps untuk mengelola logistik, presensi relawan QR, dan honorarium.
              </p>
              <button
                type="button"
                className="btn-transparent"
                onClick={() => setIsSignUp(true)}
              >
                Daftar Akun Baru
              </button>
            </div>
          </div>

          <div className="panel right-panel">
            <div className="content">
              <h3>Sudah Terdaftar?</h3>
              <p>
                Selamat datang kembali! Masuk untuk melanjutkan koordinasi operasional event Anda.
              </p>
              <button
                type="button"
                className="btn-transparent"
                onClick={() => setIsSignUp(false)}
              >
                Masuk System
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
