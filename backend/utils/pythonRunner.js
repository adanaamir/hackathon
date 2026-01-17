const { spawn } = require('child_process');
const path = require('path');

/**
 * Execute a Python script and return the result
 * @param {string} scriptName - Name of the Python script (without .py extension)
 * @param {Array} args - Arguments to pass to the script
 * @returns {Promise<Object>} - Parsed JSON output from Python script
 */
const runPythonScript = (scriptName, args = []) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '..', 'python', `${scriptName}.py`);

        // Spawn Python process
        const pythonProcess = spawn('python', [scriptPath, ...args]);

        let stdout = '';
        let stderr = '';

        // Collect stdout
        pythonProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        // Collect stderr
        pythonProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        // Handle process completion
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script ${scriptName} error:`, stderr);
                return reject(new Error(`Python script failed with code ${code}: ${stderr}`));
            }

            try {
                // Parse JSON output
                const result = JSON.parse(stdout);
                resolve(result);
            } catch (error) {
                console.error(`Failed to parse Python output from ${scriptName}:`, stdout);
                reject(new Error(`Invalid JSON output from Python script: ${error.message}`));
            }
        });

        // Handle process errors
        pythonProcess.on('error', (error) => {
            console.error(`Failed to start Python process for ${scriptName}:`, error);
            reject(new Error(`Failed to execute Python script: ${error.message}`));
        });
    });
};

/**
 * Run all speech analysis scripts in parallel
 * @param {string} audioFilePath - Path to the audio file
 * @param {string} transcription - Text transcription of the speech
 * @returns {Promise<Object>} - Combined analysis results
 */
const runFullAnalysis = async (audioFilePath, transcription) => {
    try {
        // Run all analyses in parallel
        const [fluencyResult, paceResult, toneResult, confidenceResult] = await Promise.all([
            runPythonScript('fluency_analysis', [transcription]),
            runPythonScript('pace_analysis', [audioFilePath, transcription]),
            runPythonScript('tone_analysis', [audioFilePath]),
            runPythonScript('confidence_analysis', [audioFilePath, transcription])
        ]);

        // Calculate overall score (weighted average)
        const overallScore = Math.round(
            (fluencyResult.score * 0.25) +
            (paceResult.score * 0.25) +
            (toneResult.score * 0.25) +
            (confidenceResult.score * 0.25)
        );

        return {
            fluency: fluencyResult,
            pace: paceResult,
            tone: toneResult,
            confidence: confidenceResult,
            overallScore
        };
    } catch (error) {
        throw new Error(`Analysis failed: ${error.message}`);
    }
};

module.exports = { runPythonScript, runFullAnalysis };
