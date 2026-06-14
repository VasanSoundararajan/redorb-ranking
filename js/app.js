window.Redrob = window.Redrob || {};

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const btnParseJd = document.getElementById('btn-parse-jd');
    const btnBackJd = document.getElementById('btn-back-jd');
    const btnRank = document.getElementById('btn-rank');
    const btnBackCandidates = document.getElementById('btn-back-candidates');
    const btnNewRanking = document.getElementById('btn-new-ranking');
    const btnExportJson = document.getElementById('btn-export-json');
    const modalClose = document.getElementById('modal-close');
    
    const sectionJd = document.getElementById('step-jd');
    const sectionCandidates = document.getElementById('step-candidates');
    const sectionResults = document.getElementById('step-results');
    
    const jdInput = document.getElementById('jd-input');
    const candidatesInput = document.getElementById('candidates-input');
    const rankedList = document.getElementById('ranked-list');
    
    const jdDropZone = document.getElementById('jd-drop-zone');
    const jdFileInput = document.getElementById('jd-file-input');
    const candidatesDropZone = document.getElementById('candidates-drop-zone');
    const candidatesFileInput = document.getElementById('candidates-file-input');
    
    const toastContainer = document.getElementById('toast-container');

    // State
    let currentJobProfile = null;
    let currentRankedCandidates = [];
    
    // Toast Notification
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Navigation
    function showSection(section) {
        document.querySelectorAll('.step-section').forEach(s => s.classList.remove('active'));
        section.classList.add('active');
        section.classList.add('animate-in');
    }

    // --- Drop Zone Logic ---
    function setupDropZone(dropZone, fileInput, onFile) {
        dropZone.addEventListener('click', () => fileInput.click());
        
        dropZone.addEventListener('dragover', e => {
            e.preventDefault();
            dropZone.classList.add('drop-zone--active');
        });
        
        ['dragleave', 'dragend'].forEach(type => {
            dropZone.addEventListener(type, () => {
                dropZone.classList.remove('drop-zone--active');
            });
        });
        
        dropZone.addEventListener('drop', e => {
            e.preventDefault();
            dropZone.classList.remove('drop-zone--active');
            if (e.dataTransfer.files.length) {
                onFile(e.dataTransfer.files[0]);
            }
        });
        
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length) {
                onFile(fileInput.files[0]);
            }
        });
    }

    // JD File Upload
    setupDropZone(jdDropZone, jdFileInput, async (file) => {
        showToast('Reading JD file...', 'info');
        try {
            const text = await window.Redrob.FileParsers.readJdFile(file);
            jdInput.value = text;
            showToast('File read successfully. You can now analyze it.', 'success');
        } catch (e) {
            showToast(e.message, 'error');
            console.error(e);
        }
    });

    // Candidates File Upload
    setupDropZone(candidatesDropZone, candidatesFileInput, async (file) => {
        showToast('Reading Candidates file...', 'info');
        try {
            const parsedData = await window.Redrob.FileParsers.readCandidatesFile(file);
            // Stringify back to text area so user can review/edit before ranking
            candidatesInput.value = JSON.stringify(parsedData, null, 2);
            showToast('File read successfully. You can now rank.', 'success');
        } catch (e) {
            showToast(e.message, 'error');
            console.error(e);
        }
    });

    // Step 1: Parse JD
    btnParseJd.addEventListener('click', () => {
        try {
            const text = jdInput.value.trim();
            if (!text) {
                showToast('Please enter a job description', 'error');
                return;
            }
            
            if (!window.Redrob || !window.Redrob.JDParser) {
                alert("Critical Error: JDParser module failed to load.");
                return;
            }
            
            currentJobProfile = window.Redrob.JDParser.parse(text);
            console.log("Parsed Job Profile:", currentJobProfile);
            showToast('Job description analyzed successfully!', 'success');
            showSection(sectionCandidates);
        } catch (err) {
            console.error("Parse JD Error:", err);
            alert("Error parsing JD: " + err.message);
        }
    });

    btnBackJd.addEventListener('click', () => {
        showSection(sectionJd);
    });

    // Step 2: Rank Candidates
    btnRank.addEventListener('click', () => {
        try {
            if (!currentJobProfile) {
                alert("Please Analyze a Job Description first!");
                showSection(sectionJd);
                return;
            }

            const text = candidatesInput.value.trim();
            if (!text) {
                showToast('Please enter candidate data', 'error');
                return;
            }

            let rawCandidates;
            try {
                rawCandidates = JSON.parse(text);
            } catch (e) {
                showToast('Invalid JSON candidate data', 'error');
                return;
            }

            // Show Progress UI
            const progressContainer = document.getElementById('ranking-progress-container');
            const progressFill = document.getElementById('ranking-progress-fill');
            const progressText = document.getElementById('ranking-progress-text');
            
            progressContainer.style.display = 'block';
            progressFill.style.width = '0%';
            progressText.textContent = '0%';
            btnRank.disabled = true;
            btnRank.textContent = 'Processing...';

            // Spawn Worker with Try/Catch (often fails on file:// protocol)
            let worker;
            try {
                worker = new Worker('js/worker.js');
            } catch (workerErr) {
                console.error(workerErr);
                alert("Failed to start Web Worker. If you are opening this file directly (file://), your browser may block Web Workers. Please use a local web server.");
                btnRank.disabled = false;
                btnRank.textContent = '🚀 Rank Candidates';
                progressContainer.style.display = 'none';
                return;
            }
            
            worker.onmessage = function(e) {
                if (e.data.type === 'progress') {
                    progressFill.style.width = e.data.progress + '%';
                    progressText.textContent = e.data.progress + '%';
                } else if (e.data.type === 'complete') {
                    currentRankedCandidates = e.data.ranked;
                    
                    // Cleanup
                    worker.terminate();
                    btnRank.disabled = false;
                    btnRank.textContent = '🚀 Rank Candidates';
                    progressContainer.style.display = 'none';
                    
                    renderDashboard();
                    showSection(sectionResults);
                    showToast(`Intelligence Engine complete! Processed ${currentRankedCandidates.length} candidates.`, 'success');
                } else if (e.data.type === 'error') {
                    worker.terminate();
                    btnRank.disabled = false;
                    btnRank.textContent = '🚀 Rank Candidates';
                    progressContainer.style.display = 'none';
                    showToast(e.data.message, 'error');
                    console.error("Worker Error:", e.data.message);
                    alert("Worker Error: " + e.data.message);
                }
            };
            
            worker.onerror = function(err) {
                worker.terminate();
                btnRank.disabled = false;
                btnRank.textContent = '🚀 Rank Candidates';
                progressContainer.style.display = 'none';
                console.error("Worker Global Error:", err.message);
                alert("Worker Global Error: " + err.message + "\nFile: " + err.filename + "\nLine: " + err.lineno);
            };
            
            // Start Processing
            worker.postMessage({
                candidates: rawCandidates,
                jobProfile: currentJobProfile
            });
        } catch (err) {
            console.error("Rank Error:", err);
            alert("Error initializing ranking: " + err.message);
            btnRank.disabled = false;
            btnRank.textContent = '🚀 Rank Candidates';
        }
    });

    btnBackCandidates.addEventListener('click', () => {
        showSection(sectionCandidates);
    });

    btnNewRanking.addEventListener('click', () => {
        jdInput.value = '';
        candidatesInput.value = '';
        showSection(sectionJd);
    });
    
    btnExportJson.addEventListener('click', () => {
        // Export exactly what the CompositeScorer outputted, without the internal UI payload
        const output = currentRankedCandidates.map(r => {
            const { _dashboardData, ...exportData } = r.compositeResult;
            return exportData;
        });
        
        navigator.clipboard.writeText(JSON.stringify(output, null, 2)).then(() => {
            showToast('Copied to clipboard!', 'success');
        });
    });

    // --- Submission Export Logic ---
    const btnExportCsv = document.getElementById('btn-export-csv');
    const btnExportJsonFile = document.getElementById('btn-export-json-file');
    const btnExportAll = document.getElementById('btn-export-all');

    function validateExport() {
        if (!currentRankedCandidates || currentRankedCandidates.length === 0) {
            showToast("No ranked candidates available.<br>Run ranking first.", "error");
            return false;
        }
        return true;
    }

    function generateCsv() {
        let csvContent = "candidate_id,rank,score,reasoning\n";
        currentRankedCandidates.forEach(c => {
            const id = c.candidate?.candidate_id || "";
            const rank = c.rank || "";
            const score = c.compositeResult?.final_score || "";
            let reasoning = c.compositeResult?.reasoning || "";
            // Escape quotes and wrap in quotes
            reasoning = '"' + reasoning.replace(/"/g, '""') + '"';
            
            csvContent += `${id},${rank},${score},${reasoning}\n`;
        });
        
        const csvBlob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(csvBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "submission.csv";
        a.click();
    }

    function generateJson() {
        const exportData = {
            job_description: {
                job_title: currentJobProfile?.title || "",
                required_skills: currentJobProfile?.required_skills || [],
                preferred_skills: currentJobProfile?.preferred_skills || []
            },
            ranking_metadata: {
                generated_at: new Date().toISOString(),
                total_candidates: currentRankedCandidates.length,
                ranking_version: "1.0"
            },
            top_candidates: currentRankedCandidates.map(c => ({
                candidate_id: c.candidate?.candidate_id || "",
                rank: c.rank || 1,
                technical_fit: c.compositeResult?.technical_fit || 0,
                behavioral_fit: c.compositeResult?.behavioral_fit || 0,
                career_fit: c.compositeResult?.career_fit || 0,
                ai_transition_score: c.compositeResult?.ai_transition_readiness || 0,
                confidence_score: c.compositeResult?.confidence_score || 0,
                honeypot_risk_score: c.compositeResult?.honeypot_risk_score || 0,
                final_score: c.compositeResult?.final_score || 0,
                reasoning: c.compositeResult?.reasoning || ""
            }))
        };
        
        const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(jsonBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "submission.json";
        a.click();
    }
    if (btnExportCsv) {
        btnExportCsv.addEventListener('click', () => {
            console.log("CSV Export Started");
            console.log("Ranked Candidates:", currentRankedCandidates);
            if (!validateExport()) return;
            try {
                generateCsv();
                showToast("✓ CSV Downloaded<br><br>Ready for Submission", "success");
            } catch (err) {
                console.error(err);
                showToast("Export Failed<br>Unable to generate file.", "error");
            }
        });
    }

    if (btnExportJsonFile) {
        btnExportJsonFile.addEventListener('click', () => {
            console.log("JSON Export Started");
            console.log("Ranked Candidates:", currentRankedCandidates);
            if (!validateExport()) return;
            try {
                generateJson();
                showToast("✓ JSON Downloaded<br><br>Ready for Submission", "success");
            } catch (err) {
                console.error(err);
                showToast("Export Failed<br>Unable to generate file.", "error");
            }
        });
    }

    if (btnExportAll) {
        btnExportAll.addEventListener('click', () => {
            console.log("Download All Started");
            console.log("Ranked Candidates:", currentRankedCandidates);
            if (!validateExport()) return;
            try {
                generateCsv();
                generateJson();
                showToast("✓ CSV Downloaded<br>✓ JSON Downloaded<br><br>Ready for Submission", "success");
            } catch (err) {
                console.error(err);
                showToast("Export Failed<br>Unable to generate file.", "error");
            }
        });
    }

    // Step 3: Render Dashboard
    function renderDashboard() {
        rankedList.innerHTML = '';

        const jp = currentJobProfile || {};

        // Feature 6: Enhanced JD Analysis
        const jdSummary = document.getElementById('jd-summary');
        if (jdSummary && jp) {
            const reqSkillsHtml = (jp.required_skills || []).map(s => `<span class="skill-chip">${s}</span>`).join(' ') || '<span class="text-muted">None specified</span>';
            const prefSkillsHtml = (jp.preferred_skills || []).map(s => `<span class="skill-chip skill-chip--preferred">${s}</span>`).join(' ') || '<span class="text-muted">None specified</span>';
            const keywordsHtml = (jp.domain_keywords || []).map(s => `<span class="skill-chip" style="opacity: 0.8">${s}</span>`).join(' ') || 'General';
            
            jdSummary.innerHTML = `
                <div style="margin-bottom: 12px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
                    <div style="font-size: 1.1em; color: var(--text-primary); font-weight: 600;">${jp.title || 'N/A'}</div>
                    <div style="color: var(--accent-primary); font-size: 0.85em; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em;">${jp.seniority || 'N/A'} Level</div>
                </div>
                <div style="margin-bottom: 12px;"><strong>Experience Range:</strong> ${jp.min_experience || 0}-${jp.max_experience || '∞'} years</div>
                <div style="margin-bottom: 12px;"><strong>Required Skills:</strong><div style="margin-top: 6px; display: flex; flex-wrap: wrap; gap: 4px;">${reqSkillsHtml}</div></div>
                <div style="margin-bottom: 12px;"><strong>Preferred Skills:</strong><div style="margin-top: 6px; display: flex; flex-wrap: wrap; gap: 4px;">${prefSkillsHtml}</div></div>
                <div style="margin-bottom: 12px;"><strong>Leadership Req:</strong> ${jp.leadership_required ? 'Yes' : 'No'}</div>
                <div style="margin-bottom: 12px;"><strong>Domain Classification:</strong> ${jp.industry || 'General Tech'}</div>
                <div style="margin-bottom: 12px;"><strong>AI Readiness Req:</strong> ${jp.aiRequirement || 'Standard'}</div>
                <div style="margin-bottom: 12px;"><strong>Keywords:</strong><div style="margin-top: 6px; display: flex; flex-wrap: wrap; gap: 4px;">${keywordsHtml}</div></div>
            `;
        }

        // Feature 7: Advanced Scoring Weights
        const weights = window.Redrob.DynamicWeights.generate(jp);
        let weightsHtml = '';
        const weightDescriptions = {
            base_skill: "Foundational & exact technical skill matches.",
            experience: "Years of relevant experience & timeline.",
            career: "Promotions, trajectory, & scope expansion.",
            behavioral: "Responsiveness & market recruitability.",
            ai_transition: "Machine learning & gen-AI exposure.",
            interaction: "Behavioral market markers."
        };

        for (const [key, val] of Object.entries(weights)) {
            if (val > 0) {
                const title = key.replace(/([A-Z_])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace('_', ' ');
                const desc = weightDescriptions[key] || "Component scoring weight based on JD analysis.";
                weightsHtml += `
                    <div style="margin-bottom: 14px;">
                        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                            <span style="font-weight: 600; color: var(--text-primary); font-size: 13px;">${title}</span>
                            <span style="font-family: var(--font-mono); color: var(--accent-primary); font-weight: 700; font-size: 12px;">${(val * 100).toFixed(0)}%</span>
                        </div>
                        <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; margin-bottom: 4px;">
                            <div style="width: ${(val * 100)}%; height: 100%; background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));"></div>
                        </div>
                        <div style="font-size: 11px; color: var(--text-muted); line-height: 1.3;">${desc}</div>
                    </div>
                `;
            }
        }
        document.getElementById('weight-controls').innerHTML = weightsHtml;

        // Feature 5: Ranking Pipeline Visualization
        const pipelineStages = [
            { name: "Job Description", desc: "Parsed rules & constraints." },
            { name: "Skill Intelligence", desc: "Evaluates exact, cluster, and missing technical skills." },
            { name: "Behavioral Intelligence", desc: "Measures responsiveness, reliability, and recruitability." },
            { name: "Career Analysis", desc: "Tracks promotion velocity and leadership growth." },
            { name: "AI Transition Engine", desc: "Assesses gen-AI/ML capabilities and data readiness." },
            { name: "Confidence Engine", desc: "Calculates trust score via profile verification." },
            { name: "Risk & Anomaly Detection", desc: "Flags honeypots, inflated titles, and trap profiles." },
            { name: "Final Ranking", desc: "Generates composite score and tier." }
        ];
        
        let pipelineHtml = '';
        pipelineStages.forEach((stage, idx) => {
            pipelineHtml += `
                <div class="pipeline-stage">
                    <div class="pipeline-header">
                        <span class="pipeline-title">${stage.name}</span>
                    </div>
                    <div class="pipeline-details">${stage.desc}</div>
                </div>
            `;
            if (idx < pipelineStages.length - 1) {
                pipelineHtml += `<div class="pipeline-arrow">↓</div>`;
            }
        });
        document.getElementById('methodology-pipeline').innerHTML = pipelineHtml;

        // Add interactive toggles to pipeline stages
        document.querySelectorAll('.pipeline-stage').forEach(el => {
            el.addEventListener('click', () => el.classList.toggle('expanded'));
        });

        // Feature 8: Executive Summary Dashboard (8 Metrics)
        const avgConf = Math.round(currentRankedCandidates.reduce((sum, c) => sum + c.compositeResult.confidence_score, 0) / currentRankedCandidates.length) || 0;
        const avgTech = Math.round(currentRankedCandidates.reduce((sum, c) => sum + c.compositeResult.technical_fit, 0) / currentRankedCandidates.length) || 0;
        const avgBehav = Math.round(currentRankedCandidates.reduce((sum, c) => sum + c.compositeResult.behavioral_fit, 0) / currentRankedCandidates.length) || 0;
        const highConf = currentRankedCandidates.filter(c => c.compositeResult.confidence_score > 80).length;
        const honeypots = currentRankedCandidates.filter(c => c.compositeResult.honeypot_risk_score > 30).length;
        const topAi = currentRankedCandidates.filter(c => c.compositeResult.ai_transition_readiness > 70).length;
        const lowRisk = currentRankedCandidates.filter(c => c.compositeResult.honeypot_risk_score < 10 && (c.compositeResult._dashboardData.flags || []).length === 0).length;

        document.getElementById('summary-stats').innerHTML = `
            <div class="summary-stat-card"><div class="summary-stat-card__content"><div class="summary-stat-card__label">Total Candidates</div><div class="summary-stat-card__value">${currentRankedCandidates.length}</div></div></div>
            <div class="summary-stat-card"><div class="summary-stat-card__content"><div class="summary-stat-card__label">High Confidence</div><div class="summary-stat-card__value" style="color:var(--color-success)">${highConf}</div></div></div>
            <div class="summary-stat-card"><div class="summary-stat-card__content"><div class="summary-stat-card__label">Average Confidence</div><div class="summary-stat-card__value">${avgConf}</div></div></div>
            <div class="summary-stat-card"><div class="summary-stat-card__content"><div class="summary-stat-card__label">Average Tech Fit</div><div class="summary-stat-card__value">${avgTech}</div></div></div>
            <div class="summary-stat-card"><div class="summary-stat-card__content"><div class="summary-stat-card__label">Average Behav. Fit</div><div class="summary-stat-card__value">${avgBehav}</div></div></div>
            <div class="summary-stat-card"><div class="summary-stat-card__content"><div class="summary-stat-card__label">Top AI Transition</div><div class="summary-stat-card__value" style="color:var(--accent-primary)">${topAi}</div></div></div>
            <div class="summary-stat-card"><div class="summary-stat-card__content"><div class="summary-stat-card__label">Low Risk Profiles</div><div class="summary-stat-card__value">${lowRisk}</div></div></div>
            <div class="summary-stat-card"><div class="summary-stat-card__content"><div class="summary-stat-card__label">Potential Honeypots</div><div class="summary-stat-card__value" style="color:var(--color-danger)">${honeypots}</div></div></div>
        `;

        // Render Candidate Cards
        const renderLimit = Math.min(100, currentRankedCandidates.length);
        
        for(let idx = 0; idx < renderLimit; idx++) {
            const r = currentRankedCandidates[idx];
            const card = document.createElement('div');
            card.className = 'candidate-card animate-in';
            card.style.setProperty('--delay', `${idx * 0.05}s`);
            card.style.flexDirection = 'column';
            card.style.alignItems = 'stretch';
            
            const isHoneypot = r.compositeResult.honeypot_risk_score > 30;
            const conf = r.compositeResult.confidence_score;
            
            let confBadgeColor = conf > 80 ? 'var(--color-success)' : (conf > 50 ? 'var(--color-warning)' : 'var(--color-danger)');
            let confText = conf > 80 ? 'High Confidence' : (conf > 50 ? 'Medium Confidence' : 'Low Confidence');

            let riskBadgeHtml = isHoneypot ? `<span class="risk-badge risk-badge--critical">High Risk / Honeypot</span>` : 
                                `<span class="risk-badge risk-badge--low">Low Risk</span>`;

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; cursor: pointer;" class="candidate-header-toggle">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <h3 class="candidate-name" style="margin: 0;">#${r.rank} - ${r.candidate.name}</h3>
                            <span style="background: ${confBadgeColor}22; color: ${confBadgeColor}; padding: 3px 8px; border-radius: var(--radius-full); font-size: 11px; font-weight: 600;">${confText} (${conf})</span>
                            ${riskBadgeHtml}
                        </div>
                        <div class="candidate-title" style="margin-top: 6px;">${r.candidate.title} | ${r.candidate.total_experience_years} yrs</div>
                    </div>
                    <div style="text-align: right; min-width: 120px;">
                        <div class="score-badge" style="background: var(--${r.tierColor}-dark); color: var(--${r.tierColor}-text); padding: 6px 12px; font-size: 14px;">
                           ${r.compositeResult.final_score} - ${r.tier}
                        </div>
                    </div>
                </div>
                <div style="margin-top: 12px; font-size: 13px; color: var(--text-muted); line-height: 1.5; padding-right: 40px;">
                    ${r.compositeResult.reasoning}
                </div>
                
                <!-- Feature 2 & 3: Expandable Visual Breakdown -->
                <div class="candidate-score-breakdown" style="display: none;">
                    <div class="score-row">
                        <div class="score-row-header"><span>Technical Fit</span><span class="score-val">${r.compositeResult.technical_fit}</span></div>
                        <div class="score-bar-bg"><div class="score-bar-fill" style="width: ${r.compositeResult.technical_fit}%; background: #4f7cff;"></div></div>
                    </div>
                    <div class="score-row">
                        <div class="score-row-header"><span>Behavioral Fit</span><span class="score-val">${r.compositeResult.behavioral_fit}</span></div>
                        <div class="score-bar-bg"><div class="score-bar-fill" style="width: ${r.compositeResult.behavioral_fit}%; background: #a78bfa;"></div></div>
                    </div>
                    <div class="score-row">
                        <div class="score-row-header"><span>Career Fit</span><span class="score-val">${r.compositeResult.career_fit}</span></div>
                        <div class="score-bar-bg"><div class="score-bar-fill" style="width: ${r.compositeResult.career_fit}%; background: #ec4899;"></div></div>
                    </div>
                    <div class="score-row">
                        <div class="score-row-header"><span>AI Transition</span><span class="score-val">${r.compositeResult.ai_transition_readiness}</span></div>
                        <div class="score-bar-bg"><div class="score-bar-fill" style="width: ${r.compositeResult.ai_transition_readiness}%; background: #22d3ee;"></div></div>
                    </div>
                    <div class="score-row">
                        <div class="score-row-header"><span>Confidence</span><span class="score-val">${r.compositeResult.confidence_score}</span></div>
                        <div class="score-bar-bg"><div class="score-bar-fill" style="width: ${r.compositeResult.confidence_score}%; background: #4ade80;"></div></div>
                    </div>
                    <div class="score-row">
                        <div class="score-row-header"><span>Leadership</span><span class="score-val">${r.compositeResult.leadership_growth || 0}</span></div>
                        <div class="score-bar-bg"><div class="score-bar-fill" style="width: ${r.compositeResult.leadership_growth || 0}%; background: #fbbf24;"></div></div>
                    </div>
                    <div style="grid-column: 1 / -1; margin-top: 12px; display: flex; justify-content: flex-end;">
                        <button class="btn-secondary btn-full-report">View Full Intelligence Report →</button>
                    </div>
                </div>
            `;
            
            // Expand logic
            const headerToggle = card.querySelector('.candidate-header-toggle');
            const breakdown = card.querySelector('.candidate-score-breakdown');
            headerToggle.addEventListener('click', () => {
                breakdown.style.display = breakdown.style.display === 'none' ? 'grid' : 'none';
            });

            // Feature 4: Drill-Down Report logic
            const btnReport = card.querySelector('.btn-full-report');
            btnReport.addEventListener('click', (e) => {
                e.stopPropagation();
                renderCandidateModal(r);
            });
            
            rankedList.appendChild(card);
        }
        
        if (currentRankedCandidates.length > 100) {
             const note = document.createElement('div');
             note.style.textAlign = 'center';
             note.style.marginTop = '20px';
             note.style.color = 'var(--text-muted)';
             note.textContent = `Showing top 100 of ${currentRankedCandidates.length}. Click "Copy JSON Output" for full results.`;
             rankedList.appendChild(note);
        }
    }

    // Feature 4: Candidate Drill-Down Report
    function renderCandidateModal(rankedData) {
        const c = rankedData.candidate;
        const res = rankedData.compositeResult;
        const dashData = res._dashboardData || {};

        const modalContent = document.getElementById('modal-content');
        
        // Generate Skills HTML
        const matchedSkills = (dashData.skills?.matched || []).map(s => `<span class="skill-chip skill-chip--match">${s}</span>`).join(' ') || 'None';
        const missingSkills = (dashData.skills?.missing || []).map(s => `<span class="skill-chip skill-chip--missing">${s}</span>`).join(' ') || 'None';
        
        // Generate Anomalies HTML
        const flagsArray = dashData.flags || [];
        const anomaliesHtml = flagsArray.length > 0 
            ? `<ul style="color: var(--color-danger); padding-left: 20px;">` + flagsArray.map(f => `<li>${f}</li>`).join('') + `</ul>`
            : `<div style="color: var(--color-success);">No risk anomalies detected.</div>`;

        modalContent.innerHTML = `
            <div class="detail-header" style="border-bottom: 1px solid var(--border-subtle); padding-bottom: 20px; margin-bottom: 24px;">
                <div style="flex: 1;">
                    <h2 style="font-family: var(--font-display); font-size: 24px; margin-bottom: 8px;">${c.name}</h2>
                    <div style="color: var(--text-muted); font-size: 14px;">${c.title} • ${c.total_experience_years} Years Exp. • ${c.location || 'Remote'}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 32px; font-family: var(--font-display); font-weight: 800; color: var(--accent-primary);">${res.final_score}</div>
                    <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted);">${rankedData.tier}</div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
                <!-- Left Column -->
                <div>
                    <div class="detail-section" style="margin-bottom: 24px;">
                        <h3 class="detail-section__title">Final Explanation</h3>
                        <div style="background: rgba(255,255,255,0.03); padding: 16px; border-radius: var(--radius-md); font-size: 14px; line-height: 1.6; color: var(--text-primary); border-left: 3px solid var(--accent-primary);">
                            ${res.reasoning}
                        </div>
                    </div>

                    <div class="detail-section" style="margin-bottom: 24px;">
                        <h3 class="detail-section__title">Skill Intelligence</h3>
                        <div style="margin-bottom: 12px;"><strong>Matched Required Skills:</strong><div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px;">${matchedSkills}</div></div>
                        <div><strong>Missing Core Skills:</strong><div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px;">${missingSkills}</div></div>
                    </div>

                    <div class="detail-section">
                        <h3 class="detail-section__title">Behavioral & Career Intelligence</h3>
                        <ul style="list-style-type: none; padding: 0; line-height: 2;">
                            <li><strong style="color: var(--text-muted);">Promotion Score:</strong> ${res.career_fit}/100</li>
                            <li><strong style="color: var(--text-muted);">Leadership Growth:</strong> ${res.leadership_growth || 0}/100</li>
                            <li><strong style="color: var(--text-muted);">Responsiveness:</strong> ${dashData.behavioral?.responsiveness || 'N/A'}</li>
                            <li><strong style="color: var(--text-muted);">Market Demand:</strong> ${dashData.behavioral?.market_demand || 'N/A'}</li>
                            <li><strong style="color: var(--text-muted);">Recruitability:</strong> ${dashData.behavioral?.recruitability || 'N/A'}</li>
                        </ul>
                    </div>
                </div>

                <!-- Right Column -->
                <div>
                    <div class="detail-section" style="margin-bottom: 24px;">
                        <h3 class="detail-section__title">AI Transition Analysis</h3>
                        <div style="background: rgba(34, 211, 238, 0.05); padding: 16px; border-radius: var(--radius-md); border: 1px solid rgba(34, 211, 238, 0.2);">
                            <div style="font-size: 24px; font-weight: 700; color: #22d3ee; margin-bottom: 8px;">${res.ai_transition_readiness} / 100</div>
                            <div style="font-size: 13px; color: var(--text-muted); line-height: 1.5;">Evaluates foundational proxy skills (data eng, math, python, backend complexity) that indicate readiness to adopt or transition to generative AI and ML roles.</div>
                        </div>
                    </div>

                    <div class="detail-section" style="margin-bottom: 24px;">
                        <h3 class="detail-section__title">Confidence Assessment</h3>
                        <div style="background: rgba(74, 222, 128, 0.05); padding: 16px; border-radius: var(--radius-md); border: 1px solid rgba(74, 222, 128, 0.2);">
                            <div style="font-size: 24px; font-weight: 700; color: #4ade80; margin-bottom: 8px;">${res.confidence_score} / 100</div>
                            <div style="font-size: 13px; color: var(--text-muted); line-height: 1.5;">Overall system confidence in the ranking placement based on verifiable data, timeline consistency, and skill proofs.</div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h3 class="detail-section__title">Risk Analysis</h3>
                        <div style="background: rgba(255, 107, 107, 0.05); padding: 16px; border-radius: var(--radius-md); border: 1px solid rgba(255, 107, 107, 0.2);">
                            <div style="font-size: 24px; font-weight: 700; color: #ff6b6b; margin-bottom: 8px;">${res.honeypot_risk_score} / 100</div>
                            <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">Honeypot / Trap Risk Severity</div>
                            ${anomaliesHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modal-overlay').style.display = 'flex';
    }

    // Modal close
    modalClose.addEventListener('click', () => {
        document.getElementById('modal-overlay').style.display = 'none';
    });
});
