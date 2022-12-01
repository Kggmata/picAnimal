import React, {useState} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import EnterBox from '../components/Enter_box';
import TouchableOpacityComponents from '../components/TouchableOpacity';
import firestore from '@react-native-firebase/firestore';
import alertConfig from '../constant/Alert_config';
import Alerts from '../function/AlertFunc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Apis from '../function/Apis';
import FirestoreBaseFuncs from '../function/FirebaseFunc';
import storage from '@react-native-firebase/storage';
import {Card, Subheading} from 'react-native-paper';
import constantDict from '../constant/Constant';

const saveUserToFireStore = (
  userId,
  userData,
  navigation,
  iconImage,
  imageId,
) => {
  const userName = userId.split(constantDict.commonSeparatorOfSpecialist)[0];
  let normalUser = userName + constantDict.commonSeparatorOfSpecialist + 'n';
  let specialistUser =
    userName + constantDict.commonSeparatorOfSpecialist + 's';
  firestore()
    .collection('Users')
    .where(firestore.FieldPath.documentId(), 'in', [normalUser, specialistUser])
    .get()
    .then(documentSnapshot => {
      console.log([normalUser, specialistUser]);
      if (documentSnapshot._docs.length > 0) {
        Alerts.userAlreadyExistsAlert();
      } else {
        FirestoreBaseFuncs.firestoreDatabaseCommonSaveFunc(
          'Users',
          userId,
          userData,
          () => {
            Alerts.registerSuccessfullyAlert(navigation, 'LoginStack');
          },
          () => {
            Alerts.serviceCurrentlyUnavailableAlert();
          },
        );
        if (iconImage) {
          storage()
            .ref('icon/' + imageId + '.jpg')
            .putFile(iconImage)
            .then(() => {
              Alerts.iconUploadSuccessfullyAlert();
            })
            .catch(error => {
              Alerts.serviceCurrentlyUnavailableAlert();
            });
        }
      }
    })
    .catch(error => {
      Alerts.serviceCurrentlyUnavailableAlert();
    });
  //upload to firebase
};
const SignupScreen = ({route, navigation}) => {
  let [userName, setUserName] = useState('');
  let [userPassword, setPassword] = useState('');
  let [loginState, setLoginState] = useState(undefined);
  let [specialistStatus, setSpecialStatus] = useState(undefined);
  let [iconImage, setIconImage] = useState(false);
  const specialistText = {
    1: 'You are Specialist!',
    0: 'You are not Specialist!',
  };
  if (route.params) {
    if (route.params.SpecialistCertification !== specialistStatus) {
      setSpecialStatus(route.params.SpecialistCertification);
    }
  }
  AsyncStorage.getItem('loginState').then(value => {
    if (value) {
      loginUser(value);
      console.log(value);
    }
  });

  function logOutUser() {
    global.loginUser = undefined;
    AsyncStorage.removeItem('loginState');
    setLoginState(undefined); // update screen
  }

  function loginUser(userId) {
    global.loginUser = userId;
    AsyncStorage.setItem('loginState', userId);
    setLoginState(userId);
  }

  const registration = props => {
    if (userName && userPassword) {
      let specialistFlag = !!specialistStatus;
      let imageId = iconImage ? 'icon_' + userName : false;
      saveUserToFireStore(
        userName +
          constantDict.commonSeparatorOfSpecialist +
          (specialistFlag ? 's' : 'n'),
        {
          password: userPassword,
          icon: imageId,
          forum: [],
          images: [],
          journal: [],
          votes: [],
          like: [],
        },
        navigation,
        iconImage,
        imageId,
      );
    } else {
      Alert.alert(alertConfig.alertFail, 'Please fill Name and Password');
    }
  };

  return global.loginUser ? (
    <Card style={{flex: 1}}>
      <Text>You already log in as {global.loginUser}</Text>
      <TouchableOpacityComponents.touchableOpacityCustom
        navigation={navigation}
        target={'HomeStack'}
        name="Home"
      />
      <TouchableOpacityComponents.touchableOpacityCustom
        onPress={() => {
          logOutUser();
          Alerts.logoutSuccessfullyAlert(navigation, 'SignupStack');
        }}
        name="Logout"
      />
    </Card>
  ) : (
    <Card
      style={{
        flex: 1,
      }}>
      <LinearGradient
        colors={['#dce35b', '#45b649']}
        style={{
          flex: 1,
          alignItems: 'center',
        }}>
        <View style={{flex: 1, justifyContent: 'center'}}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: 100,
              height: 100,
              margin: 2,
              borderRadius: 50,
              borderWidth: 1,
              borderColor: 'white',
            }}
            onPress={() => {
              Apis.selectFromLocalFS()
                .then(res => {
                  Apis.compressImage(res[0].uri, 1000, 1000).then(res => {
                    console.log(res.uri);
                    setIconImage(res.uri);
                  });
                })
                .catch(e => {
                  setIconImage(null);
                });
            }}>
            {iconImage ? (
              <View style={{}}>
                <Image
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                  }}
                  source={{uri: iconImage}}
                />
              </View>
            ) : (
              <Subheading style={{color: 'white'}}>Upload</Subheading>
            )}
          </TouchableOpacity>
        </View>
        <View
          style={{
            flex: 3,
            width: '90%',
          }}>
          <EnterBox
            name="USERNAME"
            iconName={'account'}
            value={userName}
            onChangeText={text => {
              setUserName(text);
            }}
          />
          <EnterBox
            name="PASSWORD"
            autoComplete={'password'}
            iconName={'onepassword'}
            value={userPassword}
            onChangeText={text => {
              setPassword(text);
              console.log('password: ', userPassword);
            }}
          />
        </View>
        <View style={styles.buttonView}>
          <TouchableOpacityComponents.touchableOpacityCustom
            style={styles.signUpTouchableOpacity}
            textStyle={styles.signUpTouchableOpacityText}
            navigation={navigation}
            onPress={registration}
            name="Sign up"
          />
          <TouchableOpacityComponents.touchableOpacityCustom
            style={styles.specialistTouchableOpacity}
            textStyle={styles.specialistTouchableOpacityText}
            navigation={navigation}
            target="SpecialistCertification"
            name={
              specialistText[specialistStatus]
                ? specialistText[specialistStatus]
                : 'Specialist Certification'
            }
          />
        </View>
      </LinearGradient>
    </Card>
  );
};
export default SignupScreen;
const styles = StyleSheet.create({
  buttonView: {
    flex: 1,
    position: 'absolute',
    bottom: 30,
    width: '90%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  touchableOpacity: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 40,
    padding: 10,
    marginRight: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  signUpTouchableOpacity: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '70%',
    height: 45,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'white',
  },
  signUpTouchableOpacityText: {
    color: 'white',
    fontSize: 15,
  },
  specialistTouchableOpacity: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '70%',
    height: 45,
  },
  specialistTouchableOpacityText: {
    color: 'white',
    fontSize: 15,
  },
});
