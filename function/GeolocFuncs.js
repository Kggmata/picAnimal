import Geolocation from '@react-native-community/geolocation';

const geolocDict = {
  getOneTimeCurrentLocation: (successFunc, errorFunc) => {
    Geolocation.getCurrentPosition(
      res => {
        successFunc(res);
      },
      error => errorFunc(error),
      {enableHighAccuracy: false},
    );
  },
};
export default geolocDict;
