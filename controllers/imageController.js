const User = require('../models/user'); // to get User profile photo for Compression
const Blog = require('../models/blog'); // to get Blog featured image / photo for Compression



// ------------------------------------------
exports.imageBCompress = (req, res) => {
  res.json({ time: Date().toString() });
}; // Used for testing purpose // Check using: http://localhost:8000/api/img/blog/photo/randomtext
// --------------------------------------------
