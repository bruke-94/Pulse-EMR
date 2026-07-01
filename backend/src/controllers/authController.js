const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const env = require("../config/env");
const User = require("../models/userModel");

const registerSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string()
    .valid("admin", "doctor", "nurse", "receptionist")
    .required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  );
}

async function register(req, res, next) {
  try {
    const value = await registerSchema.validateAsync(req.body ?? {}, {
      stripUnknown: true,
    });
    const existing = await User.findByEmail(value.email);

    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(value.password, 12);
    const user = await User.createUser({
      fullName: value.fullName,
      email: value.email,
      passwordHash,
      role: value.role,
    });

    const token = signToken(user);

    return res.status(201).json({ message: "User registered", token, user });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const value = await loginSchema.validateAsync(req.body ?? {}, {
      stripUnknown: true,
    });
    const user = await User.findByEmail(value.email);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordOk = await bcrypt.compare(value.password, user.password_hash);

    if (!passwordOk) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, login };
