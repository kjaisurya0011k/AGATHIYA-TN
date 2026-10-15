import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Reusable UserAvatar component
 * Enforces avatar display hierarchy:
 * 1. Uploaded photo (signed URL from private avatars bucket with 1-hour expiry)
 * 2. Google OAuth picture (avatar_url)
 * 3. Initials on navy/teal gradient
 *
 * Privacy Shield:
 * When `forStaffOnly` is true and `role === 'student'`, always renders initials (never shows student photos).
 */
export function UserAvatar({
  name = 'User',
  avatarPath = null,
  avatarUrl = null,
  avatarUpdatedAt = null,
  role = null,
  size = 40,
  fontSize = null,
  forStaffOnly = false,
  className = '',
  style = {}
}) {
  const { getAvatarSignedUrl } = useAuth();
  const [signedUrl, setSignedUrl] = useState(null);
  const [signedImgError, setSignedImgError] = useState(false);
  const [fallbackImgError, setFallbackImgError] = useState(false);

  // Compute initials
  const initials = (name || 'U')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  // Compute font size if not provided
  const computedFontSize = fontSize || `${Math.max(12, Math.round(size * 0.38))}px`;

  // Check student privacy in staff-only context (e.g. Admin Users table)
  const isStudentRestricted = forStaffOnly && role === 'student';

  // Resolve signed URL when avatarPath is present and not restricted
  useEffect(() => {
    let isMounted = true;
    setSignedImgError(false);

    if (isStudentRestricted || !avatarPath) {
      setSignedUrl(null);
      return;
    }

    async function resolveSignedUrl() {
      try {
        if (getAvatarSignedUrl) {
          const url = await getAvatarSignedUrl(avatarPath, avatarUpdatedAt);
          if (isMounted && url) {
            setSignedUrl(url);
          }
        }
      } catch (err) {
        console.warn('Could not resolve avatar signed URL:', err);
      }
    }

    resolveSignedUrl();

    return () => {
      isMounted = false;
    };
  }, [avatarPath, avatarUpdatedAt, isStudentRestricted, getAvatarSignedUrl]);

  // Base circular container style
  const containerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
    minHeight: `${size}px`,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    userSelect: 'none',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    ...style
  };

  // Fallback: Initials on navy/teal gradient
  const renderInitials = () => (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0A2540 0%, #008394 100%)',
        color: '#FFFFFF',
        fontWeight: 700,
        fontSize: computedFontSize,
        letterSpacing: '0.05em'
      }}
      aria-label={`${name} initials`}
    >
      {initials}
    </div>
  );

  // If student privacy is restricted, directly render initials
  if (isStudentRestricted) {
    return (
      <div className={`user-avatar ${className}`} style={containerStyle}>
        {renderInitials()}
      </div>
    );
  }

  // 1. Uploaded custom photo (Signed URL from private bucket)
  if (signedUrl && !signedImgError) {
    return (
      <div className={`user-avatar ${className}`} style={containerStyle}>
        <img
          src={signedUrl}
          alt={`${name} profile photo`}
          onError={() => setSignedImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
          loading="lazy"
        />
      </div>
    );
  }

  // 2. Google OAuth Picture (avatar_url)
  if (avatarUrl && !fallbackImgError) {
    return (
      <div className={`user-avatar ${className}`} style={containerStyle}>
        <img
          src={avatarUrl}
          alt={`${name} Google profile photo`}
          onError={() => setFallbackImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
          loading="lazy"
        />
      </div>
    );
  }

  // 3. Fallback initials
  return (
    <div className={`user-avatar ${className}`} style={containerStyle}>
      {renderInitials()}
    </div>
  );
}
