const rawValue = '9793,60';
const regex = /^[0-9,.\s]+$/;

console.log('Teste 1 - rawValue:', rawValue);
console.log('Teste 2 - regex.test(rawValue):', regex.test(rawValue));
console.log('Teste 3 - condição bloqueadora:', rawValue !== '' && !regex.test(rawValue));
console.log('');
console.log('Se condição = true, bloqueia input');
console.log('Se condição = false, permite input');
