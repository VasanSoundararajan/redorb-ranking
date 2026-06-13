window.Redrob = window.Redrob || {};

window.Redrob.FileParsers = {
  /**
   * Reads a Job Description file and extracts its text.
   * Supports: .txt, .md, .pdf, .docx
   */
  async readJdFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    
    if (ext === 'txt' || ext === 'md') {
      return await this._readAsText(file);
    } else if (ext === 'pdf') {
      return await this._readPdf(file);
    } else if (ext === 'docx') {
      return await this._readDocx(file);
    } else {
      throw new Error(`Unsupported file type: .${ext}. Please upload a .txt, .md, .pdf, or .docx file.`);
    }
  },

  /**
   * Reads a Candidates file and returns an array of raw candidate objects.
   * Supports: .json, .csv, .xlsx, .xls
   */
  async readCandidatesFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    
    if (ext === 'json') {
      const text = await this._readAsText(file);
      try {
        return JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid JSON format");
      }
    } else if (ext === 'csv' || ext === 'xlsx' || ext === 'xls') {
      return await this._readExcelOrCsv(file);
    } else {
      throw new Error(`Unsupported file type: .${ext}. Please upload a .json, .csv, or .xlsx file.`);
    }
  },

  // --- Internal Helpers ---

  _readAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = e => reject(new Error("Failed to read text file"));
      reader.readAsText(file);
    });
  },

  _readAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = e => reject(new Error("Failed to read file as binary"));
      reader.readAsArrayBuffer(file);
    });
  },

  async _readPdf(file) {
    if (!window.pdfjsLib) {
      throw new Error("PDF.js library not loaded");
    }
    
    const arrayBuffer = await this._readAsArrayBuffer(file);
    const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      fullText += strings.join(' ') + '\n';
    }
    
    return fullText;
  },

  async _readDocx(file) {
    if (!window.mammoth) {
      throw new Error("Mammoth.js library not loaded");
    }
    
    const arrayBuffer = await this._readAsArrayBuffer(file);
    const result = await window.mammoth.extractRawText({ arrayBuffer });
    return result.value;
  },

  async _readExcelOrCsv(file) {
    if (!window.XLSX) {
      throw new Error("SheetJS (xlsx) library not loaded");
    }
    
    const arrayBuffer = await this._readAsArrayBuffer(file);
    const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON (array of objects)
    const rawRows = window.XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    
    return this._mapFlatToNested(rawRows);
  },

  /**
   * Extremely basic heuristic to map flat CSV/Excel rows into something
   * roughly resembling our nested JSON structure so the ranker doesn't crash.
   * JSON remains the highly recommended format for this.
   */
  _mapFlatToNested(rows) {
    return rows.map(row => {
      const candidate = {
        candidate_id: row.id || row.candidate_id || `C_${Math.random().toString(36).substr(2, 9)}`,
        name: row.name || row.Name || 'Unknown',
        title: row.title || row.Title || row.current_title || '',
        summary: row.summary || row.Summary || '',
        total_experience_years: parseFloat(row.total_experience_years || row.Total_Experience || row.years_of_experience || 0),
        skills: [],
        experience: [],
        education: []
      };

      // Extract skills (comma separated)
      const skillsStr = row.skills || row.Skills || '';
      if (skillsStr) {
          candidate.skills = skillsStr.split(',').map(s => ({ name: s.trim(), years: 0, level: 'intermediate' }));
      }

      // If they provided basic role info
      const roleCompany = row.company || row.Company || row.current_company;
      if (roleCompany) {
          candidate.experience.push({
              title: candidate.title,
              company: roleCompany,
              start_date: row.start_date || '2020-01-01',
              end_date: null,
              description: row.experience_description || ''
          });
      }

      return candidate;
    });
  }
};
