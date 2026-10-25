import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, AlertCircle, Smartphone, CheckCircle2 } from 'lucide-react';
import './PaymentModal.css';

export function PaymentModal({ isOpen, onClose, session, onConfirmPaid, isTamil }) {
  const [qrError, setQrError] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  const price = session?.price_inr !== undefined ? session.price_inr : session?.price || 0;
  const sessionTitle =
    (isTamil && session?.title_ta ? session.title_ta : session?.title_en) ||
    session?.title_en ||
    session?.title ||
    'Guidance Workshop';

  // Construct standard UPI deep link for Android/iOS UPI applications
  const upiDeepLink = `upi://pay?pa=bhavananthanm80@okicici&pn=AGATHIYA&am=${price}&cu=INR&tn=${encodeURIComponent(
    sessionTitle.slice(0, 36)
  )}`;

  // Handle Escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      }
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusable = Array.from(focusableElements).filter(
          (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
        );

        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Prevent scrolling behind modal
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !session) return null;

  const modalContent = (
    <div
      className="agathiya-payment-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="agathiya-payment-sheet"
      >
        {/* Mobile Drag Handle */}
        <div className="payment-sheet-drag-handle" aria-hidden="true" />

        {/* Close Button with min 44x44px touch target */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label={isTamil ? 'மூடு' : 'Close payment modal'}
          className="payment-modal-close-btn"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <h2 id="payment-modal-title" className="payment-modal-title">
          {isTamil ? 'பயிலரங்குக் கட்டணம்:' : 'Pay for'} {sessionTitle}
        </h2>

        {/* Amount */}
        <div className="payment-modal-amount">
          ₹{price}
        </div>

        {/* QR Code Container ~240px */}
        <div className="payment-qr-container">
          {!qrError ? (
            <img
              src="/payments/upi-qr.png?v=20261020"
              alt="AGATHIYA UPI QR Code"
              width="240"
              height="240"
              className="payment-qr-img"
              onError={() => setQrError(true)}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc',
                borderRadius: '8px',
                color: '#64748b',
                padding: '1rem',
                textAlign: 'center'
              }}
            >
              <AlertCircle size={32} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Payment QR coming soon</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        <p className="payment-instructions">
          {isTamil
            ? 'ஏதேனும் ஒரு UPI ஆப் (Google Pay, PhonePe, Paytm) மூலம் ஸ்கேன் செய்து சரியாக ₹' + price + ' செலுத்தவும்.'
            : 'Scan with any UPI app (GPay, PhonePe, Paytm) or tap below to open directly.'}
        </p>

        {/* Transaction Reference / UTR Input */}
        <div style={{ margin: '0.75rem 0', textAlign: 'left' }}>
          <label
            htmlFor="payment-tx-ref"
            style={{
              display: 'block',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#334155',
              marginBottom: '0.35rem'
            }}
          >
            {isTamil ? 'UPI பரிவர்த்தனை எண் / UTR எண்:' : 'UPI Transaction ID / UTR Number:'}
          </label>
          <input
            id="payment-tx-ref"
            type="text"
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
            placeholder={isTamil ? 'எ.கா: 12-இலக்க UTR எண்' : 'e.g. 12-digit UTR or Bank Ref No.'}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              fontSize: '0.85rem',
              borderRadius: '6px',
              border: '1.5px solid #cbd5e1',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="payment-actions-group">
          {/* 1. Open UPI App Button */}
          <a
            href={upiDeepLink}
            className="payment-btn-upi"
            aria-label="Open UPI Payment App directly"
          >
            <Smartphone size={18} aria-hidden="true" />
            <span>{isTamil ? 'UPI ஆப்பில் திறக்க' : 'Open UPI app'}</span>
          </a>

          {/* 2. Save QR Button */}
          <a
            href="/payments/upi-qr.png"
            download="agathiya-payment-qr.png"
            className="payment-btn-save"
            aria-label="Save QR Code image to device gallery"
          >
            <Download size={17} aria-hidden="true" />
            <span>{isTamil ? 'QR படத்தை சேமிக்க' : 'Save QR'}</span>
          </a>

          {/* 3. "I have paid" Button */}
          <button
            type="button"
            onClick={() => onConfirmPaid(transactionRef)}
            className="payment-btn-paid"
            aria-label="Confirm payment completed"
          >
            <CheckCircle2 size={18} aria-hidden="true" />
            <span>{isTamil ? 'நான் பணம் செலுத்திவிட்டேன்' : 'I have paid'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}

export default PaymentModal;
