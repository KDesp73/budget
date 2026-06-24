import bcrypt from "bcryptjs";

function main() {
  const [cmd, password, hashToVerify] = process.argv.slice(2);

  if (!cmd) {
    console.error("Usage:");
    console.error("  npx tsx scripts/hash-password.ts <password>          generate hash");
    console.error("  npx tsx scripts/hash-password.ts verify <pass> <hash>  verify password");
    process.exit(1);
  }

  if (cmd === "verify") {
    if (!password || !hashToVerify) {
      console.error("Usage: npx tsx scripts/hash-password.ts verify <password> <hash>");
      process.exit(1);
    }
    const match = bcrypt.compareSync(password, hashToVerify);
    console.log(match ? "Password matches" : "Password does NOT match");
    process.exit(match ? 0 : 1);
  }

  const hash = bcrypt.hashSync(cmd, 10);
  console.log(hash);
}

main();
