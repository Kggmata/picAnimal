import {TouchableOpacity} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Title} from 'react-native-paper';

const TouchableOpacityCustom = props => {
  // custom touchableOpacity button components
  return props.hideButton ? null : (
    <TouchableOpacity
      style={
        props.style
          ? props.style
          : {
              justifyContent: 'center',
              alignItems: 'center',
              width: '37%',
              height: 40,
              margin: 2,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#d4d4d4',
              backgroundColor: 'white',
            }
      }
      onPress={() => {
        if (props.onPress) {
          props.onPress();
        }
        if (props.target) {
          props.navigationParam
            ? props.navigation.navigate(props.target, props.navigationParam)
            : props.navigation.navigate(props.target);
        }
      }}
      onLongPress={props.onLongPress ? props.onLongPress : null}>
      {props.icon ? props.icon : null}
      {props.content ? (
        props.content
      ) : (
        <Title style={props.textStyle ? props.textStyle : {fontSize: 15}}>
          {props.name}
        </Title>
      )}
    </TouchableOpacity>
  );
};
const PlusCircleOutline = props => {
  // custom plus circle outline icon button used in journal log preview screen
  return (
    <TouchableOpacity
      onPress={props.onPress ? props.onPress : null}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}>
      <Icon name={'plus-circle-outline'} size={40} />
    </TouchableOpacity>
  );
};
const TouchableOpacityComponents = {
  touchableOpacityCustom: TouchableOpacityCustom,
  plusCircleOutline: PlusCircleOutline,
};
export default TouchableOpacityComponents;
