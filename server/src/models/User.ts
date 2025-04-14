import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true,  },
  password: { type: String, required: true },
  pushToken: { type: String }, 
});

const UserModel = mongoose.model("User", UserSchema);
export default UserModel;


//https://github.com/Galaxies-dev/meetings-react-native-stream