import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import { initialOpportunities } from '../data/appData';
import { OpportunityCard } from '../components/OpportunityCard';
import { Search, Filter, ShieldCheck, HelpCircle, Loader2, Sparkles, RefreshCw } from 'lucide-react';

export function OpportunitiesPage() {
  const { lang, t } = useLanguage();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [targetFilter, setTargetFilter] = useState('all');

  // Load from Supabase on mount
  useEffect(() => {
    let isMounted = true;

    async function loadOpportunities() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const { data, error } = await supabase
          .from('opportunities')
          .select('*')
          .order('title_en', { ascending: true });

        if (!isMounted) return;

        if (error) {
          console.warn('[OpportunitiesPage] Supabase error, falling back to local dataset:', error);
          setOpportunities(initialOpportunities);
        } else if (data && data.length > 0) {
          setOpportunities(data);
        } else {
          // If the table is empty (e.g. before user executes migration in SQL Editor), fallback to initialOpportunities
          setOpportunities(initialOpportunities);
        }
      } catch (err) {
        console.error('[OpportunitiesPage] Unexpected fetch error:', err);
        if (isMounted) {
          setOpportunities(initialOpportunities);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOpportunities();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('title_en', { ascending: true });

      if (!error && data && data.length > 0) {
        setOpportunities(data);
      } else {
        setOpportunities(initialOpportunities);
      }
    } catch {
      setOpportunities(initialOpportunities);
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    const title = (
      (lang === 'ta' && opp.title_ta) ? opp.title_ta : (opp.title_en || '')
    ).toLowerCase();

    const provider = (
      (lang === 'ta' && opp.provider_ta) ? opp.provider_ta : (opp.provider_name || opp.provider_en || '')
    ).toLowerCase();

    const eligibility = (
      (lang === 'ta' && opp.eligibility_ta) ? opp.eligibility_ta : (opp.eligibility_en || '')
    ).toLowerCase();

    const description = (
      (lang === 'ta' && opp.description_ta) ? opp.description_ta : (opp.description_en || '')
    ).toLowerCase();

    const query = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !query ||
      title.includes(query) ||
      provider.includes(query) ||
      eligibility.includes(query) ||
      description.includes(query);

    // Category Filter
    const cat = (opp.opportunity_type || opp.type || opp.category || '').toLowerCase();
    const matchesType =
      selectedType === 'all' ||
      (selectedType === 'scholarship' && (cat.includes('scholarship') || cat.includes('aid') || cat.includes('fellowship') || cat.includes('lead') || cat.includes('merit'))) ||
      (selectedType === 'scheme' && (cat.includes('scheme') || cat.includes('quota') || cat.includes('welfare') || cat.includes('assistance') || cat.includes('reservation') || cat.includes('concession'))) ||
      (selectedType === 'foundation' && (cat.includes('foundation') || cat.includes('trust') || cat.includes('college') || cat.includes('ngo') || cat.includes('institutional') || cat.includes('corporate'))) ||
      (selectedType === 'loan' && (cat.includes('loan') || title.includes('loan')));

    // Eligibility Focus Filter
    const allText = (title + ' ' + eligibility + ' ' + description).toLowerCase();
    const matchesTarget =
      targetFilter === 'all' ||
      (targetFilter === 'govtschool' && (allText.includes('govt school') || allText.includes('அரசுப் பள்ளி') || allText.includes('7.5%') || allText.includes('pudhumai') || allText.includes('pudhalvan'))) ||
      (targetFilter === 'firstgraduate' && (allText.includes('first graduate') || allText.includes('முதல் பட்டதாரி') || allText.includes('first-generation'))) ||
      (targetFilter === 'scst' && (allText.includes('sc') || allText.includes('st') || allText.includes('ஆதிதிராவிடர்') || allText.includes('tribal') || allText.includes('post-matric'))) ||
      (targetFilter === 'merit' && (allText.includes('cut-off') || allText.includes('190') || allText.includes('merit') || allText.includes('rank') || allText.includes('80th percentile'))) ||
      (targetFilter === 'pwd' && (allText.includes('pwd') || allText.includes('disab') || allText.includes('மாற்றுத்திறனாளி') || allText.includes('udid') || allText.includes('saksham'))) ||
      (targetFilter === 'girl' && (allText.includes('girl') || allText.includes('women') || allText.includes('மாணவி') || allText.includes('kanya') || allText.includes('pragati')));

    return matchesSearch && matchesType && matchesTarget;
  });

  return (
    <div className="page-wrapper container">
      {/* Page Header */}
      <div className="page-header">
        <span className="section-tag purple">
          <Sparkles size={14} style={{ marginRight: '6px', display: 'inline-block' }} />
          {lang === 'ta' ? 'அங்கீகரிக்கப்பட்ட வாய்ப்புகள்' : 'Verified Opportunities'}
        </span>
        <h1 className="page-title">
          {lang === 'ta' ? 'உயர்கல்வி உதவித்தொகை & அரசு சலுகைகள்' : 'Scholarships, Foundation Aid & State Quotas'}
        </h1>
        <p className="page-subtitle">
          {lang === 'ta'
            ? 'அரசு சலுகைகள், தனியார் அறக்கட்டளை உதவிகள் மற்றும் 7.5% அரசுப் பள்ளி இடஒதுக்கீடு குறித்த உண்மையான விபரங்கள்.'
            : 'Find verified financial aid, government fee waivers, and community scholarships for Class 12 students across Tamil Nadu.'}
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="filter-controls-card card">
        <div className="search-bar-wrap">
          <Search size={18} color="var(--text-muted)" className="search-icon" />
          <input
            type="text"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              lang === 'ta'
                ? 'உதவித்தொகை பெயர், அறக்கட்டளை, அல்லது தகுதி மூலம் தேடுக...'
                : 'Search by scholarship name, trust, college, or eligibility...'
            }
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter-dropdowns-row">
          {/* Type Filter */}
          <div className="filter-select-group">
            <label className="filter-label">
              <Filter size={14} />
              <span>{lang === 'ta' ? 'வாய்ப்பு வகை:' : 'Category:'}</span>
            </label>
            <select
              className="filter-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">{lang === 'ta' ? 'அனைத்து வகைகள்' : 'All Categories'}</option>
              <option value="scholarship">{lang === 'ta' ? 'அரசு / மத்திய உதவித்தொகை' : 'Scholarships (Govt & Central)'}</option>
              <option value="scheme">{lang === 'ta' ? 'அரசு நலத்திட்டங்கள் & இடஒதுக்கீடு' : 'State Schemes & Welfare Boards'}</option>
              <option value="foundation">{lang === 'ta' ? 'தனியார் அறக்கட்டளைகள் & கல்லூரிகள்' : 'Foundations & College Merit'}</option>
              <option value="loan">{lang === 'ta' ? 'கல்விக் கடன்கள்' : 'Education Loans'}</option>
            </select>
          </div>

          {/* Target Group Filter */}
          <div className="filter-select-group">
            <label className="filter-label">
              <ShieldCheck size={14} />
              <span>{lang === 'ta' ? 'சிறப்பு தகுதி:' : 'Eligibility Focus:'}</span>
            </label>
            <select
              className="filter-select"
              value={targetFilter}
              onChange={(e) => setTargetFilter(e.target.value)}
            >
              <option value="all">{lang === 'ta' ? 'அனைத்து மாணவர்கள்' : 'All Students'}</option>
              <option value="govtschool">{lang === 'ta' ? 'அரசுப் பள்ளி மாணவர்கள்' : 'Govt School Students (7.5%)'}</option>
              <option value="firstgraduate">{lang === 'ta' ? 'முதல் தலைமுறை பட்டதாரி' : 'First Graduate'}</option>
              <option value="scst">{lang === 'ta' ? 'ஆதிதிராவிடர் & பழங்குடியினர்' : 'SC / ST Welfare'}</option>
              <option value="merit">{lang === 'ta' ? 'மதிப்பெண் / Cut-Off தகுதி' : 'High Cut-Off / Merit'}</option>
              <option value="girl">{lang === 'ta' ? 'மாணவிகள் சிறப்பு திட்டம்' : 'Girl Students'}</option>
              <option value="pwd">{lang === 'ta' ? 'மாற்றுத்திறனாளிகள் (UDID)' : 'Differently Abled (PwD)'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Source Notice */}
      <div className="results-meta-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <span className="results-count">
          {loading ? (
            <span>{lang === 'ta' ? 'வாய்ப்புகள் ஏற்றப்படுகின்றன...' : 'Loading opportunities...'}</span>
          ) : (
            lang === 'ta'
              ? `${filteredOpportunities.length} வாய்ப்புகள் கண்டறியப்பட்டுள்ளன`
              : `Showing ${filteredOpportunities.length} verified opportunities`
          )}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="source-verified-notice">
            <ShieldCheck size={14} color="#16a34a" />
            <span>{lang === 'ta' ? 'அதிகாரப்பூர்வ அரசு & அறக்கட்டளை அறிவிப்புகள்' : 'Audited against official government & trust portals'}</span>
          </span>

          <button
            type="button"
            onClick={handleRefresh}
            className="btn btn-sm btn-outline"
            title="Refresh opportunities from database"
            style={{ padding: '0.2rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span style={{ fontSize: '0.75rem' }}>{lang === 'ta' ? 'புதுப்பி' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Loader2 size={36} color="var(--purple-600)" className="animate-spin" />
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>
            {lang === 'ta'
              ? 'உயர்கல்வி உதவித்தொகைகள் தரவுத்தளத்திலிருந்து பெறப்படுகின்றன...'
              : 'Loading verified scholarships & schemes from Supabase...'}
          </p>
        </div>
      ) : filteredOpportunities.length > 0 ? (
        /* Opportunities List Grid */
        <div className="opportunities-grid">
          {filteredOpportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="card empty-state-card">
          <HelpCircle size={44} color="var(--purple-600)" />
          <h3>{lang === 'ta' ? 'வாய்ப்புகள் எதுவும் பொருந்தவில்லை' : 'No matching opportunities found'}</h3>
          <p>
            {lang === 'ta'
              ? 'உங்கள் தேடல் சொல்லை மாற்றிப் பார்க்கவும் அல்லது வடிகட்டிகளை மீட்டமைக்கவும்.'
              : 'Try adjusting your search keywords or resetting your filters.'}
          </p>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setSearchTerm('');
              setSelectedType('all');
              setTargetFilter('all');
            }}
          >
            {lang === 'ta' ? 'அனைத்து வடிகட்டிகளையும் மீட்டமை' : 'Reset All Filters'}
          </button>
        </div>
      )}
    </div>
  );
}
