import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import Alerts from '../function/AlertFunc';
import LoginLogOut from '../function/LoginLogOutFunc';
import storage from '@react-native-firebase/storage';
import {Directions, FlingGestureHandler} from 'react-native-gesture-handler';
import {
  Button,
  Card,
  Divider,
  IconButton,
  Paragraph,
  Searchbar,
  Subheading,
  Title,
} from 'react-native-paper';
import draggableFlatListUtils from '../function/DraggableFlatList';
import AvatarImage from 'react-native-paper/src/components/Avatar/AvatarImage';
import ActivityIndicatorComponents from '../components/ActivityIndicatorComponents';
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import constantDict from '../constant/Constant';
import {SceneMap, TabBar, TabView} from 'react-native-tab-view';

const UserSettingsScreen = ({navigation}) => {
  const [order, setOrder] = useState(null);
  const [viewHistory, setViewHistory] = useState(
    global.viewHistory.map(item =>
      item?.split(constantDict.commonSeparatorOfForumLike),
    ),
  ); // loading status of geo information
  const [userName, setUserName] = useState(global.loginUser);
  const [userPassword, setUserPassword] = useState(null);
  const [userImages, setUserImages] = useState([]);
  const [userLike, setUserLike] = useState([]);
  const [userImagesUrl, setUserImagesUrl] = useState({});
  const [userJournals, setUserJournals] = useState([]);
  const [userVotes, setUserVotes] = useState([]);
  const [userForum, setUserForum] = useState([]);
  const [bottomSheetType, setBottomSheetType] = useState(0);
  const [userSpecialistCertification, setUserSpecialistCertification] =
    useState(null);
  const [loadData, setLoadData] = useState(false);
  const [iconUrl, setIconUrl] = useState(false);
  const [randomColor, setRandomColor] = useState(
    global.randomColor
      ? global.randomColor
      : draggableFlatListUtils.randomColor,
  );
  const sheetRef = React.useRef(0);
  const blockDict = ['I', 'J', 'V', 'F', 'H', 'L'];
  const bottomTitleDict = {
    I: 'Image Taken',
    J: 'Journal Log',
    V: 'Votes',
    F: 'Forum Reply',
    H: 'View History',
    L: 'Like',
  };
  const bottomSearchPlaceholderDict = {
    I: 'Search',
    J: 'Search',
    V: 'Search',
    F: 'Search',
    H: 'Search',
    L: 'Search',
  };

  const SortButton = () => {
    return (
      <View style={{flexDirection: 'row'}}>
        <IconButton
          icon={'sort-descending'}
          selected={order === 'descending'}
          onPress={() => {
            setOrder(order === 'descending' ? null : 'descending');
          }}
        />
        <IconButton
          icon={'sort-ascending'}
          selected={order === 'ascending'}
          onPress={() => {
            setOrder(order === 'ascending' ? null : 'ascending');
          }}
        />
      </View>
    );
  };

  const bottomSheetTypeDict = {
    I: () => {
      return (
        <View style={{flex: 1}}>
          <ImageTaken />
        </View>
      );
    },
    J: () => {
      return (
        <View style={{flex: 1}}>
          <JournalsTaken />
        </View>
      );
    },
    V: () => {
      return (
        <View style={{flex: 1}}>
          <VotesTaken />
        </View>
      );
    },
    F: () => {
      return (
        <View style={{flex: 1}}>
          <ForumReply />
        </View>
      );
    },
    H: () => {
      return (
        <View style={{flex: 1}}>
          <CreateCardFromViewHistory />
        </View>
      );
    },
    L: () => {
      return (
        <View style={{flex: 1}}>
          <LikeStatistics />
        </View>
      );
    },
  };
  // update view history state when screen focus
  useEffect(() => {
    navigation.addListener('focus', e => {
      setViewHistory(
        global.viewHistory.map(item =>
          item?.split(constantDict.commonSeparatorOfForumLike),
        ),
      );
    });
  }, [global.viewHistory]);
  useEffect(() => {
    const subscriber = firestore()
      .collection('Users')
      .doc(global.loginUser)
      .onSnapshot(documentSnapshot => {
        setUserName(
          documentSnapshot.id?.split(
            constantDict.commonSeparatorOfSpecialist,
          )[0],
        );
        setUserPassword(documentSnapshot.data().password);
        setUserSpecialistCertification(
          documentSnapshot.id?.split(
            constantDict.commonSeparatorOfSpecialist,
          )[1] === 's'
            ? 1
            : 0,
        );
        setUserImages(documentSnapshot.data().images);
        setUserLike(
          documentSnapshot
            .data()
            .like.map(item =>
              item?.split(constantDict.commonSeparatorOfForumLike),
            ),
        );
        let tmpUserImagesUrl = {};
        documentSnapshot.data().images.map(item => {
          storage()
            .ref('images/' + item)
            .getDownloadURL()
            .then(url => {
              tmpUserImagesUrl = {...tmpUserImagesUrl, [item]: url};
              setUserImagesUrl(tmpUserImagesUrl);
            })
            .catch(error => {
              console.log(error);
            });
        });
        setUserJournals(documentSnapshot.data().journal);
        setUserVotes(
          documentSnapshot
            .data()
            .votes.map(item =>
              item?.split(constantDict.commonSeparatorOfForumLike),
            ),
        );
        setUserForum(
          documentSnapshot
            .data()
            .forum.map(item =>
              item?.split(constantDict.commonSeparatorOfForumLike),
            ),
        );
        setLoadData(true);
        if (documentSnapshot.data()) {
          storage()
            .ref('icon/' + documentSnapshot.data().icon + '.jpg')
            .getDownloadURL()
            .then(url => {
              setIconUrl(url);
            })
            .catch(error => {
              setIconUrl(
                'https://cdn-icons-png.flaticon.com/512/747/747376.png',
              );
            });
        }
      });
    return () => subscriber();
  }, [global.loginUser]);
  useEffect(() => {
    if (bottomSheetType === 'L') {
      if (order === 'ascending') {
        userLike.sort((a, b) => {
          return getDateFromId(a[0]).localeCompare(getDateFromId(b[0]));
        });
      } else if (order === 'descending') {
        userLike.sort((a, b) => {
          return getDateFromId(b[0]).localeCompare(getDateFromId(a[0]));
        });
      }
    } else if (bottomSheetType === 'I') {
      if (order === 'ascending') {
        userImages.sort((a, b) => {
          return getDateFromId(a).localeCompare(getDateFromId(b));
        });
      } else if (order === 'descending') {
        userImages.sort((a, b) => {
          return getDateFromId(b).localeCompare(getDateFromId(a));
        });
      }
    } else if (bottomSheetType === 'J') {
      if (order === 'ascending') {
        userJournals.sort((a, b) => {
          return getDateFromId(a).localeCompare(getDateFromId(b));
        });
      } else if (order === 'descending') {
        userJournals.sort((a, b) => {
          return getDateFromId(b).localeCompare(getDateFromId(a));
        });
      }
    } else if (bottomSheetType === 'V') {
      if (order === 'ascending') {
        userVotes.sort((a, b) => {
          return getDateFromId(a[1]).localeCompare(getDateFromId(b[1]));
        });
      } else if (order === 'descending') {
        userVotes.sort((a, b) => {
          return getDateFromId(b[1]).localeCompare(getDateFromId(a[1]));
        });
      }
    } else if (bottomSheetType === 'F') {
      if (order === 'ascending') {
        userForum.sort((a, b) => {
          return getDateFromId(a[1]).localeCompare(getDateFromId(b[1]));
        });
      } else if (order === 'descending') {
        userForum.sort((a, b) => {
          return getDateFromId(b[1]).localeCompare(getDateFromId(a[1]));
        });
      }
    } else if (bottomSheetType === 'H') {
      if (order === 'ascending') {
        viewHistory.sort((a, b) => {
          return getDateFromId(a[1]).localeCompare(getDateFromId(b[1]));
        });
      } else if (order === 'descending') {
        viewHistory.sort((a, b) => {
          return getDateFromId(b[1]).localeCompare(getDateFromId(a[1]));
        });
      }
    }
    setUserLike([...userLike]);
  }, [bottomSheetType, order]);
  const CreateCardFromViewHistory = () => {
    const [bottomSheetSearchQuery, setBottomSheetSearchQuery] = useState(''); // bottom sheet search query
    function viewHistoryMatchSearchQuery(item) {
      let res = [];
      item.map(i => {
        if (!res.includes('Id')) {
          res.push(
            i.toLowerCase().includes(bottomSheetSearchQuery.toLowerCase())
              ? 'Id'
              : null,
          );
        }
        if (!res.includes('Time')) {
          res.push(
            getDateFromId(i)
              .toLowerCase()
              .includes(bottomSheetSearchQuery.toLowerCase())
              ? 'Time'
              : null,
          );
        }
      });
      res = res.filter(r => r !== false && r !== null);
      return res;
    }

    return (
      <View style={{flex: 1}}>
        <Searchbar
          style={{borderColor: '#d4d4d4', borderWidth: 1}}
          placeholder={bottomSearchPlaceholderDict[bottomSheetType]}
          onChangeText={query => setBottomSheetSearchQuery(query)}
          value={bottomSheetSearchQuery}
        />
        <Card.Title
          title={bottomTitleDict[bottomSheetType]}
          subtitle={'Total ' + sizeDict[bottomSheetType]}
          right={() => {
            return <SortButton />;
          }}
        />
        <Divider bold />
        <View style={{flex: 1}}>
          <BottomSheetFlatList
            data={viewHistory}
            renderItem={({item}) => {
              let journalId = item[0];
              let viewId = item[1];
              let viewDate = getDateFromId(viewId);
              const matchRes = viewHistoryMatchSearchQuery(item);
              return matchRes.length ? (
                <View>
                  <Card
                    style={{flex: 1, margin: 20}}
                    onPress={() => {
                      Alerts.fromMarkerToDiscoverConfirm(() => {
                        navigation.navigate('DiscoverStack', {
                          screen: 'Discover',
                          params: {
                            journalId: journalId,
                          },
                        });
                      });
                    }}>
                    <Card.Title
                      title={journalId}
                      subtitleNumberOfLines={2}
                      subtitle={'View Time \n' + viewDate}
                    />
                    <Card.Content style={{alignItems: 'center'}}>
                      {item.map((i, index) => {
                        if (index > 1) {
                          return (
                            <Image
                              style={{
                                width: global.viewWidth / 3,
                                height: global.viewHeight / 3,
                                resizeMode: 'contain',
                              }}
                              source={{
                                uri: i,
                              }}
                            />
                          );
                        }
                      })}
                    </Card.Content>
                    {bottomSheetSearchQuery ? (
                      <Card.Content
                        style={{
                          borderWidth: 1,
                          borderRadius: 10,
                          borderColor: '#b4b4b4',
                        }}>
                        <Subheading> {'Matches'}</Subheading>
                        {matchRes.map(i => {
                          return <Paragraph>{i}</Paragraph>;
                        })}
                      </Card.Content>
                    ) : null}
                  </Card>
                </View>
              ) : null;
            }}
          />
        </View>
      </View>
    );
  };

  function getDateFromId(text) {
    try {
      return new Date(
        Number(
          text
            .split(constantDict.commonSeparator)
            .filter(num => Number(num) > 1000000000000)[0],
        ),
      ).toLocaleString('en-US');
    } catch (error) {
      return 'Invalid Date';
    }
  }

  const ImageTaken = () => {
    const [bottomSheetSearchQuery, setBottomSheetSearchQuery] = useState(''); // bottom sheet search query
    function imageMatchSearchQuery(item) {
      let result = [];
      result.push(
        item.toLowerCase().includes(bottomSheetSearchQuery.toLowerCase())
          ? 'Id'
          : '',
      );
      result.push(
        getDateFromId(item)
          .toLowerCase()
          .includes(bottomSheetSearchQuery.toLowerCase())
          ? 'Time'
          : '',
      );
      result = result.filter(i => i !== '');
      console.log(result);
      return result;
    }

    return (
      <View style={{flex: 1}}>
        <Searchbar
          style={{borderColor: '#d4d4d4', borderWidth: 1}}
          placeholder={bottomSearchPlaceholderDict[bottomSheetType]}
          onChangeText={query => setBottomSheetSearchQuery(query)}
          value={bottomSheetSearchQuery}
        />
        <Card.Title
          title={bottomTitleDict[bottomSheetType]}
          subtitle={'Total ' + sizeDict[bottomSheetType]}
          right={() => {
            return <SortButton />;
          }}
        />
        <Divider bold />
        <Card.Content style={{flex: 1}}>
          <BottomSheetFlatList
            data={userImages}
            renderItem={({item}) => {
              const matchRes = imageMatchSearchQuery(item);
              if (matchRes.length > 0) {
                return (
                  <Card
                    style={{margin: 2}}
                    onPress={() => {
                      Alerts.fromMarkerToDiscoverConfirm(() => {
                        navigation.navigate('DiscoverStack', {
                          screen: 'Discover',
                          params: {
                            journalId: item,
                          },
                        });
                      });
                    }}
                    onLongPress={() => {
                      Alerts.deleteImageAlert(() => {
                        firestore()
                          .collection('Users')
                          .doc(global.loginUser)
                          .update({
                            images: [...userImages.filter(i => i !== item)],
                          });
                        storage()
                          .ref('images/' + item)
                          .delete()
                          .then(() => {
                            console.log('deleted');
                          })
                          .catch(err => {
                            console.log(err);
                          });
                      });
                    }}>
                    <Card.Title title={item} subtitle={getDateFromId(item)} />
                    <Image
                      style={{
                        alignSelf: 'center',
                        width: global.viewWidth * 0.33,
                        height: global.viewHeight * 0.33,
                        resizeMode: 'contain',
                      }}
                      source={{uri: userImagesUrl[item]}}
                    />
                    {bottomSheetSearchQuery ? (
                      <Card.Content
                        style={{
                          borderWidth: 1,
                          borderRadius: 10,
                          borderColor: '#b4b4b4',
                        }}>
                        <Subheading> {'Matches'}</Subheading>
                        {matchRes.map(i => {
                          return <Paragraph>{i}</Paragraph>;
                        })}
                      </Card.Content>
                    ) : null}
                  </Card>
                );
              }
            }}
          />
        </Card.Content>
      </View>
    );
  };

  const JournalsTaken = () => {
    const [bottomSheetSearchQuery, setBottomSheetSearchQuery] = useState(''); // bottom sheet search query
    function journalMatchSearchQuery(item) {
      let result = [];
      result.push(
        item.toLowerCase().includes(bottomSheetSearchQuery.toLowerCase())
          ? 'Id'
          : '',
      );
      result.push(
        getDateFromId(item)
          .toLowerCase()
          .includes(bottomSheetSearchQuery.toLowerCase())
          ? 'Time'
          : '',
      );
      result = result.filter(i => i !== '');
      console.log(result);
      return result;
    }

    return (
      <View style={{flex: 1}}>
        <Searchbar
          style={{borderColor: '#d4d4d4', borderWidth: 1}}
          placeholder={bottomSearchPlaceholderDict[bottomSheetType]}
          onChangeText={query => setBottomSheetSearchQuery(query)}
          value={bottomSheetSearchQuery}
        />
        <Card.Title
          title={bottomTitleDict[bottomSheetType]}
          subtitle={'Total ' + sizeDict[bottomSheetType]}
          right={() => {
            return <SortButton />;
          }}
        />
        <Divider bold />
        <Card.Content style={{flex: 1}}>
          <BottomSheetFlatList
            data={userJournals}
            renderItem={({item}) => {
              const matchRes = journalMatchSearchQuery(item);
              if (matchRes.length > 0) {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      Alerts.fromMarkerToDiscoverConfirm(() => {
                        navigation.navigate('DiscoverStack', {
                          screen: 'Discover',
                          params: {
                            journalId: item,
                          },
                        });
                      });
                    }}
                    onLongPress={() => {
                      Alerts.deleteJournalLogAlert(() => {
                        firestore()
                          .collection('JournalLog')
                          .doc(item)
                          .delete()
                          .then(() => {
                            console.log('Journal deleted!');
                          });
                        let newUserJournals = userJournals.filter(
                          j => j !== item,
                        );
                        firestore()
                          .collection('Users')
                          .doc(global.loginUser)
                          .update({
                            journal: [...newUserJournals],
                          });
                      });
                    }}>
                    <Card style={{margin: 2}}>
                      <Card.Title title={item} subtitle={getDateFromId(item)} />
                      {bottomSheetSearchQuery ? (
                        <Card.Content
                          style={{
                            borderWidth: 1,
                            borderRadius: 10,
                            borderColor: '#b4b4b4',
                          }}>
                          <Subheading> {'Matches'}</Subheading>
                          {matchRes.map(i => {
                            return <Paragraph>{i}</Paragraph>;
                          })}
                        </Card.Content>
                      ) : null}
                    </Card>
                  </TouchableOpacity>
                );
              }
            }}
          />
        </Card.Content>
      </View>
    );
  };

  const ForumReply = () => {
    const [bottomSheetSearchQuery, setBottomSheetSearchQuery] = useState(''); // bottom sheet search query
    function forumMatchSearchQuery(item) {
      let res = [];
      item.map(i => {
        if (!res.includes('Id')) {
          res.push(
            i.toLowerCase().includes(bottomSheetSearchQuery.toLowerCase())
              ? 'Id'
              : null,
          );
        }
        if (!res.includes('Time')) {
          res.push(
            getDateFromId(i)
              .toLowerCase()
              .includes(bottomSheetSearchQuery.toLowerCase())
              ? 'Time'
              : null,
          );
        }
      });
      res = res.filter(r => r !== false && r !== null);
      return res;
    }

    return (
      <View style={{flex: 1}}>
        <Searchbar
          style={{borderColor: '#d4d4d4', borderWidth: 1}}
          placeholder={bottomSearchPlaceholderDict[bottomSheetType]}
          onChangeText={query => setBottomSheetSearchQuery(query)}
          value={bottomSheetSearchQuery}
        />
        <Card.Title
          title={bottomTitleDict[bottomSheetType]}
          subtitle={'Total ' + sizeDict[bottomSheetType]}
          right={() => {
            return <SortButton />;
          }}
        />
        <Divider bold />
        <Card.Content style={{flex: 1}}>
          <BottomSheetFlatList
            data={userForum}
            renderItem={({item}) => {
              const matchRes = forumMatchSearchQuery(item);
              if (matchRes.length > 0) {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      Alerts.fromMarkerToDiscoverConfirm(() => {
                        navigation.navigate('DiscoverStack', {
                          screen: 'Discover',
                          params: {
                            journalId: item[0],
                          },
                        });
                      });
                    }}>
                    <Card style={{margin: 2}}>
                      <Card.Title
                        title={item[0]}
                        subtitle={getDateFromId(item[1])}
                      />
                      <Card.Content>
                        <Paragraph>{item[2]}</Paragraph>
                      </Card.Content>
                      {bottomSheetSearchQuery ? (
                        <Card.Content
                          style={{
                            borderWidth: 1,
                            borderRadius: 10,
                            borderColor: '#b4b4b4',
                          }}>
                          <Subheading> {'Matches'}</Subheading>
                          {matchRes.map(i => {
                            return <Paragraph>{i}</Paragraph>;
                          })}
                        </Card.Content>
                      ) : null}
                    </Card>
                  </TouchableOpacity>
                );
              }
            }}
          />
        </Card.Content>
      </View>
    );
  };
  const LikeStatistics = () => {
    const [bottomSheetSearchQuery, setBottomSheetSearchQuery] = useState(''); // bottom sheet search query
    const layout = useWindowDimensions();

    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
      {key: 'first', title: 'Journal'},
      {key: 'second', title: 'Forum'},
    ]);
    const FirstRoute = () => (
      <View style={{flex: 1}}>
        <Card.Title
          title={'Journal ' + bottomTitleDict[bottomSheetType]}
          subtitle={'Total ' + sizeDict.LJ}
          right={() => {
            return <SortButton />;
          }}
        />
        <Divider bold />
        <Card.Content style={{flex: 1}}>
          <BottomSheetScrollView>
            {userLike.map(item => {
              const matchRes = likeMatchSearchQuery(item);
              if (matchRes.length > 0 && item[2] === 'J') {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      Alerts.fromMarkerToDiscoverConfirm(() => {
                        navigation.navigate('DiscoverStack', {
                          screen: 'Discover',
                          params: {
                            journalId: item[0],
                          },
                        });
                      });
                    }}>
                    <Card style={{margin: 2}}>
                      <Card.Title title={item[0]} />
                      {bottomSheetSearchQuery ? (
                        <Card.Content
                          style={{
                            borderWidth: 1,
                            borderRadius: 10,
                            borderColor: '#b4b4b4',
                          }}>
                          <Subheading> {'Matches'}</Subheading>
                          {matchRes.map(i => {
                            return <Paragraph>{i}</Paragraph>;
                          })}
                        </Card.Content>
                      ) : null}
                    </Card>
                  </TouchableOpacity>
                );
              }
            })}
          </BottomSheetScrollView>
        </Card.Content>
      </View>
    );

    const SecondRoute = () => (
      <View style={{flex: 1}}>
        <Card.Title
          title={'Forum ' + bottomTitleDict[bottomSheetType]}
          subtitle={'Total ' + sizeDict.LF}
          right={() => {
            return <SortButton />;
          }}
        />
        <Divider bold />
        <Card.Content style={{flex: 1}}>
          <BottomSheetScrollView>
            {userLike.map(item => {
              const matchRes = likeMatchSearchQuery(item);
              if (matchRes.length > 0 && item[2] === 'F') {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      Alerts.fromMarkerToDiscoverConfirm(() => {
                        navigation.navigate('DiscoverStack', {
                          screen: 'Discover',
                          params: {
                            journalId: item[0],
                          },
                        });
                      });
                    }}>
                    <Card style={{margin: 2}}>
                      <Card.Title title={item[0]} />
                      {bottomSheetSearchQuery ? (
                        <Card.Content
                          style={{
                            borderWidth: 1,
                            borderRadius: 10,
                            borderColor: '#b4b4b4',
                          }}>
                          <Subheading> {'Matches'}</Subheading>
                          {matchRes.map(i => {
                            return <Paragraph>{i}</Paragraph>;
                          })}
                        </Card.Content>
                      ) : null}
                    </Card>
                  </TouchableOpacity>
                );
              }
            })}
          </BottomSheetScrollView>
        </Card.Content>
      </View>
    );

    const renderScene = SceneMap({
      first: FirstRoute,
      second: SecondRoute,
    });

    function likeMatchSearchQuery(item) {
      let res = [];
      if (bottomSheetSearchQuery.toLowerCase() === 'journal') {
        res.push(item[2] === 'F' ? 'Journal' : null);
      }
      item.map(i => {
        if (!res.includes('Id')) {
          res.push(
            i.toLowerCase().includes(bottomSheetSearchQuery.toLowerCase())
              ? 'Id'
              : null,
          );
        }
        if (!res.includes('Time')) {
          res.push(
            getDateFromId(i)
              .toLowerCase()
              .includes(bottomSheetSearchQuery.toLowerCase())
              ? 'Time'
              : null,
          );
        }
      });
      res = res.filter(r => r !== false && r !== null);
      return res;
    }

    return (
      <View style={{flex: 1}}>
        <Searchbar
          style={{borderColor: '#d4d4d4', borderWidth: 1}}
          placeholder={bottomSearchPlaceholderDict[bottomSheetType]}
          onChangeText={query => setBottomSheetSearchQuery(query)}
          value={bottomSheetSearchQuery}
        />
        <TabView
          renderTabBar={props => (
            <TabBar
              labelStyle={{color: 'black'}}
              {...props}
              style={{backgroundColor: '#f2f2f2'}}
            />
          )}
          navigationState={{index, routes}}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{width: layout.width}}
        />
      </View>
    );
  };
  const VotesTaken = () => {
    const [bottomSheetSearchQuery, setBottomSheetSearchQuery] = useState(''); // bottom sheet search query
    const layout = useWindowDimensions();

    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
      {key: 'first', title: 'Specialist'},
      {key: 'second', title: 'Normal'},
    ]);

    function votesMatchSearchQuery(item) {
      let res = [];
      item.map(i => {
        if (!res.includes('Id')) {
          res.push(
            i.toLowerCase().includes(bottomSheetSearchQuery.toLowerCase())
              ? 'Id'
              : null,
          );
        }
        if (!res.includes('Time')) {
          res.push(
            getDateFromId(i)
              .toLowerCase()
              .includes(bottomSheetSearchQuery.toLowerCase())
              ? 'Time'
              : null,
          );
        }
      });
      res = res.filter(r => r !== false && r !== null);
      return res;
    }

    const FirstRoute = () => (
      <View style={{flex: 1}}>
        <Card.Title
          title={'Specialist ' + bottomTitleDict[bottomSheetType]}
          subtitle={'Total ' + sizeDict.VS}
          right={() => {
            return <SortButton />;
          }}
        />
        <Divider bold />
        <Card.Content style={{flex: 1}}>
          <BottomSheetFlatList
            data={userVotes}
            renderItem={({item}) => {
              const matchRes = votesMatchSearchQuery(item);
              const optionDict = JSON.parse(item[2]);
              if (
                matchRes.length > 0 &&
                (optionDict[0]
                  ? optionDict[0][0].split(
                      constantDict.commonSeparatorOfSpecialist,
                    )[1]
                    ? 1
                    : 0
                  : 0)
              ) {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      Alerts.fromMarkerToDiscoverConfirm(() => {
                        navigation.navigate('DiscoverStack', {
                          screen: 'Discover',
                          params: {
                            journalId: item[0],
                          },
                        });
                      });
                    }}>
                    <Card style={{margin: 2}}>
                      <Card.Title
                        title={item[0]}
                        subtitleNumberOfLines={2}
                        subtitle={getDateFromId(item[1])}
                      />
                      <Card.Content>
                        {optionDict.map(i => {
                          return (
                            <Paragraph>
                              {i[0]
                                ? i[0].split(
                                    constantDict.commonSeparatorOfSpecialist,
                                  )[0]
                                : null}
                            </Paragraph>
                          );
                        })}
                      </Card.Content>
                      {bottomSheetSearchQuery ? (
                        <Card.Content
                          style={{
                            borderWidth: 1,
                            borderRadius: 10,
                            borderColor: '#b4b4b4',
                          }}>
                          <Subheading> {'Matches'}</Subheading>
                          {matchRes.map(i => {
                            return <Paragraph>{i}</Paragraph>;
                          })}
                        </Card.Content>
                      ) : null}
                    </Card>
                  </TouchableOpacity>
                );
              }
            }}
          />
        </Card.Content>
      </View>
    );

    const SecondRoute = () => (
      <View style={{flex: 1}}>
        <Card.Title
          title={'Normal ' + bottomTitleDict[bottomSheetType]}
          subtitle={'Total ' + sizeDict.VN}
          right={() => {
            return <SortButton />;
          }}
        />
        <Divider bold />
        <Card.Content style={{flex: 1}}>
          <BottomSheetFlatList
            data={userVotes}
            renderItem={({item}) => {
              const matchRes = votesMatchSearchQuery(item);
              const optionDict = JSON.parse(item[2]);
              if (
                matchRes.length > 0 && optionDict[0]
                  ? optionDict[0][0].split(
                      constantDict.commonSeparatorOfSpecialist,
                    )[1]
                    ? 0
                    : 1
                  : 1
              ) {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      Alerts.fromMarkerToDiscoverConfirm(() => {
                        navigation.navigate('DiscoverStack', {
                          screen: 'Discover',
                          params: {
                            journalId: item[0],
                          },
                        });
                      });
                    }}>
                    <Card style={{margin: 2}}>
                      <Card.Title
                        title={item[0]}
                        subtitleNumberOfLines={2}
                        subtitle={getDateFromId(item[1])}
                      />
                      <Card.Content>
                        {optionDict.map(i => {
                          return (
                            <Paragraph>
                              {i[0]
                                ? i[0].split(
                                    constantDict.commonSeparatorOfSpecialist,
                                  )[0]
                                : null}
                            </Paragraph>
                          );
                        })}
                      </Card.Content>
                      {bottomSheetSearchQuery ? (
                        <Card.Content
                          style={{
                            borderWidth: 1,
                            borderRadius: 10,
                            borderColor: '#b4b4b4',
                          }}>
                          <Subheading> {'Matches'}</Subheading>
                          {matchRes.map(i => {
                            return <Paragraph>{i}</Paragraph>;
                          })}
                        </Card.Content>
                      ) : null}
                    </Card>
                  </TouchableOpacity>
                );
              }
            }}
          />
        </Card.Content>
      </View>
    );

    const renderScene = SceneMap({
      first: FirstRoute,
      second: SecondRoute,
    });

    return (
      <View style={{flex: 1}}>
        <Searchbar
          style={{borderColor: '#d4d4d4', borderWidth: 1}}
          placeholder={bottomSearchPlaceholderDict[bottomSheetType]}
          onChangeText={query => setBottomSheetSearchQuery(query)}
          value={bottomSheetSearchQuery}
        />
        <TabView
          renderTabBar={props => (
            <TabBar
              labelStyle={{color: 'black'}}
              {...props}
              style={{backgroundColor: '#f2f2f2'}}
            />
          )}
          navigationState={{index, routes}}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{width: layout.width}}
        />
      </View>
    );
  };
  const sizeDict = {
    I: userImages.length,
    J: userJournals.length,
    F: userForum.length,
    V: userVotes.length,
    VS: userVotes.filter(
      i =>
        JSON.parse(i[2])[0][0].split(
          constantDict.commonSeparatorOfSpecialist,
        )[1],
    ).length,
    VN: userVotes.filter(
      i =>
        !JSON.parse(i[2])[0][0].split(
          constantDict.commonSeparatorOfSpecialist,
        )[1],
    ).length,
    H: global.viewHistory.length,
    L: userLike.length,
    LJ: userLike.filter(like => like[2] === 'J').length,
    LF: userLike.filter(like => like[2] === 'F').length,
  };
  const contentDict = {
    I: type => {
      return (
        <Card.Content>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
            {userImages.map(item => {
              return (
                <Image
                  style={{
                    margin: 2,
                    width: global.viewWidth * 0.1,
                    height: global.viewHeight * 0.1,
                    resizeMode: 'center',
                  }}
                  source={{uri: userImagesUrl[item]}}
                />
              );
            })}
          </View>
        </Card.Content>
      );
    },
    J: type => {
      return (
        <Card.Content>
          {userJournals.map((item, index) => {
            if (index < 3) {
              return (
                <Card
                  style={{margin: 2}}
                  onPress={() => {
                    Alerts.fromMarkerToDiscoverConfirm(() => {
                      navigation.navigate('DiscoverStack', {
                        screen: 'Discover',
                        params: {
                          journalId: item,
                        },
                      });
                    });
                  }}>
                  <Card.Title title={item} subtitle={getDateFromId(item)} />
                </Card>
              );
            }
          })}
        </Card.Content>
      );
    },
    F: type => {
      return (
        <Card.Content>
          {userForum.map((item, index) => {
            if (index < 3) {
              return (
                <Card
                  style={{margin: 2}}
                  onPress={() => {
                    Alerts.fromMarkerToDiscoverConfirm(() => {
                      navigation.navigate('DiscoverStack', {
                        screen: 'Discover',
                        params: {
                          journalId: item[0],
                        },
                      });
                    });
                  }}>
                  <Card.Title
                    title={item[0]}
                    subtitle={getDateFromId(item[1])}
                  />
                </Card>
              );
            }
          })}
        </Card.Content>
      );
    },
    V: type => {
      return (
        <Card.Content>
          {userVotes.map((item, index) => {
            if (index < 3) {
              return (
                <Card
                  style={{margin: 2}}
                  onPress={() => {
                    Alerts.fromMarkerToDiscoverConfirm(() => {
                      navigation.navigate('DiscoverStack', {
                        screen: 'Discover',
                        params: {
                          journalId: item[0],
                        },
                      });
                    });
                  }}>
                  <Card.Title
                    title={item[0]}
                    subtitle={getDateFromId(item[1])}
                  />
                </Card>
              );
            }
          })}
        </Card.Content>
      );
    },
    H: type => {
      return (
        <Card.Content>
          {viewHistory.map((item, index) => {
            const dateFromId = getDateFromId(item[1]);
            if (index < 3) {
              return (
                <Card
                  style={{margin: 2}}
                  onPress={() => {
                    Alerts.fromMarkerToDiscoverConfirm(() => {
                      navigation.navigate('DiscoverStack', {
                        screen: 'Discover',
                        params: {
                          journalId: item[0],
                        },
                      });
                    });
                  }}>
                  <Card.Title title={item[0]} subtitle={dateFromId} />
                </Card>
              );
            }
          })}
        </Card.Content>
      );
    },
    L: type => {
      return (
        <Card.Content>
          <Subheading>Journal {sizeDict.LJ}</Subheading>
          {userLike.map((item, index) => {
            const likeType = item[2];
            if (index < 10 && likeType === 'J') {
              return (
                <Card
                  style={{margin: 2}}
                  onPress={() => {
                    Alerts.fromMarkerToDiscoverConfirm(() => {
                      navigation.navigate('DiscoverStack', {
                        screen: 'Discover',
                        params: {
                          journalId: item[0],
                        },
                      });
                    });
                  }}>
                  <Card.Title title={item[0]} />
                </Card>
              );
            }
          })}
          <Subheading>Forum {sizeDict.LF}</Subheading>
          {userLike.map((item, index) => {
            const likeType = item[2];
            if (index < 10 && likeType === 'F') {
              return (
                <Card
                  style={{margin: 2}}
                  onPress={() => {
                    Alerts.fromMarkerToDiscoverConfirm(() => {
                      navigation.navigate('DiscoverStack', {
                        screen: 'Discover',
                        params: {
                          journalId: item[0],
                        },
                      });
                    });
                  }}>
                  <Card.Title title={item[0]} />
                </Card>
              );
            }
          })}
        </Card.Content>
      );
    },
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
        <FlingGestureHandler
          direction={Directions.UP}
          onHandlerStateChange={({nativeEvent}) => {
            if (nativeEvent.state === 5) {
              sheetRef.current.snapToIndex(1);
            }
          }}>
          <SafeAreaView style={{flex: 1}}>
            <View style={{flex: 1}}>
              <Card
                style={{
                  flex: 1,
                }}>
                <Card.Title
                  title={userName}
                  subtitle={
                    userSpecialistCertification ? 'Specialist' : 'Normal User'
                  }
                  left={() =>
                    iconUrl ? (
                      <AvatarImage
                        source={{uri: iconUrl ? iconUrl : null}}
                        style={{backgroundColor: 'white'}}
                        size={50}
                        loading
                      />
                    ) : (
                      <ActivityIndicatorComponents.randomColorActivityIndicator
                        randomColor={randomColor}
                      />
                    )
                  }
                  right={() => (
                    <Button
                      textColor={draggableFlatListUtils.getColor(
                        '',
                        randomColor,
                      )}
                      onPress={() => {
                        Alerts.logOutConfirmationAlert(
                          navigation,
                          'Initial',
                          LoginLogOut.logout,
                        );
                      }}>
                      LOG OUT
                    </Button>
                  )}
                />
                <Divider
                  style={{borderBottomWidth: 1, borderColor: '#d4d4d4'}}
                />
                <Card.Content style={{flex: 1}}>
                  {loadData ? (
                    <ScrollView style={{flex: 1}}>
                      {blockDict.map(b => {
                        return (
                          <Card
                            style={{
                              flex: 1,
                              margin: 2,
                              borderWidth: 1,
                              borderColor: '#b4b4b4',
                            }}>
                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() => {
                                setBottomSheetType(b);
                                sheetRef.current.snapToIndex(1);
                              }}>
                              <Card.Title
                                title={bottomTitleDict[b]}
                                subtitle={'Total ' + sizeDict[b].toString()}
                              />
                              {contentDict[b](b)}
                            </TouchableOpacity>
                          </Card>
                        );
                      })}
                    </ScrollView>
                  ) : (
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <ActivityIndicatorComponents.randomColorActivityIndicator
                        randomColor={randomColor}
                      />
                    </View>
                  )}
                </Card.Content>
              </Card>
            </View>
            <BottomSheet
              handleStyle={{
                backgroundColor: '#b4b4b4',
              }}
              // enableContentPanningGesture={false}
              ref={sheetRef}
              snapPoints={useMemo(
                () => [1, global.viewHeight ? global.viewHeight : 600],
                [],
              )}
              index={0}>
              {bottomSheetTypeDict[bottomSheetType]}
            </BottomSheet>
          </SafeAreaView>
        </FlingGestureHandler>
      </FlingGestureHandler>
    </FlingGestureHandler>
  );
};
export default UserSettingsScreen;
