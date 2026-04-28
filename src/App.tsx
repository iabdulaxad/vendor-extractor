import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Copy, Search, Loader2, Check } from 'lucide-react';
// @ts-ignore
import NET from 'vanta/dist/vanta.net.min';
import * as THREE from 'three';
// @ts-ignore
import './App.css';

const App: React.FC = () => {
  const [shopUrl, setShopUrl] = useState('');
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      setVantaEffect(
        NET({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0x3b82f6,
          backgroundColor: 0x0f172a,
          points: 10.00,
          maxDistance: 20.00,
          spacing: 15.00
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  useEffect(() => {
    if (vantaEffect) {
      vantaEffect.setOptions({
        color: 0x3b82f6,
        backgroundColor: 0x0f172a,
      });
    }
    document.documentElement.className = 'dark';
  }, [vantaEffect]);

  const fetchVendorId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopUrl) return;

    setLoading(true);
    setError(null);
    setVendorId(null);

    try {
      const response = await axios.post(
        'https://api.admin.u-code.io/v2/invoke_function/kuai-aggregator/?project-id=3323bfe2-b147-41fd-9d24-ca7c929d6abd',
        {
          data: {
            method: 'GET',
            table: 'VENDORID',
            object_data: {
              shop_url: shopUrl,
            },
          },
        },
        {
          headers: {
            'environment-id': 'b0b902cc-5010-4497-a487-f218ede0a486',
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status === 'success' && response.data.data.vendor_id) {
        setVendorId(response.data.data.vendor_id);
      } else {
        setError('Could not find vendor ID for this URL.');
      }
    } catch (err) {
      setError('An error occurred while fetching the data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (vendorId) {
      navigator.clipboard.writeText(vendorId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="app-container dark">
      <div ref={vantaRef} className="vanta-bg"></div>
      
      <div className="content">
        <header className="app-header">
          <div className="logo-section">
            <Search className="logo-icon" size={32} />
            <h1>VendorID Extractor</h1>
          </div>
        </header>

        <main className="main-card">
          <form onSubmit={fetchVendorId} className="search-form">
            <div className="input-group">
              <input
                type="url"
                placeholder="Paste shop URL here..."
                value={shopUrl}
                onChange={(e) => setShopUrl(e.target.value)}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Extract'}
              </button>
            </div>
          </form>

          {error && <div className="error-message">{error}</div>}

          {vendorId && (
            <div className="result-card">
              <div className="result-label">Vendor ID</div>
              <div className="result-value-container">
                <span className="vendor-id">{vendorId}</span>
                <button 
                  className={`copy-btn ${copied ? 'copied' : ''}`} 
                  onClick={copyToClipboard}
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
            </div>
          )}
          
          <div className="info-text">
            Enter a shop URL to retrieve its unique vendor identifier.
          </div>
        </main>

        <footer className="app-footer">
          <p>Powered by u-code API</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
