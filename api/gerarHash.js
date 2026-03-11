const bcrypt = require("bcrypt");

const senha = "NUtri@Dicas1396";

bcrypt.hash(senha, 10).then(hash => {
  console.log(hash);
});