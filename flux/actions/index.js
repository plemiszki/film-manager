import HandyTools from 'handy-tools';

export function createEntity(args, arrayName) {
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
