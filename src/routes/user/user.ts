import express from "express";
import dotenv from "dotenv";
import User from "../../models/User";
import ProfilePicture from "../../azure/profile-pictures/profile-pictures";

const router = express.Router();

const backendRoutes = {
  createUser: "/create-user",
  updateUser: "/update-user",
  getUser: "/get-user",
  deleteUser: "/delete-user/",
};

//* Create User
router.post(backendRoutes.createUser, async (req, res) => {
  const userDetails = req.body;

  try {
    const response = await User.findOne({ authID: userDetails.authID });
    if (response) {
      res.status(400).send({ success: true, message: "User already exists." });
      return;
    }

    let newProfilePictureLink = "";
    if (userDetails.profilePictureLink) {
      newProfilePictureLink = await ProfilePicture.uploadImageFromLink(
        userDetails.authID,
        userDetails.profilePictureLink
      );
    }

    const newUser = await User.create({
      ...userDetails,
      profilePictureLink:
        newProfilePictureLink ?? userDetails.profilePictureLink,
    });
    res.status(200).send({ success: true, data: newUser });
    return;
  } catch (errors) {
    console.error(errors);
    res.status(400).send({ success: false, errors: errors });
    return;
  }
});

//* Get User
router.post(backendRoutes.getUser, async (req, res) => {
  const authID = req.body.authID;

  try {
    const response = await User.findOne({ authID: authID });
    if (!response) {
      res.status(400).send({ success: false, message: "User does not exist." });
      return;
    }

    res.status(200).send({ success: true, data: response });
    return;
  } catch (errors) {
    console.error(errors);
    res.status(400).send({ success: false, errors: errors });
    return;
  }
});

//* Update User
router.patch(backendRoutes.updateUser, async (req, res) => {
  const { profilePictureData, ...userDetails } = req.body;
  let profilePictureResponse = "";

  try {
    const user = await User.findOne({ authID: userDetails.authID });
    if (!user) {
      res.status(400).send({ success: false, message: "User does not exist." });
      return;
    }
    
    if (profilePictureData) {
      const profilePictureBuffer = Buffer.from(
        profilePictureData.split(",")[1],
        "base64"
      );
      profilePictureResponse = await ProfilePicture.replaceImage(
        userDetails.authID,
        user.profilePictureLink,
        profilePictureBuffer
      );
    }

    const response = await User.findOneAndUpdate(
      { authID: userDetails.authID },
      {
        ...userDetails,
        profilePictureLink: profilePictureResponse
          ? profilePictureResponse
          : undefined,
      },
      { new: true }
    );
    if (!response) {
      res.status(400).send({ success: false, message: "User does not exist." });
      return;
    }
    const updatedUser = response;
    res.status(200).send({ success: true, data: updatedUser });
    return;
  } catch (errors) {
    console.error(errors);
    res.status(400).send({ success: false, errors: errors });
    return;
  }
});

//* Delete User
router.delete(backendRoutes.createUser, async (req, res) => {
  const authID = req.body.authID;

  try {
    const user = await User.findOne({ authID: authID });
    if (!user) {
      res.status(400).send({ success: false, message: "User does not exist." });
      return;
    }

    await ProfilePicture.deleteImage(user.profilePictureLink);

    const response = await User.findOneAndDelete({ authID: authID });
    const deletedUser = response;
    res.status(200).send({ success: true, data: deletedUser });
    return;
  } catch (errors) {
    console.error(errors);
    res.status(400).send({ success: false, errors: errors });
    return;
  }
});

module.exports = router;
