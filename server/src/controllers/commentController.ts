import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import User from "../models/users";
import Comment from "../models/comments";
import streamifier from "streamifier";
import { cloud as cloudinary } from "../utils/cloudinaryConfig";
import comments from "../models/comments";

export const fetchComments = async (req: Request, res: Response) => {
  var { skip, tweetId } = req.body;
  if (!skip) skip = 0;
  try {
    const comments = await Comment.aggregate([
      { $match: { tweetId: new ObjectId(tweetId) } },
      { $sort: { createdAt: -1 } },
      { $skip: skip * 10 },
      { $limit: 10 },
      {
        $lookup: {
          from: "comments",
          let: { commentid: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$commentId", "$$commentid"] } } },
            { $group: { _id: null, count: { $sum: 1 } } },
            { $project: { _id: 0, count: 1 } },
          ],
          as: "count",
        },
      },
      { $addFields: { replyCount: "$count.count" } },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $project: {
          "author.username": 1,
          "author.profilePic": 1,
          comment: 1,
          likes: {
            $cond: {
              if: { $isArray: "$likes" },
              then: { $size: "$likes" },
              else: 0,
            },
          },
          createdAt: 1,
          replyCount: 1,
        },
      },
    ]);
    res.status(200).json({ data: { comments: comments } });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const fetchReplies = async (req: Request, res: Response) => {
  var { skip, commentId } = req.body;
  if (!skip) skip = 0;

  try {
    const replies = await Comment.find(
      { commentId: commentId },
      {
        _id: 0,
        author: 1,
        comment: 1,
        likes: {
          $cond: {
            if: { $isArray: "$likes" },
            then: { $size: "$likes" },
            else: 0,
          },
        },
        createdAt: 1,
      }
    )
      .sort({ createdAt: -1 })
      .skip(skip * 10)
      .limit(10)
      .populate({
        path: "author",
        select: { _id: 0, username: 1, profilePic: 1 },
      });
    res.status(200).json({ data: replies });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const createComment = async (req: Request, res: Response) => {
  const { id, comment, tweetId } = req.body;
  const file = req.file;

  try {
    const user = await User.findById(id);
    const newComment = await Comment.create({
      author: id,
      tweetId: tweetId,
      comment: comment,
    });
    if (file) {
      const upload_stream = cloudinary.uploader.upload_stream(
        {
          folder: "commentMedia",
          public_id: `${newComment._id}`,
          overwrite: true,
        },
        async (err, result) => {
          if (err) res.status(400).json({ error: err });
          else if (result) {
            const updatedComment = await Comment.findByIdAndUpdate(
              newComment._id,
              { $set: { media: result.secure_url } }
            );
            res.status(200).json({
              data: updatedComment,
              message: "Comment created sucessfully",
            });
          }
        }
      );
      streamifier.createReadStream(file.buffer).pipe(upload_stream);
    } else {
      res.status(200).json({
        data: newComment,
        message: "Comment created sucessfully",
      });
    }
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const createReply = async (req: Request, res: Response) => {
  const { id, comment, commentId } = req.body;
  const file = req.file;

  try {
    const user = await User.findById(id);
    const newReply = await Comment.create({
      author: id,
      commentId: commentId,
      comment: comment,
    });
    if (file) {
      const upload_stream = cloudinary.uploader.upload_stream(
        {
          folder: "commentMedia",
          public_id: `${newReply._id}`,
          overwrite: true,
        },
        async (err, result) => {
          if (err) res.status(400).json({ error: err });
          else if (result) {
            const updatedReply = await Comment.findByIdAndUpdate(newReply._id, {
              $set: { media: result.secure_url },
            });
            res.status(200).json({
              data: updatedReply,
              message: "Comment created sucessfully",
            });
          }
        }
      );
      streamifier.createReadStream(file.buffer).pipe(upload_stream);
    } else {
      res.status(200).json({
        data: newReply,
        message: "Comment created sucessfully",
      });
    }
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const likeComment = async (req: Request, res: Response) => {
  const { id, commentId } = req.body;

  try {
    const user = await User.findById(id);
    const comment = await Comment.findById(commentId);
    if (!comment?.likes?.includes(id)) {
      const updatedComment = await Comment.findByIdAndUpdate(id, {
        $inc: { likes: 1 },
      });
      res.status(200).json({ message: "Comment liked successfully" });
    } else {
      const updatedComment = await Comment.findByIdAndUpdate(id, {
        $dec: { likes: 1 },
      });
      res.status(200).json({ message: "Comment unliked successfully" });
    }
  } catch (err) {
    res.status(400).json({ error: err });
  }
};
