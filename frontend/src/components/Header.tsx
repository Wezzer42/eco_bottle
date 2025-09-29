"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import AuthModal from "./AuthModal";
import { Button } from "@/components/ui/button";
import { User, LogOut, ChevronDown } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  // Handle URL hash to open AuthModal
  useEffect(() => {
    function handleHashChange() {
      if (window.location.hash === '#auth') {
        setAuthOpen(true);
        window.history.replaceState(null, '', window.location.pathname);
      }
    }

    handleHashChange(); // Check on initial load
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <header style={styles.header}>
      <div style={styles.wrap}>
        <Link href="/" style={styles.brand} aria-label="EcoBottle home">
          <span style={styles.logoDot} />
          EcoBottle
        </Link>

        {/* Desktop nav */}
        <nav style={styles.navDesktop} aria-label="Main">
          <Link href="/" style={styles.navLink}>Home</Link>
          <Link href="/#features" style={styles.navLink}>Features</Link>
          <Link href="/#testimonials" style={styles.navLink}>Testimonials</Link>
        </nav>

        <div style={styles.actions}>
          {status === 'loading' ? (
            <div style={{ padding: '8px 16px', color: '#666' }}>Loading...</div>
          ) : session ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={styles.userButton}
                aria-label="User menu"
              >
                <div style={styles.avatar}>
                  {session.user?.image ? (
                    <Image 
                      src={session.user.image} 
                      alt={session.user.name || 'User'} 
                      width={32}
                      height={32}
                      style={styles.avatarImg}
                    />
                  ) : (
                    <User size={16} />
                  )}
                </div>
                <span style={styles.userName}>
                  {session.user?.name || session.user?.email?.split('@')[0] || 'User'}
                </span>
                <ChevronDown size={16} style={{ 
                  transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }} />
              </button>
              
              {userMenuOpen && (
                <div style={styles.userMenu}>
                  <Link href="/profile" style={styles.userMenuItem} onClick={() => setUserMenuOpen(false)}>
                    <User size={16} />
                    Profile
                  </Link>
                  <button 
                    onClick={() => signOut()} 
                    style={{...styles.userMenuItem, border: 'none', background: 'none', width: '100%', textAlign: 'left'}}
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button variant="outline" onClick={() => setAuthOpen(true)}>Sign in</Button>
          )}
          
          {/* Burger */}
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(s => !s)}
            style={styles.burger}
          >
            <span style={styles.burgerBar} />
            <span style={styles.burgerBar} />
            <span style={styles.burgerBar} />
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <nav
        aria-label="Mobile"
        style={{
          ...styles.navMobile,
          maxHeight: open ? 320 : 0,
          opacity: open ? 1 : 0
        }}
      >
        <Link href="/" style={styles.navMobileLink} onClick={() => setOpen(false)}>Home</Link>
        <Link href="/#features" style={styles.navMobileLink} onClick={() => setOpen(false)}>Features</Link>
        <Link href="/#testimonials" style={styles.navMobileLink} onClick={() => setOpen(false)}>Testimonials</Link>
        <Link href="/profile" style={styles.navMobileLink} onClick={() => setOpen(false)}>Profile</Link>
        {session ? (
          <button 
            type="button" 
            style={{...styles.navMobileLink, textAlign: 'left', border: 'none', background: 'none'}} 
            onClick={() => { setOpen(false); signOut(); }}
          >
            Sign out ({session.user?.name || session.user?.email})
          </button>
        ) : (
          <button 
            type="button" 
            style={{...styles.navMobileLink, textAlign: 'left', border: 'none', background: 'none'}} 
            onClick={() => { setOpen(false); setAuthOpen(true); }}
          >
            Sign in
          </button>
        )}
      </nav>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    backdropFilter: "saturate(180%) blur(8px)",
    background: "rgba(255,255,255,0.7)",
    borderBottom: "1px solid rgba(0,0,0,0.06)"
  },
  wrap: {
    height: 60,
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  brand: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 800,
    fontSize: 18,
    textDecoration: "none",
    color: "inherit"
  },
  logoDot: {
    width: 12, height: 12, borderRadius: "50%",
    background: "linear-gradient(180deg,#5aa7ff,#3f8ae0)"
  },
  navDesktop: {
    display: "none",
    gap: 16,
    alignItems: "center"
  },
  navLink: {
    padding: "8px 10px",
    borderRadius: 10,
    textDecoration: "none",
    color: "#111",
    opacity: 0.9
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: 8
  },
  burger: {
    display: "inline-flex",
    flexDirection: "column",
    gap: 3,
    padding: 8,
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.1)",
    background: "white",
    cursor: "pointer"
  },
  burgerBar: {
    width: 18, height: 2, background: "#111", borderRadius: 2
  },
  navMobile: {
    display: "grid",
    overflow: "hidden",
    transition: "max-height .25s ease, opacity .2s ease",
    padding: "0 16px"
  },
  navMobileLink: {
    padding: "12px 0",
    borderBottom: "1px dashed rgba(0,0,0,0.08)",
    textDecoration: "none",
    color: "#111"
  },
  userButton: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.1)",
    background: "white",
    cursor: "pointer",
    fontSize: 14,
    color: "#111"
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "#f0f0f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const
  },
  userName: {
    maxWidth: 100,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const
  },
  userMenu: {
    position: "absolute" as const,
    top: "100%",
    right: 0,
    marginTop: 4,
    background: "white",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: 10,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    minWidth: 160,
    zIndex: 100
  },
  userMenuItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 16px",
    textDecoration: "none",
    color: "#111",
    fontSize: 14,
    cursor: "pointer",
    borderBottom: "1px solid rgba(0,0,0,0.05)"
  }
};


