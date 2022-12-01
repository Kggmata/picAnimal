import DocumentPicker from 'react-native-document-picker';
import {Platform} from 'react-native';
import {createResizedImage} from '@bam.tech/react-native-image-resizer';
import Alerts from './AlertFunc';

const findImageInFlickr = async name => {
  let flickrHeaders = new Headers();
  flickrHeaders.append(
    'Cookie',
    'ccc=%7B%22needsConsent%22%3Afalse%2C%22managed%22%3A0%2C%22changed%22%3A0%2C%22info%22%3A%7B%22cookieBlock%22%3A%7B%22level%22%3A0%2C%22blockRan%22%3A0%7D%7D%7D',
  );
  let flickrRequestOptions = {
    method: 'GET',
    headers: flickrHeaders,
    redirect: 'follow',
  };
  let flickrkey = 'd15b442cff6de7fd60d65408dbfbbb3c';
  return await fetch(
    'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' +
      flickrkey +
      '&text=' +
      encodeURI(name) +
      '&accuracy=11&format=json&nojsoncallback=1&extras=url_m,description,owner_name&per_page=10&page=1&sort=relevance',
    flickrRequestOptions,
  ).then(flickrResponse => flickrResponse.text());
};
const submitToBaiduAndTranslate = async (text, from, to) => {
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json;charset=utf-8');
  const requestData = {
    q: text,
    from: from,
    to: to,
  };
  const body = JSON.stringify(requestData);
  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: body,
    redirect: 'follow',
  };
  return await fetch(
    'https://aip.baidubce.com/rpc/2.0/mt/texttrans/v1?access_token=24.ad7fc0ecdd5dc0dbfcddd05a71c27325.2592000.1666222865.282335-27545604',
    requestOptions,
  ).then(response => response.json());
};
const selectFromLocalFS = async () => {
  // To Select File
  try {
    const res = await DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
      copyTo: 'documentDirectory',
    });
    if (res) {
      let uri = res[0].fileCopyUri;
      // check if the file is an image in jpg and png
      if (uri.endsWith('.jpg') || uri.endsWith('.png')) {
        return res;
      } else {
        Alerts.inValidImageFormat();
      }
    }
  } catch (err) {
    console.log('cancel: ', err);
  }
};
const compressImage = async (imagePath, width, height) => {
  return await createResizedImage(
    imagePath,
    width,
    height,
    'JPEG',
    100,
    0,
    undefined,
    false,
    {
      mode: 'contain',
      onlyScaleDown: true,
    },
  );
};

const Apis = {
  findImageInFlickr: findImageInFlickr,
  submitToBaiduAndTranslate: submitToBaiduAndTranslate,
  selectFromLocalFS: selectFromLocalFS,
  compressImage: compressImage,
};
export default Apis;
