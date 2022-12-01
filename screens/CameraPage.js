import {Animated, ScrollView, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {CameraScreen} from 'react-native-camera-kit';
import {StyleSheet} from 'react-native';
import React, {useState} from 'react';
import TouchableOpacityComponents from '../components/TouchableOpacity';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Directions, FlingGestureHandler} from 'react-native-gesture-handler';
import cameraFuncs from '../function/CameraFunc';
import draggableFlatListUtils from '../function/DraggableFlatList';
import {useFocusEffect} from '@react-navigation/native';
import constantDict from '../constant/Constant';

const CameraPage = ({navigation}) => {
  const [isPermitted, setIsPermitted] = useState(false);
  const [captureImages, setCaptureImages] = useState([]);
  const [viewHeight, setViewHeight] = useState(500);
  const [viewWidth, setViewWidth] = useState(500);
  const topAnimatedHeight = new Animated.Value(0);
  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused
      cameraFuncs.openCamera(setIsPermitted);
      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
        console.log('camera close');
        setIsPermitted(false);
      };
    }, []),
  );
  const onBottomButtonPressed = event => {
    const images = JSON.stringify(event.captureImages);
    // console.log('event type', event.type);
    if (event.type === 'left') {
      setIsPermitted(false);
      navigation.goBack();
    } else if (event.type === 'right') {
      setIsPermitted(false);
      setCaptureImages(images);
    } else {
      let url = event.captureImages.pop(0).uri;
      navigation.navigate('ImageClassificationResultStack', {
        screen: 'ImageClassificationResult',
        params: {
          images: {
            key:
              global.loginUser +
              constantDict.commonSeparator +
              Date.now() +
              constantDict.commonSeparator +
              url.substring(url.length - 14, url.length),
            url: url,
          },
        },
      });
    }
  };
  return (
    <FlingGestureHandler
      direction={Directions.RIGHT}
      onHandlerStateChange={({nativeEvent}) => {
        console.log(nativeEvent.state);
        if (nativeEvent.state === 5) {
          navigation.openDrawer();
        }
      }}>
      <SafeAreaView style={styles.safeAreaView}>
        {isPermitted ? (
          <View style={styles.cameraView}>
            <CameraScreen
              // Buttons to perform action done and cancel
              actions={{
                rightButtonText: 'Done',
                leftButtonText: 'Cancel',
              }}
              onBottomButtonPressed={event => onBottomButtonPressed(event)}
              flashImages={{
                // Flash button images
                on: require('../assets/flashon.png'),
                off: require('../assets/flashoff.png'),
              }}
              cameraFlipImage={require('../assets/flip.png')}
              captureButtonImage={require('../assets/capture.png')}
            />
          </View>
        ) : (
          <ScrollView
            onLayout={event => {
              if (viewHeight !== event.nativeEvent.layout.height) {
                setViewHeight(event.nativeEvent.layout.height);
                setViewWidth(event.nativeEvent.layout.width);
              }
              console.log(event.nativeEvent.layout.height);
            }}
            contentContainerStyle={{flexGrow: 1}}
            style={{
              backgroundColor: 'white',
              justifyItems: 'center',
              height: '100%',
            }}>
            <Animated.View
              style={{
                height: topAnimatedHeight.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['45%', '0%'],
                  extrapolate: 'clamp',
                }),
                justifyContent: 'flex-end',
                backgroundColor: '#f2f2f2',
                elevation: 5,
              }}></Animated.View>
            <TouchableOpacityComponents.touchableOpacityCustom
              icon={
                <Icon
                  name={'camera'}
                  size={35}
                  style={{marginRight: 5}}
                  color={draggableFlatListUtils.getColor(
                    '',
                    global.randomColor,
                  )}
                />
              }
              navigation={navigation}
              onPress={() => {
                cameraFuncs.openCamera(setIsPermitted);
              }}
              name="Open Camera"
              style={{
                height: 50,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
              }}
              textStyle={{
                fontSize: 15,
                color: draggableFlatListUtils.getColor('', global.randomColor),
              }}
            />
            <Animated.View
              style={{
                height:
                  // viewHeight * 0.45 -
                  topAnimatedHeight.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['50%', '0%'],
                    extrapolate: 'clamp',
                  }),
                backgroundColor: '#f2f2f2',
                elevation: 5,
              }}></Animated.View>
          </ScrollView>
        )}
      </SafeAreaView>
    </FlingGestureHandler>
  );
};
export default CameraPage;
const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    flexDirection: 'column',
  },
  cameraView: {
    flex: 1,
  },
});
