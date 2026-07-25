import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Extract document data using OpenAI Vision
export async function extractDocumentData(fileBuffer, documentType) {
  try {
    console.log(`📄 Extracting ${documentType} using OpenAI Vision...`);

    // Convert buffer to base64
    const base64Image = fileBuffer.toString('base64');
    const imageMediaType = 'image/jpeg'; // Assume JPEG, can be dynamic

    // Create message with vision capability
    const message = await openai.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: imageMediaType,
                data: base64Image
              }
            },
            {
              type: 'text',
              text: getExtractionPrompt(documentType)
            }
          ]
        }
      ]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log('✅ OpenAI Vision response:', responseText);

    // Parse extracted data
    const result = parseExtractedData(responseText, documentType);
    console.log('✅ Parsed result:', result);

    return result;
  } catch (error) {
    console.error('❌ Extraction error:', error.message);
    throw error;
  }
}

// Get appropriate extraction prompt based on document type
function getExtractionPrompt(documentType) {
  if (documentType === 'PAN') {
    return `Extract the following information from this PAN (Permanent Account Number) card image:
1. PAN Number (format: AAAAA9999A)
2. Name of the account holder
3. Date of Birth
Return the data in JSON format like: {"pan": "XXXXX9999X", "name": "Name", "dob": "DD/MM/YYYY"}`;
  } else if (documentType === 'Aadhaar') {
    return `Extract the following information from this Aadhaar card image:
1. Aadhaar Number (12 digits)
2. Name of the person
3. Date of Birth
4. Gender
Return the data in JSON format like: {"aadhaar": "XXXXXXXXXXXX", "name": "Name", "dob": "DD/MM/YYYY", "gender": "M/F"}`;
  } else if (documentType === 'Passport') {
    return `Extract the following information from this Passport image:
1. Passport Number
2. Name
3. Date of Birth
4. Issue Date
5. Expiry Date
Return the data in JSON format`;
  } else {
    return `Extract all readable text and key information from this document. Return as JSON.`;
  }
}

// Parse JSON response from OpenAI
function parseExtractedData(responseText, documentType) {
  try {
    // Try to extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        documentType: documentType,
        ...parsed,
        confidence: 'high',
        extractedText: responseText.substring(0, 200)
      };
    }

    // Fallback if no JSON found
    return {
      documentType: documentType,
      confidence: 'medium',
      extractedText: responseText,
      rawResponse: responseText
    };
  } catch (error) {
    console.warn('⚠️ Parse error:', error.message);
    return {
      documentType: documentType,
      confidence: 'low',
      extractedText: responseText,
      error: 'Could not parse response'
    };
  }
}
