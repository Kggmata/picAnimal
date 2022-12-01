import './../constant/Constant';
import {
  Animated,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import Alerts from '../function/AlertFunc';
import RNFS from 'react-native-fs';
import Apis from '../function/Apis';
import {Easing} from 'react-native-reanimated';
import ImageViewer from 'react-native-image-zoom-viewer';
import {Directions, FlingGestureHandler} from 'react-native-gesture-handler';
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import {keyExtractor} from 'react-native/Libraries/Lists/VirtualizeUtils';
import draggableFlatListUtils from '../function/DraggableFlatList';
import SwipeableItem from 'react-native-swipeable-item';
import {
  Button,
  Card,
  Divider,
  FAB,
  IconButton,
  Paragraph,
  Subheading,
  Surface,
  Title,
} from 'react-native-paper';
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import constantDict from '../constant/Constant';
import ActivityIndicatorComponents from '../components/ActivityIndicatorComponents';
import {SceneMap, TabView} from 'react-native-tab-view';

const resultNumber = 10;

const ImageClassificationResultScreen = ({route, navigation}) => {
  const [matchResult, setMatchResult] = useState([{key: 0, text: ''}]);
  const [language, setLanguage] = useState('English');
  const [qldResult, setQldResult] = useState([]);
  const [qldResultLoading, setQldResultLoading] = useState(0);
  const [localImagePath, setLocalImagePath] = useState(
    route.params
      ? {
          ...localImagePath,
          [route.params.images.url]: route.params.images.key,
        }
      : {},
  );
  const [searchStack, setSearchStack] = useState([]);
  const [imageLarge, setImageLarge] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);
  const [textDescription, setTextDescription] = useState(null);
  const [apiSelection, setApiSelection] = useState('baidu');
  const [flickImages, setFlickrImages] = useState([]);
  const [flickImagesLarge, setFlickrImagesLarge] = useState('');
  const [imageViewerDescription, setImageViewerDescription] = useState(0);
  const [viewHeight, setViewHeight] = useState(
    global.viewHeight ? global.viewHeight : 500,
  );
  const [viewWidth, setViewWidth] = useState(
    global.viewWidth ? global.viewWidth : 500,
  );

  const sheetRef = useRef(null);
  const swipeRef = useRef(null);
  const animatedButtonShowHide = useRef(new Animated.Value(0)).current;
  const classifyText = [{key: 0, text: 'Classify...'}];
  const [randomColor, setRandomColor] = useState(
    draggableFlatListUtils.randomColor,
  );
  useEffect(() => {
    navigation.addListener('beforeRemove', e => {
      // Prevent default behavior of leaving the screen
      if (global.loginUser) {
        e.preventDefault();
        Alerts.alreadyLoginAlert();
      }
    });
  }, [navigation]);
  const SearchInWiki = async name => {
    cleanResults();
    setTextDescription('Searching...');
    let testEn = new RegExp('[\u4E00-\u9FA5| ]+');

    function tranlateQldResultsToChinese(qldResults) {
      Apis.submitToBaiduAndTranslate(
        qldResults.map(i => i.AcceptedCommonName).join(','),
        'en',
        'zh',
      ).then(resEnToZh =>
        setQldResult(
          qldResults.map((i, index) => {
            return {
              ...i,
              AcceptedCommonName:
                resEnToZh.result.trans_result[0].dst.split('、')[index],
            };
          }),
        ),
      );
    }

    if (testEn.test(name[0])) {
      Apis.submitToBaiduAndTranslate(name, 'zh', 'en')
        .then(res => {
          let nameEn = res.result.trans_result[0].dst;
          Apis.findImageInFlickr(nameEn)
            .then(flickrResult => {
              let flickrResultJson = JSON.parse(flickrResult);
              let imageResults = [];
              for (let i of flickrResultJson.photos.photo) {
                imageResults.push([
                  i.url_m,
                  i.description._content,
                  i.ownername,
                ]);
              }
              setFlickrImages(imageResults);
            })
            .catch(error => {
              Alerts.flickrApiAlert(error);
            });
          fetch(
            'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=' +
              encodeURI(nameEn),
          ).then(response => {
            response.json().then(data => {
              if (data.query.pages['-1']) {
                setTextDescription('No description found');
              } else {
                if (language === '中文') {
                  Apis.submitToBaiduAndTranslate(
                    data.query.pages[Object.keys(data.query.pages)[0]].extract,
                    'en',
                    'zh',
                  )
                    .then(resEnToZh => {
                      setTextDescription(
                        name +
                          constantDict.commonSeparatorOfForumLike +
                          resEnToZh.result.trans_result[0].dst,
                      );
                    })
                    .catch(error => {
                      setMatchResult('');
                      Alerts.baiduTranslateApiAlert(error);
                    });
                  // data.query.pages[Object.keys(data.query.pages)[0]].extract
                } else {
                  setTextDescription(
                    nameEn +
                      constantDict.commonSeparatorOfForumLike +
                      data.query.pages[Object.keys(data.query.pages)[0]]
                        .extract,
                  );
                }
              }
            });
          });
          let qldResults;
          setQldResultLoading(1);
          console.log(name);
          SearchInQLDDatabase(name)
            .then(result => {
              if (result.Species) {
                qldResults = [...result.Species];
              }
            })
            .then(() => {
              let namePop = name.split(' ').pop();
              if (namePop !== name) {
                SearchInQLDDatabase(namePop).then(data => {
                  if (data.Species) {
                    qldResults = [...qldResults, ...data.Species];
                    setQldResult(qldResults);
                    if (language === '中文') {
                      tranlateQldResultsToChinese(qldResults);
                    }
                    setQldResultLoading(0);
                  }
                });
              } else {
                setQldResult(qldResults);
                if (language === '中文') {
                  tranlateQldResultsToChinese(qldResults);
                }
                setQldResultLoading(0);
              }
            })
            .catch(error => Alerts.serviceCurrentlyUnavailableAlert());
        })
        .catch(error => {
          setMatchResult('');
          Alerts.baiduTranslateApiAlert(error);
        });
    } else {
      fetch(
        'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=' +
          encodeURI(name),
      ).then(response => {
        response.json().then(data => {
          if (data.query.pages['-1']) {
            setTextDescription('No description found');
          } else {
            if (language === '中文') {
              Apis.submitToBaiduAndTranslate(
                data.query.pages[Object.keys(data.query.pages)[0]].extract,
                'en',
                'zh',
              )
                .then(resEnToZh => {
                  setTextDescription(
                    name +
                      constantDict.commonSeparatorOfForumLike +
                      resEnToZh.result.trans_result[0].dst,
                  );
                })
                .catch(error => {
                  setMatchResult('');
                  Alerts.baiduTranslateApiAlert(error);
                });
              // data.query.pages[Object.keys(data.query.pages)[0]].extract
            } else {
              setTextDescription(
                name +
                  constantDict.commonSeparatorOfForumLike +
                  data.query.pages[Object.keys(data.query.pages)[0]].extract,
              );
            }
          }
        });
      });
      Apis.findImageInFlickr(name)
        .then(flickrResult => {
          let flickrResultJson = JSON.parse(flickrResult);
          let imageResults = [];
          for (let i of flickrResultJson.photos.photo) {
            imageResults.push([i.url_m, i.description._content, i.ownername]);
          }
          setFlickrImages(imageResults);
        })
        .catch(error => {
          Alerts.flickrApiAlert(error);
        });
      let qldResults;
      setQldResultLoading(1);
      console.log(name);
      SearchInQLDDatabase(name)
        .then(result => {
          if (result.Species) {
            qldResults = [...result.Species];
          }
        })
        .then(() => {
          let namePop = name.split(' ').pop();
          if (namePop !== name) {
            SearchInQLDDatabase(namePop).then(data => {
              if (data.Species) {
                qldResults = [...qldResults, ...data.Species];
                setQldResult(qldResults);
                if (language === '中文') {
                  tranlateQldResultsToChinese(qldResults);
                }
                setQldResultLoading(0);
              }
            });
          } else {
            setQldResult(qldResults);
            if (language === '中文') {
              tranlateQldResultsToChinese(qldResults);
            }
            setQldResultLoading(0);
          }
        })
        .catch(error => Alerts.serviceCurrentlyUnavailableAlert());
    }
  };

  const SubmitToGoogleVision = async res => {
    let googleApiKey = 'AIzaSyDITFFlGkGX7pApvm42Kv376lTRhmmDrPo';
    const myHeaders = new Headers();
    myHeaders.append('Accept', 'application/json');
    myHeaders.append('Content-Type', 'application/json');
    const exampleBody =
      'url=https://pic2.zhimg.com/v2-66c2763d073f4463320ab3a8cd0afd22_r.jpg?source=1940ef5c';
    res = encodeURI(res);
    const requestData = {
      requests: [
        {
          image: {
            content: res,
          },
          features: [
            // {
            //   type: 'TYPE_UNSPECIFIED',
            //   maxResults: 50,
            // },
            // {
            //   type: 'LANDMARK_DETECTION',
            //   maxResults: 50,
            // },
            // {
            //   type: 'FACE_DETECTION',
            //   maxResults: 50,
            // },
            // {
            //   type: 'LOGO_DETECTION',
            //   maxResults: 50,
            // },
            {
              type: 'LABEL_DETECTION',
              maxResults: 50,
            },
            // {
            //   type: 'TEXT_DETECTION',
            //   maxResults: 50,
            // },
            // {
            //   type: 'SAFE_SEARCH_DETECTION',
            //   maxResults: 50,
            // },
            // {
            //   type: 'IMAGE_PROPERTIES',
            //   maxResults: 50,
            // },
            // {
            //   type: 'CROP_HINTS',
            //   maxResults: 50,
            // },
            // {
            //   type: 'WEB_DETECTION',
            //   maxResults: 50,
            // },
          ],
        },
      ],
    };
    const body = JSON.stringify(requestData);
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: body,
      redirect: 'follow',
    };
    return await fetch(
      'https://vision.googleapis.com/v1/images:annotate?key=' + googleApiKey,
      requestOptions,
    )
      .then(response => response.json())
      .then(googleVisionRes => {
        if (googleVisionRes.responses[0].labelAnnotations) {
          let resString = '';
          let numResult = 0;
          for (let i of googleVisionRes.responses[0].labelAnnotations) {
            if (numResult >= resultNumber) {
              break;
            }
            resString +=
              i.description + '-' + (i.score * 100).toFixed(2) + '%' + '\n';
            numResult++;
          }
          if (language === '中文') {
            Apis.submitToBaiduAndTranslate(resString, 'en', 'zh')
              .then(translateRes => {
                let resStringZh = '';
                for (let i of translateRes.result.trans_result) {
                  resStringZh += i.dst + '\n';
                }
                return resStringZh;
              })
              .then(resStringZh => {
                setMatchResult(
                  resStringZh
                    .split('\n')
                    .map((item, index) => ({
                      key: index,
                      text: item,
                    }))
                    .filter(item => {
                      return item.text ? item : null;
                    }),
                );
              })
              .catch(error => {
                Alerts.baiduTranslateApiAlert(error);
              });
          } else if (language === 'English') {
            setMatchResult(
              resString
                .split('\n')
                .map((item, index) => ({
                  key: index,
                  text: item,
                }))
                .filter(item => {
                  return item.text ? item : null;
                }),
            );
          }
        }
      })
      .catch(error => {
        setMatchResult([{key: 0, text: ''}]);
        Alerts.googleVisionApiAlert(error);
      });
  };
  const SubmitToBaidu = async res => {
    const myHeaders = new Headers();
    res = encodeURIComponent(res);
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
    const exampleBody =
      'url=https://pic2.zhimg.com/v2-66c2763d073f4463320ab3a8cd0afd22_r.jpg?source=1940ef5c';
    const body = 'image=' + res;
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: body,
      redirect: 'follow',
    };
    return await fetch(
      'https://aip.baidubce.com/rest/2.0/image-classify/v1/animal?access_token=24.b5116a5bed83eaf43e4d82684a11aeea.2592000.1666148770.282335-27531950',
      requestOptions,
    )
      .then(response => response.json())
      .then(result => {
        if (result.result[0].name) {
          let resString = '';
          let numResult = 0;
          setMatchResult(classifyText);
          for (let i of result.result) {
            if (numResult >= resultNumber) {
              break;
            }
            resString += i.name + '-' + (i.score * 100).toFixed(2) + '%' + '\n';
            numResult++;
          }
          if (language === '中文') {
            setMatchResult(
              resString
                .split('\n')
                .map((item, index) => ({
                  key: index,
                  text: item,
                }))
                .filter(item => {
                  return item.text ? item : null;
                }),
            );
          } else if (language === 'English') {
            Apis.submitToBaiduAndTranslate(resString, 'zh', 'en')
              .then(translateRes => {
                let resStringEn = '';
                if (translateRes.result.trans_result[0]) {
                  for (let i of translateRes.result.trans_result) {
                    resStringEn += i.dst + '\n';
                  }
                  setMatchResult(
                    resStringEn
                      .split('\n')
                      .map((item, index) => ({
                        key: index,
                        text: item,
                      }))
                      .filter(item => {
                        return item.text ? item : null;
                      }),
                  );
                }
              })
              .catch(error => {
                setMatchResult([{key: 0, text: ''}]);
                Alerts.baiduTranslateApiAlert(error);
              });
          }
        }
      })
      .catch(error => {
        setMatchResult([{key: 0, text: ''}]);
        Alerts.baiduApiAlert(error);
      });
  };

  function imageClassification(func) {
    setTextDescription(null);
    setRandomColor(draggableFlatListUtils.randomColor);
    setMatchResult(classifyText);
    Apis.compressImage(
      currentImage
        ? Object.keys(localImagePath)[currentImage - 1]
        : Object.keys(localImagePath).pop(),
      500,
      500,
    )
      .then(r => {
        RNFS.readFile(r.uri, 'base64')
          .then(res => {
            func(res);
          })
          .catch(error => {
            Alerts.readFileAlert(error);
          });
      })
      .catch(error => {
        Alerts.imageCompressionAlert();
      });
  }

  let imageId = null;
  if (Object.keys(localImagePath).length > 0) {
    let lastUrl = Object.keys(localImagePath).pop();
    let pathLen = lastUrl.length;
    imageId =
      global.loginUser +
      constantDict.commonSeparator +
      lastUrl.substring(pathLen - 14, pathLen);
  }
  useEffect(() => {
    console.log(localImagePath);
    // if (imageId) {
    if (route.params) {
      if (!localImagePath[route.params.images.url]) {
        setLocalImagePath({
          ...localImagePath,
          [route.params.images.url]: route.params.images.key,
        });
        setCurrentImage(null);
      }
    }
    setMatchResult([{key: 0, text: ''}]);
    // }
  }, [route.params, imageId]);

  function cleanResults() {
    setTextDescription(0);
    setFlickrImages('');
    setFlickrImagesLarge('');
    setQldResult([]);
  }

  const NoImageText = () => {
    return (
      <Card.Content>
        <Subheading>Take a picture</Subheading>
        <Subheading>Long Press to Upload from local file system</Subheading>
        <Subheading>Click to view large view</Subheading>
      </Card.Content>
    );
  };
  useEffect(() => {
    if (
      Object.keys(localImagePath).length > 0 &&
      imageId &&
      matchResult[0].text !== classifyText[0].text
    ) {
      Animated.timing(animatedButtonShowHide, {
        toValue: 100,
        duration: 800,
        easing: Easing.in,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animatedButtonShowHide, {
        toValue: 0,
        duration: 800,
        easing: Easing.in,
        useNativeDriver: false,
      }).start();
    }
  }, [matchResult]);

  function pickFileFromLocalFS() {
    Apis.selectFromLocalFS()
      .then(res => {
        if (res !== undefined) {
          setLocalImagePath({
            ...localImagePath,
            [res[0].fileCopyUri]:
              global.loginUser +
              constantDict.commonSeparator +
              Date.now() +
              constantDict.commonSeparator +
              res[0].fileCopyUri.substring(
                res[0].fileCopyUri.length - 14,
                res[0].fileCopyUri.length,
              ),
          });
          setCurrentImage(null);
          setMatchResult([{key: 0, text: ''}]);
        }
      })
      .catch(error => {
        Alerts.selectFromLocalFileSystemAlert();
      });
  }

  const SearchInQLDDatabase = async animalName => {
    var myHeaders = new Headers();
    myHeaders.append(
      'Cookie',
      'TS01078244=01be35c1032be21a1a178ea43f4d677d201244d561d3901d685f0eead4f2306f0125bd9e50ed4810b58616695aa19e140f1dd682d7; TS01078244028=0127703ba5aafd63117bb682c349f4b435d0932088f2f085fd8bb71616bdf559219cb14544ba163847594737566c2ca69e86f94234',
    );

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };
    return await fetch(
      'https://apps.des.qld.gov.au/species/?op=speciessearch&kingdom=animals&species=' +
        animalName +
        '&f=json',
      requestOptions,
    ).then(response => response.json());
  };

  const descriptionSplit = textDescription
    ? textDescription.split(constantDict.commonSeparatorOfForumLike)
    : '';

  const QldResultsCard = props => {
    return props.qldResult.map((result, index) => {
      if (index < constantDict.numberOfTagButtons) {
        const familyCommonName = result.FamilyCommonName;
        const scientificName = result.ScientificName;
        const classCommonName = result.ClassCommonName;
        const conservationStatus = result.ConservationStatus;
        const endemicity = result.Endemicity;
        const speciesEnvironment = result.SpeciesEnvironment;
        const taxonID = result.TaxonID;
        return (
          <TouchableOpacity
            onPress={() => {
              const acceptedCommonNameTrim = result.AcceptedCommonName.trim();
              setSearchStack([...searchStack, acceptedCommonNameTrim]);
              SearchInWiki(acceptedCommonNameTrim).catch(error =>
                Alerts.serviceCurrentlyUnavailableAlert(),
              );
            }}>
            <Card
              style={{
                margin: 2,
                borderWidth: 1,
                borderColor: '#b4b4b4',
              }}>
              <Card.Title
                title={
                  result.AcceptedCommonName
                    ? result.AcceptedCommonName
                    : 'No Data'
                }
                subtitle={'TaxonId ' + taxonID}
              />
              <Card.Content>
                <Subheading>Family</Subheading>
                <Paragraph>
                  {familyCommonName ? familyCommonName : 'No data'}
                </Paragraph>
                <Subheading>Class</Subheading>
                <Paragraph>
                  {classCommonName ? classCommonName : 'No data'}
                </Paragraph>
                <Subheading>ScientificName</Subheading>
                <Paragraph>
                  {scientificName ? scientificName : 'No data'}
                </Paragraph>
                <Subheading>Conservation </Subheading>
                <Paragraph>
                  {conservationStatus
                    ? Object.entries(conservationStatus).join('\n')
                    : 'Not matter'}
                </Paragraph>
                <Subheading>Endemicity</Subheading>
                <Paragraph>{endemicity ? endemicity : 'No data'}</Paragraph>
                <Subheading>Species Environment</Subheading>
                <Paragraph>
                  {speciesEnvironment ? speciesEnvironment : 'No data'}
                </Paragraph>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        );
      }
    });
  };

  return imageLarge ? (
    <Surface style={styles.imageLargeContainer}>
      {Object.keys(localImagePath).length ? (
        <ImageViewer
          saveToLocalByLongPress={false}
          renderIndicator={() => null}
          style={styles.image}
          onLongPress={() => {
            setImageLarge(0);
          }}
          index={
            currentImage
              ? currentImage - 1
              : Object.keys(localImagePath).length - 1
          }
          onChange={index => {
            setCurrentImage(index + 1);
          }}
          imageUrls={Object.keys(localImagePath).map(item => {
            return {url: item};
          })}
        />
      ) : (
        <View style={styles.noImageView}>
          <TouchableOpacity
            activeOpacity={0.7}
            onLongPress={() => {
              pickFileFromLocalFS();
            }}
            onPress={() => {
              setImageLarge(0);
            }}>
            <NoImageText />
          </TouchableOpacity>
        </View>
      )}
    </Surface>
  ) : (
    <FlingGestureHandler
      direction={Directions.RIGHT}
      onHandlerStateChange={({nativeEvent}) => {
        if (nativeEvent.state === 5) {
          navigation.openDrawer();
        }
      }}>
      <FlingGestureHandler
        direction={Directions.UP}
        onHandlerStateChange={({nativeEvent}) => {
          if (nativeEvent.state === 5) {
            sheetRef.current.snapToIndex(1);
          }
        }}>
        <FlingGestureHandler
          direction={Directions.DOWN}
          onHandlerStateChange={({nativeEvent}) => {
            if (nativeEvent.state === 5) {
              sheetRef.current.snapToIndex(0);
            }
          }}>
          <SafeAreaView style={styles.mainView}>
            <View style={styles.linearGradientBackground}>
              <TouchableOpacity
                style={styles.imageContainer}
                onLongPress={() => {
                  pickFileFromLocalFS();
                }}
                activeOpacity={0.9}
                onPress={() => {
                  setImageLarge(1);
                  // sheetRef.current.snapToIndex(1);
                }}>
                {Object.keys(localImagePath).length ? (
                  <Image
                    style={styles.image}
                    source={{
                      uri: currentImage
                        ? Object.keys(localImagePath)[currentImage - 1]
                        : Object.keys(localImagePath).pop(),
                    }}
                  />
                ) : (
                  <View style={styles.noImageView}>
                    <NoImageText />
                  </View>
                )}
              </TouchableOpacity>
              <FAB
                icon="camera"
                style={{
                  borderWidth: 1,
                  borderColor: '#b4b4b4',
                  position: 'absolute',
                  margin: 10,
                  right: 0,
                  top: 0,
                  backgroundColor: '#f2f2f2',
                }}
                size={'small'}
                // mode={'flat'}
                color={draggableFlatListUtils.getColor('', randomColor)}
                onPress={() => navigation.navigate('CameraPage')}
              />
            </View>
            <BottomSheet
              handleStyle={{
                backgroundColor: '#b4b4b4',
              }}
              ref={sheetRef}
              snapPoints={[1, global.viewHeight ? global.viewHeight : 600]}
              enableContentPanningGesture={!!textDescription}>
              <View style={styles.apiButtonView}>
                <Button
                  onPress={() => {}}
                  onLongPress={() => {
                    if (language === 'English') {
                      setMatchResult([{key: 0, text: ''}]);
                      cleanResults();
                      setLanguage('中文');
                    } else if (language === '中文') {
                      cleanResults();
                      setMatchResult([{key: 0, text: ''}]);
                      setLanguage('English');
                    }
                  }}
                  textColor="black"
                  style={{
                    margin: 5,
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {language}
                </Button>
                <Button
                  disabled={matchResult[0].text === classifyText[0].text}
                  onLongPress={() => {
                    if (apiSelection === 'baidu') {
                      setApiSelection('google');
                    } else {
                      setApiSelection('baidu');
                    }
                  }}
                  onPress={() => {
                    let func =
                      apiSelection === 'baidu'
                        ? SubmitToBaidu
                        : SubmitToGoogleVision;
                    if (
                      route.params ||
                      Object.keys(localImagePath).length > 0
                    ) {
                      cleanResults();
                      imageClassification(func);
                    }
                  }}
                  style={{
                    flex: 1,
                    margin: 5,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  textColor={draggableFlatListUtils.getColor('', randomColor)}>
                  {apiSelection === 'baidu' ? 'Baidu API' : 'Google Vision API'}
                </Button>
              </View>
              <Card
                style={{
                  backgroundColor: 'white',
                  flex: 1,
                  justifyItems: 'center',
                }}>
                <Card.Title
                  title={
                    textDescription
                      ? 'Description'
                      : 'Image Classification Result'
                  }
                  right={() => {
                    return textDescription ? (
                      <View style={{flexDirection: 'row'}}>
                        <IconButton
                          icon={'arrow-left'}
                          onPress={() => {
                            searchStack.pop();
                            if (searchStack.length > 0) {
                              SearchInWiki(searchStack.pop()).catch(error =>
                                Alerts.serviceCurrentlyUnavailableAlert(),
                              );
                            } else {
                              cleanResults();
                            }
                          }}
                        />
                        <IconButton
                          icon={'close'}
                          onPress={() => {
                            setSearchStack([]);
                            cleanResults();
                          }}
                        />
                      </View>
                    ) : null;
                  }}
                />
                <Divider bold />
                {textDescription ? (
                  flickImagesLarge ? (
                    flickImagesLarge.startsWith('http') ? (
                      <View
                        style={{flex: 1, height: viewHeight, width: viewWidth}}>
                        <ImageViewer
                          onLongPress={() => {
                            setFlickrImagesLarge('');
                          }}
                          onClick={() => {
                            setImageViewerDescription(!imageViewerDescription);
                          }}
                          saveToLocalByLongPress={false}
                          index={flickImages
                            .map(item => item[0])
                            .indexOf(flickImagesLarge)}
                          imageUrls={flickImages.map(imageUrl => {
                            return {url: imageUrl[0]};
                          })}
                          renderIndicator={() => null}
                          renderFooter={currentIndex => {
                            return imageViewerDescription ? (
                              <View
                                style={{
                                  position: 'absolute',
                                  left: 0,
                                  bottom: 30,
                                  width: global.viewWidth - 30,
                                  backgroundColor: 'rgba(255,255,255,0.7)',
                                  flex: 1,
                                  margin: 15,
                                  borderRadius: 10,
                                }}>
                                {flickImages.map(item => item[1])[
                                  currentIndex
                                ] ? (
                                  <Paragraph textColor={''}>
                                    Description:
                                    {
                                      flickImages.map(item => item[1])[
                                        currentIndex
                                      ]
                                    }
                                  </Paragraph>
                                ) : null}
                                <Paragraph>
                                  By{' '}
                                  {
                                    flickImages.map(item => item[2])[
                                      currentIndex
                                    ]
                                  }
                                </Paragraph>
                              </View>
                            ) : null;
                          }}
                        />
                      </View>
                    ) : (
                      <Card.Content style={{flex: 1}}>
                        <BottomSheetFlatList
                          data={[flickImagesLarge]}
                          renderItem={({item}) => (
                            <TouchableOpacity
                              onPress={() => {
                                setFlickrImagesLarge('');
                              }}>
                              <Paragraph style={{fontSize: 15}}>
                                {flickImagesLarge}
                              </Paragraph>
                            </TouchableOpacity>
                          )}
                        />
                      </Card.Content>
                    )
                  ) : (
                    <BottomSheetScrollView
                      contentContainerStyle={{
                        paddingBottom: 60,
                      }}
                      style={{
                        flex: 1,
                        flexDirection: 'column',
                        justifyItems: 'space-between',
                      }}>
                      {flickImages ? (
                        <View>
                          <Card.Title
                            title={'Images from flickr'}
                            subtitle={'Total ' + flickImages.length}
                          />
                          <BottomSheetFlatList
                            style={{flex: 1, backgroundColor: '#b4b4b4'}}
                            horizontal
                            data={flickImages}
                            renderItem={({item}) => (
                              <TouchableOpacity
                                style={[
                                  styles.descriptionImageContainerStyle,
                                  {width: viewWidth},
                                ]}
                                onPress={() => {
                                  setFlickrImagesLarge(item[0]);
                                }}
                                activeOpacity={0.7}>
                                <Image
                                  style={{
                                    width: viewHeight * 0.35,
                                    height: viewHeight * 0.35,
                                    resizeMode: 'contain',
                                  }}
                                  source={{uri: item[0]}}
                                />
                              </TouchableOpacity>
                            )}
                          />
                        </View>
                      ) : null}
                      <View style={{flex: 1}}>
                        <TouchableOpacity
                          onPress={() => {
                            setFlickrImagesLarge(textDescription);
                          }}
                          activeOpacity={0.7}>
                          {textDescription === 'Searching...' ? (
                            <View>
                              <ActivityIndicatorComponents.randomColorActivityIndicator
                                randomColor={randomColor}
                              />
                            </View>
                          ) : (
                            <View>
                              <Card.Title
                                title={
                                  descriptionSplit.length > 1
                                    ? descriptionSplit[0]
                                    : 'Description'
                                }
                                subtitle={
                                  'Words ' +
                                  (descriptionSplit.length > 1
                                    ? language === 'English'
                                      ? descriptionSplit[1].split(' ').length
                                      : descriptionSplit[1].length
                                    : '0')
                                }
                              />
                              <Divider bold />
                              <Card.Content>
                                <Paragraph
                                  style={{
                                    fontSize: 15,
                                  }}>
                                  {descriptionSplit.length > 1
                                    ? descriptionSplit[1]
                                    : 'No Description'}
                                </Paragraph>
                              </Card.Content>
                            </View>
                          )}
                        </TouchableOpacity>
                      </View>
                      <View>
                        <Card.Title
                          title={'Related Animals'}
                          subtitle={
                            'Total ' +
                            (!qldResultLoading ? qldResult.length : '0')
                          }
                        />
                        <Divider bold />
                        <Card.Content>
                          {!qldResultLoading ? (
                            <QldResultsCard qldResult={qldResult} />
                          ) : (
                            <Paragraph>No data</Paragraph>
                          )}
                        </Card.Content>
                      </View>
                    </BottomSheetScrollView>
                  )
                ) : (
                  <View style={{flex: 1, width: '100%', alignItems: 'center'}}>
                    <NestableScrollContainer>
                      <NestableDraggableFlatList
                        containerStyle={{marginBottom: 60}}
                        keyExtractor={keyExtractor}
                        data={
                          matchResult[0].text
                            ? matchResult
                            : [{key: 0, text: 'No results'}]
                        }
                        onDragEnd={({data}) => setMatchResult(data)}
                        renderItem={({item, drag, isActive}) =>
                          item.text === 'No results' ||
                          item.text === classifyText[0].text ? (
                            <TouchableOpacity
                              onLongPress={drag}
                              disabled={isActive}
                              style={{
                                margin: 5,
                                width: viewWidth - 60,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderRadius: 20,
                                padding: 10,
                                borderColor: '#d4d4d4',
                                backgroundColor: '#f2f2f2',
                              }}
                              activeOpacity={0.7}>
                              {item.text === classifyText[0].text ? (
                                <Title>
                                  <ActivityIndicatorComponents.randomColorActivityIndicator
                                    randomColor={randomColor}
                                  />
                                </Title>
                              ) : (
                                <Card.Title
                                  titleStyle={{
                                    color: draggableFlatListUtils.getColor(
                                      item.text,
                                      randomColor,
                                    ),
                                  }}
                                  title={item.text}
                                />
                              )}
                            </TouchableOpacity>
                          ) : (
                            <ScaleDecorator>
                              <View
                                style={{
                                  width: viewWidth - 60,
                                  margin: 5,
                                  marginLeft: 15,
                                  marginRight: 15,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                <SwipeableItem
                                  ref={swipeRef}
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
                                      borderRadius: 20,
                                      width: viewWidth - 60,
                                      alignItems: 'center',
                                      borderColor: '#d4d4d4',
                                      borderWidth: 1,
                                      backgroundColor: '#f2f2f2',
                                    }}
                                    onPress={() => {
                                      if (
                                        matchResult[0].text !==
                                        classifyText[0].text
                                      ) {
                                        const name = item.text
                                          .split('-')[0]
                                          .trim();
                                        setSearchStack([...searchStack, name]);
                                        SearchInWiki(name).catch(error =>
                                          Alerts.serviceCurrentlyUnavailableAlert(),
                                        );
                                      }
                                    }}
                                    activeOpacity={0.7}>
                                    <Card.Title
                                      titleStyle={{
                                        color: draggableFlatListUtils.getColor(
                                          item.text,
                                          randomColor,
                                        ),
                                      }}
                                      subtitleStyle={{
                                        color: '#b4b4b4',
                                      }}
                                      title={item.text
                                        .split(constantDict.commonSeparator)[0]
                                        .trim()}
                                      subtitle={item.text
                                        .split(constantDict.commonSeparator)[1]
                                        .trim()}
                                    />
                                  </TouchableOpacity>
                                </SwipeableItem>
                              </View>
                            </ScaleDecorator>
                          )
                        }
                      />
                    </NestableScrollContainer>
                  </View>
                )}
                <Animated.View
                  style={{
                    width: '100%',
                    alignItems: 'center',
                    bottom: 0,
                    transform: [
                      {
                        translateY: animatedButtonShowHide.interpolate({
                          inputRange: [0, 100],
                          outputRange: [60, 0],
                        }),
                      },
                    ],
                  }}>
                  <FAB
                    color={draggableFlatListUtils.getColor('', randomColor)}
                    icon={'arrow-right'}
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
                    onPress={() => {
                      let imageUrl =
                        Object.keys(localImagePath)[
                          currentImage
                            ? currentImage - 1
                            : Object.keys(localImagePath).length - 1
                        ];
                      navigation.navigate('JournalLogPreview', {
                        imagePath: imageUrl,
                        imageId: localImagePath[imageUrl],
                        textDescription: textDescription,
                        matchResult: matchResult
                          .filter(i => i.text !== '')
                          .map(result => {
                            return {
                              key: result.key,
                              text: result.text.split('-')[0].trim(),
                            };
                          }),
                      });
                    }}
                  />
                </Animated.View>
              </Card>
            </BottomSheet>
          </SafeAreaView>
        </FlingGestureHandler>
      </FlingGestureHandler>
    </FlingGestureHandler>
  );
};
const styles = StyleSheet.create({
  noImageView: {
    flex: 1,
    // backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainView: {
    flex: 1,
    justifyItems: 'space-between',
  },
  linearGradientBackground: {
    width: '100%',
    alignItems: 'center',
    elevation: 5,
    backgroundColor: '#f2f2f2',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  imageLargeContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  image: {
    flex: 1,
    margin: 4,
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  apiButtonView: {
    flexDirection: 'row',
    justifyItems: 'space-between',
  },
  disabledText: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '47%',
    height: 40,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    backgroundColor: '#bdbdbd',
  },
  createJournalButton: {
    bottom: -5,
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '47%',
    height: 40,
    margin: 2,
    marginRight: 2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#f2f2f2',
    elevation: 5,
  },
  buttonTextStyle: {
    color: '#FFFFFF',
    paddingVertical: 10,
    fontSize: 15,
  },
  descriptionImageContainerStyle: {
    margin: 2,
    marginBottom: 10,
    resizeMode: 'contain',
    justifyContent: 'center',
  },
});
export default ImageClassificationResultScreen;
