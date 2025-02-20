import slugify from 'slugify';
import Blog from '../models/blog.js';
import { errorHandler } from '../helpers/dbErrorHandler.js';
import Tag from '../models/tag.js';


// create a tag
export async function create(req, res) {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Tag name is required." });
    }

    // Generate slug using your custom slugify logic
    const slug = slugify(name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove non-word characters except spaces and hyphens
      .replace(/[\s_-]+/g, '-') // Replace multiple spaces/hyphens/underscores with a single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens

    // Check if tag already exists
    const existingTag = await Tag.findOne({ slug });
    if (existingTag) {
      return res.status(400).json({ error: "Tag already exists." });
    }

    // Create and save new tag
    const tag = new Tag({ name, slug });
    const savedTag = await tag.save();

    res.json(savedTag);

  } catch (err) {
    console.error("TAG CREATION ERROR:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// --------------------------------------------

// to get list of all tags
export async function list(req, res) {
  try {
    // Fetch all tags from the database
    const tags = await Tag.find({});

    res.json(tags); // Return the list of tags as JSON response
  } catch (err) {
    console.error("TAG LIST ERROR:", err);
    return res.status(400).json({ error: errorHandler(err) });
  }
}

// Note: find ({}) -> Empty Parenthiesis/Object == return all the elements/tags


// to get single tag
export async function read(req, res) {
  try {
    const slug = req.params.slug.toLowerCase();

    // Find the tag by slug
    const tag = await Tag.findOne({ slug });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    // Find all blogs that contain this tag
    const blogs = await Blog.find({ tags: tag._id })
      .populate('categories', '_id name slug') // Populate categories
      .populate('tags', '_id name slug') // Populate associated tags
      .populate('postedBy', '_id name username profile') // Populate author details
      .select('_id title slug excerpt categories tags postedBy createdAt updatedAt'); // Select required fields only

    // Respond with the tag details and associated blogs
    res.json({ tag, blogs });

  } catch (err) {
    console.error("TAG READ ERROR:", err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}


// to remove/delete a Tag
export async function remove(req, res) {
  try {
    const slug = req.params.slug.toLowerCase();

    // Find and delete the tag by slug
    const deletedTag = await Tag.findOneAndRemove({ slug });

    if (!deletedTag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json({ message: 'Tag deleted successfully' });

  } catch (err) {
    console.error("TAG DELETE ERROR:", err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

