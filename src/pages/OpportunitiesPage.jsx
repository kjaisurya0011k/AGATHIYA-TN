import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { initialOpportunities } from '../data/appData';
import { OpportunityCard } from '../components/OpportunityCard';
import { Search, Filter, ShieldCheck, HelpCircle } from 'lucide-react';

export function OpportunitiesPage() {
  const { lang, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [targetFilter, setTargetFilter] = useState('all');

  const filteredOpportunities = initialOpportunities.filter((opp) => {
    const title = (lang === 'ta' ? opp.title_ta : opp.title_en).toLowerCase();
    const provider = (lang === 'ta' ? opp.provider_ta : opp.provider_en).toLowerCase();
    const eligibility = (lang === 'ta' ? opp.eligibility_ta : opp.eligibility_en).toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch =
      !searchTerm ||
      title.includes(query) ||
      provider.includes(query) ||
      eligibility.includes(query);

    const matchesType = selectedType === 'all' || opp.type === selectedType;

    const matchesTarget =
      targetFilter === 'all' ||
      (targetFilter === 'govtschool' && opp.id.includes('7point5') || opp.id.includes('pudhumai') || opp.id.includes('pudhalvan')) ||
      (targetFilter === 'firstgraduate' && opp.id.includes('first-graduate')) ||
      (targetFilter === 'scst' && opp.id.includes('post-matric'));

    return matchesSearch && matchesType && matchesTarget;
  });

  return (
    <div className="page-wrapper container">
      {/* Page Header */}
      <div className="page-header">
        <span className="section-tag purple">
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
                ? 'உதவித்தொகை, திட்டம் அல்லது கல்லூரி வகை மூலம் தேடுக...'
                : 'Search by scholarship name, scheme, or eligibility...'
            }
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
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
              <option value="quota">{lang === 'ta' ? 'அரசு இடஒதுக்கீடு (7.5%)' : 'Government Quota (7.5%)'}</option>
              <option value="scholarship">{lang === 'ta' ? 'அரசு உதவித்தொகை (Monthly Aid)' : 'Govt Scholarships'}</option>
              <option value="foundation">{lang === 'ta' ? 'தனியார் அறக்கட்டளைகள்' : 'Foundations'}</option>
              <option value="ngo">{lang === 'ta' ? 'சமூக நல அமைப்புகள் (NGO)' : 'NGO Aid'}</option>
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
              <option value="govtschool">{lang === 'ta' ? 'அரசுப் பள்ளி மாணவர்கள்' : 'Govt School Students'}</option>
              <option value="firstgraduate">{lang === 'ta' ? 'முதல் பட்டதாரி' : 'First Graduate'}</option>
              <option value="scst">{lang === 'ta' ? 'ஆதிதிராவிடர் & பழங்குடியினர்' : 'SC / ST Welfare'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Source Notice */}
      <div className="results-meta-bar">
        <span className="results-count">
          {lang === 'ta'
            ? `${filteredOpportunities.length} வாய்ப்புகள் கண்டறியப்பட்டுள்ளன`
            : `Showing ${filteredOpportunities.length} verified opportunities`}
        </span>

        <span className="source-verified-notice">
          <ShieldCheck size={14} color="#16a34a" />
          <span>{lang === 'ta' ? 'அனைத்து விபரங்களும் அதிகாரப்பூர்வ அரசு அறிவிப்புகள் மூலம் சரிபார்க்கப்பட்டது' : 'Audited against official Tamil Nadu government notifications'}</span>
        </span>
      </div>

      {/* Opportunities List Grid */}
      {filteredOpportunities.length > 0 ? (
        <div className="opportunities-grid">
          {filteredOpportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      ) : (
        <div className="card empty-state-card">
          <HelpCircle size={40} color="var(--purple-600)" />
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
            {lang === 'ta' ? 'அனைத்தையும் காட்டு' : 'Reset All Filters'}
          </button>
        </div>
      )}
    </div>
  );
}
