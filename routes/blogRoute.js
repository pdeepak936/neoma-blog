import express from "express";
import multer from 'multer';
import {
  createBlogController,
  deleteBlogController,
  getAllBlogsController,
  updateBlogController,
} from "../controllers/blogController.js";
import userAuth from "../middelwares/authMiddleware.js";
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

//routes
router.post("/create-blog", userAuth, upload.single('blogImage'), createBlogController);
router.get("/get-blog", userAuth, getAllBlogsController);
router.patch("/update-blog/:id", userAuth, updateBlogController);
router.delete("/delete-blog/:id", userAuth, deleteBlogController);

export default router;
