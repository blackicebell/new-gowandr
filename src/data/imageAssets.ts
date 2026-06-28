import { Asset } from 'expo-asset';

function assetUri(moduleId: number) {
  return Asset.fromModule(moduleId).uri;
}

export const starterImageUris = {
  city: assetUri(require('../../assets/starter/city.jpg')),
  coast: assetUri(require('../../assets/starter/coast.jpg')),
  food: assetUri(require('../../assets/starter/food.jpg')),
  island: assetUri(require('../../assets/starter/island.jpg')),
  nightOut: assetUri(require('../../assets/starter/night-out.jpg')),
  outdoors: assetUri(require('../../assets/starter/outdoors.jpg')),
};
