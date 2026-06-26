import { Image } from 'react-native';

export const starterImageUris = {
  city: Image.resolveAssetSource(require('../../assets/starter/city.jpg')).uri,
  coast: Image.resolveAssetSource(require('../../assets/starter/coast.jpg')).uri,
  food: Image.resolveAssetSource(require('../../assets/starter/food.jpg')).uri,
  island: Image.resolveAssetSource(require('../../assets/starter/island.jpg')).uri,
  nightOut: Image.resolveAssetSource(require('../../assets/starter/night-out.jpg')).uri,
  outdoors: Image.resolveAssetSource(require('../../assets/starter/outdoors.jpg')).uri,
};
