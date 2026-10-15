import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserAvatar } from './UserAvatar';
import {
  Camera,
  Trash2,
  Upload,
  ZoomIn,
  ZoomOut,
  X,
  CheckCircle2,
  AlertCircle,
  Shield,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export function AvatarUploader({
  size = 110,
  userRole = 'student'
}) {
  const {
    user,
    profile,
    uploadUserAvatar,
    removeUserAvatar,
    getAvatarSignedUrl
  } = useAuth();
  const { lang, t } = useLanguage();
  const isTamil = lang === 'ta';
  const avtLang = t?.avatar || {};

  // File input ref
  const fileInputRef = useRef(null);

  // States
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  // Image load dimensions for cropping
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });

  // Fallback Google avatar or initials
  const fullName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const googleAvatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  const currentAvatarPath = profile?.avatar_path || null;
  const avatarUpdatedAt = profile?.avatar_updated_at || null;

  // Cleanup object URLs if needed
  useEffect(() => {
    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageSrc]);

  // Handle file choice & client-side validation
  const handleFileChange = (e) => {
    setUploadError(null);
    setUploadSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validate MIME type (JPG, PNG, WEBP only)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setUploadError(
        avtLang.invalidType ||
          (isTamil
            ? 'JPG, PNG அல்லது WEBP வடிவப் படங்கள் மட்டுமே அனுமதிக்கப்படும்.'
            : 'Only JPG, PNG or WEBP images are supported.')
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Validate file size (< 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(
        avtLang.fileTooLarge ||
          (isTamil
            ? 'தயவுசெய்து 5 MB-க்கும் குறைவான புகைப்படத்தைத் தேர்ந்தெடுக்கவும்.'
            : 'Please select an image smaller than 5 MB.')
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Read image as DataURL or ObjectURL
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      setImageSrc(loadEvt.target.result);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  // Image load handler to get natural aspect ratio
  const onImageLoaded = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setNaturalDimensions({ width: naturalWidth, height: naturalHeight });
  };

  // Mouse / Touch drag for panning
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      });
    }
  };

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    },
    [isDragging, dragStart]
  );

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Reset zoom & pan
  const handleResetCrop = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Close crop modal
  const handleCloseCropModal = () => {
    setIsCropModalOpen(false);
    setImageSrc(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Crop to 512x512 square, convert to WEBP (~0.85), strip EXIF, and upload
  const handleProcessAndUpload = async () => {
    if (!imageSrc) return;
    setUploading(true);
    setUploadError(null);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;

      await new Promise((resolve, reject) => {
        if (img.complete) resolve();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image for cropping'));
      });

      // Canvas dimensions: exactly 512x512
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // Enable high-quality bicubic smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // The preview stage viewport is 280x280.
      const viewportSize = 280;
      const baseScale = Math.max(viewportSize / img.naturalWidth, viewportSize / img.naturalHeight);
      const totalScale = baseScale * zoom;

      // Scaled dimensions on the preview viewport
      const displayedWidth = img.naturalWidth * totalScale;
      const displayedHeight = img.naturalHeight * totalScale;

      // Center offset + pan
      const centerX = (viewportSize - displayedWidth) / 2 + pan.x;
      const centerY = (viewportSize - displayedHeight) / 2 + pan.y;

      // Map from viewport coordinates (280x280) to canvas coordinates (512x512)
      const ratio = 512 / viewportSize;
      ctx.drawImage(
        img,
        centerX * ratio,
        centerY * ratio,
        displayedWidth * ratio,
        displayedHeight * ratio
      );

      // Convert to WEBP blob (strips EXIF automatically)
      const blob = await new Promise((resolve) => {
        canvas.toBlob(
          (b) => resolve(b),
          'image/webp',
          0.85
        );
      });

      if (!blob) {
        throw new Error('Failed to encode image to WEBP.');
      }

      // Check blob size: must be < 2MB (2,097,152 bytes)
      let finalBlob = blob;
      if (blob.size > 2 * 1024 * 1024) {
        // Fallback: re-encode with lower quality to stay strictly under 2MB
        finalBlob = await new Promise((resolve) => {
          canvas.toBlob((b) => resolve(b), 'image/webp', 0.65);
        });
      }

      if (finalBlob.size > 2 * 1024 * 1024) {
        throw new Error('Processed image is still over 2MB. Please select a smaller photo.');
      }

      // Upload via AuthContext
      if (uploadUserAvatar) {
        await uploadUserAvatar(finalBlob);
      }

      setUploadSuccess(
        avtLang.successUpload ||
          (isTamil
            ? 'சுயவிவர புகைப்படம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!'
            : 'Profile photo updated successfully!')
      );
      handleCloseCropModal();

      setTimeout(() => setUploadSuccess(null), 4000);
    } catch (err) {
      console.error('Avatar upload error:', err);
      setUploadError(err.message || (avtLang.errorUpload || 'Failed to upload photo. Please retry.'));
    } finally {
      setUploading(false);
    }
  };

  // Remove photo handler
  const handleRemovePhoto = async () => {
    const confirmPrompt =
      avtLang.confirmRemove ||
      (isTamil
        ? 'உங்கள் சுயவிவர புகைப்படத்தை நிச்சயமாக அகற்ற விரும்புகிறீர்களா?'
        : 'Are you sure you want to remove your profile photo?');

    if (!window.confirm(confirmPrompt)) return;

    setUploading(true);
    setUploadError(null);
    try {
      if (removeUserAvatar) {
        await removeUserAvatar();
      }
      setUploadSuccess(
        avtLang.successRemove ||
          (isTamil ? 'சுயவிவர புகைப்படம் நீக்கப்பட்டது.' : 'Profile photo removed.')
      );
      setTimeout(() => setUploadSuccess(null), 3500);
    } catch (err) {
      setUploadError(err.message || 'Failed to remove photo.');
    } finally {
      setUploading(false);
    }
  };

  // Dynamic privacy note text
  const privacyNote =
    userRole === 'mentor'
      ? avtLang.privacyNoteMentor ||
        (isTamil
          ? 'உங்கள் தெளிவான புகைப்படத்தைப் பயன்படுத்தவும். மற்றவர்களின் புகைப்படங்களை பதிவேற்ற வேண்டாம். உங்கள் புகைப்படமானது நீங்கள் நடத்தும் அமர்வுகளில் மாணவர்களுக்குக் காட்டப்படும்.'
          : "Use a clear photo of yourself. Don't upload photos of other people. Your photo is shown to students on your sessions.")
      : userRole === 'admin'
      ? avtLang.privacyNoteAdmin ||
        (isTamil
          ? 'உங்கள் தெளிவான புகைப்படத்தைப் பயன்படுத்தவும். மற்றவர்களின் புகைப்படங்களை பதிவேற்ற வேண்டாம். நிர்வாகி புகைப்படங்கள் அங்கீகரிக்கப்பட்ட ஊழியர்களுக்கு மட்டுமே தெரியும்.'
          : "Use a clear photo of yourself. Don't upload photos of other people. Admin photos are visible only to authorized platform staff.")
      : avtLang.privacyNoteStudent ||
        (isTamil
          ? 'உங்கள் தெளிவான புகைப்படத்தைப் பயன்படுத்தவும். மற்றவர்களின் புகைப்படங்களை பதிவேற்ற வேண்டாம். மாணவர் புகைப்படங்கள் உங்களுக்கும் EEE-TN நிர்வாகிகளுக்கும் மட்டுமே தெரியும்.'
          : "Use a clear photo of yourself. Don't upload photos of other people. Student photos are visible only to you and EEE-TN admins.");

  return (
    <div className="avatar-uploader-component" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="avatar-file-input"
        aria-label="Upload profile photo file"
      />

      {/* Main Avatar Row with Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
        {/* Circular Avatar Stage */}
        <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
          <UserAvatar
            name={fullName}
            avatarPath={currentAvatarPath}
            avatarUrl={googleAvatarUrl}
            avatarUpdatedAt={avatarUpdatedAt}
            role={userRole}
            size={size}
            style={{
              border: '3px solid #FFFFFF',
              boxShadow: '0 4px 14px rgba(10, 37, 64, 0.15)'
            }}
          />

          {/* Quick Camera Overlay Button on bottom-right of avatar circle */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#008394',
              color: '#FFFFFF',
              border: '2px solid #FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: uploading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              transition: 'transform 0.15s ease, background 0.15s ease'
            }}
            title={avtLang.changePhoto || (isTamil ? 'புகைப்படத்தை மாற்று' : 'Change photo')}
            aria-label="Change profile photo"
          >
            <Camera size={16} />
          </button>
        </div>

        {/* Action Buttons Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                fontSize: '0.825rem',
                padding: '0.45rem 0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                height: '36px'
              }}
            >
              <Camera size={15} />
              <span>{avtLang.changePhoto || (isTamil ? 'புகைப்படத்தை மாற்று' : 'Change photo')}</span>
            </button>

            {currentAvatarPath && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleRemovePhoto}
                disabled={uploading}
                style={{
                  fontSize: '0.825rem',
                  padding: '0.45rem 0.8rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: '#dc2626',
                  borderColor: '#fecaca',
                  background: '#fef2f2',
                  height: '36px'
                }}
              >
                <Trash2 size={14} />
                <span>{avtLang.removePhoto || (isTamil ? 'புகைப்படத்தை நீக்கு' : 'Remove photo')}</span>
              </button>
            )}
          </div>

          {/* Supported formats hint */}
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
            {isTamil ? 'JPG, PNG அல்லது WEBP (அதிகபட்சம் 5 MB)' : 'JPG, PNG or WEBP (Max 5 MB)'}
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {uploadSuccess && (
        <div
          style={{
            background: '#ecfdf5',
            color: '#065f46',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            border: '1px solid #a7f3d0'
          }}
        >
          <CheckCircle2 size={15} color="#059669" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Error Banner with Retry */}
      {uploadError && (
        <div
          style={{
            background: '#fef2f2',
            color: '#991b1b',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.4rem',
            border: '1px solid #fecaca'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={15} color="#dc2626" />
            <span>{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'none',
              border: 'none',
              color: '#b91c1c',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.75rem',
              textDecoration: 'underline'
            }}
          >
            {avtLang.retry || (isTamil ? 'மீண்டும் முயற்சி' : 'Retry')}
          </button>
        </div>
      )}

      {/* Short Privacy Note */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.45rem',
          fontSize: '0.75rem',
          color: '#475569',
          lineHeight: 1.45,
          marginTop: '0.2rem'
        }}
      >
        <Shield size={14} color="#008394" style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>{privacyNote}</span>
      </div>

      {/* ========================================================= */}
      {/* CROP & ZOOM MODAL DIALOG                                  */}
      {/* ========================================================= */}
      {isCropModalOpen && (
        <div
          className="modal-backdrop"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(10, 37, 64, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !uploading) {
              handleCloseCropModal();
            }
          }}
        >
          <div
            className="modal-card"
            style={{
              width: '100%',
              maxWidth: '440px',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Sparkles size={18} color="#008394" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                  {avtLang.cropTitle || (isTamil ? 'புகைப்படத்தை அமைத்தல்' : 'Crop & Adjust Photo')}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseCropModal}
                disabled={uploading}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
                {avtLang.cropInstruction ||
                  (isTamil
                    ? 'உங்கள் முகத்தை வட்டத்திற்குள் பொருந்தும் வகையில் நகர்த்தி, பெரிதாக்கவும்.'
                    : 'Drag to position and use the slider to zoom your face within the circle.')}
              </p>

              {/* Crop Viewport Stage: 280x280 square with circular cutout overlay */}
              <div
                style={{
                  position: 'relative',
                  width: '280px',
                  height: '280px',
                  background: '#0f172a',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  touchAction: 'none'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Underlying Image */}
                {imageSrc && (
                  <img
                    src={imageSrc}
                    alt="Cropping target"
                    onLoad={onImageLoaded}
                    draggable={false}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                      maxWidth: 'none',
                      maxHeight: 'none',
                      userSelect: 'none',
                      pointerEvents: 'none',
                      transformOrigin: 'center center'
                    }}
                  />
                )}

                {/* Circular Mask Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.65)',
                    borderRadius: '50%',
                    border: '2px solid rgba(255, 255, 255, 0.9)',
                    pointerEvents: 'none'
                  }}
                />
              </div>

              {/* Zoom Controls */}
              <div style={{ width: '100%', maxWidth: '280px', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <ZoomOut size={16} color="#64748b" />
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  disabled={uploading}
                  style={{ flex: 1, accentColor: '#008394', cursor: 'pointer' }}
                  aria-label="Zoom photo"
                />
                <ZoomIn size={16} color="#64748b" />

                <button
                  type="button"
                  onClick={handleResetCrop}
                  disabled={uploading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '0.2rem',
                    marginLeft: '0.25rem'
                  }}
                  title="Reset Zoom & Pan"
                  aria-label="Reset zoom and pan"
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              {/* Format Processing Badge */}
              <div
                style={{
                  fontSize: '0.72rem',
                  color: '#008394',
                  background: 'rgba(0, 166, 191, 0.08)',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  textAlign: 'center'
                }}
              >
                {isTamil
                  ? '512×512 WEBP வடிவத்தில் சேமிக்கப்படும் (EXIF இருப்பிடத் தகவல்கள் நீக்கப்படும்)'
                  : 'Processed to 512×512 WEBP (EXIF location data securely stripped)'}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '0.85rem 1.25rem',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.65rem',
                background: '#f8fafc'
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseCropModal}
                disabled={uploading}
                style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem' }}
              >
                {avtLang.cancel || (isTamil ? 'ரத்து செய்' : 'Cancel')}
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleProcessAndUpload}
                disabled={uploading}
                style={{
                  fontSize: '0.85rem',
                  padding: '0.45rem 1.1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  minWidth: '120px',
                  justifyContent: 'center'
                }}
              >
                {uploading ? (
                  <>
                    <div
                      className="spinner"
                      style={{
                        width: '14px',
                        height: '14px',
                        borderWidth: '2px',
                        borderColor: '#FFFFFF',
                        borderTopColor: 'transparent'
                      }}
                    />
                    <span>{avtLang.uploading || (isTamil ? 'பதிவேற்றுகிறது...' : 'Uploading...')}</span>
                  </>
                ) : (
                  <>
                    <Upload size={15} />
                    <span>{avtLang.savePhoto || (isTamil ? 'புகைப்படத்தை சேமி' : 'Save Photo')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
