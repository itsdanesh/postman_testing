const crypto = require('crypto');
const secretJWTKey = crypto.randomBytes(32).toString('hex');
const verifyJWT = (req, res, next) => {
    // 1. Get the token from the request header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  
    const token = authHeader.split(' ')[1]; // Assuming 'Bearer' token format
  
    // 2. Verify the token using JWT
    jwt.verify(token, secretJWTKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
  
      // 3. If token is valid, attach decoded user data to the request object
      req.customer = decoded.customer; 
  
      // 4. Move on to the next middleware or route handler
      next();
    });
  };
module.exports = secretJWTKey;
