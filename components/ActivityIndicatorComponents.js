import {ActivityIndicator} from 'react-native-paper';
import draggableFlatListUtils from '../function/DraggableFlatList';

const ActivityIndicatorComponents = {
  // custom ActivityIndicator with random color
  randomColorActivityIndicator: props => {
    return (
      <ActivityIndicator
        color={draggableFlatListUtils.getColor(
          '',
          props.randomColor
            ? props.randomColor
            : draggableFlatListUtils.randomColor,
        )}
      />
    );
  },
};
export default ActivityIndicatorComponents;
