import { createCustomError } from "../errors/custom-error.js";
import asyncWrapper from "../middlewares/asyncWapper.js";
import User from "../models/UserModel.js";

export const searchContacts = asyncWrapper(async (req, res, next) => {
  console.log(req.body)
  const { searchTerm } = req.body;

  if (searchTerm === undefined || searchTerm === null) {
    return next(createCustomError("searchTerm is required.", 400));
  }

  const sanitizedSearchTerm = searchTerm.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const regex = new RegExp(sanitizedSearchTerm, "i");

  const contacts = await User.find({
    $and: [
      { _id: { $ne: req.user.userId } },
      {
        $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
      },
    ],
  });

  return res.status(200).json({contacts});
})
 