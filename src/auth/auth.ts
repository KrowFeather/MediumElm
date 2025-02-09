import axios from "axios";
import { ElMessage } from "element-plus";

const authItemName = "access_token"

const defaultError = (error) => {
  console.error(error)
  ElMessage.error('发生了一些错误，请联系管理员')
}

const defaultFailure = (message, status, url) => {
  console.warn(`请求地址: ${url}, 状态码: ${status}, 错误信息: ${message}`)
  ElMessage.warning(message)
}

const takeAccessToken = () => {
  const str = localStorage.getItem(authItemName) || sessionStorage.getItem(authItemName);
  if (!str) return null
  const authObj = JSON.parse(str)
  if (authObj.expire <= new Date()) {
    deleteAccessToken()
    ElMessage.warning("登录状态已过期，请重新登录！")
    return null
  }
  return authObj.token
}

const storeAccessToken = (remember, token, expire, username, id, role) => {
  const authObj = {
    token: token,
    expire: expire,
    username: username,
    id: id,
    role: role,
  }
  const str = JSON.stringify(authObj)
  if (remember)
    // 可以一直存储
    localStorage.setItem(authItemName, str)
  else
    // 只针对会话存储
    sessionStorage.setItem(authItemName, str)
}

const deleteAccessToken = () => {
  localStorage.removeItem(authItemName)
  sessionStorage.removeItem(authItemName)
}

const accessHeader = () => {
  const token = takeAccessToken();
  return token ? {
    'Authorization': `Bearer ${takeAccessToken()}`
  } : {}
}

const internalPost = (url, data, headers, success, failure, error = defaultError) => {
  axios.post(url, data, { headers: headers }).then(({ data }) => {
    if (data.code === 200)
      success(data.data)
    else
      failure(data.message, data.code, url)
  }).catch(err => error(err))
}

const internalGet = (url, headers, success, failure, error = defaultError) => {
  axios.get(url, { headers: headers }).then(({ data }) => {
    if (data.code === 200)
      success(data.data)
    else
      failure(data.message, data.code, url)
  }).catch(err => error(err))
}

const internalGetWithQuery = (url, query, headers, success, failure, error = defaultError) => {
  axios.get(url, { headers: headers, params: query }).then(({ data }) => {
    if (data.code === 200)
      success(data.data)
    else
      failure(data.message, data.code, url)
  }).catch(err => error(err))
}

const get = (url, success, failure = defaultFailure) => {
  internalGet(url, accessHeader(), success, failure)
}

const getQuery = (url, query, success, failure = defaultFailure) => {
  internalGetWithQuery(url, query, accessHeader(), success, failure)
}

const post = (url, data, success, failure = defaultFailure) => {
  internalPost(url, data, accessHeader(), success, failure)
}

const internalPut = (url, data, headers, success, failure, error = defaultError) => {
  axios.put(url, data, { headers: headers }).then(({ data }) => {
    if (data.code === 200)
      success(data.data)
    else
      failure(data.message, data.code, url)
  }).catch(err => error(err))
}

const put = (url, data, success, failure = defaultFailure) => {
  internalPut(url, data, accessHeader(), success, failure)
}

const internalDelete = (url, headers, success, failure, error = defaultError) => {
  axios.delete(url, { headers: headers }).then(({ data }) => {
    if (data.code === 200)
      success(data.data)
    else
      failure(data.message, data.code, url)
  }).catch(err => error(err))
}
const delete_ = (url, success, failure = defaultFailure) => {
  internalDelete(url, accessHeader(), success, failure)
}

const login = (username, password, remember, success, failure = defaultFailure) => {
  internalPost('http://localhost:8080/auth/login', {
    username: username,
    password: password
  }, {
    // security只支持表单提交，而默认是JSON
    'Content-Type': 'application/x-www-form-urlencoded'
  }, (data) => {
    storeAccessToken(remember, data.token, data.expire, data.username, data.id, data.role)
    ElMessage.success(`登录成功，欢迎 ${data.username} 来到我们的系统`)
    success(data)
  }, failure)
}

const logout = (success, failure = defaultFailure) => {
  get('http://localhost:8080/auth/logout', () => {
    deleteAccessToken()
    ElMessage.success(`退出登录成功，欢迎您再次使用`)
    success()
  }, failure)
}

const unauthorized = () => {
  return !takeAccessToken()
}

export { login, logout, get, post, unauthorized ,getQuery,put,delete_}
