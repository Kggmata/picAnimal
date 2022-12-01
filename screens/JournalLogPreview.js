import {
  Animated,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import TouchableOpacityComponents from '../components/TouchableOpacity';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Directions, FlingGestureHandler} from 'react-native-gesture-handler';
import Enter_box from '../components/Enter_box';
import {
  NestableScrollContainer,
  NestableDraggableFlatList,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import {keyExtractor} from 'react-native/Libraries/Lists/VirtualizeUtils';
import draggableFlatListUtils from '../function/DraggableFlatList';
import ImageViewer from 'react-native-image-zoom-viewer';
import SwipeableItem from 'react-native-swipeable-item';
import {CameraScreen} from 'react-native-camera-kit';
import cameraFuncs from '../function/CameraFunc';
import Alerts from '../function/AlertFunc';
import FirestoreBaseFuncs from '../function/FirebaseFunc';
import {
  ActivityIndicator,
  Card,
  Divider,
  FAB,
  Paragraph,
  Surface,
  Title,
} from 'react-native-paper';
import BottomSheet from '@gorhom/bottom-sheet';
import constantDict from '../constant/Constant';

const JournalLogPreviewScreen = ({route, navigation}) => {
  const [isPermitted, setIsPermitted] = useState(false);
  const [viewHeight, setViewHeight] = useState(
    global.viewHeight ? global.viewHeight : 500,
  );
  const [viewWidth, setViewWidth] = useState(
    global.viewWidth ? global.viewWidth : 500,
  );
  const [imagePaths, setImagePaths] = useState([]);
  const [imageLarge, setImageLarge] = useState(0);
  const [optionInput, setOptionInput] = useState(0);
  const [textDescription, setTextDescription] = useState('');
  const [optionToAdd, setOptionToAdd] = useState('');
  const [submitStatus, setSubmitStatus] = useState(0);
  const [textInputVal, setTextInputVal] = useState('');
  const sheetRef = React.useRef(null);
  const [randomColor, setRandomColor] = useState(
    global.randomColor
      ? global.randomColor
      : draggableFlatListUtils.randomColor,
  );
  const [matchResult, setMatchResult] = useState(
    route.params ? route.params.matchResult : null,
  );
  const animatedImageHeight = useRef(new Animated.Value(100)).current;
  const onBottomButtonPressed = event => {
    if (event.type === 'left') {
      setIsPermitted(false);
    } else if (event.type === 'right') {
      setIsPermitted(false);
    } else {
      setImagePaths(prevState => {
        let url = event.captureImages.pop(0).uri;
        return [
          ...prevState,
          {
            key:
              global.loginUser +
              constantDict.commonSeparator +
              Date.now() +
              constantDict.commonSeparator +
              url.substring(url.length - 14, url.length),
            url: [url, 1],
          },
        ];
      });
      setIsPermitted(false);
    }
  };
  const submitJournalLog = geoInfo => {
    setSubmitStatus(1);
    let imageData = imagePaths.map(item => item.key);
    let logData = {
      images: imageData,
      options: matchResult.map(
        (item, index) =>
          item.text +
          constantDict.commonSeparatorOfForumLike +
          (matchResult.length - index).toString(),
      ),
      textDescription: textDescription,
      forum: [],
      location: geoInfo,
      like: [],
    };
    for (let i of imagePaths) {
      let index = imagePaths.indexOf(i);
      FirestoreBaseFuncs.compressAndSaveImageToFireStore(
        i.key,
        i.url[0],
        index === imagePaths.length - 1
          ? () => {
              const journalId =
                global.loginUser + constantDict.commonSeparator + Date.now();
              FirestoreBaseFuncs.fireStoreDatabaseUpdateUserImages(
                imageData,
                journalId,
              ).then(() => {
                FirestoreBaseFuncs.firestoreDatabaseCommonSaveFunc(
                  'JournalLog',
                  journalId,
                  logData,
                  () => {},
                  () => {},
                ).then(() => {
                  setSubmitStatus(0);
                  Alerts.logSubmitSuccessfullyAlert();
                });
              });
            }
          : null,
      );
    }
  };
  useEffect(() => {
    if (route.params) {
      setMatchResult(route.params.matchResult);
      console.log(route.params.imageTime);
      setImagePaths(prevState => [
        ...prevState.filter(item => item.url[0] !== route.params.imagePath),
        {
          key: route.params.imageId,
          url: [route.params.imagePath, 1],
        },
      ]);
    }
  }, [navigation, route.params]);
  return isPermitted ? (
    <View style={{flex: 1}}>
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
          auto: require('../assets/flashauto.png'),
        }}
        cameraFlipImage={require('../assets/flip.png')}
        captureButtonImage={require('../assets/capture.png')}
      />
    </View>
  ) : route.params ? (
    imageLarge ? (
      <ImageViewer
        onBottomButtonPressed={event => onBottomButtonPressed(event)}
        onLongPress={() => {
          setImageLarge('');
        }}
        renderIndicator={() => null}
        index={imagePaths.indexOf(
          imagePaths.find(item => item.key === imageLarge),
        )}
        imageUrls={imagePaths.map(path => {
          return {url: path.url[0]};
        })}
      />
    ) : (
      <FlingGestureHandler
        direction={Directions.RIGHT}
        onHandlerStateChange={({nativeEvent}) => {
          if (nativeEvent.state === 5) {
            navigation.openDrawer();
          }
        }}>
        <FlingGestureHandler
          direction={Directions.DOWN}
          onHandlerStateChange={({nativeEvent}) => {
            if (nativeEvent.state === 5) {
              Animated.timing(animatedImageHeight, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
              }).start();
            }
          }}>
          <FlingGestureHandler
            direction={Directions.UP}
            onHandlerStateChange={({nativeEvent}) => {
              if (nativeEvent.state === 5) {
                Animated.timing(animatedImageHeight, {
                  toValue: 100,
                  duration: 300,
                  useNativeDriver: false,
                }).start();
              }
            }}>
            <SafeAreaView style={{flex: 1}}>
              <Animated.View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: '#d4d4d4',
                  flexDirection: 'row',
                  height: animatedImageHeight.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['70%', '20%'],
                  }),
                }}>
                <View
                  style={{
                    flex: 5,
                    borderRightWidth: 0.3,
                    borderColor: '#b4b4b4',
                  }}>
                  <FlatList
                    data={imagePaths}
                    renderItem={({item}) => (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                          setImageLarge(item.key);
                        }}
                        onLongPress={() => {
                          if (imagePaths.length > 1) {
                            Alerts.logPreviewImageDeleteAlert(() => {
                              setImagePaths(
                                imagePaths.filter(
                                  image => image.key !== item.key,
                                ),
                              );
                            });
                          }
                        }}>
                        <Image
                          source={{uri: item.url[0]}}
                          style={{
                            flex: 1,
                            width: viewWidth,
                            height: viewHeight * 0.7,
                            resizeMode: 'contain',
                          }}
                        />
                      </TouchableOpacity>
                    )}
                    keyExtractor={keyExtractor}
                    horizontal={true}
                  />
                </View>
                <TouchableOpacityComponents.plusCircleOutline
                  onPress={() => {
                    cameraFuncs.openCamera(setIsPermitted);
                  }}
                />
              </Animated.View>
              <Surface
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  backgroundColor: 'white',
                }}>
                <Card style={{flex: 5, backgroundColor: 'white'}}>
                  <Card.Title title={'Options'} />
                  <Divider />
                  <View style={{alignItems: 'center', flex: 1}}>
                    <NestableScrollContainer>
                      <NestableDraggableFlatList
                        containerStyle={{
                          width: viewWidth * 0.65,
                        }}
                        keyExtractor={keyExtractor}
                        data={matchResult ? matchResult : [{1: 1}]}
                        onDragEnd={({data}) => setMatchResult(data)}
                        renderItem={({item, drag, isActive}) => (
                          <ScaleDecorator>
                            <View
                              style={{
                                marginLeft: 15,
                                marginRight: 15,
                                width: '90%',
                                margin: 5,
                              }}>
                              <SwipeableItem
                                snapPointsLeft={[viewWidth]}
                                onChange={e => {
                                  if (e.openDirection === 'left') {
                                    if (matchResult.length > 1) {
                                      setMatchResult(
                                        matchResult.filter(
                                          i => i.key !== item.key,
                                        ),
                                      );
                                    } else {
                                      setMatchResult([{key: 0, text: ''}]);
                                    }
                                  }
                                }}>
                                <TouchableOpacity
                                  onLongPress={drag}
                                  disabled={isActive}
                                  style={{
                                    width: '97%',
                                    height: '100%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderRadius: 20,
                                    borderColor: '#d4d4d4',
                                    backgroundColor: '#f2f2f2',
                                  }}>
                                  <Paragraph
                                    style={{
                                      fontSize: 15,
                                      color: draggableFlatListUtils.getColor(
                                        item.text,
                                        randomColor,
                                      ),
                                    }}>
                                    {item.text}
                                  </Paragraph>
                                </TouchableOpacity>
                              </SwipeableItem>
                            </View>
                          </ScaleDecorator>
                        )}
                      />
                    </NestableScrollContainer>
                  </View>
                </Card>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    justifyItems: 'center',
                    alignItems: 'center',
                  }}>
                  <TouchableOpacityComponents.plusCircleOutline
                    onPress={() => {
                      setOptionInput(1);
                      sheetRef.current.snapToIndex(1);
                    }}
                  />
                </View>
              </Surface>
              <Divider bold />
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  backgroundColor: 'white',
                }}>
                <Card
                  style={{
                    flex: 5,
                    backgroundColor: 'white',
                  }}>
                  <Card.Title title={'Text Description'} />
                  <Divider />
                  <Card.Content>
                    <Paragraph>{textDescription}</Paragraph>
                  </Card.Content>
                </Card>
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <TouchableOpacityComponents.plusCircleOutline
                    onPress={() => {
                      setOptionInput(0);
                      sheetRef.current.snapToIndex(1);
                    }}
                  />
                </View>
              </View>
              <Animated.View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  bottom: 0,
                }}>
                <FAB
                  color={draggableFlatListUtils.getColor('', randomColor)}
                  icon={'cloud-upload-outline'}
                  size={'small'}
                  style={{
                    borderWidth: 1,
                    borderColor: '#b4b4b4',
                    position: 'absolute',
                    margin: 10,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#f2f2f2',
                  }}
                  loading={!!submitStatus}
                  onPress={
                    submitStatus
                      ? null
                      : () => {
                          Alerts.journalSubmitConfirmAlert(() => {
                            Alerts.journalSubmitGeoConfirm(
                              () => {
                                submitJournalLog(global.currentPosition);
                              },
                              JSON.stringify(global.currentPosition),
                              () => {
                                submitJournalLog(null);
                              },
                            );
                          });
                        }
                  }
                />
              </Animated.View>
              <BottomSheet
                handleStyle={{
                  backgroundColor: '#b4b4b4',
                }}
                ref={sheetRef}
                snapPoints={[1, 150]}
                enablePanDownToClose={true}
                onChange={e => {
                  if (e === -1) {
                    setOptionInput(0);
                    setTextInputVal('');
                  }
                }}>
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyItems: 'center',
                  }}>
                  <Enter_box
                    enterBox={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderColor: 'white',
                      margin: 5,
                    }}
                    value={optionInput ? optionToAdd : textDescription}
                    cursorColor={'#d4d4d4'}
                    multiline={true}
                    onFocus={() => {
                      sheetRef.current.snapToIndex(1);
                    }}
                    name={optionInput ? 'Option to add' : 'Text Description'}
                    textInputView={{width: '100%'}}
                    enterBoxTextInput={{
                      width: '100%',
                    }}
                    iconHide={true}
                    onChangeText={text => {
                      // setTextInputVal(text);
                      optionInput
                        ? setOptionToAdd(text)
                        : setTextDescription(text);
                    }}
                  />
                  <TouchableOpacityComponents.touchableOpacityCustom
                    name={optionInput ? 'Add' : 'Confirm'}
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '37%',
                      height: 40,
                      margin: 2,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: '#d4d4d4',
                    }}
                    onPress={() => {
                      optionInput
                        ? setMatchResult([
                            ...matchResult,
                            {
                              key: matchResult.length,
                              text: optionToAdd,
                            },
                          ])
                        : null;
                      sheetRef.current.snapToIndex(0);
                    }}
                  />
                </View>
              </BottomSheet>
            </SafeAreaView>
          </FlingGestureHandler>
        </FlingGestureHandler>
      </FlingGestureHandler>
    )
  ) : (
    <FlingGestureHandler
      direction={Directions.RIGHT}
      onHandlerStateChange={({nativeEvent}) => {
        if (nativeEvent.state === 5) {
          navigation.openDrawer();
        }
      }}>
      <SafeAreaView style={{flex: 1}}>
        <Text>1</Text>
      </SafeAreaView>
    </FlingGestureHandler>
  );
};
export default JournalLogPreviewScreen;
