// @flow

import { GalleryPicture, Gallery } from './ActionTypes';
import { galleryPictureSchema } from 'app/reducers';
import { uploadFile } from './FileActions';
import { chunk } from 'lodash';
import { type GalleryPictureEntity } from 'app/reducers/galleryPictures';
import callAPI from 'app/actions/callAPI';
import type { EntityID } from 'app/types';
import type { Thunk } from 'app/types';

export function fetch(
  galleryId: number,
  { next, filters }: { next: boolean, filters: Object } = {}
): Thunk<*> {
  return (dispatch, getState) => {
    const cursor = next ? getState().galleryPictures.pagination.next : {};

    return dispatch(
      callAPI({
        types: GalleryPicture.FETCH,
        endpoint: `/galleries/${galleryId}/pictures/`,
        useCache: false,
        query: {
          ...cursor,
          ...filters
        },
        schema: [galleryPictureSchema],
        meta: {
          errorMessage: 'Henting av bilder feilet'
        },
        propagateError: true
      })
    );
  };
}

export function fetchSiblingGallerPicture(
  galleryId: EntityID,
  currentPictureId: EntityID,
  next: Boolean
) {
  const rawCursor = `p=${currentPictureId}&r=${next ? 0 : 1}`;
  const cursor = Buffer.from(rawCursor).toString('base64');
  return callAPI({
    types: GalleryPicture.FETCH_SIBLING,
    endpoint: `/galleries/${galleryId}/pictures/`,
    query: {
      page_size: 1,
      cursor
    },
    schema: [galleryPictureSchema],
    meta: {
      errorMessage: 'Henting av bilde feilet'
    },
    propagateError: true
  });
}

export function fetchGalleryPicture(galleryId: EntityID, pictureId: EntityID) {
  return callAPI({
    types: GalleryPicture.FETCH,
    endpoint: `/galleries/${galleryId}/pictures/${pictureId}/`,
    schema: galleryPictureSchema,
    meta: {
      errorMessage: 'Henting av galleri feilet'
    }
  });
}

export function updatePicture(galleryPicture: GalleryPictureEntity) {
  return callAPI({
    types: GalleryPicture.EDIT,
    endpoint: `/galleries/${galleryPicture.gallery}/pictures/${
      galleryPicture.id
    }/`,
    method: 'PATCH',
    schema: galleryPictureSchema,
    body: galleryPicture,
    meta: {
      galleryId: galleryPicture.gallery,
      id: galleryPicture.id,
      errorMessage: 'Oppdatering av bilde i galleriet feilet'
    }
  });
}

export function deletePicture(galleryId: EntityID, pictureId: EntityID) {
  return callAPI({
    types: GalleryPicture.DELETE,
    endpoint: `/galleries/${galleryId}/pictures/${pictureId}/`,
    method: 'DELETE',
    schema: galleryPictureSchema,
    meta: {
      galleryId: galleryId,
      id: pictureId,
      errorMessage: 'Sletting av bilde i galleriet feilet',
      successMessage: 'Bildet ble slettet!'
    }
  });
}

export function CreateGalleryPicture(galleryPicture: { galleryId: number }) {
  return callAPI({
    types: GalleryPicture.CREATE,
    endpoint: `/galleries/${galleryPicture.galleryId}/pictures/`,
    method: 'POST',
    schema: galleryPictureSchema,
    body: galleryPicture,
    meta: {
      galleryId: galleryPicture.galleryId,
      errorMessage: 'Legg til bilde i galleriet feilet'
    }
  });
}
const delay = time => new Promise(res => setTimeout(() => res(), time));

const MAX_UPLOADS = 15;

async function uploadGalleryPicturesInTurn(files, galleryId, dispatch) {
  for (const fileChunk of chunk(files, MAX_UPLOADS)) {
    await Promise.all(
      fileChunk.map(file =>
        dispatch(uploadFile({ file }))
          .then(action => {
            if (!action || !action.meta) return;
            return dispatch(
              CreateGalleryPicture({
                galleryId,
                file: action.meta.fileToken,
                active: true
              })
            );
          })
          .catch(error => {
            dispatch({
              type: GalleryPicture.UPLOAD.FAILURE,
              meta: { fileName: file.name }
            });
          })
      )
    );
    // Delay after each chunk in order to keep CPU and
    // memory-usage relatively low.
    // TODO implement a non-pool based approach, with n parallel uploads.
    await delay(200);
  }
}

export function uploadAndCreateGalleryPicture(
  galleryId: number,
  files: Array<Object>
): Thunk<any> {
  return dispatch => {
    dispatch({
      type: Gallery.UPLOAD.BEGIN,
      meta: { imageCount: files.length }
    });
    return uploadGalleryPicturesInTurn(files, galleryId, dispatch);
  };
}
