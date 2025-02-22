import slugify from 'slugify';
import Blog from '../models/blog.js';
import { errorHandler } from '../helpers/dbErrorHandler.js';
import Category from '../models/category.js';

// create a category
export async function create(req, res) {
  try {
    const { name } = req.body;

    // Validate input: Ensure the category name is not empty
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Category name is required." });
    }

    // Generate slug using your custom slugify logic
    const slug = slugify(name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove non-word characters except spaces and hyphens
      .replace(/[\s_-]+/g, '-') // Replace multiple spaces/hyphens/underscores with a single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens

    // Check if category already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({ error: "Category already exists." });
    }

    // Create and save new category
    const category = new Category({ name, slug });
    const savedCategory = await category.save();

    res.json(savedCategory);

  } catch (err) {
    console.error("CATEGORY CREATION ERROR:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// ----------------------------------------------

// to get list of all the categories
export async function list(req, res) {
  try {
    // Fetch all categories from the database
    const categories = await Category.find({});

    res.json(categories);
  } catch (err) {
    console.error("CATEGORY LIST ERROR:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}


// Note: find ({}) -> Empty Parenthiesis/Object == return all the elements/categories


// to get single category   (& return all the blogs with that category)
export async function read(req, res) {
  try {
    const slug = req.params.slug.toLowerCase();

    // Find the category by slug
    const category = await Category.findOne({ slug });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Find all blogs that belong to this category
    const blogs = await Blog.find({ categories: category._id }) // Match category by ID
      .populate('categories', '_id name slug') // Populate categories field
      .populate('tags', '_id name slug') // Populate tags field
      .populate('postedBy', '_id name username profile') // Populate author details
      .select('_id title slug excerpt categories tags postedBy createdAt updatedAt'); // Select necessary fields

    // Respond with category details and associated blogs
    res.json({ category, blogs });

  } catch (err) {
    console.error("CATEGORY READ ERROR:", err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}


// to remove/delete a category
export async function remove(req, res) {
  try {
    const slug = req.params.slug.toLowerCase();

    // Find and delete the category by slug
    const deletedCategory = await Category.findOneAndDelete({ slug });

    if (!deletedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });

  } catch (err) {
    console.error("CATEGORY DELETE ERROR:", err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}






