import { TextractClient, DetectDocumentTextCommand, AnalyzeDocumentCommand, TextractClientConfig } from '@aws-sdk/client-textract';

// Initialize AWS Textract
const config = {
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
};

const textractClient = new TextractClient(config);

// Extract text from document
export async function extractTextFromDocument(fileBuffer) {
  try {
    const command = new DetectDocumentTextCommand({
      Document: {
        Bytes: fileBuffer
      }
    });

    const response = await textractClient.send(command);

    let fullText = '';
    response.Blocks.forEach(block => {
      if (block.BlockType === 'LINE') {
        fullText += block.Text + '\n';
      }
    });

    return fullText;
  } catch (error) {
    console.error('❌ Textract error:', error.message);
    throw error;
  }
}

// Extract PAN from text
export function extractPAN(text) {
  // PAN format: AAAAA9999A (5 letters, 4 digits, 1 letter)
  const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/g;
  const matches = text.match(panRegex);
  return matches ? matches[0] : null;
}

// Extract Aadhaar from text
export function extractAadhaar(text) {
  // Aadhaar format: 12 digits (often with spaces: XXXX XXXX XXXX)
  const aadhaarRegex = /\d{4}\s?\d{4}\s?\d{4}/g;
  const matches = text.match(aadhaarRegex);
  if (matches) {
    // Remove spaces and return
    return matches[0].replace(/\s/g, '');
  }
  return null;
}

// Extract name (usually first line with letters)
export function extractName(text) {
  const lines = text.split('\n');
  for (const line of lines) {
    const cleaned = line.trim();
    // Look for lines with mostly letters and spaces
    if (cleaned.length > 3 && /^[A-Z\s]+$/.test(cleaned)) {
      return cleaned;
    }
  }
  return null;
}

// Main extraction function
export async function extractDocumentData(fileBuffer, documentType) {
  try {
    console.log(`📄 Extracting ${documentType} data...`);

    // Extract text using AWS Textract
    const extractedText = await extractTextFromDocument(fileBuffer);
    console.log('✅ Text extracted from document');

    const result = {
      documentType: documentType,
      extractedText: extractedText.substring(0, 500) // First 500 chars for reference
    };

    if (documentType === 'PAN') {
      const pan = extractPAN(extractedText);
      const name = extractName(extractedText);
      result.pan = pan;
      result.name = name;
      result.confidence = pan ? 'high' : 'low';
    } else if (documentType === 'Aadhaar') {
      const aadhaar = extractAadhaar(extractedText);
      const name = extractName(extractedText);
      result.aadhaar = aadhaar;
      result.name = name;
      result.confidence = aadhaar ? 'high' : 'low';
    }

    console.log('✅ Document data extracted:', result);
    return result;
  } catch (error) {
    console.error('❌ Extraction error:', error.message);
    throw error;
  }
}
