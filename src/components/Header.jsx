import { connectWallet } from '../web3Service.js';
 
export default function Header({ account, onConnect, showToast }) {
  const short = a => a ? `${a.slice(0,6)}…${a.slice(-4)}` : null;
 
  const handleConnect = async () => {
    try {
      const { mmWeb3, account } = await connectWallet();
      onConnect(account, mmWeb3);
    } catch (e) {
      showToast(e.message, 'err');
    }
  };
 
  return (
    <header style={{
      borderBottom:'1px solid var(--border)',
      background:'rgba(13,17,23,.92)',
      backdropFilter:'blur(10px)',
      position:'sticky', top:0, zIndex:50,
    }}>
      <div style={{
        maxWidth:900, margin:'0 auto',
        display:'flex', alignItems:'center',
        justifyContent:'space-between', height:62, padding:'0 1.25rem',
      }}>
        <div style={{display:'flex',alignItems:'center',gap:'.6rem'}}>
          <span style={{fontSize:'1.3rem'}}>⚡</span>
          <span style={{fontWeight:800,fontSize:'1.05rem'}}>
            Counter<span style={{color:'var(--accent)'}}>DApp</span>
          </span>
          <span className='badge badge-net'>SEPOLIA</span>
        </div>
        {account ? (
          <span className='badge badge-ok'>● {short(account)}</span>
        ) : (
          <button className='btn-primary' onClick={handleConnect}>
            Connect MetaMask
          </button>
        )}
      </div>
    </header>
  );
}