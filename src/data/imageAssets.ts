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

export const onboardingImageUris = {
  flightWindow: assetUri(require('../../assets/onboarding/01-flight-window.jpg')),
  saveInspiration: assetUri(require('../../assets/onboarding/02-save-inspiration.jpg')),
  shapeTrip: assetUri(require('../../assets/onboarding/03-shape-trip.jpg')),
  decideAirport: assetUri(require('../../assets/onboarding/04-decide-airport.jpg')),
  commitBeach: assetUri(require('../../assets/onboarding/05-commit-beach.jpg')),
};
