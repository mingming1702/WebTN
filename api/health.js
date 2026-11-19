module.exports = (req, res) => {
  res.status(200).json({
    ok: true,
    service: 'web-trac-nghiem-tieng-viet',
    timestamp: new Date().toISOString()
  });
};
