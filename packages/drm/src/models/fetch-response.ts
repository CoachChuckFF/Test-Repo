export const enum ACCOUNT_FETCH_STATE {
  NOT_LOADED = "Not Loaded",
  LOADED = "Loaded",
  DNE = "Does Not Exsist",
}

export interface FetchAccountResponse {
  state: ACCOUNT_FETCH_STATE
  account: undefined | any
}

export const NULL_FETCH_RESPONSE = {
  state: ACCOUNT_FETCH_STATE.NOT_LOADED,
  account: undefined,
}
