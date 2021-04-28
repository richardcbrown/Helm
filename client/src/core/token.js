function getTokenFromLocalStorage() {
  return localStorage.getItem("token")
}

/**
 * This function returns domain name from windoe config settings
 *
 * @author Bogdan Shcherban <bsc@piogroup.net>
 * @return {string}
 */
function getDomainName() {
  return window && window.config ? window.config.domainName : null
}

export const getToken = getTokenFromLocalStorage
export const domainName = getDomainName()
