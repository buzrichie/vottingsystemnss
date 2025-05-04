let token = "";
export function setToken(data) {
  token = data;
}
export function getToken() {
  return token ? token : null;
}
export function setAdminToken(data) {
  token = data;
}
export function getAdminToken() {
  return token ? token : null;
}
