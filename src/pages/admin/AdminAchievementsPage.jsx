import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  Award,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowLeft,
  Calendar,
  MapPin,
  Image as ImageIcon,
  ShieldCheck,
  Eye,
  Trash2,
  Edit,
  X,
  Upload,
  AlertTriangle,
  Sparkles,
  Check,
  EyeOff
} from 'lucide-react';

export function AdminAchievementsPage() {
  const { lang, t } = useLanguage();
  const {
    achievements,
    fetchAchievements,
    adminSaveAchievement,
    adminDeleteAchievement,
    adminTogglePublishAchievement,
    uploadAchievementImage
  } = useAuth();

  const isTamil = lang === 'ta';
  const admLang = t?.adminHub || {};

  const [filter, setFilter] = useState('all'); // 'all' | 'published' | 'draft'
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const initialFormState = {
    title_en: '',
    title_ta: '',
    description_en: '',
    description_ta: '',
    achievement_type: 'hackathon',
    event_date: new Date().toISOString().split('T')[0],
    school_name: '',
    town: '',
    winners_text: '',
    status: 'draft',
    photo_consent_confirmed: false,
    images: []
  };

  const [formData, setFormData] = useState(initialFormState);

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData(initialFormState);
    setShowModal(true);
    setActionError(null);
  };

  // Open Edit Modal
  const handleOpenEdit = (ach) => {
    setIsEditing(true);
    setFormData({
      id: ach.id,
      title_en: ach.title_en || '',
      title_ta: ach.title_ta || '',
      description_en: ach.description_en || '',
      description_ta: ach.description_ta || '',
      achievement_type: ach.achievement_type || 'hackathon',
      event_date: ach.event_date || new Date().toISOString().split('T')[0],
      school_name: ach.school_name || '',
      town: ach.town || '',
      winners_text: ach.winners_text || '',
      status: ach.status || 'draft',
      photo_consent_confirmed: Boolean(ach.photo_consent_confirmed),
      images: ach.images ? [...ach.images] : []
    });
    setShowModal(true);
    setActionError(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setActionError(null);
  };

  // Handle Image Upload (Max 6, < 2MB, image types only)
  const handleImageFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (formData.images.length + files.length > 6) {
      setActionError(admLang.imageCountLimitError || (isTamil ? 'அதிகபட்சம் 6 படங்கள் மட்டுமே அனுமதிக்கப்படும்.' : 'Maximum 6 images allowed per achievement.'));
      return;
    }

    setUploadingImage(true);
    setActionError(null);

    try {
      const newImages = [...formData.images];
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          throw new Error('Only image files (JPEG, PNG, WebP) are allowed.');
        }
        if (file.size > 2 * 1024 * 1024) {
          throw new Error(`${file.name} is larger than 2MB.`);
        }

        const res = await uploadAchievementImage(file);
        if (res?.url) {
          newImages.push({
            id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            image_path: res.url,
            caption: '',
            sort_order: newImages.length + 1
          });
        }
      }
      setFormData((prev) => ({ ...prev, images: newImages }));
    } catch (err) {
      setActionError(err.message || 'Error uploading images');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index)
    }));
  };

  const handleCaptionChange = (index, caption) => {
    setFormData((prev) => {
      const updated = [...prev.images];
      if (updated[index]) {
        updated[index] = { ...updated[index], caption };
      }
      return { ...prev, images: updated };
    });
  };

  // Save Achievement (Draft or Published)
  const handleSave = async (targetStatus) => {
    setActionError(null);

    // Validation
    if (!formData.title_en.trim() || !formData.school_name.trim() || !formData.town.trim()) {
      setActionError(isTamil ? 'அனைத்து கட்டாய விவரங்களையும் உள்ளிடவும்.' : 'Please fill in all mandatory fields.');
      return;
    }

    // Photo consent check if publishing
    if (targetStatus === 'published' && !formData.photo_consent_confirmed) {
      setActionError(
        admLang.photoConsentRequiredError ||
          (isTamil
            ? 'பெற்றோர்/பாதுகாவலர் புகைப்பட ஒப்புதல் இல்லாமல் ஒரு சாதனையை வெளியிட முடியாது.'
            : 'Parental/guardian photo consent confirmation is mandatory before publishing an achievement.')
      );
      return;
    }

    try {
      if (adminSaveAchievement) {
        await adminSaveAchievement(
          {
            ...formData,
            status: targetStatus
          },
          formData.images
        );
      }
      setActionSuccess(
        targetStatus === 'published'
          ? admLang.achievementPublishedSuccess || (isTamil ? 'சாதனை வெற்றிகரமாக வெளியிடப்பட்டது!' : 'Achievement published successfully!')
          : admLang.achievementSavedSuccess || (isTamil ? 'சாதனை வரைவாக சேமிக்கப்பட்டது!' : 'Achievement saved as draft!')
      );
      handleCloseModal();
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      setActionError(err.message || 'Error saving achievement');
    }
  };

  // Toggle Publish / Unpublish directly from table
  const handleTogglePublish = async (ach) => {
    if (ach.status === 'published') {
      // Unpublish
      await adminTogglePublishAchievement(ach.id, 'draft', ach.photo_consent_confirmed);
      setActionSuccess(admLang.achievementUnpublishedSuccess || (isTamil ? 'சாதனை வரைவு நிலைக்கு மாற்றப்பட்டது.' : 'Moved to draft status.'));
    } else {
      // Publish: Prompt consent if not yet set
      let consent = ach.photo_consent_confirmed;
      if (!consent) {
        consent = window.confirm(
          admLang.photoConsentCheckbox ||
            'I confirm photo consent from parents/guardians for all students shown. Do you confirm?'
        );
      }
      if (!consent) {
        alert(admLang.photoConsentRequiredError || 'Photo consent required to publish.');
        return;
      }
      try {
        await adminTogglePublishAchievement(ach.id, 'published', true);
        setActionSuccess(admLang.achievementPublishedSuccess || (isTamil ? 'சாதனை வெற்றிகரமாக வெளியிடப்பட்டது!' : 'Achievement published!'));
      } catch (err) {
        setActionError(err.message);
      }
    }
    setTimeout(() => {
      setActionSuccess(null);
      setActionError(null);
    }, 3500);
  };

  // Delete Achievement
  const handleDelete = async (achId) => {
    const confirmDelete = window.confirm(
      admLang.confirmDeleteAchievement ||
        (isTamil
          ? 'இந்த சாதனைப் பதிவை நிச்சயமாக நீக்க விரும்புகிறீர்களா? இந்த செயலை மாற்ற முடியாது.'
          : 'Are you sure you want to permanently delete this achievement?')
    );
    if (!confirmDelete) return;

    try {
      if (adminDeleteAchievement) {
        await adminDeleteAchievement(achId);
      }
      setActionSuccess(admLang.achievementDeletedSuccess || (isTamil ? 'சாதனைப் பதிவு நீக்கப்பட்டது.' : 'Achievement deleted.'));
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      setActionError(err.message || 'Error deleting achievement');
      setTimeout(() => setActionError(null), 3500);
    }
  };

  const filteredAchievements = achievements.filter((a) => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  const getCategoryBadge = (type) => {
    switch (type) {
      case 'hackathon':
        return <span className="badge badge-purple">{admLang.typeHackathon || 'Hackathon Win'}</span>;
      case 'award':
        return <span className="badge badge-green">{admLang.typeAward || 'State Award'}</span>;
      case 'workshop':
        return <span className="badge badge-cyan">{admLang.typeWorkshop || 'STEM Workshop'}</span>;
      case 'school_collaboration':
        return <span className="badge badge-navy">{admLang.typeSchoolCollab || 'School Collaboration'}</span>;
      default:
        return <span className="badge badge-gray">{type}</span>;
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem 5rem', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Back to Admin Control Center */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          to="/admin"
          className="btn btn-outline"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
        >
          <ArrowLeft size={14} />
          <span>{isTamil ? 'நிர்வாக கட்டுப்பாட்டு மையத்திற்குத் திரும்பு' : 'Back to Admin Control Center'}</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="card" style={{ padding: '2rem', marginBottom: '1.75rem', borderLeft: '4px solid #7c3aed', background: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={22} color="#6d28d9" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: 'var(--navy-900)' }}>
                {admLang.achievementsTitle || (isTamil ? 'மாணவர் சாதனைகள் & வெற்றிகள் மேலாண்மை' : 'Achievements Showcase Management')}
              </h1>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.885rem', color: '#64748b' }}>
                {admLang.achievementsSubtitle ||
                  (isTamil
                    ? 'ஹேக்கத்தான்கள், விருதுகள், மற்றும் அரசு பள்ளி மாணவர்களின் கண்டுபிடிப்புகளைப் பதிவுசெய்து பெருமைப்படுத்துங்கள்.'
                    : 'Curate hackathon wins, innovative projects, STEM workshops, and 7.5% quota accomplishments.')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
          >
            <PlusCircle size={16} />
            <span>{admLang.createAchievementBtn || (isTamil ? 'புதிய சாதனையைப் பதிவுசெய்' : 'Record New Achievement')}</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {actionSuccess && (
        <div className="session-toast" style={{ marginBottom: '1.5rem', background: '#f0fdf4', color: '#166534', border: '1px solid #86efac', padding: '0.75rem 1rem', borderRadius: '8px' }}>
          ✓ {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="session-toast" style={{ marginBottom: '1.5rem', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '0.75rem 1rem', borderRadius: '8px' }}>
          ⚠️ {actionError}
        </div>
      )}

      {/* Filters and List */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
          <button
            type="button"
            className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
            style={{ fontSize: '0.825rem', padding: '0.35rem 0.8rem' }}
          >
            <span>{isTamil ? 'அனைத்தும்' : 'All'} ({achievements.length})</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${filter === 'published' ? 'active' : ''}`}
            onClick={() => setFilter('published')}
            style={{ fontSize: '0.825rem', padding: '0.35rem 0.8rem' }}
          >
            <CheckCircle2 size={13} />
            <span>{admLang.tabPublished || (isTamil ? 'வெளியிடப்பட்டவை' : 'Published')} ({achievements.filter((a) => a.status === 'published').length})</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${filter === 'draft' ? 'active' : ''}`}
            onClick={() => setFilter('draft')}
            style={{ fontSize: '0.825rem', padding: '0.35rem 0.8rem' }}
          >
            <FileText size={13} />
            <span>{admLang.tabDrafts || (isTamil ? 'வரைவுகள்' : 'Drafts')} ({achievements.filter((a) => a.status === 'draft').length})</span>
          </button>
        </div>

        {/* Table of Achievements */}
        {filteredAchievements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            <Award size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem auto' }} />
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy-900)' }}>
              {isTamil ? 'சாதனைகள் எதுவும் கிடைக்கவில்லை' : 'No achievements found'}
            </div>
            <p style={{ fontSize: '0.825rem', marginTop: '0.25rem' }}>
              {isTamil ? 'புதிய சாதனை ஒன்றைச் சேர்க்க மேலே உள்ள பொத்தானைக் கிளிக் செய்யவும்.' : 'Click "Record New Achievement" above to add your first showcase.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '0.75rem' }}>{isTamil ? 'தலைப்பு' : 'Title'}</th>
                  <th style={{ padding: '0.75rem' }}>{isTamil ? 'வகை' : 'Category'}</th>
                  <th style={{ padding: '0.75rem' }}>{isTamil ? 'பள்ளி & ஊர்' : 'School & Town'}</th>
                  <th style={{ padding: '0.75rem' }}>{isTamil ? 'தேதி' : 'Date'}</th>
                  <th style={{ padding: '0.75rem' }}>{isTamil ? 'புகைப்படங்கள்' : 'Photos'}</th>
                  <th style={{ padding: '0.75rem' }}>{isTamil ? 'ஒப்புதல் நிலை' : 'Consent'}</th>
                  <th style={{ padding: '0.75rem' }}>{isTamil ? 'நிலை' : 'Status'}</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>{isTamil ? 'நடவடிக்கைகள்' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredAchievements.map((ach) => {
                  const title = (isTamil && ach.title_ta ? ach.title_ta : ach.title_en) || ach.title_en;
                  const isPublished = ach.status === 'published';

                  return (
                    <tr key={ach.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: 'var(--navy-900)', maxWidth: '280px' }}>
                        {title}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        {getCategoryBadge(ach.achievement_type)}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', color: '#475569' }}>
                        <div>{ach.school_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ach.town}</div>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', color: '#64748b' }}>
                        {ach.event_date}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: '#475569' }}>
                          <ImageIcon size={13} />
                          <span>{ach.images?.length || 0}</span>
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        {ach.photo_consent_confirmed ? (
                          <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>✓ Verified</span>
                        ) : (
                          <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>Pending</span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        {isPublished ? (
                          <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>Published</span>
                        ) : (
                          <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>Draft</span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          {/* Publish/Unpublish toggle */}
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(ach)}
                            className={`btn btn-sm ${isPublished ? 'btn-outline' : 'btn-primary'}`}
                            style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                            title={isPublished ? 'Unpublish' : 'Publish'}
                          >
                            {isPublished ? (admLang.btnUnpublish || 'Unpublish') : (admLang.btnPublish || 'Publish')}
                          </button>

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(ach)}
                            className="btn btn-sm btn-outline"
                            style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                            title="Edit"
                          >
                            <Edit size={12} />
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleDelete(ach.id)}
                            className="btn btn-sm btn-outline"
                            style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', color: '#b91c1c', borderColor: '#fecaca' }}
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT ACHIEVEMENT MODAL */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '820px',
              maxHeight: '92vh',
              overflowY: 'auto',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
          >
            {/* Modal Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} color="#6d28d9" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--navy-900)' }}>
                  {isEditing
                    ? (admLang.editAchievementTitle || (isTamil ? 'சாதனை விவரங்களைத் திருத்து' : 'Edit Achievement'))
                    : (admLang.createAchievementBtn || (isTamil ? 'புதிய சாதனையைப் பதிவுசெய்' : 'Record New Achievement'))}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            {actionError && (
              <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                ⚠️ {actionError}
              </div>
            )}

            {/* Form Fields */}
            <div>
              {/* Titles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    {admLang.fieldTitleEn || (isTamil ? 'சாதனைத் தலைப்பு (ஆங்கிலத்தில்) *' : 'Title (English) *')}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    required
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    {admLang.fieldTitleTa || (isTamil ? 'சாதனைத் தலைப்பு (தமிழில்) *' : 'Title (Tamil) *')}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.title_ta}
                    onChange={(e) => setFormData({ ...formData, title_ta: e.target.value })}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    {admLang.fieldDescEn || (isTamil ? 'முழு விவரம் (ஆங்கிலத்தில்) *' : 'Description (English) *')}
                  </label>
                  <textarea
                    rows={3}
                    className="form-input"
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    {admLang.fieldDescTa || (isTamil ? 'முழு விவரம் (தமிழில்) *' : 'Description (Tamil) *')}
                  </label>
                  <textarea
                    rows={3}
                    className="form-input"
                    value={formData.description_ta}
                    onChange={(e) => setFormData({ ...formData, description_ta: e.target.value })}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Category, Date, School, Town */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    {admLang.fieldType || (isTamil ? 'சாதனை வகை *' : 'Category *')}
                  </label>
                  <select
                    className="form-input"
                    value={formData.achievement_type}
                    onChange={(e) => setFormData({ ...formData, achievement_type: e.target.value })}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    <option value="hackathon">{admLang.typeHackathon || 'Hackathon Win'}</option>
                    <option value="award">{admLang.typeAward || 'State / National Award'}</option>
                    <option value="workshop">{admLang.typeWorkshop || 'STEM Workshop'}</option>
                    <option value="school_collaboration">{admLang.typeSchoolCollab || 'School Collaboration'}</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    {admLang.fieldEventDate || (isTamil ? 'நிகழ்வு தேதி *' : 'Event Date *')}
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    {admLang.fieldSchool || (isTamil ? 'பள்ளி / நிறுவனம் *' : 'School / Institute *')}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.school_name}
                    onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                    placeholder="e.g. GHSS Pennagaram"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    {admLang.fieldTown || (isTamil ? 'மாவட்டம் / நகரம் *' : 'District / Town *')}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.town}
                    onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                    placeholder="e.g. Dharmapuri"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Winners Recognition */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                  {admLang.fieldWinners || (isTamil ? 'வெற்றியாளர்கள் மற்றும் பங்கேற்ற மாணவர்கள் விபரம்' : 'Participating Students & Winners Text')}
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.winners_text}
                  onChange={(e) => setFormData({ ...formData, winners_text: e.target.value })}
                  placeholder="e.g. Team AgriBot: S. Kaviya, M. Saravanan (Class 12)"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              {/* Multi-Image Upload (Max 6, Image types, < 2MB) */}
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#1e293b' }}>
                      {admLang.multiImageUploadLabel || (isTamil ? 'மாணவர் சாதனைக் காட்சி புகைப்படங்கள் (அதிகபட்சம் 6 படங்கள், தலா 2MB வரை) *' : 'Showcase Photos (Max 6 images, up to 2MB each)')}
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {admLang.uploadNote || (isTamil ? 'படங்களுக்கு தலைப்பு கொடுக்கலாம்.' : 'Add optional captions for each photo.')}
                    </span>
                  </div>

                  <label
                    className="btn btn-sm btn-outline"
                    style={{ cursor: formData.images.length >= 6 ? 'not-allowed' : 'pointer', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Upload size={13} />
                    <span>{uploadingImage ? (isTamil ? 'ஏற்றப்படுகிறது...' : 'Uploading...') : (isTamil ? 'படங்களைச் சேர்' : 'Upload Images')}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      disabled={formData.images.length >= 6 || uploadingImage}
                      onChange={handleImageFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                {/* Images Preview Grid */}
                {formData.images.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', border: '1.5px dashed #cbd5e1', borderRadius: '6px', color: '#94a3b8' }}>
                    <ImageIcon size={28} style={{ margin: '0 auto 0.35rem auto' }} />
                    <div style={{ fontSize: '0.8rem' }}>
                      {isTamil ? 'புகைப்படங்கள் எதுவும் இணைக்கப்படவில்லை.' : 'No photos attached yet.'}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                    {formData.images.map((img, idx) => (
                      <div key={img.id || idx} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.5rem', background: '#FFFFFF' }}>
                        <div style={{ position: 'relative', height: '110px', overflow: 'hidden', borderRadius: '4px', marginBottom: '0.4rem' }}>
                          <img
                            src={img.image_path}
                            alt={`Preview ${idx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'rgba(239, 68, 68, 0.9)',
                              border: 'none',
                              color: '#FFFFFF',
                              borderRadius: '50%',
                              width: '22px',
                              height: '22px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                            title="Remove image"
                          >
                            <X size={13} />
                          </button>
                        </div>
                        <input
                          type="text"
                          className="form-input"
                          value={img.caption || ''}
                          onChange={(e) => handleCaptionChange(idx, e.target.value)}
                          placeholder={isTamil ? 'பட விளக்கம்...' : 'Photo caption...'}
                          style={{ width: '100%', fontSize: '0.72rem', padding: '0.25rem 0.5rem', height: '30px' }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* MANDATORY PHOTO CONSENT CHECKBOX */}
              <div
                style={{
                  padding: '1rem',
                  background: formData.photo_consent_confirmed ? '#f0fdf4' : '#fffbeb',
                  border: formData.photo_consent_confirmed ? '1.5px solid #86efac' : '1.5px solid #fde68a',
                  borderRadius: '8px',
                  marginBottom: '1.5rem'
                }}
              >
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.photo_consent_confirmed}
                    onChange={(e) => setFormData({ ...formData, photo_consent_confirmed: e.target.checked })}
                    style={{ marginTop: '0.2rem', width: '17px', height: '17px', cursor: 'pointer' }}
                  />
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: formData.photo_consent_confirmed ? '#166534' : '#92400e' }}>
                      {admLang.photoConsentCheckbox || (isTamil ? 'காட்டப்படும் அனைத்து மாணவர்களுக்கும் பெற்றோரிடமிருந்து/பாதுகாவலரிடமிருந்து புகைப்பட ஒப்புதல் பெறப்பட்டது என்பதை உறுதி செய்கிறேன் *' : 'I confirm photo consent from parents/guardians for all students shown *')}
                    </span>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.76rem', color: '#475569' }}>
                      {admLang.photoConsentAlert || (isTamil ? 'குழந்தைகள் மற்றும் மாணவர்கள் புகைப்படங்களைப் பொதுவில் வெளியிடுவதற்கு பெற்றோரின் ஒப்புதல் கட்டாயமாகும்.' : 'Child Safety & Privacy: Publishing photos of minors and students strictly requires verifiable parental or guardian consent.')}
                    </p>
                  </div>
                </label>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-outline"
                >
                  {isTamil ? 'ரத்து' : 'Cancel'}
                </button>

                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <button
                    type="button"
                    onClick={() => handleSave('draft')}
                    className="btn btn-outline"
                  >
                    {admLang.btnSaveDraft || (isTamil ? 'வரைவாக சேமி' : 'Save as Draft')}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSave('published')}
                    className="btn btn-primary"
                    style={{ fontWeight: 700 }}
                  >
                    {admLang.btnPublish || (isTamil ? 'பொதுவில் வெளியிடு' : 'Publish Showcase')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAchievementsPage;
