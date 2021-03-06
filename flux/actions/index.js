import HandyTools from 'handy-tools'
import ChangeCase from 'change-case'

export function sendRequest(args) {
  let { url, method, data } = args;
  if (data) {
    data = HandyTools.convertObjectKeysToUnderscore(data);
  }
  return (dispatch) => {
    return $.ajax({
      method: method.toUpperCase(),
      url,
      data
    }).then(
      (response) => {
        let obj = Object.assign(response, { type: 'SEND_REQUEST' });
        dispatch(obj);
      }
    );
  }
}

export function fetchEntities(input) {
  let url = input.url || `/api/${input.directory}`;
  return (dispatch) => {
    return $.ajax({
      method: 'GET',
      url
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
        [HandyTools.convertToUnderscore(args.entityName)]: HandyTools.convertObjectKeysToUnderscore(args.entity)
      }
    }).then(
      (response) => {
        let obj = Object.assign(response, { type: 'CREATE_ENTITY' });
        dispatch(obj);
      },
      (response) => dispatch({
        type: 'ERRORS',
        errors: response
      })
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
  let data = { [ChangeCase.snakeCase(args.entityName)]: HandyTools.convertObjectKeysToUnderscore(args.entity) };
  if (args.additionalData) {
    data = Object.assign(data, HandyTools.convertObjectKeysToUnderscore(args.additionalData));
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
        if (Array.isArray(responseJSON)) {
          dispatch({
            type: 'ERRORS',
            errors: response.responseJSON
          });
        } else {
          let obj = Object.assign(responseJSON, { type: 'ERRORS' });
          dispatch(obj);
        }
      }
    );
  }
}

export function deleteEntity(args) {
  let { directory, id, callback } = args;
  return (dispatch) => {
    return $.ajax({
      method: 'DELETE',
      url: `/api/${directory}/${id}`
    }).then(
      (response) => {
        if (callback) {
          callback.call({}, response);
        } else {
          window.location.pathname = `/${directory}`;
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
