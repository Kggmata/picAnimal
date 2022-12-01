import {View, StyleSheet} from 'react-native';
import React from 'react';
import TouchableOpacityComponents from '../components/TouchableOpacity';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Title} from 'react-native-paper';

const SpecialistCertificationScreen = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <Title
        style={{
          paddingTop: '10%',
          paddingBottom: '10%',
          textAlign: 'center',
          fontSize: 40,
        }}>
        {'Specialist Certification'}
      </Title>
      <View style={styles.buttonContainer}>
        <TouchableOpacityComponents.touchableOpacityCustom
          navigation={navigation}
          target={'Signup'}
          navigationParam={{SpecialistCertification: 1}}
          name="Confirm"
        />
        <TouchableOpacityComponents.touchableOpacityCustom
          navigation={navigation}
          target={'Signup'}
          navigationParam={{SpecialistCertification: 0}}
          name="Cancel"
        />
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: '100%',
  },
});
export default SpecialistCertificationScreen;
