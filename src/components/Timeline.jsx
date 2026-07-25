"use client";

import { useState, useEffect } from "react";

export default function Timeline({ step, onComplete }) {
  const [readMilestones, setReadMilestones] = useState({});

  const toggleMilestoneRead = (idx) => {
    setReadMilestones(prev => ({
      ...prev,
      [idx]: true
    }));
  };

  const milestonesLength = step.milestones?.length || 0;
  const totalTimelineRead = Object.values(readMilestones).filter(Boolean).length;
  const allMilestonesRead = milestonesLength > 0 && totalTimelineRead === milestonesLength;

  useEffect(() => {
    const timelineLine = document.getElementById("timelineLine");
    const timelineSection = document.querySelector(".timeline");
    
    const ioLine = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && timelineLine) timelineLine.classList.add("in");
      });
    }, { threshold: 0.1 });

    if (timelineSection) ioLine.observe(timelineSection);

    const items = document.querySelectorAll(".t-item");
    const ioItem = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add("in");
      });
    }, { threshold: 0.2 });

    items.forEach(item => ioItem.observe(item));

    return () => {
      if (timelineSection) ioLine.unobserve(timelineSection);
      items.forEach(item => ioItem.unobserve(item));
    };
  }, [step]);

  return (
    <div className="stage-panel">
      <section style={{ marginBottom: "3rem" }}>
        <div className="section-inner">
          <div className="letter-card paper-vintage">
            <div className="paper-vintage-bg"></div>
            {(step.intro || "").split("\n\n").map((para, pIdx) => (
              <p key={pIdx}>{para}</p>
            ))}
            <div className="signoff">{step.signoff}</div>
          </div>
        </div>
      </section>

      <section>
        <div className="section-inner">
          {step.eyebrow && <span className="eyebrow">{step.eyebrow}</span>}
          <div className="heart-divider">
            <svg viewBox="0 0 32 29"><path d="M23.6 0c-3 0-5.7 1.7-7.6 4.4C14.1 1.7 11.4 0 8.4 0 3.8 0 0 3.9 0 8.8c0 8.4 8.6 13 15.4 19.6.3.3.9.3 1.2 0C23.4 21.8 32 17.2 32 8.8 32 3.9 28.2 0 23.6 0z"/></svg>
          </div>
          <h2 className="section-title">{step.title}</h2>
          <div className="timeline">
            <div className="timeline-line" id="timelineLine"></div>

            {(step.milestones || []).map((item, idx) => (
              <div className="t-item" key={idx}>
                <div className="t-card paper-vintage" onClick={() => toggleMilestoneRead(idx)}>
                  <div className="paper-vintage-bg"></div>
                  <div className="t-dot"></div>
                  <span className="t-date">{item.date}</span>
                  <h3 className="t-title">{item.title}</h3>
                  <p>{item.body}</p>
                  
                  <div className={`read-indicator ${readMilestones[idx] ? "read" : ""}`}>
                    {readMilestones[idx] ? (
                      <>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Read
                      </>
                    ) : (
                      "Tap to read"
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "4rem" }}>
            <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", marginBottom: "1.2rem", opacity: 0.85 }}>
              {allMilestonesRead 
                ? "Milestones read! Ready to continue." 
                : `Read all ${milestonesLength} memories to unlock the next stage. (${totalTimelineRead}/${milestonesLength} read)`
              }
            </p>
            <button className="vintage-btn" disabled={!allMilestonesRead} onClick={onComplete}>
              Continue
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
