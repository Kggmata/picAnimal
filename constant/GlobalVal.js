import draggableFlatListUtils from '../function/DraggableFlatList';
import {useWindowDimensions} from 'react-native';

const GlobalValDict = {
  // set current geo location
  setGlobalGeoInfo: pos => {
    global.currentPosition = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
      timestamp: pos.timestamp,
    };
  },
  setDisclaimerState: state => {
    global.disclaimerState = state;
  },
  // set current device view width
  setGlobalViewHeightViewWidth: (height, width) => {
    global.viewWidth = width;
    global.viewHeight = height;
  },
  // set current random color
  setGlobalRandomColor: () => {
    global.randomColor = draggableFlatListUtils.randomColor();
  },
  // set current login user
  setGlobalLoginUser: loginState => {
    global.loginUser = loginState;
  },
  setGlobalViewHistory: viewHistory => {
    global.viewHistory = viewHistory;
  },
};
export default GlobalValDict;
