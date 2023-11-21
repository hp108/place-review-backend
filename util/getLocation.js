// const opencage = require('opencage-api-client');
import opencage from 'opencage-api-client'
import {HttpError} from '../model/http-error.js'

// note that the library takes care of URI encoding

export const getlocation = async () => {
    const data = await opencage.geocode({ q: 'Theresienhöhe 11, München', key: '1f32341f024a49d19a81ea067d718110' });
    if (data.status.code === 200 && data.results.length > 0) {
      return data.results[0].geometry;
    } else {
      throw new HttpError("No place found for the given address", 404);
    }
};
