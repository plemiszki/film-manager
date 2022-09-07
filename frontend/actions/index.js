import ChangeCase from 'change-case'
import { convertObjectKeysToUnderscore } from 'handy-components';

export function sendRequest(args) {
  let { url, method, data, responseKey } = args;
  method = method || "get";
  if (data) {
    data = convertObjectKeysToUnderscore(data);
  }
  let ajaxArgs = {
    method: method.toUpperCase(),
    url,
    data
  }
  if (args.json) {
    ajaxArgs.contentType = 'application/json';
    ajaxArgs.data = JSON.stringify(data);
  }
  return (dispatch) => {
    return $.ajax(ajaxArgs).then(
      (response) => {
        if (responseKey) {
          response = { [responseKey]: response }
        }
        let obj = Object.assign(response, { type: 'SEND_REQUEST' });
        dispatch(obj);
      },
      (response) => {
        let responseJSON = response.responseJSON;
        let obj = Object.assign(responseJSON, { type: 'ERRORS' });
        dispatch(obj);
      }
    );
  }
}

export function fetchEntities(args) {
  let { data, url, directory } = args;
  url = url || `/api/${directory}`;
  if (data) {
    data = convertObjectKeysToUnderscore(data);
  }
  return (dispatch) => {
    return $.ajax({
      method: 'GET',
      url,
      data
    }).then(
      (response) => {
        let obj = Object.assign(response, { type: 'FETCH_ENTITIES' });
        dispatch(obj);
      }
    );
  }
}

export function fetchDataForNew(args) {
  return (dispatch) => {
    return $.ajax({
      method: 'GET',
      url: `/api/${args.directory}/new`
    }).then(
      (response) => {
        let obj = Object.assign(response, { type: 'NEW_ENTITY_DATA' });
        dispatch(obj);
      }
    );
  }
}

export function createEntity(args) {
  return (dispatch) => {
    return $.ajax({
      method: 'POST',
      url: `/api/${args.directory}`,
      data: {
        [ChangeCase.snakeCase(args.entityName)]: convertObjectKeysToUnderscore(args.entity)
      }
    }).then(
      (response) => {
        let obj = Object.assign(response, { type: 'CREATE_ENTITY' });
        dispatch(obj);
      },
      (response) => {
        let responseJSON = response.responseJSON;
        let obj = Object.assign(responseJSON, { type: 'ERRORS' });
        dispatch(obj);
      }
    );
  }
}

export function fetchEntity(args) {
  return (dispatch) => {
    return $.ajax({
      method: 'GET',
      url: args.url || `/api/${args.directory}/${args.id}`
    }).then(
      (response) => {
        let obj = Object.assign(response, { type: 'FETCH_ENTITY' });
        dispatch(obj);
      }
    );
  }
}

export function updateEntity(args) {
  let data = { [ChangeCase.snakeCase(args.entityName)]: convertObjectKeysToUnderscore(args.entity) };
  if (args.additionalData) {
    data = Object.assign(data, convertObjectKeysToUnderscore(args.additionalData));
  }
  return (dispatch) => {
    return $.ajax({
      method: 'PATCH',
      url: args.url || `/api/${args.directory}/${args.id}`,
      data
    }).then(
      (response) => {
        let obj = Object.assign(response, { type: 'UPDATE_ENTITY' });
        dispatch(obj);
      },
      (response) => {
        let responseJSON = response.responseJSON;
        let obj = Object.assign(responseJSON, { type: 'ERRORS' });
        dispatch(obj);
      }
    );
  }
}

export function deleteEntity(args) {
  let { directory, id, callback } = args;
  return (dispatch) => {
    return $.ajax({
      method: 'DELETE',
      url: `/api/${directory}/${id}`,
    }).then(
      (response) => {
        if (args.redirectToIndex) {
          window.location.pathname = `/${directory}`;
        } else {
          let obj = Object.assign(response, { type: 'DELETE_ENTITY' });
          dispatch(obj);
        }
      },
      (response) => {
        dispatch({ deleteError: response.responseJSON, type: 'ERRORS' });
      }
    );
  }
}

export function exportUncrossedReports(args) {
  let { film_ids } = args;
  return (dispatch) => {
    return $.ajax({
      method: 'GET',
      url: '/api/royalty_reports/export_uncrossed',
      data: {
        quarter: args.quarter,
        year: args.year,
        film_ids: args.filmIds
      }
    }).then(
      (response) => {
        let obj = Object.assign(response, { type: 'EXPORT_UNCROSSED_REPORTS' });
        dispatch(obj);
      }
    );
  }
}
