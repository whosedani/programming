module.exports = async (req, res) => {
  const { KV_REST_API_URL, KV_REST_API_TOKEN, ADMIN_HASH } = process.env;

  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET') {
    try {
      if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
        return res.status(200).json({});
      }
      const response = await fetch(`${KV_REST_API_URL}/get/programming_config`, {
        headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
      });
      const data = await response.json();
      const config = data.result ? JSON.parse(data.result) : {};
      return res.status(200).json(config);
    } catch (e) {
      return res.status(200).json({});
    }
  }

  if (req.method === 'POST') {
    try {
      const { hash, ca, twitter, community, buy } = req.body;

      if (!ADMIN_HASH || hash !== ADMIN_HASH) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const config = { ca, twitter, community, buy };

      await fetch(`${KV_REST_API_URL}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${KV_REST_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(['SET', 'programming_config', JSON.stringify(config)])
      });

      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to save config' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};