import React from 'react';
import {View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {TextInput} from 'react-native-paper';
import draggableFlatListUtils from '../function/DraggableFlatList';
import constantDict from '../constant/Constant';

const EnterBox = props => {
  // custom enterBox components
  function errorInput() {
    // check whether invalid input
    if (props.value.length) {
      return (
        props.value.includes(constantDict.commonSeparatorOfForumLike) ||
        props.value.includes(constantDict.commonSeparator) ||
        props.value.includes(constantDict.commonSeparatorOfSpecialist) ||
        props.value.includes(':')
      );
    }
  }

  function replaceErrorInput() {
    // replace invalid input with ''
    return props.value
      .replace(constantDict.commonSeparatorOfForumLike, '')
      .replace(constantDict.commonSeparator, '')
      .replace(constantDict.commonSeparatorOfSpecialist, '')
      .replace(':', '');
  }

  return (
    <View
      style={
        props.enterBox
          ? props.enterBox
          : {
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              margin: 5,
            }
      }>
      {props.iconHide ? null : (
        <Icon
          name={props.iconName ? props.iconName : 'account'}
          size={30}
          color={props.iconColor ? props.iconColor : 'white'}
          style={{
            margin: 15,
            alignItems: 'center',
          }}
        />
      )}
      <View style={props.textInputView ? props.textInputView : {width: '70%'}}>
        <TextInput
          disabled={props.disabled}
          value={
            props.value
              ? errorInput()
                ? replaceErrorInput()
                : props.value
              : null
          }
          mode="outlined"
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          multiline={props.multiline ? props.multiline : false}
          style={
            props.enterBoxTextInput
              ? props.enterBoxTextInput
              : {
                  width: '100%',
                  backgroundColor: 'rgba(255,255,255, 0.2)',
                }
          }
          keyboardType={props.keyboardType ? props.keyboardType : 'default'}
          maxLength={50}
          placeholder={props.name}
          activeOutlineColor={
            errorInput()
              ? 'red'
              : draggableFlatListUtils.getColor('', global.randomColor)
          }
          cursorColor={props.cursorColor ? props.cursorColor : 'white'}
          onChangeText={props.onChangeText}
        />
      </View>
    </View>
  );
};
export default EnterBox;
