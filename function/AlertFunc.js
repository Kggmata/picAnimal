import {Alert} from 'react-native';
import alertConfig from '../constant/Alert_config';
import constantDict from '../constant/Constant';

const AlertFunc = (
  title,
  message,
  okText,
  cancelable,
  onPress,
  cancelText,
  onPressCancel,
) => {
  Alert.alert(
    title,
    message,
    [
      cancelText
        ? {
            text: cancelText,
            onPress: onPressCancel ? onPressCancel : undefined,
          }
        : null,
      {
        text: okText,
        onPress: onPress ? onPress : undefined,
      },
    ],
    {cancelable: cancelable},
  );
};
const Alerts = {
  alertFunc: AlertFunc,
  serviceCurrentlyUnavailableAlert: () => {
    AlertFunc(
      alertConfig.alertFail,
      alertConfig.serviceCurrentlyUnavailable,
      'Ok',
      false,
    );
  },
  passwordIncorrectAlert: () => {
    AlertFunc(
      alertConfig.alertFail,
      alertConfig.passwordIncorrect,
      'Ok',
      false,
    );
  },
  loginSuccessfullyAlert: (navigation, target) => {
    AlertFunc(
      alertConfig.alertSuccess,
      alertConfig.loginSuccessfully,
      alertConfig.ok,
      false,
      () => navigation.navigate(target),
    );
  },
  logoutSuccessfullyAlert: (navigation, target) => {
    AlertFunc(
      alertConfig.alertSuccess,
      alertConfig.logoutSuccessfully,
      alertConfig.ok,
      false,
      () => navigation.navigate(target),
    );
  },
  registerSuccessfullyAlert: (navigation, target) => {
    AlertFunc(
      alertConfig.alertSuccess,
      alertConfig.signupSuccessfully,
      alertConfig.ok,
      false,
      () => navigation.navigate(target),
    );
  },
  userNotFoundAlert: () => {
    AlertFunc(
      alertConfig.alertFail,
      alertConfig.userNotFound,
      alertConfig.ok,
      false,
    );
  },
  userAlreadyExistsAlert: () => {
    AlertFunc(
      alertConfig.alertFail,
      alertConfig.userAlreadyExists,
      alertConfig.ok,
      false,
    );
  },
  pleaseEnterUserNameAlert: () => {
    AlertFunc(
      alertConfig.alertFail,
      alertConfig.pleaseEnterUserName,
      alertConfig.ok,
      false,
    );
  },
  imageUploadSuccessfullyAlert: func => {
    AlertFunc(
      alertConfig.alertSuccess,
      alertConfig.imageUploadSuccessfully,
      alertConfig.ok,
      false,
      func ? func : null,
    );
  },
  imageCannotRecognizeAlert: (navigation, routePara) => {
    AlertFunc(
      alertConfig.alertFail,
      alertConfig.imageCannotRecognize,
      alertConfig.ok,
      false,
      () => navigation.navigate('CreateJournalLog', routePara),
    );
  },
  journalLogCreatedAlert: () => {
    AlertFunc(
      alertConfig.alertFail,
      alertConfig.journalLogCreated,
      alertConfig.ok,
      false,
    );
  },
  logOutConfirmationAlert: (navigation, target, thenFunc) => {
    AlertFunc(
      alertConfig.alertFail,
      alertConfig.logOutConfirmation,
      alertConfig.ok,
      true,
      () => navigation.navigate(target),
      alertConfig.cancel,
    );
    thenFunc();
  },
  iconUploadSuccessfullyAlert: () => {
    AlertFunc(
      alertConfig.alertSuccess,
      alertConfig.iconUploadSuccessfully,
      alertConfig.ok,
      false,
    );
  },
  alreadyLoginAlert: () => {
    AlertFunc(
      alertConfig.alertFail,
      alertConfig.alreadyLogin,
      alertConfig.ok,
      false,
    );
  },
  baiduApiAlert: error => {
    AlertFunc(
      alertConfig.alertFail,
      alertConfig.baiduApiError + error ? '\n' + error : null,
      alertConfig.ok,
      false,
    );
  },
  baiduTranslateApiAlert: error => {
    AlertFunc(
      alertConfig.alertFail,
      alertConfig.baiduTranslateApiError + error ? '\n' + error : null,
      alertConfig.ok,
      false,
    );
  },
  googleVisionApiAlert: error => {
    AlertFunc(
      alertConfig.alertFail,
      alertConfig.googleVisionApiError + error ? '\n' + error : null,
      alertConfig.ok,
      false,
    );
  },
  flickrApiAlert: error => {
    AlertFunc(
      alertConfig.alertFail,
      alertConfig.flickrApiError + error ? '\n' + error : null,
      alertConfig.ok,
      false,
    );
  },
  selectFromLocalFileSystemAlert: error => {
    AlertFunc(
      alertConfig.alertFail,
      alertConfig.selectFromLocalFSFail + error ? '\n' + error : null,
      alertConfig.ok,
      false,
    );
  },
  readFileAlert: error => {
    AlertFunc(
      alertConfig.alertFail,
      alertConfig.readFileFail + error ? '\n' + error : null,
      alertConfig.ok,
      false,
    );
  },
  imageCompressionAlert: error => {
    AlertFunc(
      alertConfig.alertFail,
      alertConfig.imageCompression + error ? '\n' + error : null,
      alertConfig.ok,
      false,
    );
  },
  logPreviewImageDeleteAlert: func => {
    AlertFunc(
      alertConfig.alertFail,
      alertConfig.logPreviewImageDelete,
      alertConfig.ok,
      false,
      func,
      'cancel',
    );
  },
  logSubmitSuccessfullyAlert: func => {
    AlertFunc(
      alertConfig.alertSuccess,
      alertConfig.logSubmitSuccessfully,
      alertConfig.ok,
      false,
      func,
    );
  },
  deleteJournalLogAlert: func => {
    AlertFunc(
      alertConfig.alertSuccess,
      alertConfig.deleteJournalLog,
      alertConfig.ok,
      false,
      func,
      'cancel',
    );
  },
  deleteUserAlert: func => {
    AlertFunc(
      alertConfig.alertConfirm,
      alertConfig.deleteUser,
      alertConfig.ok,
      false,
      func,
      'cancel',
    );
  },
  deleteImageAlert: func => {
    AlertFunc(
      alertConfig.alertConfirm,
      alertConfig.deleteImage,
      alertConfig.ok,
      false,
      func,
      'cancel',
    );
  },
  voteConfirmAlert: func => {
    AlertFunc(
      alertConfig.alertConfirm,
      alertConfig.voteConfirm,
      alertConfig.ok,
      false,
      func,
      'cancel',
    );
  },
  forumConfirmAlert: func => {
    AlertFunc(
      alertConfig.alertConfirm,
      alertConfig.forumConfirm,
      alertConfig.ok,
      false,
      func,
      'cancel',
    );
  },
  journalSubmitConfirmAlert: func => {
    AlertFunc(
      alertConfig.alertConfirm,
      alertConfig.journalSubmitConfirm,
      alertConfig.ok,
      false,
      func,
      'cancel',
    );
  },
  geolocationServiceUnavailableAlert: func => {
    AlertFunc(
      alertConfig.alertConfirm,
      alertConfig.geolocationServiceUnavailable,
      alertConfig.ok,
      false,
      func,
    );
  },
  geolocationPermissionDenyAlert: func => {
    AlertFunc(
      alertConfig.alertConfirm,
      alertConfig.geolocationPermissionDeny,
      alertConfig.ok,
      false,
      func,
    );
  },
  fromMarkerToDiscoverConfirm: func => {
    AlertFunc(
      alertConfig.alertConfirm,
      alertConfig.fromMarkerToDiscover,
      alertConfig.ok,
      false,
      func,
      alertConfig.cancel,
    );
  },
  fromDiscoverToMapConfirm: func => {
    AlertFunc(
      alertConfig.alertConfirm,
      alertConfig.fromDiscoverToMap,
      alertConfig.ok,
      false,
      func,
      alertConfig.cancel,
    );
  },
  fromDiscoverToImageClassificationConfirm: func => {
    AlertFunc(
      alertConfig.alertConfirm,
      alertConfig.fromMarkerToDiscover,
      alertConfig.ok,
      false,
      func,
      alertConfig.cancel,
    );
  },
  journalSubmitGeoConfirm: (func, geoInfo, cancelFunc) => {
    AlertFunc(
      alertConfig.alertConfirm,
      alertConfig.journalSubmitGeoConfirm + '\n' + 'GeoInfo: ' + geoInfo,
      alertConfig.include,
      false,
      func,
      alertConfig.no,
      cancelFunc,
    );
  },
  expertJudgementSubmitGeoConfirm: (func, cancelFunc) => {
    AlertFunc(
      alertConfig.alertConfirm,
      alertConfig.expertJudgementSubmitGeoConfirm,
      alertConfig.ok,
      false,
      func,
      alertConfig.no,
      cancelFunc,
    );
  },
  inValidImageFormat: () => {
    AlertFunc(
      alertConfig.alertConfirm,
      alertConfig.inValidImageFormat,
      alertConfig.ok,
      false,
    );
  },
};
export default Alerts;
