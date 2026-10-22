import React, { useState } from 'react';
import { Bot, Sparkles, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './EdnovaAI.css';

export function EdnovaAI({ compact = false }) {
  const { lang } = useLanguage();
  const isTamil = lang === 'ta';

  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [chatPreview, setChatPreview] = useState(null);

  const defaultQuestion = isTamil
    ? '12-ஆம் வகுப்புக்குப் பிறகு என்ன படிக்கலாம் என்று குழப்பமா? உங்கள் விருப்பங்களை ஒன்றாக ஆராய்வோம்!'
    : "Not sure what to choose after Class 12? Let's explore your options together!";

  const samplePrompts = isTamil
    ? [
        { q: 'பொறியியல் TNEA சேர்க்கை முறை என்ன?', a: 'TNEA பொறியியல் ஒற்றைச் சாளர கலந்தாய்வு tneaonline.org மூலம் நடைபெறுகிறது. கணிதம் (100) + இயற்பியல் (50) + வேதியியல் (50) அடிப்படையில் தரவரிசை வெளியிடப்படும்.' },
        { q: '7.5% அரசுப் பள்ளி இடஒதுக்கீடு யாருக்கு கிடைக்கும்?', a: 'தமிழ்நாடு அரசுப் பள்ளிகளில் 6 முதல் 12-ஆம் வகுப்பு வரை தொடர்ந்து பயின்ற மாணவர்களுக்கு 7.5% இடஒதுக்கீட்டின் கீழ் 100% இலவசக் கல்வி வழங்கப்படுகிறது.' },
        { q: 'கலை மற்றும் அறிவியல் படிப்புகளுக்கான சேர்க்கை எப்போது?', a: 'TNGASA (tngasa.in) இணையதளம் மூலம் அரசு கலை மற்றும் அறிவியல் கல்லூரிகளுக்கான சேர்க்கை ஒற்றைச் சாளர முறையில் நடைபெறுகிறது.' },
        { q: 'வளர்ந்து வரும் AI & Data Science வேலைவாய்ப்புகள் என்ன?', a: 'AI & Data Science துறையில் Machine Learning, Cloud Computing, Data Analytics போன்ற உயர் ஊதிய வாய்ப்புகள் வேகமாக வளர்ந்து வருகின்றன.' }
      ]
    : [
        { q: 'How does TNEA engineering counseling work?', a: 'Single-window TNEA counseling is conducted online via tneaonline.org based on your Class 12 PCM normalized rank list.' },
        { q: 'Who is eligible for 7.5% Govt school quota?', a: 'Students who studied continuously from Classes 6 to 12 in Tamil Nadu Government schools are eligible for 100% fee exemption including tuition and hostel.' },
        { q: 'How does Arts & Science college admission work?', a: 'Single-window admissions for Government Arts & Science colleges take place through the official TNGASA portal (tngasa.in).' },
        { q: 'What are emerging opportunities in AI & Tech?', a: 'Fields like AI, Machine Learning, Data Analytics, and Cloud Computing offer high-growth global and domestic career opportunities.' }
      ];

  const handlePromptClick = (index) => {
    setActivePromptIndex(index);
    setChatPreview(samplePrompts[index]);
  };

  const handleAsk = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    setChatPreview({
      q: customInput,
      a: isTamil
        ? `Ednova AI வழிகாட்டுதல்: "${customInput}" குறித்த தகவல்கள் சரிபார்க்கப்பட்டு வருகின்றன. கீழேயுள்ள படிப்புகள், உதவித்தொகைகள் மற்றும் கட்-ஆஃப் வழிகாட்டிகளைப் பார்வையிடவும்.`
        : `Ednova AI Guidance: Exploring options for "${customInput}". You can explore verified cutoff formulas, colleges, and state scholarships below.`
    });
    setCustomInput('');
  };

  return (
    <div className={`ednova-card ${compact ? 'ednova-compact' : ''}`}>
      {/* Robot Character Graphic */}
      <div className="ednova-robot-stage">
        {/* Animated Robot SVG */}
        <div className="ednova-robot" aria-hidden="true">
          <div className="ednova-antenna">
            <span className="antenna-glow" />
            <span className="antenna-stem" />
          </div>

          <div className="ednova-head">
            <div className="ednova-ear ear-left" />
            <div className="ednova-face">
              <div className="ednova-visor">
                <span className="ednova-eye eye-left">
                  <span className="ednova-pupil" />
                </span>
                <span className="ednova-eye eye-right">
                  <span className="ednova-pupil" />
                </span>
              </div>
              <div className="ednova-smile" />
            </div>
            <div className="ednova-ear ear-right" />
          </div>

          <div className="ednova-body">
            <div className="ednova-chest">
              <Sparkles size={16} className="ednova-core-sparkle" />
            </div>
            <div className="ednova-arm arm-left" />
            <div className="ednova-arm arm-right" />
          </div>

          <div className="ednova-shadow" />
        </div>

        {/* Speech Bubble */}
        <div className="ednova-bubble" role="status">
          <div className="ednova-bubble-badge">
            <Bot size={13} />
            <span>Ednova AI • {isTamil ? 'மாணவர் உதவியாளர்' : 'Student Assistant'}</span>
          </div>
          <p className="ednova-bubble-text">
            {chatPreview ? chatPreview.q : defaultQuestion}
          </p>
        </div>
      </div>

      {/* Answer display if clicked */}
      {chatPreview && (
        <div className="ednova-response-card">
          <div className="response-header">
            <CheckCircle2 size={16} color="var(--eee-teal, #087F8C)" />
            <strong>Ednova AI {isTamil ? 'பதில்' : 'Response'}</strong>
          </div>
          <p>{chatPreview.a}</p>
        </div>
      )}

      {/* Quick Prompt Questions */}
      <div className="ednova-prompts-tray">
        <span className="ednova-tray-label">
          {isTamil ? 'உதாரணக் கேள்விகள்:' : 'Quick Questions:'}
        </span>
        <div className="ednova-prompts-list">
          {samplePrompts.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className={`ednova-prompt-chip ${activePromptIndex === idx && chatPreview ? 'active' : ''}`}
              onClick={() => handlePromptClick(idx)}
            >
              <MessageSquare size={13} />
              <span>{item.q}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Input (Ready for AI backend integration) */}
      <form onSubmit={handleAsk} className="ednova-input-row">
        <input
          type="text"
          className="ednova-input"
          placeholder={
            isTamil
              ? 'உங்கள் கேள்வி அல்லது ஆர்வத்தை உள்ளிடுங்கள் (எ.கா. B.Tech, Cutoff, Scholarships)...'
              : 'Ask Ednova AI about courses, cutoffs, or scholarships...'
          }
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
        />
        <button
          type="submit"
          className="ednova-send-btn"
          aria-label={isTamil ? 'கேளுங்கள்' : 'Ask'}
        >
          <Send size={16} />
          <span>{isTamil ? 'கேளுங்கள்' : 'Ask'}</span>
        </button>
      </form>
    </div>
  );
}

export default EdnovaAI;
