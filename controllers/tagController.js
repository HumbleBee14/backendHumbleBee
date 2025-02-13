import slugify from 'slugify';
import Blog from '../models/blog.js';
import { errorHandler } from '../helpers/dbErrorHandler.js';
import Tag from '../models/tag.js';


// create a tag
export function create(req, res) {
  const { name } = req.body;
  let slug = slugify(name)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  let tag = new Tag({ name, slug });

  tag.save((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    }
    res.json(data); // Don't do this - res.json({tag: data})
  });
}

// to get list of all tags
export function list(req, res) {

  Tag.find({}).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    }
    res.json(data);
  });
}
// Note: find ({}) -> Empty Parenthiesis/Object == return all the elements/tags


// to get single tag
export function read(req, res) {
  // const slug = req.params.tagName
  const slug = req.params.slug.toLowerCase();

  Tag.findOne({ slug }).exec((err, tag) => {
    if (err) {
      return res.stataus(400).json({
        error: errorHandler(err)
      });
    }
    // res.json(tag);   // this response is now send below alongwith Blogs having same tag 

    // Find all the blogs based on this Tag (Tag objectID)(checking 'tags' field/column for the selected Blog's tag in the Blog Model and return the blogs with same tag)

    // Look for the selected 'tag' objectID inside the Blogs 'tags' field column & grab those blogs having same tag
    Blog.find({ tags: tag })
      .populate('categories', '_id name slug')
      .populate('tags', '_id name slug')
      .populate('postedBy', '_id name username profile')
      .select('_id title slug excerpt categories tags postedBy createdAt updatedAt')
      .exec((err, data) => {
        if (err) {
          return res.stataus(400).json({
            error: errorHandler(err)
          });
        }

        res.json({ tag: tag, blogs: data }); // sending the json response with the results (list of blogs having same tag & the tag object itself)
      });
  });
}


// to remove/delete a Tag
export function remove(req, res) {
  // const slug = req.params.tagName
  const slug = req.params.slug.toLowerCase();

  Tag.findOneAndRemove({ slug }).exec((err, data) => {
    if (err) {
      return res.stataus(400).json({
        error: errorHandler(err)
      });
    }
    res.json({
      message: 'Tag deleted sucessfully'
    });
  });
}
