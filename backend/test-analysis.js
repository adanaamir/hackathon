const { runPythonScript, runFullAnalysis } = require('./utils/pythonRunner');
const path = require('path');

async function testAnalysis() {
    try {
        // Use one of the uploaded files
        const audioFile = path.join(__dirname, 'uploads', '1768752191312-607397b6-be6f-4ce9-85ea-b880a760b3c1-WhatsApp_Audio_2026-01-18_at_8.09.02_PM.mp4');
        
        console.log('Testing speech-to-text...');
        const transcriptionResult = await runPythonScript('speech_to_text', [audioFile]);
        console.log('Transcription result:', transcriptionResult);
        
        if (!transcriptionResult.success) {
            console.error('Transcription failed:', transcriptionResult.error);
            return;
        }
        
        const transcription = transcriptionResult.transcription;
        console.log('\nTranscription:', transcription);
        
        console.log('\nTesting full analysis...');
        const analysisResults = await runFullAnalysis(audioFile, transcription);
        console.log('Analysis results:', JSON.stringify(analysisResults, null, 2));
        
        console.log('\n✅ Analysis completed successfully!');
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

testAnalysis();
