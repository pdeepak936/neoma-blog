import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    blogtitle: {
      type: String,
      requied: [true, "Blog Title is require"],
    },
    blogdescription: {
      type: String,
      required: [true, "Blog Description is required"],
      maxlength: 500,
    },
    image: {
      type: String,
      requied: [true, "Blog Title is require"],
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "Users",
    },
  },
  { timestamps: true }
);

export default mongoose.model("blog", blogSchema);
