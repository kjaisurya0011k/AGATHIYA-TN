import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  adminFetchAllPayments,
  adminVerifyPayment,
  adminRejectPayment
} from '../../lib/payments';
import { formatDisplayDate } from '../../lib/dateUtils';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Eye,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  User,
  Calendar,
  AlertTriangle,
  Copy,
  CheckCheck
} from 'lucide-react';

export function AdminPaymentsPage() {
  const { lang, t } = useLanguage();
  const { user, profile } = useAuth();

  const isTamil = lang === 'ta';
  const admLang = t?.adminHub || {};

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'verified' | 'rejected'

  // Modal States
  const [verifyModalItem, setVerifyModalItem] = useState(null);
  const [rejectModalItem, setRejectModalItem] = useState(null);
  const [detailsModalItem, setDetailsModalItem] = useState(null);

  // Reject Form State
  const [rejectReasonType, setRejectReasonType] = useState('Transaction could not be confirmed');
  const [customRejectReason, setCustomRejectReason] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Feedback Toasts
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [copiedTxRef, setCopiedTxRef] = useState(null);

  // Load Payments
  const loadPayments = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await adminFetchAllPayments();
      setPayments(data || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setActionError(err.message || 'Failed to load payment registrations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPayments();

    const handlePaymentUpdated = () => {
      loadPayments(true);
    };

    window.addEventListener('agathiya-payment-updated', handlePaymentUpdated);
    return () => window.removeEventListener('agathiya-payment-updated', handlePaymentUpdated);
  }, []);

  // Summary Counts (calculated dynamically from actual database records)
  const summaryCounts = useMemo(() => {
    let pending = 0;
    let verified = 0;
    let rejected = 0;

    payments.forEach((p) => {
      if (p.status === 'pending') pending++;
      else if (p.status === 'verified') verified++;
      else if (p.status === 'rejected') rejected++;
    });

    return {
      pending,
      verified,
      rejected,
      total: payments.length
    };
  }, [payments]);

  // Filtered & Searched Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      // Status Filter
      if (statusFilter !== 'all' && p.status !== statusFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const student = (p.studentName || '').toLowerCase();
        const email = (p.studentEmail || '').toLowerCase();
        const sessionTitle = (p.sessionTitle || '').toLowerCase();
        const txRef = (p.transactionReference || '').toLowerCase();
        const mentor = (p.mentorName || '').toLowerCase();

        if (
          !student.includes(q) &&
          !email.includes(q) &&
          !sessionTitle.includes(q) &&
          !txRef.includes(q) &&
          !mentor.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [payments, statusFilter, searchQuery]);

  // Handle Verify Confirmation
  const handleConfirmVerify = async () => {
    if (!verifyModalItem) return;
    setIsSubmittingAction(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await adminVerifyPayment({
        registrationId: verifyModalItem.id,
        sessionId: verifyModalItem.sessionId,
        studentId: verifyModalItem.studentId,
        adminUser: user
      });

      if (res.success) {
        setActionSuccess(
          isTamil
            ? `கட்டணம் வெற்றிகரமாக சரிபார்க்கப்பட்டது! ${verifyModalItem.studentName} மாணவருக்கு அமர்வு அணுகல் உறுதி செய்யப்பட்டது.`
            : `Payment verified successfully! Session access confirmed for ${verifyModalItem.studentName}.`
        );
        setVerifyModalItem(null);
        await loadPayments(true);
        setTimeout(() => setActionSuccess(null), 5000);
      } else {
        throw new Error('Verification could not be recorded in database.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setActionError(err.message || 'Error verifying payment');
      setTimeout(() => setActionError(null), 5000);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handle Reject Confirmation
  const handleConfirmReject = async () => {
    if (!rejectModalItem) return;
    setIsSubmittingAction(true);
    setActionError(null);
    setActionSuccess(null);

    const finalReason =
      rejectReasonType === 'Other'
        ? customRejectReason.trim() || 'Transaction could not be confirmed'
        : rejectReasonType;

    try {
      const res = await adminRejectPayment({
        registrationId: rejectModalItem.id,
        sessionId: rejectModalItem.sessionId,
        studentId: rejectModalItem.studentId,
        reason: finalReason,
        adminUser: user
      });

      if (res.success) {
        setActionSuccess(
          isTamil
            ? `கட்டணம் நிராகரிக்கப்பட்டது. மாணவர் திரையில் காரணம் காண்பிக்கப்பட்டு மீண்டும் சமர்ப்பிக்க வழிகாட்டப்படும்.`
            : `Payment rejected. Student status updated with rejection reason and next steps.`
        );
        setRejectModalItem(null);
        setRejectReasonType('Transaction could not be confirmed');
        setCustomRejectReason('');
        await loadPayments(true);
        setTimeout(() => setActionSuccess(null), 5000);
      } else {
        throw new Error('Rejection could not be recorded in database.');
      }
    } catch (err) {
      console.error('Rejection error:', err);
      setActionError(err.message || 'Error rejecting payment');
      setTimeout(() => setActionError(null), 5000);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Copy transaction reference helper
  const handleCopyTxRef = (text) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedTxRef(text);
    setTimeout(() => setCopiedTxRef(null), 2000);
  };

  // Format timestamp helper
  const formatDateTime = (isoString) => {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      className="page-wrapper container"
      style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.5rem 1rem' }}
    >
      {/* Top Breadcrumb & Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <Link
          to="/admin"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--cyan-700)',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '0.75rem'
          }}
        >
          <ArrowLeft size={15} />
          <span>{isTamil ? 'நிர்வாக கட்டுப்பாட்டு மையம்' : 'Administrator Mission Control'}</span>
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#0f172a',
                color: '#38bdf8',
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.78rem',
                fontWeight: 700,
                marginBottom: '0.5rem'
              }}
            >
              <CreditCard size={13} />
              <span>{isTamil ? 'கட்டண சரிபார்ப்பு மேலாண்மை' : 'Payment Verification & Audit'}</span>
            </div>
            <h1
              className="page-title"
              style={{
                fontSize: 'clamp(1.5rem, 3.2vw, 2.15rem)',
                fontWeight: 800,
                color: 'var(--navy-900)',
                margin: '0 0 0.4rem 0'
              }}
            >
              {isTamil ? 'கட்டண சரிபார்ப்பு கட்டுப்பாட்டு மையம்' : 'Payment Verification'}
            </h1>
            <p style={{ fontSize: '0.92rem', color: '#64748b', margin: 0, maxWidth: '780px' }}>
              {isTamil
                ? 'மாணவர்கள் செலுத்திய கட்டணங்கள், UPI UTR பரிவர்த்தனை குறிப்புகளைச் சரிபார்த்து ஒப்புதல் அல்லது நிராகரிப்பு செய்யவும்.'
                : 'Review, verify, and manage student session payments and UPI transactions. Authenticated admin authorization with full database synchronization.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadPayments(true)}
            disabled={refreshing}
            className="btn btn-outline"
            style={{
              padding: '0.45rem 0.95rem',
              fontSize: '0.84rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontWeight: 600
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin-icon' : ''} />
            <span>{refreshing ? (isTamil ? 'புதுப்பிக்கிறது...' : 'Refreshing...') : (isTamil ? 'புதுப்பி' : 'Refresh Queue')}</span>
          </button>
        </div>
      </div>

      {/* Action Success Toast */}
      {actionSuccess && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1.5px solid #86efac',
            color: '#166534',
            borderRadius: '8px',
            padding: '0.85rem 1.15rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.88rem',
            fontWeight: 600
          }}
        >
          <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0 }} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Action Error Toast */}
      {actionError && (
        <div
          style={{
            background: '#fef2f2',
            border: '1.5px solid #fca5a5',
            color: '#991b1b',
            borderRadius: '8px',
            padding: '0.85rem 1.15rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.88rem',
            fontWeight: 600
          }}
        >
          <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
          <span>{actionError}</span>
        </div>
      )}

      {/* 4 Database-Connected Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        {/* 1. Pending Payments */}
        <div
          onClick={() => setStatusFilter('pending')}
          style={{
            padding: '1.25rem',
            background: '#FFFFFF',
            borderRadius: 'var(--radius-lg, 12px)',
            border: statusFilter === 'pending' ? '2px solid #ea580c' : '1px solid #e2e8f0',
            borderLeft: '5px solid #ea580c',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            transition: 'transform 0.15s, box-shadow 0.15s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase' }}>
              {isTamil ? 'சரிபார்ப்பு நிலுவை' : 'Pending Payments'}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} color="#c2410c" />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {summaryCounts.pending}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.5rem' }}>
            {isTamil ? 'நிர்வாகியின் சரிபார்ப்புக்கு காத்திருக்கிறது' : 'Awaiting admin verification'}
          </div>
        </div>

        {/* 2. Verified Payments */}
        <div
          onClick={() => setStatusFilter('verified')}
          style={{
            padding: '1.25rem',
            background: '#FFFFFF',
            borderRadius: 'var(--radius-lg, 12px)',
            border: statusFilter === 'verified' ? '2px solid #16a34a' : '1px solid #e2e8f0',
            borderLeft: '5px solid #16a34a',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            transition: 'transform 0.15s, box-shadow 0.15s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>
              {isTamil ? 'சரிபார்க்கப்பட்டவை' : 'Verified Payments'}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} color="#15803d" />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {summaryCounts.verified}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.5rem' }}>
            {isTamil ? 'அமர்வு அணுகல் உறுதி செய்யப்பட்டது' : 'Session access confirmed'}
          </div>
        </div>

        {/* 3. Rejected Payments */}
        <div
          onClick={() => setStatusFilter('rejected')}
          style={{
            padding: '1.25rem',
            background: '#FFFFFF',
            borderRadius: 'var(--radius-lg, 12px)',
            border: statusFilter === 'rejected' ? '2px solid #dc2626' : '1px solid #e2e8f0',
            borderLeft: '5px solid #dc2626',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            transition: 'transform 0.15s, box-shadow 0.15s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase' }}>
              {isTamil ? 'நிராகரிக்கப்பட்டவை' : 'Rejected Payments'}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircle size={16} color="#b91c1c" />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {summaryCounts.rejected}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.5rem' }}>
            {isTamil ? 'காரணத்துடன் மாணவருக்குத் தெரிவிக்கப்பட்டது' : 'Notified with reason to resubmit'}
          </div>
        </div>

        {/* 4. Total Paid Registrations */}
        <div
          onClick={() => setStatusFilter('all')}
          style={{
            padding: '1.25rem',
            background: '#FFFFFF',
            borderRadius: 'var(--radius-lg, 12px)',
            border: statusFilter === 'all' ? '2px solid #00a6bf' : '1px solid #e2e8f0',
            borderLeft: '5px solid #00a6bf',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            transition: 'transform 0.15s, box-shadow 0.15s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#008394', textTransform: 'uppercase' }}>
              {isTamil ? 'மொத்த பதிவுகள்' : 'Total Paid Registrations'}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0, 166, 191, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={16} color="#008394" />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {summaryCounts.total}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.5rem' }}>
            {isTamil ? 'தளத்தின் அனைத்து கட்டண அமர்வுப் பதிவுகள்' : 'All session payment records'}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '1rem',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg, 12px)',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              style={{
                fontSize: '0.82rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontWeight: 600,
                ...(statusFilter === 'all'
                  ? { background: 'var(--navy-900)', borderColor: 'var(--navy-900)' }
                  : {})
              }}
            >
              <span>{isTamil ? 'அனைத்து கட்டணங்களும்' : 'All Payments'}</span>
              <span style={{ marginLeft: '0.35rem', opacity: 0.8 }}>({summaryCounts.total})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`btn btn-sm ${statusFilter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
              style={{
                fontSize: '0.82rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontWeight: 600,
                ...(statusFilter === 'pending'
                  ? { background: '#ea580c', borderColor: '#ea580c', color: '#fff' }
                  : { color: '#c2410c', borderColor: '#fdba74' })
              }}
            >
              <span>{isTamil ? 'நிலுவையில் உள்ளவை' : 'Pending Verification'}</span>
              <span style={{ marginLeft: '0.35rem', fontWeight: 700 }}>({summaryCounts.pending})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('verified')}
              className={`btn btn-sm ${statusFilter === 'verified' ? 'btn-primary' : 'btn-outline'}`}
              style={{
                fontSize: '0.82rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontWeight: 600,
                ...(statusFilter === 'verified'
                  ? { background: '#16a34a', borderColor: '#16a34a', color: '#fff' }
                  : { color: '#15803d', borderColor: '#86efac' })
              }}
            >
              <span>{isTamil ? 'சரிபார்க்கப்பட்டவை' : 'Verified'}</span>
              <span style={{ marginLeft: '0.35rem' }}>({summaryCounts.verified})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('rejected')}
              className={`btn btn-sm ${statusFilter === 'rejected' ? 'btn-primary' : 'btn-outline'}`}
              style={{
                fontSize: '0.82rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontWeight: 600,
                ...(statusFilter === 'rejected'
                  ? { background: '#dc2626', borderColor: '#dc2626', color: '#fff' }
                  : { color: '#b91c1c', borderColor: '#fca5a5' })
              }}
            >
              <span>{isTamil ? 'நிராகரிக்கப்பட்டவை' : 'Rejected'}</span>
              <span style={{ marginLeft: '0.35rem' }}>({summaryCounts.rejected})</span>
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '280px', flex: '1 1 280px', maxWidth: '420px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isTamil
                  ? 'மாணவர் பெயர், மின்னஞ்சல், அமர்வு அல்லது UTR தேடுக...'
                  : 'Search by student, email, session or transaction ref...'
              }
              style={{
                width: '100%',
                padding: '0.5rem 2.2rem 0.5rem 2.25rem',
                fontSize: '0.85rem',
                borderRadius: '6px',
                border: '1.5px solid #cbd5e1',
                boxSizing: 'border-box'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0.2rem'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Registrations & Payment Verification Table */}
      <div
        className="card"
        style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg, 12px)',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.85rem'
            }}
          >
            <thead>
              <tr
                style={{
                  background: '#f8fafc',
                  borderBottom: '1.5px solid #e2e8f0',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                <th style={{ padding: '0.85rem 1rem' }}>{isTamil ? 'மாணவர்' : 'Student'}</th>
                <th style={{ padding: '0.85rem 1rem' }}>{isTamil ? 'அமர்வு' : 'Session'}</th>
                <th style={{ padding: '0.85rem 1rem' }}>{isTamil ? 'வழிகாட்டி' : 'Mentor'}</th>
                <th style={{ padding: '0.85rem 1rem' }}>{isTamil ? 'தொகை' : 'Amount'}</th>
                <th style={{ padding: '0.85rem 1rem' }}>{isTamil ? 'கட்டண முறை' : 'Payment Method'}</th>
                <th style={{ padding: '0.85rem 1rem' }}>{isTamil ? 'பரிவர்த்தனை குறிப்பு (UTR)' : 'Transaction Reference'}</th>
                <th style={{ padding: '0.85rem 1rem' }}>{isTamil ? 'சமர்ப்பிக்கப்பட்ட தேதி' : 'Submitted At'}</th>
                <th style={{ padding: '0.85rem 1rem' }}>{isTamil ? 'நிலை' : 'Status'}</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>{isTamil ? 'செயல்கள்' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <RefreshCw size={16} className="spin-icon" />
                      <span>{isTamil ? 'கட்டண பதிவுகள் ஏற்றப்படுகின்றன...' : 'Loading payment registrations from database...'}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
                    <AlertCircle size={28} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#334155' }}>
                      {searchQuery
                        ? isTamil ? 'தேடலுக்குரிய கட்டண பதிவுகள் இல்லை' : 'No payments match your search criteria'
                        : isTamil ? 'இப்பிரிவில் கட்டணப் பதிவுகள் எதுவும் இல்லை' : 'No payment registrations in this category'}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.35rem 0 0 0' }}>
                      {searchQuery
                        ? isTamil ? 'வேறு வார்த்தையைக் கொண்டு முயற்சிக்கவும் அல்லது வடிகட்டியை மாற்றவும்.' : 'Try adjusting your search terms or filters.'
                        : isTamil ? 'மாணவர்கள் கட்டணம் செலுத்தியவுடன் இங்கு தோன்றும்.' : 'When students submit payments for paid sessions, they appear here for verification.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const isVerified = p.status === 'verified';
                  const isPending = p.status === 'pending';
                  const isRejected = p.status === 'rejected';

                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.1s'
                      }}
                    >
                      {/* 1. Student Name & Email */}
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.studentName}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{p.studentEmail}</div>
                      </td>

                      {/* 2. Session Title */}
                      <td style={{ padding: '0.9rem 1rem', maxWidth: '240px' }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: '#1e293b',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={p.sessionTitle}
                        >
                          {isTamil && p.sessionTitleTa ? p.sessionTitleTa : p.sessionTitle}
                        </div>
                      </td>

                      {/* 3. Mentor */}
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <span style={{ color: '#334155' }}>{p.mentorName}</span>
                      </td>

                      {/* 4. Amount Expected & Paid */}
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>
                          ₹{p.amountPaid || p.amountExpected}
                        </div>
                        {p.amountExpected !== p.amountPaid && p.amountPaid > 0 && (
                          <div style={{ fontSize: '0.72rem', color: '#dc2626' }}>
                            Exp: ₹{p.amountExpected}
                          </div>
                        )}
                      </td>

                      {/* 5. Payment Method */}
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            background: '#f1f5f9',
                            color: '#334155',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            fontSize: '0.76rem',
                            fontWeight: 600
                          }}
                        >
                          {p.paymentMethod || 'UPI'}
                        </span>
                      </td>

                      {/* 6. Transaction Reference (UTR) */}
                      <td style={{ padding: '0.9rem 1rem', fontFamily: 'monospace' }}>
                        {p.transactionReference ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>
                              {p.transactionReference}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyTxRef(p.transactionReference)}
                              title="Copy Reference"
                              aria-label="Copy Reference"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: copiedTxRef === p.transactionReference ? '#16a34a' : '#94a3b8',
                                cursor: 'pointer',
                                padding: '2px'
                              }}
                            >
                              {copiedTxRef === p.transactionReference ? <CheckCheck size={13} /> : <Copy size={13} />}
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.78rem' }}>
                            {isTamil ? 'வழங்கப்படவில்லை' : 'Not submitted'}
                          </span>
                        )}
                      </td>

                      {/* 7. Submitted At */}
                      <td style={{ padding: '0.9rem 1rem', whiteSpace: 'nowrap', fontSize: '0.78rem', color: '#475569' }}>
                        {formatDateTime(p.submittedAt)}
                      </td>

                      {/* 8. Status */}
                      <td style={{ padding: '0.9rem 1rem' }}>
                        {isVerified && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              background: '#dcfce7',
                              color: '#15803d',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '999px',
                              fontSize: '0.76rem',
                              fontWeight: 700
                            }}
                          >
                            <CheckCircle2 size={13} />
                            <span>{isTamil ? 'சரிபார்க்கப்பட்டது' : 'Verified'}</span>
                          </span>
                        )}
                        {isPending && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              background: '#ffedd5',
                              color: '#c2410c',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '999px',
                              fontSize: '0.76rem',
                              fontWeight: 700
                            }}
                          >
                            <Clock size={13} />
                            <span>{isTamil ? 'சரிபார்ப்பு நிலுவை' : 'Pending'}</span>
                          </span>
                        )}
                        {isRejected && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              background: '#fee2e2',
                              color: '#b91c1c',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '999px',
                              fontSize: '0.76rem',
                              fontWeight: 700
                            }}
                          >
                            <XCircle size={13} />
                            <span>{isTamil ? 'நிராகரிக்கப்பட்டது' : 'Rejected'}</span>
                          </span>
                        )}
                      </td>

                      {/* 9. Actions */}
                      <td style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                          {/* View Details Button */}
                          <button
                            type="button"
                            onClick={() => setDetailsModalItem(p)}
                            title={isTamil ? 'விவரங்களைக் காண்க' : 'View Details'}
                            aria-label="View Details"
                            className="btn btn-outline"
                            style={{
                              padding: '0.3rem 0.55rem',
                              fontSize: '0.76rem',
                              borderRadius: '4px'
                            }}
                          >
                            <Eye size={13} style={{ marginRight: '0.25rem' }} />
                            <span>{isTamil ? 'விவரம்' : 'View'}</span>
                          </button>

                          {/* Pending Actions: Verify & Reject */}
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => setVerifyModalItem(p)}
                                title={isTamil ? 'கட்டணத்தை சரிபார்' : 'Verify Payment'}
                                aria-label="Verify Payment"
                                className="btn btn-primary"
                                style={{
                                  padding: '0.3rem 0.65rem',
                                  fontSize: '0.76rem',
                                  background: '#16a34a',
                                  borderColor: '#15803d',
                                  borderRadius: '4px',
                                  fontWeight: 700
                                }}
                              >
                                <Check size={13} style={{ marginRight: '0.2rem' }} />
                                <span>{isTamil ? 'சரிபார்' : 'Verify'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setRejectModalItem(p);
                                  setRejectReasonType('Transaction could not be confirmed');
                                  setCustomRejectReason('');
                                }}
                                title={isTamil ? 'கட்டணத்தை நிராகரி' : 'Reject Payment'}
                                aria-label="Reject Payment"
                                className="btn btn-outline"
                                style={{
                                  padding: '0.3rem 0.65rem',
                                  fontSize: '0.76rem',
                                  color: '#dc2626',
                                  borderColor: '#fca5a5',
                                  borderRadius: '4px',
                                  fontWeight: 600
                                }}
                              >
                                <X size={13} style={{ marginRight: '0.2rem' }} />
                                <span>{isTamil ? 'நிராகரி' : 'Reject'}</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. VERIFY PAYMENT CONFIRMATION DIALOG MODAL              */}
      {/* ========================================================= */}
      {verifyModalItem && (
        <div
          role="presentation"
          onClick={() => !isSubmittingAction && setVerifyModalItem(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="verify-modal-title"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              maxWidth: '520px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={20} color="#15803d" />
                </div>
                <div>
                  <h3 id="verify-modal-title" style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--navy-900)' }}>
                    {isTamil ? 'மாணவர் கட்டணத்தை சரிபார்க்கவும்' : 'Verify Student Payment'}
                  </h3>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    {isTamil ? 'வங்கி / UPI அறிக்கையுடன் தகவல்களை ஒப்பிட்டு உறுதிப்படுத்தவும்.' : 'Confirm payment match against bank or UPI receipt.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isSubmittingAction && setVerifyModalItem(null)}
                aria-label="Close"
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Verification Metadata Box */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.25rem'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>{isTamil ? 'மாணவர்:' : 'Student:'}</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{verifyModalItem.studentName} ({verifyModalItem.studentEmail})</span>

                <span style={{ color: '#64748b', fontWeight: 600 }}>{isTamil ? 'அமர்வு:' : 'Session:'}</span>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{verifyModalItem.sessionTitle}</span>

                <span style={{ color: '#64748b', fontWeight: 600 }}>{isTamil ? 'தொகை:' : 'Amount:'}</span>
                <span style={{ fontWeight: 800, color: '#15803d', fontSize: '1rem' }}>₹{verifyModalItem.amountPaid || verifyModalItem.amountExpected}</span>

                <span style={{ color: '#64748b', fontWeight: 600 }}>{isTamil ? 'கட்டண முறை:' : 'Method:'}</span>
                <span>{verifyModalItem.paymentMethod || 'UPI'}</span>

                <span style={{ color: '#64748b', fontWeight: 600 }}>{isTamil ? 'பரிவர்த்தனை UTR:' : 'Transaction Ref:'}</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                  {verifyModalItem.transactionReference || (
                    <em style={{ color: '#94a3b8', fontWeight: 400 }}>{isTamil ? 'குறிப்பு இல்லை' : 'Not provided'}</em>
                  )}
                </span>

                <span style={{ color: '#64748b', fontWeight: 600 }}>{isTamil ? 'சமர்ப்பிக்கப்பட்டது:' : 'Submitted At:'}</span>
                <span style={{ color: '#475569', fontSize: '0.8rem' }}>{formatDateTime(verifyModalItem.submittedAt)}</span>
              </div>
            </div>

            {/* Confirmation Statement */}
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #86efac',
                color: '#166534',
                borderRadius: '8px',
                padding: '0.75rem 0.95rem',
                fontSize: '0.82rem',
                lineHeight: 1.45,
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}
            >
              <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                {isTamil
                  ? 'நான் இப்பரிவர்த்தனை குறிப்பு மற்றும் தொகையை சரிபார்த்துவிட்டேன். உறுதிசெய்தவுடன் மாணவருக்கு நேரலை அமர்வு கூகுள் மீட் அணுகல் வழங்கப்படும்.'
                  : 'I confirm that this payment has been checked and verified against our account records. Access to the live session room will be granted.'}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={() => setVerifyModalItem(null)}
                disabled={isSubmittingAction}
                className="btn btn-outline"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                {isTamil ? 'ரத்துசெய்' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmVerify}
                disabled={isSubmittingAction}
                className="btn btn-primary"
                style={{
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.85rem',
                  background: '#16a34a',
                  borderColor: '#15803d',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 700
                }}
              >
                {isSubmittingAction ? (
                  <>
                    <RefreshCw size={14} className="spin-icon" />
                    <span>{isTamil ? 'சரிபார்க்கிறது...' : 'Verifying...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>{isTamil ? 'சரிபார்த்து அணுகல் வழங்குக' : 'Confirm & Verify Payment'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. REJECT PAYMENT DIALOG MODAL                           */}
      {/* ========================================================= */}
      {rejectModalItem && (
        <div
          role="presentation"
          onClick={() => !isSubmittingAction && setRejectModalItem(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-modal-title"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              maxWidth: '540px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={20} color="#dc2626" />
                </div>
                <div>
                  <h3 id="reject-modal-title" style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--navy-900)' }}>
                    {isTamil ? 'கட்டணத்தை நிராகரிக்கவும்' : 'Reject Student Payment'}
                  </h3>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    {isTamil ? 'நிராகரிப்பதற்கான தெளிவான காரணத்தைத் தேர்ந்தெடுக்கவும்.' : 'Select or specify a reason. Student will be notified.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isSubmittingAction && setRejectModalItem(null)}
                aria-label="Close"
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Target Info */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                fontSize: '0.82rem',
                marginBottom: '1.25rem'
              }}
            >
              <div>
                <strong>{rejectModalItem.studentName}</strong> • {rejectModalItem.sessionTitle} • ₹{rejectModalItem.amountPaid || rejectModalItem.amountExpected}
              </div>
              {rejectModalItem.transactionReference && (
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Submitted Ref: <code style={{ fontWeight: 700 }}>{rejectModalItem.transactionReference}</code>
                </div>
              )}
            </div>

            {/* Reason Selection Radio Group */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                {isTamil ? 'நிராகரிப்புக்கான காரணம்:' : 'Reason for rejection:'}
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  'Transaction could not be confirmed',
                  'Incorrect transaction reference',
                  'Payment amount mismatch',
                  'Duplicate registration or transaction',
                  'Other'
                ].map((reason) => (
                  <label
                    key={reason}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.55rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      border: rejectReasonType === reason ? '1.5px solid #dc2626' : '1px solid #e2e8f0',
                      background: rejectReasonType === reason ? '#fef2f2' : '#ffffff',
                      cursor: 'pointer',
                      fontSize: '0.84rem'
                    }}
                  >
                    <input
                      type="radio"
                      name="rejectionReason"
                      value={reason}
                      checked={rejectReasonType === reason}
                      onChange={(e) => setRejectReasonType(e.target.value)}
                      style={{ accentColor: '#dc2626' }}
                    />
                    <span style={{ fontWeight: rejectReasonType === reason ? 700 : 500, color: '#1e293b' }}>
                      {reason}
                    </span>
                  </label>
                ))}
              </div>

              {/* Custom reason input if "Other" is selected */}
              {rejectReasonType === 'Other' && (
                <div style={{ marginTop: '0.75rem' }}>
                  <textarea
                    rows={3}
                    value={customRejectReason}
                    onChange={(e) => setCustomRejectReason(e.target.value)}
                    placeholder={
                      isTamil
                        ? 'மாணவருக்கான குறிப்பிட்ட காரணத்தை உள்ளிடவும்...'
                        : 'Explain the reason to the student...'
                    }
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      fontSize: '0.84rem',
                      borderRadius: '6px',
                      border: '1.5px solid #cbd5e1',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Student Next Step Note */}
            <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45, marginBottom: '1.5rem' }}>
              ℹ️ {isTamil
                ? 'மாணவர் பதிவு நீக்கப்படாது. இந்த காரணம் மாணவர் திரையில் காண்பிக்கப்பட்டு உதவி மையத்தை அணுகவோ அல்லது சரியான விவரங்களுடன் மீண்டும் சமர்ப்பிக்கவோ வழிகாட்டப்படும்.'
                : 'The registration will not be deleted. The student will see this reason on their dashboard and will be guided to resubmit payment or contact support.'}
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={() => setRejectModalItem(null)}
                disabled={isSubmittingAction}
                className="btn btn-outline"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                {isTamil ? 'ரத்துசெய்' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isSubmittingAction}
                className="btn"
                style={{
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.85rem',
                  background: '#dc2626',
                  color: '#ffffff',
                  borderColor: '#b91c1c',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 700
                }}
              >
                {isSubmittingAction ? (
                  <>
                    <RefreshCw size={14} className="spin-icon" />
                    <span>{isTamil ? 'பதிவுசெய்கிறது...' : 'Rejecting...'}</span>
                  </>
                ) : (
                  <>
                    <XCircle size={15} />
                    <span>{isTamil ? 'நிராகரிப்பை உறுதிசெய்' : 'Confirm Rejection'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. VIEW DETAILS AUDIT DIALOG MODAL                       */}
      {/* ========================================================= */}
      {detailsModalItem && (
        <div
          role="presentation"
          onClick={() => setDetailsModalItem(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="details-modal-title"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              maxWidth: '620px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h3 id="details-modal-title" style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--navy-900)' }}>
                  {isTamil ? 'முழுமையான கட்டண தணிக்கை விவரங்கள்' : 'Payment & Registration Details'}
                </h3>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Registration ID: <code>{detailsModalItem.id}</code>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailsModalItem(null)}
                aria-label="Close"
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Status Highlight Banner */}
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                ...(detailsModalItem.status === 'verified'
                  ? { background: '#dcfce7', border: '1px solid #86efac', color: '#166534' }
                  : detailsModalItem.status === 'rejected'
                  ? { background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b' }
                  : { background: '#ffedd5', border: '1px solid #fdba74', color: '#9a3412' })
              }}
            >
              {detailsModalItem.status === 'verified' && <CheckCircle2 size={18} />}
              {detailsModalItem.status === 'rejected' && <XCircle size={18} />}
              {detailsModalItem.status === 'pending' && <Clock size={18} />}
              <span style={{ fontWeight: 700, fontSize: '0.88rem', textTransform: 'capitalize' }}>
                Status: {detailsModalItem.status}
              </span>
            </div>

            {/* Information Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 1fr',
                rowGap: '0.75rem',
                columnGap: '0.5rem',
                fontSize: '0.85rem',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '1rem'
              }}
            >
              <span style={{ color: '#64748b', fontWeight: 600 }}>Student:</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{detailsModalItem.studentName}</span>

              <span style={{ color: '#64748b', fontWeight: 600 }}>Email:</span>
              <span style={{ color: '#334155' }}>{detailsModalItem.studentEmail}</span>

              <span style={{ color: '#64748b', fontWeight: 600 }}>Session Title:</span>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>
                {isTamil && detailsModalItem.sessionTitleTa ? detailsModalItem.sessionTitleTa : detailsModalItem.sessionTitle}
              </span>

              <span style={{ color: '#64748b', fontWeight: 600 }}>Mentor:</span>
              <span style={{ color: '#334155' }}>{detailsModalItem.mentorName}</span>

              <span style={{ color: '#64748b', fontWeight: 600 }}>Amount Expected:</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{detailsModalItem.amountExpected}</span>

              <span style={{ color: '#64748b', fontWeight: 600 }}>Amount Submitted:</span>
              <span style={{ fontWeight: 800, color: '#16a34a' }}>₹{detailsModalItem.amountPaid || detailsModalItem.amountExpected}</span>

              <span style={{ color: '#64748b', fontWeight: 600 }}>Payment Method:</span>
              <span>{detailsModalItem.paymentMethod || 'UPI'}</span>

              <span style={{ color: '#64748b', fontWeight: 600 }}>Transaction Ref (UTR):</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                {detailsModalItem.transactionReference || (
                  <em style={{ color: '#94a3b8', fontWeight: 400 }}>Not provided</em>
                )}
              </span>

              <span style={{ color: '#64748b', fontWeight: 600 }}>Submitted At:</span>
              <span style={{ color: '#334155' }}>{formatDateTime(detailsModalItem.submittedAt)}</span>

              {/* Verification Audit Fields */}
              {detailsModalItem.verifiedAt && (
                <>
                  <span style={{ color: '#15803d', fontWeight: 700 }}>Verified At:</span>
                  <span style={{ color: '#166534', fontWeight: 600 }}>{formatDateTime(detailsModalItem.verifiedAt)}</span>

                  <span style={{ color: '#15803d', fontWeight: 700 }}>Verified By:</span>
                  <span style={{ color: '#166534' }}>
                    {detailsModalItem.verifiedByName || detailsModalItem.verifiedBy || 'Administrator'}
                  </span>
                </>
              )}

              {/* Rejection Audit Fields */}
              {detailsModalItem.rejectionReason && (
                <>
                  <span style={{ color: '#b91c1c', fontWeight: 700 }}>Rejection Reason:</span>
                  <span style={{ color: '#991b1b', fontWeight: 600 }}>{detailsModalItem.rejectionReason}</span>

                  <span style={{ color: '#b91c1c', fontWeight: 700 }}>Rejected At:</span>
                  <span style={{ color: '#991b1b' }}>{formatDateTime(detailsModalItem.rejectedAt)}</span>

                  <span style={{ color: '#b91c1c', fontWeight: 700 }}>Rejected By:</span>
                  <span style={{ color: '#991b1b' }}>
                    {detailsModalItem.rejectedByName || detailsModalItem.rejectedBy || 'Administrator'}
                  </span>
                </>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={() => setDetailsModalItem(null)}
                className="btn btn-outline"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
              >
                {isTamil ? 'மூடு' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPaymentsPage;
