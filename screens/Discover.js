import {
  FlatList,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Directions, FlingGestureHandler} from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import ImageViewer from 'react-native-image-zoom-viewer';
import {
  Button,
  Card,
  Divider,
  IconButton,
  Modal,
  Paragraph,
  Portal,
  ProgressBar,
  Provider,
  Searchbar,
  Subheading,
  Text,
} from 'react-native-paper';
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import draggableFlatListUtils from '../function/DraggableFlatList';
import constantDict from '../constant/Constant';
import ActivityIndicatorComponents from '../components/ActivityIndicatorComponents';
import SwipeableItem from 'react-native-swipeable-item';
import EnterBox from '../components/Enter_box';
import Alerts from '../function/AlertFunc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TextFuncs from '../function/TextFunction';

const DiscoverScreen = ({route, navigation}) => {
  const [viewHeight, setViewHeight] = useState(
    global.viewHeight ? global.viewHeight : 500,
  );
  const [viewWidth, setViewWidth] = useState(
    global.viewWidth ? global.viewWidth : 500,
  );
  const [journals, setJournals] = useState([]);
  const [order, setOrder] = useState(null);
  const [sortType, setSortType] = useState('time');
  const [forumOrder, setForumOrder] = useState(null);
  const [forumSortType, setForumSortType] = useState('time');
  const [loading, setLoading] = useState(false);
  const [journalImages, setJournalImages] = useState({});
  const [bottomTabParas, setBottomTabParas] = useState(null);
  const [bottomImageViewer, setBottomImageViewer] = useState(0);
  const [votes, setVotes] = useState([]);
  const [forumView, setForumView] = useState(0);
  const [votesView, setVotesView] = useState(0);
  const [randomColor, setRandomColor] = useState(
    global.randomColor
      ? global.randomColor
      : draggableFlatListUtils.randomColor(),
  );
  const swipeRef = useRef(null);
  const [tagDict, setTagDict] = useState({});
  const imageUrls = useRef({});
  const [searchQuery, setSearchQuery] = useState(
    route.params ? route.params.journalId : '',
  );
  const [userVotes, setUserVotes] = useState([]);
  const [userForum, setUserForum] = useState([]);
  const [bottomImageViewerFooter, setBottomImageViewerFooter] = useState(0);

  const sheetRef = React.useRef(0);
  useEffect(() => {
    if (route.params) {
      if (route.params.journalId) {
        setSearchQuery(route.params.journalId);
      }
    }
  }, [route.params]);
  useEffect(() => {
    const subscriber = firestore()
      .collection('Users')
      .doc(global.loginUser)
      .onSnapshot(documentSnapshot => {
        if (documentSnapshot.exists) {
          setUserVotes(documentSnapshot.data().votes);
          setUserForum(documentSnapshot.data().forum);
        }
      });
    return () => subscriber();
  }, []);
  useEffect(() => {
    firestore().collection('JournalLog');
    const subscriber = firestore()
      .collection('JournalLog')
      .onSnapshot(querySnapshot => {
        const tmpJournals = [];
        const tmpTagDict = {};

        querySnapshot.forEach(documentSnapshot => {
          const optionsAfterSplit = documentSnapshot._data.options
            .map(o => o?.split(constantDict.commonSeparatorOfForumLike))
            .map(o => [o[0], Number(o[1]), o[2]]);
          optionsAfterSplit.sort((a, b) => b[1] - a[1]);
          const forumAfterSplit = documentSnapshot._data.forum.map(item =>
            item?.split(constantDict.commonSeparatorOfForumLike),
          );
          tmpJournals.push({
            journalId: documentSnapshot.id,
            images: documentSnapshot._data.images,
            options: optionsAfterSplit,
            textDescription: documentSnapshot._data.textDescription,
            forum: forumAfterSplit,
            like: documentSnapshot._data.like,
            location: documentSnapshot._data.location,
          });
          let tmpOptions = optionsAfterSplit.map(option => option[0].trim());
          tmpOptions.forEach(option => {
            let optionName = option.split(
              constantDict.commonSeparatorOfSpecialist,
            )[0];
            if (tmpTagDict[optionName] === undefined) {
              tmpTagDict[optionName] = 1;
            } else {
              tmpTagDict[optionName] += 1;
            }
          });
          imageUrls.current[documentSnapshot.id] = new Set();
          // get image URLs of the journal
          documentSnapshot._data.images.forEach(image => {
            storage()
              .ref('images/' + image)
              .getDownloadURL()
              .then(url => {
                imageUrls.current[documentSnapshot.id].add(url);
                setJournalImages({...imageUrls.current});
              })
              .catch(error => {
                console.log(error);
              });
          });
        });

        setTagDict(tmpTagDict);
        setJournals(tmpJournals);
        setLoading(false);
      });
    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, []);

  useEffect(() => {
    function getJournalFromBottomParas() {
      return journals.filter(item => {
        return item.journalId === bottomTabParas;
      })[0];
    }

    let tmpForum = {};

    function sortByLikeAscending() {
      tmpForum = getJournalFromBottomParas().forum.sort((a, b) => {
        return (
          getLikeFromJournals(bottomTabParas).filter(
            l => l?.split(constantDict.commonSeparatorOfForumLike)[0] === a[0],
          ).length -
          getLikeFromJournals(bottomTabParas).filter(
            l => l?.split(constantDict.commonSeparatorOfForumLike)[0] === b[0],
          ).length
        );
      });
    }

    function sortByLikeDescending() {
      tmpForum = getJournalFromBottomParas().forum.sort((a, b) => {
        return (
          getLikeFromJournals(bottomTabParas).filter(
            l => l?.split(constantDict.commonSeparatorOfForumLike)[0] === b[0],
          ).length -
          getLikeFromJournals(bottomTabParas).filter(
            l => l?.split(constantDict.commonSeparatorOfForumLike)[0] === a[0],
          ).length
        );
      });
    }

    function sortByTimeAscending() {
      tmpForum = getJournalFromBottomParas().forum.sort((a, b) => {
        return a[0]
          ?.split(constantDict.commonSeparator)[1]
          .localeCompare(b[0]?.split(constantDict.commonSeparator)[1]);
      });
    }

    function sortByTimeDescending() {
      tmpForum = getJournalFromBottomParas().forum.sort((a, b) => {
        return b[0]
          ?.split(constantDict.commonSeparator)[1]
          .localeCompare(a[0]?.split(constantDict.commonSeparator)[1]);
      });
    }

    if (forumSortType === 'time' && forumOrder === 'forumDescending') {
      sortByTimeDescending();
    } else if (forumSortType === 'time' && forumOrder === 'forumAscending') {
      sortByTimeAscending();
    } else if (forumSortType === 'like' && forumOrder === 'forumDescending') {
      sortByLikeDescending();
    } else if (forumSortType === 'like' && forumOrder === 'forumAscending') {
      sortByLikeAscending();
    }
    journals.map(item => {
      if (item.journalId === bottomTabParas && tmpForum.length) {
        item.forum = tmpForum;
      }
      return item;
    });
    setJournals([...journals]);
  }, [forumOrder]);
  useEffect(() => {
    function sortByLikeAscending() {
      journals.sort((a, b) => {
        return (
          a.like.filter(
            like =>
              like?.split(constantDict.commonSeparatorOfForumLike)[0] ===
              a.journalId,
          ).length -
          b.like.filter(
            like =>
              like?.split(constantDict.commonSeparatorOfForumLike)[0] ===
              b.journalId,
          ).length
        );
      });
    }

    function sortByLikeDescending() {
      journals.sort((a, b) => {
        return (
          b.like.filter(
            like =>
              like?.split(constantDict.commonSeparatorOfForumLike)[0] ===
              b.journalId,
          ).length -
          a.like.filter(
            like =>
              like?.split(constantDict.commonSeparatorOfForumLike)[0] ===
              a.journalId,
          ).length
        );
      });
    }

    function sortByTimeAscending() {
      journals.sort((a, b) => {
        return a.journalId
          ?.split(constantDict.commonSeparator)[1]
          .localeCompare(b.journalId?.split(constantDict.commonSeparator)[1]);
      });
    }

    function sortByTimeDescending() {
      journals.sort((a, b) => {
        return b.journalId
          ?.split(constantDict.commonSeparator)[1]
          .localeCompare(a.journalId?.split(constantDict.commonSeparator)[1]);
      });
    }

    if (sortType === 'time' && order === 'journalIdDescending') {
      sortByTimeDescending();
    } else if (sortType === 'time' && order === 'journalIdAscending') {
      sortByTimeAscending();
    } else if (sortType === 'like' && order === 'journalIdDescending') {
      sortByLikeDescending();
    } else if (sortType === 'like' && order === 'journalIdAscending') {
      sortByLikeAscending();
    }
    setJournals([...journals]);
  }, [order]);
  const TagButtons = () => {
    let tagLi = Object.entries(tagDict)
      .sort(([, a], [, b]) => b - a)
      .map(item => {
        let container = {};
        container.value = item[0];
        container.label = item[0];
        return container;
      });
    tagLi = [{value: 'Specialist', label: 'Specialist'}, ...tagLi];
    tagLi = [{value: 'Normal', label: 'Normal'}, ...tagLi];
    return (
      <FlatList
        horizontal
        data={tagLi}
        renderItem={({item, index}) => {
          if (index < constantDict.numberOfTagButtons) {
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                style={{
                  borderLeftWidth: 1,
                  borderColor: '#d4d4d4',
                  justifyContent: 'center',
                }}>
                <Button
                  textColor={draggableFlatListUtils.getColor('', randomColor)}
                  onPress={() => {
                    setSearchQuery(item.value);
                  }}>
                  {item.label}
                </Button>
              </TouchableOpacity>
            );
          }
        }}
      />
    );
  };

  function getForumFromJournals(journalId) {
    return journals.filter(item => item.journalId === journalId)[0].forum;
  }

  function fromTimeStampToTimeString(item) {
    return new Date(Number(item[0]?.split('-')[1])).toLocaleString('en-US');
  }

  function getLikeFromJournals(journalId) {
    return journals.filter(journal => journal.journalId === journalId)[0].like;
  }

  function updateForumLikeFireStore(forumReplyLikeStatus, item) {
    firestore()
      .collection('JournalLog')
      .doc(bottomTabParas)
      .update({
        like: forumReplyLikeStatus(item)
          ? firestore.FieldValue.arrayRemove(
              item[0] +
                constantDict.commonSeparatorOfForumLike +
                global.loginUser,
            )
          : firestore.FieldValue.arrayUnion(
              item[0] +
                constantDict.commonSeparatorOfForumLike +
                global.loginUser,
            ),
      });
    firestore()
      .collection('Users')
      .doc(global.loginUser)
      .update({
        like: forumReplyLikeStatus(item)
          ? firestore.FieldValue.arrayRemove(
              item[0] +
                constantDict.commonSeparatorOfForumLike +
                global.loginUser +
                constantDict.commonSeparatorOfForumLike +
                'F',
            )
          : firestore.FieldValue.arrayUnion(
              item[0] +
                constantDict.commonSeparatorOfForumLike +
                global.loginUser +
                constantDict.commonSeparatorOfForumLike +
                'F',
            ),
      });
  }

  const BottomSheetForumView = props => {
    const [newForumText, setNewForumText] = useState('');
    const bottomTabParasForumView = props.bottomTabParas;
    const [userForumForumView, setUserForumForumView] = useState(
      props.userForum,
    );

    function updateForumInJournalLog(forumId) {
      const forumData =
        forumId + constantDict.commonSeparatorOfForumLike + newForumText;
      firestore()
        .collection('JournalLog')
        .doc(bottomTabParasForumView)
        .update({
          forum: firestore.FieldValue.arrayUnion(forumData),
        });
    }

    function updateForumInUsers(forumId) {
      firestore()
        .collection('Users')
        .doc(global.loginUser)
        .update({
          forum: firestore.FieldValue.arrayUnion(
            bottomTabParasForumView +
              constantDict.commonSeparatorOfForumLike +
              forumId +
              constantDict.commonSeparatorOfForumLike +
              newForumText,
          ),
        });
    }

    function submitInputForum() {
      // save new forum map to firebase
      let forumId = [global.loginUser + '-' + Date.now()];
      updateForumInJournalLog(forumId);
      updateForumInUsers(forumId);
    }

    function forumReplyLikeStatus(item) {
      return journals.filter(
        journal => journal.journalId === bottomTabParasForumView,
      )[0]
        ? journals
            .filter(journal => journal.journalId === bottomTabParasForumView)[0]
            .like.filter(
              like =>
                like?.split(constantDict.commonSeparatorOfForumLike)[0] ===
                  item[0] &&
                like?.split(constantDict.commonSeparatorOfForumLike)[1] ===
                  global.loginUser,
            ).length
        : 0;
    }

    const forum = getForumFromJournals(bottomTabParasForumView);
    const like = getLikeFromJournals(bottomTabParasForumView);
    const replyStatus = userForumForumView.filter(
      f =>
        f?.split(constantDict.commonSeparatorOfForumLike)[0] ===
        bottomTabParasForumView,
    ).length;
    return (
      <View style={{flex: 1}}>
        <Card.Title
          title={'Forum'}
          subtitle={
            'Total ' +
            bottomParasJournal[0].forum.length +
            (replyStatus ? ' | Already Reply' : '')
          }
          right={() => {
            return (
              <IconButton
                icon={'close'}
                onPress={() => {
                  setForumView(0);
                }}
              />
            );
          }}
        />
        <View style={{alignItems: 'flex-start'}}>
          <View>
            <Text variant={'bodySmall'} style={{textAlign: 'center'}}>
              Sort By {forumSortType.toUpperCase()}
            </Text>
            <View style={{flexDirection: 'row'}}>
              <IconButton
                icon={'sort-descending'}
                selected={forumOrder === 'forumDescending'}
                onPress={() => {
                  setForumOrder(
                    forumOrder === 'forumDescending' ? null : 'forumDescending',
                  );
                }}
                onLongPress={() => {
                  setForumOrder(null);
                  setForumSortType(forumSortType === 'time' ? 'like' : 'time');
                }}
              />
              <IconButton
                icon={'sort-ascending'}
                selected={forumOrder === 'forumAscending'}
                onPress={() => {
                  setForumOrder(
                    forumOrder === 'forumAscending' ? null : 'forumAscending',
                  );
                }}
                onLongPress={() => {
                  setForumOrder(null);
                  setForumSortType(forumSortType === 'time' ? 'like' : 'time');
                }}
              />
            </View>
          </View>
        </View>
        <Divider bold />
        <BottomSheetFlatList
          data={forum}
          renderItem={({item}) => {
            const userIdFromForumId = item[0]
              ?.split(constantDict.commonSeparator)[0]
              ?.split(constantDict.commonSeparatorOfSpecialist)[0];
            return (
              <Card style={{margin: 2}}>
                <Card.Title
                  title={userIdFromForumId}
                  subtitle={fromTimeStampToTimeString(item)}
                  right={() => {
                    const forumId = item[0];
                    const forumLike = like.filter(
                      l =>
                        l?.split(constantDict.commonSeparatorOfForumLike)[0] ===
                        forumId,
                    );
                    return (
                      <View style={{flexDirection: 'row'}}>
                        <Paragraph style={{textAlign: 'center'}}>
                          {forumLike.length}
                        </Paragraph>
                        <IconButton
                          mode={'outlined'}
                          icon={'thumb-up-outline'}
                          selected={forumReplyLikeStatus(item)}
                          onPress={() => {
                            updateForumLikeFireStore(
                              forumReplyLikeStatus,
                              item,
                            );
                          }}
                        />
                      </View>
                    );
                  }}
                />
                <Card.Content>
                  <Paragraph>{item[1]}</Paragraph>
                </Card.Content>
              </Card>
            );
          }}
        />
        <View style={{flexDirection: 'row'}}>
          <EnterBox
            disabled={!!replyStatus}
            name={'Forum Input'}
            iconHide
            value={newForumText}
            outlineColor={'black'}
            enterBox={{
              flexDirection: 'row',
              alignItems: 'center',
              borderColor: 'white',
              margin: 5,
            }}
            onChangeText={text => {
              setNewForumText(text);
            }}
            textInputView={{width: '90%'}}
          />
          <View style={{marginLeft: -25}}>
            <IconButton
              icon={'check-circle-outline'}
              size={30}
              disabled={!!replyStatus}
              color={'#b4b4b4'}
              style={{flex: 1, margin: 1}}
              onPress={() => {
                Alerts.forumConfirmAlert(() => {
                  submitInputForum();
                });
              }}
            />
          </View>
        </View>
      </View>
    );
  };

  function forumLikeStatus() {
    return bottomParasJournal
      ? bottomParasJournal[0].like.filter(
          item =>
            item?.split(constantDict.commonSeparatorOfForumLike)[0] ===
              bottomTabParas &&
            item?.split(constantDict.commonSeparatorOfForumLike)[1] ===
              global.loginUser,
        ).length
      : 0;
  }

  function saveCurrentViewToGlobalAndSaveToLocalCache(item) {
    global.viewHistory = [
      item.journalId +
        constantDict.commonSeparatorOfForumLike +
        Date.now() +
        constantDict.commonSeparatorOfForumLike +
        Array.from(journalImages[item.journalId]).join(
          constantDict.commonSeparatorOfForumLike,
        ),
      ...global.viewHistory.filter(history => {
        const journalIdFromHistory = history?.split(
          constantDict.commonSeparatorOfForumLike,
        )[0];
        return journalIdFromHistory !== item.journalId;
      }),
    ];
    if (global.viewHistory.length > constantDict.viewHistorySize) {
      global.viewHistory.pop();
    }
    AsyncStorage.setItem('viewHistory', global.viewHistory.toString());
  }

  function searchQueryMatching(item) {
    let res = [
      item.journalId.toLowerCase().includes(searchQuery.toLowerCase())
        ? 'JournalId'
        : null,
    ];
    if (searchQuery.toLowerCase() === 'specialist') {
      res = [
        ...res,
        item.options[0]
          ? item.options[0][0].split(
              constantDict.commonSeparatorOfSpecialist,
            )[1] === 's'
            ? 'specialist'
            : null
          : null,
      ];
    }
    if (searchQuery.toLowerCase() === 'normal') {
      res = [
        ...res,
        item.options[0]
          ? item.options[0][0].split(
              constantDict.commonSeparatorOfSpecialist,
            )[1] === 's'
            ? null
            : 'normal'
          : 'normal',
      ];
    }
    res = [
      ...res,
      item.textDescription.toLowerCase().includes(searchQuery.toLowerCase())
        ? 'Text'
        : null,
    ];
    res = [
      ...res,
      item.images.filter(image =>
        image.toLowerCase().includes(searchQuery.toLowerCase()),
      ).length
        ? 'Images'
        : null,
    ];
    res = [
      ...res,
      new Date(Number(item.journalId?.split('-')[1]))
        .toLocaleString('en-US')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
        ? 'Time'
        : null,
    ];
    res = [
      ...res,
      item.options.filter(option =>
        option[0].toLowerCase().includes(searchQuery.toLowerCase()),
      ).length
        ? 'Votes'
        : null,
    ];
    res = [
      ...res,
      item.forum.filter(forum =>
        JSON.stringify(forum).toLowerCase().includes(searchQuery.toLowerCase()),
      ).length
        ? 'Forum'
        : null,
    ];
    return res.filter(i => i !== null);
  }

  const voteStatus = userVotes.filter(
    vote =>
      vote?.split(constantDict.commonSeparatorOfForumLike)[0] ===
      bottomTabParas,
  ).length;
  const specialistStatus = votes[0]
    ? votes[0][0].split(constantDict.commonSeparatorOfSpecialist)[1] === 's' &&
      votes[0][1] !== 0
    : null;
  const bottomParasJournal = journals.filter(
    item => item.journalId === bottomTabParas,
  );

  const BottomSheetVotesView = props => {
    const [votesLoading, setVotesLoading] = useState(0);
    const bottomParasJournalVotesView = props.bottomParasJournal;
    const [votesEnter, setVotesEnter] = useState('');
    const [votesEnterVisible, setVotesEnterVisible] = useState(false);
    const [specialistJudgement, setSpecialistJudgement] = useState(0);

    const showVotesEnter = () => setVotesEnterVisible(true);
    const hideVotesEnter = () => setVotesEnterVisible(false);

    const specialistVoteStatus = votes[0]
      ? votes[0][0].split(constantDict.commonSeparatorOfSpecialist)[1] ===
          's' && votes[0][1] === 0
      : null;

    function submitVotes() {
      setVotesLoading(true);
      let options = bottomParasJournal[0].options;
      let voteItems = votes.map(i => i[0]);
      let newOptions;
      if (specialistVoteStatus) {
        newOptions = votes.map(i => {
          i[1] = 1;
          return i.join(constantDict.commonSeparatorOfForumLike);
        });
        console.log(newOptions);
      } else {
        newOptions = options.map(option => {
          if (voteItems.indexOf(option[0]) !== -1) {
            option[1] += 1;
          }
          return option.join(constantDict.commonSeparatorOfForumLike);
        });
        let optionItem = options.map(option => option[0]);
        votes.map(vote => {
          if (optionItem.indexOf(vote[0]) === -1) {
            vote[1] += 1;
            newOptions.push(vote.join(constantDict.commonSeparatorOfForumLike));
          }
        });
      }
      console.log(newOptions);
      firestore()
        .collection('JournalLog')
        .doc(bottomTabParas)
        .update({
          options: newOptions,
        })
        .then(() => {
          // update votes to firebase
          firestore()
            .collection('Users')
            .doc(global.loginUser)
            .update({
              votes: firestore.FieldValue.arrayUnion(
                bottomTabParas +
                  constantDict.commonSeparatorOfForumLike +
                  Date.now() +
                  constantDict.commonSeparatorOfForumLike +
                  JSON.stringify(votes),
              ),
            });
          setVotesLoading(false);
        });
    }

    return (
      <View style={{flex: 1}}>
        <Card.Title
          style={{
            textAlign: 'center',
          }}
          title={'Votes'}
          subtitle={
            'Total ' +
            bottomParasJournalVotesView[0].options.length +
            (voteStatus ? ' | Already vote' : '') +
            (specialistStatus ? ' | Specialist' : '')
          }
          right={() => {
            return (
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <IconButton
                  icon={'close'}
                  onPress={() => {
                    props.setVotesView(0);
                  }}
                />
              </View>
            );
          }}
        />
        <Divider bold />
        <Card.Content style={{flex: 1}}>
          <BottomSheetFlatList
            data={votes}
            renderItem={({item}) => {
              let totalVotes = bottomParasJournalVotesView[0]
                ? bottomParasJournalVotesView[0].options.reduce((acc, cur) => {
                    acc += cur[1];
                    return acc;
                  }, 0)
                : 0;
              swipeRef.current?.close();
              return (
                <SwipeableItem
                  // swipeEnabled={false}
                  ref={swipeRef}
                  onChange={e => {
                    if (e.openDirection === 'left') {
                      setVotes(votes.filter(vote => vote[0] !== item[0]));
                    }
                  }}
                  snapPointsLeft={[400]}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                    }}>
                    <Subheading>
                      {
                        item[0].split(
                          constantDict.commonSeparatorOfSpecialist,
                        )[0]
                      }
                      {'\n'} {item[1]}/{totalVotes}
                    </Subheading>
                  </TouchableOpacity>
                  <ProgressBar
                    style={{width: '100%'}}
                    progress={totalVotes !== 0 ? item[1] / totalVotes : 1}
                    color={draggableFlatListUtils.getColorFromPercentage(
                      item[1] / totalVotes,
                      randomColor,
                    )}
                  />
                </SwipeableItem>
              );
            }}
          />
        </Card.Content>
        <View
          style={{
            position: 'absolute',
            flex: 1,
            marginRight: 2,
            bottom: 0,
            width: '100%',
            alignContent: 'center',
          }}>
          <View>
            {votesLoading ? (
              <View style={{flex: 1}}>
                <ActivityIndicatorComponents.randomColorActivityIndicator
                  randomColor={randomColor}
                />
              </View>
            ) : (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <IconButton
                  icon="plus-circle-outline"
                  size={30}
                  disabled={!!specialistStatus || !!voteStatus}
                  onPress={() => {
                    showVotesEnter();
                  }}
                />
                {global.loginUser.split(
                  constantDict.commonSeparatorOfSpecialist,
                )[1] === 's' ? (
                  <Button
                    disabled={!!specialistStatus}
                    mode={'outlined'}
                    style={{borderColor: '#b4b4b4'}}
                    onPress={() => {
                      setVotesEnterVisible(1);
                      setSpecialistJudgement(1);
                    }}>
                    Specialist
                  </Button>
                ) : null}
                <IconButton
                  icon="check-circle-outline"
                  size={30}
                  disabled={
                    (!!specialistStatus || !!voteStatus) &&
                    !specialistVoteStatus
                  }
                  onPress={() => {
                    Alerts.voteConfirmAlert(() => {
                      submitVotes();
                    });
                  }}
                />
              </View>
            )}
          </View>
        </View>
        <Portal>
          <Modal
            visible={votesEnterVisible}
            onDismiss={() => {
              hideVotesEnter();
              setSpecialistJudgement(0);
            }}
            contentContainerStyle={{
              height: 100,
            }}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
              <EnterBox
                iconHide
                name={
                  specialistJudgement
                    ? 'Specialist judgement'
                    : 'Vote option to add'
                }
                enterBox={{
                  width: '60%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  margin: 5,
                }}
                enterBoxTextInput={{
                  width: '100%',
                }}
                textInputView={{
                  width: '100%',
                  justifyContent: 'center',
                }}
                value={votesEnter}
                onChangeText={text => {
                  setVotesEnter(text);
                }}
              />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <IconButton
                  icon={'close-circle-outline'}
                  size={30}
                  iconColor={'white'}
                  style={{margin: 1}}
                  onPress={() => {
                    hideVotesEnter();
                    setSpecialistJudgement(0);
                  }}
                />
                <IconButton
                  icon={'check-circle-outline'}
                  size={30}
                  iconColor={'white'}
                  style={{margin: 1}}
                  onPress={() => {
                    if (specialistJudgement) {
                      const specialistVotesEnter =
                        votesEnter +
                        constantDict.commonSeparatorOfSpecialist +
                        's';
                      setVotes([[specialistVotesEnter, 0]]);
                      hideVotesEnter();
                    } else {
                      setVotes([...votes, [votesEnter, 0]]);
                      hideVotesEnter();
                    }
                  }}
                />
              </View>
            </View>
          </Modal>
        </Portal>
      </View>
    );
  };

  const userIdFromForumId = bottomTabParas
    ?.split('-')[0]
    ?.split(constantDict.commonSeparatorOfSpecialist)[0];

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
          <Provider>
            <Searchbar
              style={{borderColor: '#d4d4d4', borderWidth: 1}}
              placeholder="Search"
              onChangeText={query => setSearchQuery(query)}
              value={searchQuery}
            />
            <View style={{flex: 1}}>
              <Card mode={'contained'}>
                <View style={{flexDirection: 'row'}}>
                  <View>
                    <Text variant={'bodySmall'} style={{textAlign: 'center'}}>
                      Sort By {sortType.toUpperCase()}
                    </Text>
                    <View style={{flexDirection: 'row'}}>
                      <IconButton
                        icon={'sort-descending'}
                        selected={order === 'journalIdDescending'}
                        onPress={() => {
                          setOrder(
                            order === 'journalIdDescending'
                              ? null
                              : 'journalIdDescending',
                          );
                        }}
                        onLongPress={() => {
                          setOrder(null);
                          setSortType(sortType === 'time' ? 'like' : 'time');
                        }}
                      />
                      <IconButton
                        icon={'sort-ascending'}
                        selected={order === 'journalIdAscending'}
                        onPress={() => {
                          setOrder(
                            order === 'journalIdAscending'
                              ? null
                              : 'journalIdAscending',
                          );
                        }}
                        onLongPress={() => {
                          setOrder(null);
                          setSortType(sortType === 'time' ? 'like' : 'time');
                        }}
                      />
                    </View>
                  </View>
                  <TagButtons />
                </View>
              </Card>

              <ScrollView
                contentContainerStyle={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}>
                {journals.map((item, index) => {
                  function getDateFromItemJournalId() {
                    return new Date(
                      Number(
                        item.journalId?.split(constantDict.commonSeparator)[1],
                      ),
                    ).toLocaleDateString('en-US');
                  }

                  function getUserFromItemJournalId() {
                    return item.journalId
                      ?.split(constantDict.commonSeparator)[0]
                      ?.split(constantDict.commonSeparatorOfSpecialist)[0];
                  }

                  let matchResult = searchQueryMatching(item);
                  if (matchResult.length) {
                    return (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        key={index}
                        style={{}}
                        onPress={() => {
                          sheetRef.current.snapToIndex(1);
                          setBottomTabParas(item.journalId);
                          saveCurrentViewToGlobalAndSaveToLocalCache(item);
                          setVotes(
                            journals.filter(
                              j => j.journalId === item.journalId,
                            )[0].options,
                          );
                        }}>
                        <Card style={{width: viewWidth * 0.47, margin: 2}}>
                          <Card.Content>
                            <View style={{flex: 1, alignItems: 'center'}}>
                              {journalImages[item.journalId] ? (
                                <Image
                                  style={{
                                    width: viewWidth * 0.32,
                                    height: viewWidth * 0.5,
                                    resizeMode: 'contain',
                                  }}
                                  source={{
                                    uri: Array.from(
                                      journalImages[item.journalId],
                                    )[0],
                                  }}
                                />
                              ) : (
                                <View style={{flex: 1}}>
                                  <ActivityIndicatorComponents.randomColorActivityIndicator
                                    randomColor={randomColor}
                                  />
                                </View>
                              )}
                            </View>
                          </Card.Content>
                          <Card.Title
                            title={getDateFromItemJournalId()}
                            subtitle={'by ' + getUserFromItemJournalId()}
                          />
                          <Card.Content>
                            <Subheading>Votes</Subheading>
                            {item.options.map(i => {
                              return (
                                <Paragraph>
                                  {
                                    i[0].split(
                                      constantDict.commonSeparatorOfSpecialist,
                                    )[0]
                                  }
                                </Paragraph>
                              );
                            })}
                            {searchQuery ? (
                              <View
                                style={{
                                  borderWidth: 1,
                                  borderRadius: 10,
                                  borderColor: '#b4b4b4',
                                }}>
                                <Subheading>Matches</Subheading>
                                <Paragraph>{matchResult.join('\n')}</Paragraph>
                              </View>
                            ) : null}
                          </Card.Content>
                        </Card>
                      </TouchableOpacity>
                    );
                  }
                })}
              </ScrollView>
              <BottomSheet
                handleStyle={{
                  backgroundColor: '#b4b4b4',
                }}
                enableContentPanningGesture={!votesView}
                ref={sheetRef}
                snapPoints={useMemo(
                  () => [1, global.viewHeight ? global.viewHeight : 600],
                  [],
                )}
                index={0}>
                {forumView ? (
                  <View style={{flex: 1}}>
                    <BottomSheetForumView
                      bottomTabParas={bottomTabParas}
                      userForum={userForum}
                    />
                  </View>
                ) : votesView ? (
                  <BottomSheetVotesView
                    setVotesView={setVotesView}
                    bottomParasJournal={bottomParasJournal}
                  />
                ) : (
                  <View style={{flex: 1}}>
                    {bottomImageViewer ? (
                      <ImageViewer
                        saveToLocalByLongPress={false}
                        renderIndicator={() => null}
                        style={{
                          width: '100%',
                          height: '100%',
                          resizeMode: 'contain',
                        }}
                        onLongPress={() => {
                          setBottomImageViewer(0);
                        }}
                        onClick={() => {
                          setBottomImageViewerFooter(!bottomImageViewerFooter);
                        }}
                        onDoubleClick={() => {
                          Alerts.fromDiscoverToImageClassificationConfirm(
                            () => {
                              navigation.navigate(
                                'ImageClassificationResultStack',
                                {
                                  screen: 'ImageClassificationResult',
                                  params: {
                                    images: {
                                      key: Date.now(),
                                      url: bottomImageViewer,
                                    },
                                  },
                                },
                              );
                            },
                          );
                        }}
                        index={Array.from(
                          journalImages[bottomTabParas],
                        ).indexOf(bottomImageViewer)}
                        renderFooter={currentIndex => {
                          return bottomImageViewerFooter ? (
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
                              {Array.from(journalImages[bottomTabParas]) ? (
                                <Paragraph textColor={''}>
                                  Address:
                                  {
                                    Array.from(journalImages[bottomTabParas])[
                                      currentIndex
                                    ]
                                  }
                                </Paragraph>
                              ) : null}
                            </View>
                          ) : null;
                        }}
                        imageUrls={Array.from(
                          journalImages[bottomTabParas],
                        ).map(url => {
                          return {url: url};
                        })}
                      />
                    ) : (
                      <BottomSheetScrollView style={{flex: 1}}>
                        <View
                          style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                          }}>
                          {journalImages[bottomTabParas] ? (
                            Array.from(journalImages[bottomTabParas]).map(
                              item => {
                                return item ? (
                                  <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => {
                                      setBottomImageViewer(item);
                                    }}>
                                    <Image
                                      style={{
                                        width: global.viewWidth * 0.33,
                                        height: global.viewWidth * 0.33,
                                        resizeMode: 'contain',
                                        margin: 2,
                                      }}
                                      source={{uri: item}}
                                    />
                                  </TouchableOpacity>
                                ) : (
                                  <View style={{flex: 1}}>
                                    <ActivityIndicatorComponents.randomColorActivityIndicator
                                      randomColor={randomColor}
                                    />
                                  </View>
                                );
                              },
                            )
                          ) : (
                            <View style={{flex: 1}}>
                              <ActivityIndicatorComponents.randomColorActivityIndicator
                                randomColor={randomColor}
                              />
                            </View>
                          )}
                        </View>
                        <Divider bold />
                        {bottomTabParas && bottomParasJournal.length ? (
                          <View
                            style={{
                              flex: 3,
                              padding: 10,
                            }}>
                            <Card>
                              <Card.Title
                                title={bottomTabParas}
                                subtitleNumberOfLines={2}
                                subtitle={
                                  new Date(
                                    Number(bottomTabParas?.split('-')[1]),
                                  ).toLocaleString('en-US') +
                                  '\n' +
                                  'By ' +
                                  userIdFromForumId
                                }
                                right={() => {
                                  function removeForumLikeToUsersFirestore() {
                                    return firestore()
                                      .collection('Users')
                                      .doc(global.loginUser)
                                      .update({
                                        like: firestore.FieldValue.arrayRemove(
                                          bottomTabParas +
                                            constantDict.commonSeparatorOfForumLike +
                                            global.loginUser +
                                            constantDict.commonSeparatorOfForumLike +
                                            'J',
                                        ),
                                      });
                                  }

                                  function saveForumLikeToUsersFirestore() {
                                    return firestore()
                                      .collection('Users')
                                      .doc(global.loginUser)
                                      .update({
                                        like: firestore.FieldValue.arrayUnion(
                                          bottomTabParas +
                                            constantDict.commonSeparatorOfForumLike +
                                            global.loginUser +
                                            constantDict.commonSeparatorOfForumLike +
                                            'J',
                                        ),
                                      });
                                  }

                                  function saveForumLikeToJournalLogFirestore() {
                                    return firestore()
                                      .collection('JournalLog')
                                      .doc(bottomTabParas)
                                      .update({
                                        like: firestore.FieldValue.arrayUnion(
                                          bottomTabParas +
                                            constantDict.commonSeparatorOfForumLike +
                                            global.loginUser,
                                        ),
                                      });
                                  }

                                  function removeForumLikeToJournalLogFirestore() {
                                    return firestore()
                                      .collection('JournalLog')
                                      .doc(bottomTabParas)
                                      .update({
                                        like: firestore.FieldValue.arrayRemove(
                                          bottomTabParas +
                                            constantDict.commonSeparatorOfForumLike +
                                            global.loginUser,
                                        ),
                                      });
                                  }

                                  function getSizeOfForum() {
                                    return journals.filter(
                                      item => item.journalId === bottomTabParas,
                                    )[0].forum.length;
                                  }

                                  function checkForumReplyStatus() {
                                    return userForum.filter(
                                      forum =>
                                        forum?.split(
                                          constantDict.commonSeparatorOfForumLike,
                                        )[0] === bottomTabParas,
                                    ).length;
                                  }

                                  const bottomParasJournalLikeSize =
                                    bottomParasJournal[0].like.filter(
                                      item =>
                                        item?.split(
                                          constantDict.commonSeparatorOfForumLike,
                                        )[0] === bottomTabParas,
                                    ).length;
                                  return (
                                    <View style={{alignItems: 'flex-end'}}>
                                      <View style={{flexDirection: 'row'}}>
                                        <Paragraph
                                          style={{textAlign: 'center'}}>
                                          {bottomParasJournal[0].location
                                            ? Math.round(
                                                bottomParasJournal[0].location
                                                  .latitude,
                                              ) +
                                              ',' +
                                              Math.round(
                                                bottomParasJournal[0].location
                                                  .longitude,
                                              )
                                            : null}
                                        </Paragraph>
                                        <IconButton
                                          mode={'outlined'}
                                          icon={'map-marker-outline'}
                                          selected={
                                            bottomParasJournal[0].location
                                          }
                                          onPress={() => {
                                            Alerts.fromDiscoverToMapConfirm(
                                              () => {
                                                navigation.navigate(
                                                  'MapStack',
                                                  {
                                                    screen: 'Map',
                                                    params: {
                                                      journalId: bottomTabParas,
                                                    },
                                                  },
                                                );
                                              },
                                            );
                                          }}
                                        />
                                      </View>
                                      <View style={{flexDirection: 'row'}}>
                                        <Paragraph
                                          style={{textAlign: 'center'}}>
                                          {bottomParasJournalLikeSize}
                                        </Paragraph>
                                        <IconButton
                                          mode={'outlined'}
                                          selected={forumLikeStatus()}
                                          icon={'thumb-up-outline'}
                                          onPress={() => {
                                            let likeStatus = forumLikeStatus();
                                            likeStatus
                                              ? removeForumLikeToJournalLogFirestore()
                                              : saveForumLikeToJournalLogFirestore();
                                            likeStatus
                                              ? removeForumLikeToUsersFirestore()
                                              : saveForumLikeToUsersFirestore();
                                          }}
                                        />
                                      </View>
                                      <View style={{flexDirection: 'row'}}>
                                        <Paragraph
                                          style={{textAlign: 'center'}}>
                                          {getSizeOfForum()}
                                        </Paragraph>
                                        <IconButton
                                          mode={'outlined'}
                                          selected={checkForumReplyStatus()}
                                          icon={'forum-outline'}
                                          onPress={() => {
                                            setForumView(1);
                                          }}
                                        />
                                      </View>
                                    </View>
                                  );
                                }}
                              />
                              <Divider bold />
                              <View>
                                <Card.Title
                                  title={'Description'}
                                  subtitle={
                                    'Words ' +
                                    TextFuncs.wordsCounterDelimiterSpace(
                                      bottomParasJournal[0].textDescription,
                                    )
                                  }
                                />
                                <Card.Content>
                                  <Paragraph>
                                    {bottomParasJournal[0].textDescription
                                      ? bottomParasJournal[0].textDescription
                                      : 'No description'}
                                  </Paragraph>
                                </Card.Content>
                                <Divider />
                                <Card.Title
                                  style={{
                                    textAlign: 'center',
                                  }}
                                  title={'Votes'}
                                  subtitle={
                                    'Total ' +
                                    bottomParasJournal[0].options.length +
                                    (voteStatus ? ' | Already vote' : '') +
                                    (specialistStatus ? ' | Specialist' : '')
                                  }
                                  right={() => {
                                    return (
                                      <IconButton
                                        style={{alignSelf: 'flex-end'}}
                                        icon={'chevron-right'}
                                        onPress={() => {
                                          setVotesView(1);
                                        }}
                                      />
                                    );
                                  }}
                                />
                                <Card.Content>
                                  {votes.map(item => {
                                    let totalVotes =
                                      bottomParasJournal[0].options.reduce(
                                        (acc, cur) => {
                                          acc += cur[1];
                                          return acc;
                                        },
                                        0,
                                      );
                                    return (
                                      <View>
                                        <Paragraph>
                                          {
                                            item[0].split(
                                              constantDict.commonSeparatorOfSpecialist,
                                            )[0]
                                          }
                                          {'\n'} {item[1]}/{totalVotes}
                                        </Paragraph>
                                        <ProgressBar
                                          style={{width: '100%'}}
                                          progress={
                                            totalVotes !== 0
                                              ? item[1] / totalVotes
                                              : 1
                                          }
                                          color={draggableFlatListUtils.getColorFromPercentage(
                                            item[1] / totalVotes,
                                            randomColor,
                                          )}
                                        />
                                      </View>
                                    );
                                  })}
                                </Card.Content>
                              </View>
                            </Card>
                            <Divider bold />
                          </View>
                        ) : (
                          <View style={{flex: 1}}>
                            <ActivityIndicatorComponents.randomColorActivityIndicator
                              randomColor={randomColor}
                            />
                          </View>
                        )}
                      </BottomSheetScrollView>
                    )}
                  </View>
                )}
              </BottomSheet>
            </View>
          </Provider>
        </SafeAreaView>
      </FlingGestureHandler>
    </FlingGestureHandler>
  );
};
export default DiscoverScreen;
