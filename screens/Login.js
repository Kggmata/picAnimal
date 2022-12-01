import React, {useEffect, useState} from 'react';
import './../constant/Constant';
import {StyleSheet, Text, View} from 'react-native';
import EnterBox from '../components/Enter_box';
import TouchableOpacityComponents from '../components/TouchableOpacity';
import firestore from '@react-native-firebase/firestore';
import Alerts from '../function/AlertFunc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginLogOut from '../function/LoginLogOutFunc';
import LinearGradient from 'react-native-linear-gradient';
import {Card, Subheading} from 'react-native-paper';
import GlobalValDict from '../constant/GlobalVal';
import constantDict from '../constant/Constant';

const LoginScreen = ({navigation}) => {
  let [userId, setUserId] = useState('');
  let [userPassword, setUserPassword] = useState({});
  let [loginState, setLoginState] = useState(undefined);
  // get loginState from local cache at first render, if exist then navigate to home screen
  useEffect(() => {
    AsyncStorage.getItem('loginState').then(value => {
      if (value) {
        LoginLogOut.login(userId, () => {
          setLoginState(userId);
        });
        navigation.navigate('HomeStack');
      }
    });
  }, []);
  // check loginState and navigate to home screen
  const checkUser = () => {
    // if userid not null
    let normalUser = userId + constantDict.commonSeparatorOfSpecialist + 'n';
    let specialistUser =
      userId + constantDict.commonSeparatorOfSpecialist + 's';
    if (userId) {
      firestore()
        .collection('Users')
        .where(firestore.FieldPath.documentId(), 'in', [
          normalUser,
          specialistUser,
        ])
        .get()
        .then(documentSnapshot => {
          if (documentSnapshot._docs.length > 0) {
            const userData = documentSnapshot._docs[0]._data;
            const documentId =
              documentSnapshot._docs[0]._ref._documentPath._parts[1];
            if (userPassword === userData.password) {
              LoginLogOut.login(documentId, () => {
                setLoginState(documentId);
                GlobalValDict.setGlobalViewHistory([]);
              });
              Alerts.loginSuccessfullyAlert(navigation, 'HomeStack');
            } else {
              Alerts.passwordIncorrectAlert();
            }
          } else {
            Alerts.userNotFoundAlert();
          }
        })
        .catch(error => {
          console.log(error);
          Alerts.serviceCurrentlyUnavailableAlert();
        });
    } else {
      Alerts.pleaseEnterUserNameAlert();
    }
  };
  return global.loginUser ? (
    <Card style={{flex: 1}}>
      <LinearGradient
        colors={['#dce35b', '#45b649']}
        style={{
          flex: 1,
          alignItems: 'center',
        }}>
        <View style={{margin: 10}}>
          <Subheading style={{color: 'white', fontSize: 20}}>
            You already log in as {global.loginUser}
          </Subheading>
        </View>
        <TouchableOpacityComponents.touchableOpacityCustom
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            width: '47%',
            height: 40,
            margin: 2,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: 'white',
          }}
          textStyle={{color: 'white'}}
          navigation={navigation}
          target={'HomeStack'}
          name="Home"
        />
        <TouchableOpacityComponents.touchableOpacityCustom
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            width: '47%',
            height: 40,
            margin: 2,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: 'white',
          }}
          textStyle={{color: 'white'}}
          onPress={() => {
            LoginLogOut.logout(() => {
              setLoginState(undefined);
            });
            Alerts.logoutSuccessfullyAlert(navigation, 'LoginStack');
          }}
          name="Logout"
        />
      </LinearGradient>
    </Card>
  ) : (
    <View style={{flex: 1}}>
      <LinearGradient
        colors={['#dce35b', '#45b649']}
        style={{
          flex: 1,
          alignItems: 'center',
        }}>
        <View style={{flex: 1}}></View>
        <View
          style={{
            flex: 3,
            alignSelf: 'center',
            alignItems: 'center',
          }}>
          <View style={styles.inputBoxView}>
            <EnterBox
              name="USERNAME"
              autoComplete={'USERNAME'}
              iconName={'account'}
              value={userId}
              onChangeText={text => {
                setUserId(text);
              }}
            />
            <EnterBox
              keyboardType={'visible-password'}
              name="PASSWORD"
              autoComplete={'password'}
              iconName={'onepassword'}
              value={userPassword}
              onChangeText={text => {
                setUserPassword(text);
              }}
            />
          </View>
          <View style={styles.buttonView}>
            <TouchableOpacityComponents.touchableOpacityCustom
              style={styles.loginTouchableOpacity}
              textStyle={styles.loginTouchableOpacityText}
              navigation={navigation}
              onPress={() => {
                checkUser();
              }}
              name="Log in"
            />
            <TouchableOpacityComponents.touchableOpacityCustom
              style={styles.signUpTouchableOpacity}
              textStyle={styles.signUpTouchableOpacityText}
              navigation={navigation}
              target={'SignupStack'}
              name="Sign up"
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};
const styles = StyleSheet.create({
  appTitle: {
    // backgroundColor: '#284f43',
    flex: 1,
    color: 'white',
    textAlign: 'center',
    fontSize: 40,
    paddingTop: '10%',
    paddingBottom: '10%',
  },
  inputBoxView: {
    flex: 1,
    width: '90%',
  },
  buttonView: {
    flex: 1,
    position: 'absolute',
    bottom: 30,
    width: '90%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  loginTouchableOpacity: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '70%',
    height: 45,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'white',
  },
  loginTouchableOpacityText: {
    color: 'white',
    fontSize: 15,
  },
  signUpTouchableOpacity: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '70%',
    height: 45,
    borderRadius: 70,
  },
  signUpTouchableOpacityText: {
    color: 'white',
    fontSize: 15,
  },
});
export default LoginScreen;
