import bcrypt from "bcryptjs";

let cachedHash: string | null = null;

function getAdminHash() {
  if (cachedHash) return cachedHash;
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd) return null;
  cachedHash = bcrypt.hashSync(pwd, 10);
  return cachedHash;
}

export function verifyAdminPassword(password: string) {
  const hash = getAdminHash();
  if (!hash) return false;
  return bcrypt.compareSync(password, hash);
}
