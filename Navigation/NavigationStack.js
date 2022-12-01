import * as React from 'react';
import MapScreen from '../screens/Map';
import DiscoverScreen from '../screens/Discover';
import CameraPage from '../screens/CameraPage';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StyleSheet} from 'react-native';
import LoginScreen from '../screens/Login';
import SignupScreen from '../screens/Signup';
import SpecialistCertificationScreen from '../screens/SpecialistCertification';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import UserSettingsScreen from '../screens/UserSettings';
import ImageClassificationResultScreen from '../screens/ImageClassificationResult';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import JournalLogPreviewScreen from '../screens/JournalLogPreview';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DisclaimerScreen from '../screens/Disclaimer';
import AboutScreen from '../screens/About';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import DependenciesScreen from '../screens/ProjectDependencies';

const TopTab = createMaterialTopTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();
const BottomTab = createMaterialBottomTabNavigator();
const HomeStack = ({navigation}) => {
  return (
    <BottomTab.Navigator
      initialRouteName="Camera"
      activeColor="#3c7064"
      inactiveColor="#509686"
      barStyle={{backgroundColor: '#f2f2f2'}}
      shifting>
      {/*<BottomTab.Screen*/}
      {/*  name="Home"*/}
      {/*  component={HomeScreen}*/}
      {/*  tabPress={() => {*/}
      {/*    console.log(navigation.getParent().id);*/}
      {/*  }}*/}
      {/*  options={{*/}
      {/*    tabBarLabel: 'Home',*/}
      {/*    tabBarIcon: ({color}) => <Icon name="home" color={color} size={26} />,*/}
      {/*  }}*/}
      {/*/>*/}
      <BottomTab.Screen
        name="Camera"
        component={CameraStack}
        options={{
          tabBarLabel: 'Camera',
          tabBarIcon: ({color}) => (
            <Icon name="camera" color={color} size={26} />
          ),
        }}
      />
      <BottomTab.Screen
        name="MapStack"
        component={MapStack}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({color}) => <Icon name="map" color={color} size={26} />,
        }}
      />
      <BottomTab.Screen
        name="DiscoverStack"
        component={DiscoverStack}
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: ({color}) => <Icon name="book" color={color} size={26} />,
        }}
      />
      <BottomTab.Screen
        name="UserSettingsStack"
        component={UserSettingStack}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({color}) => (
            <Icon name="account-settings" color={color} size={26} />
          ),
        }}
      />
    </BottomTab.Navigator>
  );
};
const MapStack = () => {
  return (
    <Drawer.Navigator>
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Map',
          headerShown: false,
          headerStyle: styles.topTabHeaderStyle,
          drawerIcon: ({focused, size}) => (
            <Ionicons
              name="md-map"
              size={size}
              color={focused ? '#7cc' : '#ccc'}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

const CameraStack = ({navigation}) => {
  return (
    <Drawer.Navigator>
      <Stack.Screen
        name="ImageClassificationResultStack"
        component={ImageClassificationResultStack}
        options={{
          title: 'Result',
          headerStyle: styles.topTabHeaderStyle,
          headerShown: false,
          drawerIcon: ({focused, size}) => (
            <Ionicons
              name="md-search-circle"
              size={size}
              color={focused ? '#7cc' : '#ccc'}
            />
          ),
        }}
      />
      <Stack.Screen
        name="CameraPage"
        component={CameraPage}
        options={{
          title: 'Camera',
          headerStyle: styles.topTabHeaderStyle,
          headerShown: false,
          drawerIcon: ({focused, size}) => (
            <Ionicons
              name="camera"
              size={size}
              color={focused ? '#7cc' : '#ccc'}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};
const ImageClassificationResultStack = navigation => {
  return (
    <Stack.Navigator initialRoute={'ImageClassificationResult'}>
      <Stack.Screen
        name="ImageClassificationResult"
        component={ImageClassificationResultScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="JournalLogPreview"
        component={JournalLogPreviewScreen}
        options={{
          title: 'Create Journal Log',
        }}
      />
    </Stack.Navigator>
  );
};
const DiscoverStack = navigation => {
  return (
    <Drawer.Navigator>
      <Stack.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          title: 'Discover',
          headerStyle: styles.topTabHeaderStyle,
          headerShown: false,
          drawerIcon: ({focused, size}) => (
            <Ionicons
              name="ios-list-sharp"
              size={size}
              color={focused ? '#7cc' : '#ccc'}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};
const LoginStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerTintColor: '#fff',
        headerTitleStyle: {fontWeight: 'bold'},
      }}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Log in',
          headerStyle: styles.headerStyle,
        }}
      />
      <Stack.Screen
        name="SignupStack"
        component={SignupStack}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="HomeStack"
        component={HomeStack}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
const UserSettingStack = () => {
  return (
    <Drawer.Navigator>
      <Stack.Screen
        name="UserSettings"
        component={UserSettingsScreen}
        options={{
          title: 'Account',
          headerStyle: styles.topTabHeaderStyle,
          drawerIcon: ({focused, size}) => (
            <Ionicons
              name="ios-person-sharp"
              size={size}
              color={focused ? '#7cc' : '#ccc'}
            />
          ),
        }}
      />
      <Stack.Screen
        name="AboutStack"
        component={AboutStack}
        options={{
          title: 'About',
          headerStyle: styles.topTabHeaderStyle,
          drawerIcon: ({focused, size}) => (
            <Ionicons
              name="information"
              size={size}
              color={focused ? '#7cc' : '#ccc'}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};
const AboutStack = () => {
  return (
    <TopTab.Navigator
      initialRouteName="Signup"
      screenOptions={{
        headerStyle: {backgroundColor: '#42f44b'},
        headerTintColor: '#fff',
        headerTitleStyle: {fontWeight: 'bold'},
      }}>
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: 'About',
          headerStyle: styles.topTabHeaderStyle,
        }}
      />
      <Stack.Screen
        name="Disclaimer"
        component={DisclaimerScreen}
        options={{
          title: 'Privacy Disclaimer',
          headerStyle: styles.topTabHeaderStyle,
        }}
      />
      <Stack.Screen
        name="Dependencies"
        component={DependenciesScreen}
        options={{
          title: 'Project Dependencies',
          headerStyle: styles.topTabHeaderStyle,
        }}
      />
    </TopTab.Navigator>
  );
};
const SignupStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Signup"
      screenOptions={{
        headerStyle: {backgroundColor: '#42f44b'},
        headerTintColor: '#fff',
        headerTitleStyle: {fontWeight: 'bold'},
      }}>
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{
          title: 'Sign up',
          headerStyle: styles.headerStyle,
        }}
      />
      <Stack.Screen
        name="SpecialistCertification"
        component={SpecialistCertificationScreen}
        options={{
          title: 'SpecialistCertification',
          headerStyle: styles.headerStyle,
        }}
      />
      <Stack.Screen
        name="LoginStack"
        component={LoginStack}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
const navigationStackDic = {
  Home: HomeStack,
  Login: LoginStack,
  Signup: SignupStack,
};
const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: '#dce35b',
  },
  topTabHeaderStyle: {
    backgroundColor: '#f2f2f2',
  },
});
export default navigationStackDic;
