export default async function handler(req, res) {
    // Solo permitir POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { targetUrl, ...payload } = req.body;

    if (!targetUrl) {
        return res.status(400).json({ error: 'Missing targetUrl in body' });
    }

    try {
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({
            error: 'Proxy error',
            message: error.message || 'Error connecting to endpoint'
        });
    }
}
