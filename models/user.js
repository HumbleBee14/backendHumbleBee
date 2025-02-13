import mongoose, { model } from 'mongoose';
import { createHmac } from 'crypto'; // to hash the password

const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    trim: true,
    required: true,
    maxLength: 32,
    unique: true,
    index: true,
    lowercase: true
  },

  name: {
    type: String,
    trim: true,
    required: true,
    maxLength: 32
  },

  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    lowercase: true
  },

  profile: {
    type: String,
    required: true,
    lowercase: true
  },

  hashed_password: {
    type: String,
    required: true
  },

  salt: String,

  about: {
    type: String
  },

  role: {
    type: Number,
    default: 0
  },

  photo: {
    data: Buffer,
    contentType: String
  },

  resetPasswordLink: {
    type: String,
    default: ''
  }

}, { timestamps: true }
);




userSchema.virtual('password')
  .set(function (password) {
    // Create a temporary variable called _password   (non-persistant virtual field )
    this._password = password;

    // generate salt  (will be used for hashing algo.)
    this.salt = this.makeSalt();

    // encryptPassword
    this.hashed_password = this.encryptPassword(password);
  })

  .get(function () {
    return this._password;
  });


userSchema.methods = {
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },


  encryptPassword: function (password) {
    if (!password) return '';
    try {
      return createHmac('sha1', this.salt)
        .update(password)
        .digest('hex');

      // Note: Use Stronger Hashing algorithm currently in use
    } catch (err) {
      return '';
    }
  },

  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + '';
  }
};

export default model('User', userSchema);




/*
What is this SALT , MakeSalt ?   salt hash passwords
Salt hashing is a technique in which we take the user entered password and a random string of characters called as salt, hash the combined string with a sutaible hashing algorithm and store the result in the database.
Salt = String of random characters
https://ciphertrick.com/salt-hash-passwords-using-nodejs-crypto/
*/