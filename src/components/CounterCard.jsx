import { useState } from 'react';
import { getWriteContract } from '../web3Service.js';
 
export default function CounterCard({
  count, stepSize, account, mmWeb3,
  isOwner, onRefresh, showToast,
}) {
  const [txStatus, setTxStatus] = useState(null); // null|'pending'|'done'|'err'
  const [newStep,  setNewStep]  = useState('');
 
  // Generic send helper
  const send = async (label, fn) => {
    if (!account || !mmWeb3)
      return showToast('Connect your wallet first', 'err');
    setTxStatus('pending');
    showToast(`${label}: submitted to MetaMask…`, 'info');
    try {
      const contract = getWriteContract(mmWeb3);
      const gasEst   = await fn(contract).estimateGas({ from: account });
      const receipt  = await fn(contract).send({
        from: account,
        gas:  Math.ceil(Number(gasEst) * 1.2),
      });
      showToast(`${label}: confirmed in block ${receipt.blockNumber}`, 'ok');
      setTxStatus('done');
      setTimeout(onRefresh, 1500);
    } catch (e) {
      const msg = e?.cause?.message || e?.message || 'Transaction failed';
      showToast(msg.slice(0,80), 'err');
      setTxStatus('err');
    }
    setTimeout(() => setTxStatus(null), 4000);
  };
 
  const statusBadge = txStatus && (
    <span className={`badge badge-${txStatus==='pending'?'pending':txStatus==='done'?'ok':'err'}`}>
      {txStatus==='pending'?<><span className='spinner'/> Pending</>
       :txStatus==='done'?'✓ Confirmed':'✕ Failed'}
    </span>
  );
 
  return (
    <div className='card'>
      <div style={{display:'flex',justifyContent:'space-between',
        alignItems:'flex-start',marginBottom:'1.5rem',flexWrap:'wrap',gap:'.5rem'}}>
        <div>
          <h1 style={{fontSize:'1.1rem',fontWeight:700,marginBottom:'.25rem'}}>
            Counter Contract
          </h1>
          <p className='mono'>step size: {stepSize}</p>
        </div>
        {statusBadge}
      </div>
 
      {/* Big count display */}
      <div style={{
        textAlign:'center', padding:'2.5rem 1rem',
        background:'var(--bg3)', borderRadius:8, marginBottom:'1.5rem',
      }}>
        <div style={{
          fontFamily:'var(--mono)', fontSize:'5rem',
          fontWeight:900, color:'var(--accent)',
          lineHeight:1, marginBottom:'.5rem',
        }}>{count}</div>
        <div style={{color:'var(--text2)',fontSize:'.85rem'}}>
          current count on Sepolia
        </div>
      </div>
 
      {/* Action buttons */}
      <div style={{display:'flex',gap:'.75rem',flexWrap:'wrap',marginBottom:'1.5rem'}}>
        <button className='btn-primary' style={{flex:1}}
          disabled={!account || txStatus==='pending'}
          onClick={() => send('increment', c => c.methods.increment())}>
          {txStatus==='pending' ? <span className='spinner'/> : '＋'} Increment
        </button>
        <button className='btn-secondary'
          disabled={txStatus==='pending'}
          onClick={onRefresh}>↻ Refresh
        </button>
        {isOwner && (
          <button className='btn-danger'
            disabled={txStatus==='pending'}
            onClick={() => send('reset', c => c.methods.reset())}>
            Reset to 0
          </button>
        )}
      </div>
 
      {/* Owner: change step size */}
      {isOwner && (
        <div style={{
          borderTop:'1px solid var(--border)',paddingTop:'1rem',
          display:'flex',gap:'.75rem',alignItems:'center',
        }}>
          <span style={{color:'var(--text2)',fontSize:'.85rem',whiteSpace:'nowrap'}}>
            Change step size:
          </span>
          <input
            type='number' value={newStep} placeholder={stepSize}
            onChange={e => setNewStep(e.target.value)}
            style={{
              background:'var(--bg3)',border:'1px solid var(--border)',
              color:'var(--text)',borderRadius:6,padding:'.4rem .6rem',
              width:80,fontFamily:'var(--mono)',fontSize:'.85rem',outline:'none',
            }}
          />
          <button className='btn-secondary' style={{fontSize:'.8rem'}}
            disabled={!newStep||txStatus==='pending'}
            onClick={() => send(
              'setStepSize',
              c => c.methods.setStepSize(Number(newStep))
            )}>
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
