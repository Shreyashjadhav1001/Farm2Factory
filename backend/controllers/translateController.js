const https = require('https');

const cache = {};

const NLLB_LANG_MAP = {
  'hi': 'hin_Deva',
  'mr': 'mar_Deva',
  'kn': 'kan_Knda',
  'te': 'tel_Telu',
  'ta': 'tam_Taml',
  'gu': 'guj_Gujr',
  'pa': 'pan_Guru',
  'bn': 'ben_Beng',
  'or': 'ory_Orya'
};

function callHuggingFace(text, tgtLang) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      inputs: text,
      parameters: {
        src_lang: 'eng_Latn',
        tgt_lang: tgtLang
      }
    });

    const options = {
      hostname: 'api-inference.huggingface.co',
      path: '/models/facebook/nllb-200-distilled-600M',
      method: 'POST',
      headers: {
        'Authorization': `Bearer HF_API_KEY_REMOVED`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(parsed.error));
          } else {
            resolve(parsed[0]?.translation_text || text);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(20000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(body);
    req.end();
  });
}

const translateText = async (req, res) => {
  const { text, targetLang } = req.body;

  if (!text || !targetLang || targetLang === 'en') {
    return res.json({ translatedText: text });
  }

  const tgtLang = NLLB_LANG_MAP[targetLang];
  if (!tgtLang) {
    console.log(`[TRANSLATE] Unsupported lang: ${targetLang}`);
    return res.json({ translatedText: text });
  }

  const cacheKey = `${text}__${targetLang}`;
  if (cache[cacheKey]) {
    console.log(`[TRANSLATE] Cache hit: "${text}"`);
    return res.json({ translatedText: cache[cacheKey] });
  }

  try {
    console.log(`[TRANSLATE] Calling HF: "${text}" -> ${tgtLang}`);
    const translated = await callHuggingFace(text, tgtLang);
    console.log(`[TRANSLATE] Success: "${translated}"`);
    cache[cacheKey] = translated;
    return res.json({ translatedText: translated });
  } catch (err) {
    console.error(`[TRANSLATE] Error: ${err.message}`);
    return res.json({ translatedText: text });
  }
};

module.exports = { translateText };
