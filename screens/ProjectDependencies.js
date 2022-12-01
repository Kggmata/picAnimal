import {ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card, Divider, Paragraph} from 'react-native-paper';
import Paragraphs from '../constant/Paragraphs';
import TextFuncs from '../function/TextFunction';

const DependenciesScreen = ({route, navigation}) => {
  const paragraphsLibraries = [
    'The application is developed using React Native.',
    '🎈 React Native Camera Kit. (2022). [Objective-C]. Tesla, Inc. https://github.com/teslamotors/react-native-camera-kit (Original work published 2016)',
    'Arvidsson, J. (2022). Multi-style fonts [JavaScript]. https://github.com/oblador/react-native-vector-icons (Original work published 2015)',
    'Callstack/react-native-paper. (2022). [TypeScript]. Callstack. https://github.com/callstack/react-native-paper (Original work published 2016)',
    'Chudziak, M. (2022). @react-native-community/geolocation [Java]. https://github.com/michalchudziak/react-native-geolocation (Original work published 2019)',
    'Gorhom, M. (2022). React Native Bottom Sheet [TypeScript]. https://github.com/gorhom/react-native-bottom-sheet (Original work published 2020)',
    'Hübel, H. (2022). React-native-fs [C#]. https://github.com/itinance/react-native-fs (Original work published 2015)',
    'Invertase/react-native-firebase. (2022). [JavaScript]. Invertase. https://github.com/invertase/react-native-firebase (Original work published 2017)',
    'Merrill, D. (2022). React Native Swipeable Item [TypeScript]. https://github.com/computerjazz/react-native-swipeable-item (Original work published 2020)',
    'Merrill, D. (2022). React Native Draggable FlatList [TypeScript]. https://github.com/computerjazz/react-native-draggable-flatlist (Original work published 2018)',
    'React Native. (2022). [JavaScript]. Meta. https://github.com/facebook/react-native (Original work published 2015)',
    'React Native · Learn once, write anywhere. (n.d.). Retrieved August 29, 2022, from https://reactnative.dev/',
    'React Native Async Storage. (2022). [TypeScript]. AsyncStorage. https://github.com/react-native-async-storage/async-storage (Original work published 2019)',
    'React Native Image Resizer. (2022). [Java]. BAM. https://github.com/bamlab/react-native-image-resizer (Original work published 2015)',
    'React Navigation 6. (2022). [TypeScript]. React Navigation. https://github.com/react-navigation/react-navigation (Original work published 2017)',
    'React-native-linear-gradient. (2022). [C,]. react-native-linear-gradient. https://github.com/react-native-linear-gradient/react-native-linear-gradient (Original work published 2015)',
    'React-native-maps. (2022). [Objective-C]. react-native-maps. https://github.com/react-native-maps/react-native-maps (Original work published 2015)',
    'React-native-safe-area-context. (2022). [TypeScript]. Th3rdwave. https://github.com/th3rdwave/react-native-safe-area-context (Original work published 2019)',
    'Software-mansion/react-native-gesture-handler. (2022). [TypeScript]. Software Mansion. https://github.com/software-mansion/react-native-gesture-handler (Original work published 2016)',
    'Software-mansion/react-native-reanimated. (2022). [TypeScript]. Software Mansion. https://github.com/software-mansion/react-native-reanimated (Original work published 2018)',
    '黄子毅. (2022). Ascoders/react-native-image-viewer [TypeScript]. https://github.com/ascoders/react-native-image-viewer (Original work published 2016)',
  ];
  const paragraphsAPIS = [
    'API:Main page—MediaWiki. (n.d.). Retrieved October 15, 2022, from https://www.mediawiki.org/wiki/API:Main_page',
    'Flickr 服務：Flickr API: flickr.photos.search. (n.d.). Retrieved October 15, 2022, from https://www.flickr.com/services/api/flickr.photos.search.html',
    'Science,  c=AU; o=The S. of Q. ou=Environment and. (n.d.). Qld wildlife data API [Text]. corporateName=The State of Queensland; jurisdiction=Queensland. Retrieved October 15, 2022, from https://www.data.qld.gov.au/dataset/qld-wildlife-data-api',
    'Vision AI  |  Cloud Vision API  |  Google Cloud. (n.d.). Retrieved October 14, 2022, from https://cloud.google.com/vision',
    'What is the agile iterative approach and where is it used? (n.d.). Retrieved August 26, 2022, from https://www.zstream.io/blog/what-is-the-agile-iterative-approach-and-where-is-it-used',
    '百度智能云-智能时代基础设施. (n.d.). Retrieved October 14, 2022, from https://cloud.baidu.com/',
  ];
  const paragraphProjectDependenciesLength = paragraphsLibraries
    .reduce((acc, curr) => {
      acc += TextFuncs.wordsCounterDelimiterSpace(curr);
      return acc;
    }, 0)
    .toString();
  const paragraphAPIUsageLength = paragraphsAPIS
    .reduce((acc, curr) => {
      acc += TextFuncs.wordsCounterDelimiterSpace(curr);
      return acc;
    }, 0)
    .toString();
  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView>
        <Card>
          <Card.Title
            title={'Project Dependencies'}
            subtitle={'Words ' + paragraphProjectDependenciesLength}
          />
          <Divider />
          <Card.Content>
            {paragraphsLibraries.map(p => {
              return <Paragraph>{p}</Paragraph>;
            })}
          </Card.Content>
          <Divider bold />
          <Card.Title
            title={'API Usage'}
            subtitle={'Words ' + paragraphAPIUsageLength}
          />
          <Divider />
          <Card.Content>
            {paragraphsAPIS.map(p => {
              return <Paragraph>{p}</Paragraph>;
            })}
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};
export default DependenciesScreen;
