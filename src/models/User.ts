import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    default: function () {
      const t = this as any;
      return t.name;
    },
  },
  provider: {
    type: String,
    requried: true,
  },
  providerAccountID: {
    type: String,
    required: true,
  },
  authID: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    default: "",
  },
  profilePicture: {
    type: Buffer,
  },
  profilePictureLink: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "",
  },
  mobile: {
    type: String,
    default: "",
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("user", UserSchema, "users");

export default User;
