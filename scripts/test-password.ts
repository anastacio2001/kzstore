import bcrypt from 'bcryptjs';

const password = 'bXuceyZtApYa';
const hash = '$2b$10$rm0CPiuj0zJ35IUsqDfgt.rUdthWSiE3s.cRaZ6OFgg7afCxy3RAq';

bcrypt.compare(password, hash).then(result => {
  console.log('Senha válida?', result);
});
