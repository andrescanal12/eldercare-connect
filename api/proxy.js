export default async function handler(req, res) {
    // CORS headers para preflight
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { targetUrl, ...payload } = req.body || {};

        if (!targetUrl) {
            return res.status(400).json({ error: 'Missing targetUrl', body: req.body });
        }

        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload),
        });

        // Intentar parsear como JSON, si falla devolver texto
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = { result: 'success', raw: text };
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({
            error: 'Proxy error',
            message: error.message || 'Error connecting to endpoint',
        });
    }
}
