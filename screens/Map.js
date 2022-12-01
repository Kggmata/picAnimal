import {Image, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import MapView, {Circle, Marker} from 'react-native-maps';
import {Directions, FlingGestureHandler} from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import {
  Card,
  Divider,
  IconButton,
  Paragraph,
  Searchbar,
  Subheading,
  ToggleButton,
} from 'react-native-paper';
import Alerts from '../function/AlertFunc';
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import constantDict from '../constant/Constant';
import ActivityIndicatorComponents from '../components/ActivityIndicatorComponents';
import Apis from '../function/Apis';
import ImageViewer from 'react-native-image-zoom-viewer';
import draggableFlatListUtils from '../function/DraggableFlatList';

const MapScreen = ({route, navigation}) => {
  const [viewHeight, setViewHeight] = useState(
    global.viewHeight ? global.viewHeight : 500,
  ); // set view height
  const [viewWidth, setViewWidth] = useState(
    global.viewWidth ? global.viewWidth : 500,
  ); // set view width
  const [sightingRadius, setSightingRadius] = useState(5000);
  const [qldResult, setQldResult] = useState([]);
  const [qldResultLoading, setQldResultLoading] = useState(0);
  const [markers, setMarkers] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sightingRecords, setSightingRecords] = useState(null);
  const [searchStack, setSearchStack] = useState([]);
  const sheetRef = React.useRef(0);
  const [bottomSheetDescription, setBottomSheetDescription] = useState(0);
  const [flickrImages, setFlickrImages] = useState(0);
  const [flickImagesLarge, setFlickrImagesLarge] = useState(0);
  const [imageViewerDescription, setImageViewerDescription] = useState('');
  const [bottomSheetLoading, setBottomSheetLoading] = useState(0);
  const mapRef = useRef(null);
  const [circleCenter, setCircleCenter] = useState({
    latitude: global.currentPosition
      ? global.currentPosition.latitude
      : -20.917574,
    longitude: global.currentPosition
      ? global.currentPosition.longitude
      : 142.702789,
  });
  const [currentUserLocation, setCurrentUserLocation] = useState({
    latitude: global.currentPosition
      ? global.currentPosition.latitude
      : -20.917574,
    longitude: global.currentPosition
      ? global.currentPosition.longitude
      : 142.702789,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
    timestamp: global.currentPosition
      ? global.currentPosition.timestamp
      : Date.now(),
  });

  function matchMarkers(value, key) {
    if (
      key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      value[1].filter(i =>
        i[0].toLowerCase().includes(searchQuery.toLowerCase()),
      ).length > 0
    ) {
      return key;
    }
  }

  function fitToMarkers() {
    mapRef.current.fitToSuppliedMarkers(
      Object.entries(markers).map(([key, value]) => {
        return matchMarkers(value, key);
      }),
    );
  }

  useEffect(() => {
    if (route.params) {
      if (route.params.journalId) {
        setSearchQuery(route.params.journalId);
      }
    }
    fitToMarkers();
  }, [route.params]);

  useEffect(() => {
    fitToMarkers();
  }, [searchQuery]);
  useEffect(() => {
    const subscriber = firestore()
      .collection('JournalLog')
      .onSnapshot(querySnapshot => {
        let tmpMarkers = {};
        querySnapshot.forEach(documentSnapshot => {
          if (documentSnapshot.data().location) {
            tmpMarkers[documentSnapshot.id] = [
              documentSnapshot.data().location,
              documentSnapshot
                .data()
                .options.map(i =>
                  i.split(constantDict.commonSeparatorOfForumLike),
                ),
            ];
          }
        });
        setMarkers({
          ...markers,
          ...tmpMarkers,
        });
      });

    return () => subscriber();
  }, []);
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
  const SearchInWiki = async name => {
    setBottomSheetLoading(1);
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
    fetch(
      'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=' +
        encodeURI(name),
    ).then(response => {
      response.json().then(data => {
        let page = data.query.pages;
        let pageId = Object.keys(page)[0];
        let extract = page[pageId].extract;
        if (extract) {
          setBottomSheetDescription(
            name + constantDict.commonSeparatorOfForumLike + extract,
          );
        } else {
          setBottomSheetDescription('No description found');
        }
        setBottomSheetLoading(0);
      });
    });
    let qldResults;
    setQldResultLoading(1);
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
              setQldResultLoading(0);
            }
          });
        } else {
          setQldResult(qldResults);
          setQldResultLoading(0);
        }
      })
      .catch(error => Alerts.serviceCurrentlyUnavailableAlert());
  };

  function cleanResults() {
    setBottomSheetDescription('');
    setFlickrImages('');
    setFlickrImagesLarge('');
    setQldResult([]);
  }

  function fetchNearbyAnimalsFromQLDAPI(e) {
    let myHeaders = new Headers();
    myHeaders.append(
      'Cookie',
      'TS01078244=01be35c1030fc0aedce630fc026cf11fd66f854762fa16bf6311a7567913f2e5535e67ab8e0f5a1af34ded4bdfe1daea6f6d2c8e6d; TS01078244028=0127703ba59b2ae1f19bf0b4a7d3116628cfadb1d7f4bfdc4423633d8f3753f1ca4129060b1c72401af1b09a2b09b64401a9ec06e8',
    );
    let requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };

    const url =
      'https://apps.des.qld.gov.au/species/?op=getspecieslist&kingdom=animals&f=json&circle=' +
      e.latitude +
      ',' +
      e.longitude +
      ',' +
      sightingRadius;
    fetch(url, requestOptions)
      .then(response => response.json())
      .then(result => {
        const animalSightingLi =
          result.SpeciesSightingSummariesContainer.SpeciesSightingSummary;
        setSightingRecords(animalSightingLi);
      })
      .catch(error => console.log('error', error));
  }

  const descriptionSplit = bottomSheetDescription
    ? bottomSheetDescription.split(constantDict.commonSeparatorOfForumLike)
    : null;

  const QldResultsCard = props => {
    return props.qldResult.map((result, index) => {
      if (index < 10) {
        const familyCommonName = result.FamilyCommonName;
        const scientificName = result.ScientificName;
        const classCommonName = result.ClassCommonName;
        const conservationSignificant =
          result.ConservationStatus.ConservationSignificant;
        const ncaStatus = result.ConservationStatus.NCAStatus;
        const ncaStatusCode = result.ConservationStatus.NCAStatusCode;
        const endemicity = result.Endemicity;
        const speciesEnvironment = result.SpeciesEnvironment;
        return (
          <TouchableOpacity
            onPress={() => {
              const acceptedCommonNameTrim = result.AcceptedCommonName.trim();
              setSearchStack([...searchStack, acceptedCommonNameTrim]);
              SearchInWiki(acceptedCommonNameTrim).catch(error =>
                Alerts.serviceCurrentlyUnavailableAlert(),
              );
            }}
            onLongPress={() => {
              cleanResults();
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
                subtitle={
                  'Class:' +
                  classCommonName +
                  '&' +
                  'Family:' +
                  familyCommonName
                }
              />
              <Card.Content>
                <Paragraph>
                  ScientificName:
                  {scientificName ? scientificName : 'No data'}
                </Paragraph>
                <Paragraph>
                  Conservation:
                  {conservationSignificant
                    ? conservationSignificant
                    : 'No significant'}
                </Paragraph>
                <Paragraph>
                  NCA Status:
                  {ncaStatus ? ncaStatus : 'No data'}
                </Paragraph>
                <Paragraph>
                  NCA Status Code:
                  {ncaStatusCode ? ncaStatusCode : 'No data'}
                </Paragraph>
                <Paragraph>
                  Endemicity:
                  {endemicity ? endemicity : 'No data'}
                </Paragraph>
                <Paragraph>
                  Species Environment:
                  {speciesEnvironment ? speciesEnvironment : 'No data'}
                </Paragraph>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        );
      }
    });
  };

  return (
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
            sheetRef.current.snapToIndex(0);
          }
        }}>
        <SafeAreaView style={{flex: 1}}>
          <Searchbar
            style={{borderColor: '#d4d4d4', borderWidth: 1}}
            placeholder="Search"
            onChangeText={query => {
              setSearchQuery(query);
            }}
            value={searchQuery}
          />
          <View style={{flex: 1}}>
            <MapView
              ref={mapRef}
              onLongPress={() => {
                sheetRef.current.snapToIndex(1);
              }}
              onPress={event => {
                console.log(event.nativeEvent.coordinate);
                setCircleCenter({
                  latitude: event.nativeEvent.coordinate.latitude,
                  longitude: event.nativeEvent.coordinate.longitude,
                });
                fetchNearbyAnimalsFromQLDAPI(event.nativeEvent.coordinate);
              }}
              onUserLocationChange={e => {
                let geolocationData = {
                  latitude: e.nativeEvent.coordinate.latitude,
                  longitude: e.nativeEvent.coordinate.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                  timestamp: Date.now(),
                };
                setCurrentUserLocation(geolocationData);
                global.currentPosition = geolocationData;
              }}
              showsUserLocation
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
              initialRegion={{
                latitude: currentUserLocation.latitude,
                longitude: currentUserLocation.longitude,
                latitudeDelta: currentUserLocation.latitudeDelta,
                longitudeDelta: currentUserLocation.longitudeDelta,
              }}
              customMapStyle={mapStyle}>
              <Circle
                center={{
                  latitude: circleCenter.latitude,
                  longitude: circleCenter.longitude,
                }}
                radius={sightingRadius}
                strokeColor={'#f2f2f2'}
                fillColor={'rgba(242, 242, 242,0.5)'}
              />
              {markers
                ? Object.entries(markers).map(([key, value]) => {
                    if (matchMarkers(value, key)) {
                      return (
                        <Marker
                          identifier={key}
                          pinColor={'yellow'}
                          onCalloutPress={() => {
                            Alerts.fromMarkerToDiscoverConfirm(() => {
                              navigation.navigate('DiscoverStack', {
                                screen: 'Discover',
                                params: {
                                  journalId: key,
                                },
                              });
                            });
                          }}
                          key={key}
                          coordinate={{
                            latitude: value[0].latitude,
                            longitude: value[0].longitude,
                          }}
                          title={key}
                          description={value[1].join('\n')}
                        />
                      );
                    }
                  })
                : null}
            </MapView>
            <BottomSheet
              handleStyle={{
                backgroundColor: '#b4b4b4',
              }}
              enableContentPanningGesture={false}
              ref={sheetRef}
              snapPoints={useMemo(
                () => [1, global.viewHeight ? global.viewHeight : 600],
                [],
              )}
              index={0}>
              {bottomSheetLoading ? (
                <View style={{flex: 1}}>
                  <ActivityIndicatorComponents.randomColorActivityIndicator />
                </View>
              ) : flickImagesLarge ? (
                <View style={{flex: 1}}>
                  <ImageViewer
                    onLongPress={() => {
                      setFlickrImagesLarge('');
                    }}
                    onClick={() => {
                      setImageViewerDescription(!imageViewerDescription);
                    }}
                    saveToLocalByLongPress={false}
                    index={flickrImages
                      .map(item => item[0])
                      .indexOf(flickImagesLarge)}
                    imageUrls={flickrImages.map(imageUrl => {
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
                          {flickrImages.map(item => item[1])[currentIndex] ? (
                            <Paragraph>
                              Description:
                              {flickrImages.map(item => item[1])[currentIndex]}
                            </Paragraph>
                          ) : null}
                          <Paragraph>
                            By {flickrImages.map(item => item[2])[currentIndex]}
                          </Paragraph>
                        </View>
                      ) : null;
                    }}
                  />
                </View>
              ) : (
                <View style={{flex: 1}}>
                  {bottomSheetDescription ? (
                    <View style={{flex: 1}}>
                      <Card.Title
                        title={'Search Results'}
                        right={() => {
                          return (
                            <View style={{flexDirection: 'row'}}>
                              <IconButton
                                icon={'arrow-left'}
                                onPress={() => {
                                  searchStack.pop();
                                  if (searchStack.length) {
                                    SearchInWiki(searchStack.pop()).catch(
                                      error =>
                                        Alerts.serviceCurrentlyUnavailableAlert(),
                                    );
                                  } else {
                                    setBottomSheetDescription(null);
                                  }
                                }}
                              />
                              <IconButton
                                icon={'close'}
                                onPress={() => {
                                  setBottomSheetDescription(null);
                                }}
                              />
                            </View>
                          );
                        }}
                      />
                      <Divider bold />
                      <BottomSheetScrollView>
                        {flickrImages ? (
                          <View>
                            <Card.Title
                              title={'Images From Flickr'}
                              subtitle={'Total ' + flickrImages.length}
                            />
                            <BottomSheetFlatList
                              style={{flex: 1, backgroundColor: '#b4b4b4'}}
                              horizontal
                              data={flickrImages}
                              renderItem={({item}) => (
                                <TouchableOpacity
                                  style={{
                                    margin: 2,
                                    marginBottom: 10,
                                    resizeMode: 'contain',
                                    justifyContent: 'center',
                                    width: viewWidth,
                                  }}
                                  onPress={() => {
                                    setFlickrImagesLarge(item[0]);
                                  }}
                                  onLongPress={() => {
                                    cleanResults();
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
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onLongPress={() => {
                            cleanResults();
                          }}>
                          <Card.Title
                            title={descriptionSplit[0]}
                            subtitle={
                              'Words ' +
                              (descriptionSplit[1]
                                ? descriptionSplit[1].split(' ').length
                                : 0)
                            }
                          />
                          <Divider bold />
                          <Card.Content>
                            <Paragraph>
                              {descriptionSplit[1]
                                ? descriptionSplit[1]
                                : 'No description'}
                            </Paragraph>
                          </Card.Content>
                        </TouchableOpacity>
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
                    </View>
                  ) : (
                    <View style={{flex: 1}}>
                      <Card.Title
                        title={'Animals Sightings'}
                        subtitle={
                          'Radius ' +
                          sightingRadius +
                          ' meters ' +
                          '| Total ' +
                          (sightingRecords ? sightingRecords.length : '0')
                        }
                      />
                      <ToggleButton.Row
                        onValueChange={value => setSightingRadius(value)}
                        value={sightingRadius}>
                        <ToggleButton
                          icon={() => (
                            <View>
                              <Paragraph
                                style={{
                                  color: draggableFlatListUtils.getColor(
                                    '',
                                    global.randomColor,
                                  ),
                                }}>
                                5000
                              </Paragraph>
                            </View>
                          )}
                          value={5000}
                          style={{flex: 1}}
                        />
                        <ToggleButton
                          icon={() => (
                            <View>
                              <Paragraph
                                style={{
                                  color: draggableFlatListUtils.getColor(
                                    '',
                                    global.randomColor,
                                  ),
                                }}>
                                10000
                              </Paragraph>
                            </View>
                          )}
                          value={10000}
                          style={{flex: 1}}
                        />
                        <ToggleButton
                          icon={() => (
                            <View>
                              <Paragraph
                                style={{
                                  color: draggableFlatListUtils.getColor(
                                    '',
                                    global.randomColor,
                                  ),
                                }}>
                                15000
                              </Paragraph>
                            </View>
                          )}
                          value={15000}
                          style={{flex: 1}}
                        />
                      </ToggleButton.Row>
                      <Divider bold />
                      <Card.Content style={{flex: 1}}>
                        {sightingRecords ? (
                          <BottomSheetFlatList
                            data={sightingRecords}
                            renderItem={({item, index}) => {
                              if (index < constantDict.numberOfTagButtons) {
                                const result = item.Species;
                                const familyCommonName =
                                  result.FamilyCommonName;
                                const scientificName = result.ScientificName;
                                const classCommonName = result.ClassCommonName;
                                const conservationStatus =
                                  result.ConservationStatus;
                                const endemicity = result.Endemicity;
                                const speciesEnvironment =
                                  result.SpeciesEnvironment;
                                const taxonID = result.TaxonID;
                                return (
                                  <TouchableOpacity
                                    onPress={() => {
                                      const acceptedCommonNameTrim =
                                        result.AcceptedCommonName.trim();
                                      setSearchStack([
                                        ...searchStack,
                                        acceptedCommonNameTrim,
                                      ]);
                                      SearchInWiki(
                                        acceptedCommonNameTrim,
                                      ).catch(error =>
                                        Alerts.serviceCurrentlyUnavailableAlert(),
                                      );
                                    }}
                                    onLongPress={() => {
                                      cleanResults();
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
                                          {familyCommonName
                                            ? familyCommonName
                                            : 'No data'}
                                        </Paragraph>
                                        <Subheading>Class</Subheading>
                                        <Paragraph>
                                          {classCommonName
                                            ? classCommonName
                                            : 'No data'}
                                        </Paragraph>
                                        <Subheading>ScientificName</Subheading>
                                        <Paragraph>
                                          {scientificName
                                            ? scientificName
                                            : 'No data'}
                                        </Paragraph>
                                        <Subheading>Conservation </Subheading>
                                        <Paragraph>
                                          {conservationStatus
                                            ? Object.entries(
                                                conservationStatus,
                                              ).join('\n')
                                            : 'Not matter'}
                                        </Paragraph>
                                        <Subheading>Endemicity</Subheading>
                                        <Paragraph>
                                          {endemicity ? endemicity : 'No data'}
                                        </Paragraph>
                                        <Subheading>
                                          Species Environment
                                        </Subheading>
                                        <Paragraph>
                                          {speciesEnvironment
                                            ? speciesEnvironment
                                            : 'No data'}
                                        </Paragraph>
                                      </Card.Content>
                                    </Card>
                                  </TouchableOpacity>
                                );
                              }
                            }}
                          />
                        ) : null}
                      </Card.Content>
                    </View>
                  )}
                </View>
              )}
            </BottomSheet>
          </View>
        </SafeAreaView>
      </FlingGestureHandler>
    </FlingGestureHandler>
  );
};
const mapStyle = [
  {
    elementType: 'geometry',
    stylers: [
      {
        color: '#ebe3cd',
      },
    ],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#523735',
      },
    ],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#f5f1e6',
      },
    ],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#c9b2a6',
      },
    ],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#dcd2be',
      },
    ],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#ae9e90',
      },
    ],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [
      {
        color: '#dfd2ae',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [
      {
        color: '#dfd2ae',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#93817c',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#a5b076',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#447530',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      {
        color: '#f5f1e6',
      },
    ],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [
      {
        color: '#fdfcf8',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [
      {
        color: '#f8c967',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#e9bc62',
      },
    ],
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry',
    stylers: [
      {
        color: '#e98d58',
      },
    ],
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#db8555',
      },
    ],
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#806b63',
      },
    ],
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [
      {
        color: '#dfd2ae',
      },
    ],
  },
  {
    featureType: 'transit.line',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#8f7d77',
      },
    ],
  },
  {
    featureType: 'transit.line',
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#ebe3cd',
      },
    ],
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [
      {
        color: '#dfd2ae',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#b9d3c2',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#92998d',
      },
    ],
  },
];
export default MapScreen;
