// Store reference for use in non-React contexts (like apiClient interceptors)
let storeRef = null

export const setStoreRef = store => {
  storeRef = store
}

export const getStoreRef = () => storeRef
