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

    // Step 3: Render Dashboard
    function renderDashboard() {
        rankedList.innerHTML = '';

        // Generate Dynamic JD Summary
        let classification = "Standard Technical";
        const jdTitle = (currentJobProfile.title || "").toLowerCase();
        if (jdTitle.includes('ai') || jdTitle.includes('machine learning')) classification = "AI/ML Focus";
        if (jdTitle.includes('manager') || jdTitle.includes('lead')) classification = "Leadership/Management";
        // Update JD Summary
        const jdSummary = document.getElementById('jd-summary');
        if (jdSummary && currentJobProfile) {
            const jp = currentJobProfile;
            const reqSkills = (jp.required_skills || []).join(', ') || 'None specified';
            const prefSkills = (jp.preferred_skills || []).join(', ') || 'None specified';
            const keywords = (jp.domain_keywords || []).join(', ') || 'General';
            
            jdSummary.innerHTML = `
                <div style="margin-bottom: 12px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
                    <div style="font-size: 1.1em; color: var(--text-primary); font-weight: 600;">${jp.title || 'N/A'}</div>
                    <div style="color: var(--accent-primary); font-size: 0.85em; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em;">${jp.seniority || 'N/A'} Level</div>
                </div>
                
                <div style="margin-bottom: 10px;"><strong>Experience Range:</strong> ${jp.min_experience || 0}-${jp.max_experience || '∞'} years</div>
                
                <div style="margin-bottom: 10px;">
                    <strong>Required Skills:</strong>
                    <div style="margin-top: 4px; font-size: 0.9em; line-height: 1.4;">${reqSkills}</div>
                </div>
                
                <div style="margin-bottom: 10px;">
                    <strong>Preferred Skills:</strong>
                    <div style="margin-top: 4px; font-size: 0.9em; line-height: 1.4;">${prefSkills}</div>
                </div>
                
                <div style="margin-bottom: 10px;"><strong>Leadership Req:</strong> ${jp.leadership_required ? 'Yes' : 'No'}</div>
                <div style="margin-bottom: 10px;"><strong>Domain Classification:</strong> ${jp.industry || 'General Tech'}</div>
                <div style="margin-bottom: 10px;"><strong>Extracted Keywords:</strong> <span style="opacity: 0.8">${keywords}</span></div>
            `;
        } // Generate Weight Bars
        const weights = window.Redrob.DynamicWeights.generate(currentJobProfile);
        let weightsHtml = '';
        for (const [key, val] of Object.entries(weights)) {
            if (val > 0) {
                weightsHtml += `
                    <div style="margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.8em; color: var(--text-muted); margin-bottom: 2px;">
                            <span>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                            <span>${(val * 100).toFixed(0)}%</span>
                        </div>
                        <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                            <div style="width: ${(val * 100)}%; height: 100%; background: var(--accent-color);"></div>
                        </div>
                    </div>
                `;
            }
        }
        document.getElementById('weight-controls').innerHTML = weightsHtml;

        // Stats
        const avgConf = Math.round(currentRankedCandidates.reduce((sum, c) => sum + c.compositeResult.confidence_score, 0) / currentRankedCandidates.length) || 0;
        const highConf = currentRankedCandidates.filter(c => c.compositeResult.confidence_score > 80).length;
        const honeypots = currentRankedCandidates.filter(c => c.compositeResult.honeypot_risk_score > 30).length;

        document.getElementById('summary-stats').innerHTML = `
            <div class="summary-stat-card">Total: ${currentRankedCandidates.length}</div>
            <div class="summary-stat-card">High Confidence: ${highConf}</div>
            <div class="summary-stat-card">Avg Confidence: ${avgConf}</div>
            <div class="summary-stat-card" style="${honeypots > 0 ? 'color: var(--danger-color);' : ''}">Honeypots: ${honeypots}</div>
        `;

        // Render ONLY Top 100 to prevent browser crash
        const renderLimit = Math.min(100, currentRankedCandidates.length);
        
        for(let idx = 0; idx < renderLimit; idx++) {
            const r = currentRankedCandidates[idx];
            const card = document.createElement('div');
            card.className = 'candidate-card animate-in';
            card.style.setProperty('--delay', `${idx * 0.05}s`);
            card.style.cursor = 'pointer'; // Make it clickable
            
            const dashData = r.compositeResult._dashboardData || {};
            const isHoneypot = r.compositeResult.honeypot_risk_score > 30;
            const conf = r.compositeResult.confidence_score;
            
            let confBadgeColor = conf > 80 ? 'var(--success-color)' : (conf > 50 ? 'var(--warning-color)' : 'var(--danger-color)');
            let confText = conf > 80 ? 'High Confidence' : (conf > 50 ? 'Medium Confidence' : 'Low Confidence');

            let riskBadgeHtml = isHoneypot ? `<span style="background: rgba(255,107,107,0.2); color: #ff6b6b; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; margin-left: 10px;">High Risk / Honeypot</span>` : 
                                `<span style="background: rgba(74,222,128,0.2); color: #4ade80; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; margin-left: 10px;">Low Risk</span>`;

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center;">
                            <h3 class="candidate-name" style="margin: 0;">#${r.rank} - ${r.candidate.name}</h3>
                            <span style="background: ${confBadgeColor}33; color: ${confBadgeColor}; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; margin-left: 10px;">${confText} (${conf})</span>
                            ${riskBadgeHtml}
                        </div>
                        <div class="candidate-title" style="margin-top: 4px;">${r.candidate.title} | ${r.candidate.total_experience_years} yrs</div>
                    </div>
                    <div style="text-align: right; min-width: 120px;">
                        <div class="score-badge" style="background: var(--${r.tierColor}-dark); color: var(--${r.tierColor}-text); padding: 4px 8px; border-radius: 4px; font-weight: bold; display: inline-block;">
                           ${r.compositeResult.final_score} - ${r.tier}
                        </div>
                    </div>
                </div>
                <div style="margin-top: 12px; font-size: 0.9em; color: var(--text-muted); line-height: 1.4;">
                    ${r.compositeResult.reasoning}
                </div>
                
                <!-- Expandable Details -->
                <div class="candidate-details-grid" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 0.85em;">
                    <div><span style="color:var(--text-muted)">Tech Fit:</span> <strong>${r.compositeResult.technical_fit}</strong></div>
                    <div><span style="color:var(--text-muted)">Behavior:</span> <strong>${r.compositeResult.behavioral_fit}</strong></div>
                    <div><span style="color:var(--text-muted)">Career:</span> <strong>${r.compositeResult.career_fit}</strong></div>
                    <div><span style="color:var(--text-muted)">AI Ready:</span> <strong>${r.compositeResult.ai_transition_readiness}</strong></div>
                    <div><span style="color:var(--text-muted)">Interact:</span> <strong>${r.compositeResult.interaction_score}</strong></div>
                    <div><span style="color:var(--text-muted)">Leadership:</span> <strong>${r.compositeResult.leadership_growth || 0}</strong></div>
                </div>
            `;
            
            // Expand logic
            card.addEventListener('click', () => {
                const grid = card.querySelector('.candidate-details-grid');
                grid.style.display = grid.style.display === 'none' ? 'grid' : 'none';
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

    // Modal close
    modalClose.addEventListener('click', () => {
        document.getElementById('modal-overlay').style.display = 'none';
    });
});
