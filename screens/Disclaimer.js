import {ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card, Divider, Paragraph} from 'react-native-paper';
import Paragraphs from '../constant/Paragraphs';

const DisclaimerScreen = ({route, navigation}) => {
  const paragraphsUserPrivacy = Paragraphs.paragraphsUserPrivacy;
  const paragraphsVersionAndEffectiveDate =
    Paragraphs.paragraphsVersionAndEffectiveDate;
  const paragraphVersionAndEffectiveDateLength =
    paragraphsVersionAndEffectiveDate
      .reduce((acc, curr) => {
        acc += curr.split(' ').length;
        return acc;
      }, 0)
      .toString();
  const paragraphPrivacyLength = paragraphsUserPrivacy
    .reduce((acc, curr) => {
      acc += curr.split(' ').length;
      return acc;
    }, 0)
    .toString();
  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView>
        <Card>
          <Card.Title
            title={'User privacy policy'}
            subtitle={'Words ' + paragraphPrivacyLength}
          />
          <Divider bold />
          <Card.Content>
            {paragraphsUserPrivacy.map(p => {
              return <Paragraph>{p}</Paragraph>;
            })}
          </Card.Content>
          <Card.Title
            title={'Version and effective date'}
            subtitle={'Words ' + paragraphVersionAndEffectiveDateLength}
          />
          <Card.Content>
            <Divider bold />
            {paragraphsVersionAndEffectiveDate.map(p => {
              return <Paragraph>{p}</Paragraph>;
            })}
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};
export default DisclaimerScreen;
