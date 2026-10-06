import React from 'react';
import { TrendingUp, ShieldCheck, Database, Server, Cpu, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      background: 'rgba(8, 11, 17, 0.95)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '3rem 2rem 2rem',
      marginTop: 'auto',
      color: 'var(--text-muted)'
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>
          {/* Col 1 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)',
                padding: '0.4rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp size={18} color="#ffffff" />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'Plus Jakarta Sans' }}>
                Trade<span style={{ color: '#10b981' }}>EZ</span>
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>
              Full-stack MERN stock market simulation and real-time portfolio management platform. Practice trading equities and crypto risk-free with virtual capital.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <span className="badge-neutral"><Database size={12} /> MongoDB</span>
              <span className="badge-neutral"><Server size={12} /> Express</span>
              <span className="badge-neutral"><Cpu size={12} /> React</span>
              <span className="badge-neutral"><Globe size={12} /> Node.js</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
              Project Information
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li><strong>Institution:</strong> SmartBridge / SmartInternz</li>
              <li><strong>Mentor:</strong> Syed Abul Arshad</li>
              <li><strong>Contact:</strong> arshad+mentor@thesmartbridge.com</li>
              <li><strong>Architecture:</strong> 6 Epics / 19 Tasks Completed</li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
              Trading Platform Features
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li>✓ Real-Time Stock Price Polling & Brownian Simulator</li>
              <li>✓ JWT Role-Based Authentication (User & Admin)</li>
              <li>✓ Interactive Chart.js Dynamic Trend Visualization</li>
              <li>✓ Virtual Portfolio Balance Tracking & Trade Auditing</li>
              <li>✓ Complete Admin Panel for Stock & User Moderation</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
              Risk Disclosure
            </h4>
            <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--text-faint)' }}>
              TradeEZ is an educational virtual trading simulation environment. All trades are executed with simulated virtual funds and do not reflect real monetary transactions or financial market guarantees.
            </p>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-faint)'
        }}>
          <div>
            © 2026 TradeEZ Platform. Developed for SmartBridge MERN Full-Stack Internship.
          </div>
          <div>
            Built with React 18, Vite, Node.js, Express, and MongoDB.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
