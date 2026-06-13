window.Redrob = window.Redrob || {};

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const btnParseJd = document.getElementById('btn-parse-jd');
    const btnLoadDemo = document.getElementById('btn-load-demo');
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
        const text = jdInput.value.trim();
        if (!text) {
            showToast('Please enter a job description', 'error');
            return;
        }
        
        currentJobProfile = window.Redrob.JDParser.parse(text);
        console.log("Parsed Job Profile:", currentJobProfile);
        showToast('Job description analyzed successfully!', 'success');
        showSection(sectionCandidates);
    });

    btnLoadDemo.addEventListener('click', () => {
        jdInput.value = window.Redrob.DemoData.jobDescription;
        candidatesInput.value = JSON.stringify(window.Redrob.DemoData.candidates, null, 2);
        showToast('Demo data loaded', 'success');
    });

    btnBackJd.addEventListener('click', () => {
        showSection(sectionJd);
    });

    // Step 2: Rank Candidates
    btnRank.addEventListener('click', () => {
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

        // Spawn Worker
        const worker = new Worker('js/worker.js');
        
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
                showToast(`Ranking complete! Processed ${currentRankedCandidates.length} candidates.`, 'success');
            } else if (e.data.type === 'error') {
                worker.terminate();
                btnRank.disabled = false;
                btnRank.textContent = '🚀 Rank Candidates';
                progressContainer.style.display = 'none';
                showToast(e.data.message, 'error');
                console.error("Worker Error:", e.data.message);
            }
        };
        
        // Start Processing
        worker.postMessage({
            candidates: rawCandidates,
            jobProfile: currentJobProfile
        });
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
        
        // Stats
        document.getElementById('summary-stats').innerHTML = `
            <div class="summary-stat-card">Total: ${currentRankedCandidates.length}</div>
            <div class="summary-stat-card">Top Match: ${currentRankedCandidates.filter(c => c.tier === 'Top Match').length}</div>
            <div class="summary-stat-card">Avg Score: ${Math.round(currentRankedCandidates.reduce((sum, c) => sum + c.compositeResult.final_score, 0) / currentRankedCandidates.length) || 0}</div>
        `;

        // Render ONLY Top 100 to prevent browser crash
        const renderLimit = Math.min(100, currentRankedCandidates.length);
        
        for(let idx = 0; idx < renderLimit; idx++) {
            const r = currentRankedCandidates[idx];
            const card = document.createElement('div');
            card.className = 'candidate-card animate-in';
            card.style.setProperty('--delay', `${idx * 0.05}s`);
            
            let flagsHtml = '';
            const dashData = r.compositeResult._dashboardData;
            if (dashData && dashData.flags && dashData.flags.length > 0) {
                flagsHtml = dashData.flags.map(flag => 
                    `<span class="risk-badge risk-badge--high">⚠️ ${flag}</span>`
                ).join('');
            }
            
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 class="candidate-name">#${r.rank} - ${r.candidate.name}</h3>
                        <div class="candidate-title">${r.candidate.title} | ${r.candidate.total_experience_years} yrs</div>
                    </div>
                    <div style="text-align: right;">
                        <div class="score-badge" style="background: var(--${r.tierColor}-dark); color: var(--${r.tierColor}-text); padding: 4px 8px; border-radius: 4px; font-weight: bold;">
                           ${r.compositeResult.final_score} - ${r.tier}
                        </div>
                    </div>
                </div>
                <div style="margin-top: 10px; font-size: 0.9em; color: var(--text-muted);">
                    ${r.compositeResult.reasoning}
                </div>
                <div style="margin-top: 10px;">
                    ${flagsHtml}
                </div>
            `;
            
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
