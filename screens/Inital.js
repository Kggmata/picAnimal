import {
  LogBox,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import TouchableOpacityComponents from '../components/TouchableOpacity';
import navigationStackDic from '../Navigation/NavigationStack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import Geolocation from '@react-native-community/geolocation';
import ActivityIndicatorComponents from '../components/ActivityIndicatorComponents';
import geolocDict from '../function/GeolocFuncs';
import Alerts from '../function/AlertFunc';
import {
  AnimatedFAB,
  Card,
  Divider,
  Modal,
  Paragraph,
  Portal,
  Provider,
  Subheading,
  Title,
} from 'react-native-paper';
import GlobalValDict from '../constant/GlobalVal';
import Paragraphs from '../constant/Paragraphs';

LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications
// initial screen
const InitialScreen = ({navigation}) => {
  const viewHeight = useWindowDimensions().height;
  const viewWidth = useWindowDimensions().width;
  const [position, setPosition] = useState(null);
  const [agreeWithPrivacyDisclaimer, setAgreeWithPrivacyDisclaimer] =
    useState(0);
  const [geoInfoLoading, setGeoInfoLoading] = useState(1); // loading status of geo information
  const [cacheLoading, setCacheLoading] = useState(1); // loading status of geo information
  GlobalValDict.setGlobalRandomColor();
  const [visible, setVisible] = React.useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const [isExtended, setIsExtended] = React.useState(1);
  const paragraphsUserPrivacy = Paragraphs.paragraphsUserPrivacy;
  const paragraphsVersionAndEffectiveDate =
    Paragraphs.paragraphsVersionAndEffectiveDate;
  const paragraphVersionAndEffectiveDateLength =
    paragraphsVersionAndEffectiveDate
      .reduce((acc, curr) => {
        acc += curr.split(' ').length;
        return acc;
      }, 0)
      .toString();
  const paragraphPrivacyLength = paragraphsUserPrivacy
    .reduce((acc, curr) => {
      acc += curr.split(' ').length;
      return acc;
    }, 0)
    .toString();
  // set login User state after geo information is loaded
  useEffect(() => {
    if (!geoInfoLoading) {
      // load view history from local cache
      setCacheLoading(1);
      AsyncStorage.getItem('viewHistory')
        .then(viewhistory => {
          if (viewhistory) {
            let viewHistory = viewhistory.split(',');
            // if existed, set global view history
            GlobalValDict.setGlobalViewHistory(viewHistory);
          } else {
            GlobalValDict.setGlobalViewHistory([]);
          }
        })
        .then(() => {
          GlobalValDict.setGlobalViewHeightViewWidth(viewHeight, viewWidth);
          // if geo information is loaded, load loginUser from local cache
          AsyncStorage.getItem('loginState').then(loginState => {
            // if loginState not null, go to Home page
            if (loginState) {
              GlobalValDict.setGlobalLoginUser(loginState);
            } else {
              AsyncStorage.setItem('viewHistory', '[]');
            }
            AsyncStorage.getItem('disclaimerState').then(disclaimerSate => {
              // if loginState not null, go to Home page
              if (disclaimerSate) {
                GlobalValDict.setDisclaimerState(disclaimerSate);
                setAgreeWithPrivacyDisclaimer(disclaimerSate);
              }
              if (disclaimerSate && loginState) {
                navigation.navigate(navigationStackDic.Home);
              }
              setCacheLoading(0);
            });
          });
        });
    }
  }, [geoInfoLoading]);
  useEffect(() => {
    agreeWithPrivacyDisclaimer ? hideModal() : showModal();
  }, [agreeWithPrivacyDisclaimer]);
  // load geo information when first render the page
  useEffect(() => {
    const geolocation = () => {
      Geolocation.requestAuthorization(
        () => {
          geolocDict.getOneTimeCurrentLocation(
            pos => {
              GlobalValDict.setGlobalGeoInfo(pos);
              setGeoInfoLoading(0);
              setPosition(pos);
            },
            e => {
              Alerts.geolocationServiceUnavailableAlert(() => {
                setGeoInfoLoading(0);
              });
            },
          );
        },
        e => {
          Alerts.geolocationPermissionDenyAlert(() => {
            setGeoInfoLoading(false);
          });
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 1000,
        },
      );
    };
    return geolocation();
  }, []);
  return (
    <SafeAreaView style={{flex: 1}}>
      {geoInfoLoading || cacheLoading ? (
        // if geo information is not loaded, show loading animation
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Subheading>Wait geolocation loading</Subheading>
          <ActivityIndicatorComponents.randomColorActivityIndicator
            randomColor={global.randomColor}
          />
        </View>
      ) : (
        // if geo information is loaded, show login and register button
        <Provider>
          <LinearGradient
            colors={['#dce35b', '#45b649']}
            style={{
              flex: 1,
            }}>
            <Title
              style={{
                flex: 1,
                color: 'white',
                textAlign: 'center',
                fontSize: 40,
                paddingTop: '10%',
                paddingBottom: '10%',
              }}>
              {'PicAnimal'}
            </Title>
            <View style={styles.buttonView}>
              <TouchableOpacityComponents.touchableOpacityCustom
                style={styles.loginTouchableOpacity}
                textStyle={styles.loginTouchableOpacityText}
                navigation={navigation}
                target={'LoginStack'}
                name="Login"
              />
              <TouchableOpacityComponents.touchableOpacityCustom
                style={styles.signUpTouchableOpacity}
                textStyle={styles.signUpTouchableOpacityText}
                navigation={navigation}
                target={'SignupStack'}
                name="Create an account"
              />
            </View>
          </LinearGradient>
          <Portal>
            <Modal
              visible={visible}
              onDismiss={hideModal}
              contentContainerStyle={{
                backgroundColor: 'white',
                height: viewHeight * 0.7,
              }}>
              <View>
                <ScrollView
                  onScrollBeginDrag={() => {
                    setIsExtended(0);
                  }}
                  onScroll={({nativeEvent}) => {
                    if (
                      nativeEvent.contentSize.height -
                        nativeEvent.contentOffset.y ===
                      nativeEvent.layoutMeasurement.height
                    ) {
                      setIsExtended(1);
                    }
                  }}>
                  <Card style={{paddingBottom: 30}}>
                    <Card.Title
                      title={'User privacy policy'}
                      subtitle={'Words ' + paragraphPrivacyLength}
                    />
                    <Divider bold />
                    <Card.Content>
                      {paragraphsUserPrivacy.map(p => {
                        return <Paragraph>{p}</Paragraph>;
                      })}
                    </Card.Content>
                    <Card.Title
                      title={'Version and effective date'}
                      subtitle={
                        'Words ' + paragraphVersionAndEffectiveDateLength
                      }
                    />
                    <Card.Content>
                      <Divider bold />
                      {paragraphsVersionAndEffectiveDate.map(p => {
                        return <Paragraph>{p}</Paragraph>;
                      })}
                    </Card.Content>
                  </Card>
                </ScrollView>
                <AnimatedFAB
                  size={'small'}
                  icon={'check'}
                  label={'Agree'}
                  fabStyle={{height: 20}}
                  extended={isExtended}
                  onPress={() => {
                    AsyncStorage.setItem('disclaimerState', '1');
                    GlobalValDict.setDisclaimerState(1);
                    setAgreeWithPrivacyDisclaimer(1);
                  }}
                  visible={visible}
                  animateFrom={'right'}
                  iconMode={'static'}
                  style={{
                    marginTop: 60,
                    bottom: 5,
                    right: 5,
                    position: 'absolute',
                    alignItems: 'center',
                  }}
                />
              </View>
            </Modal>
          </Portal>
        </Provider>
      )}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  appTitle: {},
  buttonView: {
    flex: 2,
    flexDirection: 'column',
    alignItems: 'center',
  },
  loginTouchableOpacity: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '70%',
    height: 45,
    borderRadius: 70,
  },
  loginTouchableOpacityText: {
    fontSize: 15,
  },
  signUpTouchableOpacity: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '70%',
    height: 45,
    borderRadius: 70,
    borderColor: '#cbe7cd',
    borderWidth: 4,
    margin: 10,
  },
  signUpTouchableOpacityText: {
    color: 'white',
    fontSize: 15,
  },
});
export default InitialScreen;
