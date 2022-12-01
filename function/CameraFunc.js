import Platform from 'react-native/Libraries/Utilities/Platform';
import {PermissionsAndroid} from 'react-native';

const requestCameraPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'App needs camera permission',
      },
    );
    // If CAMERA Permission is granted
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    return false;
  }
};
const requestExternalWritePermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'External Storage Write Permission',
        message: 'App needs write permission',
      },
    );
    // If WRITE_EXTERNAL_STORAGE Permission is granted
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    alert('Write permission err', err);
  }
  return false;
};
const OpenCamera = async changeCameraState => {
  if (Platform.OS === 'android') {
    if (await cameraFuncs.requestCameraPermission()) {
      if (await cameraFuncs.requestExternalWritePermission()) {
        if (await cameraFuncs.requestExternalReadPermission()) {
          changeCameraState(true);
        } else {
          alert('READ_EXTERNAL_STORAGE permission denied');
        }
      } else {
        alert('WRITE_EXTERNAL_STORAGE permission denied');
      }
    } else {
      alert('CAMERA permission denied');
    }
  } else {
    changeCameraState(true);
  }
};
const requestExternalReadPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: 'Read Storage Permission',
        message: 'App needs Read Storage Permission',
      },
    );
    // If READ_EXTERNAL_STORAGE Permission is granted
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    alert('Read permission err', err);
  }
  return false;
};
const cameraFuncs = {
  requestCameraPermission: requestCameraPermission,
  requestExternalReadPermission: requestExternalReadPermission,
  requestExternalWritePermission: requestExternalWritePermission,
  openCamera: OpenCamera,
};
export default cameraFuncs;
