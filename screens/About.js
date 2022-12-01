import {ScrollView, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card, Divider, Paragraph, Subheading, Title} from 'react-native-paper';
import TextFuncs from '../function/TextFunction';

const AboutScreen = ({route, navigation}) => {
  const paragraphsTeam = [
    'This project is for DECO7381.',
    'The team members are',
    'Chuting Zhou   46228156',
    'Xue Zhang        45636932',
    'Zhiyuan Guo     45642081',
    'Zihan Zou         46208644',
    'Yangqing Qu     46269588',
    'Xue Zhang        45636932',
  ];
  const paragraphsAbout = [
    'The PicAnimal mobile application that we planned and created divided its target audience into regular users and expert users, allowing users to log in by specifying whether they are experts or not. ',
    'A user can use PicAnimal to capture a picture of a wild animal they come across outside in order to identify it. ',
    'The system will show the user the details of the animal when the program successfully identifies it. ',
    "The technology enables the user to share the animal's look and location details by generating a record when the computer is unable to identify the animal. ",
    "Users of PicAnimal can simultaneously see each other's log entries, cast votes for already-posted material, and submit new information.",
    'The log is locked and labeled as solved when an expert user comments on or clarifies data in it. ',
    'The animal data is also added to the database in anticipation of the taxonomist or other animal expert taking the next action.',
  ];

  const paragraphAboutLength = paragraphsAbout
    .reduce((acc, curr) => {
      acc += TextFuncs.wordsCounterDelimiterSpace(curr);
      return acc;
    }, 0)
    .toString();

  const paragraphsTeamLength = paragraphsTeam
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
            title={'Our Team'}
            subtitle={'Words ' + paragraphsTeamLength}
          />
          <Divider />
          <Card.Content>
            {paragraphsTeam.map(p => {
              return <Paragraph>{p}</Paragraph>;
            })}
          </Card.Content>
          <Divider bold />
          <Card.Title
            title={'About'}
            subtitle={'Words ' + paragraphAboutLength}
          />
          <Divider />
          <Card.Content>
            {paragraphsAbout.map(p => {
              return <Paragraph>{p}</Paragraph>;
            })}
          </Card.Content>
          <Divider bold />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};
export default AboutScreen;
