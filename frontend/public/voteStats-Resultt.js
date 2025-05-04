// class name {}
//     constructor(parameters) {
let result = null;
let stats = null;

export function setResult(data) {
  result = data;
}
export function getResult() {
  return result ? result : null;
}
export function setStats(data) {
  stats = data;
}
export function getStats() {
  return stats ? stats : null;
}

//     }
// }
