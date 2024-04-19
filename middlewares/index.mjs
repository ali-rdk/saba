import jwt from "jsonwebtoken";

export const SchemaValidator = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.validate({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      return res.status(400).json(error);
    }
  };
};

export const tokenValidator = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const accessToken = authHeader.split(" ")[1];
  jwt.verify(accessToken, process.env.ACCESS_SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ message: "شما مجور ندارید" });
    req.user = decoded;
    next();
  });
};

export const roleValidator = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role)
      return res.status(401).json({ unauthorized: "شما مجوز ندارید" });
    next();
  };
};
