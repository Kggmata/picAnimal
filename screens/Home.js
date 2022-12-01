import {View, StyleSheet} from 'react-native';
import React, {useEffect} from 'react';
import Alerts from '../function/AlertFunc';
import {Avatar, Title} from 'react-native-paper';
import draggableFlatListUtils from '../function/DraggableFlatList';

const HomeScreen = ({navigation}) => {
  // prevent from going back when already log in
  useEffect(() => {
    navigation.addListener('beforeRemove', e => {
      // Prevent default behavior of leaving the screen
      if (global.loginUser) {
        e.preventDefault();
        Alerts.alreadyLoginAlert();
      }
    });
  }, [navigation]);
  return (
    <View style={{flex: 1, flexDirection: 'column', alignItems: 'center'}}>
      <Title
        style={{
          color: draggableFlatListUtils.getColor(
            '',
            global.randomColor
              ? global.randomColor
              : draggableFlatListUtils.randomColor(),
          ),
          paddingTop: '10%',
          paddingBottom: '10%',
          textAlign: 'center',
          fontSize: 40,
        }}>
        {'PicAnimal'}
      </Title>
      <Avatar.Image
        source={require('../assets/homeBackGround.png')}
        size={100}
        style={{
          margin: 20,
          backgroundColor: draggableFlatListUtils.getColor(
            '',
            global.randomColor
              ? global.randomColor
              : draggableFlatListUtils.randomColor(),
          ),
        }}
      />
    </View>
  );
};
export default HomeScreen;
