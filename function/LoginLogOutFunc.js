import AsyncStorage from '@react-native-async-storage/async-storage';

const logOutUser = func => {
  global.loginUser = undefined;
  AsyncStorage.removeItem('loginState');
  if (func) {
    func();
  }
};
const loginUser = (userId, func) => {
  global.loginUser = userId;
  AsyncStorage.setItem('loginState', userId);
  if (func) {
    func();
  }
};
const LoginLogOut = {
  logout: logOutUser,
  login: loginUser,
};
export default LoginLogOut;
