import firestore from '@react-native-firebase/firestore';
import Alerts from './AlertFunc';
import storage from '@react-native-firebase/storage';
import Apis from './Apis';

const FireStoreDatabaseUpdateUserImages = (images, journal) => {
  return firestore()
    .collection('Users')
    .doc(global.loginUser)
    .update({
      images: firestore.FieldValue.arrayUnion(...images),
      journal: firestore.FieldValue.arrayUnion(journal),
    })
    .then(() => {
      console.log('User updated!');
    })
    .catch(() => {
      Alerts.serviceCurrentlyUnavailableAlert();
    });
};
const firestoreDatabaseCommonSave = (
  collectionId,
  docId,
  docData,
  thenFunc,
  catchFunc,
) => {
  return firestore()
    .collection(collectionId)
    .doc(docId)
    .set(docData)
    .then(thenFunc)
    .catch(catchFunc);
};
const SaveImageToFireStore = (imageID, imagePath, func) => {
  console.log('imageID', imageID);
  console.log('image', imagePath);
  storage()
    .ref('images/' + imageID)
    .putFile(imagePath)
    .then(() => {
      Alerts.imageUploadSuccessfullyAlert(func);
    })
    .catch(error => {
      Alerts.serviceCurrentlyUnavailableAlert();
    });
};
const CompressAndSaveImageToFireStore = (imageId, imagePath, func) => {
  storage()
    .ref('images/' + imageId)
    .getMetadata()
    .then(() => {
      console.log('Image already saved to firestore!');
      func();
    })
    .catch(() => {
      Apis.compressImage(imagePath, 1000, 1000)
        .then(res => {
          SaveImageToFireStore(imageId, res.uri, func ? func : null);
        })
        .catch(compressionError => {
          Alerts.imageCompressionAlert(compressionError);
        });
    });
};
const DeleteJournalLogFromDatabase = (journalId, thenFunc) => {
  firestore()
    .collection('JournalLog')
    .doc(journalId)
    .delete()
    .then(() => {
      firestore()
        .collection('Users')
        .doc(global.loginUser)
        .set(
          {
            journal: {
              [journalId]: firestore.FieldValue.delete(),
            },
          },
          {merge: true},
        )
        .then(thenFunc ? thenFunc() : null);
    });
};
const FirestoreBaseFuncs = {
  firestoreDatabaseCommonSaveFunc: firestoreDatabaseCommonSave,
  saveImageToFireStore: SaveImageToFireStore,
  compressAndSaveImageToFireStore: CompressAndSaveImageToFireStore,
  fireStoreDatabaseUpdateUserImages: FireStoreDatabaseUpdateUserImages,
  deleteJournalFromDatabase: DeleteJournalLogFromDatabase,
};
export default FirestoreBaseFuncs;
