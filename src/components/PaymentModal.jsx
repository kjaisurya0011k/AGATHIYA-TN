import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, AlertCircle } from 'lucide-react';

export function PaymentModal({ isOpen, onClose, session, onConfirmPaid, isTamil }) {
  const [qrError, setQrError] = useState(false);
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  const price = session?.price_inr !== undefined ? session.price_inr : session?.price || 0;
  const sessionTitle =
    (isTamil && session?.title_ta ? session.title_ta : session?.title_en) ||
    session?.title_en ||
    session?.title ||
    'Guidance Session';

  // Handle Escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    // Focus the close button initially
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
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        boxSizing: 'border-box'
      }}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '360px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 0, 0, 0.08)',
          padding: '1.5rem',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxSizing: 'border-box',
          opacity: 1
        }}
      >
        {/* Close Button (X) with 44px min touch target */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close payment modal"
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            width: '44px',
            height: '44px',
            minWidth: '44px',
            minHeight: '44px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            color: '#475569',
            transition: 'background 0.15s ease'
          }}
        >
          <X size={20} />
        </button>

        {/* Title */}
        <h2
          id="payment-modal-title"
          style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0.5rem 0 0.25rem 0',
            textAlign: 'center',
            paddingRight: '1.5rem',
            paddingLeft: '1.5rem',
            lineHeight: 1.3
          }}
        >
          Pay for {sessionTitle}
        </h2>

        {/* Amount in large text */}
        <div
          style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            color: '#0b1a48',
            margin: '0.5rem 0 1rem 0',
            letterSpacing: '-0.02em'
          }}
        >
          ₹{price}
        </div>

        {/* QR Code Container on a white padded background */}
        <div
          style={{
            background: '#ffffff',
            backgroundColor: '#ffffff',
            padding: '12px',
            borderRadius: '12px',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '240px',
            height: '240px',
            boxSizing: 'content-box',
            marginBottom: '1rem'
          }}
        >
          {!qrError ? (
            <img
              src="/payments/upi-qr.png?v=20261020"
              alt="AGATHIYA UPI QR Code"
              width="240"
              height="240"
              style={{
                width: '240px',
                height: '240px',
                objectFit: 'contain',
                display: 'block'
              }}
              onError={() => setQrError(true)}
            />
          ) : (
            <div
              style={{
                width: '240px',
                height: '240px',
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
              <AlertCircle size={36} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
              <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Payment QR coming soon</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        <p
          style={{
            fontSize: '0.85rem',
            color: '#475569',
            textAlign: 'center',
            margin: '0 0 1.25rem 0',
            lineHeight: 1.45,
            padding: '0 0.5rem'
          }}
        >
          Scan with any UPI app (PhonePe, Google Pay, Paytm) and pay the exact amount.
        </p>

        {/* Save QR Download Link */}
        <a
          href="/payments/upi-qr.png"
          download="agathiya-payment-qr.png"
          className="btn btn-outline"
          aria-label="Save QR Code to gallery"
          style={{
            minHeight: '44px',
            width: '100%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
            borderRadius: '8px',
            boxSizing: 'border-box'
          }}
        >
          <Download size={17} />
          <span>Save QR</span>
        </a>

        {/* "I have paid" Button */}
        <button
          type="button"
          onClick={onConfirmPaid}
          className="btn btn-pay-green"
          aria-label="Confirm payment submitted"
          style={{
            minHeight: '44px',
            width: '100%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.95rem',
            fontWeight: 700,
            borderRadius: '8px',
            boxSizing: 'border-box',
            backgroundColor: '#16a34a',
            borderColor: '#15803d',
            color: '#ffffff'
          }}
        >
          I have paid
        </button>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}

export default PaymentModal;
