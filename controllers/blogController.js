import blogModel from "../models/blogModel.js";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from 'uuid';


// ====== CONFIGURE AWS S3 ======
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_Id,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

const s3 = new AWS.S3();

// ====== CREATE BLOG ======
export const createBlogController = async (req, res, next) => {
  try {
    console.log('req.user:', req.user);

    const { blogtitle, blogdescription } = req.body;
    if (!blogtitle || !blogdescription) {
      return res.status(400).json({ status: false, message: "Please Provide All Fields" });
    }

    const fileName = `blogImage/${uuidv4()}-${blogtitle}`;
    const params = {
      Bucket: process.env.IMAGE,
      Key: fileName,
      Body: req.file.buffer,
    };

    const s3UploadResponse = await s3.upload(params).promise();
    const image = s3UploadResponse.Location;

    const createdBy = req.user.userId;

    const blog = await blogModel.create({
      blogtitle,
      blogdescription,
      image,
      createdBy,
    });

    res.status(201).json({ status: true, message: "Blog created successfully", blog });
  } catch (error) {
    console.error('Error in createBlogController:', error);
    next(error);
  }
};


// ======= GET BLOGS ===========
export const getAllBlogsController = async (req, res, next) => {
  const { status, workType, search, sort } = req.query;

  // Conditions for searching filters
  const queryObject = {
    createdBy: req.user.userId,
  };

  // Add a condition to search by title if the 'search' query parameter is provided
  if (search) {
    queryObject.blogtitle = { $regex: new RegExp(search, 'i') };
  }

  let queryResult = blogModel.find(queryObject);

  // Pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  queryResult = queryResult.skip(skip).limit(limit);

  // Blogs count
  const totalBlogs = await blogModel.countDocuments(queryObject);
  const numOfPage = Math.ceil(totalBlogs / limit);

  const blogs = await queryResult;

  res.status(200).json({
    totalBlogs,
    blogs,
    numOfPage,
  });
};

// ======= UPDATE BLOGS ===========
export const updateBlogController = async (req, res, next) => {
  const { id } = req.params;
  const { blogtitle, blogdescription } = req.body;
  //validation
  if (!blogtitle || !blogdescription) {
    next("Please Provide All Fields");
  }
  //find job
  const blog = await blogModel.findOne({ _id: id });
  //validation
  if (!blog) {
    next(`no blogs found with this id ${id}`);
  }
  if (!req.user.userId === blog.createdBy.toString()) {
    next("Your Not Authorized to update this job");
    return;
  }
  const updateblog = await blogModel.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
    runValidators: true,
  });
  //res
  res.status(200).json({ updateblog });
};

// ======= DELETE BLOGS ===========
export const deleteBlogController = async (req, res, next) => {
  const { id } = req.params;
  //find job
  const blog = await blogModel.findOne({ _id: id });
  //validation
  if (!blog) {
    next(`No Blog Found With This ID ${id}`);
  }
  if (!req.user.userId === blog.createdBy.toString()) {
    next("Your Not Authorize to delete this blog");
    return;
  }
  await blog.deleteOne();
  res.status(200).json({ message: "Success, Blog Deleted!" });
};