import User from '../models/user.js'; // to get User profile photo for Compression
import Blog from '../models/blog.js'; // to get Blog featured image / photo for Compression
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';



// Function to compress profile image
export async function imagePCompress(req, res) {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user || !user.profilePhoto) {
      return res.status(404).json({ error: 'User or profile photo not found' });
    }

    const inputPath = path.join(__dirname, '../uploads', user.profilePhoto);
    const outputPath = path.join(__dirname, '../uploads/compressed', user.profilePhoto);

    await sharp(inputPath)
      .resize(200, 200) // Resize to 200x200 pixels
      .toFormat('jpeg', { quality: 80 }) // Compress to 80% quality
      .toFile(outputPath);

    res.json({ message: 'Profile image compressed successfully', path: outputPath });
  } catch (error) {
    res.status(500).json({ error: 'Error compressing profile image' });
  }
}


// Function to compress blog image
export async function imageBCompress(req, res) {
  try {
    const blogId = req.params.blogId;
    const blog = await Blog.findById(blogId);

    if (!blog || !blog.featuredImage) {
      return res.status(404).json({ error: 'Blog or featured image not found' });
    }

    const inputPath = path.join(__dirname, '../uploads', blog.featuredImage);
    const outputPath = path.join(__dirname, '../uploads/compressed', blog.featuredImage);

    await sharp(inputPath)
      .resize(800, 600) // Resize to 800x600 pixels
      .toFormat('jpeg', { quality: 80 }) // Compress to 80% quality
      .toFile(outputPath);

    res.json({ message: 'Blog image compressed successfully', path: outputPath });
  } catch (error) {
    res.status(500).json({ error: 'Error compressing blog image' });
  }
}
// --------------------------------------------
